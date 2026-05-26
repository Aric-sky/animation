package com.example.dynamicqr.ui

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.example.dynamicqr.R
import com.example.dynamicqr.databinding.ActivityMainBinding
import com.example.dynamicqr.util.QRCodeGenerator
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * 主界面 - 动态二维码生成器
 * 
 * 功能：
 * 1. 输入文本生成静态二维码
 * 2. 生成动态二维码（定时更新内容）
 * 3. 自定义二维码颜色
 * 4. 保存二维码到相册
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    
    // 动态二维码相关
    private var isDynamicMode = false
    private var dynamicJob: Job? = null
    private var frameCounter = 0
    private var baseContent = ""
    
    // 权限请求码
    private val PERMISSION_REQUEST_CODE = 100

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupUI()
        checkPermissions()
    }

    private fun setupUI() {
        // 生成按钮点击事件
        binding.btnGenerate.setOnClickListener {
            val content = binding.etContent.text.toString().trim()
            if (content.isEmpty()) {
                Toast.makeText(this, "请输入内容", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            stopDynamicMode()
            generateQRCode(content)
        }

        // 动态模式开关
        binding.switchDynamic.setOnCheckedChangeListener { _, isChecked ->
            isDynamicMode = isChecked
            if (isChecked) {
                startDynamicMode()
            } else {
                stopDynamicMode()
            }
        }

        // 颜色选择
        binding.btnColorPicker.setOnClickListener {
            // 这里可以添加颜色选择器对话框
            Toast.makeText(this, "颜色选择功能开发中", Toast.LENGTH_SHORT).show()
        }

        // 保存二维码
        binding.btnSave.setOnClickListener {
            val bitmap = binding.ivQrCode.tag as? Bitmap
            if (bitmap != null) {
                saveQRCode(bitmap)
            } else {
                Toast.makeText(this, "先生成二维码", Toast.LENGTH_SHORT).show()
            }
        }

        // 清空按钮
        binding.btnClear.setOnClickListener {
            binding.etContent.text.clear()
            binding.ivQrCode.setImageBitmap(null)
            stopDynamicMode()
        }
    }

    /**
     * 生成二维码
     */
    private fun generateQRCode(content: String) {
        lifecycleScope.launch {
            showLoading(true)
            
            val bitmap = withContext(Dispatchers.Default) {
                QRCodeGenerator.generateQRCode(
                    content = content,
                    size = 512,
                    colorFront = getColor(R.color.qr_foreground),
                    colorBack = getColor(R.color.qr_background)
                )
            }

            if (bitmap != null) {
                binding.ivQrCode.setImageBitmap(bitmap)
                binding.ivQrCode.tag = bitmap
                showLoading(false)
            } else {
                Toast.makeText(this@MainActivity, "生成失败", Toast.LENGTH_SHORT).show()
                showLoading(false)
            }
        }
    }

    /**
     * 启动动态二维码模式
     */
    private fun startDynamicMode() {
        baseContent = binding.etContent.text.toString().trim()
        if (baseContent.isEmpty()) {
            baseContent = "dynamic_qr_default"
            binding.etContent.setText(baseContent)
        }

        dynamicJob?.cancel()
        dynamicJob = lifecycleScope.launch {
            while (isDynamicMode) {
                frameCounter++
                val dynamicContent = "$baseContent|frame:$frameCounter|time:${System.currentTimeMillis()}"
                
                val bitmap = withContext(Dispatchers.Default) {
                    QRCodeGenerator.generateQRCode(dynamicContent)
                }
                
                if (bitmap != null) {
                    withContext(Dispatchers.Main) {
                        binding.ivQrCode.setImageBitmap(bitmap)
                        binding.tvFrameInfo.text = "帧：$frameCounter"
                    }
                }
                
                // 每秒更新一次
                delay(1000)
            }
        }
        
        Toast.makeText(this, "动态模式已启动", Toast.LENGTH_SHORT).show()
    }

    /**
     * 停止动态二维码模式
     */
    private fun stopDynamicMode() {
        dynamicJob?.cancel()
        dynamicJob = null
        isDynamicMode = false
        binding.tvFrameInfo.text = ""
    }

    /**
     * 保存二维码到相册
     */
    private fun saveQRCode(bitmap: Bitmap) {
        if (checkStoragePermission()) {
            lifecycleScope.launch {
                try {
                    val fileName = "QR_${System.currentTimeMillis()}.png"
                    val mediaStoreImage = android.provider.MediaStore.Images.Media.insertImage(
                        contentResolver,
                        bitmap,
                        fileName,
                        "Generated QR Code"
                    )
                    
                    if (mediaStoreImage != null) {
                        Toast.makeText(this@MainActivity, "已保存到相册", Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(this@MainActivity, "保存失败", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                    Toast.makeText(this@MainActivity, "保存出错：${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        } else {
            requestStoragePermission()
        }
    }

    /**
     * 检查并请求权限
     */
    private fun checkPermissions() {
        val permissions = arrayOf(
            Manifest.permission.CAMERA,
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.READ_EXTERNAL_STORAGE
        )
        
        val missingPermissions = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        
        if (missingPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                missingPermissions.toTypedArray(),
                PERMISSION_REQUEST_CODE
            )
        }
    }

    private fun checkStoragePermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestStoragePermission() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE),
            PERMISSION_REQUEST_CODE
        )
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            val allGranted = grantResults.all { it == PackageManager.PERMISSION_GRANTED }
            if (!allGranted) {
                Toast.makeText(this, "部分权限未授予，某些功能可能不可用", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun showLoading(show: Boolean) {
        binding.progressBar.visibility = if (show) View.VISIBLE else View.GONE
        binding.btnGenerate.isEnabled = !show
    }

    override fun onDestroy() {
        super.onDestroy()
        stopDynamicMode()
    }
}

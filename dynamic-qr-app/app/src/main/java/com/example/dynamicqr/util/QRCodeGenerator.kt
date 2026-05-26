package com.example.dynamicqr.util

import android.graphics.Bitmap
import android.graphics.Color
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.WriterException
import com.google.zxing.qrcode.QRCodeWriter
import java.util.Hashtable

/**
 * QR Code 生成工具类
 * 支持生成动态二维码，可通过改变内容实现动态效果
 */
object QRCodeGenerator {

    /**
     * 生成二维码 Bitmap
     * @param content 二维码内容
     * @param size 二维码尺寸（像素）
     * @param colorFront 前景色（默认黑色）
     * @param colorBack 背景色（默认白色）
     * @return Bitmap 二维码图片
     */
    fun generateQRCode(
        content: String,
        size: Int = 512,
        colorFront: Int = Color.BLACK,
        colorBack: Int = Color.WHITE
    ): Bitmap? {
        if (content.isEmpty()) return null

        val qrWriter = QRCodeWriter()
        
        val hints = Hashtable<EncodeHintType, Any>().apply {
            put(EncodeHintType.CHARACTER_SET, "UTF-8")
            put(EncodeHintType.ERROR_CORRECTION, com.google.zxing.qrcode.decoder.ErrorCorrectionLevel.M)
            put(EncodeHintType.MARGIN, 1)
        }

        return try {
            val bitMatrix = qrWriter.encode(content, BarcodeFormat.QR_CODE, size, size, hints)
            val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.RGB_565)
            
            for (x in 0 until size) {
                for (y in 0 until size) {
                    bitmap.setPixel(x, y, if (bitMatrix[x, y]) colorFront else colorBack)
                }
            }
            bitmap
        } catch (e: WriterException) {
            e.printStackTrace()
            null
        }
    }

    /**
     * 生成带Logo的二维码
     * @param content 二维码内容
     * @param logoBitmap Logo图片
     * @param size 二维码尺寸
     * @param logoRatio Logo占二维码的比例 (0.0 - 0.5)
     * @return Bitmap 带Logo的二维码图片
     */
    fun generateQRCodeWithLogo(
        content: String,
        logoBitmap: Bitmap?,
        size: Int = 512,
        logoRatio: Float = 0.15f
    ): Bitmap? {
        val qrBitmap = generateQRCode(content, size)
        if (qrBitmap == null || logoBitmap == null) return qrBitmap

        val canvas = android.graphics.Canvas(qrBitmap)
        val logoSize = (size * logoRatio).toInt()
        val left = (size - logoSize) / 2
        val top = (size - logoSize) / 2
        
        val logoScaled = Bitmap.createScaledBitmap(logoBitmap, logoSize, logoSize, true)
        canvas.drawBitmap(logoScaled, left.toFloat(), top.toFloat(), null)
        
        return qrBitmap
    }

    /**
     * 生成动态二维码帧
     * 可用于创建动画效果的二维码序列
     * @param baseContent 基础内容
     * @param frameCount 帧数
     * @param updateInterval 更新间隔（毫秒）
     * @return List<Pair<String, Bitmap?>> 动态二维码帧列表
     */
    fun generateDynamicQRFrames(
        baseContent: String,
        frameCount: Int = 10,
        updateInterval: Long = 1000
    ): List<DynamicQRFrame> {
        val frames = mutableListOf<DynamicQRFrame>()
        
        for (i in 0 until frameCount) {
            // 这里可以自定义动态内容的生成逻辑
            // 例如：添加时间戳、计数器、或其他动态数据
            val dynamicContent = "$baseContent|frame:$i|time:${System.currentTimeMillis()}"
            val bitmap = generateQRCode(dynamicContent)
            
            frames.add(
                DynamicQRFrame(
                    content = dynamicContent,
                    bitmap = bitmap,
                    frameIndex = i,
                    timestamp = System.currentTimeMillis()
                )
            )
        }
        
        return frames
    }
}

/**
 * 动态二维码帧数据类
 */
data class DynamicQRFrame(
    val content: String,
    val bitmap: Bitmap?,
    val frameIndex: Int,
    val timestamp: Long
)

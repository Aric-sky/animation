# 动态二维码生成器 Android APP

这是一个可以生成动态二维码的 Android 应用程序。

## 功能特性

### 1. 静态二维码生成
- 输入任意文本内容生成二维码
- 支持自定义前景色和背景色
- 高质量二维码输出（512x512 像素）

### 2. 动态二维码模式
- 开启后每秒自动更新二维码内容
- 实时显示当前帧数
- 可用于创建时间敏感的动态验证场景

### 3. 其他功能
- 保存二维码到相册
- 清空输入和显示
- Material Design 界面设计
- 支持深色模式

## 技术栈

- **语言**: Kotlin
- **UI**: ViewBinding + Material Components
- **二维码库**: ZXing (Zebra Crossing)
- **异步处理**: Kotlin Coroutines
- **架构**: MVVM 简化版

## 项目结构

```
dynamic-qr-app/
├── app/
│   ├── src/main/
│   │   ├── java/com/example/dynamicqr/
│   │   │   ├── ui/
│   │   │   │   └── MainActivity.kt          # 主界面
│   │   │   └── util/
│   │   │       └── QRCodeGenerator.kt       # 二维码生成工具类
│   │   ├── res/
│   │   │   ├── layout/
│   │   │   │   └── activity_main.xml        # 主界面布局
│   │   │   ├── values/
│   │   │   │   ├── colors.xml               # 颜色定义
│   │   │   │   ├── strings.xml              # 字符串资源
│   │   │   │   └── themes.xml               # 主题样式
│   │   │   ├── drawable/
│   │   │   │   └── ic_qr_code.xml           # 应用图标
│   │   │   └── mipmap-hdpi/
│   │   │       └── ic_launcher.xml          # 启动图标
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
├── settings.gradle
└── gradle.properties
```

## 构建说明

### 环境要求
- Android Studio Arctic Fox 或更高版本
- JDK 11 或更高版本
- Android SDK API 34
- Gradle 8.0+

### 构建步骤

1. 使用 Android Studio 打开项目
2. 等待 Gradle 同步完成
3. 连接 Android 设备或启动模拟器
4. 点击 Run 按钮运行应用

### 命令行构建

```bash
# 进入项目目录
cd dynamic-qr-app

# 清理并构建 Debug 版本
./gradlew clean assembleDebug

# 构建 Release 版本
./gradlew assembleRelease
```

## 使用说明

1. **生成静态二维码**
   - 在输入框中输入要编码的内容
   - 点击"生成"按钮
   - 二维码将显示在屏幕中央

2. **使用动态模式**
   - 输入基础内容
   - 打开"动态模式"开关
   - 二维码将每秒自动更新
   - 关闭开关停止动态更新

3. **保存二维码**
   - 生成二维码后点击"保存"按钮
   - 授予存储权限（如需要）
   - 二维码将保存到相册

## 核心代码说明

### QRCodeGenerator.kt
主要的二维码生成逻辑：
- `generateQRCode()`: 生成标准二维码
- `generateQRCodeWithLogo()`: 生成带 Logo 的二维码
- `generateDynamicQRFrames()`: 生成动态二维码帧序列

### MainActivity.kt
主界面逻辑：
- UI 事件处理
- 动态模式管理
- 权限请求和处理
- 二维码保存功能

## 依赖库

```groovy
// ZXing 二维码库
implementation 'com.google.zxing:core:3.5.2'
implementation 'com.journeyapps:zxing-android-embedded:4.3.0'

// Material Components
implementation 'com.google.android.material:material:1.11.0'

// AndroidX
implementation 'androidx.core:core-ktx:1.12.0'
implementation 'androidx.appcompat:appcompat:1.6.1'
implementation 'androidx.constraintlayout:constraintlayout:2.1.4'

// Kotlin Coroutines
implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
```

## 许可证

MIT License

## 注意事项

1. 动态二维码模式下，二维码内容会持续变化，扫描时需要快速识别
2. 首次保存二维码需要授予存储权限
3. 建议在光线充足的环境下扫描动态二维码
4. 可根据需求修改动态更新的频率和内容格式

## 扩展建议

- 添加二维码扫描功能
- 支持更多颜色和样式自定义
- 添加历史记录功能
- 支持生成带 Logo 的二维码
- 添加分享功能
- 支持批量生成二维码

# Sakura Pixel Theme (Chrome + Firefox)

一个 Chrome 浏览器主题插件，具有以下特点：

## 功能特性

- **白天模式**：任务栏为天蓝色 (RGB: 135, 206, 235)
- **夜间模式**：任务栏为克莱因蓝 (RGB: 0, 47, 167 / Hex: #002FA7)
- **像素风格樱花**：精美的像素艺术樱花图案作为背景装饰
- **自动切换**：根据时间自动切换日间/夜间模式（早上 6 点至下午 6 点为白天）
- **手动切换**：点击插件图标可手动切换主题模式（Firefox 支持动态主题）

## 安装方法（Chrome）

1. 打开 Chrome 浏览器
2. 在地址栏输入 `chrome://extensions/` 并回车
3. 右上角开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择本插件文件夹 `chrome-sakura-theme`
6. 插件即安装成功

## 安装方法（Firefox）

1. 打开 Firefox 浏览器
2. 在地址栏输入 `about:debugging#/runtime/this-firefox`
3. 点击“临时加载附加组件”
4. 将 `manifest.firefox.json` 重命名为 `manifest.json`（或临时拷贝一份）
5. 选择本插件文件夹 `chrome-sakura-theme` 中的 `manifest.json`

## 使用说明

- 插件会自动根据当前时间应用合适的主题（Firefox）
- 点击工具栏中的插件图标可以在白天/夜间模式之间手动切换（Firefox）
- 再次点击可恢复自动模式

## 文件结构

```
chrome-sakura-theme/
├── manifest.json      # Chrome 配置文件
├── manifest.firefox.json # Firefox 配置文件（支持动态主题）
├── background.js      # 后台脚本，处理主题切换逻辑
└── sakura_pixel.png   # 像素风格樱花背景图
```

## 技术细节

- 使用 WebExtensions Manifest V3
- Firefox 通过 `browser.theme` API 动态更新主题
- 每小时自动检查并更新主题
- 支持存储用户的手动偏好设置

## 颜色说明

- **克莱因蓝 (Klein Blue)**: RGB(0, 47, 167) - 一种深邃、纯净的蓝色
- **天蓝色**: RGB(135, 206, 235) - 清爽的白天天空色
- **樱花粉**: RGB(255, 183, 197) - 柔和的粉色花瓣

# 飞行练习器（离线 PWA）

Boeing 737-800 CDU 与 ATR 72-600 MCDU 两个交互式练习器，支持 PWA 离线使用。

## 在线访问

GitHub Pages 地址：`https://albertxiegit.github.io/flight-trainer-pwa/`

## 目录结构

```
index.html          入口页（含 manifest / Service Worker 注册）
style.css
manifest.json
sw.js               统一离线缓存
icon-192.png / icon-512.png
b737/               B737-800 CDU 模拟器
atr/                ATR 72-600 MCDU 模拟器
```

## iPhone / iPad 离线使用

1. 用 **Safari** 打开上面的在线地址。
2. 确认两个模拟器都能打开。
3. 点分享按钮 → **添加到主屏幕**。
4. 之后从主屏幕图标打开，首次联网加载后即可断网使用。

> 注意：iOS 不能用「文件」App 直接打开 HTML（不执行 JS），必须通过 HTTPS 站点 + 添加到主屏幕的方式使用。

## 更新资源后的缓存处理

修改任何资源（尤其是 `panel.png` / JS）后，需同时：

1. 把 `sw.js` 中的 `CACHE` 版本号递增（如 `flight-trainer-v1` → `v2`）。
2. 修改资源 URL 上的 `?v=` 查询参数（入口页 `index.html` 与 `sw.js` 里的 `CORE` 列表要一致）。

这样 iPhone 端才会重新拉取新版本。

# content-visibility
大量的离屏内容（Off-screen Content）
改变了一个元素的可见性，并管理其渲染状态
它允许我们推迟我们选择的元素HTML元素渲染，默认情况下，浏览器会渲染DOM树内所有可以被用户查看的元素（超出的会触发滚动）
问题：不渲染会导致无法正确的计算页面高度content-visibility给元素的高度为0；渲染这个元素之前这个元素的高度就是0，使得页面高度和滚动变得混乱。
display:none:隐藏元素并破坏其渲染状态
visibility：隐藏元素并保留渲染状态，占据空间
hidden：隐藏元素并保留其渲染状态，类似display:nonoe，但是再次显示的成本低

### content-intrinsic-size
占位符尺寸来代替渲染内容，能够让元素有一个占位控件是

## GitHub Copilot 登录时 `https://github.com/login/device` 的 8 位 code 从哪里来

如果你在设备认证页面看到要输入 8 位 code，这个 code 不是 Google Authenticator 的 6 位 2FA 验证码。

这个 8 位 code 会在你发起 Copilot 登录的地方显示出来，例如：
- 命令行执行 `gh copilot login`
- VSCode 安装/使用 Copilot 插件并点击登录
- 其他触发 “登录 GitHub Copilot” 的入口

通常会看到类似提示（8 位字符常以 `4+4` 并带连字符展示）：

`Your device code is: ABCD-EFGH`

操作步骤：
1. 回到刚才发起登录的命令行或 IDE 弹窗，找到显示的 8 位 device code。
2. 打开 `https://github.com/login/device`，输入该 code 完成授权。
3. 如果没找到 code，重新发起一次登录流程即可生成新的 code。

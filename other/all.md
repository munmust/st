# content-visibility
大量的离屏内容（Off-screen Content）
改变了一个元素的可见性，并管理其渲染状态
它允许我们推迟我们选择的元素HTML元素渲染，默认情况下，浏览器会渲染DOM树内所有可以被用户查看的元素（超出的会触发滚动）
问题：不渲染会导致无法正确的计算页面高度content-visibility给元素的高度为0；渲染这个元素之前这个元素的高度就是0，使得页面高度和滚动变得混乱。
display:none:隐藏元素并破坏其渲染状态
visibility：隐藏元素并保留渲染状态，占据空间
hidden：隐藏元素并保留其渲染状态，类似display:nonoe，但是再次显示的成本低

### content-intrinsic-size
占位符尺寸来代替渲染内容，能够让元素有一个占位控件
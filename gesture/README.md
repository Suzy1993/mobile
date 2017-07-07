移动端设备上的“手势密码”UI 组件：gestureUI
1、文件说明：
（1）js文件夹存放js文件，gestureUI.js中定义了详细的UI接口，第2节将作详细说明；
（2）css文件夹存放css文件，gestureUI.css中定义了gestureUI组件中的各个元素的样式布局，第3节将作详细说明；
（3）images文件夹存放图片文件；
（4）gesture.html为调用gestureUI组件的示例代码，第4节将对组件的调用方式作详细说明。

2、gestureUI.js的UI接口说明
（1）gestureUI封装成一个类，采用组合使用构造函数模式和原型模式的方式创建对象
	1）构造函数模式用于定义实例属性：width、height、r等，第（2）小节将作详细说明；
	2）原型模式用于创建方法：init()、caculateLocation()、strokeCircle()、fillCircle()、drawLine()、draw()、selectPoint()、eventHandler()、storage()、check()等，第（3）小节将作详细说明
（2）gestureUI类的属性介绍：
	1）width：组件对象的宽度，本实例中将组件宽度设置为手机可见区域的宽度；
	2）height：组件对象的宽度，本实例中将组件高度设置为手机可见区域的高度；
	3）r：组件对象的密码圆的半径,本实例中的组件密码圆半径设置为width * 0.8 / 14：
		***根据画布的宽度（width * 0.8）平均分配密码圆的半径；
		***一行3个圆，相邻两圆之间的距离（2个圆）、第一个圆与画布左边界的距离（1个圆）、最后一个圆与画布右边界的距离（1个圆）都为一个圆的直径大小；
		***画布的宽度相当于容纳7个圆（3 + 2 + 1 + 1），也就是7 * 2 = 14个半径。
（2）gestureUI类的方法介绍：
	1）init()：初始化组件对象，包括：
		***构建组件对象的各个元素；
		***初始化画布宽度和高度，画布元素的宽度和高度设置为组件对象宽度和高度的0.8倍；
		***获取当前时间显示在顶部，12小时制，需做相应判断；
		***初始化当前状态state；
		***初始化单选按钮状态radio；
		***初始化已选点数组selectPoints；
		***初始化9个密码圆圆心数组ninePoints；
		***获取画布相对页面左上角的水平距离marginX和垂直距离marginY；
		***调用caculateLocation()计算9个密码圆的圆心坐标；
		***根据圆心坐标和半径，调用strokeCircle()和fillCircle()分别绘制9个密码圆；
		***调用eventHandler()为画布绑定touchstart、touchmove、touchend事件、为单选按钮绑定change事件；
	2）caculateLocation()：
		***ninePoints存储9个圆的圆心，下标为0 ~ 8，圆心是个点对象，有x和y两个属性；
		***根据第（2）小节对r的说明，容易得知：第一个圆的圆心距离画布左边界的距离为3r，相邻两圆的圆心之间的距离为4r。
	3）strokeCircle()：
		***根据圆心x、y坐标和半径及颜色、线宽绘制描边圆，参数为圆心x、y坐标和半径及颜色、线宽。
	4）fillCircle()：
		***根据圆心x、y坐标和半径及颜色绘制实心圆，参数为圆心x、y坐标和半径及颜色。
	5）drawLine()：
		***根据当前触摸点、颜色、线宽绘制线条，参数为当前触摸点、颜色、线宽；
		***首先，将绘图图标移动到第一个选中的圆心的位置；
		***其次，按照选中点的顺序依次绘制连线；
		***最后，绘制最后一个选中点到当前触摸点的连线。
	6）draw()：
		***根据当前触摸点绘制选中的点和点之间的连线，参数为当前触摸点；
		***注意需要先清除画布内容再重新绘制；
		***首先，根据该点是否已选中绘制不同的密码圆，若该点不是已选中的点，则调用strokeCircle()绘制颜色为#cccccc、线宽为5的描边圆和调用fillCircle()绘制颜色为#ffffff的填充圆；若该点是已选中的点，则调用strokeCircle()绘制颜色为#ff8800、线宽为5的描边圆和调用fillCircle()绘制颜色为#ff8800的填充圆；
		***其次，调用drawLine()绘制线宽为8的红色连线。
	7）selectPoint()：
		***根据当前触摸点touchPoint和存储已选点的数组selectPoints更新selectPoints，参数为当前触摸点；
		***marginX、marginY是画布相对页面左上角的水平、垂直距离，touchX、touchY是触摸点相对画布左上角的水平、垂直距离，触摸点相对画布左上角的距离 = 触摸点相对页面左上角的距离 - 画布相对页面左上角的距离；
		***依次遍历9个圆心，当且仅当该圆尚未选择过且触摸点到其圆心的距离小于半径时才能选择。
	8）eventHandler()：
		***为画布的touchstart、touchmove、touchend事件以及单选按钮的change事件指定相应的事件处理函数；
		***touchstart: 当手指触摸屏幕时触发，调用selectPoint()更新selectPoints数组；
		***touchmove: 当手指在屏幕上滑动时连续触发，调用selectPoint()更新selectPoints数组，计算当前触摸点的坐标并调用draw()绘制选中的点和点之间的连线；
		***touchend: 当手指从屏幕上移开时触发，调用storage()对密码进行判断与存储，并清空selectPoints数组，300ms后清空画布并绘制9个初始密码圆；
		***change：当单选按钮切换时触发，若选中设置密码按钮，则置radio和state为0，若选中验证密码按钮，则需要判断是否设置过密码，若尚未设置过密码，则需要先设置密码，若已经设置过密码方可验证密码，此时置radio为1，state为2。
	9）storage()：
		***根据当前状态对密码进行check()判断与localStorage存储；
		***状态0：设置密码状态，需第一次输入密码，若密码足够5个点，则更新状态为1，并将第一次输入的密码存储在password属性中；
		***状态1：设置密码状态，需再次输入密码，若不一致，则删除password属性，并更新状态为0，否则将password存储到本地localStorage中，将单选按钮置为选中验证密码状态，并更新状态为2；
		***状态2：验证密码状态，需要从本地localStorage中取出存储的密码与当前输入密码匹配。
	10）check()：
		***判断两次输入的密码是否一致，参数为第一次输入的密码和当前输入的密码。

3、gestureUI.css的样式布局说明
（1）浏览器默认的margin和padding不同，加一个全局的*{ margin: 0; padding: 0; }来统一；
（2）作为#time父元素的header设置相对定位，#time设置绝对定位，并为其设置合适的left、top、margin-left、margin-top实现#time水平垂直居中；
（3）表示信号的五个小黑圆可以通过HTML5的border-radius属性绘制；
（4）text-align: center实现行内元素水平居中，line-height设置为父元素的height值实现行内元素的垂直居中；
（5）为单选按钮设置width和height属性可以调节按钮大小，设置margin-left可以调节按钮与文字之间的距离；

4、gestureUI组件调用方式
创建组件对象，并调用init()方法进行组件初始化。
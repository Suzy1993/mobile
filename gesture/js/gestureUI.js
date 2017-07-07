// 组合使用构造函数模式和原型模式创建对象

// 构造函数模式用于定义实例属性
function Gesture(width, height) {
    this.width = width; 
    this.height = height;
	// 根据画布的宽度平均分配密码圆的半径
	// 一行3个圆，相邻两圆之间的距离（2个圆）、第一个圆与画布左边界的距离（1个圆）、最后一个圆与画布右边界的距离（1个圆）都为一个圆的直径大小
	// 画布的宽度相当于容纳7个圆（3 + 2 + 1 + 1），也就是7 * 2 = 14个半径
	// 后面会将画布的宽度设置为width * 0.8
	this.r = width * 0.8 / 14;
}

// 原型模式用于定义方法和共享的属性
Gesture.prototype.init = function() {
	// 构建整个组件对象的各个元素，画布元素的宽度和高度设置为组件对象宽度和高度的0.8倍
	var container = document.createElement('div');
	container.innerHTML = '<header><div class="circle"></div><div class="circle"></div><div class="circle"></div><div class="circle"></div><div class="circle"></div><div id="chinaMobile">中国移动</div><div id="time">1</div></header>'
						+ '<nav>手势密码</nav>'
						+ '<article><canvas id="canvas" width="' + this.width * 0.8 + '" height="' + this.width * 0.8 + '">浏览器不支持canvas元素</canvas></article>'
						+ '<section>请输入手势密码</section>'
						+ '<aside><input type="radio" name="password" value="setPassword" checked><span>设置密码</span><br><input type="radio" name="password" value="validatePassword"><span>验证密码</span></aside>';
	document.getElementsByTagName("body")[0].appendChild(container);
	// 根据当前时间更新顶部的时间显示
	var date = new Date();
	var hour = date.getHours();
	var minute = date.getMinutes();
	if (hour <= 12) 
		minute >= 10 ? document.getElementById("time").innerText = hour + ":" + minute + " AM" : document.getElementById("time").innerText = hour % 12 + ":0" + minute + " AM";
	else
		minute >= 10 ? document.getElementById("time").innerText = hour % 12 + ":" + minute + " PM" : document.getElementById("time").innerText = hour % 12 + ":0" + minute + " PM";
	this.canvas = document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');
	// 存储当前状态，初始化为0
	this.state = 0;
	// 存储设置密码or验证密码，初始化为设置密码状态0，1表示验证密码
	this.radio = 0;
	// 数组，存储已经选择的点
	this.selectPoints = [];
	// 数组，存储9个密码圆的圆心
	this.ninePoints = [];
	// 画布距离页面有一定距离，由于密码圆的坐标是相对画布来计算的，因此触摸点相对页面左上角的距离减去该距离才得到触摸点相对画布左上角的距离
	this.marginX = this.canvas.offsetLeft;
	this.marginY = this.canvas.offsetTop;
	// 计算9个圆心的坐标，存入ninePoints数组
	this.caculateLocation();
	// 根据圆心坐标和半径分别绘制9个密码圆
	for (var i = 0; i < this.ninePoints.length; i++) {
		this.strokeCircle(this.ninePoints[i].x, this.ninePoints[i].y, this.r, "#cccccc", 10);
		this.fillCircle(this.ninePoints[i].x, this.ninePoints[i].y, this.r, "#ffffff");
	}
	// 为画布绑定touchstart、touchmove、touchend事件、为单选按钮绑定change事件
	this.eventHandler();
}

// ninePoints存储9个圆的圆心，下标为0 ~ 8，圆心是个点对象，有x和y两个属性
Gesture.prototype.caculateLocation = function() {
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			// 第一个圆的圆心距离画布左边界的距离为3r，相邻两圆的圆心之间的距离为4r
			var point = {
				x: 4 * this.r * j + 3 * this.r,
				y: 4 * this.r * i + 3 * this.r
			};
			this.ninePoints.push(point);
		}
	}
};

// 根据圆心x、y坐标和半径及颜色、线宽绘制描边圆
Gesture.prototype.strokeCircle = function(x, y, r, color, lineWidth) {
	this.context.lineWidth = lineWidth;
	this.context.strokeStyle = color;
	this.context.beginPath();
	this.context.arc(x, y, r, 0, Math.PI * 2, true);
	this.context.stroke();
	this.context.closePath();
}

// 根据圆心x、y坐标和半径及颜色绘制实心圆
Gesture.prototype.fillCircle = function(x, y, r, color) {
	this.context.fillStyle = color;
	this.context.beginPath();
	this.context.arc(x, y, r, 0, Math.PI * 2, true);
	this.context.fill();
	this.context.closePath();
}

// 根据触摸点、颜色、线宽绘制线条
Gesture.prototype.drawLine = function(touchPoint, color, lineWidth) {
	this.context.beginPath();
    this.context.strokeStyle = color;
    this.context.lineWidth = lineWidth;
	// 将绘图图标移动到第一个选中的圆心的位置
    this.context.moveTo(this.ninePoints[this.selectPoints[0]].x, this.ninePoints[this.selectPoints[0]].y);
	// 按照selectPoints中选中点的顺序依次绘制连线
    for (var i = 1; i < this.selectPoints.length; i++) 
        this.context.lineTo(this.ninePoints[this.selectPoints[i]].x, this.ninePoints[this.selectPoints[i]].y);
	// 绘制最后一个选中点到当前触摸点的连线
	this.context.lineTo(touchPoint.x, touchPoint.y);
    this.context.stroke();
    this.context.closePath();
}

// 根据触摸点绘制选中的点和点之间的连线
Gesture.prototype.draw = function(touchPoint) {
	// 需要先清除画布内容再重新绘制
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	for (var i = 0; i < this.ninePoints.length; i++) {
		if (this.selectPoints.indexOf(i) == -1) { // 若该点不是已选中的点，则绘制颜色为#cccccc、线宽为5的描边圆和颜色为#ffffff的填充圆
			this.strokeCircle(this.ninePoints[i].x, this.ninePoints[i].y, this.r, "#cccccc", 10);
			this.fillCircle(this.ninePoints[i].x, this.ninePoints[i].y, this.r, "#ffffff");
		}
		else { // 若该点是已选中的点，则绘制颜色为#ff8800、线宽为5的描边圆和颜色为#ff8800的填充圆
			this.strokeCircle(this.ninePoints[i].x, this.ninePoints[i].y, this.r, "#ff5511", 10);
			this.fillCircle(this.ninePoints[i].x, this.ninePoints[i].y, this.r, "#ff8800");
		}
	}
	// 绘制线宽为5的红色连线
	this.drawLine(touchPoint, "red", 5); 
};

// 根据当前触摸点touchPoint和存储已选点的数组selectPoints更新selectPoints
Gesture.prototype.selectPoint = function(touchPoint) {
	// marginX、marginY是画布相对页面左上角的水平、垂直距离，touchX、touchY是触摸点相对画布左上角的水平、垂直距离
	// 触摸点相对画布左上角的距离 = 触摸点相对页面左上角的距离 - 画布相对页面左上角的距离
	var touchX = touchPoint.pageX - this.marginX;
	var touchY = touchPoint.pageY - this.marginY;
	// 依次遍历9个圆心，当且仅当该圆尚未选择过且触摸点到其圆心的距离小于半径时才能选择
	for (var i = 0; i < this.ninePoints.length; i++) {
		if (this.selectPoints.indexOf(i) == -1) { 
			var point = this.ninePoints[i];
			var diffX = Math.abs(point.x - touchX);
			var diffY = Math.abs(point.y - touchY);
			var distance = Math.sqrt(diffX * diffX + diffY * diffY);
			if (distance < this.r) {
				this.selectPoints.push(i);
				break;				
			}
		}
	}
};

// 为画布的touchstart、touchmove、touchend事件以及单选按钮的change事件指定相应的事件处理函数
Gesture.prototype.eventHandler = function() {
	// 内部函数永远不可能直接访问外部函数的this变量，因此需要将外部作用域的this对象保存在一个闭包能够访问到的变量that里
	var that = this;
	// touchstart: 当手指触摸屏幕时触发
	this.canvas.addEventListener("touchstart", function(event) {
		// 更新selectPoints数组
		that.selectPoint(event.touches[0]);
	}, false);
	// touchmove: 当手指在屏幕上滑动时连续触发
	this.canvas.addEventListener("touchmove", function(event) {
		event.preventDefault();
		// 更新selectPoints数组
		that.selectPoint(event.touches[0]);
		// 计算当前触摸点的坐标并绘制选中的点和点之间的连线
		that.draw({x: event.touches[0].pageX - that.marginX, y: event.touches[0].pageY - that.marginY});
	}, false);
	// touchend: 当手指从屏幕上移开时触发
	this.canvas.addEventListener("touchend", function() {
		// 对密码进行判断与存储
		that.storage();
		// 清空selectPoints数组
		that.selectPoints = [];
		// 300ms后清空画布并绘制9个初始密码圆
		setTimeout(function() {
			that.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			for (var i = 0; i < that.ninePoints.length; i++) {
				that.strokeCircle(that.ninePoints[i].x, that.ninePoints[i].y, that.r, "#cccccc", 10);
				that.fillCircle(that.ninePoints[i].x, that.ninePoints[i].y, that.r, "#ffffff");
			}
		}, 300);
	}, false);
	var radios = document.getElementsByName("password");
	for (var i = 0; i < radios.length; i++) {
		// change：当单选按钮切换时触发
		radios[i].addEventListener("change", function() {
			if (this.value == "setPassword") { // 设置密码状态
				that.radio = 0; 
				that.state = 0;
			}
			else { // 验证密码状态
				if (JSON.parse(window.localStorage.getItem('password')) != null) { //已经设置过密码方可验证密码
					that.radio = 1;
					that.state = 2;
				}
				else { // 若尚未设置过密码，则需要先设置密码
					alert("请先设置密码");
					radios[0].checked = "checked";
				}
			}
		}, false);
	}
};

// 根据当前状态对密码进行判断与存储，存储在本地localStorage中
Gesture.prototype.storage = function() {
	var section = document.getElementsByTagName('section')[0];
	var radios = document.getElementsByName("password");
	switch(this.state) {
		case 0: // 状态0：设置密码状态，需第一次输入密码，若密码足够5个点，则更新状态为1，并将第一次输入的密码存储在password属性中
			if (this.radio == 0 && this.selectPoints.length < 5) 
				section.innerHTML = '密码太短，至少需要5个点';
			else {
				section.innerHTML = '请再次输入手势密码';
				this.password = this.selectPoints.slice(0);
				this.state = 1;
			}
			break;
		case 1:// 状态1：设置密码状态，需再次输入密码，若不一致，则删除password属性，并更新状态为0，否则将password存储到本地localStorage中，将单选按钮置为选中验证密码状态，并更新状态为2
			if (!this.check(this.password, this.selectPoints)) {
				section.innerHTML = '两次输入的不一致';
				delete this.password;
				this.state = 0;
			}
			else {
				section.innerHTML = '密码设置成功';
				window.localStorage.setItem('password', JSON.stringify(this.password));
				radios[1].checked = "checked";
				this.state = 2;
			}
			break;
		case 2: // 状态2：验证密码状态，需要从本地localStorage中取出存储的密码与当前输入密码匹配
			if (!this.check(JSON.parse(window.localStorage.getItem('password')), this.selectPoints)) 
				section.innerHTML = '输入的密码不正确';
			else 
				section.innerHTML = '密码正确！';
			break;
	}
}

// 判断两次输入的密码是否一致
Gesture.prototype.check = function(prePassword, curPassword) {
	var preLen = prePassword.length;
	var curLen =curPassword.length;
	if (preLen != curLen) 
		return false;
	for (var i = 0; i < preLen; i++) {
		if (prePassword[i] != curPassword[i])
			return false;
	}
	return true;
}
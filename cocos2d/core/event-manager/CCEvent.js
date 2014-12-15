/****************************************************************************
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * Base class of all kinds of events. 所有时间的基础类。
 * @class
 * @extends cc.Class
 */
cc.Event = cc.Class.extend(/** @lends cc.Event# */{
    _type: 0,                                   //  Event type 时间类型
    _isStopped: false,                         //< whether the event has been stopped. 事件是否被停止。
    _currentTarget: null,                       //< Current target 当前目标

    _setCurrentTarget: function (target) {
        this._currentTarget = target;
    },

    ctor: function (type) {
        this._type = type;
    },

    /**
     * Gets the event type 获取时间类型
     * @function
     * @returns {Number}
     */
    getType: function () {
        return this._type;
    },

    /**
     * Stops propagation for current event 停止当前事件的传播
     * @function
     */
    stopPropagation: function () {
        this._isStopped = true;
    },

    /**
     * Checks whether the event has been stopped 检查事件是否被停止
     * @function
     * @returns {boolean}
     */
    isStopped: function () {
        return this._isStopped;
    },

    /**
     * <p>
     *     Gets current target of the event 获取事件的当前目标                                                           <br/>
     *     note: It only be available when the event listener is associated with node. 注意：当前目标仅在事件监听者与节点关联的时候才可用。              <br/>
     *          It returns 0 when the listener is associated with fixed priority. 当监听者有固定的优先权时，返回0.
     * </p>
     * @function
     * @returns {cc.Node}  The target with which the event associates.
     */
    getCurrentTarget: function () {
        return this._currentTarget;
    }
});

//event type 事件类型
/**
 * The type code of Touch event. 触摸事件的类型代码。
 * @constant
 * @type {number}
 */
cc.Event.TOUCH = 0;
/**
 * The type code of Keyboard event. 键盘事件的类型代码。
 * @constant
 * @type {number}
 */
cc.Event.KEYBOARD = 1;
/**
 * The type code of Acceleration event. 加速事件的类型代码。
 * @constant
 * @type {number}
 */
cc.Event.ACCELERATION = 2;
/**
 * The type code of Mouse event. 鼠标事件的类型代码。
 * @constant
 * @type {number}
 */
cc.Event.MOUSE = 3;
/**
 * The type code of Custom event. 自定义事件的类型代码。
 * @constant
 * @type {number}
 */
cc.Event.CUSTOM = 4;

/**
 * The Custom event 自定义事件
 * @class
 * @extends cc.Event
 */
cc.EventCustom = cc.Event.extend(/** @lends cc.EventCustom# */{
    _eventName: null,
    _userData: null,                                 // User data 用户数据

    ctor: function (eventName) {
        cc.Event.prototype.ctor.call(this, cc.Event.CUSTOM);
        this._eventName = eventName;
    },

    /**
     * Sets user data 设置用户数据
     * @param {*} data
     */
    setUserData: function (data) {
        this._userData = data;
    },

    /**
     * Gets user data 获取用户数据
     * @returns {*}
     */
    getUserData: function () {
        return this._userData;
    },

    /**
     * Gets event name 获取事件名字
     * @returns {String}
     */
    getEventName: function () {
        return this._eventName;
    }
});

/**
 * The mouse event 鼠标事件
 * @class
 * @extends cc.Event
 */
cc.EventMouse = cc.Event.extend(/** @lends cc.EventMouse# */{
    _eventType: 0,
    _button: 0,
    _x: 0,
    _y: 0,
    _prevX: 0,
    _prevY: 0,
    _scrollX: 0,
    _scrollY: 0,

    ctor: function (eventType) {
        cc.Event.prototype.ctor.call(this, cc.Event.MOUSE);
        this._eventType = eventType;
    },

    /**
     * Sets scroll data 设置滚动数据
     * @param {number} scrollX
     * @param {number} scrollY
     */
    setScrollData: function (scrollX, scrollY) {
        this._scrollX = scrollX;
        this._scrollY = scrollY;
    },

    /**
     * Returns the x axis scroll value 返回X轴的翻滚值
     * @returns {number}
     */
    getScrollX: function () {
        return this._scrollX;
    },

    /**
     * Returns the y axis scroll value 返回Y轴的翻滚值
     * @returns {number}
     */
    getScrollY: function () {
        return this._scrollY;
    },

    /**
     * Sets cursor location 设置光标位置
     * @param {number} x
     * @param {number} y
     */
    setLocation: function (x, y) {
        this._x = x;
        this._y = y;
    },

	/**
	 * Returns cursor location 返回光标位置
	 * @return {cc.Point} location
	 */
    getLocation: function () {
        return {x: this._x, y: this._y};
    },

	/**
	 * Returns the current cursor location in screen coordinates 返回当前光标在屏幕坐标系中的位置
	 * @return {cc.Point}
	 */
	getLocationInView: function() {
		return {x: this._x, y: cc.view._designResolutionSize.height - this._y};
	},

    _setPrevCursor: function (x, y) {
        this._prevX = x;
        this._prevY = y;
    },

    /**
     * Returns the delta distance from the previous location to current location 返回从前一个位置到当前位置的距离增量
     * @return {cc.Point}
     */
    getDelta: function () {
        return {x: this._x - this._prevX, y: this._y - this._prevY};
    },

    /**
     * Returns the X axis delta distance from the previous location to current location 返回从前一个位置到当前位置的X轴的距离增量
     * @return {Number}
     */
    getDeltaX: function () {
        return this._x - this._prevX;
    },

    /**
     * Returns the Y axis delta distance from the previous location to current location 返回从前一个位置到当前位置的Y轴的距离增量
     * @return {Number}
     */
    getDeltaY: function () {
        return this._y - this._prevY;
    },

    /**
     * Sets mouse button 设置鼠标按钮
     * @param {number} button
     */
    setButton: function (button) {
        this._button = button;
    },

    /**
     * Returns mouse button 返回鼠标按钮
     * @returns {number}
     */
    getButton: function () {
        return this._button;
    },

    /**
     * Returns location X axis data 返回X轴的位置数据
     * @returns {number}
     */
    getLocationX: function () {
        return this._x;
    },

    /**
     * Returns location Y axis data 返回Y轴的位置数据
     * @returns {number}
     */
    getLocationY: function () {
        return this._y;
    }
});

//Different types of MouseEvent 不同类型的鼠标事件
/**
 * The none event code of  mouse event. 没有事件代码的鼠标事件
 * @constant
 * @type {number}
 */
cc.EventMouse.NONE = 0;
/**
 * The event type code of mouse down event. 鼠标向下移动事件的事件类型代码
 * @constant
 * @type {number}
 */
cc.EventMouse.DOWN = 1;
/**
 * The event type code of mouse up event. 鼠标向上移动事件的事件类型代码
 * @constant
 * @type {number}
 */
cc.EventMouse.UP = 2;
/**
 * The event type code of mouse move event. 鼠标移动事件的事件类型代码
 * @constant
 * @type {number}
 */
cc.EventMouse.MOVE = 3;
/**
 * The event type code of mouse scroll event. 鼠标滚动事件的事件类型代码
 * @constant
 * @type {number}
 */
cc.EventMouse.SCROLL = 4;

/**
 * The tag of Mouse left button 鼠标左按钮标签
 * @constant
 * @type {Number}
 */
cc.EventMouse.BUTTON_LEFT = 0;

/**
 * The tag of Mouse right button  (The right button number is 2 on browser) 鼠标右按钮标签（在浏览器上，右按钮的数字是2）
 * @constant
 * @type {Number}
 */
cc.EventMouse.BUTTON_RIGHT = 2;

/**
 * The tag of Mouse middle button  (The middle button number is 1 on browser) 鼠标中间按钮标签（在浏览器上，中间按钮的数字是1）
 * @constant
 * @type {Number}
 */
cc.EventMouse.BUTTON_MIDDLE = 1;

/**
 * The tag of Mouse button 4 鼠标4的标签
 * @constant
 * @type {Number}
 */
cc.EventMouse.BUTTON_4 = 3;

/**
 * The tag of Mouse button 5 鼠标5的标签
 * @constant
 * @type {Number}
 */
cc.EventMouse.BUTTON_5 = 4;

/**
 * The tag of Mouse button 6 鼠标6的标签
 * @constant
 * @type {Number}
 */
cc.EventMouse.BUTTON_6 = 5;

/**
 * The tag of Mouse button 7 鼠标7的标签
 * @constant
 * @type {Number}
 */
cc.EventMouse.BUTTON_7 = 6;

/**
 * The tag of Mouse button 8 鼠标8的标签
 * @constant
 * @type {Number}
 */
cc.EventMouse.BUTTON_8 = 7;

/**
 * The touch event 触摸事件
 * @class
 * @extends cc.Event
 */
cc.EventTouch = cc.Event.extend(/** @lends cc.EventTouch# */{
    _eventCode: 0,
    _touches: null,

    ctor: function (arr) {
        cc.Event.prototype.ctor.call(this, cc.Event.TOUCH);
        this._touches = arr || [];
    },

    /**
     * Returns event code 返回事件代码
     * @returns {number}
     */
    getEventCode: function () {
        return this._eventCode;
    },

    /**
     * Returns touches of event 返回事件的触摸
     * @returns {Array}
     */
    getTouches: function () {
        return this._touches;
    },

    _setEventCode: function (eventCode) {
        this._eventCode = eventCode;
    },

    _setTouches: function (touches) {
        this._touches = touches;
    }
});

/**
 * The maximum touch numbers 触摸数的最大值
 * @constant
 * @type {Number}
 */
cc.EventTouch.MAX_TOUCHES = 5;

cc.EventTouch.EventCode = {BEGAN: 0, MOVED: 1, ENDED: 2, CANCELLED: 3};
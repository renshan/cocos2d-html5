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
 * <p>
 *     事件监听者的基础类。                                <br/>
 *     如果你需要自定义不同回调的监听者， 那你需要继承这个类。              <br/>
 *     比如，你可能会用到EventListenerAcceleration, <br/> 
 *     EventListenerKeyboard,EventListenerTouchOneByOne, EventListenerCustom。
 * </p>
 * @class
 * @extends cc.Class
 */
cc.EventListener = cc.Class.extend(/** @lends cc.EventListener# */{
    _onEvent: null,                          	// 事件回调函数
    _type: 0,                                 	// 事件监听类型
    _listenerID: null,                       	// 事件监听ID
    _registered: false,                     	// 监听者是否已被加入到调度中。

    _fixedPriority: 0,                      	// 数字越高，则优先权越高，0代表场景图中的最低优先权。
    _node: null,                           	// 已优先权为基础的场景图
    _paused: true,                        	// 监听者是否被暂停
    _isEnabled: true,                      	// 监听者是否被启动

    /**
     * 初始化事件及它的类型和回调函数
     * @param {number} type
     * @param {string} listenerID
     * @param {function} callback
     */
    ctor: function (type, listenerID, callback) {
        this._onEvent = callback;
        this._type = type || 0;
        this._listenerID = listenerID || "";
    },

    /**
     * <p>
     *     把监听者设置为暂停状态
     *     暂停状态仅仅可用于场景图的有优先级的监听者。
     *     `EventDispatcher::resumeAllEventListenersForTarget(node)` 将把暂停状态设置为'true'，
     *     `EventDispatcher::pauseAllEventListenersForTarget(node)` 将把暂停状态设置为'false'。  
     *     @note 1) 固定优先级的监听者将永远不会被暂停。如果固定的优先级不想接受事件，就调用`setEnabled(false)`
     *           2) 在`Node`的onEnter和onExit中，和这个节点相关的监听者的暂停状态将自动更新。
     * </p>
     * @param {boolean} paused
     * @private
     */
    _setPaused: function (paused) {
        this._paused = paused;
    },

    /**
     * 检测监听者是否被暂停
     * @returns {boolean}
     * @private
     */
    _isPaused: function () {
        return this._paused;
    },

    /**
     * 标记监听者被EventDispatcher注册
     * @param {boolean} registered
     * @private
     */
    _setRegistered: function (registered) {
        this._registered = registered;
    },

    /**
     * 测试监听者是否被EventDispatcher注册
     * @returns {boolean}
     * @private
     */
    _isRegistered: function () {
        return this._registered;
    },

    /**
     * 获取本监听者的类型
     * @note 这个和`EventType`不同，比如，触摸事件有两种事件监听者－EventListenerOneByOne,EventListenerAllAtOnce
     * @returns {number}
     * @private
     */
    _getType: function () {
        return this._type;
    },

    /**
     * 获取本监听者的监听者ID
     * 当事件在被调度时，监听者ID被作为键用语根据事件类型搜索监听者。
     * @returns {string}
     * @private
     */
    _getListenerID: function () {
        return this._listenerID;
    },

    /**
     * 为本监听者设置固定优先权
     * @note 这个方法仅被用语‘固定优先权的监听者’，需要访问非零值。0为场景图优先权的监听者预留。
     * @param {number} fixedPriority
     * @private
     */
    _setFixedPriority: function (fixedPriority) {
        this._fixedPriority = fixedPriority;
    },

    /**
     * 获取本监听者的固定优先权
     * @returns {number} 0 如果这是一个场景图优先级监听者，并且他的固定优先级为非零。
     * @private
     */
    _getFixedPriority: function () {
        return this._fixedPriority;
    },

    /**
     * 为本监听者设置场景图优先级
     * @param {cc.Node} node
     * @private
     */
    _setSceneGraphPriority: function (node) {
        this._node = node;
    },

    /**
     * 获取本监听者的场景图优先级
     * @returns {cc.Node} 如果它是一个固定优先级的监听者，并且场景图优先级监听者为非空
     * @private
     */
    _getSceneGraphPriority: function () {
        return this._node;
    },

    /**
     * 检查监听者是否空闲。
     * @returns {boolean}
     */
    checkAvailable: function () {
        return this._onEvent != null;
    },

    /**
     * 克隆监听者，它的子类必须重写此方法。
     * @returns {cc.EventListener}
     */
    clone: function () {
        return null;
    },

    /**
     * 开启或关闭监听者
     * @note 只有时开启状态的监听者才能接收事件。
     *       当一个监听者被初始化时，它的状态默认设置为开启。
     *       监听者能接收事件当它是开启的并且不是暂停状态。
     *       如果它是固定优先级监听者，暂停状态永远为假。
     * @param {boolean} enabled
     */
    setEnabled: function(enabled){
        this._isEnabled = enabled;
    },

    /**
     * Checks whether the listener is enabled 检测监听者是否是开启状态
     * @returns {boolean}
     */
    isEnabled: function(){
        return this._isEnabled;
    },

    /**
     * <p> 当前的JavaScript Bindings (JSB)在有些情况下需要用retain和release. 这是JSB的一个bug, 用retain/release是个丑陋的方法。<br/>
     * 因此，这两个方法被加入与JSB兼容。这是不安全的，应该被移除一旦JSB修正这个retain/release bug.<br/>
     * 你需要retain一个对象，如果你建立一个监听者，并且在同一个帧中没有给它加任何目标节点。<br/> 
     * 否则，JSB本身的自动释放池讲认为这个对象是无用的并且直接释放掉，<br/>
     * 当你以后再想使用它是，错误“无效的原生对象“错误将会出现。<br/> 
     * retain函数增加原生对象的计数器，以此来避免它被释放掉。<br/> 
     * 当你认为不再需要这个对象是，你需要手动激活释放函数，否则会出现内存泄漏。<br/> 
     * retain和release函数的脚用需要在开发者的游戏代码中成对出现。</p> 
     * @function
     * @see cc.EventListener#release
     */
    retain:function () {
    },
    /**
     * <p> 当前的JavaScript Bindings (JSB)在有些情况下需要用retain和release. 这是JSB的一个bug, 用retain/release是个丑陋的方法。<br/>
     * 因此，这两个方法被加入与JSB兼容。这是不安全的，应该被移除一旦JSB修正这个retain/release bug.<br/>
     * 你需要retain一个对象，如果你建立一个监听者，并且在同一个帧中没有给它加任何目标节点。<br/> 
     * 否则，JSB本身的自动释放池讲认为这个对象是无用的并且直接释放掉，<br/>
     * 当你以后再想使用它是，错误“无效的原生对象“错误将会出现。<br/> 
     * retain函数增加原生对象的计数器，以此来避免它被释放掉。<br/> 
     * 当你认为不再需要这个对象是，你需要手动激活释放函数，否则会出现内存泄漏。<br/> 
     * retain和release函数的脚用需要在开发者的游戏代码中成对出现。</p> 
     * @function
     * @see cc.EventListener#retain
     */
    release:function () {
    }
});

// 事件监听者类型
/**
 * 未知的事件监听者的类型标识码。
 * @constant
 * @type {number}
 */
cc.EventListener.UNKNOWN = 0;
/**
 * 逐个触摸事件监听者的类型标识码。
 * @constant
 * @type {number}
 */
cc.EventListener.TOUCH_ONE_BY_ONE = 1;
/**
 * 所有同时触摸事件监听者的类型标识码。
 * @constant
 * @type {number}
 */
cc.EventListener.TOUCH_ALL_AT_ONCE = 2;
/**
 * 键盘事件监听者的类型标识码。
 * @constant
 * @type {number}
 */
cc.EventListener.KEYBOARD = 3;
/**
 * 鼠标事件监听者的类型标识码。
 * @constant
 * @type {number}
 */
cc.EventListener.MOUSE = 4;
/**
 * 加速事件监听者的类型标识码。
 * @constant
 * @type {number}
 */
cc.EventListener.ACCELERATION = 5;
/**
 * 自定义事件监听者的类型标识码。
 * @constant
 * @type {number}
 */
cc.EventListener.CUSTOM = 6;

cc._EventListenerCustom = cc.EventListener.extend({
    _onCustomEvent: null,
    ctor: function (listenerId, callback) {
        this._onCustomEvent = callback;
        var selfPointer = this;
        var listener = function (event) {
            if (selfPointer._onCustomEvent != null)
                selfPointer._onCustomEvent(event);
        };

        cc.EventListener.prototype.ctor.call(this, cc.EventListener.CUSTOM, listenerId, listener);
    },

    checkAvailable: function () {
        return (cc.EventListener.prototype.checkAvailable.call(this) && this._onCustomEvent != null);
    },

    clone: function () {
        return new cc._EventListenerCustom(this._listenerID, this._onCustomEvent);
    }
});

cc._EventListenerCustom.create = function (eventName, callback) {
    return new cc._EventListenerCustom(eventName, callback);
};

cc._EventListenerMouse = cc.EventListener.extend({
    onMouseDown: null,
    onMouseUp: null,
    onMouseMove: null,
    onMouseScroll: null,

    ctor: function () {
        var selfPointer = this;
        var listener = function (event) {
            var eventType = cc.EventMouse;
            switch (event._eventType) {
                case eventType.DOWN:
                    if (selfPointer.onMouseDown)
                        selfPointer.onMouseDown(event);
                    break;
                case eventType.UP:
                    if (selfPointer.onMouseUp)
                        selfPointer.onMouseUp(event);
                    break;
                case eventType.MOVE:
                    if (selfPointer.onMouseMove)
                        selfPointer.onMouseMove(event);
                    break;
                case eventType.SCROLL:
                    if (selfPointer.onMouseScroll)
                        selfPointer.onMouseScroll(event);
                    break;
                default:
                    break;
            }
        };
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.MOUSE, cc._EventListenerMouse.LISTENER_ID, listener);
    },

    clone: function () {
        var eventListener = new cc._EventListenerMouse();
        eventListener.onMouseDown = this.onMouseDown;
        eventListener.onMouseUp = this.onMouseUp;
        eventListener.onMouseMove = this.onMouseMove;
        eventListener.onMouseScroll = this.onMouseScroll;
        return eventListener;
    },

    checkAvailable: function () {
        return true;
    }
});

cc._EventListenerMouse.LISTENER_ID = "__cc_mouse";

cc._EventListenerMouse.create = function () {
    return new cc._EventListenerMouse();
};

cc._EventListenerTouchOneByOne = cc.EventListener.extend({
    _claimedTouches: null,
    swallowTouches: false,
    onTouchBegan: null,
    onTouchMoved: null,
    onTouchEnded: null,
    onTouchCancelled: null,

    ctor: function () {
        cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ONE_BY_ONE, cc._EventListenerTouchOneByOne.LISTENER_ID, null);
        this._claimedTouches = [];
    },

    setSwallowTouches: function (needSwallow) {
        this.swallowTouches = needSwallow;
    },

    clone: function () {
        var eventListener = new cc._EventListenerTouchOneByOne();
        eventListener.onTouchBegan = this.onTouchBegan;
        eventListener.onTouchMoved = this.onTouchMoved;
        eventListener.onTouchEnded = this.onTouchEnded;
        eventListener.onTouchCancelled = this.onTouchCancelled;
        eventListener.swallowTouches = this.swallowTouches;
        return eventListener;
    },

    checkAvailable: function () {
        if(!this.onTouchBegan){
            cc.log(cc._LogInfos._EventListenerTouchOneByOne_checkAvailable);
            return false;
        }
        return true;
    }
});

cc._EventListenerTouchOneByOne.LISTENER_ID = "__cc_touch_one_by_one";

cc._EventListenerTouchOneByOne.create = function () {
    return new cc._EventListenerTouchOneByOne();
};

cc._EventListenerTouchAllAtOnce = cc.EventListener.extend({
    onTouchesBegan: null,
    onTouchesMoved: null,
    onTouchesEnded: null,
    onTouchesCancelled: null,

    ctor: function(){
       cc.EventListener.prototype.ctor.call(this, cc.EventListener.TOUCH_ALL_AT_ONCE, cc._EventListenerTouchAllAtOnce.LISTENER_ID, null);
    },

    clone: function(){
        var eventListener = new cc._EventListenerTouchAllAtOnce();
        eventListener.onTouchesBegan = this.onTouchesBegan;
        eventListener.onTouchesMoved = this.onTouchesMoved;
        eventListener.onTouchesEnded = this.onTouchesEnded;
        eventListener.onTouchesCancelled = this.onTouchesCancelled;
        return eventListener;
    },

    checkAvailable: function(){
        if (this.onTouchesBegan == null && this.onTouchesMoved == null
            && this.onTouchesEnded == null && this.onTouchesCancelled == null) {
            cc.log(cc._LogInfos._EventListenerTouchAllAtOnce_checkAvailable);
            return false;
        }
        return true;
    }
});

cc._EventListenerTouchAllAtOnce.LISTENER_ID = "__cc_touch_all_at_once";

cc._EventListenerTouchAllAtOnce.create = function(){
     return new cc._EventListenerTouchAllAtOnce();
};

/**
 * 通过JSON对象建立一个EventListener对象
 * @function
 * @static
 * @param {object} argObj 一个json对象
 * @returns {cc.EventListener}
 * todo: 应该直接使用新的
 * @example
 * cc.EventListener.create({
 *       event: cc.EventListener.TOUCH_ONE_BY_ONE,
 *       swallowTouches: true,
 *       onTouchBegan: function (touch, event) {
 *           //do something
 *           return true;
 *       }
 *    });
 */
cc.EventListener.create = function(argObj){

    cc.assert(argObj&&argObj.event, cc._LogInfos.EventListener_create);

    var listenerType = argObj.event;
    delete argObj.event;

    var listener = null;
    if(listenerType === cc.EventListener.TOUCH_ONE_BY_ONE)
        listener = new cc._EventListenerTouchOneByOne();
    else if(listenerType === cc.EventListener.TOUCH_ALL_AT_ONCE)
        listener = new cc._EventListenerTouchAllAtOnce();
    else if(listenerType === cc.EventListener.MOUSE)
        listener = new cc._EventListenerMouse();
    else if(listenerType === cc.EventListener.CUSTOM){
        listener = new cc._EventListenerCustom(argObj.eventName, argObj.callback);
        delete argObj.eventName;
        delete argObj.callback;
    } else if(listenerType === cc.EventListener.KEYBOARD)
        listener = new cc._EventListenerKeyboard();
    else if(listenerType === cc.EventListener.ACCELERATION){
        listener = new cc._EventListenerAcceleration(argObj.callback);
        delete argObj.callback;
    }

    for(var key in argObj) {
        listener[key] = argObj[key];
    }

    return listener;
};
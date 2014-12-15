/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
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
 * Instant actions are immediate actions. They don't have a duration like.
 * 瞬间动作是立刻执行动作.他们没有持续时间
 * the CCIntervalAction actions.
 * @class
 * @extends cc.FiniteTimeAction
 */
cc.ActionInstant = cc.FiniteTimeAction.extend(/** @lends cc.ActionInstant# */{
    /**
     * return true if the action has finished.
     * 返回动作是否已经完成
     * @return {Boolean}
     */
    isDone:function () {
        return true;
    },

    /**
     * called every frame with it's delta time. <br />
     * 按时间调用每一帧. <br />
     * DON'T override unless you know what you are doing.
     * 千万不要覆盖这个函数，除非你知道它是干嘛的.
     * @param {Number} dt
     */
    step:function (dt) {
        this.update(1);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number} dt
     */
    update:function (dt) {
        //nothing
        //什么都不做
    },

    /**
     * returns a reversed action. <br />
     * 返回一个反向动作. <br />
     * For example: <br />
     * 举个例子: <br />
     * - The action will be x coordinates of 0 move to 100. <br />
     * -一个动作是从x轴坐标0移到100. <br />
     * - The reversed action will be x of 100 move to 0.
     * -那么它的反向动作就是从x轴坐标100移到0
     * - Will be rewritten
     * @returns {cc.Action}
     */
    reverse:function(){
        return this.clone();
    },

    /**
     * to copy object with deep copy.
     * 对对象进行深拷贝
     * returns a clone of action.
     * 返回一个拷贝的动作
     * @return {cc.FiniteTimeAction}
     */
    clone:function(){
        return new cc.ActionInstant();
    }
});

/**
 * Show the node.
 * 显示节点
 * @class
 * @extends cc.ActionInstant
 */
cc.Show = cc.ActionInstant.extend(/** @lends cc.Show# */{

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number} dt
     */
    update:function (dt) {
        this.target.visible = true;
    },

    /**
     * returns a reversed action. <br />
     * 返回一个反向动作. <br />
      * For example: <br />
     * 举个例子: <br />
     * - The action will be x coordinates of 0 move to 100. <br />
     * -一个动作是从x轴坐标0移到100. <br />
     * - The reversed action will be x of 100 move to 0.
     * -那么它的反向动作就是从x轴坐标100移到0
     * - Will be rewritten
     * @returns {cc.Hide}
     */
    reverse:function () {
        return new cc.Hide();
    },

    /**
     * to copy object with deep copy.
     * 对对象进行深拷贝
     * returns a clone of action.
     * 返回一个拷贝的动作
     * @return {cc.FiniteTimeAction}
     */
    clone:function(){
        return new cc.Show();
    }
});

/**
 * Show the Node.
 * 显示节点
 * @function
 * @return {cc.Show}
 * @example
 * // example
 * //举个例子
 * var showAction = cc.show();
 */
cc.show = function () {
    return new cc.Show();
};

/**
 * Show the Node. Please use cc.show instead.
 * 显示节点，请使用cc.show代替
 * @static
 * @deprecated since v3.0 <br /> Please use cc.show instead.
 * @在3.0版本之后请使用cc.show来替代
 * @return {cc.Show}
 */
cc.Show.create = cc.show;

/**
 * Hide the node.
 * 隐藏节点.
 * @class
 * @extends cc.ActionInstant
 */
cc.Hide = cc.ActionInstant.extend(/** @lends cc.Hide# */{

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number} dt
     */
    update:function (dt) {
        this.target.visible = false;
    },

    /**
     * returns a reversed action. <br />
     * 返回一个反向动作. <br />
     * For example: <br />
     * 举个例子: <br />
     * - The action will be x coordinates of 0 move to 100. <br />
     * -一个动作是从x轴坐标0移到100. <br />
     * - The reversed action will be x of 100 move to 0.
     * -那么它的反向动作就是从x轴坐标100移到0
     * - Will be rewritten
     * -将会被重写
     * @returns {cc.Show}
     */
    reverse:function () {
        return new cc.Show();
    },

    /**
     * to copy object with deep copy.
     * 对对象进行深拷贝
     * returns a clone of action.
     * 返回一个拷贝的动作
     * @return {cc.Hide}
     */
    clone:function(){
        return new cc.Hide();
    }
});

/**
 * Hide the node.
 * 隐藏节点
 * @function
 * @return {cc.Hide}
 * @example
 * // example
 * //举个例子
 * var hideAction = cc.hide();
 */
cc.hide = function () {
    return new cc.Hide();
};

/**
 * Hide the node. Please use cc.hide instead.
 * 隐藏节点，请使用cc.hide代替
 * @static
 * @静态方法
 * @deprecated since v3.0 <br /> Please use cc.hide instead.
 * @在3.0版本之后请使用cc.hide来替代
 * @return {cc.Hide}
 * @example
 * // example
 * //举个例子
 * var hideAction = cc.hide();
 */
cc.Hide.create = cc.hide;

/**
 * Toggles the visibility of a node.
 * 切换节点的可见性
 * @class
 * @extends cc.ActionInstant
 */
cc.ToggleVisibility = cc.ActionInstant.extend(/** @lends cc.ToggleVisibility# */{

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number} dt
     */
    update:function (dt) {
        this.target.visible = !this.target.visible;
    },

    /**
     * returns a reversed action.
     * 返回一个反向动作.
     * @returns {cc.ToggleVisibility}
     */
    reverse:function () {
        return new cc.ToggleVisibility();
    },

    /**
     * to copy object with deep copy.
     * 对对象进行深拷贝
     * returns a clone of action.
     * 返回一个拷贝的动作
     * @return {cc.ToggleVisibility}
     */
    clone:function(){
        return new cc.ToggleVisibility();
    }
});

/**
 * Toggles the visibility of a node.
 * 切换节点的可见性.
 * @function
 * @return {cc.ToggleVisibility}
 * @example
 * // example
 * //举个例子
 * var toggleVisibilityAction = cc.toggleVisibility();
 */
cc.toggleVisibility = function () {
    return new cc.ToggleVisibility();
};

/**
 * Toggles the visibility of a node. Please use cc.toggleVisibility instead.
 * 切换节点的可见性.请使用cc.toggleVisibility代替
 * @static
 * @静态方法
 * @deprecated since v3.0 <br /> Please use cc.toggleVisibility instead.
 * @在3.0版本之后请使用 cc.toggleVisibility来替代
 * @return {cc.ToggleVisibility}
 */
cc.ToggleVisibility.create = cc.toggleVisibility;

/**
 * Delete self in the next frame.
 * 下一帧销毁自己
 * @class
 * @extends cc.ActionInstant
 * @param {Boolean} [isNeedCleanUp=true]
 *
 * @example
 * // example
 * //举个例子
 * var removeSelfAction = new cc.RemoveSelf(false);
 */
cc.RemoveSelf = cc.ActionInstant.extend({
     _isNeedCleanUp: true,

	/**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     * 构造函数，覆盖它之后请继承它的形式，别忘记在继承的"ctor"函数里调用 "this._super()"
	 * Create a RemoveSelf object with a flag indicate whether the target should be cleaned up while removing.
             * 创建一个可以销毁自己的对象，使用一个标记来记录是否在移除的时候需要被销毁
	 * @param {Boolean} [isNeedCleanUp=true]
	 */
    ctor:function(isNeedCleanUp){
        cc.FiniteTimeAction.prototype.ctor.call(this);

	    isNeedCleanUp !== undefined && this.init(isNeedCleanUp);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number} dt
     */
    update:function(dt){
        this.target.removeFromParent(this._isNeedCleanUp);
    },

    /**
     * Initialization of the node, please do not call this function by yourself, you should pass the parameters to constructor to initialize it .
     * 初始化节点，不要自己调用这个方法，你应该使用给构造函数传值来初始化
     * @param isNeedCleanUp
     * @returns {boolean}
     */
    init:function(isNeedCleanUp){
        this._isNeedCleanUp = isNeedCleanUp;
        return true;
    },

    /**
     * returns a reversed action.
     * 返回一个反向动作.
     */
    reverse:function(){
        return new cc.RemoveSelf(this._isNeedCleanUp);
    },

    /**
   * to copy object with deep copy.
     * 对对象进行深拷贝
     * returns a clone of action.
     * 返回一个拷贝的动作
     * @return {cc.RemoveSelf}
     */
    clone:function(){
        return new cc.RemoveSelf(this._isNeedCleanUp);
    }
});

/**
 * Create a RemoveSelf object with a flag indicate whether the target should be cleaned up while removing.
 * 创建一个可以销毁自己的对象，使用一个标记来记录是否在移除的时候需要被销毁
 * @function
 * @param {Boolean} [isNeedCleanUp=true]
 * @return {cc.RemoveSelf}
 *
 * @example
 * // example
 * //举个例子
 * var removeSelfAction = cc.removeSelf();
 */
cc.removeSelf = function(isNeedCleanUp){
    return new cc.RemoveSelf(isNeedCleanUp);
};

/**
 * Please use cc.removeSelf instead.
 * 请使用cc.removeSelf来代替
 * Create a RemoveSelf object with a flag indicate whether the target should be cleaned up while removing.
 * 创建一个可以销毁自己的对象，使用一个标记来记录是否在移除的时候需要被销毁
 * @static
 * @deprecated since v3.0 <br /> Please use cc.removeSelf instead.
 * @param {Boolean} [isNeedCleanUp=true]
 * @return {cc.RemoveSelf}
 */
cc.RemoveSelf.create = cc.removeSelf;

/**
 * Flips the sprite horizontally.
 * 水平方向翻转精灵
 * @class
 * @extends cc.ActionInstant
 * @param {Boolean} flip Indicate whether the target should be flipped or not
 * @param {Boolean} 参数用来表示目标是否要被翻转
 *
 * @example
 * @举个例子
 * var flipXAction = new cc.FlipX(true);
 */
cc.FlipX = cc.ActionInstant.extend(/** @lends cc.FlipX# */{
    _flippedX:false,

	/**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     * 构造函数，覆盖它之后请继承它的形式，别忘记在继承的"ctor"函数里调用 "this._super()"
	 * Create a FlipX action to flip or unflip the target.
             *创建一个可以销毁自己的对象，使用一个标记来记录是否在移除的时候需要被销毁
	 * @param {Boolean} flip Indicate whether the target should be flipped or not
             * @param {Boolean} 参数用来表示目标是否要被翻转
	 */
    ctor:function(flip){
        cc.FiniteTimeAction.prototype.ctor.call(this);
        this._flippedX = false;
		flip !== undefined && this.initWithFlipX(flip);
    },

    /**
     * initializes the action with a set flipX.
     * 默认使用水平翻转来初始化一个动作
     * @param {Boolean} flip
     * @return {Boolean}
     */
    initWithFlipX:function (flip) {
        this._flippedX = flip;
        return true;
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number}  dt
     */
    update:function (dt) {
        this.target.flippedX = this._flippedX;
    },

    /**
     * returns a reversed action.
     * 返回一个反向动作.
     * @return {cc.FlipX}
     */
    reverse:function () {
        return new cc.FlipX(!this._flippedX);
    },

    /**
   * to copy object with deep copy.
     * 对对象进行深拷贝
     * returns a clone of action.
     * 返回一个拷贝的动作
     * @return {cc.FiniteTimeAction}
     */
    clone:function(){
        var action = new cc.FlipX();
        action.initWithFlipX(this._flippedX);
        return action;
    }
});

/**
 * Create a FlipX action to flip or unflip the target.
 * 为目标创建一个水平翻转动作
 * @function
 * @param {Boolean} flip Indicate whether the target should be flipped or not
 * @param {Boolean} 参数用来表示目标是否要被翻转
 * @return {cc.FlipX}
 * @example
 * @举个例子
 * var flipXAction = cc.flipX(true);
 */
cc.flipX = function (flip) {
    return new cc.FlipX(flip);
};

/**
 * Plese use cc.flipX instead.
 * 请使用cc.flipX来代替
 * Create a FlipX action to flip or unflip the target
 * 为目标创建一个水平翻转动作
 * @static
 * @静态方法
 * @deprecated since v3.0 <br /> Plese use cc.flipX instead.
 * @在3.0版本之后请使用se cc.flipX来替代
 * @param {Boolean} flip Indicate whether the target should be flipped or not
 * @param {Boolean} 参数用来表示目标是否要被翻转

 * @return {cc.FlipX}
 */
cc.FlipX.create = cc.flipX;

/**
 * Flips the sprite vertically
 * 竖直方向翻转精灵
 * @class
 * @extends cc.ActionInstant
 * @param {Boolean} flip
 * @example
 * @举个例子
 * var flipYAction = new cc.FlipY(true);
 */
cc.FlipY = cc.ActionInstant.extend(/** @lends cc.FlipY# */{
    _flippedY:false,

	/**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
    *构造函数，覆盖它之后请继承它的形式，别忘记在继承的"ctor"函数里调用 "this._super()"
	 * Create a FlipY action to flip or unflip the target.
	 * 为目标创建一个竖直翻转动作
	 * @param {Boolean} flip
	 */
    ctor: function(flip){
        cc.FiniteTimeAction.prototype.ctor.call(this);
        this._flippedY = false;

		flip !== undefined && this.initWithFlipY(flip);
    },

    /**
     * initializes the action with a set flipY.
     * 默认使用竖直翻转来初始化一个动作
     * @param {Boolean} flip
     * @return {Boolean}
     */
    initWithFlipY:function (flip) {
        this._flippedY = flip;
        return true;
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number}  dt
     */
    update:function (dt) {
        this.target.flippedY = this._flippedY;
    },

    /**
     * returns a reversed action.
     * 返回一个反向动作.
     * @return {cc.FlipY}
     */
    reverse:function () {
        return new cc.FlipY(!this._flippedY);
    },

    /**
   * to copy object with deep copy.
     * 对对象进行深拷贝
     * returns a clone of action.
     * 返回一个拷贝的动作
     * @return {cc.FlipY}
     */
    clone:function(){
        var action = new cc.FlipY();
        action.initWithFlipY(this._flippedY);
        return action;
    }
});

/**
 * Create a FlipY action to flip or unflip the target.
 * 为目标创建一个竖直翻转动作
 * @function
 * @param {Boolean} flip
 * @return {cc.FlipY}
 * @example
 * @举个例子
 * var flipYAction = cc.flipY(true);
 */
cc.flipY = function (flip) {
    return new cc.FlipY(flip);
};

/**
 * Please use cc.flipY instead
 * Create a FlipY action to flip or unflip the target
 * 为目标创建一个竖直翻转动作
 * @static
 * @静态方法
 * @deprecated since v3.0 <br /> Please use cc.flipY instead.
 * 在3.0版本之后请使用cc.flipY来替代
 * @param {Boolean} flip
 * @return {cc.FlipY}
 */
cc.FlipY.create = cc.flipY;

/**
 * Places the node in a certain position
 * 将节点放置在绝对坐标位置
 * @class
 * @extends cc.ActionInstant
 * @param {cc.Point|Number} pos
 * @param {Number} [y]
 * @example
 * @举个例子
 * var placeAction = new cc.Place(cc.p(200, 200));
 * var placeAction = new cc.Place(200, 200);
 */
cc.Place = cc.ActionInstant.extend(/** @lends cc.Place# */{
    _x: 0,
	_y: 0,

	/**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
     *构造函数，覆盖它之后请继承它的形式，别忘记在继承的"ctor"函数里调用 "this._super()"
	 * Creates a Place action with a position.
             * 使用坐标创建一个位置动作
	 * @param {cc.Point|Number} pos
	 * @param {Number} [y]
	 */
    ctor:function(pos, y){
        cc.FiniteTimeAction.prototype.ctor.call(this);
        this._x = 0;
	    this._y = 0;

		if (pos !== undefined) {
			if (pos.x !== undefined) {
				y = pos.y;
				pos = pos.x;
			}
			this.initWithPosition(pos, y);
		}
    },

    /**
     * Initializes a Place action with a position
     * 使用坐标初始化一个位置动作
     * @param {number} x
     * @param {number} y
     * @return {Boolean}
     */
    initWithPosition: function (x, y) {
        this._x = x;
        this._y = y;
        return true;
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number}  dt
     */
    update:function (dt) {
        this.target.setPosition(this._x, this._y);
    },

    /**
     * to copy object with deep copy.
     * 对对象进行深拷贝
     * returns a clone of action.
     * 返回一个拷贝的动作
     * @return {cc.Place}
     */
    clone:function(){
        var action = new cc.Place();
        action.initWithPosition(this._x, this._y);
        return action;
    }
});

/**
 * Creates a Place action with a position.
 * 使用坐标创建一个位置动作
 * @function
 * @param {cc.Point|Number} pos
 * @param {Number} [y]
 * @return {cc.Place}
 * @example
 * // example
 * //举个例子
 * var placeAction = cc.place(cc.p(200, 200));
 * var placeAction = cc.place(200, 200);
 */
cc.place = function (pos, y) {
    return new cc.Place(pos, y);
};

/**
 * Please use cc.place instead.
 * 请使用cc.place来替代
 * Creates a Place action with a position.
 * 用坐标创建一个位置动作
 * @static
 * @静态方法
 * @deprecated since v3.0 <br /> Please use cc.place instead.
 * 在3.0版本之后请使用cc.place来替代
 * @param {cc.Point|Number} pos
 * @param {Number} [y]
 * @return {cc.Place}
 */
cc.Place.create = cc.place;


/**
 * Calls a 'callback'.
 * 回调函数
 * @class
 * @extends cc.ActionInstant
 * @param {function} selector
 * @param {object|null} [selectorTarget]
 * @param {*|null} [data] data for function, it accepts all data types.
 * @param {*|null} 该参数接收所有类型
 * @example
 * // example
 * //举个例子
 * // CallFunc without data
 * //不带参数的回调
 * var finish = new cc.CallFunc(this.removeSprite, this);
 *
 * // CallFunc with data
 * //带参数的回调
 * var finish = new cc.CallFunc(this.removeFromParentAndCleanup, this,  true);
 */
cc.CallFunc = cc.ActionInstant.extend(/** @lends cc.CallFunc# */{
    _selectorTarget:null,
    _callFunc:null,
    _function:null,
    _data:null,

	/**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
    *构造函数，覆盖它之后请继承它的形式，别忘记在继承的"ctor"函数里调用 "this._super()"
	 * Creates a CallFunc action with the callback.
             * 用回调函数创建一个回调动作
	 * @param {function} selector
	 * @param {object|null} [selectorTarget]
	 * @param {*|null} [data] data for function, it accepts all data types.
             * @param {*|null} 该参数接收所有类型
	 */
    ctor:function(selector, selectorTarget, data){
        cc.FiniteTimeAction.prototype.ctor.call(this);

		if(selector !== undefined){
			if(selectorTarget === undefined)
				this.initWithFunction(selector);
			else this.initWithFunction(selector, selectorTarget, data);
		}
    },

    /**
     * Initializes the action with a function or function and its target
     * 用一个回调函数或者一个回调函数和它的目标来初始化回调动作
     * @param {function} selector
     * @param {object|Null} selectorTarget
     * @param {*|Null} [data] data for function, it accepts all data types.
     * @param {*|null} 该参数接收所有类型
     * @return {Boolean}
     */
    initWithFunction:function (selector, selectorTarget, data) {
	    if (selectorTarget) {
            this._data = data;
            this._callFunc = selector;
            this._selectorTarget = selectorTarget;
	    }
	    else if (selector)
		    this._function = selector;
        return true;
    },

    /**
     * execute the function.
     * 执行
     */
    execute:function () {
        if (this._callFunc != null)         //CallFunc, N, ND  //回调函数，带参和不带参
            this._callFunc.call(this._selectorTarget, this.target, this._data);
        else if(this._function)
            this._function.call(null, this.target);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number}  dt
     */
    update:function (dt) {
        this.execute();
    },

    /**
     * Get selectorTarget.
     * 获得selectorTarget
     * @return {object}
     */
    getTargetCallback:function () {
        return this._selectorTarget;
    },

    /**
     * Set selectorTarget.
     * 设置selectorTarget
     * @param {object} sel
     */
    setTargetCallback:function (sel) {
        if (sel != this._selectorTarget) {
            if (this._selectorTarget)
                this._selectorTarget = null;
            this._selectorTarget = sel;
        }
    },

    /**
     * to copy object with deep copy.
     * 对对象进行深拷贝
     * returns a clone of action.
     * 返回一个拷贝的动作
     * @return {cc.CallFunc}
     */
    clone:function(){
       var action = new cc.CallFunc();
        if(this._selectorTarget){
             action.initWithFunction(this._callFunc,  this._selectorTarget, this._data)
        }else if(this._function){
             action.initWithFunction(this._function);
        }
        return action;
    }
});

/**
 * Creates the action with the callback
 * 用回调函数创建一个回调动作
 * @function
 * @param {function} selector
 * @param {object|null} [selectorTarget]
 * @param {*|null} [data] data for function, it accepts all data types.
 * @param {*|null} 该参数接收所有类型
 * @return {cc.CallFunc}
 * @example
 * // example
 * //举个例子
 * // CallFunc without data
 * var finish = cc.callFunc(this.removeSprite, this);
 *
 * // CallFunc with data
 * var finish = cc.callFunc(this.removeFromParentAndCleanup, this._grossini,  true);
 */
cc.callFunc = function (selector, selectorTarget, data) {
    return new cc.CallFunc(selector, selectorTarget, data);
};

/**
 * Please use cc.callFunc instead.
 * 请使用cc.callFunc来替代
 * Creates the action with the callback.
 * 用回调函数创建一个回调动作
 * @static
 * @静态方法
 * @deprecated since v3.0 <br /> Please use cc.callFunc instead.
 * @在3.0版本之后请使用cc.hide来替代
 * @param {function} selector
 * @param {object|null} [selectorTarget]
 * @param {*|null} [data] data for function, it accepts all data types.
 * @param {*|null} 该参数接收所有类型
 * @return {cc.CallFunc}
 */
cc.CallFunc.create = cc.callFunc;

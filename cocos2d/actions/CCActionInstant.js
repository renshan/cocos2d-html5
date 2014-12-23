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
 * 瞬间（即时）动作是立刻执行的动作, 它们没有持续时间
 * CCIntervalAction 动作
 * @class
 * @extends cc.FiniteTimeAction
 */
cc.ActionInstant = cc.FiniteTimeAction.extend(/** @lends cc.ActionInstant# */{
    /**
     * 如果动作已经完成则返回true
     * @return {Boolean}
     */
    isDone:function () {
        return true;
    },

    /**
     * 这个方法每一帧都会被调用, 参数dt为两帧之间的时间间隔(单位秒) <br />
     * 除非你知道正在做什么否则不要重载这个方法.
     * @param {Number} dt
     */
    step:function (dt) {
        this.update(1);
    },

    /**
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number} dt
     */
    update:function (dt) {
        //什么都不做
    },

    /**
     * 返回一个反向动作. <br />
     * 举个例子: <br />
     * - 一个动作如果从x轴坐标的0移到100. <br />
     * - 那么它的反向动作就将是从x轴坐标的100移到0.
     * - 将被重写
     * @returns {cc.Action}
     */
    reverse:function(){
        return this.clone();
    },

    /**
     * 对对象进行深拷贝
     * 返回一个拷贝的动作
     * @return {cc.FiniteTimeAction}
     */
    clone:function(){
        return new cc.ActionInstant();
    }
});

/**
 * 显示节点
 * @class
 * @extends cc.ActionInstant
 */
cc.Show = cc.ActionInstant.extend(/** @lends cc.Show# */{

    /**
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number} dt
     */
    update:function (dt) {
        this.target.visible = true;
    },

    /**
     * 返回一个反向动作. <br />
     * 举个例子: <br />
     * - 一个动作如果从x轴坐标的0移到100. <br />
     * - 那么它的反向动作就将是从x轴坐标的100移到0.
     * - 将被重写
     * @returns {cc.Hide}
     */
    reverse:function () {
        return new cc.Hide();
    },

    /**
     * 对对象进行深拷贝
     * 返回一个拷贝的动作
     * @return {cc.FiniteTimeAction}
     */
    clone:function(){
        return new cc.Show();
    }
});

/**
 * 显示节点
 * @function
 * @return {cc.Show}
 * @example
 * //举个例子
 * var showAction = cc.show();
 */
cc.show = function () {
    return new cc.Show();
};

/**
 * 显示节点，请使用cc.show代替
 * @static
 * @deprecated 在3.0版本之后请使用cc.show来替代
 * @return {cc.Show}
 */
cc.Show.create = cc.show;

/**
 * 隐藏节点.
 * @class
 * @extends cc.ActionInstant
 */
cc.Hide = cc.ActionInstant.extend(/** @lends cc.Hide# */{

    /**
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number} dt
     */
    update:function (dt) {
        this.target.visible = false;
    },

    /**
     * 返回一个反向动作. <br />
     * 举个例子: <br />
     * - 一个动作如果从x轴坐标的0移到100. <br />
     * - 那么它的反向动作就将是从x轴坐标的100移到0.
     * - 将会被重写
     * @returns {cc.Show}
     */
    reverse:function () {
        return new cc.Show();
    },

    /**
     * 对对象进行深拷贝
     * 返回一个拷贝的动作
     * @return {cc.Hide}
     */
    clone:function(){
        return new cc.Hide();
    }
});

/**
 * 隐藏节点
 * @function
 * @return {cc.Hide}
 * @example
 * //举个例子
 * var hideAction = cc.hide();
 */
cc.hide = function () {
    return new cc.Hide();
};

/**
 * 隐藏节点，请使用cc.hide代替
 * @static
 * @deprecated 在3.0版本之后请使用cc.hide来替代
 * @return {cc.Hide}
 * @example
 * //举个例子
 * var hideAction = cc.hide();
 */
cc.Hide.create = cc.hide;

/**
 * 切换节点的可视属性
 * @class
 * @extends cc.ActionInstant
 */
cc.ToggleVisibility = cc.ActionInstant.extend(/** @lends cc.ToggleVisibility# */{

    /**
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number} dt
     */
    update:function (dt) {
        this.target.visible = !this.target.visible;
    },

    /**
     * 返回一个反向动作.
     * @returns {cc.ToggleVisibility}
     */
    reverse:function () {
        return new cc.ToggleVisibility();
    },

    /**
     * 对对象进行深拷贝
     * 返回一个拷贝的动作
     * @return {cc.ToggleVisibility}
     */
    clone:function(){
        return new cc.ToggleVisibility();
    }
});

/**
 * 切换节点的可视属性
 * @function
 * @return {cc.ToggleVisibility}
 * @example
 * //举个例子
 * var toggleVisibilityAction = cc.toggleVisibility();
 */
cc.toggleVisibility = function () {
    return new cc.ToggleVisibility();
};

/**
 * 切换节点的可视属性.请使用cc.toggleVisibility代替
 * @static
 * @deprecated 在3.0版本之后请使用 cc.toggleVisibility来替代
 * @return {cc.ToggleVisibility}
 */
cc.ToggleVisibility.create = cc.toggleVisibility;

/**
 * 下一帧销毁自己
 * @class
 * @extends cc.ActionInstant
 * @param {Boolean} [isNeedCleanUp=true]
 *
 * @example
 * //举个例子
 * var removeSelfAction = new cc.RemoveSelf(false);
 */
cc.RemoveSelf = cc.ActionInstant.extend({
     _isNeedCleanUp: true,

	/**
     	 * 构造函数, 覆盖它之后请继承它的形式, 别忘记在继承的"ctor"函数里调用 "this._super()"<br />
         * 创建一个可以销毁自己的对象，使用一个标记来记录是否在移除的时候需要被销毁
	 * @param {Boolean} [isNeedCleanUp=true]
	 */
    ctor:function(isNeedCleanUp){
        cc.FiniteTimeAction.prototype.ctor.call(this);

	    isNeedCleanUp !== undefined && this.init(isNeedCleanUp);
    },

    /**
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number} dt
     */
    update:function(dt){
        this.target.removeFromParent(this._isNeedCleanUp);
    },

    /**
     * 初始化节点，不要自己调用这个方法，你应该通过传参给构造函数来初始化它
     * @param isNeedCleanUp
     * @returns {boolean}
     */
    init:function(isNeedCleanUp){
        this._isNeedCleanUp = isNeedCleanUp;
        return true;
    },

    /**
     * 返回一个反向动作.
     */
    reverse:function(){
        return new cc.RemoveSelf(this._isNeedCleanUp);
    },

    /**
     * 对对象进行深拷贝
     * 返回一个拷贝的动作
     * @return {cc.RemoveSelf}
     */
    clone:function(){
        return new cc.RemoveSelf(this._isNeedCleanUp);
    }
});

/**
 * 创建一个可以销毁自己的对象，使用一个标记来记录是否在移除的时候需要被销毁
 * @function
 * @param {Boolean} [isNeedCleanUp=true]
 * @return {cc.RemoveSelf}
 *
 * @example
 * //举个例子
 * var removeSelfAction = cc.removeSelf();
 */
cc.removeSelf = function(isNeedCleanUp){
    return new cc.RemoveSelf(isNeedCleanUp);
};

/**
 * 请使用cc.removeSelf来代替
 * 创建一个可以销毁自己的对象，使用一个标记来记录是否在移除的时候需要被销毁
 * @static
 * @deprecated 在3.0版本之后请使用 cc.removeSelf来替代
 * @param {Boolean} [isNeedCleanUp=true]
 * @return {cc.RemoveSelf}
 */
cc.RemoveSelf.create = cc.removeSelf;

/**
 * 水平方向翻转精灵
 * @class
 * @extends cc.ActionInstant
 * @param {Boolean} 参数用来表示目标是否将被翻转
 *
 * @example
 * var flipXAction = new cc.FlipX(true);
 */
cc.FlipX = cc.ActionInstant.extend(/** @lends cc.FlipX# */{
    _flippedX:false,

	/**
       	 * 构造函数，覆盖它之后请继承它的形式，别忘记在继承的"ctor"函数里调用 "this._super()"
         * 创建一个可以销毁自己的对象，使用一个标记来记录是否在移除的时候需要被销毁
         * @param {Boolean} 参数用来表示目标是否要被翻转
	 */
    ctor:function(flip){
        cc.FiniteTimeAction.prototype.ctor.call(this);
        this._flippedX = false;
		flip !== undefined && this.initWithFlipX(flip);
    },

    /**
     * 默认使用水平翻转来初始化一个动作
     * @param {Boolean} flip
     * @return {Boolean}
     */
    initWithFlipX:function (flip) {
        this._flippedX = flip;
        return true;
    },

    /**
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number}  dt
     */
    update:function (dt) {
        this.target.flippedX = this._flippedX;
    },

    /**
     * 返回一个反向动作.
     * @return {cc.FlipX}
     */
    reverse:function () {
        return new cc.FlipX(!this._flippedX);
    },

    /**
     * 对对象进行深拷贝
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
 * 为目标创建一个水平翻转动作
 * @function
 * @param {Boolean} 参数用来表示目标是否要被翻转
 * @return {cc.FlipX}
 * @example
 * var flipXAction = cc.flipX(true);
 */
cc.flipX = function (flip) {
    return new cc.FlipX(flip);
};

/**
 * 请使用cc.flipX来代替
 * 为目标创建一个水平翻转动作
 * @static
 * @deprecated 在3.0版本之后请使用se cc.flipX来替代
 * @param {Boolean} 参数用来表示目标是否要被翻转
 * @return {cc.FlipX}
 */
cc.FlipX.create = cc.flipX;

/**
 * 竖直方向翻转精灵
 * @class
 * @extends cc.ActionInstant
 * @param {Boolean} flip
 * @example
 * var flipYAction = new cc.FlipY(true);
 */
cc.FlipY = cc.ActionInstant.extend(/** @lends cc.FlipY# */{
    _flippedY:false,

	/**
    	 *构造函数，覆盖它之后请继承它的形式，别忘记在继承的"ctor"函数里调用 "this._super()"
	 * 为目标创建一个竖直翻转动作
	 * @param {Boolean} flip
	 */
    ctor: function(flip){
        cc.FiniteTimeAction.prototype.ctor.call(this);
        this._flippedY = false;

		flip !== undefined && this.initWithFlipY(flip);
    },

    /**
     * 默认使用竖直翻转来初始化一个动作
     * @param {Boolean} flip
     * @return {Boolean}
     */
    initWithFlipY:function (flip) {
        this._flippedY = flip;
        return true;
    },

    /**
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number}  dt
     */
    update:function (dt) {
        this.target.flippedY = this._flippedY;
    },

    /**
     * 返回一个反向动作.
     * @return {cc.FlipY}
     */
    reverse:function () {
        return new cc.FlipY(!this._flippedY);
    },

    /**
     * 对对象进行深拷贝
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
 * 为目标创建一个竖直翻转动作
 * @function
 * @param {Boolean} flip
 * @return {cc.FlipY}
 * @example
 * var flipYAction = cc.flipY(true);
 */
cc.flipY = function (flip) {
    return new cc.FlipY(flip);
};

/**
 * 请使用cc.flipY替代
 * 为目标创建一个竖直翻转动作
 * @static
 * @deprecated 在3.0版本之后请使用cc.flipY来替代
 * @param {Boolean} flip
 * @return {cc.FlipY}
 */
cc.FlipY.create = cc.flipY;

/**
 * 将节点放置在绝对坐标位置
 * @class
 * @extends cc.ActionInstant
 * @param {cc.Point|Number} pos
 * @param {Number} [y]
 * @example
 * var placeAction = new cc.Place(cc.p(200, 200));
 * var placeAction = new cc.Place(200, 200);
 */
cc.Place = cc.ActionInstant.extend(/** @lends cc.Place# */{
    _x: 0,
	_y: 0,

	/**
     	 *构造函数，覆盖它之后请继承它的形式，别忘记在继承的"ctor"函数里调用 "this._super()"
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
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number}  dt
     */
    update:function (dt) {
        this.target.setPosition(this._x, this._y);
    },

    /**
     * 对对象进行深拷贝
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
 * 使用坐标创建一个位置动作
 * @function
 * @param {cc.Point|Number} pos
 * @param {Number} [y]
 * @return {cc.Place}
 * @example
 * //举个例子
 * var placeAction = cc.place(cc.p(200, 200));
 * var placeAction = cc.place(200, 200);
 */
cc.place = function (pos, y) {
    return new cc.Place(pos, y);
};

/**
 * 请使用cc.place来替代
 * 用坐标创建一个Place动作
 * @static
 * @deprecated 在3.0版本之后请使用cc.place来替代
 * @param {cc.Point|Number} pos
 * @param {Number} [y]
 * @return {cc.Place}
 */
cc.Place.create = cc.place;


/**
 * 调用回调函数
 * @class
 * @extends cc.ActionInstant
 * @param {function} selector
 * @param {object|null} [selectorTarget]
 * @param {*|null} [data] 该参数接收所有类型
 * @example
 * // 举个例子
 * // 不带参数的回调
 * var finish = new cc.CallFunc(this.removeSprite, this);
 *
 * // 带参数的回调
 * var finish = new cc.CallFunc(this.removeFromParentAndCleanup, this,  true);
 */
cc.CallFunc = cc.ActionInstant.extend(/** @lends cc.CallFunc# */{
    _selectorTarget:null,
    _callFunc:null,
    _function:null,
    _data:null,

	/**
    	 * 构造函数，覆盖它之后请继承它的形式，别忘记在继承的"ctor"函数里调用 "this._super()"
         * 用回调函数创建一个回调动作
	 * @param {function} selector
	 * @param {object|null} [selectorTarget]
	 * @param {*|null} [data] 该参数接收所有类型
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
     * 用一个回调函数或者一个回调函数和它的目标来初始化回调动作
     * @param {function} selector
     * @param {object|Null} selectorTarget
     * @param {*|Null} [data] 该参数接收所有类型
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
     * 执行这个函数
     */
    execute:function () {
        if (this._callFunc != null)         //CallFunc, N, ND （回调函数，带参和不带参）
            this._callFunc.call(this._selectorTarget, this.target, this._data);
        else if(this._function)
            this._function.call(null, this.target);
    },

    /**
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number}  dt
     */
    update:function (dt) {
        this.execute();
    },

    /**
     * 获得selectorTarget
     * @return {object}
     */
    getTargetCallback:function () {
        return this._selectorTarget;
    },

    /**
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
     * 对对象进行深拷贝
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
 * 用回调函数创建一个回调动作
 * @function
 * @param {function} selector
 * @param {object|null} [selectorTarget]
 * @param {*|null} [data] 该参数接收所有类型
 * @return {cc.CallFunc}
 * @example
 * // 举个例子
 * // 不带参数的回调
 * var finish = cc.callFunc(this.removeSprite, this);
 *
 * // 带参数的回调
 * var finish = cc.callFunc(this.removeFromParentAndCleanup, this._grossini,  true);
 */
cc.callFunc = function (selector, selectorTarget, data) {
    return new cc.CallFunc(selector, selectorTarget, data);
};

/**
 * 请使用cc.callFunc来替代
 * 用回调函数创建这个动作
 * @static
 * @deprecated 在3.0版本之后请使用cc.hide来替代
 * @param {function} selector
 * @param {object|null} [selectorTarget]
 * @param {*|null} [data] 该参数接收所有类型
 * @return {cc.CallFunc}
 */
cc.CallFunc.create = cc.callFunc;

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
 *
 * @class
 * @extends cc.Class
 */
cc.ActionTweenDelegate = cc.Class.extend(/** @lends cc.ActionTweenDelegate */{

    /**
     * Update Tween Action.
     * 更新Tween动作
     * @param value
     * @param key
     */
    updateTweenAction:function(value, key){}
});

/**
 * cc.ActionTween
 * cc.ActionTween is an action that lets you update any property of an object.
 * cc.ActionTween是一个可以让你更新的某个对象属性的动作
 * @class
 * @extends cc.ActionInterval
 * @example
 * //For example, if you want to modify the "width" property of a target from 200 to 300 in 2 seconds, then:
 * //例如:如果你想要让某个目标对象的宽度属性在2秒内从200变成300, 代码可以这样写
 *  var modifyWidth = cc.actionTween(2,"width",200,300)
 *  target.runAction(modifyWidth);
 * //Another example: cc.ScaleTo action could be rewriten using cc.PropertyAction:
 * //再一个例子: cc.ScaleTo 动作(一个改变对象大小的动作)可以通过 ActionTween 重写
 * // scaleA and scaleB are equivalents
 * //scaleA 和 scaleB 是等价的动作
 * var scaleA = cc.scaleTo(2,3);
 * var scaleB = cc.actionTween(2,"scale",1,3);
 * @param {Number} duration
 * @param {String} key
 * @param {Number} from
 * @param {Number} to
 */
cc.ActionTween = cc.ActionInterval.extend(/** @lends cc.ActionTween */{
    key:"",
    from:0,
    to:0,
    delta:0,

	/**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
    *构造函数，覆盖它之后请继承它的形式，别忘记在继承的"ctor"函数里调用 "this._super()"
	 * Creates an initializes the action with the property name (key), and the from and to parameters.
             * 由参数name(key),from和其他参数初始化一个动作
	 * @param {Number} duration
	 * @param {String} key
	 * @param {Number} from
	 * @param {Number} to
	 */
    ctor:function(duration, key, from, to){
        cc.ActionInterval.prototype.ctor.call(this);
        this.key = "";

		to !== undefined && this.initWithDuration(duration, key, from, to);
    },

    /**
     * initializes the action with the property name (key), and the from and to parameters.
     * 由参数name(key),from和其他参数初始化一个动作
     * @param {Number} duration
     * @param {String} key
     * @param {Number} from
     * @param {Number} to
     * @return {Boolean}
     */
    initWithDuration:function (duration, key, from, to) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this.key = key;
            this.to = to;
            this.from = from;
            return true;
        }
        return false;
    },

    /**
     * Start this tween with target.
     * 对目标进行tween动作
     * @param {cc.ActionTweenDelegate} target
     */
    startWithTarget:function (target) {
        if(!target || !target.updateTweenAction)
            throw "cc.ActionTween.startWithTarget(): target must be non-null, and target must implement updateTweenAction function";
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this.delta = this.to - this.from;
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.
     * 每帧之前调用一次.参数dt是每帧之间间隙的秒数
     * @param {Number}  dt
     */
    update:function (dt) {
        this.target.updateTweenAction(this.to - this.delta * (1 - dt), this.key);
    },

    /**
     * returns a reversed action.
     * 返回一个反向动作
     * @return {cc.ActionTween}
     */
    reverse:function () {
        return new cc.ActionTween(this.duration, this.key, this.to, this.from);
    },

    /**
     * to copy object with deep copy.
     * 对对象进行深拷贝
     * returns a clone of action.
     * 返回一个拷贝的动作
     * @return {cc.ActionTween}
     */
    clone:function(){
        var action = new cc.ActionTween();
        action.initWithDuration(this._duration, this.key, this.from, this.to);
        return action;
    }
});

/**
 * Creates an initializes the action with the property name (key), and the from and to parameters.
 * 由参数name(key),from和其他参数初始化一个动作
 * @function
 * @param {Number} duration
 * @param {String} key
 * @param {Number} from
 * @param {Number} to
 * @return {cc.ActionTween}
 */
cc.actionTween = function (duration, key, from, to) {
    return new cc.ActionTween(duration, key, from, to);
};

/**
 * Please use cc.actionTween instead.
 * 请使用cc.actionTween来替代
 * Creates an initializes the action with the property name (key), and the from and to parameters.
 * 由参数name(key),from和其他参数初始化一个动作
 * @static
 * @静态方法
 * @deprecated since v3.0 <br /> Please use cc.actionTween instead.
 * @在3.0版本之后请使用cc.actionTween来替代
 * @param {Number} duration
 * @param {String} key
 * @param {Number} from
 * @param {Number} to
 * @return {cc.ActionTween}
 */
cc.ActionTween.create = cc.actionTween;

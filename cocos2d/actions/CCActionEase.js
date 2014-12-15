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
 * Base class for Easing actions                                             缓动Action的基类
 * @class
 * @extends cc.ActionInterval
 * @param {cc.ActionInterval} action
 *
 * @deprecated since v3.0 Does not recommend the use of the base object.    v3.0之后不建设使用这个基类
 *
 * @example
 * var moveEase = new cc.ActionEase(action);
 */
cc.ActionEase = cc.ActionInterval.extend(/** @lends cc.ActionEase# */{
    _inner:null,

	/**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />     构造函数, 如果要覆盖并去扩展这个函数, 记得调用this._super()在ctor的函数中<br/>
	 * creates the action of ActionEase.        创建一个ActionEase
	 * @param {cc.ActionInterval} action
	 */
    ctor: function (action) {
        cc.ActionInterval.prototype.ctor.call(this);
        action && this.initWithAction(action);
    },

    /**
     * initializes the action                  初始化这个动作
     *
     * @param {cc.ActionInterval} action
     * @return {Boolean}
     */
    initWithAction:function (action) {
        if(!action)
            throw "cc.ActionEase.initWithAction(): action must be non nil";

        if (this.initWithDuration(action.getDuration())) {
            this._inner = action;
            return true;
        }
        return false;
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.ActionEase}
     */
    clone:function(){
       var action = new cc.ActionEase();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * called before the action start. It will also set the target.   在Action执行前调用, 去设置目标对象
     *
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._inner.startWithTarget(this.target);
    },

    /**
     * Stop the action.     停止这个Aciton
     */
    stop:function () {
        this._inner.stop();
        cc.ActionInterval.prototype.stop.call(this);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        this._inner.update(dt);
    },

    /**
     * Create new action to original operation effect opposite. <br />      创建一个新的Action与原始的效果 <br/>
     * For example: <br />                                                  例如: <br />
     * - The action will be x coordinates of 0 move to 100. <br />          - 这个Action在x轴上从0到100
     * - The reversed action will be x of 100 move to 0.                    - 反转Action会从100到0
     * - Will be rewritten                                                  - 会被重写
     * @return {cc.ActionEase}
     */
    reverse:function () {
        return new cc.ActionEase(this._inner.reverse());
    },

    /**
     * Get inner Action.           获取内部Action
     *
     * @return {cc.ActionInterval}
     */
    getInnerAction:function(){
       return this._inner;
    }
});

/**
 * creates the action of ActionEase                                       创建一个ActionEase
 *
 * @param {cc.ActionInterval} action
 * @return {cc.ActionEase}
 * @example
 * // example                     //例如
 * var moveEase = cc.actionEase(action);
 */
cc.actionEase = function (action) {
    return new cc.ActionEase(action);
};

/**
 * Please use cc.actionEase instead                  请使用cc.actionEase代替
 * creates the action of ActionEase                  创建一个ActionEase
 *
 * @param {cc.ActionInterval} action
 * @return {cc.ActionEase}
 * @static
 * @deprecated since v3.0 please use cc.actionEase(action) instead.   从v3.0之后请使用cc.actionEase(action)代替
 */
cc.ActionEase.create = cc.actionEase;

/**
 * Base class for Easing actions with rate parameters                 使用比例系数缓动Action的基类
 *
 * @class
 * @extends cc.ActionEase
 * @param {cc.ActionInterval} action
 * @param {Number} rate
 *
 * @deprecated since v3.0 please cc.easeRateAction(action, 3.0);      从v3.0之后请使用  cc.easeRateAction(action, 3.0);
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseRateAction.create(action, 3.0);
 * //The new usage      新用法
 * var moveEaseRateAction = cc.easeRateAction(action, 3.0);
 */
cc.EaseRateAction = cc.ActionEase.extend(/** @lends cc.EaseRateAction# */{
    _rate:0,

	/**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />     构造函数, 如果要覆盖并去扩展这个函数, 记得调用this._super()在ctor的函数中<br/>
	 * Creates the action with the inner action and the rate parameter.  使用比例系数与一个内建的Action, 创建一个Action
	 * @param {cc.ActionInterval} action
	 * @param {Number} rate
	 */
    ctor: function(action, rate){
        cc.ActionEase.prototype.ctor.call(this);

		rate !== undefined && this.initWithAction(action, rate);
    },

    /**
     * set rate value for the action   设置这个Action的比值
     * @param {Number} rate
     */
    setRate:function (rate) {
        this._rate = rate;
    },

    /** get rate value for the action   获取当前Action的比值
     * @return {Number}
     */
    getRate:function () {
        return this._rate;
    },

    /**
     * Initializes the action with the inner action and the rate parameter   初始化使用比值与内部Action初始化当前Action
     * @param {cc.ActionInterval} action
     * @param {Number} rate
     * @return {Boolean}
     */
    initWithAction:function (action, rate) {
        if (cc.ActionEase.prototype.initWithAction.call(this, action)) {
            this._rate = rate;
            return true;
        }
        return false;
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseRateAction}
     */
    clone:function(){
        var action = new cc.EaseRateAction();
        action.initWithAction(this._inner.clone(), this._rate);
        return action;
    },

    /**
     * Create new action to original operation effect opposite. <br />      创建一个新的Action与原始的效果 <br/>
     * For example: <br />                                                  例如: <br />
     * - The action will be x coordinates of 0 move to 100. <br />          - 这个Action在x轴上从0到100
     * - The reversed action will be x of 100 move to 0.                    - 反转Action会从100到0
     * - Will be rewritten                                                  - 会被重写
     * @return {cc.EaseRateAction}
     */

    reverse:function () {
        return new cc.EaseRateAction(this._inner.reverse(), 1 / this._rate);
    }
});

/**
 * Creates the action with the inner action and the rate parameter.  使用比例系数与一个内建的Action, 创建一个Action
 *
 * @param {cc.ActionInterval} action
 * @param {Number} rate
 * @return {cc.EaseRateAction}
 * @example
 * // example                     //例如
 * var moveEaseRateAction = cc.easeRateAction(action, 3.0);
 */
cc.easeRateAction = function (action, rate) {
    return new cc.EaseRateAction(action, rate);
};

/**
 * Please use cc.easeRateAction instead. <br />
 * Creates the action with the inner action and the rate parameter.  使用比例系数与一个内建的Action, 创建一个Action
 *
 * @param {cc.ActionInterval} action
 * @param {Number} rate
 * @return {cc.EaseRateAction}
 * @static
 * @deprecated since v3.0 please use cc.easeRateAction(action, rate)
 * @example
 * //The old usage       //旧用法
 * cc.EaseRateAction.create(action, 3.0);
 * //The new usage      新用法
 * var moveEaseRateAction = cc.easeRateAction(action, 3.0);
 */
cc.EaseRateAction.create = cc.easeRateAction;

/**
 * cc.EaseIn action with a rate. From slow to fast.
 *
 * @class
 * @extends cc.EaseRateAction
 *
 * @deprecated since v3.0 please use action.easing(cc.easeIn(3));   从v3.0这后请使用action.easing(cc.easeIn(3));
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseIn.create(action, 3);
 * //The new usage      新用法
 * action.easing(cc.easeIn(3.0));
 */
cc.EaseIn = cc.EaseRateAction.extend(/** @lends cc.EaseIn# */{

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        this._inner.update(Math.pow(dt, this._rate));
    },

    /**
     * Create a cc.easeIn action. Opposite with the original motion trajectory.               与反转原Action的轨迹的轨迹
     * @return {cc.EaseIn}
     */
    reverse:function () {
        return new cc.EaseIn(this._inner.reverse(), 1 / this._rate);
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseIn}
     */
    clone:function(){
        var action = new cc.EaseIn();
        action.initWithAction(this._inner.clone(), this._rate);
        return action;
    }
});

/**
 * Creates the action with the inner action and the rate parameter.  使用比例系数与一个内建的Action, 创建一个Action <br />
 * From slow to fast.                                                从慢到快
 *
 * @static
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeIn(3))  从v3.0之后<br/>请使用action.easing(cc.easeIn(3))代替
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseIn.create(action, 3);
 * //The new usage      新用法
 * action.easing(cc.easeIn(3.0));
 *
 * @param {cc.ActionInterval} action
 * @param {Number} rate
 * @return {cc.EaseIn}
 */
cc.EaseIn.create = function (action, rate) {
    return new cc.EaseIn(action, rate);
};

/**
 * Creates the action easing object with the rate parameter. <br />    使用比值创建一个缓动对象<br/>
 * From slow to fast.                                                  从慢到快
 *
 * @function
 * @param {Number} rate
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeIn(3.0));
 */
cc.easeIn = function (rate) {
    return {
        _rate: rate,
        easing: function (dt) {
            return Math.pow(dt, this._rate);
        },
        reverse: function(){
            return cc.easeIn(1 / this._rate);
        }
    };
};

/**
 * cc.EaseOut action with a rate. From fast to slow.               有一个比值的cc.EaseOut. 从快到慢
 *
 * @class
 * @extends cc.EaseRateAction
 *
 * @deprecated since v3.0 please use action.easing(cc.easeOut(3))   从v3.0之后使用action.easing(cc.easeOut(3))
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseOut.create(action, 3);
 * //The new usage      新用法
 * action.easing(cc.easeOut(3.0));
 */
cc.EaseOut = cc.EaseRateAction.extend(/** @lends cc.EaseOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        this._inner.update(Math.pow(dt, 1 / this._rate));
    },

    /**
     * Create a cc.easeIn action. Opposite with the original motion trajectory.               与反转原Action的轨迹
     * @return {cc.EaseOut}
     */
    reverse:function () {
        return new cc.EaseOut(this._inner.reverse(), 1 / this._rate);
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseOut}
     */
    clone:function(){
        var action = new cc.EaseOut();
        action.initWithAction(this._inner.clone(),this._rate);
        return action;
    }
});

/**
 * Creates the action with the inner action and the rate parameter.  使用比例系数与一个内建的Action, 创建一个Action <br />
 * From fast to slow.
 *
 * @static
 * @deprecated since v3.0 <br /> Please use cc.easeOut instead.      从v3.0之后<br/>使用cc.easeOut
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseOut.create(action, 3);
 * //The new usage      //新用法
 * action.easing(cc.easeOut(3.0));
 *
 * @param {cc.ActionInterval} action
 * @param {Number} rate
 * @return {cc.EaseOut}
 */
cc.EaseOut.create = function (action, rate) {
    return new cc.EaseOut(action, rate);
};

/**
 * Creates the action easing object with the rate parameter. <br />    使用比值创建一个缓动对象<br/>
 * From fast to slow.
 *
 * @function
 * @param {Number} rate
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeOut(3.0));
 */
cc.easeOut = function (rate) {
    return {
        _rate: rate,
        easing: function (dt) {
            return Math.pow(dt, 1 / this._rate);
        },
        reverse: function(){
            return cc.easeOut(1 / this._rate)
        }
    };
};

/**
 * cc.EaseInOut action with a rate. <br /> 使用比值的cc.EaseInOut<br/>
 * Slow to fast then to slow.              慢快慢
 * @class
 * @extends cc.EaseRateAction
 *
 * @deprecated since v3.0 please use action.easing(cc.easeInOut(3.0)) 从v3.0之后<br/>请使用action.easing(cc.easeInOut(3))代替
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseInOut.create(action, 3);
 * //The new usage      //新用法
 * action.easing(cc.easeInOut(3.0));
 */
cc.EaseInOut = cc.EaseRateAction.extend(/** @lends cc.EaseInOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        dt *= 2;
        if (dt < 1)
            this._inner.update(0.5 * Math.pow(dt, this._rate));
        else
            this._inner.update(1.0 - 0.5 * Math.pow(2 - dt, this._rate));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseInOut}
     */
    clone:function(){
        var action = new cc.EaseInOut();
        action.initWithAction(this._inner.clone(), this._rate);
        return action;
    },

    /**
     * Create a cc.EaseInOut action. Opposite with the original motion trajectory.               与反转原Action的轨迹
     * @return {cc.EaseInOut}
     */
    reverse:function () {
        return new cc.EaseInOut(this._inner.reverse(), this._rate);
    }
});

/**
 * Creates the action with the inner action and the rate parameter.  使用比例系数与一个内建的Action, 创建一个Action
 * Slow to fast then to slow.                                        慢快慢
 * @static
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeInOut(3.0))   从v3.0</br>之后使用action.easing(cc.easeInOut(3.0))
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseInOut.create(action, 3);
 * //The new usage      //新用法
 * action.easing(cc.easeInOut(3.0));
 *
 * @param {cc.ActionInterval} action
 * @param {Number} rate
 * @return {cc.EaseInOut}
 */
cc.EaseInOut.create = function (action, rate) {
    return new cc.EaseInOut(action, rate);
};

/**
 * Creates the action easing object with the rate parameter. <br />    使用比值创建一个缓动对象<br/>
 * Slow to fast then to slow.                                          慢快慢
 * @function
 * @param {Number} rate
 * @return {Object}
 *
 * @example
 * //The new usage      //新用法
 * action.easing(cc.easeInOut(3.0));
 */
cc.easeInOut = function (rate) {
    return {
        _rate: rate,
        easing: function (dt) {
            dt *= 2;
            if (dt < 1)
                return 0.5 * Math.pow(dt, this._rate);
            else
                return 1.0 - 0.5 * Math.pow(2 - dt, this._rate);
        },
        reverse: function(){
            return cc.easeInOut(this._rate);
        }
    };
};

/**
 * cc.EaseExponentialIn. Slow to Fast. <br />                     cc.EaseExponentialIn, 从慢到快<br />
 * Reference easeInExpo: <br />                                   参考easeInExpo:<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 please action.easing(cc.easeExponentialIn()) 从v3.0之后<br/>请使用action.easing(cc.easeExponentialIn(3))代替
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseExponentialIn.create(action);
 * //The new usage      //新用法
 * action.easing(cc.easeExponentialIn());
 */
cc.EaseExponentialIn = cc.ActionEase.extend(/** @lends cc.EaseExponentialIn# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        this._inner.update(dt === 0 ? 0 : Math.pow(2, 10 * (dt - 1)));
    },

    /**
     * Create a cc.EaseExponentialOut action. Opposite with the original motion trajectory.               创建一个EaseExponentialOut, 反转原Action
     * @return {cc.EaseExponentialOut}
     */
    reverse:function () {
        return new cc.EaseExponentialOut(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseExponentialIn}
     */
    clone:function(){
        var action = new cc.EaseExponentialIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/**
 * Creates the action easing object with the rate parameter. <br />    使用比值创建一个缓动对象<br/>
 * Reference easeInExpo: <br />                                        参考easeInExpo<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeExponentialIn())    从v3.0之后<br/>请使用action.easing(cc.easeExponentialIn())
 * @param {cc.ActionInterval} action
 * @return {cc.EaseExponentialIn}
 *
 * @example
 * //The old usage      //旧用法
 * cc.EaseExponentialIn.create(action);
 * //The new usage      //新用法
 * action.easing(cc.easeExponentialIn());
 */
cc.EaseExponentialIn.create = function (action) {
    return new cc.EaseExponentialIn(action);
};

cc._easeExponentialInObj = {
    easing: function(dt){
        return dt === 0 ? 0 : Math.pow(2, 10 * (dt - 1));
    },
    reverse: function(){
        return cc._easeExponentialOutObj;
    }
};

/**
 * Creates the action easing object with the rate parameter. <br />    使用比值创建一个缓动对象<br/>
 * Reference easeInExpo: <br />                                        参考easeInExpo:<br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeExponentialIn());
 */
cc.easeExponentialIn = function(){
    return cc._easeExponentialInObj;
};

/**
 * cc.EaseExponentialOut. <br />
 * Reference easeOutExpo: <br />        参考easeOutExpo:<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeExponentialOut())  从v3.0之后请使用action.easing(cc.easeExponentialOut(3))代替
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseExponentialOut.create(action);
 * //The new usage      //新用法
 * action.easing(cc.easeExponentialOut());
 */
cc.EaseExponentialOut = cc.ActionEase.extend(/** @lends cc.EaseExponentialOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        this._inner.update(dt == 1 ? 1 : (-(Math.pow(2, -10 * dt)) + 1));
    },

    /**
     * Create a cc.EaseExponentialIn action. Opposite with the original motion trajectory.               与反转原Action的轨迹
     * @return {cc.EaseExponentialIn}
     */
    reverse:function () {
        return new cc.EaseExponentialIn(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseExponentialOut}
     */
    clone:function(){
        var action = new cc.EaseExponentialOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/**
 * Creates the action easing object with the rate parameter. <br />    使用比值创建一个缓动对象<br/>
 * Reference easeOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeExponentialOut())  从v3.0之后<br/>请使用action.easing(cc.easeExponentialOut())代替
 * @param {cc.ActionInterval} action
 * @return {Object}
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseExponentialOut.create(action);
 * //The new usage      //新用法
 * action.easing(cc.easeExponentialOut());
 */
cc.EaseExponentialOut.create = function (action) {
    return new cc.EaseExponentialOut(action);
};

cc._easeExponentialOutObj = {
    easing: function(dt){
        return dt == 1 ? 1 : (-(Math.pow(2, -10 * dt)) + 1);
    },
    reverse: function(){
        return cc._easeExponentialInObj;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 *
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeExponentialOut());
 */
cc.easeExponentialOut = function(){
    return cc._easeExponentialOutObj;
};

/**
 * Ease Exponential InOut. <br />
 * Reference easeInOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 *
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeExponentialInOut)  从v3.0之后<br/>请使用action.easing(cc.easeExponentialOut)代替
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseExponentialInOut.create(action);
 * //The new usage      //新用法
 * action.easing(cc.easeExponentialInOut());
 */
cc.EaseExponentialInOut = cc.ActionEase.extend(/** @lends cc.EaseExponentialInOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        if( dt != 1 && dt !== 0) {
            dt *= 2;
            if (dt < 1)
                dt = 0.5 * Math.pow(2, 10 * (dt - 1));
            else
                dt = 0.5 * (-Math.pow(2, -10 * (dt - 1)) + 2);
        }
        this._inner.update(dt);
    },

    /**
     * Create a cc.EaseExponentialInOut action. Opposite with the original motion trajectory.               与反转原Action的轨迹
     * @return {cc.EaseExponentialInOut}
     */
    reverse:function () {
        return new cc.EaseExponentialInOut(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseExponentialInOut}
     */
    clone:function(){
        var action = new cc.EaseExponentialInOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/**
 * creates an EaseExponentialInOut action. <br />
 * Reference easeInOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeExponentialInOut)   从v3.0之后<br/>请使用action.easing(cc.easeExponentialInOut)代替
 * @param {cc.ActionInterval} action
 * @return {cc.EaseExponentialInOut}
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseExponentialInOut.create(action);
 * //The new usage      //新用法
 * action.easing(cc.easeExponentialInOut());
 */
cc.EaseExponentialInOut.create = function (action) {
    return new cc.EaseExponentialInOut(action);
};

cc._easeExponentialInOutObj = {
    easing: function(dt){
        if( dt !== 1 && dt !== 0) {
            dt *= 2;
            if (dt < 1)
                return 0.5 * Math.pow(2, 10 * (dt - 1));
            else
                return 0.5 * (-Math.pow(2, -10 * (dt - 1)) + 2);
        }
        return dt;
    },
    reverse: function(){
        return cc._easeExponentialInOutObj;
    }
};

/**
 * creates an EaseExponentialInOut action easing object. <br />
 * Reference easeInOutExpo: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeExponentialInOut());
 */
cc.easeExponentialInOut = function(){
    return cc._easeExponentialInOutObj;
};

/**
 * Ease Sine In. <br />
 * Reference easeInSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeSineIn()) 从v3.0之后请使用action.easing(cc.easeSineIn)代替
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseSineIn.create(action);
 * //The new usage      //新用法
 * action.easing(cc.easeSineIn());
 */
cc.EaseSineIn = cc.ActionEase.extend(/** @lends cc.EaseSineIn# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        dt = dt===0 || dt===1 ? dt : -1 * Math.cos(dt * Math.PI / 2) + 1;
        this._inner.update(dt);
    },

    /**
     * Create a cc.EaseSineOut action. Opposite with the original motion trajectory.               与反转原Action的轨迹
     * @return {cc.EaseSineOut}
     */
    reverse:function () {
        return new cc.EaseSineOut(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseSineIn}
     */
    clone:function(){
        var action = new cc.EaseSineIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/**
 * creates an EaseSineIn action. <br />
 * Reference easeInSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeSineIn())  从v3.0之后<br/>请使用action.easing(cc.easeSineIn())代替
 * @param {cc.ActionInterval} action
 * @return {cc.EaseSineIn}
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseSineIn.create(action);
 * //The new usage      //新用法
 * action.easing(cc.easeSineIn());
 */
cc.EaseSineIn.create = function (action) {
    return new cc.EaseSineIn(action);
};

cc._easeSineInObj = {
    easing: function(dt){
        return (dt===0 || dt===1) ? dt : -1 * Math.cos(dt * Math.PI / 2) + 1;
    },
    reverse: function(){
        return cc._easeSineOutObj;
    }
};
/**
 * creates an EaseSineIn action. <br />
 * Reference easeInSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeSineIn());
 */
cc.easeSineIn = function(){
    return cc._easeSineInObj;
};

/**
 * Ease Sine Out. <br />
 * Reference easeOutSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeSineOut())             从v3.0之后<br/>请使用action.easing(cc.easeSineOut())代替
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseSineOut.create(action);
 * //The new usage      //新用法
 * action.easing(cc.easeSineOut());
 */
cc.EaseSineOut = cc.ActionEase.extend(/** @lends cc.EaseSineOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        dt = dt===0 || dt===1 ? dt : Math.sin(dt * Math.PI / 2);
        this._inner.update(dt);
    },

    /**
     * Create a cc.EaseSineIn action. Opposite with the original motion trajectory.               与反转原Action的轨迹
     * @return {cc.EaseSineIn}
     */
    reverse:function () {
        return new cc.EaseSineIn(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseSineOut}
     */
    clone:function(){
        var action = new cc.EaseSineOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/**
 * Creates an EaseSineOut action. <br />
 * Reference easeOutSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeSineOut())   从v3.0之后<br/>请使用action.easing(cc.easeSineOut())代替
 * @param {cc.ActionInterval} action
 * @return {cc.EaseSineOut}
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseSineOut.create(action);
 * //The new usage      //新用法
 * action.easing(cc.easeSineOut());
 */
cc.EaseSineOut.create = function (action) {
    return new cc.EaseSineOut(action);
};

cc._easeSineOutObj = {
    easing: function(dt){
        return (dt===0 || dt==1) ? dt : Math.sin(dt * Math.PI / 2);
    },
    reverse: function(){
        return cc._easeSineInObj;
    }
};

/**
 * Creates an EaseSineOut action easing object. <br />
 * Reference easeOutSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeSineOut());
 */
cc.easeSineOut = function(){
    return cc._easeSineOutObj;
};

/**
 * EaseSineInOut. <br />
 * Reference easeInOutSine: <br />                                  参考easeInOutSine<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeSineInOut())   从v3.0之后, 使用action.easing(cc.easeSineInOut())
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseSineInOut.create(action);
 * //The new usage      //新用法
 * action.easing(cc.easeSineInOut());
 */
cc.EaseSineInOut = cc.ActionEase.extend(/** @lends cc.EaseSineInOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        dt = dt===0 || dt===1 ? dt : -0.5 * (Math.cos(Math.PI * dt) - 1);
        this._inner.update(dt);
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseSineInOut}
     */
    clone:function(){
        var action = new cc.EaseSineInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a cc.EaseSineInOut action. Opposite with the original motion trajectory.               与反转原Action的轨迹
     * @return {cc.EaseSineInOut}
     */
    reverse:function () {
        return new cc.EaseSineInOut(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                       创建Action <br/>
 * Reference easeInOutSine: <br />                                  参考easeInOutSine:
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 * @param {cc.ActionInterval} action
 * @return {cc.EaseSineInOut}
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeSineInOut())    从v3.0之后 <br /> 请使用action.easing(cc.easeSineInOut())
 *
 * @example
 * //The old usage       //旧用法   
 * cc.EaseSineInOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeSineInOut());
 */
cc.EaseSineInOut.create = function (action) {
    return new cc.EaseSineInOut(action);
};

cc._easeSineInOutObj = {
    easing: function(dt){
        return (dt === 0 || dt === 1) ? dt : -0.5 * (Math.cos(Math.PI * dt) - 1);
    },
    reverse: function(){
        return cc._easeSineInOutObj;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeInOutSine: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeSineInOut());
 */
cc.easeSineInOut = function(){
    return cc._easeSineInOutObj;
};

/**
 * Ease Elastic abstract class.
 * @class
 * @extends cc.ActionEase
 * @param {cc.ActionInterval} action
 * @param {Number} [period=0.3]
 *
 * @deprecated since v3.0 Does not recommend the use of the base object.   v3.0之后不建议使用这个基类
 */
cc.EaseElastic = cc.ActionEase.extend(/** @lends cc.EaseElastic# */{
    _period: 0.3,

	/**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />     构造函数, 如果要覆盖并去扩展这个函数, 记得调用this._super()在ctor的函数中<br/>
     * Creates the action with the inner action and the period in radians (default is 0.3).    使用内部Action和弧度创建Action(默认是0.3)
	 * @param {cc.ActionInterval} action
	 * @param {Number} [period=0.3]
	 */
    ctor:function(action, period){
        cc.ActionEase.prototype.ctor.call(this);

		action && this.initWithAction(action, period);
    },

    /**
     * get period of the wave in radians. default is 0.3
     * @return {Number}
     */
    getPeriod:function () {
        return this._period;
    },

    /**
     * set period of the wave in radians.
     * @param {Number} period
     */
    setPeriod:function (period) {
        this._period = period;
    },

    /**
     * Initializes the action with the inner action and the period in radians (default is 0.3)  使用弧度(默认是0.3)与内部Action初始化这个Action
     * @param {cc.ActionInterval} action
     * @param {Number} [period=0.3]
     * @return {Boolean}
     */
    initWithAction:function (action, period) {
        cc.ActionEase.prototype.initWithAction.call(this, action);
        this._period = (period == null) ? 0.3 : period;
        return true;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的轨迹的反转
     * Will be overwrite.                                                   将会被重写
     * @return {null}
     */
    reverse:function () {
        cc.log("cc.EaseElastic.reverse(): it should be overridden in subclass.");
        return null;
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseElastic}
     */
    clone:function(){
        var action = new cc.EaseElastic();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

/**
 * Creates the action with the inner action and the period in radians (default is 0.3).    使用内部Action和弧度创建Action(默认是0.3)
 * @static
 * @deprecated since v3.0 Does not recommend the use of the base object.
 * @param {cc.ActionInterval} action
 * @param {Number} [period=0.3]
 * @return {cc.EaseElastic}
 */
cc.EaseElastic.create = function (action, period) {
    return new cc.EaseElastic(action, period);
};

/**
 * Ease Elastic In action. <br />
 * Reference easeInElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action. @warning这个函数一个双射函数.这些Actions像一个队列一样, 可能会产生一些未知的效果
 * @class
 * @extends cc.EaseElastic
 *
 * @deprecated since v3.0 please use action.easing(cc.easeElasticIn())     从v3.0之后请使用action.easing(cc.easeElasticIn()) 
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseElasticIn.create(action, period);
 * //The new usage     // 新用法
 * action.easing(cc.easeElasticIn(period));
 */
cc.EaseElasticIn = cc.EaseElastic.extend(/** @lends cc.EaseElasticIn# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var newT = 0;
        if (dt === 0 || dt === 1) {
            newT = dt;
        } else {
            var s = this._period / 4;
            dt = dt - 1;
            newT = -Math.pow(2, 10 * dt) * Math.sin((dt - s) * Math.PI * 2 / this._period);
        }
        this._inner.update(newT);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseElasticOut}
     */
    reverse:function () {
        return new cc.EaseElasticOut(this._inner.reverse(), this._period);
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseElasticIn}
     */
    clone:function(){
        var action = new cc.EaseElasticIn();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

/**
 * Creates the action with the inner action and the period in radians (default is 0.3).    使用内部Action和弧度创建Action(默认是0.3) <br />
 * Reference easeInElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeElasticIn(period))   从v3.0之后<br/>请使用action.easing(cc.easeElasticIn(period)) 
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseElasticIn.create(action, period);
 * //The new usage     // 新用法
 * action.easing(cc.easeElasticIn(period));
 *
 * @param {cc.ActionInterval} action
 * @param {Number} [period=0.3]
 * @return {cc.EaseElasticIn}
 */
cc.EaseElasticIn.create = function (action, period) {
    return new cc.EaseElasticIn(action, period);
};

//default ease elastic in object (period = 0.3)
cc._easeElasticInObj = {
   easing:function(dt){
       if (dt === 0 || dt === 1)
           return dt;
       dt = dt - 1;
       return -Math.pow(2, 10 * dt) * Math.sin((dt - (0.3 / 4)) * Math.PI * 2 / 0.3);
   },
    reverse:function(){
        return cc._easeElasticOutObj;
    }
};

/**
 * Creates the action easing obejct with the period in radians (default is 0.3). <br />   使用弧度创建一个缓动对象(默认是0.3)<br />
 * Reference easeInElastic: <br />                                                        参考easeInElastic<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @param {Number} [period=0.3]
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeElasticIn(3.0));
 */
cc.easeElasticIn = function (period) {
    if(period && period !== 0.3){
        return {
            _period: period,
            easing: function (dt) {
                if (dt === 0 || dt === 1)
                    return dt;
                dt = dt - 1;
                return -Math.pow(2, 10 * dt) * Math.sin((dt - (this._period / 4)) * Math.PI * 2 / this._period);
            },
            reverse:function () {
                return cc.easeElasticOut(this._period);
            }
        };
    }
    return cc._easeElasticInObj;
};

/**
 * Ease Elastic Out action. <br />
 * Reference easeOutElastic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.
 @warning这个函数一个双射函数.这些Actions像一个队列一样, 可能会产生一些未知的效果
 * @class
 * @extends cc.EaseElastic
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeElasticOut(period))  从v3.0之后<br/>请使用action.easing(cc.easeElasticOut(period)) 
 * 
 * @example
 * //The old usage       //旧用法
 * cc.EaseElasticOut.create(action, period);
 * //The new usage     // 新用法
 * action.easing(cc.easeElasticOut(period));
 */
cc.EaseElasticOut = cc.EaseElastic.extend(/** @lends cc.EaseElasticOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var newT = 0;
        if (dt === 0 || dt == 1) {
            newT = dt;
        } else {
            var s = this._period / 4;
            newT = Math.pow(2, -10 * dt) * Math.sin((dt - s) * Math.PI * 2 / this._period) + 1;
        }

        this._inner.update(newT);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseElasticIn}
     */
    reverse:function () {
        return new cc.EaseElasticIn(this._inner.reverse(), this._period);
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseElasticOut}
     */
    clone:function(){
        var action = new cc.EaseElasticOut();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

/**
 * Creates the action with the inner action and the period in radians (default is 0.3).    使用内部Action和弧度创建Action(默认是0.3) <br />
 * Reference easeOutElastic: <br />                                                        参考easeOutElastic:<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeElasticOut(period))       从v3.0之后<br/>请使用action.easing(cc.easeElasticOut(period))
 * @param {cc.ActionInterval} action
 * @param {Number} [period=0.3]
 * @return {cc.EaseElasticOut}
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseElasticOut.create(action, period);
 * //The new usage     // 新用法
 * action.easing(cc.easeElasticOut(period));
 */
cc.EaseElasticOut.create = function (action, period) {
    return new cc.EaseElasticOut(action, period);
};

//default ease elastic out object (period = 0.3)    // 默认ease elastic out对象
cc._easeElasticOutObj = {
    easing: function (dt) {
        return (dt === 0 || dt === 1) ? dt : Math.pow(2, -10 * dt) * Math.sin((dt - (0.3 / 4)) * Math.PI * 2 / 0.3) + 1;
    },
    reverse:function(){
        return cc._easeElasticInObj;
    }
};
/**
 * Creates the action easing object with the period in radians (default is 0.3). <br /> 创建使用弧度一个缓动Action对象(默认是0.3)<br/>
 * Reference easeOutElastic: <br />                                                     参考easeOutElastic<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @param {Number} [period=0.3]
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeElasticOut(3.0));
 */
cc.easeElasticOut = function (period) {
    if(period && period !== 0.3){
        return {
            _period: period,
            easing: function (dt) {
                return (dt === 0 || dt === 1) ? dt : Math.pow(2, -10 * dt) * Math.sin((dt - (this._period / 4)) * Math.PI * 2 / this._period) + 1;
            },
            reverse:function(){
                return cc.easeElasticIn(this._period);
            }
        };
    }
    return cc._easeElasticOutObj;
};

/**
 * Ease Elastic InOut action. <br />
 * Reference easeInOutElastic: <br /> 参考easeInOutElastic<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.  @warning这个函数一个双射函数.这些Actions像一个队列一样, 可能会产生一些未知的效果
 * @class
 * @extends cc.EaseElastic
 *
 * @deprecated since v3.0 please use action.easing(cc.easeElasticInOut())   从v3.0之后请使用action.easing(cc.easeElasticInOut())
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseElasticInOut.create(action, period);
 * //The new usage     // 新用法
 * action.easing(cc.easeElasticInOut(period));
 */
cc.EaseElasticInOut = cc.EaseElastic.extend(/** @lends cc.EaseElasticInOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var newT = 0;
        var locPeriod = this._period;
        if (dt === 0 || dt == 1) {
            newT = dt;
        } else {
            dt = dt * 2;
            if (!locPeriod)
                locPeriod = this._period = 0.3 * 1.5;

            var s = locPeriod / 4;
            dt = dt - 1;
            if (dt < 0)
                newT = -0.5 * Math.pow(2, 10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod);
            else
                newT = Math.pow(2, -10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod) * 0.5 + 1;
        }
        this._inner.update(newT);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseElasticInOut}
     */
    reverse:function () {
        return new cc.EaseElasticInOut(this._inner.reverse(), this._period);
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseElasticInOut}
     */
    clone:function(){
        var action = new cc.EaseElasticInOut();
        action.initWithAction(this._inner.clone(), this._period);
        return action;
    }
});

/**
 * Creates the action with the inner action and the period in radians (default is 0.3).<br />    使用内部Action和弧度创建Action(默认是0.3) <br />
 * Reference easeInOutElastic: <br />                                                            参考easeInOutElastic:<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeElasticInOut(period))           从v3.0之后 <br /> 请使用action.easing(cc.easeElasticInOut(period))
 * @param {cc.ActionInterval} action
 * @param {Number} [period=0.3]
 * @return {cc.EaseElasticInOut}
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseElasticInOut.create(action, period);
 * //The new usage     // 新用法
 * action.easing(cc.easeElasticInOut(period));
 */
cc.EaseElasticInOut.create = function (action, period) {
    return new cc.EaseElasticInOut(action, period);
};

/**
 * Creates the action easing object with the period in radians (default is 0.3). <br />      创建使用弧度一个缓动Action对象(默认是0.3)<br/>
 * Reference easeInOutElastic: <br />                                                        参考easeInOutElastic<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @param {Number} [period=0.3]
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeElasticInOut(3.0));
 */
cc.easeElasticInOut = function (period) {
    period = period || 0.3;
    return {
        _period: period,
        easing: function (dt) {
            var newT = 0;
            var locPeriod = this._period;
            if (dt === 0 || dt === 1) {
                newT = dt;
            } else {
                dt = dt * 2;
                if (!locPeriod)
                    locPeriod = this._period = 0.3 * 1.5;
                var s = locPeriod / 4;
                dt = dt - 1;
                if (dt < 0)
                    newT = -0.5 * Math.pow(2, 10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod);
                else
                    newT = Math.pow(2, -10 * dt) * Math.sin((dt - s) * Math.PI * 2 / locPeriod) * 0.5 + 1;
            }
            return newT;
        },
        reverse: function(){
            return cc.easeElasticInOut(this._period);
        }
    };
};

/**
 * cc.EaseBounce abstract class.                                            cc.EaseBounce抽象类
 *
 * @deprecated since v3.0 Does not recommend the use of the base object. 从3.0之后不建议使用这个基类
 *
 * @class
 * @extends cc.ActionEase
 */
cc.EaseBounce = cc.ActionEase.extend(/** @lends cc.EaseBounce# */{
    /**
     * @param {Number} time1
     * @return {Number}
     */
    bounceTime:function (time1) {
        if (time1 < 1 / 2.75) {
            return 7.5625 * time1 * time1;
        } else if (time1 < 2 / 2.75) {
            time1 -= 1.5 / 2.75;
            return 7.5625 * time1 * time1 + 0.75;
        } else if (time1 < 2.5 / 2.75) {
            time1 -= 2.25 / 2.75;
            return 7.5625 * time1 * time1 + 0.9375;
        }

        time1 -= 2.625 / 2.75;
        return 7.5625 * time1 * time1 + 0.984375;
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseBounce}
     */
    clone:function(){
        var action = new cc.EaseBounce();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转
     * @return {cc.EaseBounce}
     */
    reverse:function () {
        return new cc.EaseBounce(this._inner.reverse());
    }
});

/**
 * Creates an ease bounce action.
 * @static
 * @deprecated since v3.0 Does not recommend the use of the base object. 从3.0之后不建议使用这个基类
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBounce}
 */
cc.EaseBounce.create = function (action) {
    return new cc.EaseBounce(action);
};

/**
 * cc.EaseBounceIn action. <br />
 * Eased bounce effect at the beginning.     以弹性缓动效果开始
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.  @warning这个函数一个双射函数.这些Actions像一个队列一样, 可能会产生一些未知的效果
 * @class
 * @extends cc.EaseBounce
 *
 * @deprecated since v3.0 please use action.easing(cc.easeBounceIn()) 从v3.0之后<br/>请使用action.easing(cc.easeBounceIn()) 
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseBounceIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeBounceIn());
 */
cc.EaseBounceIn = cc.EaseBounce.extend(/** @lends cc.EaseBounceIn# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var newT = 1 - this.bounceTime(1 - dt);
        this._inner.update(newT);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseBounceOut}
     */
    reverse:function () {
        return new cc.EaseBounceOut(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseBounceIn}
     */
    clone:function(){
        var action = new cc.EaseBounceIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Eased bounce effect at the beginning.     以弹性缓动效果开始
 * @static
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeBounceIn()) 从v3.0之后<br/>请使用action.easing(cc.easeBounceIn())
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBounceIn}
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseBounceIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeBounceIn());
 */
cc.EaseBounceIn.create = function (action) {
    return new cc.EaseBounceIn(action);
};

cc._bounceTime = function (time1) {
    if (time1 < 1 / 2.75) {
        return 7.5625 * time1 * time1;
    } else if (time1 < 2 / 2.75) {
        time1 -= 1.5 / 2.75;
        return 7.5625 * time1 * time1 + 0.75;
    } else if (time1 < 2.5 / 2.75) {
        time1 -= 2.25 / 2.75;
        return 7.5625 * time1 * time1 + 0.9375;
    }

    time1 -= 2.625 / 2.75;
    return 7.5625 * time1 * time1 + 0.984375;
};

cc._easeBounceInObj = {
    easing: function(dt){
        return 1 - cc._bounceTime(1 - dt);
    },
    reverse: function(){
        return cc._easeBounceOutObj;
    }
};

/**
 * Creates the action easing object. <br />
 * Eased bounce effect at the beginning.     以弹性缓动效果开始
 * @function
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeBounceIn());
 */
cc.easeBounceIn = function(){
    return cc._easeBounceInObj;
};

/**
 * cc.EaseBounceOut action. <br />
 * Eased bounce effect at the ending.   以弹性缓动效果结束
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.  @warning这个函数一个双射函数.这些Actions像一个队列一样, 可能会产生一些未知的效果
 * @class
 * @extends cc.EaseBounce
 *    
 * @deprecated since v3.0 please use action.easing(cc.easeBounceOut())     从v3.0之后<br/>请使用action.easing(cc.easeBounceOut())
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseBounceOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeBounceOut());
 */
cc.EaseBounceOut = cc.EaseBounce.extend(/** @lends cc.EaseBounceOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var newT = this.bounceTime(dt);
        this._inner.update(newT);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseBounceIn}
     */
    reverse:function () {
        return new cc.EaseBounceIn(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action.       返回这个对像的克隆
     *
     * @returns {cc.EaseBounceOut}
     */
    clone:function(){
        var action = new cc.EaseBounceOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Eased bounce effect at the ending.                        以弹性缓动效果结束
 * @static
 * @deprecated since v3.0 please use action.easing(cc.easeBounceOut()) 从v3.0之后请使用action.easing(cc.easeBounceOut())
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBounceOut}
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseBounceOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeBounceOut());
 */
cc.EaseBounceOut.create = function (action) {
    return new cc.EaseBounceOut(action);
};

cc._easeBounceOutObj = {
    easing: function(dt){
        return cc._bounceTime(dt);
    },
    reverse:function () {
        return cc._easeBounceInObj;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Eased bounce effect at the ending.   以弹性缓动效果结束
 * @function
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeBounceOut());
 */
cc.easeBounceOut = function(){
    return cc._easeBounceOutObj;
};

/**
 * cc.EaseBounceInOut action. <br />
 * Eased bounce effect at the begining and ending.     开始和结束都是弹性缓动效果
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.  @warning这个函数一个双射函数.这些Actions像一个队列一样, 可能会产生一些未知的效果
 * @class
 * @extends cc.EaseBounce
 *
 * @deprecated since v3.0 <br /> Please use acton.easing(cc.easeBounceInOut()) 从v3.0之后<br/>请使用action.easing(cc.easeBounceInOut())
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseBounceInOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeBounceInOut());
 */
cc.EaseBounceInOut = cc.EaseBounce.extend(/** @lends cc.EaseBounceInOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var newT = 0;
        if (dt < 0.5) {
            dt = dt * 2;
            newT = (1 - this.bounceTime(1 - dt)) * 0.5;
        } else {
            newT = this.bounceTime(dt * 2 - 1) * 0.5 + 0.5;
        }
        this._inner.update(newT);
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseBounceInOut}
     */
    clone:function(){
        var action = new cc.EaseBounceInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseBounceInOut}
     */
    reverse:function () {
        return new cc.EaseBounceInOut(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Eased bounce effect at the begining and ending.     开始和结束都是弹性缓动效果
 * @static
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeBounceInOut())    从v3.0之后<br/>请使用action.easing(cc.easeBounceInOut())
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBounceInOut}
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseBounceInOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeBounceInOut());
 */
cc.EaseBounceInOut.create = function (action) {
    return new cc.EaseBounceInOut(action);
};

cc._easeBounceInOutObj = {
    easing: function (time1) {
        var newT;
        if (time1 < 0.5) {
            time1 = time1 * 2;
            newT = (1 - cc._bounceTime(1 - time1)) * 0.5;
        } else {
            newT = cc._bounceTime(time1 * 2 - 1) * 0.5 + 0.5;
        }
        return newT;
    },
    reverse: function(){
        return cc._easeBounceInOutObj;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Eased bounce effect at the begining and ending.     开始和结束都是弹性缓动效果
 * @function
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeBounceInOut());
 */
cc.easeBounceInOut = function(){
    return cc._easeBounceInOutObj;
};

/**
 * cc.EaseBackIn action. <br />
 * In the opposite direction to move slowly, and then accelerated to the right direction.                                                    相反的方向移动缓慢, 加速度向右
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.  @warning这个函数一个双射函数.这些Actions像一个队列一样, 可能会产生一些未知的效果
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeBackIn())     从v3.0之后请使用action.easing(cc.easeBackIn())
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseBackIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeBackIn());
 */
cc.EaseBackIn = cc.ActionEase.extend(/** @lends cc.EaseBackIn# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var overshoot = 1.70158;
        dt = dt===0 || dt==1 ? dt : dt * dt * ((overshoot + 1) * dt - overshoot);
        this._inner.update(dt);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseBackOut}
     */
    reverse:function () {
        return new cc.EaseBackOut(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseBackIn}
     */
    clone:function(){
        var action = new cc.EaseBackIn();
        action.initWithAction(this._inner.clone());
        return action;
    }
});


/**
 * Creates the cc.EaseBackIn. <br />
 * In the opposite direction to move slowly, and then accelerated to the right direction.  相反的方向移动缓慢, 加速度向右
 * @static
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeBackIn())                 从v3.0之后<br/>请使用action.easing(cc.easeBackIn())
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBackIn}
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseBackIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeBackIn());
 */
cc.EaseBackIn.create = function (action) {
    return new cc.EaseBackIn(action);
};

cc._easeBackInObj = {
    easing: function (time1) {
        var overshoot = 1.70158;
        return (time1===0 || time1===1) ? time1 : time1 * time1 * ((overshoot + 1) * time1 - overshoot);
    },
    reverse: function(){
        return cc._easeBackOutObj;
    }
};

/**
 * Creates the action easing object. <br />                                                 创建一个缓动Action对象<br/>
 * In the opposite direction to move slowly, and then accelerated to the right direction.   相反的方向移动缓慢, 加速度向右
 * @function
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeBackIn());
 */
cc.easeBackIn = function(){
    return cc._easeBackInObj;
};

/**
 * cc.EaseBackOut action. <br />
 * Fast moving more than the finish, and then slowly back to the finish.  比结束的时候速度快,缓慢结束
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.  @warning这个函数一个双射函数.这些Actions像一个队列一样, 可能会产生一些未知的效果
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 please use action.easing(cc.easeBackOut());         从v3.0之后请使用action.easing(cc.easeBackOut())
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseBackOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeBackOut());
 */
cc.EaseBackOut = cc.ActionEase.extend(/** @lends cc.EaseBackOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var overshoot = 1.70158;
        dt = dt - 1;
        this._inner.update(dt * dt * ((overshoot + 1) * dt + overshoot) + 1);
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseBackIn}
     */
    reverse:function () {
        return new cc.EaseBackIn(this._inner.reverse());
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseBackOut}
     */
    clone:function(){
        var action = new cc.EaseBackOut();
        action.initWithAction(this._inner.clone());
        return action;
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Fast moving more than the finish, and then slowly back to the finish. 比结束的时候速度快,缓慢结束
 * @static
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeBackOut());    从v3.0<br/>之后请使用action.easing(cc.easeBackOut())
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBackOut}
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseBackOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeBackOut());
 */
cc.EaseBackOut.create = function (action) {
    return new cc.EaseBackOut(action);
};

cc._easeBackOutObj = {
    easing: function (time1) {
        var overshoot = 1.70158;
        time1 = time1 - 1;
        return time1 * time1 * ((overshoot + 1) * time1 + overshoot) + 1;
    },
    reverse: function(){
        return cc._easeBackInObj;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Fast moving more than the finish, and then slowly back to the finish.  比结束的时候速度快,缓慢结束
 * @function
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeBackOut());
 */
cc.easeBackOut = function(){
    return cc._easeBackOutObj;
};

/**
 * cc.EaseBackInOut action. <br />
 * Begining of cc.EaseBackIn. Ending of cc.EaseBackOut.    以EaseBackIn开始, 以EaseBackOut结束
 * @warning This action doesn't use a bijective function. Actions like Sequence might have an unexpected result when used with this action.  @warning这个函数一个双射函数.这些Actions像一个队列一样, 可能会产生一些未知的效果
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeBackInOut())         从v3.0<br/>之后请使用action.easing(cc.easeBackOut())
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseBackInOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeBackInOut());
 */
cc.EaseBackInOut = cc.ActionEase.extend(/** @lends cc.EaseBackInOut# */{
    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update:function (dt) {
        var overshoot = 1.70158 * 1.525;
        dt = dt * 2;
        if (dt < 1) {
            this._inner.update((dt * dt * ((overshoot + 1) * dt - overshoot)) / 2);
        } else {
            dt = dt - 2;
            this._inner.update((dt * dt * ((overshoot + 1) * dt + overshoot)) / 2 + 1);
        }
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseBackInOut}
     */
    clone:function(){
        var action = new cc.EaseBackInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseBackInOut}
     */
    reverse:function () {
        return new cc.EaseBackInOut(this._inner.reverse());
    }
});


/**
 * Creates the action. <br />                                创建Action <br/>
 * Begining of cc.EaseBackIn. Ending of cc.EaseBackOut.     以EaseBackIn开始,以EaseBackOut结束
 * @static
 * @param {cc.ActionInterval} action
 * @return {cc.EaseBackInOut}
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeBackInOut()) 从v3.0之后<br/>请使用action.easing(cc.easeBackInOut())
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseBackInOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeBackInOut());
 */
cc.EaseBackInOut.create = function (action) {
    return new cc.EaseBackInOut(action);
};

cc._easeBackInOutObj = {
    easing: function (time1) {
        var overshoot = 1.70158 * 1.525;
        time1 = time1 * 2;
        if (time1 < 1) {
            return (time1 * time1 * ((overshoot + 1) * time1 - overshoot)) / 2;
        } else {
            time1 = time1 - 2;
            return (time1 * time1 * ((overshoot + 1) * time1 + overshoot)) / 2 + 1;
        }
    },
    reverse: function(){
        return cc._easeBackInOutObj;
    }
};

/**
 * Creates the action easing object. <br />              创建一个缓动Action对象<br/>
 * Begining of cc.EaseBackIn. Ending of cc.EaseBackOut.  以EaseBackIn开始, 以EaseBackOut结束
 * @function
 * @return {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeBackInOut());
 */
cc.easeBackInOut = function(){
    return cc._easeBackInOutObj;
};

/**
 * cc.EaseBezierAction action. <br />
 * Manually set a 4 order Bessel curve. <br />            手动的设置4个贝赛尔曲线的点. <br />
 * According to the set point, calculate the trajectory.  根据设置的点去计算弧度
 * @class
 * @extends cc.ActionEase
 * @param {cc.Action} action
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeBezierAction())  v3.0之后<br/>请使用action.easing(cc.easeBezierAction());
 *
 * @example
 * //The old usage       //旧用法
 * var action = cc.EaseBezierAction.create(action);
 * action.setBezierParamer(0.5, 0.5, 1.0, 1.0);
 * //The new usage     // 新用法
 * action.easing(cc.easeBezierAction(0.5, 0.5, 1.0, 1.0));
 */
cc.EaseBezierAction = cc.ActionEase.extend(/** @lends cc.EaseBezierAction# */{

    _p0: null,
    _p1: null,
    _p2: null,
    _p3: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />     构造函数, 如果要覆盖并去扩展这个函数, 记得调用this._super()在ctor的函数中<br/>
     * Initialization requires the application of Bessel curve of action.
     * @param {cc.Action} action
     */
    ctor: function(action){
        cc.ActionEase.prototype.ctor.call(this, action);
    },

    _updateTime: function(a, b, c, d, t){
        return (Math.pow(1-t,3) * a + 3*t*(Math.pow(1-t,2))*b + 3*Math.pow(t,2)*(1-t)*c + Math.pow(t,3)*d );
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        var t = this._updateTime(this._p0, this._p1, this._p2, this._p3, dt);
        this._inner.update(t);
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseBezierAction}
     */
    clone: function(){
        var action = new cc.EaseBezierAction();
        action.initWithAction(this._inner.clone());
        action.setBezierParamer(this._p0, this._p1, this._p2, this._p3);
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseBezierAction}
     */
    reverse: function(){
        var action = new cc.EaseBezierAction(this._inner.reverse());
        action.setBezierParamer(this._p3, this._p2, this._p1, this._p0);
        return action;
    },

    /**
     * Set of 4 reference point
     * @param p0
     * @param p1
     * @param p2
     * @param p3
     */
    setBezierParamer: function(p0, p1, p2, p3){
        this._p0 = p0 || 0;
        this._p1 = p1 || 0;
        this._p2 = p2 || 0;
        this._p3 = p3 || 0;
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * After creating the cc.EaseBezierAction, also need to manually call setBezierParamer. <br /> 创建EaseBezierAction之后, 需要手动的调用setBezierParamer<br/>
 * According to the set point, calculate the trajectory.
 * @static
 * @param action
 * @returns {cc.EaseBezierAction}
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeBezierAction())   v3.0之后<br/>请使用action.easing(cc.easeBezierAction());
 *
 * @example
 * //The old usage       //旧用法
 * var action = cc.EaseBezierAction.create(action);
 * action.setBezierParamer(0.5, 0.5, 1.0, 1.0);
 * //The new usage     // 新用法
 * action.easing(cc.easeBezierAction(0.5, 0.5, 1.0, 1.0));
 */
cc.EaseBezierAction.create = function(action){
    return new cc.EaseBezierAction(action);
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Into the 4 reference point. <br />
 * To calculate the motion curve.
 * @param {Number} p0 The first bezier parameter
 * @param {Number} p1 The second bezier parameter
 * @param {Number} p2 The third bezier parameter
 * @param {Number} p3 The fourth bezier parameter
 * @returns {Object}
 * @example
 * // example                     //例如
 * action.easing(cc.easeBezierAction(0.5, 0.5, 1.0, 1.0));
 */
cc.easeBezierAction = function(p0, p1, p2, p3){
    return {
        easing: function(time){
            return cc.EaseBezierAction.prototype._updateTime(p0, p1, p2, p3, time);
        },
        reverse: function(){
            return cc.easeBezierAction(p3, p2, p1, p0);
        }
    };
};

/**
 * cc.EaseQuadraticActionIn action. <br />
 * Reference easeInQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuadraticAction()) v3.0之后<br/>请使用action.easing(cc.easeQuadraticAction());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuadraticActionIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuadraticActionIn());
 */
cc.EaseQuadraticActionIn = cc.ActionEase.extend(/** @lends cc.EaseQuadraticActionIn# */{

    _updateTime: function(time){
        return Math.pow(time, 2);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseQuadraticActionIn}
     */
    clone: function(){
        var action = new cc.EaseQuadraticActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseQuadraticActionIn}
     */
    reverse: function(){
        return new cc.EaseQuadraticActionIn(this._inner.reverse());
    }

});

/**
 * Creates the cc.EaseQuadRaticActionIn. <br />
 * Reference easeInQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 * @param action
 * @returns {cc.EaseQuadraticActionIn}
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuadraticAction()) v3.0之后<br/>请使用action.easing(cc.easeQuadraticAction());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuadraticActionIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuadraticActionIn());
 */
cc.EaseQuadraticActionIn.create = function(action){
    return new cc.EaseQuadraticActionIn(action);
};

cc._easeQuadraticActionIn = {
    easing: cc.EaseQuadraticActionIn.prototype._updateTime,
    reverse: function(){
        return cc._easeQuadraticActionIn;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeInQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @returns {Object}
 * @example
 * //example       //例如
 * action.easing(cc.easeQuadraticActionIn());
 */
cc.easeQuadraticActionIn = function(){
    return cc._easeQuadraticActionIn;
};

/**
 * cc.EaseQuadraticActionIn action. <br />
 * Reference easeOutQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuadraticActionOut()) v3.0之后<br/>请使用action.easing(cc.easeQuadraticActionOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuadraticActionOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuadraticActionOut());
 */
cc.EaseQuadraticActionOut = cc.ActionEase.extend(/** @lends cc.EaseQuadraticActionOut# */{

    _updateTime: function(time){
        return -time*(time-2);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseQuadraticActionOut}
     */
    clone: function(){
        var action = new cc.EaseQuadraticActionOut();
        action.initWithAction();
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseQuadraticActionOut}
     */
    reverse: function(){
        return new cc.EaseQuadraticActionOut(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Reference easeOutQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 * @param action
 * @returns {cc.EaseQuadraticActionOut}
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuadraticActionOut()) v3.0之后<br/>请使用action.easing(cc.easeQuadraticActionOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuadraticActionOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuadraticActionOut());
 */
cc.EaseQuadraticActionOut.create = function(action){
    return new cc.EaseQuadraticActionOut(action);
};

cc._easeQuadraticActionOut = {
    easing: cc.EaseQuadraticActionOut.prototype._updateTime,
    reverse: function(){
        return cc._easeQuadraticActionOut;
    }
};
/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeOutQuad: <br />                参考easeOutQuad<br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example       //例如
 * action.easing(cc.easeQuadraticActionOut());
 */
cc.easeQuadraticActionOut = function(){
    return cc._easeQuadraticActionOut;
};

/**
 * cc.EaseQuadraticActionInOut action. <br />
 * Reference easeInOutQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuadraticActionInOut()) v3.0之后<br/>请使用action.easing(cc.easeQuadraticActionInOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuadraticActionInOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuadraticActionInOut());
 */
cc.EaseQuadraticActionInOut = cc.ActionEase.extend(/** @lends cc.EaseQuadraticActionInOut# */{
    _updateTime: function(time){
        var resultTime = time;
        time *= 2;
        if(time < 1){
            resultTime = time * time * 0.5;
        }else{
            --time;
            resultTime = -0.5 * ( time * ( time - 2 ) - 1);
        }
        return resultTime;
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseQuadraticActionInOut}
     */
    clone: function(){
        var action = new cc.EaseQuadraticActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseQuadraticActionInOut}
     */
    reverse: function(){
        return new cc.EaseQuadraticActionInOut(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Reference easeInOutQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuadraticActionInOut()) v3.0之后<br/>请使用action.easing(cc.easeQuadraticActionInOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuadraticActionInOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuadraticActionInOut());
 *
 * @param action
 * @returns {cc.EaseQuadraticActionInOut}
 */
cc.EaseQuadraticActionInOut.create = function(action){
    return new cc.EaseQuadraticActionInOut(action);
};

cc._easeQuadraticActionInOut = {
    easing: cc.EaseQuadraticActionInOut.prototype._updateTime,
    reverse: function(){
        return cc._easeQuadraticActionInOut;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeInOutQuad: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example       //例如
 * action.easing(cc.easeQuadraticActionInOut());
 */
cc.easeQuadraticActionInOut = function(){
    return cc._easeQuadraticActionInOut;
};

/**
 * cc.EaseQuarticActionIn action. <br />
 * Reference easeInQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuarticActionIn()); v3.0之后<br/>请使用action.easing(cc.easeQuarticActionIn());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuarticActionIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuarticActionIn());
 */
cc.EaseQuarticActionIn = cc.ActionEase.extend(/** @lends cc.EaseQuarticActionIn# */{
    _updateTime: function(time){
        return time * time * time * time;
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseQuarticActionIn}
     */
    clone: function(){
        var action = new cc.EaseQuarticActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseQuarticActionIn}
     */
    reverse: function(){
        return new cc.EaseQuarticActionIn(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Reference easeInQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuarticActionIn()); v3.0之后<br/>请使用action.easing(cc.easeQuarticActionIn());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuarticActionIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuarticActionIn());
 *
 * @param action
 * @returns {cc.EaseQuarticActionIn}
 */
cc.EaseQuarticActionIn.create = function(action){
    return new cc.EaseQuarticActionIn(action);
};

cc._easeQuarticActionIn = {
    easing: cc.EaseQuarticActionIn.prototype._updateTime,
    reverse: function(){
        return cc._easeQuarticActionIn;
    }
};
/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeIntQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example       //例如
 * action.easing(cc.easeQuarticActionIn());
 */
cc.easeQuarticActionIn = function(){
    return cc._easeQuarticActionIn;
};

/**
 * cc.EaseQuarticActionOut action. <br />
 * Reference easeOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.QuarticActionOut()); v3.0之后<br/>请使用action.easing(cc.QuarticActionOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuarticActionOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.EaseQuarticActionOut());
 */
cc.EaseQuarticActionOut = cc.ActionEase.extend(/** @lends cc.EaseQuarticActionOut# */{
    _updateTime: function(time){
        time -= 1;
        return -(time * time * time * time - 1);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseQuarticActionOut}
     */
    clone: function(){
        var action = new cc.EaseQuarticActionOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseQuarticActionOut}
     */
    reverse: function(){
        return new cc.EaseQuarticActionOut(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Reference easeOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.QuarticActionOut()); v3.0之后<br/>请使用action.easing(cc.QuarticActionOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuarticActionOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.EaseQuarticActionOut());
 *
 * @param action
 * @returns {cc.EaseQuarticActionOut}
 */
cc.EaseQuarticActionOut.create = function(action){
    return new cc.EaseQuarticActionOut(action);
};

cc._easeQuarticActionOut = {
    easing: cc.EaseQuarticActionOut.prototype._updateTime,
    reverse: function(){
        return cc._easeQuarticActionOut;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example       //例如
 * action.easing(cc.QuarticActionOut());
 */
cc.easeQuarticActionOut = function(){
    return cc._easeQuarticActionOut;
};

/**
 * cc.EaseQuarticActionInOut action. <br />
 * Reference easeInOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuarticActionInOut()); v3.0之后<br/>请使用action.easing(cc.easeQuarticActionInOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuarticActionInOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuarticActionInOut());
 */
cc.EaseQuarticActionInOut = cc.ActionEase.extend(/** @lends cc.EaseQuarticActionInOut# */{
    _updateTime: function(time){
        time = time*2;
        if (time < 1)
            return 0.5 * time * time * time * time;
        time -= 2;
        return -0.5 * (time * time * time * time - 2);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseQuarticActionInOut}
     */
    clone: function(){
        var action = new cc.EaseQuarticActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹 
     * @return {cc.EaseQuarticActionInOut}
     */
    reverse: function(){
        return new cc.EaseQuarticActionInOut(this._inner.reverse());
    }
});

/**
 * Creates the action.  <br />
 * Reference easeInOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuarticActionInOut()); v3.0之后<br/>请使用action.easing(cc.easeQuarticActionInOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuarticActionInOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuarticActionInOut());
 *
 * @param action
 * @returns {cc.EaseQuarticActionInOut}
 */
cc.EaseQuarticActionInOut.create = function(action){
    return new cc.EaseQuarticActionInOut(action);
};

cc._easeQuarticActionInOut = {
    easing: cc.EaseQuarticActionInOut.prototype._updateTime,
    reverse: function(){
        return cc._easeQuarticActionInOut;
    }
};
/**
 * Creates the action easing object.  <br />
 * Reference easeInOutQuart: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 */
cc.easeQuarticActionInOut = function(){
    return cc._easeQuarticActionInOut;
};

/**
 * cc.EaseQuinticActionIn action. <br />
 * Reference easeInQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuinticActionIn()); v3.0之后<br/>请使用action.easing(cc.easeQuinticActionIn());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuinticActionIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuinticActionIn());
 */
cc.EaseQuinticActionIn = cc.ActionEase.extend(/** @lends cc.EaseQuinticActionIn# */{
    _updateTime: function(time){
        return time * time * time * time * time;
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseQuinticActionIn}
     */
    clone: function(){
        var action = new cc.EaseQuinticActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseQuinticActionIn}
     */
    reverse: function(){
        return new cc.EaseQuinticActionIn(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Reference easeInQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuinticActionIn()); v3.0之后<br/>请使用action.easing(cc.easeQuinticActionIn());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuinticActionIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuinticActionIn());
 *
 * @param action
 * @returns {cc.EaseQuinticActionIn}
 */
cc.EaseQuinticActionIn.create = function(action){
    return new cc.EaseQuinticActionIn(action);
};

cc._easeQuinticActionIn = {
    easing: cc.EaseQuinticActionIn.prototype._updateTime,
    reverse: function(){
        return cc._easeQuinticActionIn;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeInQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example       //例如
 * action.easing(cc.easeQuinticActionIn());
 */
cc.easeQuinticActionIn = function(){
    return cc._easeQuinticActionIn;
};

/**
 * cc.EaseQuinticActionOut action. <br />
 * Reference easeQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuadraticActionOut()); v3.0之后<br/>请使用action.easing(cc.easeQuadraticActionOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuinticActionOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuadraticActionOut());
 */
cc.EaseQuinticActionOut = cc.ActionEase.extend(/** @lends cc.EaseQuinticActionOut# */{
    _updateTime: function(time){
        time -=1;
        return (time * time * time * time * time + 1);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseQuinticActionOut}
     */
    clone: function(){
        var action = new cc.EaseQuinticActionOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseQuinticActionOut}
     */
    reverse: function(){
        return new cc.EaseQuinticActionOut(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Reference easeOutQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuadraticActionOut()); v3.0之后<br/>请使用action.easing(cc.easeQuadraticActionOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuinticActionOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuadraticActionOut());
 *
 * @param action
 * @returns {cc.EaseQuinticActionOut}
 */
cc.EaseQuinticActionOut.create = function(action){
    return new cc.EaseQuinticActionOut(action);
};

cc._easeQuinticActionOut = {
    easing: cc.EaseQuinticActionOut.prototype._updateTime,
    reverse: function(){
        return cc._easeQuinticActionOut;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeOutQuint: <br />               参考easeOutQuint<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example       //例如
 * action.easing(cc.easeQuadraticActionOut());
 */
cc.easeQuinticActionOut = function(){
    return cc._easeQuinticActionOut;
};

/**
 * cc.EaseQuinticActionInOut action. <br />
 * Reference easeInOutQuint: <br />            参考easeInOutQuint<br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuinticActionInOut()); v3.0之后<br/>请使用action.easing(cc.easeQuinticActionInOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuinticActionInOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuinticActionInOut());
 */
cc.EaseQuinticActionInOut = cc.ActionEase.extend(/** @lends cc.EaseQuinticActionInOut# */{
    _updateTime: function(time){
        time = time*2;
        if (time < 1)
            return 0.5 * time * time * time * time * time;
        time -= 2;
        return 0.5 * (time * time * time * time * time + 2);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseQuinticActionInOut}
     */
    clone: function(){
        var action = new cc.EaseQuinticActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseQuinticActionInOut}
     */
    reverse: function(){
        return new cc.EaseQuinticActionInOut(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Reference easeInOutQuint: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeQuinticActionInOut());   v3.0之后<br/>请使用action.easing(cc.easeQuinticActionInOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseQuinticActionInOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeQuinticActionInOut());
 *
 * @param action
 * @returns {cc.EaseQuinticActionInOut}
 */
cc.EaseQuinticActionInOut.create = function(action){
    return new cc.EaseQuinticActionInOut(action);
};

cc._easeQuinticActionInOut = {
    easing: cc.EaseQuinticActionInOut.prototype._updateTime,
    reverse: function(){
        return cc._easeQuinticActionInOut;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeInOutQuint: <br />             参考easeInOutQuint<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example       //例如
 * action.easing(cc.easeQuinticActionInOut());
 */
cc.easeQuinticActionInOut = function(){
    return cc._easeQuinticActionInOut;
};

/**
 * cc.EaseCircleActionIn action. <br />
 * Reference easeInCirc: <br />                                     请使用easeInCirc<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCircleActionIn());   v3.0之后<br/> 请使用action.easing(cc.easeCircleActionIn());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseCircleActionIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeCircleActionIn());
 */
cc.EaseCircleActionIn = cc.ActionEase.extend(/** @lends cc.EaseCircleActionIn# */{
    _updateTime: function(time){
        return -1 * (Math.sqrt(1 - time * time) - 1);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseCircleActionIn}
     */
    clone: function(){
        var action = new cc.EaseCircleActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转
     * @return {cc.EaseCircleActionIn}
     */
    reverse: function(){
        return new cc.EaseCircleActionIn(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Reference easeInCirc: <br />                              参考easeInCirc<br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCircleActionIn());  v3.0之后<br/> 请使用action.easing(cc.easeCircleActionIn());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseCircleActionIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeCircleActionIn());
 *
 * @param action
 * @returns {cc.EaseCircleActionIn}
 */
cc.EaseCircleActionIn.create = function(action){
    return new cc.EaseCircleActionIn(action);
};

cc._easeCircleActionIn = {
    easing: cc.EaseCircleActionIn.prototype._updateTime,
    reverse: function(){
        return cc._easeCircleActionIn;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeInCirc: <br />                 参考easeInCirc<br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example       //例如
 * action.easing(cc.easeCircleActionIn());
 */
cc.easeCircleActionIn = function(){
    return cc._easeCircleActionIn;
};

/**
 * cc.EaseCircleActionOut action. <br />
 * Reference easeOutCirc: <br />                                     参考easeOutCirc<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCircleActionOut());  从v3.0之后<br/> 请使用 action.easing(cc.easeCircleActionOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseCircleActionOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeCircleActionOut());
 */
cc.EaseCircleActionOut = cc.ActionEase.extend(/** @lends cc.EaseCircleActionOut# */{
    _updateTime: function(time){
        time = time - 1;
        return Math.sqrt(1 - time * time);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseCircleActionOut}
     */
    clone: function(){
        var action = new cc.EaseCircleActionOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseCircleActionOut}
     */
    reverse: function(){
        return new cc.EaseCircleActionOut(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Reference easeOutCirc: <br />                             参考easeOutCirc<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCircleActionOut());  从v3.0之后<br/> 请使用action.easing(cc.easeCircleActionOut())代替
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseCircleActionOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeCircleActionOut());
 *
 * @param action
 * @returns {cc.EaseCircleActionOut}
 */
cc.EaseCircleActionOut.create = function(action){
    return new cc.EaseCircleActionOut(action);
};

cc._easeCircleActionOut = {
    easing: cc.EaseCircleActionOut.prototype._updateTime,
    reverse: function(){
        return cc._easeCircleActionOut;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeOutCirc: <br />                参考easeOutCirc<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example       //例如
 * actioneasing(cc.easeCircleActionOut());
 */
cc.easeCircleActionOut = function(){
    return cc._easeCircleActionOut;
};

/**
 * cc.EaseCircleActionInOut action. <br />
 * Reference easeInOutCirc: <br />               参考easeInOutCircd<br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCircleActionInOut()); v3.0之后<br/>请使用action.easing(cc.easeCircleActionInOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseCircleActionInOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeCircleActionInOut());
 */
cc.EaseCircleActionInOut = cc.ActionEase.extend(/** @lends cc.EaseCircleActionInOut# */{
    _updateTime: function(time){
        time = time * 2;
        if (time < 1)
            return -0.5 * (Math.sqrt(1 - time * time) - 1);
        time -= 2;
        return 0.5 * (Math.sqrt(1 - time * time) + 1);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseCircleActionInOut}
     */
    clone: function(){
        var action = new cc.EaseCircleActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转的轨迹
     * @return {cc.EaseCircleActionInOut}
     */
    reverse: function(){
        return new cc.EaseCircleActionInOut(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Reference easeInOutCirc: <br />                           参考easeInOutCirc<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCircleActionInOut());  从v3.0之后<br/> 请使用 action.easing(cc.easeCircleActionInOut())代替
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseCircleActionInOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeCircleActionInOut());
 *
 * @param action
 * @returns {cc.EaseCircleActionInOut}
 */
cc.EaseCircleActionInOut.create = function(action){
    return new cc.EaseCircleActionInOut(action);
};

cc._easeCircleActionInOut = {
    easing: cc.EaseCircleActionInOut.prototype._updateTime,
    reverse: function(){
        return cc._easeCircleActionInOut;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeInOutCirc: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example       //例如
 * action.easing(cc.easeCircleActionInOut());
 */
cc.easeCircleActionInOut = function(){
    return cc._easeCircleActionInOut;
};

/**
 * cc.EaseCubicActionIn action. <br />
 * Reference easeInCubic: <br />                                  参考easeInCubic:<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> action.easing(cc.easeCubicActionIn());   从v3.0<br/>之后请使用action.easing(cc.easeCubicActionIn())
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseCubicActionIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeCubicActionIn());
 */
cc.EaseCubicActionIn = cc.ActionEase.extend(/** @lends cc.EaseCubicActionIn# */{
    _updateTime: function(time){
        return time * time * time;
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseCubicActionIn}
     */
    clone: function(){
        var action = new cc.EaseCubicActionIn();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转
     * @return {cc.EaseCubicActionIn}
     */
    reverse: function(){
        return new cc.EaseCubicActionIn(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Reference easeInCubic: <br />                             参考easeInCubic:<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 *
 * @deprecated since v3.0 <br /> action.easing(cc.easeCubicActionIn());     从v3.0<br/>之后请使用action.easing(cc.easeCubicActionIn())
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseCubicActionIn.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeCubicActionIn());
 *
 * @param action
 * @returns {cc.EaseCubicActionIn}
 */
cc.EaseCubicActionIn.create = function(action){
    return new cc.EaseCubicActionIn(action);
};

cc._easeCubicActionIn = {
    easing: cc.EaseCubicActionIn.prototype._updateTime,
    reverse: function(){
        return cc._easeCubicActionIn;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeInCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example       //例如
 * action.easing(cc.easeCubicActionIn());
 */
cc.easeCubicActionIn = function(){
    return cc._easeCubicActionIn;
};

/**
 * cc.EaseCubicActionOut action. <br />
 * Reference easeOutCubic: <br />                                   参考easeOutCubic<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCubicActionOut());    从v3.0<br/>之后请使用action.easing(cc.easeCubicActionOut())
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseCubicActionOut.create(action);
 * //The new usage     // 新用法
 * action.easing(cc.easeCubicActionOut());
 */
cc.EaseCubicActionOut = cc.ActionEase.extend(/** @lends cc.EaseCubicActionOut# */{
    _updateTime: function(time){
        time -= 1;
        return (time * time * time + 1);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseCubicActionOut}
     */
    clone: function(){
        var action = new cc.EaseCubicActionOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion trajectory.       创建一个Action, 是原Action的反转
     * @return {cc.EaseCubicActionOut}
     */
    reverse: function(){
        return new cc.EaseCubicActionOut(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Reference easeOutCubic: <br />                            参考easeOutCubic:<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCubicActionOut());    v3.0之后<br/>请使用action.easing(cc.easeCubicActionOut());代替
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseCubicActionOut.create(action);
 * //The new usage       // 新用法
 * action.easing(cc.easeCubicActionOut());
 *
 * @param action
 * @returns {cc.EaseCubicActionOut}
 */
cc.EaseCubicActionOut.create = function(action){
    return new cc.EaseCubicActionOut(action);
};

cc._easeCubicActionOut = {
    easing: cc.EaseCubicActionOut.prototype._updateTime,
    reverse: function(){
        return cc._easeCubicActionOut;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeOutCubic: <br />               参考easeOutCubic:<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 * @example
 * //example       //例如
 * action.easing(cc.easeCubicActionOut());
 */
cc.easeCubicActionOut = function(){
    return cc._easeCubicActionOut;
};

/**
 * cc.EaseCubicActionInOut action. <br />
 * Reference easeInOutCubic: <br />                                                    参考easeInOutCubic: <br />
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @class
 * @extends cc.ActionEase
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCubicActionInOut());  从v3.0之后<br />请使用action.easing(cc.easeCubicActionInOut());
 *
 * @example
 * //The old usage       //旧用法
 * cc.EaseCubicActionInOut.create(action);
 * //The new usage      // 新用法
 * action.easing(cc.easeCubicActionInOut());
 */
cc.EaseCubicActionInOut = cc.ActionEase.extend(/** @lends cc.EaseCubicActionInOut# */{
    _updateTime: function(time){
        time = time*2;
        if (time < 1)
            return 0.5 * time * time * time;
        time -= 2;
        return 0.5 * (time * time * time + 2);
    },

    /**
     * Called once per frame. Time is the number of seconds of a frame interval.   每帧调用一次,Time表示每帧的时间间隔
     *
     * @param {Number} dt
     */
    update: function(dt){
        this._inner.update(this._updateTime(dt));
    },

    /**
     * to copy object with deep copy.   对象深拷贝
     * returns a clone of action. 返回这个对像的克隆
     *
     * @returns {cc.EaseCubicActionInOut}
     */
    clone: function(){
        var action = new cc.EaseCubicActionInOut();
        action.initWithAction(this._inner.clone());
        return action;
    },

    /**
     * Create a action. Opposite with the original motion target.   创建一个反转Action
     * @return {cc.EaseCubicActionInOut}
     */
    reverse: function(){
        return new cc.EaseCubicActionInOut(this._inner.reverse());
    }
});

/**
 * Creates the action. <br />                                创建Action <br/>
 * Reference easeInOutCubic: <br />                          参考easeInOutCubic:<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @static
 *
 * @deprecated since v3.0 <br /> Please use action.easing(cc.easeCubicActionInOut());   从v3.0之后 <br /> 请使用 action.easing(cc.easeCubicActionInOut());
 *
 * @example
 * //The old usage                   //旧用法
 * cc.EaseCubicActionInOut.create(action);
 * //The new usage      // 新用法 
 * action.easing(cc.easeCubicActionInOut());
 *
 * @param action
 * @returns {cc.EaseCubicActionInOut}
 */
cc.EaseCubicActionInOut.create = function(action){
    return new cc.EaseCubicActionInOut(action);
};

cc._easeCubicActionInOut = {
    easing: cc.EaseCubicActionInOut.prototype._updateTime,
    reverse: function(){
        return cc._easeCubicActionInOut;
    }
};

/**
 * Creates the action easing object. <br />     创建一个缓动Action对象<br/>
 * Reference easeInOutCubic: <br />                                   参考easeInOutCubic<br/>
 * {@link http://www.zhihu.com/question/21981571/answer/19925418}
 * @function
 * @returns {Object}
 */
cc.easeCubicActionInOut = function(){
    return cc._easeCubicActionInOut;
};


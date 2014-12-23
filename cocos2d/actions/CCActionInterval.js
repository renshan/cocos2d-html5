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
 * <p> 持续动作是需要持续运行一段时间的动作。 <br/>
 *  它有一个启动时间和结束时间。结束时间由启动时间加上周期得出。 </p>
 *
 * <p>持续动作有很多有趣的特性，例如：<br/>
 * - 它们可以正常运行 (default)  <br/>
 * - 它们也可以反向运行           <br/>
 * - 它们可以随加速器的改变运行        <br/>
 *
 * <p>例如：你可以使用正常运行加反向运行模拟一个乒乓球的运动</p>
 *
 * @class
 * @extends cc.FiniteTimeAction
 * @param {Number} d duration in seconds
 * @example
 * var actionInterval = new cc.ActionInterval(3);
 */
cc.ActionInterval = cc.FiniteTimeAction.extend(/** @lends cc.ActionInterval# */{
    _elapsed:0,
    _firstTick:false,
    _easeList: null,
    _times:1,
    _repeatForever: false,
    _repeatMethod: false,//Compatible with repeat class, Discard after can be deleted
    _speed: 1,
    _speedMethod: false,//Compatible with speed class, Discard after can be deleted

	/**
     	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Number} d 以秒为单位
	 */
    ctor:function (d) {
        this._speed = 1;
        this._times = 1;
        this._repeatForever = false;
        this.MAX_VALUE = 2;
        this._repeatMethod = false;//Compatible with repeat class, Discard after can be deleted
        this._speedMethod = false;//Compatible with repeat class, Discard after can be deleted
        cc.FiniteTimeAction.prototype.ctor.call(this);
		d !== undefined && this.initWithDuration(d);
    },

    /**
     * 动作开始执行以后花费了多少秒。
     * @return {Number}
     */
    getElapsed:function () {
        return this._elapsed;
    },

    /**
     * 初始化这个动作。
     * @param {Number} d 时间以秒为单位
     * @return {Boolean}
     */
    initWithDuration:function (d) {
        this._duration = (d === 0) ? cc.FLT_EPSILON : d;
        // prevent division by 0
        // This comparison could be in step:, but it might decrease the performance
        // by 3% in heavy based action games.
        this._elapsed = 0;
        this._firstTick = true;
        return true;
    },

    /**
     * 如果动作完成了将会返回true
     * @return {Boolean}
     */
    isDone:function () {
        return (this._elapsed >= this._duration);
    },

    /**
     * 带参数的克隆方法。
     * @param {cc.Action} action
     * @private
     */
    _cloneDecoration: function(action){
        action._repeatForever = this._repeatForever;
        action._speed = this._speed;
        action._times = this._times;
        action._easeList = this._easeList;
        action._speedMethod = this._speedMethod;
        action._repeatMethod = this._repeatMethod;
    },

    _reverseEaseList: function(action){
        if(this._easeList){
            action._easeList = [];
            for(var i=0; i<this._easeList.length; i++){
                action._easeList.push(this._easeList[i].reverse());
            }
        }
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.ActionInterval}
     */
    clone:function () {
        var action = new cc.ActionInterval(this._duration);
        this._cloneDecoration(action);
        return action;
    },

    /**
     * ease motion的实现。
     *
     * @example
     * //举例
     * action.easeing(cc.easeIn(3.0));
     * @param {Object} easeObj
     * @returns {cc.ActionInterval}
     */
    easing: function (easeObj) {
        if (this._easeList)
            this._easeList.length = 0;
        else
            this._easeList = [];
        for (var i = 0; i < arguments.length; i++)
            this._easeList.push(arguments[i]);
        return this;
    },

    _computeEaseTime: function (dt) {
        var locList = this._easeList;
        if ((!locList) || (locList.length === 0))
            return dt;
        for (var i = 0, n = locList.length; i < n; i++)
            dt = locList[i].easing(dt);
        return dt;
    },

    /**
     * 每帧调用一次，时间是两帧之间间隔的秒数。<br />
     * 除非你知道在做什么，否则不要重载这个方法。
     *
     * @param {Number} dt
     */
    step:function (dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this._elapsed = 0;
        } else
            this._elapsed += dt;

        //this.update((1 > (this._elapsed / this._duration)) ? this._elapsed / this._duration : 1);
        //this.update(Math.max(0, Math.min(1, this._elapsed / Math.max(this._duration, cc.FLT_EPSILON))));
        var t = this._elapsed / (this._duration > 0.0000001192092896 ? this._duration : 0.0000001192092896);
        t = (1 > t ? t : 1);
        this.update(t > 0 ? t : 0);

        //Compatible with repeat class, Discard after can be deleted (this._repeatMethod)
        if(this._repeatMethod && this._times > 1 && this.isDone()){
            if(!this._repeatForever){
                this._times--;
            }
            //var diff = locInnerAction.getElapsed() - locInnerAction._duration;
            this.startWithTarget(this.target);
            // to prevent jerk. issue #390 ,1247
            //this._innerAction.step(0);
            //this._innerAction.step(diff);
            this.step(this._elapsed - this._duration);

        }
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.Action.prototype.startWithTarget.call(this, target);
        this._elapsed = 0;
        this._firstTick = true;
    },

    /**
     * 返回一个反转的动作。<br />
     * 将被重写。
     *
     * @return {null}
     */
    reverse:function () {
        cc.log("cc.IntervalAction: reverse not implemented.");
        return null;
    },

    /**
     * 设置振幅比率
     * @warning 子类中需要重载该方法
     * @param {Number} amp
     */
    setAmplitudeRate:function (amp) {
        // Abstract class needs implementation
        cc.log("cc.ActionInterval.setAmplitudeRate(): it should be overridden in subclass.");
    },

    /**
     * 获取振幅比率
     * @warning 在子类中需要重载该方法
     * @return {Number} 0
     */
    getAmplitudeRate:function () {
        // Abstract class needs implementation
        cc.log("cc.ActionInterval.getAmplitudeRate(): it should be overridden in subclass.");
        return 0;
    },

    /**
     * 修改动作的速度，使之花费更长(speed>1)
     * 或者更少(speed<1)的时间。 <br/>
     * 可以用来模拟“慢动作”或“快进”效果。
     *
     * @param speed
     * @returns {cc.Action}
     */
    speed: function(speed){
        if(speed <= 0){
            cc.log("The speed parameter error");
            return this;
        }

        this._speedMethod = true;//Compatible with repeat class, Discard after can be deleted
        this._speed *= speed;
        return this;
    },

    /**
     * 获取动作的速度
     * @return {Number}
     */
    getSpeed: function(){
        return this._speed;
    },

    /**
     * 设置动作的速度
     * @param {Number} speed
     * @returns {cc.ActionInterval}
     */
    setSpeed: function(speed){
        this._speed = speed;
        return this;
    },

    /**
     * 循环执行一个动作很多次。
     * 如果需要无限循环，使用CCRepeatForever动作。
     * @param times
     * @returns {cc.ActionInterval}
     */
    repeat: function(times){
        times = Math.round(times);
        if(isNaN(times) || times < 1){
            cc.log("The repeat parameter error");
            return this;
        }
        this._repeatMethod = true;//Compatible with repeat class, Discard after can be deleted
        this._times *= times;
        return this;
    },

    /**
     * 无限循环执行一个动作。  <br/>
     * 如果执行次数有限制，使用Repeat动作。 <br/>
     * @returns {cc.ActionInterval}
     */
    repeatForever: function(){
        this._repeatMethod = true;//Compatible with repeat class, Discard after can be deleted
        this._times = this.MAX_VALUE;
        this._repeatForever = true;
        return this;
    }
});

/**
 * 持续的动作是指需要花费一段时间执行的动作。 
 * @function
 * @param {Number} d 时间以秒为单位
 * @return {cc.ActionInterval}
 * @example
 * // 举例
 * var actionInterval = cc.actionInterval(3);
 */
cc.actionInterval = function (d) {
    return new cc.ActionInterval(d);
};

/**
 * 使用cc.actionInterval代替。
 * 持续的动作是指需要花费一段时间执行的动作。 
 * @static
 * @deprecated 在3.0版本之后请使用cc.actionInterval来替代
 * @param {Number} d 时间以秒为单位
 * @return {cc.ActionInterval}
 */
cc.ActionInterval.create = cc.actionInterval;

/**
 * 顺序地执行动作。
 * @class
 * @extends cc.ActionInterval
 * @param {Array|cc.FiniteTimeAction} tempArray
 * @example
 * // 使用动作创建序列
 * var seq = new cc.Sequence(act1, act2);
 *
 * // 使用数组创建序列
 * var seq = new cc.Sequence(actArray);
 */
cc.Sequence = cc.ActionInterval.extend(/** @lends cc.Sequence# */{
    _actions:null,
    _split:null,
    _last:0,

	/**
     	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。<br />
     	 * 创建一组顺序执行的动作序列。
	 * @param {Array|cc.FiniteTimeAction} tempArray
	 */
    ctor:function (tempArray) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._actions = [];

		var paramArray = (tempArray instanceof Array) ? tempArray : arguments;
		var last = paramArray.length - 1;
		if ((last >= 0) && (paramArray[last] == null))
			cc.log("parameters should not be ending with null in Javascript");

        if (last >= 0) {
            var prev = paramArray[0], action1;
            for (var i = 1; i < last; i++) {
                if (paramArray[i]) {
                    action1 = prev;
                    prev = cc.Sequence._actionOneTwo(action1, paramArray[i]);
                }
            }
            this.initWithTwoActions(prev, paramArray[last]);
        }
    },

    /**
     * 初始化这个动作。 <br/>
     * @param {cc.FiniteTimeAction} actionOne
     * @param {cc.FiniteTimeAction} actionTwo
     * @return {Boolean}
     */
    initWithTwoActions:function (actionOne, actionTwo) {
        if(!actionOne || !actionTwo)
            throw "cc.Sequence.initWithTwoActions(): arguments must all be non nil";

        var d = actionOne._duration + actionTwo._duration;
        this.initWithDuration(d);

        this._actions[0] = actionOne;
        this._actions[1] = actionTwo;
        return true;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.Sequence}
     */
    clone:function () {
        var action = new cc.Sequence();
        this._cloneDecoration(action);
        action.initWithTwoActions(this._actions[0].clone(), this._actions[1].clone());
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._split = this._actions[0]._duration / this._duration;
        this._last = -1;
    },

    /**
     * 停止动作。
     */
    stop:function () {
        // Issue #1305
        if (this._last !== -1)
            this._actions[this._last].stop();
        cc.Action.prototype.stop.call(this);
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number}  dt
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        var new_t, found = 0;
        var locSplit = this._split, locActions = this._actions, locLast = this._last;
        if (dt < locSplit) {
            // action[0]
            new_t = (locSplit !== 0) ? dt / locSplit : 1;

            if (found === 0 && locLast === 1) {
                // Reverse mode ?
                // XXX: Bug. this case doesn't contemplate when _last==-1, found=0 and in "reverse mode"
                // since it will require a hack to know if an action is on reverse mode or not.
                // "step" should be overriden, and the "reverseMode" value propagated to inner Sequences.
                locActions[1].update(0);
                locActions[1].stop();
            }
        } else {
            // action[1]
            found = 1;
            new_t = (locSplit === 1) ? 1 : (dt - locSplit) / (1 - locSplit);

            if (locLast === -1) {
                // action[0] was skipped, execute it.
                locActions[0].startWithTarget(this.target);
                locActions[0].update(1);
                locActions[0].stop();
            }
            if (!locLast) {
                // switching to action 1. stop action 0.
                locActions[0].update(1);
                locActions[0].stop();
            }
        }

        // Last action found and it is done.
        if (locLast === found && locActions[found].isDone())
            return;

        // Last action found and it is done
        if (locLast !== found)
            locActions[found].startWithTarget(this.target);

        locActions[found].update(new_t);
        this._last = found;
    },

    /**
     * 返回一个反转的动作。
     * @return {cc.Sequence}
     */
    reverse:function () {
        var action = cc.Sequence._actionOneTwo(this._actions[1].reverse(), this._actions[0].reverse());
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    }
});

/** 构造一组顺序执行的动作序列。
 * @function
 * @param {Array|cc.FiniteTimeAction} tempArray
 * @return {cc.Sequence}
 * @example
 * // 示例
 * // 使用动作创建序列
 * var seq = cc.sequence(act1, act2);
 *
 * // 使用数组创建序列
 * var seq = cc.sequence(actArray);
 * todo: It should be use new
 */
cc.sequence = function (/*Multiple Arguments*/tempArray) {
    var paramArray = (tempArray instanceof Array) ? tempArray : arguments;
    if ((paramArray.length > 0) && (paramArray[paramArray.length - 1] == null))
        cc.log("parameters should not be ending with null in Javascript");

    var prev = paramArray[0];
    for (var i = 1; i < paramArray.length; i++) {
        if (paramArray[i])
            prev = cc.Sequence._actionOneTwo(prev, paramArray[i]);
    }
    return prev;
};

/**
 * 使用cc.sequence代替。
 * 构造一组顺序执行的动作序列。
 * @static
 * @deprecated 在3.0版本之后请使用cc.sequence来替代 
 * @param {Array|cc.FiniteTimeAction} tempArray
 * @return {cc.Sequence}
 */
cc.Sequence.create = cc.sequence;

/** 创建这个动作。
 * @param {cc.FiniteTimeAction} actionOne
 * @param {cc.FiniteTimeAction} actionTwo
 * @return {cc.Sequence}
 * @private
 */
cc.Sequence._actionOneTwo = function (actionOne, actionTwo) {
    var sequence = new cc.Sequence();
    sequence.initWithTwoActions(actionOne, actionTwo);
    return sequence;
};

/**
 * 循环执行一个动作很多次。
 * 如果需要无限循环，使用CCRepeatForever动作。
 * @class
 * @extends cc.ActionInterval
 * @param {cc.FiniteTimeAction} action
 * @param {Number} times
 * @example
 * var rep = new cc.Repeat(cc.sequence(jump2, jump1), 5);
 */
cc.Repeat = cc.ActionInterval.extend(/** @lends cc.Repeat# */{
    _times:0,
    _total:0,
    _nextDt:0,
    _actionInstant:false,
    _innerAction:null, //CCFiniteTimeAction

	/**
         * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。<br />
	 * 创建一个Repeat动作。次数是无符号整数，从1到2的30次方。
	 * @param {cc.FiniteTimeAction} action
	 * @param {Number} times
	 */
    ctor: function (action, times) {
        cc.ActionInterval.prototype.ctor.call(this);

		times !== undefined && this.initWithAction(action, times);
    },

    /**
     * @param {cc.FiniteTimeAction} action
     * @param {Number} times
     * @return {Boolean}
     */
    initWithAction:function (action, times) {
        var duration = action._duration * times;

        if (this.initWithDuration(duration)) {
            this._times = times;
            this._innerAction = action;
            if (action instanceof cc.ActionInstant){
                this._actionInstant = true;
                this._times -= 1;
            }
            this._total = 0;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.Repeat}
     */
    clone:function () {
        var action = new cc.Repeat();
        this._cloneDecoration(action);
        action.initWithAction(this._innerAction.clone(), this._times);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        this._total = 0;
        this._nextDt = this._innerAction._duration / this._duration;
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._innerAction.startWithTarget(target);
    },

    /**
     * 停止动作。
     */
    stop:function () {
        this._innerAction.stop();
        cc.Action.prototype.stop.call(this);
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number}  dt
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        var locInnerAction = this._innerAction;
        var locDuration = this._duration;
        var locTimes = this._times;
        var locNextDt = this._nextDt;

        if (dt >= locNextDt) {
            while (dt > locNextDt && this._total < locTimes) {
                locInnerAction.update(1);
                this._total++;
                locInnerAction.stop();
                locInnerAction.startWithTarget(this.target);
                locNextDt += locInnerAction._duration / locDuration;
                this._nextDt = locNextDt;
            }

            // fix for issue #1288, incorrect end value of repeat
            if (dt >= 1.0 && this._total < locTimes)
                this._total++;

            // don't set a instant action back or update it, it has no use because it has no duration
            if (!this._actionInstant) {
                if (this._total === locTimes) {
                    locInnerAction.update(1);
                    locInnerAction.stop();
                } else {
                    // issue #390 prevent jerk, use right update
                    locInnerAction.update(dt - (locNextDt - locInnerAction._duration / locDuration));
                }
            }
        } else {
            locInnerAction.update((dt * locTimes) % 1.0);
        }
    },

    /**
     * 如果动作完成，返回true
     * @return {Boolean}
     */
    isDone:function () {
        return this._total == this._times;
    },

    /**
     * 返回一个反转的动作。
     * @return {cc.Repeat}
     */
    reverse:function () {
        var action = new cc.Repeat(this._innerAction.reverse(), this._times);
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    },

    /**
     * 设置内部动作。
     * @param {cc.FiniteTimeAction} action
     */
    setInnerAction:function (action) {
        if (this._innerAction != action) {
            this._innerAction = action;
        }
    },

    /**
     * 获取内部动作。
     * @return {cc.FiniteTimeAction}
     */
    getInnerAction:function () {
        return this._innerAction;
    }
});

/**
 * 创建一个Repeat动作。次数是无符号整数，从1到2的30次方。
 * @function
 * @param {cc.FiniteTimeAction} action
 * @param {Number} times
 * @return {cc.Repeat}
 * @example
 * // 举例
 * var rep = cc.repeat(cc.sequence(jump2, jump1), 5);
 */
cc.repeat = function (action, times) {
    return new cc.Repeat(action, times);
};

/**
 * 使用cc.repeat代替。
 * 创建一个Repeat动作。次数是无符号整数，从1到2的30次方。
 * @static
 * @deprecated since v3.0 <br /> 使用cc.repeat代替。
 * @param {cc.FiniteTimeAction} action
 * @param {Number} times
 * @return {cc.Repeat}
 */
cc.Repeat.create = cc.repeat;

/** 无限循环一个动作。  <br/>
 * 如果执行次数有限制，使用Repeat动作<br/>
 * @warning 这个动作不能被用于顺序执行序列，因为它不是一个IntervalAction
 * @class
 * @extends cc.ActionInterval
 * @param {cc.FiniteTimeAction} action
 * @example
 * var rep = new cc.RepeatForever(cc.sequence(jump2, jump1), 5);
 */
cc.RepeatForever = cc.ActionInterval.extend(/** @lends cc.RepeatForever# */{
    _innerAction:null, //CCActionInterval

	/**
     	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。<br />
	 * 创建一个永远重复执行的动作。
	 * @param {cc.FiniteTimeAction} action
	 */
    ctor:function (action) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._innerAction = null;

		action && this.initWithAction(action);
    },

    /**
     * @param {cc.ActionInterval} action
     * @return {Boolean}
     */
    initWithAction:function (action) {
        if(!action)
            throw "cc.RepeatForever.initWithAction(): action must be non null";

        this._innerAction = action;
        return true;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.RepeatForever}
     */
    clone:function () {
        var action = new cc.RepeatForever();
        this._cloneDecoration(action);
        action.initWithAction(this._innerAction.clone());
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._innerAction.startWithTarget(target);
    },

    /**
     * 每一帧调用一次这个方法。时间是两帧之间的时间间隔。 <br />
     * 除非你知道在做什么，否则不要重载这个方法。
     * @param dt 时间以秒为单位
     */
    step:function (dt) {
        var locInnerAction = this._innerAction;
        locInnerAction.step(dt);
        if (locInnerAction.isDone()) {
            //var diff = locInnerAction.getElapsed() - locInnerAction._duration;
            locInnerAction.startWithTarget(this.target);
            // to prevent jerk. issue #390 ,1247
            //this._innerAction.step(0);
            //this._innerAction.step(diff);
            locInnerAction.step(locInnerAction.getElapsed() - locInnerAction._duration);
        }
    },

    /**
     * 如果动作完成，返回true
     * @return {Boolean}
     */
    isDone:function () {
        return false;
    },

    /**
     * 返回一个反转的动作。
     * @return {cc.RepeatForever}
     */
    reverse:function () {
        var action = new cc.RepeatForever(this._innerAction.reverse());
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    },

    /**
     * 设置内部动作。
     * @param {cc.ActionInterval} action
     */
    setInnerAction:function (action) {
        if (this._innerAction != action) {
            this._innerAction = action;
        }
    },

    /**
     * 获取内部动作。
     * @return {cc.ActionInterval}
     */
    getInnerAction:function () {
        return this._innerAction;
    }
});

/**
 * 创建一个永远重复执行的动作。
 * @function
 * @param {cc.FiniteTimeAction} action
 * @return {cc.RepeatForever}
 * @example
 * // 示例
 * var repeat = cc.repeatForever(cc.rotateBy(1.0, 360));
 */
cc.repeatForever = function (action) {
    return new cc.RepeatForever(action);
};

/**
 * 使用cc.repeatForever代替
 * 创建一个永远重复执行的动作。
 * @static
 * @deprecated 在3.0版本之后使用cc.repeatForever代替
 * @param {cc.FiniteTimeAction} action
 * @return {cc.RepeatForever}
 * @param {Array|cc.FiniteTimeAction} tempArray
 * @example
 * var action = new cc.Spawn(cc.jumpBy(2, cc.p(300, 0), 50, 4), cc.rotateBy(2, 720));
 */
cc.RepeatForever.create = cc.repeatForever;

/** 立即并行执行一个新的动作。
 * @class
 * @extends cc.ActionInterval
 */
cc.Spawn = cc.ActionInterval.extend(/** @lends cc.Spawn# */{
    _one:null,
    _two:null,

	/**
     	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Array|cc.FiniteTimeAction} tempArray
	 */
    ctor:function (tempArray) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._one = null;
        this._two = null;

		var paramArray = (tempArray instanceof Array) ? tempArray : arguments;
		var last = paramArray.length - 1;
		if ((last >= 0) && (paramArray[last] == null))
			cc.log("parameters should not be ending with null in Javascript");

        if (last >= 0) {
            var prev = paramArray[0], action1;
            for (var i = 1; i < last; i++) {
                if (paramArray[i]) {
                    action1 = prev;
                    prev = cc.Spawn._actionOneTwo(action1, paramArray[i]);
                }
            }
            this.initWithTwoActions(prev, paramArray[last]);
        }
    },

    /** 使用两个需要并行执行的动作，初始化Spawn动作
     * @param {cc.FiniteTimeAction} action1
     * @param {cc.FiniteTimeAction} action2
     * @return {Boolean}
     */
    initWithTwoActions:function (action1, action2) {
        if(!action1 || !action2)
            throw "cc.Spawn.initWithTwoActions(): arguments must all be non null" ;

        var ret = false;

        var d1 = action1._duration;
        var d2 = action2._duration;

        if (this.initWithDuration(Math.max(d1, d2))) {
            this._one = action1;
            this._two = action2;

            if (d1 > d2) {
                this._two = cc.Sequence._actionOneTwo(action2, cc.delayTime(d1 - d2));
            } else if (d1 < d2) {
                this._one = cc.Sequence._actionOneTwo(action1, cc.delayTime(d2 - d1));
            }

            ret = true;
        }
        return ret;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.Spawn}
     */
    clone:function () {
        var action = new cc.Spawn();
        this._cloneDecoration(action);
        action.initWithTwoActions(this._one.clone(), this._two.clone());
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._one.startWithTarget(target);
        this._two.startWithTarget(target);
    },

    /**
     * 停止动作。
     */
    stop:function () {
        this._one.stop();
        this._two.stop();
        cc.Action.prototype.stop.call(this);
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number}  dt
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        if (this._one)
            this._one.update(dt);
        if (this._two)
            this._two.update(dt);
    },

    /**
     * 返回一个反转的动作。
     * @return {cc.Spawn}
     */
    reverse:function () {
        var action = cc.Spawn._actionOneTwo(this._one.reverse(), this._two.reverse());
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    }
});

/**
 * 创建一个可以并行执行几个动作的spawn动作。
 * @function
 * @param {Array|cc.FiniteTimeAction}tempArray
 * @return {cc.FiniteTimeAction}
 * @example
 * // 示例
 * var action = cc.spawn(cc.jumpBy(2, cc.p(300, 0), 50, 4), cc.rotateBy(2, 720));
 * todo:应该直接使用new来创建
 */
cc.spawn = function (/*Multiple Arguments*/tempArray) {
    var paramArray = (tempArray instanceof Array) ? tempArray : arguments;
    if ((paramArray.length > 0) && (paramArray[paramArray.length - 1] == null))
        cc.log("parameters should not be ending with null in Javascript");

    var prev = paramArray[0];
    for (var i = 1; i < paramArray.length; i++) {
        if (paramArray[i] != null)
            prev = cc.Spawn._actionOneTwo(prev, paramArray[i]);
    }
    return prev;
};

/**
 * 使用cc.spawn代替。
 * 创建一个可以并行执行几个动作的spawn动作。
 * @static
 * @deprecated 在3.0版本之后使用cc.spawn代替。
 * @param {Array|cc.FiniteTimeAction}tempArray
 * @return {cc.FiniteTimeAction}
 */
cc.Spawn.create = cc.spawn;

/**
 * @param {cc.FiniteTimeAction} action1
 * @param {cc.FiniteTimeAction} action2
 * @return {cc.Spawn}
 * @private
 */
cc.Spawn._actionOneTwo = function (action1, action2) {
    var pSpawn = new cc.Spawn();
    pSpawn.initWithTwoActions(action1, action2);
    return pSpawn;
};


/**
 * 通过修改cc.Node对象的旋转属性，将它旋转到指定角度的动作。 <br/>
 * 方向由最短的角决定。
 * @class
 * @extends cc.ActionInterval
 * @param {Number} duration 以秒为单位
 * @param {Number} deltaAngleX 以度为单位
 * @param {Number} [deltaAngleY] deltaAngleY 以度为单位
 * @example
 * var rotateTo = new cc.RotateTo(2, 61.0);
 */
cc.RotateTo = cc.ActionInterval.extend(/** @lends cc.RotateTo# */{
    _dstAngleX:0,
    _startAngleX:0,
    _diffAngleX:0,

    _dstAngleY:0,
    _startAngleY:0,
    _diffAngleY:0,

	/**
     	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。<br />
	 * 使用x和y旋转角度，创建一个RotateTo动作。
	 * @param {Number} duration duration以秒为单位
	 * @param {Number} deltaAngleX deltaAngleX以度为单位
	 * @param {Number} [deltaAngleY] deltaAngleY以度为单位
	 */
    ctor:function (duration, deltaAngleX, deltaAngleY) {
        cc.ActionInterval.prototype.ctor.call(this);

		deltaAngleX !== undefined && this.initWithDuration(duration, deltaAngleX, deltaAngleY);
    },

    /**
     * 初始化这个动作。
     * @param {Number} duration
     * @param {Number} deltaAngleX
     * @param {Number} deltaAngleY
     * @return {Boolean}
     */
    initWithDuration:function (duration, deltaAngleX, deltaAngleY) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._dstAngleX = deltaAngleX || 0;
            this._dstAngleY = deltaAngleY || this._dstAngleX;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.RotateTo}
     */
    clone:function () {
        var action = new cc.RotateTo();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._dstAngleX, this._dstAngleY);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);

        // Calculate X
        var locStartAngleX = target.rotationX % 360.0;
        var locDiffAngleX = this._dstAngleX - locStartAngleX;
        if (locDiffAngleX > 180)
            locDiffAngleX -= 360;
        if (locDiffAngleX < -180)
            locDiffAngleX += 360;
        this._startAngleX = locStartAngleX;
        this._diffAngleX = locDiffAngleX;

        // Calculate Y  It's duplicated from calculating X since the rotation wrap should be the same
        this._startAngleY = target.rotationY % 360.0;
        var locDiffAngleY = this._dstAngleY - this._startAngleY;
        if (locDiffAngleY > 180)
            locDiffAngleY -= 360;
        if (locDiffAngleY < -180)
            locDiffAngleY += 360;
        this._diffAngleY = locDiffAngleY;
    },

    /**
     * RotateTo 的reverse未实现。
     * 需要重载。
     */
    reverse:function () {
        cc.log("cc.RotateTo.reverse(): it should be overridden in subclass.");
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number}  dt
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        if (this.target) {
            this.target.rotationX = this._startAngleX + this._diffAngleX * dt;
            this.target.rotationY = this._startAngleY + this._diffAngleY * dt;
        }
    }
});

/**
 * 使用一个单独的旋转角度创建一个RotateTo动作。
 * 指定旋转的角度。
 * @function
 * @param {Number} duration 以秒为单位
 * @param {Number} deltaAngleX 以度为单位
 * @param {Number} [deltaAngleY] deltaAngleY 以度为单位
 * @return {cc.RotateTo}
 * @example
 * // 示例
 * var rotateTo = cc.rotateTo(2, 61.0);
 */
cc.rotateTo = function (duration, deltaAngleX, deltaAngleY) {
    return new cc.RotateTo(duration, deltaAngleX, deltaAngleY);
};

/**
 * 使用cc.rotateTo代替。
 * 使用一个单独的旋转角度创建一个RotateTo动作。
 * 指定旋转的角度。
 * @static
 * @deprecated 自v3.0 <br /> 使用cc.rotateTo代替。
 * @param {Number} duration 以秒为单位
 * @param {Number} deltaAngleX 以度为单位
 * @param {Number} [deltaAngleY] deltaAngleY 以度为单位
 * @return {cc.RotateTo}
 */
cc.RotateTo.create = cc.rotateTo;


/**
 * 通过cc.Node对象的旋转属性，顺时针旋转一个角度的动作。
 * 根据它的属性进行旋转。
 * @class
 * @extends  cc.ActionInterval
 * @param {Number} duration duration以秒为单位
 * @param {Number} deltaAngleX deltaAngleX以度为单位
 * @param {Number} [deltaAngleY] deltaAngleY以度为单位
 * @example
 * var actionBy = new cc.RotateBy(2, 360);
 */
cc.RotateBy = cc.ActionInterval.extend(/** @lends cc.RotateBy# */{
    _angleX:0,
    _startAngleX:0,
    _angleY:0,
    _startAngleY:0,

	/**
     	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Number} duration 以秒为单位
	 * @param {Number} deltaAngleX 以度为单位
	 * @param {Number} [deltaAngleY] deltaAngleY 以度为单位
	 */
    ctor: function (duration, deltaAngleX, deltaAngleY) {
        cc.ActionInterval.prototype.ctor.call(this);

		deltaAngleX !== undefined && this.initWithDuration(duration, deltaAngleX, deltaAngleY);
    },

    /**
     * 初始化这个动作。
     * @param {Number} duration 以秒为单位
     * @param {Number} deltaAngleX 以度为单位
     * @param {Number} [deltaAngleY=] deltaAngleY 以度为单位
     * @return {Boolean}
     */
    initWithDuration:function (duration, deltaAngleX, deltaAngleY) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._angleX = deltaAngleX || 0;
            this._angleY = deltaAngleY || this._angleX;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.RotateBy}
     */
    clone:function () {
        var action = new cc.RotateBy();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._angleX, this._angleY);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._startAngleX = target.rotationX;
        this._startAngleY = target.rotationY;
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number}  dt
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        if (this.target) {
            this.target.rotationX = this._startAngleX + this._angleX * dt;
            this.target.rotationY = this._startAngleY + this._angleY * dt;
        }
    },

    /**
     * 返回一个反转的动作。
     * @return {cc.RotateBy}
     */
    reverse:function () {
        var action = new cc.RotateBy(this._duration, -this._angleX, -this._angleY);
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    }
});

/**
 * 通过cc.Node对象的旋转属性，顺时针旋转一个角度的动作。
 * 根据它的属性进行旋转。
 * @function
 * @param {Number} duration 以秒为单位
 * @param {Number} deltaAngleX 以度为单位
 * @param {Number} [deltaAngleY] deltaAngleY 以度为单位
 * @return {cc.RotateBy}
 * @example
 * // example
 * var actionBy = cc.rotateBy(2, 360);
 */
cc.rotateBy = function (duration, deltaAngleX, deltaAngleY) {
    return new cc.RotateBy(duration, deltaAngleX, deltaAngleY);
};

/**
 * 使用cc.rotateBy代替。
 * 通过cc.Node对象的旋转属性，顺时针旋转一个角度的动作。
 * 根据它的属性进行旋转。
 * @static
 * @deprecated 自v3.0 <br /> 使用cc.rotateBy代替。
 * @param {Number} duration 以秒为单位
 * @param {Number} deltaAngleX 以度为单位
 * @param {Number} [deltaAngleY] deltaAngleY 以度为单位
 * @return {cc.RotateBy}
 */
cc.RotateBy.create = cc.rotateBy;


/**
 * <p>
 *     通过修改一个CCNode对象的位置属性来移动x、y个像素 <br/>
 *     x和y是这个对象的相对位置。        <br/>
 *     几个CCMoveBy动作可以同时调用， <br/>
 *     结果是每个单个动作之和。
 * </p>
 * @class
 * @extends cc.ActionInterval
 * @param {Number} duration 以秒为单位
 * @param {cc.Point|Number} deltaPos
 * @param {Number} [deltaY]
 * @example
 * var actionTo = cc.moveBy(2, cc.p(windowSize.width - 40, windowSize.height - 40));
 */
cc.MoveBy = cc.ActionInterval.extend(/** @lends cc.MoveBy# */{
    _positionDelta:null,
    _startPosition:null,
    _previousPosition:null,

	/**
    	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Number} duration duration以秒为单位
	 * @param {cc.Point|Number} deltaPos
	 * @param {Number} [deltaY]
	 */
    ctor:function (duration, deltaPos, deltaY) {
        cc.ActionInterval.prototype.ctor.call(this);

        this._positionDelta = cc.p(0, 0);
        this._startPosition = cc.p(0, 0);
        this._previousPosition = cc.p(0, 0);

		deltaPos !== undefined && this.initWithDuration(duration, deltaPos, deltaY);
    },

    /**
     * 初始化这个动作。
     * @param {Number} duration 以秒为单位
     * @param {cc.Point} position
     * @param {Number} [y]
     * @return {Boolean}
     */
    initWithDuration:function (duration, position, y) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
	        if(position.x !== undefined) {
		        y = position.y;
		        position = position.x;
	        }

            this._positionDelta.x = position;
            this._positionDelta.y = y;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.MoveBy}
     */
    clone:function () {
        var action = new cc.MoveBy();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._positionDelta);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        var locPosX = target.getPositionX();
        var locPosY = target.getPositionY();
        this._previousPosition.x = locPosX;
        this._previousPosition.y = locPosY;
        this._startPosition.x = locPosX;
        this._startPosition.y = locPosY;
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number} dt
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        if (this.target) {
            var x = this._positionDelta.x * dt;
            var y = this._positionDelta.y * dt;
            var locStartPosition = this._startPosition;
            if (cc.ENABLE_STACKABLE_ACTIONS) {
                var targetX = this.target.getPositionX();
                var targetY = this.target.getPositionY();
                var locPreviousPosition = this._previousPosition;

                locStartPosition.x = locStartPosition.x + targetX - locPreviousPosition.x;
                locStartPosition.y = locStartPosition.y + targetY - locPreviousPosition.y;
                x = x + locStartPosition.x;
                y = y + locStartPosition.y;
	            locPreviousPosition.x = x;
	            locPreviousPosition.y = y;
	            this.target.setPosition(x, y);
            } else {
                this.target.setPosition(locStartPosition.x + x, locStartPosition.y + y);
            }
        }
    },

    /**
     * MoveTo 的reverse方法未实现
     * @return {cc.MoveBy}
     */
    reverse:function () {
        var action = new cc.MoveBy(this._duration, cc.p(-this._positionDelta.x, -this._positionDelta.y));
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    }
});

/**
 * 创建一个动作。
 * 和目标原有的坐标相关，移动一个指定的距离。
 * @function
 * @param {Number} duration duration以秒为单位
 * @param {cc.Point|Number} deltaPos
 * @param {Number} deltaY
 * @return {cc.MoveBy}
 * @example
 * // 示例
 * var actionTo = cc.moveBy(2, cc.p(windowSize.width - 40, windowSize.height - 40));
 */
cc.moveBy = function (duration, deltaPos, deltaY) {
    return new cc.MoveBy(duration, deltaPos, deltaY);
};

/**
 * 使用cc.moveBy代替。
 * 相对于它的位置坐标移动一个指定的距离。
 * @static
 * @deprecated since v3.0 please use cc.moveBy instead.
 * @param {Number} duration duration in seconds
 * @param {cc.Point|Number} deltaPos
 * @param {Number} deltaY
 * @return {cc.MoveBy}
 */
cc.MoveBy.create = cc.moveBy;


/**
 * 通过修改CCNode对象的位置属性将它移动到（x, y）坐标，这里x和y是绝对坐标<br/>
 * 多个CCMoveTo动作可以同时调用，                     <br/>
 * 结果是每个单个动作之和。
 * @class
 * @extends cc.MoveBy
 * @param {Number} duration duration以秒为单位
 * @param {cc.Point|Number} position
 * @param {Number} y
 * @example
 * var actionBy = new cc.MoveTo(2, cc.p(80, 80));
 */
cc.MoveTo = cc.MoveBy.extend(/** @lends cc.MoveTo# */{
    _endPosition:null,

	/**
     	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Number} duration 以秒为单位
	 * @param {cc.Point|Number} position
	 * @param {Number} y
	 */
    ctor:function (duration, position, y) {
        cc.MoveBy.prototype.ctor.call(this);
        this._endPosition = cc.p(0, 0);

		position !== undefined && this.initWithDuration(duration, position, y);
    },

    /**
     * 初始化这个动作。
     * @param {Number} duration 以秒为单位
     * @param {cc.Point} position
     * @param {Number} y
     * @return {Boolean}
     */
    initWithDuration:function (duration, position, y) {
        if (cc.MoveBy.prototype.initWithDuration.call(this, duration, position, y)) {
	        if(position.x !== undefined) {
		        y = position.y;
		        position = position.x;
	        }

            this._endPosition.x = position;
            this._endPosition.y = y;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.MoveTo}
     */
    clone:function () {
        var action = new cc.MoveTo();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._endPosition);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.MoveBy.prototype.startWithTarget.call(this, target);
        this._positionDelta.x = this._endPosition.x - target.getPositionX();
        this._positionDelta.y = this._endPosition.y - target.getPositionY();
    }
});

/**
 * 创建一个动作。
 * 移动到一个指定的坐标。
 * @function
 * @param {Number} duration duration以秒为单位
 * @param {cc.Point} position
 * @param {Number} y
 * @return {cc.MoveBy}
 * @example
 * // 示例
 * var actionBy = cc.moveTo(2, cc.p(80, 80));
 */
cc.moveTo = function (duration, position, y) {
    return new cc.MoveTo(duration, position, y);
};

/**
 * 使用cc.moveTo代替。
 * 移动到一个指定的坐标。
 * @static
 * @deprecated 自v3.0 以后使用cc.moveTo代替。
 * @param {Number} duration 以秒为单位
 * @param {cc.Point} position
 * @param {Number} y
 * @return {cc.MoveBy}
 */
cc.MoveTo.create = cc.moveTo;

/**
 * Skews a cc.Node object to given angles by modifying it's skewX and skewY attributes
 * @class
 * @extends cc.ActionInterval
 * @param {Number} t time in seconds
 * @param {Number} sx
 * @param {Number} sy
 * @example
 * var actionTo = new cc.SkewTo(2, 37.2, -37.2);
 */
/**
 * 通过修改节点对象的skewX和skewY属性来使节点对象倾斜到一个给定的角度。
 * @class
 * @extends cc.ActionInterval
 * @param {Number} t 时间以秒为单位
 * @param {Number} sx
 * @param {Number} sy
 * @example
 * var actionTo = new cc.SkewTo(2, 37.2, -37.2);
 */
cc.SkewTo = cc.ActionInterval.extend(/** @lends cc.SkewTo# */{
    _skewX:0,
    _skewY:0,
    _startSkewX:0,
    _startSkewY:0,
    _endSkewX:0,
    _endSkewY:0,
    _deltaX:0,
    _deltaY:0,

	/**
    	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Number} t 时间以秒为单位
	 * @param {Number} sx
	 * @param {Number} sy
	 */
    ctor: function (t, sx, sy) {
        cc.ActionInterval.prototype.ctor.call(this);

		sy !== undefined && this.initWithDuration(t, sx, sy);
    },

    /**
     * 初始化这个动作。
     * @param {Number} t 以秒为单位
     * @param {Number} sx
     * @param {Number} sy
     * @return {Boolean}
     */
    initWithDuration:function (t, sx, sy) {
        var ret = false;
        if (cc.ActionInterval.prototype.initWithDuration.call(this, t)) {
            this._endSkewX = sx;
            this._endSkewY = sy;
            ret = true;
        }
        return ret;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.SkewTo}
     */
    clone:function () {
        var action = new cc.SkewTo();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._endSkewX, this._endSkewY);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);

        this._startSkewX = target.skewX % 180;
        this._deltaX = this._endSkewX - this._startSkewX;
        if (this._deltaX > 180)
            this._deltaX -= 360;
        if (this._deltaX < -180)
            this._deltaX += 360;

        this._startSkewY = target.skewY % 360;
        this._deltaY = this._endSkewY - this._startSkewY;
        if (this._deltaY > 180)
            this._deltaY -= 360;
        if (this._deltaY < -180)
            this._deltaY += 360;
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number} dt
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        this.target.skewX = this._startSkewX + this._deltaX * dt;
        this.target.skewY = this._startSkewY + this._deltaY * dt;
    }
});

/**
 * 创建一个动作。
 * 通过修改节点对象的skewX和skewY属性来使节点对象倾斜到一个给定的角度。<br />
 * @function
 * @param {Number} t 时间以秒为单位
 * @param {Number} sx
 * @param {Number} sy
 * @return {cc.SkewTo}
 * @example
 * // example
 * var actionTo = cc.skewTo(2, 37.2, -37.2);
 */
cc.skewTo = function (t, sx, sy) {
    return new cc.SkewTo(t, sx, sy);
};

/**
 * 使用cc.skewTo代替。
 * 通过修改节点对象的skewX和skewY属性来使节点对象倾斜到一个给定的角度。<br />
 * @static
 * @deprecated 自v3.0以后使用cc.skewTo代替。
 * @param {Number} t 时间以秒为单位
 * @param {Number} sx
 * @param {Number} sy
 * @return {cc.SkewTo}
 */
cc.SkewTo.create = cc.skewTo;

/**
 * 通过修改节点对象的skewX和skewY度数节点对象倾斜<br />
 * 相对于节点对象的属性修改
 * @class
 * @extends cc.SkewTo
 * @param {Number} t 以秒为单位
 * @param {Number} sx  X轴倾斜度数
 * @param {Number} sy  Y轴倾斜度数
 */
cc.SkewBy = cc.SkewTo.extend(/** @lends cc.SkewBy# */{

	/**
     	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Number} t 以秒为单位
	 * @param {Number} sx  X轴倾斜度数
	 * @param {Number} sy  Y轴倾斜度数
	 */
	ctor: function(t, sx, sy) {
		cc.SkewTo.prototype.ctor.call(this);
		sy !== undefined && this.initWithDuration(t, sx, sy);
	},

    /**
     * 初始化这个动作。
     * @param {Number} t 以秒为单位
     * @param {Number} deltaSkewX  X轴倾斜度数
     * @param {Number} deltaSkewY  Y轴倾斜度数
     * @return {Boolean}
     */
    initWithDuration:function (t, deltaSkewX, deltaSkewY) {
        var ret = false;
        if (cc.SkewTo.prototype.initWithDuration.call(this, t, deltaSkewX, deltaSkewY)) {
            this._skewX = deltaSkewX;
            this._skewY = deltaSkewY;
            ret = true;
        }
        return ret;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.SkewBy}
     */
    clone:function () {
        var action = new cc.SkewBy();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._skewX, this._skewY);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.SkewTo.prototype.startWithTarget.call(this, target);
        this._deltaX = this._skewX;
        this._deltaY = this._skewY;
        this._endSkewX = this._startSkewX + this._deltaX;
        this._endSkewY = this._startSkewY + this._deltaY;
    },

    /**
     * 返回一个反转的动作。
     * @return {cc.SkewBy}
     */
    reverse:function () {
        var action = new cc.SkewBy(this._duration, -this._skewX, -this._skewY);
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    }
});

/**
 * 通过修改节点对象的skewX和skewY度数节点对象倾斜<br />
 * 相对于节点对象的属性修改
 * @function
 * @param {Number} t 以秒为单位
 * @param {Number} sx sx X轴倾斜度数
 * @param {Number} sy sy Y轴倾斜度数
 * @return {cc.SkewBy}
 * @example
 * // 示例
 * var actionBy = cc.skewBy(2, 0, -90);
 */
cc.skewBy = function (t, sx, sy) {
    return new cc.SkewBy(t, sx, sy);
};

/**
 * 使用cc.skewBy代替。 <br />
 * 通过修改节点对象的skewX和skewY度数节点对象倾斜<br />
 * 相对于节点对象的属性修改
 * @static
 * @deprecated 自v3.0以后 使用cc.skewBy代替。
 * @param {Number} t 以秒为单位
 * @param {Number} sx sx X轴倾斜度数
 * @param {Number} sy sy Y轴倾斜度数
 * @return {cc.SkewBy}
 */
cc.SkewBy.create = cc.skewBy;

/**
 * 通过修改cc.Node对象的位置属性，将它按照抛物线移动到一个指定点，来模仿跳跃的轨迹动作
 * 相对于它的运动。
 * @class
 * @extends cc.ActionInterval
 * @param {Number} duration
 * @param {cc.Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @example
 * var actionBy = new cc.JumpBy(2, cc.p(300, 0), 50, 4);
 * var actionBy = new cc.JumpBy(2, 300, 0, 50, 4);
 */
cc.JumpBy = cc.ActionInterval.extend(/** @lends cc.JumpBy# */{
    _startPosition:null,
    _delta:null,
    _height:0,
    _jumps:0,
    _previousPosition:null,

	/**
    	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Number} duration
	 * @param {cc.Point|Number} position
	 * @param {Number} [y]
	 * @param {Number} height
	 * @param {Number} jumps
	 */
    ctor:function (duration, position, y, height, jumps) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._startPosition = cc.p(0, 0);
        this._previousPosition = cc.p(0, 0);
        this._delta = cc.p(0, 0);

		height !== undefined && this.initWithDuration(duration, position, y, height, jumps);
    },

    /**
     * 初始化这个动作。
     * @param {Number} duration
     * @param {cc.Point|Number} position
     * @param {Number} [y]
     * @param {Number} height
     * @param {Number} jumps
     * @return {Boolean}
     * @example
     * actionBy.initWithDuration(2, cc.p(300, 0), 50, 4);
     * actionBy.initWithDuration(2, 300, 0, 50, 4);
     */
    initWithDuration:function (duration, position, y, height, jumps) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
	        if (jumps === undefined) {
		        jumps = height;
		        height = y;
		        y = position.y;
		        position = position.x;
	        }
            this._delta.x = position;
            this._delta.y = y;
            this._height = height;
            this._jumps = jumps;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.JumpBy}
     */
    clone:function () {
        var action = new cc.JumpBy();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._delta, this._height, this._jumps);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        var locPosX = target.getPositionX();
        var locPosY = target.getPositionY();
        this._previousPosition.x = locPosX;
        this._previousPosition.y = locPosY;
        this._startPosition.x = locPosX;
        this._startPosition.y = locPosY;
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number} dt
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        if (this.target) {
            var frac = dt * this._jumps % 1.0;
            var y = this._height * 4 * frac * (1 - frac);
            y += this._delta.y * dt;

            var x = this._delta.x * dt;
            var locStartPosition = this._startPosition;
            if (cc.ENABLE_STACKABLE_ACTIONS) {
                var targetX = this.target.getPositionX();
                var targetY = this.target.getPositionY();
                var locPreviousPosition = this._previousPosition;

                locStartPosition.x = locStartPosition.x + targetX - locPreviousPosition.x;
                locStartPosition.y = locStartPosition.y + targetY - locPreviousPosition.y;
                x = x + locStartPosition.x;
                y = y + locStartPosition.y;
	            locPreviousPosition.x = x;
	            locPreviousPosition.y = y;
	            this.target.setPosition(x, y);
            } else {
                this.target.setPosition(locStartPosition.x + x, locStartPosition.y + y);
            }
        }
    },

    /**
     * 返回一个反转的动作。
     * @return {cc.JumpBy}
     */
    reverse:function () {
        var action = new cc.JumpBy(this._duration, cc.p(-this._delta.x, -this._delta.y), this._height, this._jumps);
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    }
});

/**
 * 通过修改cc.Node对象的位置属性，将它按照抛物线移动到一个指定点，来模仿跳跃的轨迹动作
 * 相对于它的运动。
 * @function
 * @param {Number} duration
 * @param {cc.Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @return {cc.JumpBy}
 * @example
 * // 示例
 * var actionBy = cc.jumpBy(2, cc.p(300, 0), 50, 4);
 * var actionBy = cc.jumpBy(2, 300, 0, 50, 4);
 */
cc.jumpBy = function (duration, position, y, height, jumps) {
    return new cc.JumpBy(duration, position, y, height, jumps);
};

/**
 * 使用cc.jumpBy代替。<br />
 * 通过修改cc.Node对象的位置属性，将它按照抛物线移动到一个指定点，来模仿跳跃的轨迹动作
 * 相对于它的运动。
 * @static
 * @deprecated 使用cc.jumpBy代替。
 * @param {Number} duration
 * @param {cc.Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @return {cc.JumpBy}
 */
cc.JumpBy.create = cc.jumpBy;

/**
 * 通过修改cc.Node对象的位置属性，将它按照抛物线移动到一个指定点，来模仿跳跃的轨迹动作
 * 跳到一个指定的位置。
 * @class
 * @extends cc.JumpBy
 * @param {Number} duration
 * @param {cc.Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @example
 * var actionTo = new cc.JumpTo(2, cc.p(300, 0), 50, 4);
 * var actionTo = new cc.JumpTo(2, 300, 0, 50, 4);
 */
cc.JumpTo = cc.JumpBy.extend(/** @lends cc.JumpTo# */{
    _endPosition:null,

    /**
     * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
     * @param {Number} duration
     * @param {cc.Point|Number} position
     * @param {Number} [y]
     * @param {Number} height
     * @param {Number} jumps
     */
    ctor:function (duration, position, y, height, jumps) {
        cc.JumpBy.prototype.ctor.call(this);
        this._endPosition = cc.p(0, 0);

        height !== undefined && this.initWithDuration(duration, position, y, height, jumps);
    },
    /**
     * 初始化这个动作。
     * @param {Number} duration
     * @param {cc.Point|Number} position
     * @param {Number} [y]
     * @param {Number} height
     * @param {Number} jumps
     * @return {Boolean}
     * @example
     * actionTo.initWithDuration(2, cc.p(300, 0), 50, 4);
     * actionTo.initWithDuration(2, 300, 0, 50, 4);
     */
    initWithDuration:function (duration, position, y, height, jumps) {
        if (cc.JumpBy.prototype.initWithDuration.call(this, duration, position, y, height, jumps)) {
            if (jumps === undefined) {
                y = position.y;
                position = position.x;
            }
            this._endPosition.x = position;
            this._endPosition.y = y;
            return true;
        }
        return false;
    },
    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.JumpBy.prototype.startWithTarget.call(this, target);
        this._delta.x = this._endPosition.x - this._startPosition.x;
        this._delta.y = this._endPosition.y - this._startPosition.y;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.JumpTo}
     */
    clone:function () {
        var action = new cc.JumpTo();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._endPosition, this._height, this._jumps);
        return action;
    }
});

/**
 * 通过修改cc.Node对象的位置属性，将它按照抛物线移动到一个指定点，来模仿跳跃的轨迹动作
 * 跳到一个指定的位置。
 * @function
 * @param {Number} duration
 * @param {cc.Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @return {cc.JumpTo}
 * @example
 * // 示例
 * var actionTo = cc.jumpTo(2, cc.p(300, 300), 50, 4);
 * var actionTo = cc.jumpTo(2, 300, 300, 50, 4);
 */
cc.jumpTo = function (duration, position, y, height, jumps) {
    return new cc.JumpTo(duration, position, y, height, jumps);
};

/**
 * 使用cc.jumpTo代替。
 * 通过修改cc.Node对象的位置属性，将它按照抛物线移动到一个指定点，来模仿跳跃的轨迹动作。
 * 跳到一个指定的位置。
 * @static
 * @deprecated 自v3.0 使用cc.jumpTo代替。
 * @param {Number} duration
 * @param {cc.Point|Number} position
 * @param {Number} [y]
 * @param {Number} height
 * @param {Number} jumps
 * @return {cc.JumpTo}
 */
cc.JumpTo.create = cc.jumpTo;

/**
 * @function
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @param {Number} d
 * @param {Number} t
 * @return {Number}
 */
cc.bezierAt = function (a, b, c, d, t) {
    return (Math.pow(1 - t, 3) * a +
        3 * t * (Math.pow(1 - t, 2)) * b +
        3 * Math.pow(t, 2) * (1 - t) * c +
        Math.pow(t, 3) * d );
};

/** 
 * 该动作按照贝塞尔曲线路径将目标移动到指定的位置。
 * 相对于它的运动。
 * @class
 * @extends cc.ActionInterval
 * @param {Number} t 以秒为单位
 * @param {Array} c 点数组
 * @example
 * var bezier = [cc.p(0, windowSize.height / 2), cc.p(300, -windowSize.height / 2), cc.p(300, 100)];
 * var bezierForward = new cc.BezierBy(3, bezier);
 */
cc.BezierBy = cc.ActionInterval.extend(/** @lends cc.BezierBy# */{
    _config:null,
    _startPosition:null,
    _previousPosition:null,

	/**
     	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Number} t 以秒为单位
	 * @param {Array} c 点数组
	 */
    ctor:function (t, c) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._config = [];
        this._startPosition = cc.p(0, 0);
        this._previousPosition = cc.p(0, 0);

		c && this.initWithDuration(t, c);
    },

    /**
     * 初始化这个动作。
     * @param {Number} t 以秒为单位
     * @param {Array} c 点数组
     * @return {Boolean}
     */
    initWithDuration:function (t, c) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, t)) {
            this._config = c;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.BezierBy}
     */
    clone:function () {
        var action = new cc.BezierBy();
        this._cloneDecoration(action);
        var newConfigs = [];
        for (var i = 0; i < this._config.length; i++) {
            var selConf = this._config[i];
            newConfigs.push(cc.p(selConf.x, selConf.y));
        }
        action.initWithDuration(this._duration, newConfigs);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        var locPosX = target.getPositionX();
        var locPosY = target.getPositionY();
        this._previousPosition.x = locPosX;
        this._previousPosition.y = locPosY;
        this._startPosition.x = locPosX;
        this._startPosition.y = locPosY;
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number} dt
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        if (this.target) {
            var locConfig = this._config;
            var xa = 0;
            var xb = locConfig[0].x;
            var xc = locConfig[1].x;
            var xd = locConfig[2].x;

            var ya = 0;
            var yb = locConfig[0].y;
            var yc = locConfig[1].y;
            var yd = locConfig[2].y;

            var x = cc.bezierAt(xa, xb, xc, xd, dt);
            var y = cc.bezierAt(ya, yb, yc, yd, dt);

            var locStartPosition = this._startPosition;
            if (cc.ENABLE_STACKABLE_ACTIONS) {
                var targetX = this.target.getPositionX();
                var targetY = this.target.getPositionY();
                var locPreviousPosition = this._previousPosition;

                locStartPosition.x = locStartPosition.x + targetX - locPreviousPosition.x;
                locStartPosition.y = locStartPosition.y + targetY - locPreviousPosition.y;
                x = x + locStartPosition.x;
                y = y + locStartPosition.y;
	            locPreviousPosition.x = x;
	            locPreviousPosition.y = y;
	            this.target.setPosition(x, y);
            } else {
                this.target.setPosition(locStartPosition.x + x, locStartPosition.y + y);
            }
        }
    },

    /**
     * 返回一个反转的动作。
     * @return {cc.BezierBy}
     */
    reverse:function () {
        var locConfig = this._config;
        var r = [
            cc.pAdd(locConfig[1], cc.pNeg(locConfig[2])),
            cc.pAdd(locConfig[0], cc.pNeg(locConfig[2])),
            cc.pNeg(locConfig[2]) ];
        var action = new cc.BezierBy(this._duration, r);
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    }
});

/**
 * 该动作按照贝塞尔曲线路径将目标移动到指定的位置。
 * 相对于它的运动。
 * @function
 * @param {Number} t 以秒为单位
 * @param {Array} c 点数组
 * @return {cc.BezierBy}
 * @example
 * // 示例
 * var bezier = [cc.p(0, windowSize.height / 2), cc.p(300, -windowSize.height / 2), cc.p(300, 100)];
 * var bezierForward = cc.bezierBy(3, bezier);
 */
cc.bezierBy = function (t, c) {
    return new cc.BezierBy(t, c);
};

/**
 * 使用cc.bezierBy代替。
 * 该动作按照贝塞尔曲线路径将目标移动到指定的位置。
 * 相对于它的运动。
 * @static
 * @deprecated 自v3.0以后使用cc.bezierBy代替。
 * @param {Number} t 以秒为单位
 * @param {Array} c 点数组
 * @return {cc.BezierBy}
 */
cc.BezierBy.create = cc.bezierBy;

/** 
 * 该动作按照贝塞尔曲线路径将目标移动到指定的位置。
 * @class
 * @extends cc.BezierBy
 * @param {Number} t
 * @param {Array} c 点数组
 * @example
 * var bezier = [cc.p(0, windowSize.height / 2), cc.p(300, -windowSize.height / 2), cc.p(300, 100)];
 * var bezierTo = new cc.BezierTo(2, bezier);
 */
cc.BezierTo = cc.BezierBy.extend(/** @lends cc.BezierTo# */{
    _toConfig:null,

	/**
     	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Number} t
	 * @param {Array} c 点数组
	 * var bezierTo = new cc.BezierTo(2, bezier);
	 */
    ctor:function (t, c) {
        cc.BezierBy.prototype.ctor.call(this);
        this._toConfig = [];
		c && this.initWithDuration(t, c);
    },

    /**
     * 初始化这个动作。
     * @param {Number} t 时间以秒为单位
     * @param {Array} c 点的数组
     * @return {Boolean}
     */
    initWithDuration:function (t, c) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, t)) {
            this._toConfig = c;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.BezierTo}
     */
    clone:function () {
        var action = new cc.BezierTo();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._toConfig);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.BezierBy.prototype.startWithTarget.call(this, target);
        var locStartPos = this._startPosition;
        var locToConfig = this._toConfig;
        var locConfig = this._config;

        locConfig[0] = cc.pSub(locToConfig[0], locStartPos);
        locConfig[1] = cc.pSub(locToConfig[1], locStartPos);
        locConfig[2] = cc.pSub(locToConfig[2], locStartPos);
    }
});

/**
 * 该动作按照贝塞尔曲线路径将目标移动到指定的位置。
 * @function
 * @param {Number} t
 * @param {Array} c 点数组
 * @return {cc.BezierTo}
 * @example
 * // 示例
 * var bezier = [cc.p(0, windowSize.height / 2), cc.p(300, -windowSize.height / 2), cc.p(300, 100)];
 * var bezierTo = cc.bezierTo(2, bezier);
 */
cc.bezierTo = function (t, c) {
    return new cc.BezierTo(t, c);
};

/**
 * 使用cc.bezierTo代替
 * @static
 * @deprecated 自v3.0以后使用cc.bezierTo代替
 * @param {Number} t
 * @param {Array} c 点数组
 * @return {cc.BezierTo}
 */
cc.BezierTo.create = cc.bezierTo;

/** 通过修改cc.Node的scale属性，变换它的缩放比例。
 * @warning 这个动作不支持"reverse"
 * @class
 * @extends cc.ActionInterval
 * @param {Number} duration
 * @param {Number} sx  X轴缩放比例
 * @param {Number} [sy] Y轴缩放比例，如果为Null则和sx相等
 * @example
 * // X和Y都缩放0.5
 * var actionTo = new cc.ScaleTo(2, 0.5);
 *
 * // X缩放0.5，Y缩放2
 * var actionTo = new cc.ScaleTo(2, 0.5, 2);
 */
cc.ScaleTo = cc.ActionInterval.extend(/** @lends cc.ScaleTo# */{
    _scaleX:1,
    _scaleY:1,
    _startScaleX:1,
    _startScaleY:1,
    _endScaleX:0,
    _endScaleY:0,
    _deltaX:0,
    _deltaY:0,

	/**
    	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Number} duration
	 * @param {Number} sx  X轴缩放比例
	 * @param {Number} [sy] Y轴缩放比例，如果为Null则和sx相等
	 */
    ctor:function (duration, sx, sy) {
        cc.ActionInterval.prototype.ctor.call(this);
		sx !== undefined && this.initWithDuration(duration, sx, sy);
    },

    /**
     * 初始化这个动作。
     * @param {Number} duration
     * @param {Number} sx
     * @param {Number} [sy=]
     * @return {Boolean}
     */
    initWithDuration:function (duration, sx, sy) { //function overload here
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._endScaleX = sx;
            this._endScaleY = (sy != null) ? sy : sx;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.ScaleTo}
     */
    clone:function () {
        var action = new cc.ScaleTo();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._endScaleX, this._endScaleY);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._startScaleX = target.scaleX;
        this._startScaleY = target.scaleY;
        this._deltaX = this._endScaleX - this._startScaleX;
        this._deltaY = this._endScaleY - this._startScaleY;
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number} dt
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        if (this.target) {
            this.target.scaleX = this._startScaleX + this._deltaX * dt;
	        this.target.scaleY = this._startScaleY + this._deltaY * dt;
        }
    }
});

/**
 * 通过修改cc.Node的scale属性，变换它的缩放比例。
 * @function
 * @param {Number} duration
 * @param {Number} sx  X轴缩放比例
 * @param {Number} [sy] Y轴缩放比例，如果为Null则和sx相等
 * @return {cc.ScaleTo}
 * @example
 * // 示例
 * // X和Y都缩放0.5
 * var actionTo = cc.scaleTo(2, 0.5);
 *
 * // X缩放0.5，Y缩放2
 * var actionTo = cc.scaleTo(2, 0.5, 2);
 */
cc.scaleTo = function (duration, sx, sy) { //function overload
    return new cc.ScaleTo(duration, sx, sy);
};

/**
 * 使用cc.scaleTo代替。
 * 通过修改cc.Node的scale属性，变换它的缩放比例。
 * @static
 * @deprecated 自v3.0以后使用cc.scaleTo代替。
 * @param {Number} duration
 * @param {Number} sx  X轴缩放比例
 * @param {Number} [sy] Y轴缩放比例，如果为Null则和sx相等
 * @return {cc.ScaleTo}
 */
cc.ScaleTo.create = cc.scaleTo;

/** 通过修改cc.Node的scale属性，变换它的缩放比例。
 * 与它原来的变换相关。
 * @class
 * @extends cc.ScaleTo
 */
cc.ScaleBy = cc.ScaleTo.extend(/** @lends cc.ScaleBy# */{

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ScaleTo.prototype.startWithTarget.call(this, target);
        this._deltaX = this._startScaleX * this._endScaleX - this._startScaleX;
        this._deltaY = this._startScaleY * this._endScaleY - this._startScaleY;
    },

    /**
     * 返回一个反转的动作。
     * @return {cc.ScaleBy}
     */
    reverse:function () {
        var action = new cc.ScaleBy(this._duration, 1 / this._endScaleX, 1 / this._endScaleY);
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.ScaleBy}
     */
    clone:function () {
        var action = new cc.ScaleBy();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._endScaleX, this._endScaleY);
        return action;
    }
});

/**
 * 通过修改cc.Node的scale属性，变换它的缩放比例。
 * 与它原来的变换相关。
 * @function
 * @param {Number} duration 以秒为单位
 * @param {Number} sx sx  X轴缩放比例
 * @param {Number|Null} [sy=] sy Y轴缩放比例，如果为Null则和sx相等
 * @return {cc.ScaleBy}
 * @example
 * // 示例，不输入sy，X和Y都缩放2
 * var actionBy = cc.scaleBy(2, 2);
 *
 * //示例，输入sy，X缩放0.25，Y缩放4.5
 * var actionBy2 = cc.scaleBy(2, 0.25, 4.5);
 */
cc.scaleBy = function (duration, sx, sy) {
    return new cc.ScaleBy(duration, sx, sy);
};

/**
 * 使用cc.scaleBy代替。
 * 通过修改cc.Node的scale属性，变换它的缩放比例。
 * 与它原来的变换相关。
 * @static
 * @deprecated 自v3.0 使用cc.scaleBy代替。
 * @param {Number} duration 以秒为单位
 * @param {Number} sx sx  X轴缩放比例
 * @param {Number|Null} [sy=] sy Y轴缩放比例，如果为Null则和sx相等
 * @return {cc.ScaleBy}
 */
cc.ScaleBy.create = cc.scaleBy;

/** 通过修改一个cc.Node对象的可见性属性，闪烁这个对象。
 * @class
 * @extends cc.ActionInterval
 * @param {Number} duration 以秒为单位
 * @param {Number} blinks  闪烁次数
 * @example
 * var action = new cc.Blink(2, 10);
 */
cc.Blink = cc.ActionInterval.extend(/** @lends cc.Blink# */{
    _times:0,
    _originalState:false,

	/**
    	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
     	 * @param {Number} duration  以秒为单位
	 * @param {Number} blinks 闪烁次数
	 */
    ctor:function (duration, blinks) {
        cc.ActionInterval.prototype.ctor.call(this);
		blinks !== undefined && this.initWithDuration(duration, blinks);
    },

    /**
     * 初始化这个动作。
     * @param {Number} duration 以秒为单位
     * @param {Number} blinks 闪烁次数
     * @return {Boolean}
     */
    initWithDuration:function (duration, blinks) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._times = blinks;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.Blink}
     */
    clone:function () {
        var action = new cc.Blink();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._times);
        return action;
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number} dt 以秒为单位
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        if (this.target && !this.isDone()) {
            var slice = 1.0 / this._times;
            var m = dt % slice;
            this.target.visible = (m > (slice / 2));
        }
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._originalState = target.visible;
    },

    /**
     * 停止动作。
     */
    stop:function () {
        this.target.visible = this._originalState;
        cc.ActionInterval.prototype.stop.call(this);
    },

    /**
     * 返回一个反转的动作。
     * @return {cc.Blink}
     */
    reverse:function () {
        var action = new cc.Blink(this._duration, this._times);
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    }
});
/**
 * 通过修改一个cc.Node对象的可见性属性，闪烁这个对象。
 * @function
 * @param {Number} duration 以秒为单位
 * @param blinks 闪烁的次数
 * @return {cc.Blink}
 * @example
 * // example
 * var action = cc.blink(2, 10);
 */

cc.blink = function (duration, blinks) {
    return new cc.Blink(duration, blinks);
};
/**
 * 使用cc.blink代替。
 * 通过修改一个cc.Node对象的可见性属性，闪烁这个对象。
 * @static
 * @deprecated 自v3.0以后使用cc.blink代替。
 * @param {Number} duration  以秒为单位
 * @param blinks 闪烁次数
 * @return {cc.Blink}
 */
cc.Blink.create = cc.blink;

/** 渐变一个对象的透明度（遵循cc.RGBAProtocol协议）。从当前透明度到一个自定义值。
 * @warning 这个动作不支持"reverse"。
 * @class
 * @extends cc.ActionInterval
 * @param {Number} duration
 * @param {Number} opacity 0-255，0是透明。
 * @example
 * var action = new cc.FadeTo(1.0, 0);
 */
cc.FadeTo = cc.ActionInterval.extend(/** @lends cc.FadeTo# */{
    _toOpacity:0,
    _fromOpacity:0,

	/**
    	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Number} duration
	 * @param {Number} opacity 0-255，0是透明。
	 */
    ctor:function (duration, opacity) {
        cc.ActionInterval.prototype.ctor.call(this);
		opacity !== undefined && this.initWithDuration(duration, opacity);
    },

    /**
     * 初始化这个动作。
     * @param {Number} duration  以秒为单位
     * @param {Number} opacity
     * @return {Boolean}
     */
    initWithDuration:function (duration, opacity) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._toOpacity = opacity;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.FadeTo}
     */
    clone:function () {
        var action = new cc.FadeTo();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._toOpacity);
        return action;
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number} time 以秒为单位
     */
    update:function (time) {
        time = this._computeEaseTime(time);
        var fromOpacity = this._fromOpacity !== undefined ? this._fromOpacity : 255;
        this.target.opacity = fromOpacity + (this._toOpacity - fromOpacity) * time;

    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._fromOpacity = target.opacity;
    }
});

/**
 * 渐变一个对象的透明度（遵循cc.RGBAProtocol协议）。从当前透明度到一个自定义值。
 * @function
 * @param {Number} duration
 * @param {Number} opacity 0-255，0是透明。
 * @return {cc.FadeTo}
 * @example
 * // 示例
 * var action = cc.fadeTo(1.0, 0);
 */
cc.fadeTo = function (duration, opacity) {
    return new cc.FadeTo(duration, opacity);
};

/**
 * 使用cc.fadeTo代替。
 * 渐变一个对象的透明度（遵循cc.RGBAProtocol协议）。从当前透明度到一个自定义值。
 * @static
 * @deprecated 自v3.0以后使用cc.fadeTo代替。
 * @param {Number} duration
 * @param {Number} opacity 0-255，0是透明。
 * @return {cc.FadeTo}
 */
cc.FadeTo.create = cc.fadeTo;

/** 淡入一个对象（遵循cc.RGBAProtocol协议）。透明度从0变化到255。<br/>
 * "reverse"动作是FadeOut。
 * @class
 * @extends cc.FadeTo
 * @param {Number} duration duration in seconds
 */
cc.FadeIn = cc.FadeTo.extend(/** @lends cc.FadeIn# */{
    _reverseAction: null,

    /**
     * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
     * @param {Number} duration 以秒为单位
     */
    ctor:function (duration) {
        cc.FadeTo.prototype.ctor.call(this);
        duration && this.initWithDuration(duration, 255);
    },

    /**
     * 返回一个反转的动作。
     * @return {cc.FadeOut}
     */
    reverse:function () {
        var action = new cc.FadeOut();
        action.initWithDuration(this._duration, 0);
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.FadeIn}
     */
    clone:function () {
        var action = new cc.FadeIn();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._toOpacity);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        if(this._reverseAction)
            this._toOpacity = this._reverseAction._fromOpacity;
        cc.FadeTo.prototype.startWithTarget.call(this, target);
    }
});

/**
 * 淡入一个对象（遵循cc.RGBAProtocol协议）。透明度从0变化到255。
 * @function
 * @param {Number} duration duration in seconds
 * @return {cc.FadeIn}
 * @example
 * //举例
 * var action = cc.fadeIn(1.0);
 */
cc.fadeIn = function (duration) {
    return new cc.FadeIn(duration);
};

/**
 * 使用cc.fadeIn代替。
 * 淡入一个对象（遵循cc.RGBAProtocol协议）。透明度从0变化到255。
 * @static
 * @deprecated 自v3.0以后使用cc.fadeIn代替.
 * @param {Number} duration 以秒为单位
 * @return {cc.FadeIn}
 */
cc.FadeIn.create = cc.fadeIn;

/** 淡出一个对象（遵循cc.RGBAProtocol协议）。透明度从255变化到0。
 * "reverse"动作是FadeIn。
 * @class
 * @extends cc.FadeTo
 * @param {Number} duration 以秒为单位
 */
cc.FadeOut = cc.FadeTo.extend(/** @lends cc.FadeOut# */{

    /**
     * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
     * @param {Number} duration 以秒为单位
     */
    ctor:function (duration) {
        cc.FadeTo.prototype.ctor.call(this);
        duration && this.initWithDuration(duration, 0);
    },

    /**
     * 返回一个反转的动作。
     * @return {cc.FadeIn}
     */
    reverse:function () {
        var action = new cc.FadeIn();
        action._reverseAction = this;
        action.initWithDuration(this._duration, 255);
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.FadeOut}
     */
    clone:function () {
        var action = new cc.FadeOut();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._toOpacity);
        return action;
    }
});

/**
 * 淡出一个对象（遵循cc.RGBAProtocol协议）。透明度从255变化到0。
 * @function
 * @param {Number} d  以秒为单位
 * @return {cc.FadeOut}
 * @example
 * // 示例
 * var action = cc.fadeOut(1.0);
 */
cc.fadeOut = function (d) {
    return new cc.FadeOut(d);
};

/**
 * 使用cc.fadeOut代替。
 * 淡出一个对象（遵循cc.RGBAProtocol协议）。透明度从255变化到0。
 * @static
 * @deprecated 自v3.0以后使用cc.fadeOut代替.
 * @param {Number} d  以秒为单位
 * @return {cc.FadeOut}
 */
cc.FadeOut.create = cc.fadeOut;

/** 改变一个cc.Node的颜色（遵循cc.NodeRGB约定）。
 * @warning 这个动作不支持"reverse"
 * @class
 * @extends cc.ActionInterval
 * @param {Number} duration
 * @param {Number} red 0-255
 * @param {Number} green  0-255
 * @param {Number} blue 0-255
 * @example
 * var action = new cc.TintTo(2, 255, 0, 255);
 */
cc.TintTo = cc.ActionInterval.extend(/** @lends cc.TintTo# */{
    _to:null,
    _from:null,

	/**
    	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Number} duration
	 * @param {Number} red 0-255
	 * @param {Number} green  0-255
	 * @param {Number} blue 0-255
	 */
    ctor:function (duration, red, green, blue) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._to = cc.color(0, 0, 0);
        this._from = cc.color(0, 0, 0);

		blue !== undefined && this.initWithDuration(duration, red, green, blue);
    },

    /**
     * 初始化这个动作。
     * @param {Number} duration
     * @param {Number} red 0-255
     * @param {Number} green 0-255
     * @param {Number} blue 0-255
     * @return {Boolean}
     */
    initWithDuration:function (duration, red, green, blue) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._to = cc.color(red, green, blue);
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.TintTo}
     */
    clone:function () {
        var action = new cc.TintTo();
        this._cloneDecoration(action);
        var locTo = this._to;
        action.initWithDuration(this._duration, locTo.r, locTo.g, locTo.b);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);

        this._from = this.target.color;
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number} dt 以秒为单位
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        var locFrom = this._from, locTo = this._to;
        if (locFrom) {
            this.target.color = cc.color(locFrom.r + (locTo.r - locFrom.r) * dt,
                                        locFrom.g + (locTo.g - locFrom.g) * dt,
	                                    locFrom.b + (locTo.b - locFrom.b) * dt);
        }
    }
});

/**
 * 改变一个cc.Node的颜色（遵循cc.NodeRGB约定）。
 * @function
 * @param {Number} duration
 * @param {Number} red 0-255
 * @param {Number} green  0-255
 * @param {Number} blue 0-255
 * @return {cc.TintTo}
 * @example
 * // 示例
 * var action = cc.tintTo(2, 255, 0, 255);
 */
cc.tintTo = function (duration, red, green, blue) {
    return new cc.TintTo(duration, red, green, blue);
};

/**
 * 使用cc.tintTo代替。
 * 改变一个cc.Node的颜色（遵循cc.NodeRGB约定）。
 * @static
 * @deprecated 自v3.0以后使用cc.tintTo代替.
 * @param {Number} duration
 * @param {Number} red 0-255
 * @param {Number} green  0-255
 * @param {Number} blue 0-255
 * @return {cc.TintTo}
 */
cc.TintTo.create = cc.tintTo;

/**  改变一个cc.Node的颜色（遵循cc.NodeRGB约定）。
 * 与它们自己的颜色变化相关。
 * @class
 * @extends cc.ActionInterval
 * @param {Number} duration  以秒为单位
 * @param {Number} deltaRed
 * @param {Number} deltaGreen
 * @param {Number} deltaBlue
 * @example
 * var action = new cc.TintBy(2, -127, -255, -127);
 */
cc.TintBy = cc.ActionInterval.extend(/** @lends cc.TintBy# */{
    _deltaR:0,
    _deltaG:0,
    _deltaB:0,

    _fromR:0,
    _fromG:0,
    _fromB:0,

	/**
    	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。
	 * @param {Number} duration  以秒为单位
	 * @param {Number} deltaRed
	 * @param {Number} deltaGreen
	 * @param {Number} deltaBlue
	 */
    ctor:function (duration, deltaRed, deltaGreen, deltaBlue) {
        cc.ActionInterval.prototype.ctor.call(this);
		deltaBlue !== undefined && this.initWithDuration(duration, deltaRed, deltaGreen, deltaBlue);
    },

    /**
     * 初始化这个动作。
     * @param {Number} duration
     * @param {Number} deltaRed 0-255
     * @param {Number} deltaGreen 0-255
     * @param {Number} deltaBlue 0-255
     * @return {Boolean}
     */
    initWithDuration:function (duration, deltaRed, deltaGreen, deltaBlue) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._deltaR = deltaRed;
            this._deltaG = deltaGreen;
            this._deltaB = deltaBlue;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.TintBy}
     */
    clone:function () {
        var action = new cc.TintBy();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration, this._deltaR, this._deltaG, this._deltaB);
        return action;
    },

    /**
     * 指定目标，并且开始动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);

        var color = target.color;
        this._fromR = color.r;
        this._fromG = color.g;
        this._fromB = color.b;

    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number} dt 以秒为单位
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);

        this.target.color = cc.color(this._fromR + this._deltaR * dt,
                                    this._fromG + this._deltaG * dt,
                                    this._fromB + this._deltaB * dt);

    },

    /**
     * 返回一个反转的动作。
     * @return {cc.TintBy}
     */
    reverse:function () {
        var action = new cc.TintBy(this._duration, -this._deltaR, -this._deltaG, -this._deltaB);
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    }
});

/**
 * 改变一个cc.Node的颜色（遵循cc.NodeRGB约定）。
 * 与它们自己的颜色变化相关。
 * @function
 * @param {Number} duration  以秒为单位
 * @param {Number} deltaRed
 * @param {Number} deltaGreen
 * @param {Number} deltaBlue
 * @return {cc.TintBy}
 * @example
 * // 示例
 * var action = cc.tintBy(2, -127, -255, -127);
 */
cc.tintBy = function (duration, deltaRed, deltaGreen, deltaBlue) {
    return new cc.TintBy(duration, deltaRed, deltaGreen, deltaBlue);
};

/**
 * 使用cc.tintBy代替
 * 改变一个cc.Node的颜色（遵循cc.NodeRGB约定）。
 * 与它们自己的颜色变化相关。
 * @static
 * @deprecated since v3.0 please use cc.tintBy instead.
 * @param {Number} duration  以秒为单位
 * @param {Number} deltaRed
 * @param {Number} deltaGreen
 * @param {Number} deltaBlue
 * @return {cc.TintBy}
 */
cc.TintBy.create = cc.tintBy;

/** 延时动作，延迟一个特定的时间后执行动作
 * @class
 * @extends cc.ActionInterval
 */
cc.DelayTime = cc.ActionInterval.extend(/** @lends cc.DelayTime# */{
    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * 将被重写
     * @param {Number} dt 时间以秒为单位
     */
    update:function (dt) {},

    /**
     * 返回一个逆向动作。
     * @return {cc.DelayTime}
     */
    reverse:function () {
        var action = new cc.DelayTime(this._duration);
        this._cloneDecoration(action);
        this._reverseEaseList(action);
        return action;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.DelayTime}
     */
    clone:function () {
        var action = new cc.DelayTime();
        this._cloneDecoration(action);
        action.initWithDuration(this._duration);
        return action;
    }
});

/**
 * 延时动作，延迟一个特定的时间后执行动作
 * @function
 * @param {Number} d 持续时间，以秒为单位
 * @return {cc.DelayTime}
 * @example
 * // 示例
 * var delay = cc.delayTime(1);
 */
cc.delayTime = function (d) {
    return new cc.DelayTime(d);
};

/**
 * 使用cc.delayTime代替。
 * 延时动作，延迟一个特定的时间后执行动作
 * @static
 * @deprecated 自v3.0以后使用cc.delayTime代替。
 * @param {Number} d 持续时间，以秒为单位
 * @return {cc.DelayTime}
 */
cc.DelayTime.create = cc.delayTime;

/**
 * <p>
 * 使用相反的顺序执行动作，从time=duration到time=0。                             <br/>
 * @warning 小心使用这个动作。这个动作不能用在串行动作序列中。                                <br/>
 * 可以把他作为你自有动作的默认“reversed”方法，但是不推荐在“reversed”范围以外使用。<br/>
 * </p>
 * @class
 * @extends cc.ActionInterval
 * @param {cc.FiniteTimeAction} action
 * @example
 *  var reverse = new cc.ReverseTime(this);
 */
cc.ReverseTime = cc.ActionInterval.extend(/** @lends cc.ReverseTime# */{
    _other:null,

	/**
    	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this
	 * @param {cc.FiniteTimeAction} action
	 */
    ctor:function (action) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._other = null;

		action && this.initWithAction(action);
    },

    /**
     * @param {cc.FiniteTimeAction} action
     * @return {Boolean}
     */
    initWithAction:function (action) {
        if(!action)
            throw "cc.ReverseTime.initWithAction(): action must be non null";
        if(action == this._other)
            throw "cc.ReverseTime.initWithAction(): the action was already passed in.";

        if (cc.ActionInterval.prototype.initWithDuration.call(this, action._duration)) {
            // Don't leak if action is reused
            this._other = action;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.ReverseTime}
     */
    clone:function () {
        var action = new cc.ReverseTime();
        this._cloneDecoration(action);
        action.initWithAction(this._other.clone());
        return action;
    },

    /**
     * 指定目标，并且开始一个动作。
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._other.startWithTarget(target);
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number} dt 以秒为单位
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        if (this._other)
            this._other.update(1 - dt);
    },

    /**
     * 返回一个反转的动作。
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return this._other.clone();
    },

    /**
     * 停止动作。
     */
    stop:function () {
        this._other.stop();
        cc.Action.prototype.stop.call(this);
    }
});

/**
 * 使用相反的顺序执行动作，从time=duration到time=0。
 * @function
 * @param {cc.FiniteTimeAction} action
 * @return {cc.ReverseTime}
 * @example
 * // 示例
 *  var reverse = cc.reverseTime(this);
 */
cc.reverseTime = function (action) {
    return new cc.ReverseTime(action);
};

/**
 * 使用cc.reverseTime代替。
 * 使用相反的顺序执行动作，从time=duration到time=0。
 * @static
 * @deprecated 自v3.0以后使用cc.reverseTime代替。
 * @param {cc.FiniteTimeAction} action
 * @return {cc.ReverseTime}
 */
cc.ReverseTime.create = cc.reverseTime;

/** 通过一个给出的动画驱动一个精灵
 * @class
 * @extends cc.ActionInterval
 * @param {cc.Animation} animation
 * @example
 * //使用动画创建animate
 * var anim = new cc.Animate(dance_grey);
 */
cc.Animate = cc.ActionInterval.extend(/** @lends cc.Animate# */{
    _animation:null,
    _nextFrame:0,
    _origFrame:null,
    _executedLoops:0,
    _splitTimes:null,

	/**
    	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。<br />
	 * 使用动画创建animate。
	 * @param {cc.Animation} animation
	 */
    ctor:function (animation) {
        cc.ActionInterval.prototype.ctor.call(this);
        this._splitTimes = [];

		animation && this.initWithAnimation(animation);
    },

    /**
     * @return {cc.Animation}
     */
    getAnimation:function () {
        return this._animation;
    },

    /**
     * @param {cc.Animation} animation
     */
    setAnimation:function (animation) {
        this._animation = animation;
    },

    /**
     * @param {cc.Animation} animation
     * @return {Boolean}
     */
    initWithAnimation:function (animation) {
        if(!animation)
            throw "cc.Animate.initWithAnimation(): animation must be non-NULL";
        var singleDuration = animation.getDuration();
        if (this.initWithDuration(singleDuration * animation.getLoops())) {
            this._nextFrame = 0;
            this.setAnimation(animation);

            this._origFrame = null;
            this._executedLoops = 0;
            var locTimes = this._splitTimes;
            locTimes.length = 0;

            var accumUnitsOfTime = 0;
            var newUnitOfTimeValue = singleDuration / animation.getTotalDelayUnits();

            var frames = animation.getFrames();
            cc.arrayVerifyType(frames, cc.AnimationFrame);

            for (var i = 0; i < frames.length; i++) {
                var frame = frames[i];
                var value = (accumUnitsOfTime * newUnitOfTimeValue) / singleDuration;
                accumUnitsOfTime += frame.getDelayUnits();
                locTimes.push(value);
            }
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象。
     * @returns {cc.Animate}
     */
    clone:function () {
        var action = new cc.Animate();
        this._cloneDecoration(action);
        action.initWithAnimation(this._animation.clone());
        return action;
    },

    /**
     * 指定目标，并且开始一个动作。
     * @param {cc.Sprite} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        if (this._animation.getRestoreOriginalFrame())
            this._origFrame = target.displayFrame();
        this._nextFrame = 0;
        this._executedLoops = 0;
    },

    /**
     * 每帧调用一次。时间是两帧之间间隔的秒数。
     * @param {Number} dt
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        // if t==1, ignore. Animation should finish with t==1
        if (dt < 1.0) {
            dt *= this._animation.getLoops();

            // new loop?  If so, reset frame counter
            var loopNumber = 0 | dt;
            if (loopNumber > this._executedLoops) {
                this._nextFrame = 0;
                this._executedLoops++;
            }

            // new t for animations
            dt = dt % 1.0;
        }

        var frames = this._animation.getFrames();
        var numberOfFrames = frames.length, locSplitTimes = this._splitTimes;
        for (var i = this._nextFrame; i < numberOfFrames; i++) {
            if (locSplitTimes[i] <= dt) {
                this.target.setSpriteFrame(frames[i].getSpriteFrame());
                this._nextFrame = i + 1;
            } else {
                // Issue 1438. Could be more than one frame per tick, due to low frame rate or frame delta < 1/FPS
                break;
            }
        }
    },

    /**
     * 返回一个反转的动作
     * @return {cc.Animate}
     */
    reverse:function () {
        var locAnimation = this._animation;
        var oldArray = locAnimation.getFrames();
        var newArray = [];
        cc.arrayVerifyType(oldArray, cc.AnimationFrame);
        if (oldArray.length > 0) {
            for (var i = oldArray.length - 1; i >= 0; i--) {
                var element = oldArray[i];
                if (!element)
                    break;
                newArray.push(element.clone());
            }
        }
        var newAnim = new cc.Animation(newArray, locAnimation.getDelayPerUnit(), locAnimation.getLoops());
        newAnim.setRestoreOriginalFrame(locAnimation.getRestoreOriginalFrame());
        var action = new cc.Animate(newAnim);
        this._cloneDecoration(action);
        this._reverseEaseList(action);

        return action;
    },

    /**
     * 停止动作
     */
    stop:function () {
        if (this._animation.getRestoreOriginalFrame() && this.target)
            this.target.setSpriteFrame(this._origFrame);
        cc.Action.prototype.stop.call(this);
    }
});

/**
 * 使用动画创建animate
 * @function
 * @param {cc.Animation} animation
 * @return {cc.Animate}
 * @example
 * // 示例
 * // 使用动画创建animate
 * var anim = cc.animate(dance_grey);
 */
cc.animate = function (animation) {
    return new cc.Animate(animation);
};

/**
 * 使用cc.animate代替
 * 使用动画创建animate
 * @static
 * @deprecated 自v3.0以后使用cc.animate代替
 * @param {cc.Animation} animation
 * @return {cc.Animate}
 */
cc.Animate.create = cc.animate;

/**
 * <p>
 *	改写一个动作的目标，让这个动作可以在创建的时候运行在一个特定的目标上，<br/>
 *	而不是运行在在通过runAction指定的目标。 
 * </p>
 * @class
 * @extends cc.ActionInterval
 * @param {cc.Node} target
 * @param {cc.FiniteTimeAction} action
 */
cc.TargetedAction = cc.ActionInterval.extend(/** @lends cc.TargetedAction# */{
    _action:null,
    _forcedTarget:null,

	/**
    	 * 构造函数，重载它以扩展构造函数的行为，记得在扩展的“ctor”方法中调用“this._super()”。<br />
	 * 使用一个具体的动作和强制对象创建一个动作。
	 * @param {cc.Node} target
	 * @param {cc.FiniteTimeAction} action
	 */
    ctor: function (target, action) {
        cc.ActionInterval.prototype.ctor.call(this);
		action && this.initWithTarget(target, action);
    },

    /**
     * 使用具体的动作和强制目标初始化动作
     * @param {cc.Node} target
     * @param {cc.FiniteTimeAction} action
     * @return {Boolean}
     */
    initWithTarget:function (target, action) {
        if (this.initWithDuration(action._duration)) {
            this._forcedTarget = target;
            this._action = action;
            return true;
        }
        return false;
    },

    /**
     * 返回动作的克隆对象
     * @returns {cc.TargetedAction}
     */
    clone:function () {
        var action = new cc.TargetedAction();
        this._cloneDecoration(action);
        action.initWithTarget(this._forcedTarget, this._action.clone());
        return action;
    },

    /**
     * 设置目标，并且开始动作
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._action.startWithTarget(this._forcedTarget);
    },

    /**
     * 停止动作
     */
    stop:function () {
        this._action.stop();
    },

    /**
     * 每一帧调用一次这个方法。时间是两帧之间的时间间隔。
     * @param {Number} dt
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        this._action.update(dt);
    },

    /**
     * 返回强制运行这个动作的目标
     * @return {cc.Node}
     */
    getForcedTarget:function () {
        return this._forcedTarget;
    },

    /**
     * 设置强制运行这个动作的目标
     * @param {cc.Node} forcedTarget
     */
    setForcedTarget:function (forcedTarget) {
        if (this._forcedTarget != forcedTarget)
            this._forcedTarget = forcedTarget;
    }
});

/**
 * 用具体的动作和强制的目标创建一个动作
 * @function
 * @param {cc.Node} target
 * @param {cc.FiniteTimeAction} action
 * @return {cc.TargetedAction}
 */
cc.targetedAction = function (target, action) {
    return new cc.TargetedAction(target, action);
};

/**
 * 请使用cc.targetedAction代替
 * 用具体的动作和强制的目标创建一个动作
 * @static
 * @deprecated 自v3.0以后请使用cc.targetedAction代替
 * @param {cc.Node} target
 * @param {cc.FiniteTimeAction} action
 * @return {cc.TargetedAction}
 */
cc.TargetedAction.create = cc.targetedAction;

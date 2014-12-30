/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (C) 2010      Lam Pham

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
 * 百分比进度条
 * @class
 * @extends cc.ActionInterval
 * @param {Number} duration 以秒为单位
 * @param {Number} percent
 * @example
 * var to = new cc.ProgressTo(2, 100);
 */
cc.ProgressTo = cc.ActionInterval.extend(/** @lends cc.ProgressTo# */{
    _to:0,
    _from:0,

	/**
	 * 使用持续时间和百分比创建一个ProgressTo action
	 * cc.ProgressTo构造函数
     * @param {Number} duration 以秒为单位
     * @param {Number} percent
	 */
    ctor: function(duration, percent){
        cc.ActionInterval.prototype.ctor.call(this);
        this._to = 0;
        this._from = 0;

		percent !== undefined && this.initWithDuration(duration, percent);
    },

    /** 使用持续时间和百分比进行初始化
     * @param {Number} duration 以秒为单位
     * @param {Number} percent
     * @return {Boolean}
     */
    initWithDuration:function (duration, percent) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._to = percent;
            return true;
        }
        return false;
    },
    /**
     * 返回一个cc.ProgressTo的克隆对象，所有的属性都和原对象相同
     * @returns {cc.ProgressTo}
     */
    clone:function(){
        var action = new cc.ProgressTo();
        action.initWithDuration(this._duration, this._to);
        return action;
    },
    /**
     * 反转未实现
     * @returns {null}
     */
    reverse: function(){
        cc.log("cc.ProgressTo.reverse(): reverse hasn't been supported.");
        return null;
    },

    /**
     * 在一个target上启动
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        this._from = target.percentage;
    },

    /**
     * custom update
     * @param {Number} time 以秒为单位
     */
    update:function (time) {
        if (this.target  instanceof cc.ProgressTimer)
            this.target.percentage = this._from + (this._to - this._from) * time;
    }
});

/**
 * 通过持续时间和百分比创建并初始化
 * @function
 * @param {Number} duration 以秒为单位
 * @param {Number} percent
 * @return {cc.ProgressTo}
 * @example
 * // example
 * var to = cc.progressTo(2, 100);
 */
cc.progressTo = function (duration, percent) {
    return new cc.ProgressTo(duration, percent);
};
/**
 * 请使用 cc.progressTo 代替
 * 通过持续时间和百分比创建并初始化
 * @static
 * @deprecated 自v3.0弃用，使用cc.progressTo代替
 * @param {Number} duration 以秒为单位
 * @param {Number} percent
 * @return {cc.ProgressTo}
 */
cc.ProgressTo.create = cc.progressTo;

/**
 * 从起始百分比到结束百分比的进度条
 * @class
 * @extends cc.ActionInterval
 * @param {Number} duration 以秒为单位
 * @param {Number} fromPercentage
 * @param {Number} toPercentage
 * @example
 *  var fromTo = new cc.ProgressFromTo(2, 100.0, 0.0);
 */
cc.ProgressFromTo = cc.ActionInterval.extend(/** @lends cc.ProgressFromTo# */{
    _to:0,
    _from:0,

	/**
	 * 通过持续时间，起始百分比和结束百分比创建并初始化一个action
	 * cc.ProgressFromTo构造函数
     * @param {Number} duration duration in seconds
     * @param {Number} fromPercentage
     * @param {Number} toPercentage
	 */
    ctor:function(duration, fromPercentage, toPercentage){
        cc.ActionInterval.prototype.ctor.call(this);
        this._to = 0;
        this._from = 0;

		toPercentage !== undefined && this.initWithDuration(duration, fromPercentage, toPercentage);
    },

    /** 通过持续时间，起始百分比和结束百分比初始化这个action
     * @param {Number} duration 以秒为单位
     * @param {Number} fromPercentage
     * @param {Number} toPercentage
     * @return {Boolean}
     */
    initWithDuration:function (duration, fromPercentage, toPercentage) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._to = toPercentage;
            this._from = fromPercentage;
            return true;
        }
        return false;
    },
    /**
     * 返回一个cc.ProgressFromTo的克隆对象，所有的属性都和原对象相同
     * @returns {cc.ProgressFromTo}
     */
    clone:function(){
        var action = new cc.ProgressFromTo();
        action.initWithDuration(this._duration, this._from, this._to);
        return action;
    },

    /**
     * @return {cc.ActionInterval}
     */
    reverse:function () {
        return cc.progressFromTo(this._duration, this._to, this._from);
    },

    /**
     * 在一个target上启动
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
    },

    /**
     * @param {Number} time 以秒为单位
     */
    update:function (time) {
        if (this.target  instanceof cc.ProgressTimer)
            this.target.percentage = this._from + (this._to - this._from) * time;
    }
});

/** 通过持续时间，起始百分比和结束百分比创建并初始化一个action
 * @function
 * @param {Number} duration 以秒为单位
 * @param {Number} fromPercentage
 * @param {Number} toPercentage
 * @return {cc.ProgressFromTo}
 * @example
 * // 示例
 *  var fromTo = cc.progressFromTo(2, 100.0, 0.0);
 */
cc.progressFromTo = function (duration, fromPercentage, toPercentage) {
    return new cc.ProgressFromTo(duration, fromPercentage, toPercentage);
};
/**
 * 通过持续时间，起始百分比和结束百分比创建并初始化一个action
 * @static
 * @deprecated 自v3.0弃用，使用cc.ProgressFromTo(duration, fromPercentage, toPercentage) 代替。
 * @param {Number} duration duration in seconds
 * @param {Number} fromPercentage
 * @param {Number} toPercentage
 * @return {cc.ProgressFromTo}
 */
cc.ProgressFromTo.create = cc.progressFromTo;

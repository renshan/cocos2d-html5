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
 * <p>
 *    cc.AnimationFrame
 *    动画的一帧. 包含下列信息:
 *       - 精灵帧名称
 *       - # 延时时间
 *       - 偏移量
 * </p>
 * @class
 * @extends cc.Class	- 继承自cc.Class
 * @param spriteFrame	- 精灵帧
 * @param delayUnits	- 精灵帧的延时
 * @param userInfo	- 用户自定义的信息
 * @returns {AnimationFrame}	- 返回动画帧
 */
cc.AnimationFrame = cc.Class.extend(/** @lends cc.AnimationFrame# */{
    _spriteFrame:null,
    _delayPerUnit:0,
    _userInfo:null,

    ctor:function (spriteFrame, delayUnits, userInfo) {
        this._spriteFrame = spriteFrame || null;
        this._delayPerUnit = delayUnits || 0;
        this._userInfo = userInfo || null;
    },

    /**
     * 创建一个新的动画帧并且复制当前动画帧对象的所有内容
     * 
     * @returns {AnimationFrame}
     */
    clone: function(){
        var frame = new cc.AnimationFrame();
        frame.initWithSpriteFrame(this._spriteFrame.clone(), this._delayPerUnit, this._userInfo);
        return frame;
    },

    /**
     * 创建一个新的动画帧并且复制当前动画帧对象的所有内容
     * 
     * @returns {AnimationFrame}
     */
    copyWithZone:function (pZone) {
        return cc.clone(this);
    },

    /**
     * 创建一个新的动画帧并且复制当前动画帧对象的所有内容
     * 
     * @returns {AnimationFrame}
     */
    copy:function (pZone) {
        var newFrame = new cc.AnimationFrame();
        newFrame.initWithSpriteFrame(this._spriteFrame.clone(), this._delayPerUnit, this._userInfo);
        return newFrame;
    },

    /**
     * 初始化动画帧，有三个参数：精灵帧、延时单位数、用户的自定义数据
     * 
     * @param {cc.SpriteFrame} spriteFrame
     * @param {Number} delayUnits
     * @param {object} userInfo
     */
    initWithSpriteFrame:function (spriteFrame, delayUnits, userInfo) {
        this._spriteFrame = spriteFrame;
        this._delayPerUnit = delayUnits;
        this._userInfo = userInfo;

        return true;
    },

    /**
     * 获取将要被使用的精灵帧
     * 
     * @return {cc.SpriteFrame}
     */
    getSpriteFrame:function () {
        return this._spriteFrame;
    },

    /**
     * 设置将要被使用的精灵帧
     * 
     * @param {cc.SpriteFrame} spriteFrame
     */
    setSpriteFrame:function (spriteFrame) {
        this._spriteFrame = spriteFrame;
    },

    /**
     * 返回帧的总时间单位数量
     * 
     * @return {Number}
     */
    getDelayUnits:function () {
        return this._delayPerUnit;
    },

    /**
     * 设置帧的总时间单位数量
     * 
     * @param delayUnits
     */
    setDelayUnits:function (delayUnits) {
        this._delayPerUnit = delayUnits;
    },

    /**
     * 获取用户的自定义数据
     * 
     * @return {object}
     */
    getUserInfo:function () {
        return this._userInfo;
    },

    /**
     * 设置用户的自定义数据
     * 
     * @param {object} userInfo
     */
    setUserInfo:function (userInfo) {
        this._userInfo = userInfo;
    }
});

/**
 * 创建一个精灵帧
 * 
 * @deprecated v3.0以后弃用，请使用new的构造方式进行替代
 * 
 * @param {cc.SpriteFrame} spriteFrame
 * @param {Number} delayUnits
 * @param {object} userInfo
 * @see cc.AnimationFrame
 */
cc.AnimationFrame.create = function(spriteFrame,delayUnits,userInfo){
    return new cc.AnimationFrame(spriteFrame,delayUnits,userInfo);
};

/**
 * <p>
 *     在cc.Sprite对象展示动画时使用的一个cc.Animation对象.<br/>
 *     <br/>
 *      cc.Animation对象包括cc.SpriteFrame对象和两帧之间的时间. <br/>
 *      你可以使用cc.Animate动作动画化cc.Animation 对象.
 * </p>
 * @class
 * @extends cc.Class
 * @param {Array} frames
 * @param {Number} delay
 * @param {Number} [loops=1]
 *
 * @example
 * 
 * // 1. 创建一个空的动画帧
 * var animation1 = new cc.Animation();
 *
 * // 2. 分别使用精灵帧、延续时长、循环次数来创建动画
 * var spriteFrames = [];
 * var frame = cc.spriteFrameCache.getSpriteFrame("grossini_dance_01.png");
 * spriteFrames.push(frame);
 * var animation1 = new cc.Animation(spriteFrames);
 * var animation2 = new cc.Animation(spriteFrames, 0.2);
 * var animation2 = new cc.Animation(spriteFrames, 0.2, 2);
 *
 * // 3. 分别使用动画帧、延续时长、循环次数来创建动画
 * var animationFrames = [];
 * var frame =  new cc.AnimationFrame();
 * animationFrames.push(frame);
 * var animation1 = new cc.Animation(animationFrames);
 * var animation2 = new cc.Animation(animationFrames, 0.2);
 * var animation3 = new cc.Animation(animationFrames, 0.2, 2);
 *
 * // 通过动画来创建一个action
 * var action = cc.animate(animation1);
 *
 * // 运行动画
 * sprite.runAction(action);
 */
cc.Animation = cc.Class.extend(/** @lends cc.Animation# */{
    _frames:null,
    _loops:0,
    _restoreOriginalFrame:false,
    _duration:0,
    _delayPerUnit:0,
    _totalDelayUnits:0,

    ctor:function (frames, delay, loops) {
        this._frames = [];

		if (frames === undefined) {
			this.initWithSpriteFrames(null, 0);
		} else {
			var frame0 = frames[0];
			if(frame0){
				if (frame0 instanceof cc.SpriteFrame) {
					//init with sprite frames , delay and loops.
					this.initWithSpriteFrames(frames, delay, loops);
				}else if(frame0 instanceof cc.AnimationFrame) {
					//init with sprite frames , delay and loops.
					this.initWithAnimationFrames(frames, delay, loops);
				}
			}
		}
    },

    // 属性

    /**
     * 返回动画帧数组
     * 
     * @return {Array}
     */
    getFrames:function () {
        return this._frames;
    },

    /**
     * 设置动画帧数组
     * 
     * @param {Array} frames
     */
    setFrames:function (frames) {
        this._frames = frames;
    },

    /**
     * 新增一个动画帧，该帧默认为一个延时单位，总的动画帧长也增加一个延时单位
     * 
     * @param {cc.SpriteFrame} frame
     */
    addSpriteFrame:function (frame) {
        var animFrame = new cc.AnimationFrame();

        animFrame.initWithSpriteFrame(frame, 1, null);
        this._frames.push(animFrame);
        // update duration
        this._totalDelayUnits++;
    },

    /**
     * 使用图片的文件名新增一个精灵帧. 其内部会创建一个cc.SpriteFrame并添加它，该动画帧将自动添加一个延时单位
     * 
     * @param {String} fileName
     */
    addSpriteFrameWithFile:function (fileName) {
        var texture = cc.textureCache.addImage(fileName);
        var rect = cc.rect(0, 0, 0, 0);
        rect.width = texture.width;
        rect.height = texture.height;
        var frame = new cc.SpriteFrame(texture, rect);
        this.addSpriteFrame(frame);
    },

    /**
     * 通过texture和rect来创建一个精灵帧. 其内部会创建一个cc.SpriteFrame并添加它，该动画帧将自动添加一个延时单位
     * 
     * @param {cc.Texture2D} texture
     * @param {cc.Rect} rect
     */
    addSpriteFrameWithTexture:function (texture, rect) {
        var pFrame = new cc.SpriteFrame(texture, rect);
        this.addSpriteFrame(pFrame);
    },

    /**
     * 使用精灵帧来初始化一个动画，请使用构造函数传参的方式来进行初始化，不要主动调用该方法
     * 
     * @param {Array} arrayOfAnimationFrames
     * @param {Number} delayPerUnit
     * @param {Number} [loops=1]
     */
    initWithAnimationFrames:function (arrayOfAnimationFrames, delayPerUnit, loops) {
        cc.arrayVerifyType(arrayOfAnimationFrames, cc.AnimationFrame);

        this._delayPerUnit = delayPerUnit;
        this._loops = loops === undefined ? 1 : loops;
        this._totalDelayUnits = 0;

        var locFrames = this._frames;
        locFrames.length = 0;
        for (var i = 0; i < arrayOfAnimationFrames.length; i++) {
            var animFrame = arrayOfAnimationFrames[i];
            locFrames.push(animFrame);
            this._totalDelayUnits += animFrame.getDelayUnits();
        }

        return true;
    },

    /**
     * 克隆当前的动画
     * 
     * @return {cc.Animation}
     */
    clone: function(){
        var animation = new cc.Animation();
        animation.initWithAnimationFrames(this._copyFrames(), this._delayPerUnit, this._loops);
        animation.setRestoreOriginalFrame(this._restoreOriginalFrame);
        return animation;
    },

    /**
     * 克隆当前的动画
     * 
     * @return {cc.Animation}
     */
    copyWithZone:function (pZone) {
        var pCopy = new cc.Animation();
        pCopy.initWithAnimationFrames(this._copyFrames(), this._delayPerUnit, this._loops);
        pCopy.setRestoreOriginalFrame(this._restoreOriginalFrame);
        return pCopy;
    },

    _copyFrames:function(){
       var copyFrames = [];
        for(var i = 0; i< this._frames.length;i++)
            copyFrames.push(this._frames[i].clone());
        return copyFrames;
    },

    /**
     * 克隆当前的动画
     * 
     * @param pZone
     * @returns {cc.Animation}
     */
    copy:function (pZone) {
        return this.copyWithZone(null);
    },

    /**
     * 返回动画要循环执行的次数，0, 表示它不是一个动画. 1, 表示已经被执行过一次 ...
     * 
     * @return {Number}
     */
    getLoops:function () {
        return this._loops;
    },

    /**
     * 设置动画要循环执行的次数，0, 表示它不是一个动画. 1, 表示已经被执行过一次 ...
     * 
     * @param {Number} value
     */
    setLoops:function (value) {
        this._loops = value;
    },

    /**
     * 设置当动画播放完毕之后是否恢复成初始的帧
     * 
     * @param {Boolean} restOrigFrame
     */
    setRestoreOriginalFrame:function (restOrigFrame) {
        this._restoreOriginalFrame = restOrigFrame;
    },

    /**
     * 当动画完成时返回是否应该恢复原来的帧
     * 
     * @return {Boolean}
     */
    getRestoreOriginalFrame:function () {
        return this._restoreOriginalFrame;
    },

    /**
     * 返回整个动画的持续秒数. 它的结果等于总的延时单位数 * 每一个延时单位的时长
     * 
     * @return {Number}
     */
    getDuration:function () {
        return this._totalDelayUnits * this._delayPerUnit;
    },

    /**
     * 返回每一个延时单位的秒数
     * 
     * @return {Number}
     */
    getDelayPerUnit:function () {
        return this._delayPerUnit;
    },

    /**
     * 设置“延时单位”的秒数
     * 
     * @param {Number} delayPerUnit
     */
    setDelayPerUnit:function (delayPerUnit) {
        this._delayPerUnit = delayPerUnit;
    },

    /**
     * 返回cc.Animation总的延时单位数
     * 
     * @return {Number}
     */
    getTotalDelayUnits:function () {
        return this._totalDelayUnits;
    },

    /**
     * 通过帧与帧的一个延时来初始化cc.Animation, 但不要自己调用该方法,请使用构造函数传参的方式来初始化.
     * 
     * @param {Array} frames
     * @param {Number} delay
     * @param {Number} [loops=1]
     */
    initWithSpriteFrames:function (frames, delay, loops) {
        cc.arrayVerifyType(frames, cc.SpriteFrame);
        this._loops = loops === undefined ? 1 : loops;
        this._delayPerUnit = delay || 0;
        this._totalDelayUnits = 0;

        var locFrames = this._frames;
        locFrames.length = 0;
        if (frames) {
            for (var i = 0; i < frames.length; i++) {
                var frame = frames[i];
                var animFrame = new cc.AnimationFrame();
                animFrame.initWithSpriteFrame(frame, 1, null);
                locFrames.push(animFrame);
            }
            this._totalDelayUnits += frames.length;
        }
        return true;
    },
    /**
     * <p>目前的javaScript绑定(JSB),在一些示例中,需要使用retain和release. 这是JSB的一个bug,
     * 比较丑陋的一种解决方法是使用 retain/release. 所以,这2个方法是为了兼容JSB.
     * 这是一个hack,当JSB修复掉retain/release的bug后将它们将会被移除<br/>
     * 如果你创建一个引擎对象并没有在同一帧内将它添加到场景图中,你将需要保留这个对象的引用<br/>
     * 不然,JSB的自动释放池会认为该对象未被使用这而直接将它释放,<br/>
     * 之后当你想使用该对象时,你将会得到一个"无效的原生对象"的错误.<br/>
     * retain方法通过增加一个引用计数来避免原生的对象被释放掉,<br/>
     * 当该认为不再需要这个对象时你需要手工调用release方法,否则,将会发生内存泄露.<br/>
     * 在游戏的开发代码中应保证retain与release方法的配对.</p>
     * 
     * @function
     * @see 参见 cc.Animation#retain
     */
    retain:function () {
    },
    /**
     * <p>目前的javaScript绑定(JSB),在一些示例中,需要使用retain和release. 这是JSB的一个bug,
     * 比较丑陋的一种解决方法是使用 retain/release. 所以,这2个方法是为了兼容JSB.
     * 这是一个hack,当JSB修复掉retain/release的bug后将它们将会被移除<br/>
     * 如果你创建一个引擎对象并没有在同一帧内将它添加到场景图中,你将需要保留这个对象的引用<br/>
     * 不然,JSB的自动释放池会认为该对象未被使用这而直接将它释放,<br/>
     * 之后当你想使用该对象时,你将会得到一个"无效的原生对象"的错误.<br/>
     * retain方法通过增加一个引用计数来避免原生的对象被释放掉,<br/>
     * 当该认为不再需要这个对象时你需要手工调用release方法,否则,将会发生内存泄露.<br/>
     * 在游戏的开发代码中应保证retain与release方法的配对.</p>
     * 
     * @function
     * @see 参见 cc.Animation#release
     */
    release:function () {
    }
});

/**
 * 创建一个动画
 * 
 * @deprecated v3.0后将弃用,请使用新的构造方法进行替代
 * 
 * @see 参见cc.Animation
 * 
 * @param {Array} frames
 * @param {Number} delay
 * @param {Number} [loops=1]
 * @return {cc.Animation}
 */
cc.Animation.create = function (frames, delay, loops) {
    return new cc.Animation(frames, delay, loops);
};

/**
 * @deprecated  v3.0后将弃用,请使用新的构造方法进行替代
 * 
 * @see 参见cc.Animation
 * 
 * @type {Function}
 */
cc.Animation.createWithAnimationFrames = cc.Animation.create;

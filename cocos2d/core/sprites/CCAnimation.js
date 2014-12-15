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
 *    A frame of the animation. It contains information like:
 *       - sprite frame name
 *       - # of delay units.
 *       - offset
 * </p>
 * @class
 * @extends cc.Class	- 继承自cc.Class
 * @param spriteFrame	- 精灵帧
 * @param delayUnits	- 精灵帧的延时单位数
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
     * Create a new animation frame and copy all contents into it
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
     * Create a new animation frame and copy all contents into it
     * 创建一个新的动画帧并且复制当前动画帧对象的所有内容
     * 
     * @returns {AnimationFrame}
     */
    copyWithZone:function (pZone) {
        return cc.clone(this);
    },

    /**
     * Create a new animation frame and copy all contents into it
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
     * initializes the animation frame with a spriteframe, number of delay units and a notification user info
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
     * Returns sprite frame to be used
     * 获取将要被使用的精灵帧
     * 
     * @return {cc.SpriteFrame}
     */
    getSpriteFrame:function () {
        return this._spriteFrame;
    },

    /**
     * Sets sprite frame to be used
     * 设置将要被使用的精灵帧
     * 
     * @param {cc.SpriteFrame} spriteFrame
     */
    setSpriteFrame:function (spriteFrame) {
        this._spriteFrame = spriteFrame;
    },

    /**
     * Returns how many units of time the frame takes getter
     * 返回帧的总时间单位数量
     * 
     * @return {Number}
     */
    getDelayUnits:function () {
        return this._delayPerUnit;
    },

    /**
     * Sets how many units of time the frame takes setter
     * 设置帧的总时间单位数量
     * 
     * @param delayUnits
     */
    setDelayUnits:function (delayUnits) {
        this._delayPerUnit = delayUnits;
    },

    /**
     * Returns the user custom information
     * 获取用户的自定义数据
     * 
     * @return {object}
     */
    getUserInfo:function () {
        return this._userInfo;
    },

    /**
     * Sets the user custom information
     * 设置用户的自定义数据
     * 
     * @param {object} userInfo
     */
    setUserInfo:function (userInfo) {
        this._userInfo = userInfo;
    }
});

/**
 * Creates an animation frame.
 * 创建一个精灵帧
 * 
 * @deprecated since v3.0, please use the new construction instead
 * v3.0以后弃用，请使用new的构造方式进行替代
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
 *     A cc.Animation object is used to perform animations on the cc.Sprite objects.<br/>
 *     <br/>
 *      The cc.Animation object contains cc.SpriteFrame objects, and a possible delay between the frames. <br/>
 *      You can animate a cc.Animation object by using the cc.Animate action.
 * </p>
 * @class
 * @extends cc.Class
 * @param {Array} frames
 * @param {Number} delay
 * @param {Number} [loops=1]
 *
 * @example
 * 示例
 * 
 * // 1. Creates an empty animation	
 * // 创建一个空的动画帧
 * var animation1 = new cc.Animation();
 *
 * // 2. Create an animation with sprite frames, delay and loops.
 * // 分别使用精灵帧、延续时长、循环次数来创建动画
 * var spriteFrames = [];
 * var frame = cc.spriteFrameCache.getSpriteFrame("grossini_dance_01.png");
 * spriteFrames.push(frame);
 * var animation1 = new cc.Animation(spriteFrames);
 * var animation2 = new cc.Animation(spriteFrames, 0.2);
 * var animation2 = new cc.Animation(spriteFrames, 0.2, 2);
 *
 * // 3. Create an animation with animation frames, delay and loops.
 * // 分别使用动画帧、延续时长、循环次数来创建动画
 * var animationFrames = [];
 * var frame =  new cc.AnimationFrame();
 * animationFrames.push(frame);
 * var animation1 = new cc.Animation(animationFrames);
 * var animation2 = new cc.Animation(animationFrames, 0.2);
 * var animation3 = new cc.Animation(animationFrames, 0.2, 2);
 *
 * //create an animate with this animation
 * // 通过动画来创建一个action
 * var action = cc.animate(animation1);
 *
 * //run animate
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

    // attributes

    /**
     * Returns the array of animation frames
     * 返回动画帧数组
     * 
     * @return {Array}
     */
    getFrames:function () {
        return this._frames;
    },

    /**
     * Sets array of animation frames
     * 设置动画帧数组
     * 
     * @param {Array} frames
     */
    setFrames:function (frames) {
        this._frames = frames;
    },

    /**
     * Adds a frame to a cc.Animation, the frame will be added with one "delay unit".
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
     * Adds a frame with an image filename. Internally it will create a cc.SpriteFrame and it will add it. The frame will be added with one "delay unit".
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
     * Adds a frame with a texture and a rect. Internally it will create a cc.SpriteFrame and it will add it. The frame will be added with one "delay unit".
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
     * Initializes a cc.Animation with cc.AnimationFrame, do not call this method yourself, please pass parameters to constructor to initialize.
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
     * Clone the current animation
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
     * Clone the current animation
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
     * Clone the current animation
     * 克隆当前的动画
     * 
     * @param pZone
     * @returns {cc.Animation}
     */
    copy:function (pZone) {
        return this.copyWithZone(null);
    },

    /**
     * Returns how many times the animation is going to loop. 0 means animation is not animated. 1, animation is executed one time, ...
     * 返回动画要循环执行的次数，0, 表示它不是一个动画. 1, 表示已经被执行过一次 ...
     * 
     * @return {Number}
     */
    getLoops:function () {
        return this._loops;
    },

    /**
     * Sets how many times the animation is going to loop. 0 means animation is not animated. 1, animation is executed one time, ...
     * 设置动画要循环执行的次数，0, 表示它不是一个动画. 1, 表示已经被执行过一次 ...
     * 
     * @param {Number} value
     */
    setLoops:function (value) {
        this._loops = value;
    },

    /**
     * Sets whether or not it shall restore the original frame when the animation finishes
     * 设置当动画播放完毕之后是否恢复成初始的帧
     * 
     * @param {Boolean} restOrigFrame
     */
    setRestoreOriginalFrame:function (restOrigFrame) {
        this._restoreOriginalFrame = restOrigFrame;
    },

    /**
     * Returns whether or not it shall restore the original frame when the animation finishes
     * 当动画完成时返回是否应该恢复原来的帧
     * 
     * @return {Boolean}
     */
    getRestoreOriginalFrame:function () {
        return this._restoreOriginalFrame;
    },

    /**
     * Returns duration in seconds of the whole animation. It is the result of totalDelayUnits * delayPerUnit
     * 返回整个动画的持续秒数. 它的结果等于总的延时单位数 * 每一个延时单位的时长
     * 
     * @return {Number}
     */
    getDuration:function () {
        return this._totalDelayUnits * this._delayPerUnit;
    },

    /**
     * Returns delay in seconds of the "delay unit"
     * 返回每一个延时单位的秒数
     * 
     * @return {Number}
     */
    getDelayPerUnit:function () {
        return this._delayPerUnit;
    },

    /**
     * Sets delay in seconds of the "delay unit"
     * 设置延时单位的秒数
     * 
     * @param {Number} delayPerUnit
     */
    setDelayPerUnit:function (delayPerUnit) {
        this._delayPerUnit = delayPerUnit;
    },

    /**
     * Returns total delay units of the cc.Animation.
     * 返回cc.Animation总的延时单位数
     * 
     * @return {Number}
     */
    getTotalDelayUnits:function () {
        return this._totalDelayUnits;
    },

    /**
     * Initializes a cc.Animation with frames and a delay between frames, do not call this method yourself, please pass parameters to constructor to initialize.
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
     * <p>Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug<br/>
     * You will need to retain an object if you created an engine object and haven't added it into the scene graph during the same frame.<br/>
     * Otherwise, JSB's native autorelease pool will consider this object a useless one and release it directly,<br/>
     * when you want to use it later, a "Invalid Native Object" error will be raised.<br/>
     * The retain function can increase a reference count for the native object to avoid it being released,<br/>
     * you need to manually invoke release function when you think this object is no longer needed, otherwise, there will be memory learks.<br/>
     * retain and release function call should be paired in developer's game code.</p>
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
     * @see cc.Animation#retain
     * 参见 cc.Animation#retain
     */
    retain:function () {
    },
    /**
     * <p>Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug<br/>
     * You will need to retain an object if you created an engine object and haven't added it into the scene graph during the same frame.<br/>
     * Otherwise, JSB's native autorelease pool will consider this object a useless one and release it directly,<br/>
     * when you want to use it later, a "Invalid Native Object" error will be raised.<br/>
     * The retain function can increase a reference count for the native object to avoid it being released,<br/>
     * you need to manually invoke release function when you think this object is no longer needed, otherwise, there will be memory learks.<br/>
     * retain and release function call should be paired in developer's game code.</p>
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
     * @see cc.Animation#release
     * 参见see cc.Animation#release
     */
    release:function () {
    }
});

/**
 * Creates an animation.
 * 创建一个动画
 * 
 * @deprecated since v3.0, please use new construction instead
 * v3.0后将弃用,请使用新的构造方法进行替代
 * 
 * @see cc.Animation
 * 参见cc.Animation
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
 * @deprecated since v3.0, please use new construction instead
 * v3.0后将弃用,请使用新的构造方法进行替代
 * 
 * @see cc.Animation
 * 参见cc.Animation
 * 
 * @type {Function}
 */
cc.Animation.createWithAnimationFrames = cc.Animation.create;

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
 *     cc.animationCache 是一个管理动画的单例对象<br/>
 *     它保存动画在缓存中. 如果你想要保存你的动画到缓存中，可以使用这个类.<br/>
 * <br/>
 * 例子<br/>
 * cc.animationCache.addAnimation(animation,"animation1");<br/>
 * </p>
 * @class
 * @name cc.animationCache
 */
cc.animationCache = /** @lends cc.animationCache# */{
	_animations: {},
    
     /**
     * 用名字增加一个cc.Animation.
     * @param {cc.Animation} animation
     * @param {String} name
     */
    addAnimation:function (animation, name) {
        this._animations[name] = animation;
    },
    
     /**
     * 从缓存中删除一个cc.Animation.
     * @param {String} name
     */
    removeAnimation:function (name) {
        if (!name) {
            return;
        }
        if (this._animations[name]) {
            delete this._animations[name];
        }
    },
    
    /**
     * <p>
     *     返回之前创建的cc.Animation.<br/>
     *      如果找不到名字会返回nil.<br/>
     *      如果你准备使用这个动画，你可以将返回值赋值给一个变量.</br>
     * </p>
     * @param {String} name
     * @return {cc.Animation}
     */
    getAnimation:function (name) {
        if (this._animations[name])
            return this._animations[name];
        return null;
    },

    _addAnimationsWithDictionary:function (dictionary,plist) {
        var animations = dictionary["animations"];
        if (!animations) {
            cc.log(cc._LogInfos.animationCache__addAnimationsWithDictionary);
            return;
        }

        var version = 1;
        var properties = dictionary["properties"];
        if (properties) {
            version = (properties["format"] != null) ? parseInt(properties["format"]) : version;
            var spritesheets = properties["spritesheets"];
            var spriteFrameCache = cc.spriteFrameCache;
            var path = cc.path;
            for (var i = 0; i < spritesheets.length; i++) {
                spriteFrameCache.addSpriteFrames(path.changeBasename(plist, spritesheets[i]));
            }
        }

        switch (version) {
            case 1:
                this._parseVersion1(animations);
                break;
            case 2:
                this._parseVersion2(animations);
                break;
            default :
                cc.log(cc._LogInfos.animationCache__addAnimationsWithDictionary_2);
                break;
        }
    },
    
    /**
     * <p>
     *    从plist文件添加一个动画.<br/>
     *    应确保动画帧已经事先加载到cc.SpriteFrameCache中.
     * </p>
     * @param {String} plist
     */
    addAnimations:function (plist) {

        cc.assert(plist, cc._LogInfos.animationCache_addAnimations_2);

        var dict = cc.loader.getRes(plist);

        if(!dict){
            cc.log(cc._LogInfos.animationCache_addAnimations);
            return;
        }

        this._addAnimationsWithDictionary(dict,plist);
    },

    _parseVersion1:function (animations) {
        var frameCache = cc.spriteFrameCache;

        for (var key in animations) {
            var animationDict = animations[key];
            var frameNames = animationDict["frames"];
            var delay = parseFloat(animationDict["delay"]) || 0;
            var animation = null;
            if (!frameNames) {
                cc.log(cc._LogInfos.animationCache__parseVersion1, key);
                continue;
            }

            var frames = [];
            for (var i = 0; i < frameNames.length; i++) {
                var spriteFrame = frameCache.getSpriteFrame(frameNames[i]);
                if (!spriteFrame) {
                    cc.log(cc._LogInfos.animationCache__parseVersion1_2, key, frameNames[i]);
                    continue;
                }
                var animFrame = new cc.AnimationFrame();
                animFrame.initWithSpriteFrame(spriteFrame, 1, null);
                frames.push(animFrame);
            }

            if (frames.length === 0) {
                cc.log(cc._LogInfos.animationCache__parseVersion1_3, key);
                continue;
            } else if (frames.length != frameNames.length) {
                cc.log(cc._LogInfos.animationCache__parseVersion1_4, key);
            }
            animation = new cc.Animation(frames, delay, 1);
            cc.animationCache.addAnimation(animation, key);
        }
    },

    _parseVersion2:function (animations) {
        var frameCache = cc.spriteFrameCache;

        for (var key in animations) {
            var animationDict = animations[key];

            var isLoop = animationDict["loop"];
            var loopsTemp = parseInt(animationDict["loops"]);
            var loops = isLoop ? cc.REPEAT_FOREVER : ((isNaN(loopsTemp)) ? 1 : loopsTemp);
            var restoreOriginalFrame = (animationDict["restoreOriginalFrame"] && animationDict["restoreOriginalFrame"] == true) ? true : false;
            var frameArray = animationDict["frames"];

            if (!frameArray) {
                cc.log(cc._LogInfos.animationCache__parseVersion2, key);
                continue;
            }

            //AnimationFrames数组
            var arr = [];
            for (var i = 0; i < frameArray.length; i++) {
                var entry = frameArray[i];
                var spriteFrameName = entry["spriteframe"];
                var spriteFrame = frameCache.getSpriteFrame(spriteFrameName);
                if (!spriteFrame) {
                    cc.log(cc._LogInfos.animationCache__parseVersion2_2, key, spriteFrameName);
                    continue;
                }

                var delayUnits = parseFloat(entry["delayUnits"]) || 0;
                var userInfo = entry["notification"];
                var animFrame = new cc.AnimationFrame();
                animFrame.initWithSpriteFrame(spriteFrame, delayUnits, userInfo);
                arr.push(animFrame);
            }

            var delayPerUnit = parseFloat(animationDict["delayPerUnit"]) || 0;
            var animation = new cc.Animation();
            animation.initWithAnimationFrames(arr, delayPerUnit, loops);
            animation.setRestoreOriginalFrame(restoreOriginalFrame);
            cc.animationCache.addAnimation(animation, key);
        }
    },

	_clear: function () {
		this._animations = {};
	}
};

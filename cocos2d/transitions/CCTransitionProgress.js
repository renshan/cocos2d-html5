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
 * 标记场景的放射状(radial)
 * @constant
 * @type Number
 */
cc.SCENE_RADIAL = 0xc001;

/**
 * cc.TransitionProgress转场
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t 时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionProgress(time,scene);
 */
cc.TransitionProgress = cc.TransitionScene.extend(/** @lends cc.TransitionProgress# */{
    _to:0,
    _from:0,
    _sceneToBeModified:null,
    _className:"TransitionProgress",

    /**
     * @param {Number} t 时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },

	_setAttrs: function(node, x, y) {
		node.attr({
			x: x,
			y: y,
			anchorX: 0.5,
			anchorY: 0.5
		});
	},

    /**
     * @override
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);
        this._setupTransition();

        // 创建一个透明的颜色层(LayerColor)
        // 以便我们后面添加rendertexture
        var winSize = cc.director.getWinSize();

        //为出场景创建第二个渲染纹理(render texture)
        var texture = new cc.RenderTexture(winSize.width, winSize.height);
        texture.sprite.anchorX = 0.5;
	    texture.sprite.anchorY = 0.5;
        this._setAttrs(texture, winSize.width / 2, winSize.height / 2);

        //渲染传出场景到它自己的纹理缓冲区
        texture.clear(0, 0, 0, 1);
        texture.begin();
        this._sceneToBeModified.visit();
        texture.end();

        //  因为我们已经传递传出场景到纹理中，所以我们不再需它了。
        if (this._sceneToBeModified == this._outScene)
            this.hideOutShowIn();

        // 我们需要渲染纹理(RenderTexture)中的纹理
        var pNode = this._progressTimerNodeWithRenderTexture(texture);

        // 创建混合动作
        var layerAction = cc.sequence(
            cc.progressFromTo(this._duration, this._from, this._to),
            cc.callFunc(this.finish, this));
        //执行混合动作
        pNode.runAction(layerAction);

        //添加前面的Layer(包含两个rendertexture)到场景中
        this.addChild(pNode, 2, cc.SCENE_RADIAL);
    },

    /**
     * @override
     * 自定义onExit
     */
    onExit:function () {
        // 移除layer并释放所有含的对象
        this.removeChildByTag(cc.SCENE_RADIAL, true);
        cc.TransitionScene.prototype.onExit.call(this);
    },

    _setupTransition:function () {
        this._sceneToBeModified = this._outScene;
        this._from = 100;
        this._to = 0;
    },

    _progressTimerNodeWithRenderTexture:function (texture) {
        cc.log("cc.TransitionProgress._progressTimerNodeWithRenderTexture(): should be overridden in subclass");
        return null;
    },

    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    }
});

/**
 * 创建cc.TransitionProgress对象
 * @deprecated 从v3.0之后,请使用 new cc.TransitionProgress(t,scene) 替代
 * @function
 * @param {Number} t 时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgress}
 */
cc.TransitionProgress.create = function (t, scene) {
    return new cc.TransitionProgress(t, scene);
};

/**
 *  cc.TransitionProgressRadialCCW转场.<br/>
 *  逆时针放射状过渡到下一个场景的转场
 * @class
 * @extends cc.TransitionProgress
 * @param {Number} t 时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionProgressRadialCCW(t, scene);
 */
cc.TransitionProgressRadialCCW = cc.TransitionProgress.extend(/** @lends cc.TransitionProgressRadialCCW# */{

    /**
     * @param {Number} t 时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionProgress.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },

    _progressTimerNodeWithRenderTexture:function (texture) {
        var size = cc.director.getWinSize();

        var pNode = new cc.ProgressTimer(texture.sprite);

        // 由于它已经翻转, 所以我们需要要翻转这个sprite
        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            pNode.sprite.flippedY = true;
        pNode.type = cc.ProgressTimer.TYPE_RADIAL;

        //返回需要用的放射状类型
        pNode.reverseDir = false;
        pNode.percentage = 100;
        this._setAttrs(pNode, size.width / 2, size.height / 2);

        return pNode;
    }
});

/**
 * 创建一个cc.TransitionProgressRadialCCW对象
 * @deprecated 从v3.0之后，请使用 new cc.TransitionProgressRadialCCW(t,scene) 替代
 * @param {Number} t 时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgressRadialCCW}
 * @example
 * var trans = new cc.TransitionProgressRadialCCW(time,scene);
 */
cc.TransitionProgressRadialCCW.create = function (t, scene) {
    return new cc.TransitionProgressRadialCCW(t, scene);
};

/**
 * cc.TransitionProgressRadialCW转场<br/>
 * 逆时针放射状转场下一个场景
 * @class
 * @extends cc.TransitionProgress
 * @param {Number} t 时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionProgressRadialCW(t, scene);
 */
cc.TransitionProgressRadialCW = cc.TransitionProgress.extend(/** @lends cc.TransitionProgressRadialCW# */{
    /**
     * @param {Number} t 时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionProgress.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },

    _progressTimerNodeWithRenderTexture:function (texture) {
        var size = cc.director.getWinSize();

        var pNode = new cc.ProgressTimer(texture.sprite);

        // 因为它是已经翻转过的, 所以我们需要要翻转这个sprite
        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            pNode.sprite.flippedY = true;
        pNode.type = cc.ProgressTimer.TYPE_RADIAL;

        //返回需要用的放射状类型
        pNode.reverseDir = true;
        pNode.percentage = 100;
        this._setAttrs(pNode, size.width / 2, size.height / 2);

        return pNode;
    }
});

/**
 * 创建一个cc.TransitionProgressRadialCW对象
 * @deprecated 从v3.0之后，请使用 new cc.TransitionProgressRadialCW(t,scene) 替代
 * @param {Number} t 时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgressRadialCW}
 */
cc.TransitionProgressRadialCW.create = function (t, scene) {
    var tempScene = new cc.TransitionProgressRadialCW();
    if ((tempScene != null) && (tempScene.initWithDuration(t, scene))) {
        return tempScene;
    }
    return new cc.TransitionProgressRadialCW(t, scene);
};

/**
 * cc.TransitionProgressHorizontal转场<br/>
 * 一个顺时针放射状过渡到下一个场景的转场
 * @class
 * @extends cc.TransitionProgress
 * @param {Number} t 时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionProgressHorizontal(t, scene);
 */
cc.TransitionProgressHorizontal = cc.TransitionProgress.extend(/** @lends cc.TransitionProgressHorizontal# */{
    /**
     * @param {Number} t 时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionProgress.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },

    _progressTimerNodeWithRenderTexture:function (texture) {
        var size = cc.director.getWinSize();

        var pNode = new cc.ProgressTimer(texture.sprite);

        //由于它已经翻转过, 所以我们要翻转这个sprite
        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            pNode.sprite.flippedY = true;
        pNode.type = cc.ProgressTimer.TYPE_BAR;

        pNode.midPoint = cc.p(1, 0);
        pNode.barChangeRate = cc.p(1, 0);

        pNode.percentage = 100;
        this._setAttrs(pNode, size.width / 2, size.height / 2);

        return pNode;
    }
});

/**
 * 创建一个cc.TransitionProgressHorizontal对象
 * @deprecated 从v3.0之后，请使用 new cc.TransitionProgressHorizontal(t,scene) 替代
 * @param {Number} t 时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgressHorizontal}
 */
cc.TransitionProgressHorizontal.create = function (t, scene) {
    return new cc.TransitionProgressHorizontal(t, scene);
};

/**
 * cc.TransitionProgressVertical转场
 * @class
 * @extends cc.TransitionProgress
 * @param {Number} t 时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionProgressVertical(t, scene);
 */
cc.TransitionProgressVertical = cc.TransitionProgress.extend(/** @lends cc.TransitionProgressVertical# */{

    /**
     * @param {Number} t 时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionProgress.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },

    _progressTimerNodeWithRenderTexture:function (texture) {
        var size = cc.director.getWinSize();

        var pNode = new cc.ProgressTimer(texture.sprite);

        //由于它已经翻转, 所以我们要翻转这个sprite
        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            pNode.sprite.flippedY = true;
        pNode.type = cc.ProgressTimer.TYPE_BAR;

        pNode.midPoint = cc.p(0, 0);
        pNode.barChangeRate = cc.p(0, 1);

        pNode.percentage = 100;
        this._setAttrs(pNode, size.width / 2, size.height / 2);

        return pNode;
    }
});

/**
 * 创建一个cc.TransitionProgressVertical对象
 * @deprecated 从v3.0之后，请使用 new cc.TransitionProgressVertical(t,scene) 替代
 * @param {Number} t 时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgressVertical}
 */
cc.TransitionProgressVertical.create = function (t, scene) {
    return new cc.TransitionProgressVertical(t, scene);
};

/**
 * cc.TransitionProgressInOut转场.
 * @class
 * @extends cc.TransitionProgress
 */
cc.TransitionProgressInOut = cc.TransitionProgress.extend(/** @lends cc.TransitionProgressInOut# */{

    /**
     * cc.TransitionProgressInOut的构造函数. 重写它以扩展它的功能，记得在扩展类的"ctor"中调用"this._super()".
     * @param {Number} t 时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionProgress.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },

    _progressTimerNodeWithRenderTexture:function (texture) {
        var size = cc.director.getWinSize();
        var pNode = new cc.ProgressTimer(texture.sprite);

        // 由于它已经翻转过, 所以我们要翻转这个sprite
        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            pNode.sprite.flippedY = true;
        pNode.type = cc.ProgressTimer.TYPE_BAR;

        pNode.midPoint = cc.p(0.5, 0.5);
        pNode.barChangeRate = cc.p(1, 1);

        pNode.percentage = 0;
        this._setAttrs(pNode, size.width / 2, size.height / 2);

        return pNode;
    },
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },
    _setupTransition:function () {
        this._sceneToBeModified = this._inScene;
        this._from = 0;
        this._to = 100;
    }
});

/**
 * 创建一个cc.TransitionProgressInOut对象
 * @function
 * @deprecated
 * @param {Number} t 时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgressInOut}
 */
cc.TransitionProgressInOut.create = function (t, scene) {
    return new cc.TransitionProgressInOut(t, scene);
};

/**
 * cc.TransitionProgressOutIn转场
 * @class
 * @extends cc.TransitionProgress
 */
cc.TransitionProgressOutIn = cc.TransitionProgress.extend(/** @lends cc.TransitionProgressOutIn# */{

    /**
     * cc.TransitionProgressOutIn的构造函数.如果想要重写并扩展功能记得在扩展的"ctor"中调用"this_super();"
     * @param {Number} t 时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionProgress.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    
    _progressTimerNodeWithRenderTexture:function (texture) {
        var size = cc.director.getWinSize();
        var pNode = new cc.ProgressTimer(texture.sprite);

        //由于它是已经翻转过的, 所以我们要翻转这个sprite
        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            pNode.sprite.flippedY = true;
        pNode.type = cc.ProgressTimer.TYPE_BAR;

        pNode.midPoint = cc.p(0.5, 0.5);
        pNode.barChangeRate = cc.p(1, 1);

        pNode.percentage = 100;
        this._setAttrs(pNode, size.width / 2, size.height / 2);

        return pNode;
    }
});

/**
 * 创建一个cc.TransitionProgressOutIn对象
 * @function
 * @deprecated
 * @param {Number} t 时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionProgressOutIn}
 */
cc.TransitionProgressOutIn.create = function (t, scene) {
    return new cc.TransitionProgressOutIn(t, scene);
};

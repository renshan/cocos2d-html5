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
 * 一个用于标识淡出场景的标记常量
 * @constant
 * @type Number
 */
cc.SCENE_FADE = 4208917214;

/**
 * 水平方向，接近左边
 * @constant
 * @type Number
 */
cc.TRANSITION_ORIENTATION_LEFT_OVER = 0;
/**
 * 水平方向,接近右边
 * @constant
 * @type Number
 */
cc.TRANSITION_ORIENTATION_RIGHT_OVER = 1;
/**
 * 垂直方向,接近上边
 * @constant
 * @type Number
 */
cc.TRANSITION_ORIENTATION_UP_OVER = 0;
/**
 * 垂直方向,接近底边
 * @constant
 * @type Number
 */
cc.TRANSITION_ORIENTATION_DOWN_OVER = 1;

/**
 * @class
 * @extends cc.Scene
 * @param {Number} t  持续时间(秒)
 * @param {cc.Scene} scene  用于转换的场景
 * @example
 * var trans = new TransitionScene(time,scene);
 */
cc.TransitionScene = cc.Scene.extend(/** @lends cc.TransitionScene# */{
    _inScene:null,
    _outScene:null,
    _duration:null,
    _isInSceneOnTop:false,
    _isSendCleanupToScene:false,
    _className:"TransitionScene",

    /**
     * 创建一个基本的具有持续时间和进入场景的转换(transition)
     * TransitionScene的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene 用于转换的场景
     */
    ctor:function (t, scene) {
        cc.Scene.prototype.ctor.call(this);
        if(t !== undefined && scene !== undefined)
            this.initWithDuration(t, scene);
    },

    //private
    _setNewScene:function (dt) {
        this.unschedule(this._setNewScene);
        // 在替换之前, 保存是否"发送清理场景"标识
        var director = cc.director;
        this._isSendCleanupToScene = director.isSendCleanupToScene();
        director.runScene(this._inScene);

        // 在转场时启用事件
        cc.eventManager.setEnabled(true);

        // issue #267
        this._outScene.visible = true;
    },

    //protected
    _sceneOrder:function () {
        this._isInSceneOnTop = true;
    },

    /**
     * 进行两个场景的绘制
     */
    visit:function () {
        if (this._isInSceneOnTop) {
            this._outScene.visit();
            this._inScene.visit();
        } else {
            this._inScene.visit();
            this._outScene.visit();
        }
        cc.Node.prototype.visit.call(this);
    },

    /**
     *  <p>
     *     每当cc.TransitionScene进入’舞台‘('stage')，事件回调都会执行。                                 <br/> 
     *     如果这个转场场景(TransitionScene)使用转场进入'舞台'('stage')，那么当转场开始时这个事件会被调用      <br/>
     *     在onEnter期间你不能访问"兄弟"("sister/brother")节点                                                 <br/>
     *     如果需要重写onEnter, 必须使用this._super()调用父类的onEnter。
     * </p>
     */
    onEnter:function () {
        cc.Node.prototype.onEnter.call(this);

        // 在转场时禁用事件管理
        cc.eventManager.setEnabled(false);

        // 此时，出场的场景不会收到onEnter的回调
        // 只有onExitTransitionDidStart
        this._outScene.onExitTransitionDidStart();

        this._inScene.onEnter();
    },

    /**
     *  <p>
     * 每当cc.TransitionScene离开'舞台'('stage'),回调都会被调用                                     <br/>
     * 如果cc.TransitionScene使用转场离开'舞台'('stage'),那么该回调会在转场结束时被调用。<br/>
     * 在onExit期间你不能访问兄弟节点.                                                             <br/> 
     * 如果需要重写onExit, 必须使用this._super()调用父类的onExit <br/>
     * </p>
     */
    onExit:function () {
        cc.Node.prototype.onExit.call(this);

        // 在转场时启用事件管理
        cc.eventManager.setEnabled(true);

        this._outScene.onExit();

        // 此时，进场的场景不会收到onEnter的回调
        // 只有onEnterTransitionDidFinish
        this._inScene.onEnterTransitionDidFinish();
    },

    /**
     * 自定义清理函数
     */
    cleanup:function () {
        cc.Node.prototype.cleanup.call(this);

        if (this._isSendCleanupToScene)
            this._outScene.cleanup();
    },

    /**
     * 初始化一个具有持续时间(秒)和进入的场景的转换
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene 需要转场的场景
     * @return {Boolean} 如果是error则返回 false
     */
    initWithDuration:function (t, scene) {
        if(!scene)
            throw "cc.TransitionScene.initWithDuration(): Argument scene must be non-nil";

        if (this.init()) {
            this._duration = t;
            this.attr({
	            x: 0,
	            y: 0,
	            anchorX: 0,
	            anchorY: 0
            });
            // retain
            this._inScene = scene;
            this._outScene = cc.director.getRunningScene();
            if (!this._outScene) {
                this._outScene = new cc.Scene();
                this._outScene.init();
            }

            if(this._inScene == this._outScene)
                throw "cc.TransitionScene.initWithDuration(): Incoming scene must be different from the outgoing scene";

            this._sceneOrder();
            return true;
        } else {
            return false;
        }
    },

    /**
     * 在转场结束后调用
     */
    finish:function () {
        // clean up
        this._inScene.attr({
			visible: true,
	        x: 0,
	        y: 0,
	        scale: 1.0,
	        rotation: 0.0
        });
        if(cc._renderType === cc._RENDER_TYPE_WEBGL)
            this._inScene.getCamera().restore();

        this._outScene.attr({
	        visible: false,
	        x: 0,
	        y: 0,
	        scale: 1.0,
	        rotation: 0.0
        });
        if(cc._renderType === cc._RENDER_TYPE_WEBGL)
            this._outScene.getCamera().restore();

        //[self schedule:@selector(setNewScene:) interval:0];
        this.schedule(this._setNewScene, 0);
    },

    /**
     * 隐藏出场的场景并显示入场的场景
     */
    hideOutShowIn:function () {
        this._inScene.visible = true;
        this._outScene.visible = false;
    }
});
/**
 * 创建一个基本的具有持续时间(秒)和进入场景的转换(transition)
 * @deprecated  从v3.0之后使用 new cc.TransitionScene(t,scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene 需要转场的场景
 * @return {cc.TransitionScene|Null}
 */
cc.TransitionScene.create = function (t, scene) {
    return new cc.TransitionScene(t, scene);
};

/**
 * cc.Transition支持不同方向<br/>
 * 可用的方向为: LeftOver, RightOver, UpOver, DownOver<br/>
 * 当需要制作一个使用两个方向之间的转场时可以使用
 *
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} orientation
 * @example
 * var trans = new cc.TransitionSceneOriented(time,scene,orientation);
 */
cc.TransitionSceneOriented = cc.TransitionScene.extend(/** @lends cc.TransitionSceneOriented# */{
    _orientation:0,

    /**
     * TransitionSceneOriented 的构造函数
     * @param {Number} t     持续时间(秒)
     * @param {cc.Scene} scene
     * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} orientation
     */
    ctor:function (t, scene, orientation) {
        cc.TransitionScene.prototype.ctor.call(this);
        orientation != undefined && this.initWithDuration(t, scene, orientation);
    },
    /**
     * 初始化转场
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} orientation
     * @return {Boolean}
     */
    initWithDuration:function (t, scene, orientation) {
        if (cc.TransitionScene.prototype.initWithDuration.call(this, t, scene)) {
            this._orientation = orientation;
        }
        return true;
    }
});

/**
 *  创建一个基础的具有持续时间(秒)和进入场景的转场(transition)
 * @deprecated 从v3.0之后，请使用 new cc.TransitionSceneOriented(t, scene, orientation) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} orientation
 * @return {cc.TransitionSceneOriented}
 */
cc.TransitionSceneOriented.create = function (t, scene, orientation) {
    return new cc.TransitionSceneOriented(t, scene, orientation);
};

/**
 *  旋转缩小的切出场景，同时旋转放大传入场景 

 * @class
 * @extends cc.TransitionScene
 * @param {Number} t  持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionRotoZoom(t, scene);
 */
cc.TransitionRotoZoom = cc.TransitionScene.extend(/** @lends cc.TransitionRotoZoom# */{

    /**
     * TransitionRotoZoom的构造函数
     * @function
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * 自定义onEnter回调
     * @override
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);

	    this._inScene.attr({
		    scale: 0.001,
		    anchorX: 0.5,
		    anchorY: 0.5
	    });
	    this._outScene.attr({
		    scale: 1.0,v
		    anchorX: 0.5,
		    anchorY: 0.5
	    });

        var rotoZoom = cc.sequence(
            cc.spawn(cc.scaleBy(this._duration / 2, 0.001),
                cc.rotateBy(this._duration / 2, 360 * 2)),
            cc.delayTime(this._duration / 2));

        this._outScene.runAction(rotoZoom);
        this._inScene.runAction(
            cc.sequence(rotoZoom.reverse(),
                cc.callFunc(this.finish, this)));
    }
});

/**
 * 创建一个旋转缩放的转场(Transtion)
 * @deprecated 从v3.0之后，请使用 new cc.TransitionRotoZoom(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene 要使用的场景
 * @return {cc.TransitionRotoZoom}
 */
cc.TransitionRotoZoom.create = function (t, scene) {
    return new cc.TransitionRotoZoom(t, scene);
};

/**
 * 缩小跳着切出场景, 同时跳着放大传入场景 
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionJumpZoom(t, scene);
 */
cc.TransitionJumpZoom = cc.TransitionScene.extend(/** @lends cc.TransitionJumpZoom# */{
    /**
     * TransitionJumpZoom 构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);
        var winSize = cc.director.getWinSize();

	    this._inScene.attr({
		    scale: 0.5,
		    x: winSize.width,
		    y: 0,
		    anchorX: 0.5,
		    anchorY: 0.5
	    });
        this._outScene.anchorX = 0.5;
	    this._outScene.anchorY = 0.5;

        var jump = cc.jumpBy(this._duration / 4, cc.p(-winSize.width, 0), winSize.width / 4, 2);
        var scaleIn = cc.scaleTo(this._duration / 4, 1.0);
        var scaleOut = cc.scaleTo(this._duration / 4, 0.5);

        var jumpZoomOut = cc.sequence(scaleOut, jump);
        var jumpZoomIn = cc.sequence(jump, scaleIn);

        var delay = cc.delayTime(this._duration / 2);
        this._outScene.runAction(jumpZoomOut);
        this._inScene.runAction(cc.sequence(delay, jumpZoomIn, cc.callFunc(this.finish, this)));
    }
});

/**
 * 缩小跳着切出场景, 同时跳着放大传入场景 
 * @deprecated 从v3.0之后，请使用new cc.TransitionJumpZoom(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionJumpZoom}
 */
cc.TransitionJumpZoom.create = function (t, scene) {
    return new cc.TransitionJumpZoom(t, scene);
};

/**
 * 从左侧传入场景
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionMoveInL(time,scene);
 */
cc.TransitionMoveInL = cc.TransitionScene.extend(/** @lends cc.TransitionMoveInL# */{
    /**
     * TransitionMoveInL构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);
        this.initScenes();

        var action = this.action();
        this._inScene.runAction(
            cc.sequence(this.easeActionWithAction(action), cc.callFunc(this.finish, this))
        );
    },

    /**
     * 初始化场景
     */
    initScenes:function () {
        this._inScene.setPosition(-cc.director.getWinSize().width, 0);
    },

    /**
     * 返回将要执行的动作(action)
     */
    action:function () {
        return cc.moveTo(this._duration, cc.p(0, 0));
    },

    /**
     * 从action中创建一个ease action.
     * @param {cc.ActionInterval} action
     * @return {cc.EaseOut}
     */
    easeActionWithAction:function (action) {
        return new cc.EaseOut(action, 2.0);
    }
});

/**
 * 创建一个从左侧传入场景的动作
 * @deprecated 从v3.0之后,请使用 new cc.TransitionMoveInL(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionMoveInL}
 */
cc.TransitionMoveInL.create = function (t, scene) {
    return new cc.TransitionMoveInL(t, scene);
};

/**
 * 右侧传入场景
 * @class
 * @extends cc.TransitionMoveInL
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionMoveInR(time,scene);
 */
cc.TransitionMoveInR = cc.TransitionMoveInL.extend(/** @lends cc.TransitionMoveInR# */{
    /**
     * TransitionMoveInR的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionMoveInL.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * 初始化函数
     */
    initScenes:function () {
        this._inScene.setPosition(cc.director.getWinSize().width, 0);
    }
});

/**
 * 创建一个右侧传入场景的转场
 * @deprecated 从v3.0之后,请使用 new cc.TransitionMoveInR(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionMoveInR}
 */
cc.TransitionMoveInR.create = function (t, scene) {
    return new cc.TransitionMoveInR(t, scene);
};

/**
 * 从顶部传入场景
 * @class
 * @extends cc.TransitionMoveInL
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionMoveInT(time,scene);
 */
cc.TransitionMoveInT = cc.TransitionMoveInL.extend(/** @lends cc.TransitionMoveInT# */{
    /**
     * TransitionMoveInT的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionMoveInL.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * 初始化函数
     */
    initScenes:function () {
        this._inScene.setPosition(0, cc.director.getWinSize().height);
    }
});

/**
 * 从顶部传入场景
 * @deprecated 从v3.0之后，请使用 new cc.TransitionMoveInT(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionMoveInT}
 */
cc.TransitionMoveInT.create = function (t, scene) {
    return new cc.TransitionMoveInT(t, scene);
};

/**
 * 从底部传入场景
 * @class
 * @extends cc.TransitionMoveInL
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionMoveInB(time,scene);
 */
cc.TransitionMoveInB = cc.TransitionMoveInL.extend(/** @lends cc.TransitionMoveInB# */{
    /**
     * TransitionMoveInB的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionMoveInL.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },

    /**
     * 初始始化函数
     */
    initScenes:function () {
        this._inScene.setPosition(0, -cc.director.getWinSize().height);
    }
});

/**
 * 创建一个从底部传入场景的转场
 * @deprecated 从v3.0之后，请使用 new cc.TransitionMoveInB(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionMoveInB}
 */
cc.TransitionMoveInB.create = function (t, scene) {
    return new cc.TransitionMoveInB(t, scene);
};

/**
 * 一个修正系数去防止问题 #442 <br/>
 * 一种解决方案是使用DONT_RENDER_IN_SUBPIXELS图片, 但是不行 <br/>
 * 另一种问题出现在一些转场中(但我不知道为什么) <br>
 * 这个命令应该保留(顶部切出或切入场景)
 * @constant
 * @type Number
 */
cc.ADJUST_FACTOR = 0.5;

/**
 * 一个从左边滑入一个新场景的转场
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = cc.TransitionSlideInL(time,scene);
 */
cc.TransitionSlideInL = cc.TransitionScene.extend(/** @lends cc.TransitionSlideInL# */{
    /**
     * TransitionSlideInL的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },

    /**
     * 自定义on enter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);
        this.initScenes();

        var inA = this.action();
        var outA = this.action();

        var inAction = this.easeActionWithAction(inA);
        var outAction = cc.sequence(this.easeActionWithAction(outA), cc.callFunc(this.finish, this));
        this._inScene.runAction(inAction);
        this._outScene.runAction(outAction);
    },

    /**
     * 初始化场景
     */
    initScenes:function () {
        this._inScene.setPosition(-cc.director.getWinSize().width + cc.ADJUST_FACTOR, 0);
    },
    /**
     * 返回传入/传出场景要执行的动作(action)
     * @return {cc.MoveBy}
     */
    action:function () {
        return cc.moveBy(this._duration, cc.p(cc.director.getWinSize().width - cc.ADJUST_FACTOR, 0));
    },

    /**
     * @param {cc.ActionInterval} action
     * @return {*}
     */
    easeActionWithAction:function (action) {
        return new cc.EaseInOut(action, 2.0);
    }
});

/**
 * 创建一个从左边滑入一个新场景的转场.
 * @deprecated 从v3.0之后，请使用 new cc.TransitionSlideInL(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionSlideInL}
 */
cc.TransitionSlideInL.create = function (t, scene) {
    return new cc.TransitionSlideInL(t, scene);
};

/**
 * 从右侧滑入传入场景.
 * @class
 * @extends cc.TransitionSlideInL
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionSlideInR(time,scene);
 */
cc.TransitionSlideInR = cc.TransitionSlideInL.extend(/** @lends cc.TransitionSlideInR# */{
    /**
     * TransitionSlideInR的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionSlideInL.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    _sceneOrder:function () {
        this._isInSceneOnTop = true;
    },
    /**
     * 初始化场景
     */
    initScenes:function () {
        this._inScene.setPosition(cc.director.getWinSize().width - cc.ADJUST_FACTOR, 0);
    },
    /**
     * 返回传入/传出场景将要执行的动作(action)
     * @return {cc.MoveBy}
     */
    action:function () {
        return cc.moveBy(this._duration, cc.p(-(cc.director.getWinSize().width - cc.ADJUST_FACTOR), 0));
    }
});

/**
 * 创建从右边滑入传入场景的转场.
 * @deprecated 从v3.0之后,请使用 new cc.TransitionSlideInR(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionSlideInR}
 */
cc.TransitionSlideInR.create = function (t, scene) {
    return new cc.TransitionSlideInR(t, scene);
};

/**
 * 从底部滑入传入场景. 
 * @class
 * @extends cc.TransitionSlideInL
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionSlideInB(time,scene);
 */
cc.TransitionSlideInB = cc.TransitionSlideInL.extend(/** @lends cc.TransitionSlideInB# */{
    /**
     * TransitionSlideInB的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionSlideInL.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },

    /**
     * 初始化场景
     */
    initScenes:function () {
        this._inScene.setPosition(0, -(cc.director.getWinSize().height - cc.ADJUST_FACTOR));
    },

    /**
     * 返回传入/传出场景将要执行的动作
     * @return {cc.MoveBy}
     */
    action:function () {
        return cc.moveBy(this._duration, cc.p(0, cc.director.getWinSize().height - cc.ADJUST_FACTOR));
    }
});

/**
 * 创建一个从底部滑入传入场景的转场
 * @deprecated 从v3.0之后，请使用 new cc.TransitionSlideInB(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionSlideInB}
 */
cc.TransitionSlideInB.create = function (t, scene) {
    return new cc.TransitionSlideInB(t, scene);
};

/**
 *  从顶部滑入传入场景. 
 *  @class
 *  @extends cc.TransitionSlideInL
 *  @param {Number} t 持续时间(秒)
 *  @param {cc.Scene} scene
 *  @example
 *  var trans = new cc.TransitionSlideInT(time,scene);
 */
cc.TransitionSlideInT = cc.TransitionSlideInL.extend(/** @lends cc.TransitionSlideInT# */{
    /**
     * TransitionSlideInT的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionSlideInL.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    _sceneOrder:function () {
        this._isInSceneOnTop = true;
    },

    /**
     * 初始化场景
     */
    initScenes:function () {
        this._inScene.setPosition(0, cc.director.getWinSize().height - cc.ADJUST_FACTOR);
    },

    /**
     * 返回传入/传出场景将要执行的动作
     * @return {cc.MoveBy}
     */
    action:function () {
        return cc.moveBy(this._duration, cc.p(0, -(cc.director.getWinSize().height - cc.ADJUST_FACTOR)));
    }
});

/**
 * 创建一个从顶部滑入传入场景的转场. 
 * @deprecated 从v3.0之后，请使用 new cc.TransitionSlideInT(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionSlideInT}
 */
cc.TransitionSlideInT.create = function (t, scene) {
    return new cc.TransitionSlideInT(t, scene);
};

/**
 * 当增长传入场景的时候，收缩传出的场景
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionShrinkGrow(time,scene);
 */
cc.TransitionShrinkGrow = cc.TransitionScene.extend(/** @lends cc.TransitionShrinkGrow# */{
    /**
     * TransitionShrinkGrow构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);

	    this._inScene.attr({
		    scale: 0.001,
		    anchorX: 2 / 3.0,
		    anchorY: 0.5
	    });
	    this._outScene.attr({
		    scale: 1.0,
		    anchorX: 1 / 3.0,
		    anchorY: 0.5
	    });

        var scaleOut = cc.scaleTo(this._duration, 0.01);
        var scaleIn = cc.scaleTo(this._duration, 1.0);

        this._inScene.runAction(this.easeActionWithAction(scaleIn));
        this._outScene.runAction(
            cc.sequence(this.easeActionWithAction(scaleOut), cc.callFunc(this.finish, this))
        );
    },

    /**
     * @param action
     * @return {cc.EaseOut}
     */
    easeActionWithAction:function (action) {
        return new cc.EaseOut(action, 2.0);
    }
});

/**
 * 当增长传入场景的时候，收缩传出的场景
 * @deprecated 从v3.0之后，请使用 new cc.TransitionShrinkGrow(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionShrinkGrow}
 */
cc.TransitionShrinkGrow.create = function (t, scene) {
    return new cc.TransitionShrinkGrow(t, scene);
};

/**
 * 水平翻转屏幕<br/>
 * 正面是传出的场景，背面是传入的场景
 * @class
 * @extends cc.TransitionSceneOriented
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = new cc.TransitionFlipX(t,scene,o);
 */
cc.TransitionFlipX = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionFlipX# */{
    /**
     * TransitionFlipX的构造函数
     * @function
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
     */
    ctor:function (t, scene, o) {
        cc.TransitionSceneOriented.prototype.ctor.call(this);
        if(o == null)
            o = cc.TRANSITION_ORIENTATION_RIGHT_OVER;
        scene && this.initWithDuration(t, scene, o);
    },

    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);

        var inA, outA;
        this._inScene.visible = false;

        var inDeltaZ, inAngleZ, outDeltaZ, outAngleZ;

        if (this._orientation === cc.TRANSITION_ORIENTATION_RIGHT_OVER) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        } else {
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        inA = cc.sequence(
            cc.delayTime(this._duration / 2), cc.show(),
            cc.orbitCamera(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, 0, 0),
            cc.callFunc(this.finish, this)
        );

        outA = cc.sequence(
            cc.orbitCamera(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 0, 0),
            cc.hide(), cc.delayTime(this._duration / 2)
        );

        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});

/**
 * 制作水平翻转屏幕转场。<br/>
 * 正面是传出的场景，背面是传入的场景
 * @deprecated 从v3.0之后，请使用 new cc.TransitionFlipX(t, scene,o) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionFlipX}
 */
cc.TransitionFlipX.create = function (t, scene, o) {
    return new cc.TransitionFlipX(t, scene, o);
};

/**
 * 垂直翻转屏幕的转场<br/>
 * 正面是传出的场景，背面是传入的场景
 * @class
 * @extends cc.TransitionSceneOriented
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = new cc.TransitionFlipY(time,scene,0);
 */
cc.TransitionFlipY = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionFlipY# */{

    /**
     * TransitionFlipY的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
     */
    ctor:function (t, scene, o) {
        cc.TransitionSceneOriented.prototype.ctor.call(this);
        if(o == null)
            o = cc.TRANSITION_ORIENTATION_UP_OVER;
        scene && this.initWithDuration(t, scene, o);
    },
    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);

        var inA, outA;
        this._inScene.visible = false;

        var inDeltaZ, inAngleZ, outDeltaZ, outAngleZ;

        if (this._orientation == cc.TRANSITION_ORIENTATION_UP_OVER) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        } else {
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        inA = cc.sequence(
            cc.delayTime(this._duration / 2), cc.show(),
            cc.orbitCamera(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, 90, 0),
            cc.callFunc(this.finish, this)
        );
        outA = cc.sequence(
            cc.orbitCamera(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 90, 0),
            cc.hide(), cc.delayTime(this._duration / 2)
        );

        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});

/**
 * 制作垂直翻转屏幕转场<br/>
 * 正面是传出的场景，背面是传入的场景
 * @deprecated 从v3.0之后，请使用 new cc.TransitionFlipY(t, scene, o) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionFlipY}
 */
cc.TransitionFlipY.create = function (t, scene, o) {
    return new cc.TransitionFlipY(t, scene, o);
};

/**
 * 水平垂直翻转一半屏幕的转场.<br/>
 * 正面是传出的场景，背面是传入的场景
 * @class
 * @extends cc.TransitionSceneOriented
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = cc.TransitionFlipAngular(time,scene,o);
 */
cc.TransitionFlipAngular = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionFlipAngular# */{
    /**
     * TransitionFlipAngular的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
     */
    ctor:function (t, scene, o) {
        cc.TransitionSceneOriented.prototype.ctor.call(this);
        if(o == null)
            o = cc.TRANSITION_ORIENTATION_RIGHT_OVER;
        scene && this.initWithDuration(t, scene, o);
    },
    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);

        var inA, outA;
        this._inScene.visible = false;

        var inDeltaZ, inAngleZ, outDeltaZ, outAngleZ;

        if (this._orientation === cc.TRANSITION_ORIENTATION_RIGHT_OVER) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        } else {
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        inA = cc.sequence(
            cc.delayTime(this._duration / 2), cc.show(),
            cc.orbitCamera(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, -45, 0),
            cc.callFunc(this.finish, this)
        );
        outA = cc.sequence(
            cc.orbitCamera(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 45, 0),
            cc.hide(), cc.delayTime(this._duration / 2)
        );

        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});

/**
 * 制作水平垂直翻转一半屏幕的转场<br/>
 * 正面是传出的场景，背面是传入的场景
 * @deprecated 从v3.0之后，请使用 new cc.TransitionFlipAngular(t, scene, o) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionFlipAngular}
 */
cc.TransitionFlipAngular.create = function (t, scene, o) {
    return new cc.TransitionFlipAngular(t, scene, o);
};

/**
 * 水平翻转屏幕，且带一个传出/传入缩放效果的转场<br/>
 * 正面是传出的场景，背面是传入的场景
 * @class
 * @extends cc.TransitionSceneOriented
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = new cc.TransitionZoomFlipX(time,scene,o);
 */
cc.TransitionZoomFlipX = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionZoomFlipX# */{

    /**
     * TransitionZoomFlipX的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
     */
    ctor:function (t, scene, o) {
        cc.TransitionSceneOriented.prototype.ctor.call(this);
        if(o == null)
            o = cc.TRANSITION_ORIENTATION_RIGHT_OVER;
        scene && this.initWithDuration(t, scene, o);
    },
    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);

        var inA, outA;
        this._inScene.visible = false;

        var inDeltaZ, inAngleZ, outDeltaZ, outAngleZ;

        if (this._orientation === cc.TRANSITION_ORIENTATION_RIGHT_OVER) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        } else {
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        inA = cc.sequence(
            cc.delayTime(this._duration / 2),
            cc.spawn(
                cc.orbitCamera(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, 0, 0),
                cc.scaleTo(this._duration / 2, 1), cc.show()),
            cc.callFunc(this.finish, this)
        );
        outA = cc.sequence(
            cc.spawn(
                cc.orbitCamera(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 0, 0),
                cc.scaleTo(this._duration / 2, 0.5)),
            cc.hide(),
            cc.delayTime(this._duration / 2)
        );

        this._inScene.scale = 0.5;
        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});

/**
 * 制作一个水平翻转屏幕，且带一个传出/传入缩放效果的转场<br/>
 * 正面是传出的场景，背面是传入的场景。 
 * @deprecated 从v3.0之后，请使用 new cc.TransitionZoomFlipX(t, scene, o) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionZoomFlipX}
 */
cc.TransitionZoomFlipX.create = function (t, scene, o) {
    return new cc.TransitionZoomFlipX(t, scene, o);
};

/**
 * 垂直翻转屏幕，同时做一点缩放效果的传出/传人转场 <br/>
 * 正面是传出的场景，背面是传入的场景
 * @class
 * @extends cc.TransitionSceneOriented
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = new cc.TransitionZoomFlipY(t,scene,o);
 */
cc.TransitionZoomFlipY = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionZoomFlipY# */{

    /**         
     * TransitionZoomFlipY 的构造函数       
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
     */
    ctor:function (t, scene, o) {
        cc.TransitionSceneOriented.prototype.ctor.call(this);
        if(o == null)
            o = cc.TRANSITION_ORIENTATION_UP_OVER;
        scene && this.initWithDuration(t, scene, o);
    },
    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);

        var inA, outA;
        this._inScene.visible = false;

        var inDeltaZ, inAngleZ, outDeltaZ, outAngleZ;

        if (this._orientation === cc.TRANSITION_ORIENTATION_UP_OVER) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        } else {
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        inA = cc.sequence(
            cc.delayTime(this._duration / 2),
            cc.spawn(
                cc.orbitCamera(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, 90, 0),
                cc.scaleTo(this._duration / 2, 1), cc.show()),
            cc.callFunc(this.finish, this));

        outA = cc.sequence(
            cc.spawn(
                cc.orbitCamera(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 90, 0),
                cc.scaleTo(this._duration / 2, 0.5)),
            cc.hide(), cc.delayTime(this._duration / 2));

        this._inScene.scale = 0.5;
        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});

/**
 * 垂直翻转屏幕，同时带一点缩放效果的传出/传人场景的转场<br/>
 * 正面是传出的场景，背面是传入的场景
 * @deprecated 从v3.0之后，请使用 new cc.TransitionZoomFlipY(t, scene, o) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionZoomFlipY}
 */
cc.TransitionZoomFlipY.create = function (t, scene, o) {
    return new cc.TransitionZoomFlipY(t, scene, o);
};

/**
 * 一半水平一半垂直翻转，同时带一点传出/传人缩放效果的转场<br/>
 * 正面是传出的场景，背面是传入的场景
 * @class
 * @extends cc.TransitionSceneOriented
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = new cc.TransitionZoomFlipAngular(time,scene,o);
 */
cc.TransitionZoomFlipAngular = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionZoomFlipAngular# */{

    /**
     * TransitionZoomFlipAngular的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
     */
    ctor:function (t, scene, o) {
        cc.TransitionSceneOriented.prototype.ctor.call(this);
        if(o == null)
            o = cc.TRANSITION_ORIENTATION_RIGHT_OVER;
        scene && this.initWithDuration(t, scene, o);
    },
    /**
     * 自定义 onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);

        var inA, outA;
        this._inScene.visible = false;

        var inDeltaZ, inAngleZ, outDeltaZ, outAngleZ;
        if (this._orientation === cc.TRANSITION_ORIENTATION_RIGHT_OVER) {
            inDeltaZ = 90;
            inAngleZ = 270;
            outDeltaZ = 90;
            outAngleZ = 0;
        } else {
            inDeltaZ = -90;
            inAngleZ = 90;
            outDeltaZ = -90;
            outAngleZ = 0;
        }

        inA = cc.sequence(
            cc.delayTime(this._duration / 2),
            cc.spawn(
                cc.orbitCamera(this._duration / 2, 1, 0, inAngleZ, inDeltaZ, -45, 0),
                cc.scaleTo(this._duration / 2, 1), cc.show()),
            cc.show(),
            cc.callFunc(this.finish, this));
        outA = cc.sequence(
            cc.spawn(
                cc.orbitCamera(this._duration / 2, 1, 0, outAngleZ, outDeltaZ, 45, 0),
                cc.scaleTo(this._duration / 2, 0.5)),
            cc.hide(), cc.delayTime(this._duration / 2));

        this._inScene.scale = 0.5;
        this._inScene.runAction(inA);
        this._outScene.runAction(outA);
    }
});

/**
 * 制作一半水平一半垂直翻转，同时带一点传出/传人缩放效果的转场<br/>
 * @deprecated 从v3.0之后使用 cc.TransitionZoomFlipAngular(t, scene, o) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionZoomFlipAngular}
 */
cc.TransitionZoomFlipAngular.create = function (t, scene, o) {
    return new cc.TransitionZoomFlipAngular(t, scene, o);
};

/**
 * 淡出传出场景，淡入传入场景
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = new cc.TransitionFade(time,scene,color)
 */
cc.TransitionFade = cc.TransitionScene.extend(/** @lends cc.TransitionFade# */{
    _color:null,

    /**
     * TransitionFade的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
     */
    ctor:function (t, scene, color) {
        cc.TransitionScene.prototype.ctor.call(this);
        this._color = cc.color();
        scene && this.initWithDuration(t, scene, color);
    },

    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);

        var l = new cc.LayerColor(this._color);
        this._inScene.visible = false;

        this.addChild(l, 2, cc.SCENE_FADE);
        var f = this.getChildByTag(cc.SCENE_FADE);

        var a = cc.sequence(
            cc.fadeIn(this._duration / 2),
            cc.callFunc(this.hideOutShowIn, this),
            cc.fadeOut(this._duration / 2),
            cc.callFunc(this.finish, this)
        );
        f.runAction(a);
    },

    /**
     * 自定义onExit
     */
    onExit:function () {
        cc.TransitionScene.prototype.onExit.call(this);
        this.removeChildByTag(cc.SCENE_FADE, false);
    },

    /**
     * 使用持续时间、RGB color 初始化一个转场
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     * @param {cc.Color} color
     * @return {Boolean}
     */
    initWithDuration:function (t, scene, color) {
        color = color || cc.color.BLACK;
        if (cc.TransitionScene.prototype.initWithDuration.call(this, t, scene)) {
            this._color.r = color.r;
            this._color.g = color.g;
            this._color.b = color.b;
            this._color.a = 0;
        }
        return true;
    }
});


/**
 * 淡出传出场景，同时淡入传入场景
 * @deprecated 从v3.0之后，请使用 new cc.TransitionFade(time,scene,color) 替代
 * @param {Number} t  持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.Color} color
 * @return {cc.TransitionFade}
 */
cc.TransitionFade.create = function (t, scene, color) {
    return new cc.TransitionFade(t, scene, color);
};

/**
 * 两个场景使用cc.RenderTexture对象交叉淡入淡出 
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionCrossFade(time,scene);
 */
cc.TransitionCrossFade = cc.TransitionScene.extend(/** @lends cc.TransitionCrossFade# */{
    /**
     * TransitionCrossFade的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);

        // 创建一个透明的颜色层layer
        // 用于添加到rendertextures
        var color = cc.color(0, 0, 0, 0);
        var winSize = cc.director.getWinSize();
        var layer = new cc.LayerColor(color);

        // 针对传人场景创建第一个rendertexture
        var inTexture = new cc.RenderTexture(winSize.width, winSize.height);

        if (null == inTexture)
            return;

        inTexture.sprite.anchorX = 0.5;
	    inTexture.sprite.anchorY = 0.5;
        inTexture.attr({
	        x: winSize.width / 2,
	        y: winSize.height / 2,
	        anchorX: 0.5,
	        anchorY: 0.5
        });

        // 渲染入场场景到纹理缓冲区(texturebuffer)
        inTexture.begin();
        this._inScene.visit();
        inTexture.end();

        // 针对出场场景创造第二个render texture
        var outTexture = new cc.RenderTexture(winSize.width, winSize.height);
        outTexture.setPosition(winSize.width / 2, winSize.height / 2);
	    outTexture.sprite.anchorX = outTexture.anchorX = 0.5;
	    outTexture.sprite.anchorY = outTexture.anchorY = 0.5;

        // 绘制出场场景到纹理缓冲区(texturebuffer)
        outTexture.begin();
        this._outScene.visit();
        outTexture.end();

        inTexture.sprite.setBlendFunc(cc.ONE, cc.ONE);                                             //入场场景是可见的,所以不会用到的alpha
        outTexture.sprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);                      //将通过alpha与出场场景进行混合

        // 在这个layer增加渲染纹理(render texture)
        layer.addChild(inTexture);
        layer.addChild(outTexture);

        // 初始透明度
        inTexture.sprite.opacity = 255;
        outTexture.sprite.opacity = 255;

        // 创建混合动作
        var layerAction = cc.sequence(
            cc.fadeTo(this._duration, 0), cc.callFunc(this.hideOutShowIn, this),
            cc.callFunc(this.finish, this)
        );

        // 执行混合动作
        outTexture.sprite.runAction(layerAction);

        // 添加一个layer(包含两个渲染纹理(rendertexture))到这个场景
        this.addChild(layer, 2, cc.SCENE_FADE);
    },

    /**
     * 自定义onExit
     */
    onExit:function () {
        this.removeChildByTag(cc.SCENE_FADE, false);
        cc.TransitionScene.prototype.onExit.call(this);
    },

    /**
     * 在这绘制
     */
    visit:function () {
        cc.Node.prototype.visit.call(this);
    },

    /**
     * 重写draw
     */
    draw:function () {
        // 重写,由于两个场景的纹理会在一个场景里绘制
    }
});

/**
 * 使用渲染纹理(RenderTexture)对象实现对两个场景的交叉淡入淡出
 * @deprecated 从v3.0之后，请使用 new cc.TransitionCrossFade(t, scene) 替代
 * @param {Number} t 持续时间(秒)                                               持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionCrossFade}
 */
cc.TransitionCrossFade.create = function (t, scene) {
    return new cc.TransitionCrossFade(t, scene);
};

/**
 * 随机顺序关闭淡出场景的小方块.
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionTurnOffTiles(time,scene);
 */
cc.TransitionTurnOffTiles = cc.TransitionScene.extend(/** @lends cc.TransitionTurnOffTiles# */{
    _gridProxy: null,
    /**
     * TransitionCrossFade的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        this._gridProxy = new cc.NodeGrid();
        scene && this.initWithDuration(t, scene);
    },

    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },

    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);
        this._gridProxy.setTarget(this._outScene);
        this._gridProxy.onEnter();

        var winSize = cc.director.getWinSize();
        var aspect = winSize.width / winSize.height;
        var x = 0 | (12 * aspect);
        var y = 12;
        var toff = cc.turnOffTiles(this._duration, cc.size(x, y));
        var action = this.easeActionWithAction(toff);
        this._gridProxy.runAction(cc.sequence(action, cc.callFunc(this.finish, this), cc.stopGrid()));
    },

    visit: function(){
        this._inScene.visit();
        this._gridProxy.visit();
    },

    /**
     * @param {cc.ActionInterval} action
     * @return {cc.ActionInterval}
     */
    easeActionWithAction:function (action) {
        return action;
    }
});

/**
 * 随机顺序关闭切出场景的小方块.
 * @deprecated 从v3.0之后，请使用 new cc.TransitionTurnOffTiles(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionTurnOffTiles}
 */
cc.TransitionTurnOffTiles.create = function (t, scene) {
    return new cc.TransitionTurnOffTiles(t, scene);
};

/**
 * 奇数列向上推移而偶数列向下推移.
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionSplitCols(time,scene);
 */
cc.TransitionSplitCols = cc.TransitionScene.extend(/** @lends cc.TransitionSplitCols# */{
    _gridProxy: null,

    _switchTargetToInscene: function(){
        this._gridProxy.setTarget(this._inScene);
    },

    /**
     * TransitionSplitCols的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        this._gridProxy = new cc.NodeGrid();
        scene && this.initWithDuration(t, scene);
    },
    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);
        //this._inScene.visible = false;
        this._gridProxy.setTarget(this._outScene);
        this._gridProxy.onEnter();

        var split = this.action();
        var seq = cc.sequence(
            split, cc.callFunc(this._switchTargetToInscene, this), split.reverse());

        this._gridProxy.runAction(
            cc.sequence(this.easeActionWithAction(seq), cc.callFunc(this.finish, this), cc.stopGrid())
        );
    },

    onExit: function(){
        this._gridProxy.setTarget(null);
        this._gridProxy.onExit();
        cc.TransitionScene.prototype.onExit.call(this);
    },

    visit: function(){
        this._gridProxy.visit();
    },

    /**
     * @param {cc.ActionInterval} action
     * @return {cc.EaseInOut}
     */
    easeActionWithAction:function (action) {
        return new cc.EaseInOut(action, 3.0);
    },

    /**
     * @return {*}
     */
    action:function () {
        return cc.splitCols(this._duration / 2.0, 3);
    }
});

/**
 * 奇数列向上推移而偶数列向下推移.
 * @deprecated 从v3.0之后，请使用 new cc.TransitionSplitCols(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionSplitCols}
 */
cc.TransitionSplitCols.create = function (t, scene) {
    return new cc.TransitionSplitCols(t, scene);
};

/**
 * 奇数行行从左侧推移，偶数行从右侧推移.
 * @class
 * @extends cc.TransitionSplitCols
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionSplitRows(time,scene);
 */
cc.TransitionSplitRows = cc.TransitionSplitCols.extend(/** @lends cc.TransitionSplitRows# */{

    /**
     * TransitionSplitRows的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionSplitCols.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * @return {*}
     */
    action:function () {
        return cc.splitRows(this._duration / 2.0, 3);
    }
});

/**
 * 奇数行行从左侧推移，偶数行从右侧推移.
 * @deprecated 从v3.0之后，请使用 new cc.TransitionSplitRows(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionSplitRows}
 */
cc.TransitionSplitRows.create = function (t, scene) {
    return new cc.TransitionSplitRows(t, scene);
};

/**
 * 从左下角到右上角淡出场景的所有小方块
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionFadeTR(time,scene);
 */
cc.TransitionFadeTR = cc.TransitionScene.extend(/** @lends cc.TransitionFadeTR# */{
    _gridProxy: null,
    /**
     * TransitionFadeTR的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        this._gridProxy = new cc.NodeGrid();
        scene && this.initWithDuration(t, scene);
    },
    _sceneOrder:function () {
        this._isInSceneOnTop = false;
    },

    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);

        this._gridProxy.setTarget(this._outScene);
        this._gridProxy.onEnter();

        var winSize = cc.director.getWinSize();
        var aspect = winSize.width / winSize.height;
        var x = 0 | (12 * aspect);
        var y = 12;

        var action = this.actionWithSize(cc.size(x, y));
        this._gridProxy.runAction(
            cc.sequence(this.easeActionWithAction(action), cc.callFunc(this.finish, this), cc.stopGrid())
        );
    },

    visit: function(){
        this._inScene.visit();
        this._gridProxy.visit();
    },

    /**
     * @param {cc.ActionInterval} action
     * @return {cc.ActionInterval}
     */
    easeActionWithAction:function (action) {
        return action;
    },

    /**
     * @param {cc.Size} size
     * @return {*}
     */
    actionWithSize:function (size) {
        return cc.fadeOutTRTiles(this._duration, size);
    }
});

/**
 * 从左下角到右上角淡出场景的所有小方块
 * @deprecated 从v3.0之后，请使用 new cc.TransitionFadeTR(t, scene) 替代
 * @param {Number} t  持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionFadeTR}
 */
cc.TransitionFadeTR.create = function (t, scene) {
    return new cc.TransitionFadeTR(t, scene);
};

/**
 * 从右上角到左下角淡出场景的所有小方块
 * @class
 * @extends cc.TransitionFadeTR
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionFadeBL(time,scene)
 */
cc.TransitionFadeBL = cc.TransitionFadeTR.extend(/** @lends cc.TransitionFadeBL# */{
    /**
     * TransitionFadeBL的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionFadeTR.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },

    /**
     * @param {cc.Size} size
     * @return {*}
     */
    actionWithSize:function (size) {
        return cc.fadeOutBLTiles(this._duration, size);
    }
});

/**
 * 从右上角到左下角淡出场景的所有小方块.
 * @deprecated  从v3.0之后，请使用 new cc.TransitionFadeBL(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionFadeBL}
 */
cc.TransitionFadeBL.create = function (t, scene) {
    return new cc.TransitionFadeBL(t, scene);
};

/**
 * 从下向上淡出场景的所有小方块.
 * @class
 * @extends cc.TransitionFadeTR
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionFadeUp(time,scene);
 */
cc.TransitionFadeUp = cc.TransitionFadeTR.extend(/** @lends cc.TransitionFadeUp# */{

    /**
     * TransitionFadeUp的构造函数
     * @function
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionFadeTR.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },

    /**
     * @param {cc.Size} size
     * @return {cc.FadeOutUpTiles}
     */
    actionWithSize:function (size) {
        return new cc.FadeOutUpTiles(this._duration, size);
    }
});

/**
 * 从下向上淡出场景的所有小方块.
 * @deprecated  从v3.0之后使，请用 new cc.TransitionFadeUp(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionFadeUp}
 */
cc.TransitionFadeUp.create = function (t, scene) {
    return new cc.TransitionFadeUp(t, scene);
};

/**
 * 从上向下淡出场景的所有小方块
 * @class
 * @extends cc.TransitionFadeTR
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionFadeDown(time,scene);
 */
cc.TransitionFadeDown = cc.TransitionFadeTR.extend(/** @lends cc.TransitionFadeDown# */{

    /**
     * TransitionFadeDown的构造函数
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionFadeTR.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },

    /**
     * @param {cc.Size} size
     * @return {*}
     */
    actionWithSize:function (size) {
        return cc.fadeOutDownTiles( this._duration, size);
    }
});

/**
 * 从上向下淡出场景的所有 小方块
 * @deprecated 从v3.0之后，请使用 new cc.TransitionFadeDown(t, scene) 替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionFadeDown}
 */
cc.TransitionFadeDown.create = function (t, scene) {
    return new cc.TransitionFadeDown(t, scene);
};

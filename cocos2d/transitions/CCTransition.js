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
 * A tag constant for identifying fade scenes  一个标记用于识别淡出的场景
 * @constant
 * @type Number
 */
cc.SCENE_FADE = 4208917214;

/**
 * horizontal orientation Type where the Left is nearer  水平方向，接近左边
 * @constant
 * @type Number
 */
cc.TRANSITION_ORIENTATION_LEFT_OVER = 0;
/**
 * horizontal orientation type where the Right is nearer 水平方向,接近右边
 * @constant
 * @type Number
 */
cc.TRANSITION_ORIENTATION_RIGHT_OVER = 1;
/**
 * vertical orientation type where the Up is nearer  垂直方向,接近上边
 * @constant
 * @type Number
 */
cc.TRANSITION_ORIENTATION_UP_OVER = 0;
/**
 * vertical orientation type where the Bottom is nearer  垂直方向,接近底边
 * @constant
 * @type Number
 */
cc.TRANSITION_ORIENTATION_DOWN_OVER = 1;

/**
 * @class
 * @extends cc.Scene
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene the scene to transit with 用于转换的场景
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
     * creates a base transition with duration and incoming scene 创建一个基本的具有持续时间(秒)和进入场景的转换
     * Constructor of cc.TransitionScene                          TransitionScene的构造函数
     * @param {Number} t time in seconds                          持续时间(秒)
     * @param {cc.Scene} scene the scene to transit with          用于转换的场景
     */
    ctor:function (t, scene) {
        cc.Scene.prototype.ctor.call(this);
        if(t !== undefined && scene !== undefined)
            this.initWithDuration(t, scene);
    },

    //private
    _setNewScene:function (dt) {
        this.unschedule(this._setNewScene);
        // Before replacing, save the "send cleanup to scene"  在替换之前, 保存一个"send cleanup to scene"
        var director = cc.director;
        this._isSendCleanupToScene = director.isSendCleanupToScene();
        director.runScene(this._inScene);

        // enable events while transitions   在转场时打开事件
        cc.eventManager.setEnabled(true);

        // issue #267
        this._outScene.visible = true;
    },

    //protected
    _sceneOrder:function () {
        this._isInSceneOnTop = true;
    },

    /**
     * stuff gets drawn here   进行两个场景的绘制
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
     *     Event callback that is invoked every time when cc.TransitionScene enters the 'stage'.                                   <br/>    每次调用事件回调会在TransitionScene事件进入'舞台'时 <br/>
     *     If the TransitionScene enters the 'stage' with a transition, this event is called when the transition starts.        <br/>       转场开始时这个事件会被调用, 当这个TransitionScene使用转场进入'舞台'  <br/>
     *     During onEnter you can't access a "sister/brother" node.                                                    <br/>                在onEnter时不能访问兄弟节点 <br/>
     *     If you override onEnter, you must call its parent's onEnter function with this._super().                                         如果需要覆盖onEnter, 必须使用this._super()调用父类的onEnter
     * </p>
     */
    onEnter:function () {
        cc.Node.prototype.onEnter.call(this);

        // disable events while transitions    在转场时禁用事件管理
        cc.eventManager.setEnabled(false);

        // outScene should not receive the onEnter callback   出场的场景不会收到onEnter的回调
        // only the onExitTransitionDidStart                  只有onExitTransitionDidStart
        this._outScene.onExitTransitionDidStart();

        this._inScene.onEnter();
    },

    /**
     *  <p>
     * callback that is called every time the cc.TransitionScene leaves the 'stage'.                                         <br/>      每次调用事件回调会在TransitionScene事件离开'舞台'时 <br/>
     * If the cc.TransitionScene leaves the 'stage' with a transition, this callback is called when the transition finishes. <br/>      转场结束时这个事件会被调用, 当这个TransitionScene使用转场离开'舞台'  <br/>
     * During onExit you can't access a sibling node.                                                             <br/>                 在onExit时不能访问兄弟节点 <br/>
     * If you override onExit, you shall call its parent's onExit with this._super().                                                   如果需要覆盖onExit, 必须使用this._super()调用父类的onExit <br/>
     * </p>
     */
    onExit:function () {
        cc.Node.prototype.onExit.call(this);

        // enable events while transitions  在转场时开启事件管理
        cc.eventManager.setEnabled(true);

        this._outScene.onExit();

        // _inScene should not receive the onEnter callback    进场的场景不会收到onEnter的回调
        // only the onEnterTransitionDidFinish                 只有onEnterTransitionDidFinish
        this._inScene.onEnterTransitionDidFinish();
    },

    /**
     * custom cleanup    自定义清理函数
     */
    cleanup:function () {
        cc.Node.prototype.cleanup.call(this);

        if (this._isSendCleanupToScene)
            this._outScene.cleanup();
    },

    /**
     * initializes a transition with duration and incoming scene      初始化一个具有持续时间(秒)和进入的场景
     * @param {Number} t time in seconds                              持续时间(秒)
     * @param {cc.Scene} scene a scene to transit to                  需要转场的场景
     * @return {Boolean} return false if error                        如果是error则返回 false
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
     * called after the transition finishes    在转场结束后调用
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
     * set hide the out scene and show in scene    隐藏出场的场景显示入场的场景
     */
    hideOutShowIn:function () {
        this._inScene.visible = true;
        this._outScene.visible = false;
    }
});
/**
 * creates a base transition with duration and incoming scene                 创建一个基本的具有持续时间(秒)和进入场景的转换
 * @deprecated since v3.0, please use new cc.TransitionScene(t,scene) instead 从v3.0之后使用 new cc.TransitionScene(t,scene) 替代
 * @param {Number} t time in seconds                                          持续时间(秒)
 * @param {cc.Scene} scene the scene to transit with                          需要转场的场景
 * @return {cc.TransitionScene|Null}
 */
cc.TransitionScene.create = function (t, scene) {
    return new cc.TransitionScene(t, scene);
};

/**
 * A cc.Transition that supports orientation like.<br/>                         Transition支持不同方向<br/>
 * Possible orientation: LeftOver, RightOver, UpOver, DownOver<br/>             可用的方向为: LeftOver, RightOver, UpOver, DownOver<br/>
 * useful for when you want to make a transition happen between 2 orientations  当需要制造一个使用两个方向之间的转场时可以使用
 *
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} orientation
 * @example
 * var trans = new cc.TransitionSceneOriented(time,scene,orientation);
 */
cc.TransitionSceneOriented = cc.TransitionScene.extend(/** @lends cc.TransitionSceneOriented# */{
    _orientation:0,

    /**
     * Constructor of TransitionSceneOriented TransitionSceneOriented 的构造函数
     * @param {Number} t time in seconds      持续时间(秒)
     * @param {cc.Scene} scene
     * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} orientation
     */
    ctor:function (t, scene, orientation) {
        cc.TransitionScene.prototype.ctor.call(this);
        orientation != undefined && this.initWithDuration(t, scene, orientation);
    },
    /**
     * initialize the transition         初始化转场
     * @param {Number} t time in seconds 持续时间(秒)
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
 * creates a base transition with duration and incoming scene                                        初始化一个具有持续时间(秒)和进入的场景
 * @deprecated since v3.0 ,please use new cc.TransitionSceneOriented(t, scene, orientation) instead. 从v3.0之后使用 new cc.TransitionSceneOriented(t, scene, orientation) 替代
 * @param {Number} t time in seconds                                                                 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} orientation
 * @return {cc.TransitionSceneOriented}
 */
cc.TransitionSceneOriented.create = function (t, scene, orientation) {
    return new cc.TransitionSceneOriented(t, scene, orientation);
};

/**
 *  Rotate and zoom out the outgoing scene, and then rotate and zoom in the incoming     旋转和缩放外出的场景，同时旋转缩放进入的场景 

 * @class
 * @extends cc.TransitionScene
 * @param {Number} t time in seconds                                                     持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionRotoZoom(t, scene);
 */
cc.TransitionRotoZoom = cc.TransitionScene.extend(/** @lends cc.TransitionRotoZoom# */{

    /**
     * Constructor of TransitionRotoZoom TransitionRotoZoom的构造函数
     * @function
     * @param {Number} t time in seconds 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * Custom On Enter callback  自定义onEnter回调
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
 * Creates a Transtion rotation and zoom                                          创建旋转和缩放外出的Transtion
 * @deprecated since v3.0,please use new cc.TransitionRotoZoom(t, scene) instead  从v3.0之后使用 new cc.TransitionRotoZoom(t, scene) 替代
 * @param {Number} t time in seconds                                              持续时间(秒)
 * @param {cc.Scene} scene the scene to work with                                 要使用的场景
 * @return {cc.TransitionRotoZoom}
 */
cc.TransitionRotoZoom.create = function (t, scene) {
    return new cc.TransitionRotoZoom(t, scene);
};

/**
 * Zoom out and jump the outgoing scene, and then jump and zoom in the incoming      缩小跳着切出场景, 同时跳着放大传入场景 
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t time in seconds                                                持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionJumpZoom(t, scene);
 */
cc.TransitionJumpZoom = cc.TransitionScene.extend(/** @lends cc.TransitionJumpZoom# */{
    /**
     * Constructor of TransitionJumpZoom
     * TransitionJumpZoom 构造函数
     * @param {Number} t time in seconds 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * Custom on enter
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
 * creates a scene transition that zooms then jump across the screen, the same for the incoming scene  缩小跳着切出场景, 同时跳着放大传入场景 
 * @deprecated since v3.0,please use new cc.TransitionJumpZoom(t, scene);                              从v3.0之后使用 new cc.TransitionJumpZoom(t, scene) 替代
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionJumpZoom}
 */
cc.TransitionJumpZoom.create = function (t, scene) {
    return new cc.TransitionJumpZoom(t, scene);
};

/**
 * Move in from to the left the incoming scene.    从左侧传入场景
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t time in seconds               持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionMoveInL(time,scene);
 */
cc.TransitionMoveInL = cc.TransitionScene.extend(/** @lends cc.TransitionMoveInL# */{
    /**
     * Constructor of TransitionMoveInL  TransitionMoveInL构造函数
     * @param {Number} t time in seconds 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * Custom on enter  自定义onEnter
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
     * initializes the scenes  初始化场景
     */
    initScenes:function () {
        this._inScene.setPosition(-cc.director.getWinSize().width, 0);
    },

    /**
     * returns the action that will be performed  当被执行进返回一个action
     */
    action:function () {
        return cc.moveTo(this._duration, cc.p(0, 0));
    },

    /**
     * creates an ease action from action 从action中创建一个ease action
     * @param {cc.ActionInterval} action
     * @return {cc.EaseOut}
     */
    easeActionWithAction:function (action) {
        return new cc.EaseOut(action, 2.0);
    }
});

/**
 * creates an action that  Move in from to the left the incoming scene.         创建一个从左侧传入场景的动作
 * @deprecated since v3.0,please use new cc.TransitionMoveInL(t, scene) instead 从v3.0之后使用 new cc.TransitionMoveInL(t, scene) 替代
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionMoveInL}
 */
cc.TransitionMoveInL.create = function (t, scene) {
    return new cc.TransitionMoveInL(t, scene);
};

/**
 * Move in from to the right the incoming scene. 右侧传入场景
 * @class
 * @extends cc.TransitionMoveInL
 * @param {Number} t time in seconds             持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionMoveInR(time,scene);
 */
cc.TransitionMoveInR = cc.TransitionMoveInL.extend(/** @lends cc.TransitionMoveInR# */{
    /**
     * Constructor of TransitionMoveInR  TransitionMoveInR的构造函数
     * @param {Number} t time in seconds 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionMoveInL.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * Init function    初始化函数
     */
    initScenes:function () {
        this._inScene.setPosition(cc.director.getWinSize().width, 0);
    }
});

/**
 * create a scene transition that Move in from to the right the incoming scene.   创建一个右侧传入场景转场
 * @deprecated since v3.0,please use new cc.TransitionMoveInR(t, scene) instead   从v3.0之后使用 new cc.TransitionMoveInR(t, scene) 替代
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionMoveInR}
 */
cc.TransitionMoveInR.create = function (t, scene) {
    return new cc.TransitionMoveInR(t, scene);
};

/**
 * Move in from to the top the incoming scene.  从顶部传入场景
 * @class
 * @extends cc.TransitionMoveInL
 * @param {Number} t time in seconds            持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionMoveInT(time,scene);
 */
cc.TransitionMoveInT = cc.TransitionMoveInL.extend(/** @lends cc.TransitionMoveInT# */{
    /**
     * Constructor of TransitionMoveInT  TransitionMoveInT的构造函数
     * @param {Number} t time in seconds 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionMoveInL.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * init function 初始化函数
     */
    initScenes:function () {
        this._inScene.setPosition(0, cc.director.getWinSize().height);
    }
});

/**
 * Move in from to the top the incoming scene.                                  从顶部传入场景
 * @deprecated since v3.0,please use new cc.TransitionMoveInT(t, scene) instead 从v3.0之后使用 new cc.TransitionMoveInT(t, scene) 替代
 * @param {Number} t time in seconds                                            持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionMoveInT}
 */
cc.TransitionMoveInT.create = function (t, scene) {
    return new cc.TransitionMoveInT(t, scene);
};

/**
 * Move in from to the bottom the incoming scene. 从底部传入场景
 * @class
 * @extends cc.TransitionMoveInL
 * @param {Number} t time in seconds              持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionMoveInB(time,scene);
 */
cc.TransitionMoveInB = cc.TransitionMoveInL.extend(/** @lends cc.TransitionMoveInB# */{
    /**
     * Constructor of TransitionMoveInB  TransitionMoveInB的构造函数
     * @param {Number} t time in seconds 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionMoveInL.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },

    /**
     * init function  初始始化函数
     */
    initScenes:function () {
        this._inScene.setPosition(0, -cc.director.getWinSize().height);
    }
});

/**
 * create a scene transition that Move in from to the bottom the incoming scene.  创建一个从底部传入场景的转场
 * @deprecated since v3.0,please use new cc.TransitionMoveInB(t, scene) instead   从v3.0之后使用 new cc.TransitionMoveInB(t, scene) 替代
 * @param {Number} t time in seconds                                              持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionMoveInB}
 */
cc.TransitionMoveInB.create = function (t, scene) {
    return new cc.TransitionMoveInB(t, scene);
};

/**
 * The adjust factor is needed to prevent issue #442<br/>                      一个修正系数去防止issue #442 <br/>
 * One solution is to use DONT_RENDER_IN_SUBPIXELS images, but NO<br/>         一个解决方案是使用DONT_RENDER_IN_SUBPIXELS的使用, 不行 <br/>
 * The other issue is that in some transitions (and I don't know why)<br/>     另一个问题在一些转场(我不知道为毛) <br>
 * the order should be reversed (In in top of Out or vice-versa).              这个问题会被反转(?)
 * @constant
 * @type Number
 */
cc.ADJUST_FACTOR = 0.5;

/**
 * a transition that a new scene is slided from left 一个从左边滑入传入转场
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t time in seconds                 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = cc.TransitionSlideInL(time,scene);
 */
cc.TransitionSlideInL = cc.TransitionScene.extend(/** @lends cc.TransitionSlideInL# */{
    /**
     * Constructor of TransitionSlideInL TransitionSlideInL的构造函数
     * @param {Number} t time in seconds 持续时间(秒)
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
     * custom on enter 自定义on enter
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
     * initializes the scenes 初始化场景
     */
    initScenes:function () {
        this._inScene.setPosition(-cc.director.getWinSize().width + cc.ADJUST_FACTOR, 0);
    },
    /**
     * returns the action that will be performed by the incomming and outgoing scene 返回传入/传出场景要执行的 action
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
 * create a transition that a new scene is slided from left                       创建一个从左边滑入传入场景的转场.
 * @deprecated since v3.0,please use new cc.TransitionSlideInL(t, scene) instead  从v3.0之后使用 new cc.TransitionSlideInL(t, scene) 替代
 * @param {Number} t time in seconds                                              持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionSlideInL}
 */
cc.TransitionSlideInL.create = function (t, scene) {
    return new cc.TransitionSlideInL(t, scene);
};

/**
 *  Slide in the incoming scene from the right border.  从右边滑入传入场景.
 * @class
 * @extends cc.TransitionSlideInL
 * @param {Number} t time in seconds                   持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionSlideInR(time,scene);
 */
cc.TransitionSlideInR = cc.TransitionSlideInL.extend(/** @lends cc.TransitionSlideInR# */{
    /**
     * Constructor of TransitionSlideInR TransitionSlideInR的构造函数
     * @param {Number} t time in seconds 持续时间(秒)
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
     * initializes the scenes 初始化场景
     */
    initScenes:function () {
        this._inScene.setPosition(cc.director.getWinSize().width - cc.ADJUST_FACTOR, 0);
    },
    /**
     *  returns the action that will be performed by the incomming and outgoing scene  返回传入/传出场景 要执行的 action
     * @return {cc.MoveBy}
     */
    action:function () {
        return cc.moveBy(this._duration, cc.p(-(cc.director.getWinSize().width - cc.ADJUST_FACTOR), 0));
    }
});

/**
 * create Slide in the incoming scene from the right border.                     从右边滑入传入场景.
 * @deprecated since v3.0,please use new cc.TransitionSlideInR(t, scene) instead 从v3.0之后使用 new cc.TransitionSlideInR(t, scene) 替代
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionSlideInR}
 */
cc.TransitionSlideInR.create = function (t, scene) {
    return new cc.TransitionSlideInR(t, scene);
};

/**
 * Slide in the incoming scene from the bottom border.  从底部滑入传入场景. 
 * @class
 * @extends cc.TransitionSlideInL
 * @param {Number} t time in seconds                    持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionSlideInB(time,scene);
 */
cc.TransitionSlideInB = cc.TransitionSlideInL.extend(/** @lends cc.TransitionSlideInB# */{
    /**
     * Constructor of TransitionSlideInB TransitionSlideInB的构造函数
     * @param {Number} t time in seconds 持续时间(秒)
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
     * initializes the scenes    初始化场景
     */
    initScenes:function () {
        this._inScene.setPosition(0, -(cc.director.getWinSize().height - cc.ADJUST_FACTOR));
    },

    /**
     * returns the action that will be performed by the incomming and outgoing scene
     * 返回传入/传出场景要执行的 action
     * @return {cc.MoveBy}
     */
    action:function () {
        return cc.moveBy(this._duration, cc.p(0, cc.director.getWinSize().height - cc.ADJUST_FACTOR));
    }
});

/**
 * create a Slide in the incoming scene from the bottom border.                   从底部滑入传入场景
 * @deprecated since v3.0,please use new cc.TransitionSlideInB(t, scene) instead. 从v3.0之后使用 new cc.TransitionSlideInB(t, scene) 替代
 * @param {Number} t time in seconds                                              持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionSlideInB}
 */
cc.TransitionSlideInB.create = function (t, scene) {
    return new cc.TransitionSlideInB(t, scene);
};

/**
 *  Slide in the incoming scene from the top border.   从顶部滑入传入场景. 
 *  @class
 *  @extends cc.TransitionSlideInL
 *  @param {Number} t time in seconds                  持续时间(秒)
 *  @param {cc.Scene} scene
 *  @example
 *  var trans = new cc.TransitionSlideInT(time,scene);
 */
cc.TransitionSlideInT = cc.TransitionSlideInL.extend(/** @lends cc.TransitionSlideInT# */{
    /**
     * Constructor of TransitionSlideInT TransitionSlideInT的构造函数
     * @param {Number} t time in seconds 持续时间(秒)
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
     * initializes the scenes    初始化场景
     */
    initScenes:function () {
        this._inScene.setPosition(0, cc.director.getWinSize().height - cc.ADJUST_FACTOR);
    },

    /**
     * returns the action that will be performed by the incomming and outgoing scene   返回传入/传出场景要执行的 action
     * @return {cc.MoveBy}
     */
    action:function () {
        return cc.moveBy(this._duration, cc.p(0, -(cc.director.getWinSize().height - cc.ADJUST_FACTOR)));
    }
});

/**
 * create a Slide in the incoming scene from the top border.                       从顶部滑入传入场景. 
 * @deprecated since v3.0,please use new cc.TransitionSlideInT(t, scene) instead.  从v3.0之后使用 new cc.TransitionSlideInT(t, scene) 替代
 * @param {Number} t time in seconds                                               持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionSlideInT}
 */
cc.TransitionSlideInT.create = function (t, scene) {
    return new cc.TransitionSlideInT(t, scene);
};

/**
 * Shrink the outgoing scene while grow the incoming scene    当增长传入场景的时候，收缩传出的场景
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t time in seconds                          持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionShrinkGrow(time,scene);
 */
cc.TransitionShrinkGrow = cc.TransitionScene.extend(/** @lends cc.TransitionShrinkGrow# */{
    /**
     * Constructor of TransitionShrinkGrow  TransitionShrinkGrow构造函数
     * @param {Number} t time in seconds    持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * Custom on enter 自定义onEnter
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
 * Shrink the outgoing scene while grow the incoming scene                          当增长传入场景的时候，收缩传出的场景
 * @deprecated since v3.0,please use new cc.TransitionShrinkGrow(t, scene) instead. 从v3.0之后使用 new cc.TransitionShrinkGrow(t, scene) 替代
 * @param {Number} t time in seconds                                                持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionShrinkGrow}
 */
cc.TransitionShrinkGrow.create = function (t, scene) {
    return new cc.TransitionShrinkGrow(t, scene);
};

/**
 *  Flips the screen horizontally.<br/>                                            水平翻转屏幕<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.   正面是传出的场景，背面是传入的场景
 * @class
 * @extends cc.TransitionSceneOriented
 * @param {Number} t time in seconds                                               持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = new cc.TransitionFlipX(t,scene,o);
 */
cc.TransitionFlipX = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionFlipX# */{
    /**
     * Constructor of TransitionFlipX    TransitionFlipX的构造函数
     * @function
     * @param {Number} t time in seconds 持续时间(秒)
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
     * custom on enter  自定义onEnter
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
 * Flips the screen horizontally.<br/>                                           水平翻转屏幕。<br/>
 * The front face is the outgoing scene and the back face is the incoming scene. 正面是传出的场景，背面是传入的场景
 * @deprecated since v3.0,please use new cc.TransitionFlipX(t, scene,o) instead. 从v3.0之后使用 new cc.TransitionFlipX(t, scene,o) 替代
 * @param {Number} t time in seconds                                             持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionFlipX}
 */
cc.TransitionFlipX.create = function (t, scene, o) {
    return new cc.TransitionFlipX(t, scene, o);
};

/**
 * Flips the screen vertically.<br/>                                                 垂直翻转屏幕<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.     正面是传出的场景，背面是传入的场景
 * @class
 * @extends cc.TransitionSceneOriented
 * @param {Number} t time in seconds                                                 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = new cc.TransitionFlipY(time,scene,0);
 */
cc.TransitionFlipY = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionFlipY# */{

    /**
     * Constructor of TransitionFlipY    TransitionFlipY的构造函数
     * @param {Number} t time in seconds 持续时间(秒)
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
     * custom on enter  自定义onEnter
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
 * Flips the screen vertically.<br/>                                             垂直翻转屏幕<br/>
 * The front face is the outgoing scene and the back face is the incoming scene. 正面是传出的场景，背面是传入的场景
 * @deprecated since v3.0,please use new cc.TransitionFlipY(t, scene,o) instead. 从v3.0之后使用 new cc.TransitionFlipY(t, scene, o) 替代
 * @param {Number} t time in seconds                                             持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionFlipY}
 */
cc.TransitionFlipY.create = function (t, scene, o) {
    return new cc.TransitionFlipY(t, scene, o);
};

/**
 * Flips the screen half horizontally and half vertically.<br/>                     水平垂直翻转一半屏幕.<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.    正面是传出的场景，背面是传入的场景
 * @class
 * @extends cc.TransitionSceneOriented
 * @param {Number} t time in seconds                                                持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = cc.TransitionFlipAngular(time,scene,o);
 */
cc.TransitionFlipAngular = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionFlipAngular# */{
    /**
     * Constructor of TransitionFlipAngular    TransitionFlipAngular的构造函数
     * @param {Number} t time in seconds       持续时间(秒)
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
     * custom on enter   自定义onEnter
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
 * Flips the screen half horizontally and half vertically.<br/>                            水平垂直翻转一半屏幕<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.           正面是传出的场景，背面是传入的场景
 * @deprecated since v3.0,please use new new cc.TransitionFlipAngular(t, scene, o) instead 从v3.0之后使用 new cc.TransitionFlipAngular(t, scene, o) 替代
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionFlipAngular}
 */
cc.TransitionFlipAngular.create = function (t, scene, o) {
    return new cc.TransitionFlipAngular(t, scene, o);
};

/**
 *  Flips the screen horizontally doing a zoom out/in<br/>                           水平翻转屏幕，做一个 传入/穿出 缩放<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.     正面是传出的场景，背面是传入的场景
 * @class
 * @extends cc.TransitionSceneOriented
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = new cc.TransitionZoomFlipX(time,scene,o);
 */
cc.TransitionZoomFlipX = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionZoomFlipX# */{

    /**
     * Constructor of TransitionZoomFlipX
     * TransitionZoomFlipX的构造函数
     * @param {Number} t time in seconds 持续时间(秒)
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
     * custom on enter
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
 * Flips the screen horizontally doing a zoom out/in<br/>                                水平翻转屏幕，做一个 传入/穿出 缩放<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.         正面是传出的场景，背面是传入的场景。 
 * @deprecated since v3.0,please use new new cc.TransitionZoomFlipX(t, scene, o) instead 从v3.0之后使用 new cc.TransitionZoomFlipX(t, scene, o) 替代
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionZoomFlipX}
 */
cc.TransitionZoomFlipX.create = function (t, scene, o) {
    return new cc.TransitionZoomFlipX(t, scene, o);
};

/**
 * Flips the screen vertically doing a little zooming out/in<br/>                    垂直翻转屏幕，做一个 传入/穿出 缩放 <br/>
 * The front face is the outgoing scene and the back face is the incoming scene.     正面是传出的场景，背面是传入的场景
 * @class
 * @extends cc.TransitionSceneOriented
 * @param {Number} t time in seconds                                                 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = new cc.TransitionZoomFlipY(t,scene,o);
 */
cc.TransitionZoomFlipY = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionZoomFlipY# */{

    /**         
     * Constructor of TransitionZoomFlipY          
     * @param {Number} t time in seconds           持续时间(秒)
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
     * custom on enter  自定义onEnter
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
 * Flips the screen vertically doing a little zooming out/in<br/>                        垂直翻转屏幕，做一个 传入/穿出 缩放<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.         正面是传出的场景，背面是传入的场景
 * @deprecated since v3.0,please use new new cc.TransitionZoomFlipY(t, scene, o) instead 从v3.0之后使用 new cc.TransitionZoomFlipY(t, scene, o) 替代
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionZoomFlipY}
 */
cc.TransitionZoomFlipY.create = function (t, scene, o) {
    return new cc.TransitionZoomFlipY(t, scene, o);
};

/**
 *  Flips the screen half horizontally and half vertically doing a little zooming out/in.<br/>    一半水平一半垂直 传入/穿出 翻转并一点点的缩放屏幕<br/>
 * The front face is the outgoing scene and the back face is the incoming scene.                  正面是传出的场景，背面是传入的场景
 * @class
 * @extends cc.TransitionSceneOriented
 * @param {Number} t time in seconds                                                              持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = new cc.TransitionZoomFlipAngular(time,scene,o);
 */
cc.TransitionZoomFlipAngular = cc.TransitionSceneOriented.extend(/** @lends cc.TransitionZoomFlipAngular# */{

    /**
     * Constructor of TransitionZoomFlipAngular TransitionZoomFlipAngular的构造函数
     * @param {Number} t time in seconds        持续时间(秒)
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
     * custom on enter  自定义 onEnter
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
 * Flips the screen half horizontally and half vertically doing a little zooming out/in.<br/>      一半水平一半垂直 传入/穿出 翻转并一点点的缩放屏幕 <br/>
 * The front face is the outgoing scene and the back face is the incoming scene.                   正面是传出的场景，背面是传入的场景
 * @deprecated since v3.0,please use new new cc.TransitionZoomFlipAngular(t, scene, o) instead     从v3.0之后使用 cc.TransitionZoomFlipAngular(t, scene, o) 替代
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @return {cc.TransitionZoomFlipAngular}
 */
cc.TransitionZoomFlipAngular.create = function (t, scene, o) {
    return new cc.TransitionZoomFlipAngular(t, scene, o);
};

/**
 * Fade out the outgoing scene and then fade in the incoming scene.  淡出传出场景，淡入传入场景
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t time in seconds                                 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
 * @example
 * var trans = new cc.TransitionFade(time,scene,color)
 */
cc.TransitionFade = cc.TransitionScene.extend(/** @lends cc.TransitionFade# */{
    _color:null,

    /**
     * Constructor of TransitionFade     TransitionFade的构造函数
     * @param {Number} t time in seconds 持续时间(秒)
     * @param {cc.Scene} scene
     * @param {cc.TRANSITION_ORIENTATION_LEFT_OVER|cc.TRANSITION_ORIENTATION_RIGHT_OVER|cc.TRANSITION_ORIENTATION_UP_OVER|cc.TRANSITION_ORIENTATION_DOWN_OVER} o
     */
    ctor:function (t, scene, color) {
        cc.TransitionScene.prototype.ctor.call(this);
        this._color = cc.color();
        scene && this.initWithDuration(t, scene, color);
    },

    /**
     * custom on enter   自定义onEnter
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
     * custom on exit  自定义onExit
     */
    onExit:function () {
        cc.TransitionScene.prototype.onExit.call(this);
        this.removeChildByTag(cc.SCENE_FADE, false);
    },

    /**
     * initializes the transition with a duration and with an RGB color    通过持续时间、RGB color 初始化一个转场
     * @param {Number} t time in seconds                                   持续时间(秒)
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
 * Fade out the outgoing scene and then fade in the incoming scene.                   淡出传出场景 ，淡入传入场景
 * @deprecated since v3.0,please use new cc.TransitionFade(time,scene,color) instead. 从v3.0之后使用 new cc.TransitionFade(time,scene,color) 替代
 * @param {Number} t time in seconds                                                  持续时间(秒)
 * @param {cc.Scene} scene
 * @param {cc.Color} color
 * @return {cc.TransitionFade}
 */
cc.TransitionFade.create = function (t, scene, color) {
    return new cc.TransitionFade(t, scene, color);
};

/**
 * Cross fades two scenes using the cc.RenderTexture object.
 * 两个 scenes 使用 RenderTexture 对象交叉淡入淡出 
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionCrossFade(time,scene);
 */
cc.TransitionCrossFade = cc.TransitionScene.extend(/** @lends cc.TransitionCrossFade# */{
    /**
     * Constructor of TransitionCrossFade
     * @param {Number} t time in seconds 持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        scene && this.initWithDuration(t, scene);
    },
    /**
     * custom on enter
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);

        // create a transparent color layer                 创建一个透明的color layer
        // in which we are going to add our rendertextures  为了添加到rendertextures
        var color = cc.color(0, 0, 0, 0);
        var winSize = cc.director.getWinSize();
        var layer = new cc.LayerColor(color);

        // create the first render texture for inScene       创建第一个进入场景的rendertexture
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

        // render inScene to its texturebuffer  入场场景绘制进texturebuffer
        inTexture.begin();
        this._inScene.visit();
        inTexture.end();

        // create the second render texture for outScene  创造第二个render texture为出场场景
        var outTexture = new cc.RenderTexture(winSize.width, winSize.height);
        outTexture.setPosition(winSize.width / 2, winSize.height / 2);
	    outTexture.sprite.anchorX = outTexture.anchorX = 0.5;
	    outTexture.sprite.anchorY = outTexture.anchorY = 0.5;

        // render outScene to its texturebuffer   绘制出场场景到纹理缓存
        outTexture.begin();
        this._outScene.visit();
        outTexture.end();

        inTexture.sprite.setBlendFunc(cc.ONE, cc.ONE);                                             // inScene will lay on background and will not be used with alpha   入场场景是可见的,所以不会用到的alpha
        outTexture.sprite.setBlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);                      // we are going to blend outScene via alpha                         将通过与出场场的alpha进行混合

        // add render textures to the layer 在这个layer增加render texture
        layer.addChild(inTexture);
        layer.addChild(outTexture);

        // initial opacity:  初始透明度
        inTexture.sprite.opacity = 255;
        outTexture.sprite.opacity = 255;

        // create the blend action  创建混合动作
        var layerAction = cc.sequence(
            cc.fadeTo(this._duration, 0), cc.callFunc(this.hideOutShowIn, this),
            cc.callFunc(this.finish, this)
        );

        // run the blend action     执行混合动作
        outTexture.sprite.runAction(layerAction);

        // add the layer (which contains our two rendertextures) to the scene     添加一个layer(包含两个rendertexture)到这个场景
        this.addChild(layer, 2, cc.SCENE_FADE);
    },

    /**
     * custom on exit
     * 自定义onExit
     */
    onExit:function () {
        this.removeChildByTag(cc.SCENE_FADE, false);
        cc.TransitionScene.prototype.onExit.call(this);
    },

    /**
     * stuff gets drawn here
     * 在这绘制
     */
    visit:function () {
        cc.Node.prototype.visit.call(this);
    },

    /**
     * overide draw
     * 覆盖draw
     */
    draw:function () {
        // override draw since both scenes (textures) are rendered in 1 scene    覆盖,由于两个场景的纹理会在一个场景里绘制
    }
});

/**
 * Cross fades two scenes using the cc.RenderTexture object.                       使用 RenderTexture 对两个 scenes 交叉淡入淡出
 * @deprecated since v3.0,please use new cc.TransitionCrossFade(t, scene) instead. 从v3.0之后使用 new cc.TransitionCrossFade(t, scene) 替代
 * @param {Number} t time in seconds                                               持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionCrossFade}
 */
cc.TransitionCrossFade.create = function (t, scene) {
    return new cc.TransitionCrossFade(t, scene);
};

/**
 *  Turn off the tiles of the outgoing scene in random order 随机顺序关闭淡出场景的 tiles.
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionTurnOffTiles(time,scene);
 */
cc.TransitionTurnOffTiles = cc.TransitionScene.extend(/** @lends cc.TransitionTurnOffTiles# */{
    _gridProxy: null,
    /**
     * Constructor of TransitionCrossFade  TransitionCrossFade的构造函数
     * @param {Number} t time in seconds   持续时间(秒)
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
     * custom on enter
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
 *  Turn off the tiles of the outgoing scene in random order                          随机顺序关闭淡出场景的 tiles.
 * @deprecated since v3.0,please use new cc.TransitionTurnOffTiles(t, scene) instead. 从v3.0之后使用 new cc.TransitionTurnOffTiles(t, scene) 替代
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionTurnOffTiles}
 */
cc.TransitionTurnOffTiles.create = function (t, scene) {
    return new cc.TransitionTurnOffTiles(t, scene);
};

/**
 *  The odd columns goes upwards while the even columns goes downwards.  奇数列向上推移而偶数列向下推移.
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t time in seconds 持续时间(秒)
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
     * Constructor of TransitionSplitCols    TransitionSplitCols的构造函数
     * @param {Number} t time in seconds     持续时间(秒)
     * @param {cc.Scene} scene
     */
    ctor:function (t, scene) {
        cc.TransitionScene.prototype.ctor.call(this);
        this._gridProxy = new cc.NodeGrid();
        scene && this.initWithDuration(t, scene);
    },
    /**
     * custom on enter  自定义onEnter
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
 * The odd columns goes upwards while the even columns goes downwards.              奇数列向上推移而偶数列向下推移.
 * @deprecated since v3.0,please use new cc.TransitionSplitCols(t, scene) instead. 从v3.0之后使用 new cc.TransitionSplitCols(t, scene) 替代
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionSplitCols}
 */
cc.TransitionSplitCols.create = function (t, scene) {
    return new cc.TransitionSplitCols(t, scene);
};

/**
 *  The odd rows goes to the left while the even rows goes to the right.      奇数行行从左侧推移，偶数行从右侧推移.
 * @class
 * @extends cc.TransitionSplitCols
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionSplitRows(time,scene);
 */
cc.TransitionSplitRows = cc.TransitionSplitCols.extend(/** @lends cc.TransitionSplitRows# */{

    /**
     * Constructor of TransitionSplitRows    TransitionSplitRows的构造函数
     * @param {Number} t time in seconds     持续时间(秒)
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
 * The odd rows goes to the left while the even rows goes to the right.             奇数行行从左侧推移，偶数行从右侧推移.
 * @deprecated since v3.0,please use new cc.TransitionSplitRows(t, scene) instead.  从v3.0之后使用 new cc.TransitionSplitRows(t, scene) 替代
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionSplitRows}
 */
cc.TransitionSplitRows.create = function (t, scene) {
    return new cc.TransitionSplitRows(t, scene);
};

/**
 *  Fade the tiles of the outgoing scene from the left-bottom corner the to top-right corner. 从左下角到右上角淡出 scene 的所有 tiles
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionFadeTR(time,scene);
 */
cc.TransitionFadeTR = cc.TransitionScene.extend(/** @lends cc.TransitionFadeTR# */{
    _gridProxy: null,
    /**
     * Constructor of TransitionFadeTR   TransitionFadeTR的构造函数
     * @param {Number} t time in seconds 持续时间(秒)
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
     * Custom on enter  自定义onEnter
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
 * Fade the tiles of the outgoing scene from the left-bottom corner the to top-right corner.    从左下角到右上角淡出 scene 的所有 tiles
 * @deprecated since v3.0 please use new cc.TransitionFadeTR(t, scene) instead.                 从v3.0之后使用 new cc.TransitionFadeTR(t, scene) 替代
 * @param {Number} t time in seconds                                                            持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionFadeTR}
 */
cc.TransitionFadeTR.create = function (t, scene) {
    return new cc.TransitionFadeTR(t, scene);
};

/**
 * Fade the tiles of the outgoing scene from the top-right corner to the bottom-left corner. 从右上角到左下角淡出 scene 的所有 tiles
 * @class
 * @extends cc.TransitionFadeTR
 * @param {Number} t time in seconds                                                         持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionFadeBL(time,scene)
 */
cc.TransitionFadeBL = cc.TransitionFadeTR.extend(/** @lends cc.TransitionFadeBL# */{
    /**
     * Constructor of TransitionFadeBL
     * @param {Number} t time in seconds 持续时间(秒)
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
 * Fade the tiles of the outgoing scene from the top-right corner to the bottom-left corner. 从右上角到左下角淡出 scene 的所有 tiles.
 * @deprecated since v3.0,please use new cc.TransitionFadeBL(t, scene);                      从v3.0之后使用 new cc.TransitionFadeBL(t, scene) 替代
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionFadeBL}
 */
cc.TransitionFadeBL.create = function (t, scene) {
    return new cc.TransitionFadeBL(t, scene);
};

/**
 * Fade the tiles of the outgoing scene from the top-right corner to the bottom-left corner.  从右上向左下淡出 scene 的所有 tiles.
 * @class
 * @extends cc.TransitionFadeTR
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionFadeUp(time,scene);
 */
cc.TransitionFadeUp = cc.TransitionFadeTR.extend(/** @lends cc.TransitionFadeUp# */{

    /**
     * Constructor of TransitionFadeUp  TransitionFadeUp的构造函数
     * @function
     * @param {Number} t time in seconds 持续时间(秒)
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
 * Fade the tiles of the outgoing scene from the top-right corner to the bottom-left corner.  从下向上淡出 scene 的所有 tiles.
 * @deprecated since v3.0,please use new cc.TransitionFadeUp(t, scene) instead. 从v3.0之后使用 new cc.TransitionFadeUp(t, scene) 替代
 * @param {Number} t time in seconds 持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionFadeUp}
 */
cc.TransitionFadeUp.create = function (t, scene) {
    return new cc.TransitionFadeUp(t, scene);
};

/**
 * Fade the tiles of the outgoing scene from the top to the bottom. 从上向下淡出 scene 的所有 tiles
 * @class
 * @extends cc.TransitionFadeTR
 * @param {Number} t time in seconds                                持续时间(秒)
 * @param {cc.Scene} scene
 * @example
 * var trans = new cc.TransitionFadeDown(time,scene);
 */
cc.TransitionFadeDown = cc.TransitionFadeTR.extend(/** @lends cc.TransitionFadeDown# */{

    /**
     * Constructor of TransitionFadeDown TransitionFadeDown的构造函数
     * @param {Number} t time in seconds 持续时间(秒)
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
 * Fade the tiles of the outgoing scene from the top to the bottom.               从上向下淡出 scene 的所有 tiles
 * @deprecated since v3.0,please use new cc.TransitionFadeDown(t, scene) instead. 从v3.0之后使用 new cc.TransitionFadeDown(t, scene) 替代
 * @param {Number} t time in seconds                                              持续时间(秒)
 * @param {cc.Scene} scene
 * @return {cc.TransitionFadeDown}
 */
cc.TransitionFadeDown.create = function (t, scene) {
    return new cc.TransitionFadeDown(t, scene);
};

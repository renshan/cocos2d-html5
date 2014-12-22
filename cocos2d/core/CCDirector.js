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

cc.g_NumberOfDraws = 0;

cc.GLToClipTransform = function (transformOut) {
    var projection = new cc.kmMat4();
    cc.kmGLGetMatrix(cc.KM_GL_PROJECTION, projection);

    var modelview = new cc.kmMat4();
    cc.kmGLGetMatrix(cc.KM_GL_MODELVIEW, modelview);

    cc.kmMat4Multiply(transformOut, projection, modelview);
};
//----------------------------------------------------------------------------------------------------------------------

/**
 * <p>
 *    注意:请使用cc.director而不是cc.Director.<br/> 
 *    cc.director 是管理游戏逻辑流程的单例类.<br/>                           
 *    由于它是一个单例,所以你不用调用任何构造方法或者create方法,<br/> 
 *    标准的调用方法如下:<br/>                                                         
 *      - cc.director.methodName(); <br/>
 *
 *    它创建并控制主窗口并且管理什么时候怎么运行场景.<br/>
 *    <br/>
 *    cc.director 还负责以下内容:<br/>                                                          
 *      - 初始化OpenGL上下文<br/>                                                               
 *      - 设置OpenGL像素格式（默认为RGB565)<br/>                                        
 *      - 设置OpenGL缓冲深度(默认为1)<br/>                                        
 *      - 设置投影(默认为1,代表3D)<br/>                                                    
 *      - 设置方向(默认为1,代表竖屏)<br/>                                             
 *      <br/>
 *    <br/>
 *    cc.director也设置默认OpenGL上下文:<br/>                                             
 *      - 激活GL_TEXTURE_2D<br/>                                                                      
 *      - 激活GL_VERTEX_ARRAY<br/>                                                                    
 *      - 激活GL_COLOR_ARRAY<br/>                                                                     
 *      - 激活GL_TEXTURE_COORD_ARRAY<br/>                                                             
 * </p>
 * <p>
 *   cc.director还与显示的刷新速率同步时间.<br/>                         
 *   特性和限制：<br/>                                                                          
 *      - 定时器时间和绘图要和显示的刷新率同步<br/>              
 *      - 只支持动画间隔为1/60,1/30,1/15<br/>                                         
 * </p>
 * @class
 * @name cc.Director
 */
cc.Director = cc.Class.extend(/** @lends cc.Director# */{
    //Variables
    _landscape: false,
    _nextDeltaTimeZero: false,
    _paused: false,
    _purgeDirectorInNextLoop: false,
    _sendCleanupToScene: false,
    _animationInterval: 0.0,
    _oldAnimationInterval: 0.0,
    _projection: 0,
    _accumDt: 0.0,
    _contentScaleFactor: 1.0,

    _displayStats: false,
    _deltaTime: 0.0,
    _frameRate: 0.0,

    _FPSLabel: null,
    _SPFLabel: null,
    _drawsLabel: null,

    _winSizeInPoints: null,

    _lastUpdate: null,
    _nextScene: null,
    _notificationNode: null,
    _openGLView: null,
    _scenesStack: null,
    _projectionDelegate: null,
    _runningScene: null,

    _frames: 0,
    _totalFrames: 0,
    _secondsPerFrame: 0,

    _dirtyRegion: null,

    _scheduler: null,
    _actionManager: null,
    _eventProjectionChanged: null,
    _eventAfterDraw: null,
    _eventAfterVisit: null,
    _eventAfterUpdate: null,

    ctor: function () {
        var self = this;
        self._lastUpdate = Date.now();
        cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function () {
            self._lastUpdate = Date.now();
        });
    },

    init: function () {
        // 场景
        this._oldAnimationInterval = this._animationInterval = 1.0 / cc.defaultFPS;
        this._scenesStack = [];
        // 设置默认投影(3D)
        this._projection = cc.Director.PROJECTION_DEFAULT;
        // 如果用户使用自定义的投影，设置投影代理为空
        this._projectionDelegate = null;

        //FPS
        this._accumDt = 0;
        this._frameRate = 0;
        this._displayStats = false;//可以删除
        this._totalFrames = this._frames = 0;
        this._lastUpdate = Date.now();

        //暂停？
        this._paused = false;

        //清理？
        this._purgeDirectorInNextLoop = false;

        this._winSizeInPoints = cc.size(0, 0);

        this._openGLView = null;
        this._contentScaleFactor = 1.0;

        //定时器
        this._scheduler = new cc.Scheduler();
        //动作管理器
        this._actionManager = cc.ActionManager ? new cc.ActionManager() : null;
        this._scheduler.scheduleUpdateForTarget(this._actionManager, cc.Scheduler.PRIORITY_SYSTEM, false);

        this._eventAfterDraw = new cc.EventCustom(cc.Director.EVENT_AFTER_DRAW);
        this._eventAfterDraw.setUserData(this);
        this._eventAfterVisit = new cc.EventCustom(cc.Director.EVENT_AFTER_VISIT);
        this._eventAfterVisit.setUserData(this);
        this._eventAfterUpdate = new cc.EventCustom(cc.Director.EVENT_AFTER_UPDATE);
        this._eventAfterUpdate.setUserData(this);
        this._eventProjectionChanged = new cc.EventCustom(cc.Director.EVENT_PROJECTION_CHANGED);
        this._eventProjectionChanged.setUserData(this);

        return true;
    },

    /**
     * 计算自从上次调用的时间增量
     */
    calculateDeltaTime: function () {
        var now = Date.now();

        // 新的时间增量
        if (this._nextDeltaTimeZero) {
            this._deltaTime = 0;
            this._nextDeltaTimeZero = false;
        } else {
            this._deltaTime = (now - this._lastUpdate) / 1000;
        }

        if ((cc.game.config[cc.game.CONFIG_KEY.debugMode] > 0) && (this._deltaTime > 0.2))
            this._deltaTime = 1 / 60.0;

        this._lastUpdate = now;
    },

    /**
     * 把视图坐标转换为WebGL坐标<br/>                                               
     * 转换触摸(多点)坐标为当前布局坐标(横屏或者竖屏)<br/>     
     * 实现类可以在CCDirectorWebGL找到
     * @function                           
     * @param {cc.Point} uiPoint            
     * @return {cc.Point}
     */
    convertToGL: null,

    /**
     * 将WebGL坐标转换为视图坐标<br/>                                               
     * 可以很方便的将节点坐标转换为窗口坐标以便调用glScissor<br/>                      
     * 实现类可以在CCDirectorWebGL找到
     * @function
     * @param {cc.Point} glPoint
     * @return {cc.Point}
     */
    convertToUI: null,

    /**
     * 绘制场景,每帧都会调用这个方法,不要手动调用。
     */
    drawScene: function () {
        var renderer = cc.renderer;
        // 计算全局时间增量
        this.calculateDeltaTime();

        //glClear之前的tick:问题#533
        if (!this._paused) {
            this._scheduler.update(this._deltaTime);
            cc.eventManager.dispatchEvent(this._eventAfterUpdate);
        }

        this._clear();

        /* 为防止闪烁,下个场景必须在这里设置,在tick之后,绘制之前
         XXX: 这是哪个bug？看来在0.9版本中不能解决了
         */ 
        if (this._nextScene) {
            this.setNextScene();
        }

        if (this._beforeVisitScene)
            this._beforeVisitScene();

        // 绘制场景
        if (this._runningScene) {
            if (renderer.childrenOrderDirty === true) {
                cc.renderer.clearRenderCommands();
                this._runningScene._curLevel = 0;                          //从0层开始
                this._runningScene.visit();
                renderer.resetFlag();
            } else if (renderer.transformDirty() === true)
                renderer.transform();

            cc.eventManager.dispatchEvent(this._eventAfterVisit);
        }

        //绘制通知节点
        if (this._notificationNode)
            this._notificationNode.visit();

        if (this._displayStats)
            this._showStats();

        if (this._afterVisitScene)
            this._afterVisitScene();

        renderer.rendering(cc._renderContext);
        cc.eventManager.dispatchEvent(this._eventAfterDraw);
        this._totalFrames++;

        if (this._displayStats)
            this._calculateMPF();
    },

    _beforeVisitScene: null,
    _afterVisitScene: null,

    /**
     * 下一帧停止导演类
     */
    end: function () {
        this._purgeDirectorInNextLoop = true;
    },

    /**
     * 返回表面的像素大小.它有可能和屏幕的大小不同.<br/>          
     * 高分辨率的设备平面像素大小可能比屏幕大小要大.                              
     * @return {Number}
     */
    getContentScaleFactor: function () {
        return this._contentScaleFactor;
    },

    /**
     * 在主场景被访问之后,这个对象才会被访问.<br/>                                    
     * 这个对象必须实现“访问者”的选择器.<br/>                                                
     * 可以很方便的获得提示对象                                                                                               
     * @return {cc.Node}
     */
    getNotificationNode: function () {
        return this._notificationNode;
    },

    /**
     * 返回WebGL视图的点大小.<br/>                                                   
     * 它会考虑窗口任何形式的旋转(设备横竖方向)                      
     * @return {cc.Size}
     */
    getWinSize: function () {
        return cc.size(this._winSizeInPoints);
    },

    /**
     * 返回WebGL视图的像素大小.<br/>                                                               
     * 它会考虑窗口任何形式的旋转(设备横竖方向).<br/>                 
     * 在Mac中winSize和winSizeInPixels返回相同值.                                            
     * @return {cc.Size}
     */
    getWinSizeInPixels: function () {
        return cc.size(this._winSizeInPoints.width * this._contentScaleFactor, this._winSizeInPoints.height * this._contentScaleFactor);
    },

    /**
     * getVisibleSize/getVisibleOrigin 被转移到了 CCDirectorWebGL/CCDirectorCanvas                              
     * getZEye 转移到了 CCDirectorWebGL
     */

    /**
     * 返回正在运行场景的可视区域大小
     * @function
     * @return {cc.Size}
     */
    getVisibleSize: null,

    /**
     * 返回正在运行场景的原始可视区域大小 
     * @function
     * @return {cc.Point}
     */
    getVisibleOrigin: null,

    /**
     * 返回视角z值,只在WebGL模式下有效
     * @function
     * @return {Number}
     */
    getZEye: null,

    /**
     * 暂停导演类的计算器(ticker)
     */
    pause: function () {
        if (this._paused)
            return;

        this._oldAnimationInterval = this._animationInterval;
        // 暂停的时候，不消耗CPU
        this.setAnimationInterval(1 / 4.0);
        this._paused = true;
    },

    /**
     * 从队列(ps:我感觉应该是从栈里弹出)里弹出一个场景.<br/>                                                                            
     * 弹出的场景将替换当前正在运行的场景.<br/>                                                                    
     * 当前运行的场景将被删除掉,如果当前栈里没有场景了,就结束游戏执行.<br/>    
     * 只有在当前有运行场景的时候才调用这个方法.                                                                        
     */
    popScene: function () {

        cc.assert(this._runningScene, cc._LogInfos.Director_popScene);

        this._scenesStack.pop();
        var c = this._scenesStack.length;

        if (c == 0)
            this.end();
        else {
            this._sendCleanupToScene = true;
            this._nextScene = this._scenesStack[c - 1];
        }
    },

    /**
     * 删除所有缓存的cocos2d缓存数据,将删除cc.textureCache,cc.spriteFrameCache,cc.animationCache 
     */
    purgeCachedData: function () {
        cc.animationCache._clear();
        cc.spriteFrameCache._clear();
        cc.textureCache._clear();
    },

    /**
     * 删除cc.director自己，包括删除所有定时器，所有事件监听器，退出并删除正在运行的场景，停止所有的动画，删除所有缓存数据
     */
    purgeDirector: function () {
        //删除定时器
        this.getScheduler().unscheduleAllCallbacks();

        //停止事件分发
        if (cc.eventManager)
            cc.eventManager.setEnabled(false);

        //不释放事件处理器
        //以便导演类再次运行的时候使用

        if (this._runningScene) {
            this._runningScene.onExitTransitionDidStart();
            this._runningScene.onExit();
            this._runningScene.cleanup();
        }

        this._runningScene = null;
        this._nextScene = null;

        //删除所有对象,但不释放他们
        //runScene有可能在end方法之后执行
        this._scenesStack.length = 0;

        this.stopAnimation();

        //删除所有缓存
        this.purgeCachedData();

        cc.checkGLErrorDebug();
    },

    /**
     * 暂停当前正在执行的场景,并把他加到一个装有暂停场景的栈里.<br/>    
     * 新的场景将被执行.<br/>											
     * 尽量控制存放场景的栈的大小以便减少内存分配.<br/>	
     * 只有在有场景运行的时候才调用这个方法.
     * @param {cc.Scene} scene
     */
    pushScene: function (scene) {

        cc.assert(scene, cc._LogInfos.Director_pushScene);

        this._sendCleanupToScene = false;

        this._scenesStack.push(scene);
        this._nextScene = scene;
    },

    /**
     * 运行一个场景.用一个新的场景来替换当前正在运行的场景或运行第一个场景
     * @param {cc.Scene} scene
     */
    runScene: function (scene) {

        cc.assert(scene, cc._LogInfos.Director_pushScene);

        if (!this._runningScene) {
            //运行场景
            this.pushScene(scene);
            this.startAnimation();
        } else {
            //替换场景
            var i = this._scenesStack.length;
            if (i === 0) {
                this._sendCleanupToScene = true;
                this._scenesStack[i] = scene;
                this._nextScene = scene;
            } else {
                this._sendCleanupToScene = true;
                this._scenesStack[i - 1] = scene;
                this._nextScene = scene;
            }
        }
    },

    /**
     * 从暂停中恢复导演类,如果当前场景没有被暂停,那么什么事都不做
     */
    resume: function () {
        if (!this._paused) {
            return;
        }

        this.setAnimationInterval(this._oldAnimationInterval);
        this._lastUpdate = Date.now();
        if (!this._lastUpdate) {
            cc.log(cc._LogInfos.Director_resume);
        }

        this._paused = false;
        this._deltaTime = 0;
    },

    /**
     * 表面的像素大小.它可能会跟屏幕大小不同<br/>
     * 高分辨率的设备的表面尺寸可能要比屏幕尺寸大.
     * @param {Number} scaleFactor   
     */
    setContentScaleFactor: function (scaleFactor) {
        if (scaleFactor != this._contentScaleFactor) {
            this._contentScaleFactor = scaleFactor;
            this._createStatsLabel();
        }
    },

    /**
     * 开启或关闭WebGL深度测试.<br/>
     * 它的实现类可以在CCDirectorCanvas.js/CCDirectorWebGL.js中找到
     * @function
     * @param {Boolean} on
     */
    setDepthTest: null,

    /**
     * 根据CCConfiguration的信息设置默认值
     */
    setDefaultValues: function () {

    },

    /**
     * 设置下个事件增量为0
     * @param {Boolean} nextDeltaTimeZero
     */
    setNextDeltaTimeZero: function (nextDeltaTimeZero) {
        this._nextDeltaTimeZero = nextDeltaTimeZero;
    },

    /**
     * 开始运行下个注册的场景
     */
    setNextScene: function () {
        var runningIsTransition = false, newIsTransition = false;
        if (cc.TransitionScene) {
            runningIsTransition = this._runningScene ? this._runningScene instanceof cc.TransitionScene : false;
            newIsTransition = this._nextScene ? this._nextScene instanceof cc.TransitionScene : false;
        }

        // 如果它不是一个过渡场景，就调用onExit或者cleanup方法
        if (!newIsTransition) {
            var locRunningScene = this._runningScene;
            if (locRunningScene) {
                locRunningScene.onExitTransitionDidStart();
                locRunningScene.onExit();
            }

            // 问题#709.根节点(场景)也必须接收到清理信息
            // 否则有可能造成泄漏
            if (this._sendCleanupToScene && locRunningScene)
                locRunningScene.cleanup();
        }

        this._runningScene = this._nextScene;
        cc.renderer.childrenOrderDirty = true;

        this._nextScene = null;
        if ((!runningIsTransition) && (this._runningScene != null)) {
            this._runningScene.onEnter();
            this._runningScene.onEnterTransitionDidFinish();
        }
    },

    /**
     * 设置通知节点
     * @param {cc.Node} node
     */
    setNotificationNode: function (node) {
        this._notificationNode = node;
    },

    /**
     * 返回cc.director的delegate
     * @return {cc.DirectorDelegate}
     */
    getDelegate: function () {
        return this._projectionDelegate;
    },

    /**
     * 设置cc.director的delegate.它必须实现CCDirectorDelegate协议
     * @return {cc.DirectorDelegate}
     */
    setDelegate: function (delegate) {
        this._projectionDelegate = delegate;
    },

    /**
     * 设置所有东西都被渲染到的视图,不要调用这个函数.<br/>
     * 它的实现可以在CCDirectorCanvas.js/CCDirectorWebGL.js中找到
     * @function
     * @param {cc.view} openGLView
     */
    setOpenGLView: null,

    /**
     * 设置OpenGL投影<br/>	
     * 	它的实现可以在CCDirectorCanvas.js/CCDirectorWebGL.js中找到
     * @function
     * @param {Number} projection
     */
    setProjection: null,

    /**
     * 更新视口<br/>
     * 它的实现可以在CCDirectorCanvas.js/CCDirectorWebGL.js中找到	
     * @function
     */
    setViewport: null,

    /**
     * 获得CCEGLView,所有东西都会渲染到它上面<br/>
     * 它的实现可以在CCDirectorCanvas.js/CCDirectorWebGL.js中找到
     * @function
     * @return {cc.view}
     */
    getOpenGLView: null,

    /**
     * 设置OpenGL投影<br/>							
     * 它的实现可以在CCDirectorCanvas.js/CCDirectorWebGL.js中找到
     * @function
     * @return {Number}
     */
    getProjection: null,

    /**
     * 开启或关闭OpenGL alpha混合.<br/> 							
     * 它的实现可以在CCDirectorCanvas.js/CCDirectorWebGL.js中找到
     * @function
     * @param {Boolean} on
     */
    setAlphaBlending: null,

    _showStats: function () {
        this._frames++;
        this._accumDt += this._deltaTime;
        if (this._FPSLabel && this._SPFLabel && this._drawsLabel) {
            if (this._accumDt > cc.DIRECTOR_FPS_INTERVAL) {
                this._SPFLabel.string = this._secondsPerFrame.toFixed(3);

                this._frameRate = this._frames / this._accumDt;
                this._frames = 0;
                this._accumDt = 0;

                this._FPSLabel.string = this._frameRate.toFixed(1);
                this._drawsLabel.string = (0 | cc.g_NumberOfDraws).toString();
            }
            this._FPSLabel.visit();
            this._SPFLabel.visit();
            this._drawsLabel.visit();
        } else
            this._createStatsLabel();
        cc.g_NumberOfDraws = 0;
    },

    /**
     * 返回替换场景是否能接收到清理消息.<br>
     * 如果新的场景被添加进来，老的场景将不能接收到清理消息.<br/
     * 如果新的场景替换了老的场景，那么新的场景将能接收到清理消息
     * @return {Boolean}
     */
    isSendCleanupToScene: function () {
        return this._sendCleanupToScene;
    },

    /**
     * 返回当前正在运行的场景.导演类同一时间只能运行一个场景.
     * @return {cc.Scene}
     */
    getRunningScene: function () {
        return this._runningScene;
    },

    /**
     * 返回FPS的值
     * @return {Number}
     */
    getAnimationInterval: function () {
        return this._animationInterval;
    },

    /**
     * 返回是否显示FPS信息
     * @return {Boolean}
     */
    isDisplayStats: function () {
        return this._displayStats;
    },

    /**
     * 设置是否在左下角显示FPS
     * @param {Boolean} displayStats
     */
    setDisplayStats: function (displayStats) {
        this._displayStats = displayStats;
    },

    /**
     * 返回每帧的间隔时间
     * @return {Number}
     */
    getSecondsPerFrame: function () {
        return this._secondsPerFrame;
    },

    /**
     * 返回下个时间增量是否为零
     * @return {Boolean}
     */
    isNextDeltaTimeZero: function () {
        return this._nextDeltaTimeZero;
    },

    /**
     * 返回导演类是否在暂停状态           
     * @return {Boolean}
     */
    isPaused: function () {
        return this._paused;
    },

    /**
     * 返回从导演类启动后所有的帧数
     * @return {Number}
     */
    getTotalFrames: function () {
        return this._totalFrames;
    },

    /**
     * 弹出所有场景直到只剩根场景在队列里.<br/> 
     * 这个场景会替换掉正在运行的场景.<br/>  
     * 本质是调用popToSceneStackLevel(1)
     */
    popToRootScene: function () {
        this.popToSceneStackLevel(1);
    },

    /**
     * 弹出队列里所有的场景直到得到想要的"层".                             <br/>   
     * 如果当前层是0，就停止导演类.                                        <br/>   
     * 如果当前层是1，它会弹出所有所有场景直到达到最后一个场景.            <br/>   
     * 如果当前层小于等于当前栈的层,不做任何事.                               
     * @param {Number} level
     */
    popToSceneStackLevel: function (level) {

        cc.assert(this._runningScene, cc._LogInfos.Director_popToSceneStackLevel_2);

        var locScenesStack = this._scenesStack;
        var c = locScenesStack.length;

        if (c == 0) {
            this.end();
            return;
        }
        //当前的层或者是空
        if (level > c)
            return;

        //弹出栈直到达到想要的层
        while (c > level) {
            var current = locScenesStack.pop();
            if (current.running) {
                current.onExitTransitionDidStart();
                current.onExit();
            }
            current.cleanup();
            c--;
        }
        this._nextScene = locScenesStack[locScenesStack.length - 1];
        this._sendCleanupToScene = false;
    },

    /**
     * 返回导演类里的cc.Scheduler
     * @return {cc.Scheduler}
     */
    getScheduler: function () {
        return this._scheduler;
    },

    /**
     * 将cc.Scheduler设置到导演类上          
     * @param {cc.Scheduler} scheduler
     */
    setScheduler: function (scheduler) {
        if (this._scheduler != scheduler) {
            this._scheduler = scheduler;
        }
    },

    /**
     * 返回导演类里的cc.ActionManager
     * @return {cc.ActionManager}
     */
    getActionManager: function () {
        return this._actionManager;
    },
    /**
     * 将cc.ActionManager设置到导演类上
     * @param {cc.ActionManager} actionManager
     */
    setActionManager: function (actionManager) {
        if (this._actionManager != actionManager) {
            this._actionManager = actionManager;
        }
    },

    /**
     * 返回上一帧后的时间增量
     * @return {Number}
     */
    getDeltaTime: function () {
        return this._deltaTime;
    },

    _createStatsLabel: null,

    _calculateMPF: function () {
        var now = Date.now();
        this._secondsPerFrame = (now - this._lastUpdate) / 1000;
    }
});

/**
 * cc.Director投影变化后的事件
 * @constant            常量
 * @type {string}
 * @example                                                                                
 * 例如：
 *   cc.eventManager.addCustomListener(cc.Director.EVENT_PROJECTION_CHANGED, function(event) {
 *           cc.log("Projection changed.");
 *       });
 */
cc.Director.EVENT_PROJECTION_CHANGED = "director_projection_changed";

/**
 * 绘制cc.Director后的事件
 * @constant            常量
 * @type {string}
 * @example                                                                                
 * 例如：
 *   cc.eventManager.addCustomListener(cc.Director.EVENT_AFTER_DRAW, function(event) {
 *           cc.log("after draw event.");
 *       });
 */
cc.Director.EVENT_AFTER_DRAW = "director_after_draw";

/**
 * cc.Director访问后的事件
 * @constant                            常量
 * @type {string}
 * @example                                                                                 
 * 例如：
 *   cc.eventManager.addCustomListener(cc.Director.EVENT_AFTER_VISIT, function(event) {
 *           cc.log("after visit event.");
 *       });
 */
cc.Director.EVENT_AFTER_VISIT = "director_after_visit";

/**
 * cc.Director更新后的事件
 * @constant                            常量
 * @type {string}
 * @example                                                                                 
 * 例如：
 *   cc.eventManager.addCustomListener(cc.Director.EVENT_AFTER_UPDATE, function(event) {
 *           cc.log("after update event.");
 *       });
 */
cc.Director.EVENT_AFTER_UPDATE = "director_after_update";

/***************************************************
 * DisplayLinkDirector的实现类
 **************************************************/
cc.DisplayLinkDirector = cc.Director.extend(/** @lends cc.Director# */{
    invalid: false,

    /**
     * 开始播放动画
     */
    startAnimation: function () {
        this._nextDeltaTimeZero = true;
        this.invalid = false;
    },

    /**
     * 运行导演类的主循环
     */
    mainLoop: function () {
        if (this._purgeDirectorInNextLoop) {
            this._purgeDirectorInNextLoop = false;
            this.purgeDirector();
        }
        else if (!this.invalid) {
            this.drawScene();
        }
    },

    /**
     * 停止动画(animation)
     */
    stopAnimation: function () {
        this.invalid = true;
    },

    /**
     * 设置动画时间间隔
     * @param {Number} 想要设置的时间间隔的值
     */
    setAnimationInterval: function (value) {
        this._animationInterval = value;
        if (!this.invalid) {
            this.stopAnimation();
            this.startAnimation();
        }
    }
});

cc.Director.sharedDirector = null;
cc.Director.firstUseDirector = true;

cc.Director._getInstance = function () {
    if (cc.Director.firstUseDirector) {
        cc.Director.firstUseDirector = false;
        cc.Director.sharedDirector = new cc.DisplayLinkDirector();
        cc.Director.sharedDirector.init();
    }
    return cc.Director.sharedDirector;
};

/**
 * fps默认值为60
 * @type {Number}
 */
cc.defaultFPS = 60;

//director可能使用的投影
/**
 * 2D投影常量(正交投影)
 * @constant
 * @type {Number}
 */
cc.Director.PROJECTION_2D = 0;

/**
 * 3D投影常量，fovy=60，znear=0.5f,zfar=1500
 * @constant
 * @type {Number}
 */
cc.Director.PROJECTION_3D = 1;

/**
 * 自定义投影常量,如果想设置cc.Director的投影,可调用投影代理的updateProjection方法
 * @constant
 * @type {Number}
 */
cc.Director.PROJECTION_CUSTOM = 3;

/**
 * cc.Director的默认投影常量,默认为3D投影
 * @constant
 * @type {Number}
 */
cc.Director.PROJECTION_DEFAULT = cc.Director.PROJECTION_3D;

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {

    var _p = cc.Director.prototype;

    _p.setProjection = function (projection) {
        this._projection = projection;
        cc.eventManager.dispatchEvent(this._eventProjectionChanged);
    };

    _p.setDepthTest = function () {
    };

    _p.setOpenGLView = function (openGLView) {
        //设置尺寸
        this._winSizeInPoints.width = cc._canvas.width;      //this._openGLView.getDesignResolutionSize();获得设计的分辨率大小
        this._winSizeInPoints.height = cc._canvas.height;
        this._openGLView = openGLView || cc.view;
        if (cc.eventManager)
            cc.eventManager.setEnabled(true);
    };

    _p._clear = function () {
        var viewport = this._openGLView.getViewPortRect();
        cc._renderContext.clearRect(-viewport.x, viewport.y, viewport.width, -viewport.height);
    };


    _p._createStatsLabel = function () {
        var _t = this;
        var fontSize = 0;
        if (_t._winSizeInPoints.width > _t._winSizeInPoints.height)
            fontSize = 0 | (_t._winSizeInPoints.height / 320 * 24);
        else
            fontSize = 0 | (_t._winSizeInPoints.width / 320 * 24);

        _t._FPSLabel = new cc.LabelTTF("000.0", "Arial", fontSize);
        _t._SPFLabel = new cc.LabelTTF("0.000", "Arial", fontSize);
        _t._drawsLabel = new cc.LabelTTF("0000", "Arial", fontSize);

        var locStatsPosition = cc.DIRECTOR_STATS_POSITION;
        _t._drawsLabel.setPosition(_t._drawsLabel.width / 2 + locStatsPosition.x, _t._drawsLabel.height * 5 / 2 + locStatsPosition.y);
        _t._SPFLabel.setPosition(_t._SPFLabel.width / 2 + locStatsPosition.x, _t._SPFLabel.height * 3 / 2 + locStatsPosition.y);
        _t._FPSLabel.setPosition(_t._FPSLabel.width / 2 + locStatsPosition.x, _t._FPSLabel.height / 2 + locStatsPosition.y);
    };

    _p.getVisibleSize = function () {
        //if (this._openGLView) {                                        
        //如果_openGLView不为空就返回它的可视区域大小
        //return this._openGLView.getVisibleSize();
        //} else {
        return this.getWinSize();
        //}
    };

    _p.getVisibleOrigin = function () {
        //if (this._openGLView) {                                       
        //如果_openGLView不为空就返回他的原始可视区域大小
        //return this._openGLView.getVisibleOrigin();
        //} else {
        return cc.p(0, 0);
        //}
    };
} else {
    cc.Director._fpsImage = new Image();
    cc._addEventListener(cc.Director._fpsImage, "load", function () {
        cc.Director._fpsImageLoaded = true;
    });
    if (cc._fpsImage) {
        cc.Director._fpsImage.src = cc._fpsImage;
    }
    cc.assert(cc.isFunction(cc._tmp.DirectorWebGL), cc._LogInfos.MissingFile, "CCDirectorWebGL.js");
    cc._tmp.DirectorWebGL();
    delete cc._tmp.DirectorWebGL;
}

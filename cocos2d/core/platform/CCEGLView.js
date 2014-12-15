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
 * @ignore
 */
cc.Touches = [];
cc.TouchesIntergerDict = {};

cc.DENSITYDPI_DEVICE = "device-dpi";
cc.DENSITYDPI_HIGH = "high-dpi";
cc.DENSITYDPI_MEDIUM = "medium-dpi";
cc.DENSITYDPI_LOW = "low-dpi";

cc.__BrowserGetter = {
    init: function(){
        this.html = document.getElementsByTagName("html")[0];
    },
    availWidth: function(frame){
        if(!frame || frame === this.html)
            return window.innerWidth;
        else
            return frame.clientWidth;
    },
    availHeight: function(frame){
        if(!frame || frame === this.html)
            return window.innerHeight;
        else
            return frame.clientHeight;
    },
    meta: {
        "width": "device-width",
        "user-scalable": "no"
    }
};

switch(cc.sys.browserType){
    case cc.sys.BROWSER_TYPE_SAFARI:
        cc.__BrowserGetter.meta["minimal-ui"] = "true";
        break;
    case cc.sys.BROWSER_TYPE_CHROME:
        cc.__BrowserGetter.__defineGetter__("target-densitydpi", function(){
            return cc.view._targetDensityDPI;
        });
    case cc.sys.BROWSER_TYPE_UC:
        cc.__BrowserGetter.availWidth = function(frame){
            return frame.clientWidth;
        };
        cc.__BrowserGetter.availHeight = function(frame){
            return frame.clientHeight;
        };
        break;
    case cc.sys.BROWSER_TYPE_MIUI:
        cc.__BrowserGetter.init = function(view){
            if(view.__resizeWithBrowserSize) return;
            var resize = function(){
                view.setDesignResolutionSize(
                    view._designResolutionSize.width,
                    view._designResolutionSize.height,
                    view._resolutionPolicy
                );
                window.removeEventListener("resize", resize, false);
            };
            window.addEventListener("resize", resize, false);
        };
        break;
}

/**
 * cc.view is the singleton object which represents the game window.<br/>
 * 游戏窗口cc.view是单例模式的对象
 * It's main task include: <br/>
 *  - Apply the design resolution policy<br/>
 *  - Provide interaction with the window, like resize event on web, retina display support, etc...<br/>
 *  - Manage the game view port which can be different with the window<br/>
 *  - Manage the content scale and translation<br/>
 * <br/>
 * 它的主要任务包括：
 *  - 应用设计的解决策略
 *  - 提供互动窗口，就像web中的resize事件，Retina显示屏的支持等等
 *  - 管理与window不同游戏视图端口
 *  - 管理内容的缩放和平移
 * Since the cc.view is a singleton, you don't need to call any constructor or create functions,<br/>
 * the standard way to use it is by calling:<br/>
 *  - cc.view.methodName(); <br/>
 *  由于cc.view是单例，你不需要调用任何构造函数或创建功能，只要调用标准模式：
 *  - cc.view.methodName();
 * @class
 * @name cc.view
 * @extend cc.Class
 */
cc.EGLView = cc.Class.extend(/** @lends cc.view# */{
    _delegate: null,
    // Size of parent node that contains cc.container and cc._canvas
    // 父节点的大小，它包含cc.container和cc._canvas
    _frameSize: null,
    // resolution size, it is the size appropriate for the app resources.
    // 分辨率大小，它是尺寸适合于该应用的资源
    _designResolutionSize: null,
    _originalDesignResolutionSize: null,
    // Viewport is the container's rect related to content's coordinates in pixel
    // 视口是容器的矩形与在像素内容坐标
    _viewPortRect: null,
    // The visible rect in content's coordinate in point
    // 在点内容的可见矩形的坐标
    _visibleRect: null,
	_retinaEnabled: false,
    _autoFullScreen: true,
    // The device's pixel ratio (for retina displays)
    // 设备的像素比（视网膜显示器）
    _devicePixelRatio: 1,
    // the view name
    _viewName: "",
    // Custom callback for resize event
    // 自定义回调resize事件
    _resizeCallback: null,
    _scaleX: 1,
    _originalScaleX: 1,
    _scaleY: 1,
    _originalScaleY: 1,
    _indexBitsUsed: 0,
    _maxTouches: 5,
    _resolutionPolicy: null,
    _rpExactFit: null,
    _rpShowAll: null,
    _rpNoBorder: null,
    _rpFixedHeight: null,
    _rpFixedWidth: null,
    _initialized: false,

    _captured: false,
    _wnd: null,
    _hDC: null,
    _hRC: null,
    _supportTouch: false,
    _contentTranslateLeftTop: null,

    // Parent node that contains cc.container and cc._canvas
    // 包含cc.container和cc._canvas的父节点
    _frame: null,
    _frameZoomFactor: 1.0,
    __resizeWithBrowserSize: false,
    _isAdjustViewPort: true,
    _targetDensityDPI: null,

    /**
     * Constructor of cc.EGLView
     * cc.EGLView的构造
     */
    ctor: function () {
        var _t = this, d = document, _strategyer = cc.ContainerStrategy, _strategy = cc.ContentStrategy;

        cc.__BrowserGetter.init(this);

        _t._frame = (cc.container.parentNode === d.body) ? d.documentElement : cc.container.parentNode;
        _t._frameSize = cc.size(0, 0);
        _t._initFrameSize();

        var w = cc._canvas.width, h = cc._canvas.height;
        _t._designResolutionSize = cc.size(w, h);
        _t._originalDesignResolutionSize = cc.size(w, h);
        _t._viewPortRect = cc.rect(0, 0, w, h);
        _t._visibleRect = cc.rect(0, 0, w, h);
        _t._contentTranslateLeftTop = {left: 0, top: 0};
        _t._viewName = "Cocos2dHTML5";

	    var sys = cc.sys;
        _t.enableRetina(sys.os == sys.OS_IOS || sys.os == sys.OS_OSX);
        cc.visibleRect && cc.visibleRect.init(_t._visibleRect);

        // Setup system default resolution policies
        // 设置系统默认分辨率政策
        _t._rpExactFit = new cc.ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.EXACT_FIT);
        _t._rpShowAll = new cc.ResolutionPolicy(_strategyer.PROPORTION_TO_FRAME, _strategy.SHOW_ALL);
        _t._rpNoBorder = new cc.ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.NO_BORDER);
        _t._rpFixedHeight = new cc.ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.FIXED_HEIGHT);
        _t._rpFixedWidth = new cc.ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.FIXED_WIDTH);

        _t._hDC = cc._canvas;
        _t._hRC = cc._renderContext;
        _t._targetDensityDPI = cc.DENSITYDPI_HIGH;
    },

    // Resize helper functions
    // 调整辅助功能
    _resizeEvent: function () {
        var width = this._originalDesignResolutionSize.width;
        var height = this._originalDesignResolutionSize.height;
        if (this._resizeCallback) {
            this._initFrameSize();
            this._resizeCallback.call();
        }
        if (width > 0)
            this.setDesignResolutionSize(width, height, this._resolutionPolicy);
    },

    /**
     * <p>
     * Sets view's target-densitydpi for android mobile browser. it can be set to:           <br/>
     *   1. cc.DENSITYDPI_DEVICE, value is "device-dpi"                                      <br/>
     *   2. cc.DENSITYDPI_HIGH, value is "high-dpi"  (default value)                         <br/>
     *   3. cc.DENSITYDPI_MEDIUM, value is "medium-dpi" (browser's default value)            <br/>
     *   4. cc.DENSITYDPI_LOW, value is "low-dpi"                                            <br/>
     *   5. Custom value, e.g: "480"                                                         <br/>
     * 设置Android手机浏览器视图的target-densitydpi的。它可以被设置为：
     *   1. cc.DENSITYDPI_DEVICE，值为“device-dpi”
     *   2. cc.DENSITYDPI_HIGH，值为“high-dpi”（默认值）
     *   3. cc.DENSITYDPI_MEDIUM，值为“medium-dpi”（浏览器的默认值）
     *   4. cc.DENSITYDPI_LOW，值为“low-dpi”
     *   5. 自定义值，例如：“480” 
     * @param {String} densityDPI
     */
    setTargetDensityDPI: function(densityDPI){
        this._targetDensityDPI = densityDPI;
        this._setViewPortMeta();
    },

    /**
     * Returns the current target-densitydpi value of cc.view.
     * 返回cc.view当前target-densitydpi值
     * @returns {String}
     */
    getTargetDensityDPI: function(){
        return this._targetDensityDPI;
    },

    /**
     * Sets whether resize canvas automatically when browser's size changed.<br/>
     * 设置canvas大小是否随浏览器的大小改变而自动调整
     * Useful only on web.
     * 只在web中有用
     * @param {Boolean} enabled Whether enable automatic resize with browser's resize event 是否启用随浏览器的resize事件自动调整大小
     */
    resizeWithBrowserSize: function (enabled) {
        var adjustSize, _t = this;
        if (enabled) {
            //enable
            //启用
            if (!_t.__resizeWithBrowserSize) {
                _t.__resizeWithBrowserSize = true;
                adjustSize = _t._resizeEvent.bind(_t);
                cc._addEventListener(window, 'resize', adjustSize, false);
            }
        } else {
            //disable
            //停用
            if (_t.__resizeWithBrowserSize) {
                _t.__resizeWithBrowserSize = true;
                adjustSize = _t._resizeEvent.bind(_t);
                window.removeEventListener('resize', adjustSize, false);
            }
        }
    },

    /**
     * Sets the callback function for cc.view's resize action,<br/>
     * this callback will be invoked before applying resolution policy, <br/>
     * so you can do any additional modifications within the callback.<br/>
     * Useful only on web.
     * 设置回调函数cc.view的大小调整动作，这个回调函数将被调用在收到申请分辨率改变之前,所以你可以做回调中的任何其他修改。
     * 自在web上有用
     * @param {Function|null} callback The callback function 调用回调函数
     */
    setResizeCallback: function (callback) {
        if (cc.isFunction(callback) || callback == null) {
            this._resizeCallback = callback;
        }
    },

    _initFrameSize: function () {
        var locFrameSize = this._frameSize;
        locFrameSize.width = cc.__BrowserGetter.availWidth(this._frame);
        locFrameSize.height = cc.__BrowserGetter.availHeight(this._frame);
    },

    // hack
    _adjustSizeKeepCanvasSize: function () {
        var designWidth = this._originalDesignResolutionSize.width;
        var designHeight = this._originalDesignResolutionSize.height;
        if (designWidth > 0)
            this.setDesignResolutionSize(designWidth, designHeight, this._resolutionPolicy);
    },

    _setViewPortMeta: function () {
        if (this._isAdjustViewPort) {
            var vp = document.getElementById("cocosMetaElement");
            if(vp){
                document.head.removeChild(vp);
            }

            var viewportMetas,
                elems = document.getElementsByName("viewport"),
                currentVP = elems ? elems[0] : null,
                content;

            vp = cc.newElement("meta");
            vp.id = "cocosMetaElement";
            vp.name = "viewport";
            vp.content = "";

            viewportMetas = cc.__BrowserGetter.meta;

            content = currentVP ? currentVP.content : "";
            for (var key in viewportMetas) {
                var pattern = new RegExp(key);
                if (!pattern.test(content)) {
                    content += "," + key + "=" + viewportMetas[key];
                }
            }
            if(/^,/.test(content))
                content = content.substr(1);

            vp.content = content;
            // For adopting certain android devices which don't support second viewport
            // 对于采用某些Android设备不支持第二视图
            if (currentVP)
                currentVP.content = content;

            document.head.appendChild(vp);
        }
    },

    // RenderTexture hacker
    // 纹理渲染
    _setScaleXYForRenderTexture: function () {
        //hack for RenderTexture on canvas mode when adapting multiple resolution resources
        //hack渲染纹理画布模式以适应多种分辨率的资源
        var scaleFactor = cc.contentScaleFactor();
        this._scaleX = scaleFactor;
        this._scaleY = scaleFactor;
    },

    // Other helper functions
    // 其它辅助功能
    _resetScale: function () {
        this._scaleX = this._originalScaleX;
        this._scaleY = this._originalScaleY;
    },

    // Useless, just make sure the compatibility temporarily, should be removed
    // 除非,只要确保兼容性是暂时的，就应该被删除
    _adjustSizeToBrowser: function () {
    },

    initialize: function () {
        this._initialized = true;
    },

    /**
     * Sets whether the engine modify the "viewport" meta in your web page.<br/>
     * 设置该引擎是否改变"viewport"元素在你的网页中
     * It's enabled by default, we strongly suggest you not to disable it.<br/>
     * 它在默认情况下启用，我们强烈建议您不要禁用它
     * And even when it's enabled, you can still set your own "viewport" meta, it won't be overridden<br/>
     * 甚至当它的启用时，您还可以设置自己的"viewport"元素，它不会被覆盖
     * Only useful on web
     * 只在web中有效
     * @param {Boolean} enabled Enable automatic modification to "viewport" meta 是否启用自动改变"viewport"元素
     */
    adjustViewPort: function (enabled) {
        this._isAdjustViewPort = enabled;
    },

	/**
	 * Retina support is enabled by default for Apple device but disabled for other devices,<br/>
     * 视网膜支持，默认情况下，为苹果设备启用，但其他设备停用
	 * it takes effect only when you called setDesignResolutionPolicy<br/>
     * 只会在调用setDesignResolutionPolicy时生效
     * Only useful on web
     * 只在web中有效
	 * @param {Boolean} enabled  Enable or disable retina display 启用或禁用支持Retina显示屏
	 */
	enableRetina: function(enabled) {
		this._retinaEnabled = enabled ? true : false;
	},

	/**
	 * Check whether retina display is enabled.<br/>
     * 检查视网膜显示屏是否启用
     * Only useful on web
     * 只在web中有效
	 * @return {Boolean}
	 */
	isRetinaEnabled: function() {
		return this._retinaEnabled;
	},

    /**
     * If enabled, the application will try automatically to enter full screen mode on mobile devices<br/>
     * 如果启用，该应用程序会自动尝试进入全屏模式在移动设备上
     * You can pass true as parameter to enable it and disable it by passing false.<br/>
     * 您可以通过true来启用它，并通过传递false禁用
     * Only useful on web
     * 只在web中有效
     * @param {Boolean} enabled  Enable or disable auto full screen on mobile devices 启用或禁用移动设备上自动全屏
     */
    enableAutoFullScreen: function(enabled) {
        this._autoFullScreen = enabled ? true : false;
    },

    /**
     * Check whether auto full screen is enabled.<br/>
     * 检查自动全屏是否启用
     * Only useful on web
     * 只在web中有效
     * @return {Boolean} Auto full screen enabled or not 自动全屏启用与否
     */
    isAutoFullScreenEnabled: function() {
        return this._autoFullScreen;
    },

    /**
     * Force destroying EGL view, subclass must implement this method.
     * 强制摧毁EGL视图，子类必须实现该方法
     */
    end: function () {
    },

    /**
     * Get whether render system is ready(no matter opengl or canvas),<br/>
     * 获取渲染系统是否已准备就绪(无论opengl或者canvas),
     * this name is for the compatibility with cocos2d-x, subclass must implement this method.
     * 这个名字是用了cocos2d-x中的兼容性，子类必须实现此方法
     * @return {Boolean}
     */
    isOpenGLReady: function () {
        return (this._hDC != null && this._hRC != null);
    },

    /*
     * Set zoom factor for frame. This method is for debugging big resolution (e.g.new ipad) app on desktop.
     * 设置变焦倍数。这种方法是用于调试的大分辨率应用程序（像new iPad）
     * @param {Number} zoomFactor 变焦倍数
     */
    setFrameZoomFactor: function (zoomFactor) {
        this._frameZoomFactor = zoomFactor;
        this.centerWindow();
        cc.director.setProjection(cc.director.getProjection());
    },

    /**
     * Exchanges the front and back buffers, subclass must implement this method.
     * 交换正面和背面缓冲，子类必须实现此方法
     */
    swapBuffers: function () {
    },

    /**
     * Open or close IME keyboard , subclass must implement this method.
     * 开启或关闭IME键盘，子类必须实现该方法
     * @param {Boolean} isOpen
     */
    setIMEKeyboardState: function (isOpen) {
    },

    /**
     * Sets the resolution translate on EGLView
     * 在EGLView上设置分辨率转换
     * @param {Number} offsetLeft
     * @param {Number} offsetTop
     */
    setContentTranslateLeftTop: function (offsetLeft, offsetTop) {
        this._contentTranslateLeftTop = {left: offsetLeft, top: offsetTop};
    },

    /**
     * Returns the resolution translate on EGLView
     * 返回EGLView的分辨率转换
     * @return {cc.Size|Object}
     */
    getContentTranslateLeftTop: function () {
        return this._contentTranslateLeftTop;
    },

    /**
     * Returns the frame size of the view.<br/>
     * 返回view的frame
     * On native platforms, it returns the screen size since the view is a fullscreen view.<br/>
     * 在原生的平台，它返回屏幕尺寸，因为视图是一个全屏视图
     * On web, it returns the size of the canvas's outer DOM element.
     * 在web上,它返回canvas的外层DOM元素的大小
     * @return {cc.Size}
     */
    getFrameSize: function () {
        return cc.size(this._frameSize.width, this._frameSize.height);
    },

    /**
     * On native, it sets the frame size of view.<br/>
     * 在原生应用中,该方法设置view的前期
     * On web, it sets the size of the canvas's outer DOM element.
     * 在web上,该方法设置canvas的外层DOM元素的大小
     * @param {Number} width
     * @param {Number} height
     */
    setFrameSize: function (width, height) {
        this._frameSize.width = width;
        this._frameSize.height = height;
        this._frame.style.width = width + "px";
        this._frame.style.height = height + "px";
        //this.centerWindow();
        this._resizeEvent();
        cc.director.setProjection(cc.director.getProjection());
    },

    /**
     * Empty function
     * 空方法
     */
    centerWindow: function () {
    },

    /**
     * Returns the visible area size of the view port.
     * 返回view的可见区域大小
     * @return {cc.Size}
     */
    getVisibleSize: function () {
        return cc.size(this._visibleRect.width,this._visibleRect.height);
    },

    /**
     * Returns the visible origin of the view port.
     * 返回view的可见区域原点
     * @return {cc.Point}
     */
    getVisibleOrigin: function () {
        return cc.p(this._visibleRect.x,this._visibleRect.y);
    },

    /**
     * Returns whether developer can set content's scale factor.
     * 返回开发者是否可以设置内容变焦大小
     * @return {Boolean}
     */
    canSetContentScaleFactor: function () {
        return true;
    },

    /**
     * Returns the current resolution policy
     * 返回当前的解决策略
     * @see cc.ResolutionPolicy
     * @return {cc.ResolutionPolicy}
     */
    getResolutionPolicy: function () {
        return this._resolutionPolicy;
    },

    /**
     * Sets the current resolution policy
     * 设置当前解决策略
     * @see cc.ResolutionPolicy
     * @param {cc.ResolutionPolicy|Number} resolutionPolicy
     */
    setResolutionPolicy: function (resolutionPolicy) {
        var _t = this;
        if (resolutionPolicy instanceof cc.ResolutionPolicy) {
            _t._resolutionPolicy = resolutionPolicy;
        }
        // Ensure compatibility with JSB
        // 确保与JSB兼容性
        else {
            var _locPolicy = cc.ResolutionPolicy;
            if(resolutionPolicy === _locPolicy.EXACT_FIT)
                _t._resolutionPolicy = _t._rpExactFit;
            if(resolutionPolicy === _locPolicy.SHOW_ALL)
                _t._resolutionPolicy = _t._rpShowAll;
            if(resolutionPolicy === _locPolicy.NO_BORDER)
                _t._resolutionPolicy = _t._rpNoBorder;
            if(resolutionPolicy === _locPolicy.FIXED_HEIGHT)
                _t._resolutionPolicy = _t._rpFixedHeight;
            if(resolutionPolicy === _locPolicy.FIXED_WIDTH)
                _t._resolutionPolicy = _t._rpFixedWidth;
        }
    },

    /**
     * Sets the resolution policy with designed view size in points.<br/>
     * 该方法设置在点设计视图尺寸分辨率解决政策
     * The resolution policy include: <br/>
     * [1] ResolutionExactFit       Fill screen by stretch-to-fit: if the design resolution ratio of width to height is different from the screen resolution ratio, your game view will be stretched.<br/>
     * [2] ResolutionNoBorder       Full screen without black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two areas of your game view will be cut.<br/>
     * [3] ResolutionShowAll        Full screen with black border: if the design resolution ratio of width to height is different from the screen resolution ratio, two black borders will be shown.<br/>
     * [4] ResolutionFixedHeight    Scale the content's height to screen's height and proportionally scale its width<br/>
     * [5] ResolutionFixedWidth     Scale the content's width to screen's width and proportionally scale its height<br/>
     * [cc.ResolutionPolicy]        [Web only feature] Custom resolution policy, constructed by cc.ResolutionPolicy<br/>
     * 该决议的政策包括：
     * [1] ResolutionExactFit 填充屏幕被拉伸以适合：如果宽度与高度的设计，分辨率是屏幕分辨率的不同，您的游戏视图将被拉长
     * [2] ResolutionNoBorder 无黑边全屏：如果宽度与高度分辨率与屏幕分辨率的不同，在两个区域中的视图将被切除
     * [3] ResolutionShowAll 全屏幕的黑色边框：如果宽度与高度分辨率与屏幕分辨率不同，两个黑色的边框将显示
     * [4] ResolutionFixedHeight 缩放内容的高度，以屏幕的高度和按比例缩放宽度
     * [5] ResolutionFixedWidth 缩放内容的宽度设置为屏幕的宽度和按比例缩放高度
     * [cc.ResolutionPolicy] [仅限于Web功能]自定义分辨率政策，构建cc.ResolutionPolicy
     *  @param {Number} width Design resolution width. 设计分辨率宽度
     * @param {Number} height Design resolution height. 设计分辨率高度
     * @param {cc.ResolutionPolicy|Number} resolutionPolicy The resolution policy desired 该决议所需
     */
    setDesignResolutionSize: function (width, height, resolutionPolicy) {
        // Defensive code
        if( !(width > 0 || height > 0) ){
            cc.log(cc._LogInfos.EGLView_setDesignResolutionSize);
            return;
        }

        this.setResolutionPolicy(resolutionPolicy);
        var policy = this._resolutionPolicy;
        if (!policy){
            cc.log(cc._LogInfos.EGLView_setDesignResolutionSize_2);
            return;
        }
        policy.preApply(this);

        // Reinit frame size
        // 重初始化size
        if(cc.sys.isMobile)
            this._setViewPortMeta();

        this._initFrameSize();

        this._originalDesignResolutionSize.width = this._designResolutionSize.width = width;
        this._originalDesignResolutionSize.height = this._designResolutionSize.height = height;

        var result = policy.apply(this, this._designResolutionSize);

        if(result.scale && result.scale.length == 2){
            this._scaleX = result.scale[0];
            this._scaleY = result.scale[1];
        }

        if(result.viewport){
            var vp = this._viewPortRect,
                vb = this._visibleRect,
                rv = result.viewport;

            vp.x = rv.x;
            vp.y = rv.y;
            vp.width = rv.width;
            vp.height = rv.height;

            vb.x = -vp.x / this._scaleX;
            vb.y = -vp.y / this._scaleY;
            vb.width = cc._canvas.width / this._scaleX;
            vb.height = cc._canvas.height / this._scaleY;
        }

        // reset director's member variables to fit visible rect
        // 重置导演成员变量以适应可见矩形
        var director = cc.director;
        director._winSizeInPoints.width = this._designResolutionSize.width;
        director._winSizeInPoints.height = this._designResolutionSize.height;
        policy.postApply(this);
        cc.winSize.width = director._winSizeInPoints.width;
        cc.winSize.height = director._winSizeInPoints.height;

        if (cc._renderType == cc._RENDER_TYPE_WEBGL) {
            // reset director's member variables to fit visible rect
            // 重置导演成员变量以适应可见矩形
            director._createStatsLabel();
            director.setGLDefaultValues();
        }

        this._originalScaleX = this._scaleX;
        this._originalScaleY = this._scaleY;
        // For editbox
        // 适用编辑窗口
        if (cc.DOM)
            cc.DOM._resetEGLViewDiv();
        cc.visibleRect && cc.visibleRect.init(this._visibleRect);
    },

    /**
     * Returns the designed size for the view.
     * 返回视图的设计尺寸
     * Default resolution size is the same as 'getFrameSize'.
     * 默认分辨率的大小如“getFrameSize”一样
     * @return {cc.Size}
     */
    getDesignResolutionSize: function () {
        return cc.size(this._designResolutionSize.width, this._designResolutionSize.height);
    },

    /**
     * Sets view port rectangle with points.
     * 设置矩形视图点
     * @param {Number} x
     * @param {Number} y
     * @param {Number} w width
     * @param {Number} h height
     */
    setViewPortInPoints: function (x, y, w, h) {
        var locFrameZoomFactor = this._frameZoomFactor, locScaleX = this._scaleX, locScaleY = this._scaleY;
        cc._renderContext.viewport((x * locScaleX * locFrameZoomFactor + this._viewPortRect.x * locFrameZoomFactor),
            (y * locScaleY * locFrameZoomFactor + this._viewPortRect.y * locFrameZoomFactor),
            (w * locScaleX * locFrameZoomFactor),
            (h * locScaleY * locFrameZoomFactor));
    },

    /**
     * Sets Scissor rectangle with points.
     * 集剪式矩形点
     * @param {Number} x
     * @param {Number} y
     * @param {Number} w
     * @param {Number} h
     */
    setScissorInPoints: function (x, y, w, h) {
        var locFrameZoomFactor = this._frameZoomFactor, locScaleX = this._scaleX, locScaleY = this._scaleY;
        cc._renderContext.scissor((x * locScaleX * locFrameZoomFactor + this._viewPortRect.x * locFrameZoomFactor),
            (y * locScaleY * locFrameZoomFactor + this._viewPortRect.y * locFrameZoomFactor),
            (w * locScaleX * locFrameZoomFactor),
            (h * locScaleY * locFrameZoomFactor));
    },

    /**
     * Returns whether GL_SCISSOR_TEST is enable
     * 返回GL_SCISSOR_TEST是否启用
     * @return {Boolean}
     */
    isScissorEnabled: function () {
        var gl = cc._renderContext;
        return gl.isEnabled(gl.SCISSOR_TEST);
    },

    /**
     * Returns the current scissor rectangle
     * 返回当前剪刀矩形
     * @return {cc.Rect}
     */
    getScissorRect: function () {
        var gl = cc._renderContext, scaleX = this._scaleX, scaleY = this._scaleY;
        var boxArr = gl.getParameter(gl.SCISSOR_BOX);
        return cc.rect((boxArr[0] - this._viewPortRect.x) / scaleX, (boxArr[1] - this._viewPortRect.y) / scaleY,
            boxArr[2] / scaleX, boxArr[3] / scaleY);
    },

    /**
     * Sets the name of the view
     * 设置view的名字
     * @param {String} viewName
     */
    setViewName: function (viewName) {
        if (viewName != null && viewName.length > 0) {
            this._viewName = viewName;
        }
    },

    /**
     * Returns the name of the view
     * 返回view的名字
     * @return {String}
     */
    getViewName: function () {
        return this._viewName;
    },

    /**
     * Returns the view port rectangle.
     * 返回视口矩形
     * @return {cc.Rect}
     */
    getViewPortRect: function () {
        return this._viewPortRect;
    },

    /**
     * Returns scale factor of the horizontal direction (X axis).
     * 返回水平方向上的比例因子（X轴）
     * @return {Number}
     */
    getScaleX: function () {
        return this._scaleX;
    },

    /**
     * Returns scale factor of the vertical direction (Y axis).
     * 返回水平方向上的比例因子（y轴）
     * @return {Number}
     */
    getScaleY: function () {
        return this._scaleY;
    },

    /**
     * Returns device pixel ratio for retina display.
     * 返回Retina显示屏设备像素
     * @return {Number}
     */
    getDevicePixelRatio: function() {
        return this._devicePixelRatio;
    },

    /**
     * Returns the real location in view for a translation based on a related position
     * 返回真实位置鉴于为基于相关位置的平移
     * @param {Number} tx The X axis translation x轴位移
     * @param {Number} ty The Y axis translation y轴位移
     * @param {Object} relatedPos The related position object including "left", "top", "width", "height" informations 相对位置包含"left","top","width","height"
     * @return {cc.Point}
     */
    convertToLocationInView: function (tx, ty, relatedPos) {
        return {x: this._devicePixelRatio * (tx - relatedPos.left), y: this._devicePixelRatio * (relatedPos.top + relatedPos.height - ty)};
    },

    _convertMouseToLocationInView: function(point, relatedPos) {
        var locViewPortRect = this._viewPortRect, _t = this;
        point.x = ((_t._devicePixelRatio * (point.x - relatedPos.left)) - locViewPortRect.x) / _t._scaleX;
        point.y = (_t._devicePixelRatio * (relatedPos.top + relatedPos.height - point.y) - locViewPortRect.y) / _t._scaleY;
    },

    _convertTouchesWithScale: function(touches){
        var locViewPortRect = this._viewPortRect, locScaleX = this._scaleX, locScaleY = this._scaleY, selTouch, selPoint, selPrePoint;
        for( var i = 0; i < touches.length; i ++){
            selTouch = touches[i];
            selPoint = selTouch._point;
	        selPrePoint = selTouch._prevPoint;
            selTouch._setPoint((selPoint.x - locViewPortRect.x) / locScaleX,
                (selPoint.y - locViewPortRect.y) / locScaleY);
            selTouch._setPrevPoint((selPrePoint.x - locViewPortRect.x) / locScaleX,
                (selPrePoint.y - locViewPortRect.y) / locScaleY);
        }
    }
});

/**
 * @function
 * @return {cc.EGLView}
 * @private
 */
cc.EGLView._getInstance = function () {
    if (!this._instance) {
        this._instance = this._instance || new cc.EGLView();
        this._instance.initialize();
    }
    return this._instance;
};

/**
 * <p>cc.ContainerStrategy class is the root strategy class of container's scale strategy,
 * it controls the behavior of how to scale the cc.container and cc._canvas object</p>
 * cc.ContainerStrategy类是基类,它控制如何缩放cc.container和cc._canvas对象的行为
 *
 * @class
 * @extends cc.Class
 */
cc.ContainerStrategy = cc.Class.extend(/** @lends cc.ContainerStrategy# */{
    /**
     * Manipulation before appling the strategy
     * 在appling之前操作
     * @param {cc.view} The target view
     */
    preApply: function (view) {
    },

    /**
     * Function to apply this strategy
     * 应用此策略的方法
     * @param {cc.view} view
     * @param {cc.Size} designedResolution
     */
    apply: function (view, designedResolution) {
    },

    /**
     * Manipulation after applying the strategy
     * 在appling之后操作
     * @param {cc.view} view  The target view
     */
    postApply: function (view) {

    },

    _setupContainer: function (view, w, h) {
        var frame = view._frame;
        if (cc.view._autoFullScreen && cc.sys.isMobile && frame == document.documentElement) {
            // Automatically full screen when user touches on mobile version
            // 当用户触摸手机版时自动全屏
            cc.screen.autoFullScreen(frame);
        }

        var locCanvasElement = cc._canvas, locContainer = cc.container;
        // Setup container
        // 设置容器
        locContainer.style.width = locCanvasElement.style.width = w + "px";
        locContainer.style.height = locCanvasElement.style.height = h + "px";
        // Setup pixel ratio for retina display
        // 设置Retina显示屏像素比
        var devicePixelRatio = view._devicePixelRatio = 1;
        if (view.isRetinaEnabled())
            devicePixelRatio = view._devicePixelRatio = window.devicePixelRatio || 1;
        // Setup canvas
        // 设置canvas
        locCanvasElement.width = w * devicePixelRatio;
        locCanvasElement.height = h * devicePixelRatio;

        var body = document.body, style;
        if (body && (style = body.style)) {
            style.paddingTop = style.paddingTop || "0px";
            style.paddingRight = style.paddingRight || "0px";
            style.paddingBottom = style.paddingBottom || "0px";
            style.paddingLeft = style.paddingLeft || "0px";
            style.borderTop = style.borderTop || "0px";
            style.borderRight = style.borderRight || "0px";
            style.borderBottom = style.borderBottom || "0px";
            style.borderLeft = style.borderLeft || "0px";
            style.marginTop = style.marginTop || "0px";
            style.marginRight = style.marginRight || "0px";
            style.marginBottom = style.marginBottom || "0px";
            style.marginLeft = style.marginLeft || "0px";
        }
    },

    _fixContainer: function () {
        // Add container to document body
        // 加入容器文档正文
        document.body.insertBefore(cc.container, document.body.firstChild);
        // Set body's width height to window's size, and forbid overflow, so that game will be centered
        // 设置文件正文的宽度高度适应于window的大小，并且禁止溢出，因此画面可以集中
        var bs = document.body.style;
        bs.width = window.innerWidth + "px";
        bs.height = window.innerHeight + "px";
        bs.overflow = "hidden";
        // Body size solution doesn't work on all mobile browser so this is the aleternative: fixed container
        // 机身尺寸解决方案并不能在所有的移动浏览器工作，所以这是aleternative：固定容器
        var contStyle = cc.container.style;
        contStyle.position = "fixed";
        contStyle.left = contStyle.top = "0px";
        // Reposition body
        // 重定位文档正文
        document.body.scrollTop = 0;
    }
});

/**
 * <p>cc.ContentStrategy class is the root strategy class of content's scale strategy,
 * it controls the behavior of how to scale the scene and setup the viewport for the game</p>
 * cc.ContentStrategy类是根策略类的内容的规模策略，控制如何缩放场景和设置视口的游戏行为
 *
 * @class
 * @extends cc.Class
 */
cc.ContentStrategy = cc.Class.extend(/** @lends cc.ContentStrategy# */{

    _result: {
        scale: [1, 1],
        viewport: null
    },

    _buildResult: function (containerW, containerH, contentW, contentH, scaleX, scaleY) {
	    // Makes content fit better the canvas
        // 使内容在canvas适合的更好
	    Math.abs(containerW - contentW) < 2 && (contentW = containerW);
	    Math.abs(containerH - contentH) < 2 && (contentH = containerH);

        var viewport = cc.rect(Math.round((containerW - contentW) / 2),
                               Math.round((containerH - contentH) / 2),
                               contentW, contentH);

        // Translate the content
        // 翻译内容
        if (cc._renderType == cc._RENDER_TYPE_CANVAS)
            cc._renderContext.translate(viewport.x, viewport.y + contentH);

        this._result.scale = [scaleX, scaleY];
        this._result.viewport = viewport;
        return this._result;
    },

    /**
     * Manipulation before applying the strategy
     * 操作该方法应用该策略之前
     * @param {cc.view} view The target view
     */
    preApply: function (view) {
    },

    /**
     * Function to apply this strategy
     * 应用该方法的策略
     * The return value is {scale: [scaleX, scaleY], viewport: {cc.Rect}},
     * 返回值{scale: [scaleX, scaleY], viewport: {cc.Rect}}
     * The target view can then apply these value to itself, it's preferred not to modify directly its private variables
     * 目标view可以适应这些值，它宁愿不直接修改其私有变量
     * @param {cc.view} view
     * @param {cc.Size} designedResolution
     * @return {object} scaleAndViewportRect
     */
    apply: function (view, designedResolution) {
        return {"scale": [1, 1]};
    },

    /**
     * Manipulation after applying the strategy
     * 操作该方法在应用该策略后
     * @param {cc.view} view The target view
     */
    postApply: function (view) {
    }
});

(function () {

// Container scale strategys
// 容器缩放策略
    /**
     * @class
     * @extends cc.ContainerStrategy
     */
    var EqualToFrame = cc.ContainerStrategy.extend({
        apply: function (view) {
            this._setupContainer(view, view._frameSize.width, view._frameSize.height);
        }
    });

    /**
     * @class
     * @extends cc.ContainerStrategy
     */
    var ProportionalToFrame = cc.ContainerStrategy.extend({
        apply: function (view, designedResolution) {
            var frameW = view._frameSize.width, frameH = view._frameSize.height, containerStyle = cc.container.style,
                designW = designedResolution.width, designH = designedResolution.height,
                scaleX = frameW / designW, scaleY = frameH / designH,
                containerW, containerH;

            scaleX < scaleY ? (containerW = frameW, containerH = designH * scaleX) : (containerW = designW * scaleY, containerH = frameH);

            // Adjust container size with integer value
            // 使用证书值调整容器的大小
            var offx = Math.round((frameW - containerW) / 2);
            var offy = Math.round((frameH - containerH) / 2);
            containerW = frameW - 2 * offx;
            containerH = frameH - 2 * offy;

            this._setupContainer(view, containerW, containerH);
            // Setup container's margin
            // 设置容器的位移
            containerStyle.marginLeft = offx + "px";
            containerStyle.marginRight = offx + "px";
            containerStyle.marginTop = offy + "px";
            containerStyle.marginBottom = offy + "px";
        }
    });

    /**
     * @class
     * @extends EqualToFrame
     */
    var EqualToWindow = EqualToFrame.extend({
        preApply: function (view) {
	        this._super(view);
            view._frame = document.documentElement;
        },

        apply: function (view) {
            this._super(view);
            this._fixContainer();
        }
    });

    /**
     * @class
     * @extends ProportionalToFrame
     */
    var ProportionalToWindow = ProportionalToFrame.extend({
        preApply: function (view) {
	        this._super(view);
            view._frame = document.documentElement;
        },

        apply: function (view, designedResolution) {
            this._super(view, designedResolution);
            this._fixContainer();
        }
    });

    /**
     * @class
     * @extends cc.ContainerStrategy
     */
    var OriginalContainer = cc.ContainerStrategy.extend({
        apply: function (view) {
            this._setupContainer(view, cc._canvas.width, cc._canvas.height);
        }
    });

// #NOT STABLE on Android# Alias: Strategy that makes the container's size equals to the window's size
// 在Android上还不稳定 Alias：使容器的大小等于窗口的大小
//    cc.ContainerStrategy.EQUAL_TO_WINDOW = new EqualToWindow();
// #NOT STABLE on Android# Alias: Strategy that scale proportionally the container's size to window's size
// 在Android上还不稳定 Alias：随窗口的大小比例缩放容器的大小
//    cc.ContainerStrategy.PROPORTION_TO_WINDOW = new ProportionalToWindow();
// Alias: Strategy that makes the container's size equals to the frame's size
// Alias: 使容器的大小等于frame的大小
    cc.ContainerStrategy.EQUAL_TO_FRAME = new EqualToFrame();
// Alias: Strategy that scale proportionally the container's size to frame's size
// Alias: 随框的大小比例缩放容器的大小
    cc.ContainerStrategy.PROPORTION_TO_FRAME = new ProportionalToFrame();
// Alias: Strategy that keeps the original container's size
// Alias: 保持原来的容器大小
    cc.ContainerStrategy.ORIGINAL_CONTAINER = new OriginalContainer();

// Content scale strategys
// 内容缩放策略
    var ExactFit = cc.ContentStrategy.extend({
        apply: function (view, designedResolution) {
            var containerW = cc._canvas.width, containerH = cc._canvas.height,
                scaleX = containerW / designedResolution.width, scaleY = containerH / designedResolution.height;

            return this._buildResult(containerW, containerH, containerW, containerH, scaleX, scaleY);
        }
    });

    var ShowAll = cc.ContentStrategy.extend({
        apply: function (view, designedResolution) {
            var containerW = cc._canvas.width, containerH = cc._canvas.height,
                designW = designedResolution.width, designH = designedResolution.height,
                scaleX = containerW / designW, scaleY = containerH / designH, scale = 0,
                contentW, contentH;

	        scaleX < scaleY ? (scale = scaleX, contentW = containerW, contentH = designH * scale)
                : (scale = scaleY, contentW = designW * scale, contentH = containerH);

            return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
        }
    });

    var NoBorder = cc.ContentStrategy.extend({
        apply: function (view, designedResolution) {
            var containerW = cc._canvas.width, containerH = cc._canvas.height,
                designW = designedResolution.width, designH = designedResolution.height,
                scaleX = containerW / designW, scaleY = containerH / designH, scale,
                contentW, contentH;

            scaleX < scaleY ? (scale = scaleY, contentW = designW * scale, contentH = containerH)
                : (scale = scaleX, contentW = containerW, contentH = designH * scale);

            return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
        }
    });

    var FixedHeight = cc.ContentStrategy.extend({
        apply: function (view, designedResolution) {
            var containerW = cc._canvas.width, containerH = cc._canvas.height,
                designH = designedResolution.height, scale = containerH / designH,
                contentW = containerW, contentH = containerH;

            return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
        },

        postApply: function (view) {
            cc.director._winSizeInPoints = view.getVisibleSize();
        }
    });

    var FixedWidth = cc.ContentStrategy.extend({
        apply: function (view, designedResolution) {
            var containerW = cc._canvas.width, containerH = cc._canvas.height,
                designW = designedResolution.width, scale = containerW / designW,
                contentW = containerW, contentH = containerH;

            return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
        },

        postApply: function (view) {
            cc.director._winSizeInPoints = view.getVisibleSize();
        }
    });

// Alias: Strategy to scale the content's size to container's size, non proportional
// Alias: 容器的大小跟随缩放内容的大小改变，不成正比
    cc.ContentStrategy.EXACT_FIT = new ExactFit();
// Alias: Strategy to scale the content's size proportionally to maximum size and keeps the whole content area to be visible
// Alias: 以按比例缩放所述内容的尺寸为最大尺寸，并保持了整个内容区域是可见
    cc.ContentStrategy.SHOW_ALL = new ShowAll();
// Alias: Strategy to scale the content's size proportionally to fill the whole container area
// Alias: 按比例缩放内容的大小来填满整个容器
    cc.ContentStrategy.NO_BORDER = new NoBorder();
// Alias: Strategy to scale the content's height to container's height and proportionally scale its width
// Alias: 按缩放内容的高度比例缩放容器的高度和宽度
    cc.ContentStrategy.FIXED_HEIGHT = new FixedHeight();
// Alias: Strategy to scale the content's width to container's width and proportionally scale its height
// Alias: 按缩放内容的宽度比例缩放容器的高度和宽度
    cc.ContentStrategy.FIXED_WIDTH = new FixedWidth();

})();

/**
 * <p>cc.ResolutionPolicy class is the root strategy class of scale strategy,
 * its main task is to maintain the compatibility with Cocos2d-x</p>
 * cc.ResolutionPolicy类是缩放根策略，其主要任务是保持的Cocos2D-X的兼容性
 *
 * @class
 * @extends cc.Class
 * @param {cc.ContainerStrategy} containerStg The container strategy 容器策略
 * @param {cc.ContentStrategy} contentStg The content strategy 内容策略
 */
cc.ResolutionPolicy = cc.Class.extend(/** @lends cc.ResolutionPolicy# */{
	_containerStrategy: null,
    _contentStrategy: null,

    /**
     * Constructor of cc.ResolutionPolicy cc.ResolutionPolicy的构造函数
     * @param {cc.ContainerStrategy} containerStg
     * @param {cc.ContentStrategy} contentStg
     */
    ctor: function (containerStg, contentStg) {
        this.setContainerStrategy(containerStg);
        this.setContentStrategy(contentStg);
    },

    /**
     * Manipulation before applying the resolution policy
     * 操作该方法在应用该策略前
     * @param {cc.view} view The target view 目标view
     */
    preApply: function (view) {
        this._containerStrategy.preApply(view);
        this._contentStrategy.preApply(view);
    },

    /**
     * Function to apply this resolution policy
     * 应用该策略的函数
     * The return value is {scale: [scaleX, scaleY], viewport: {cc.Rect}},
     * 返回值 {scale: [scaleX, scaleY], viewport: {cc.Rect}}
     * The target view can then apply these value to itself, it's preferred not to modify directly its private variables
     * 目标view可以适应这些值，它宁愿不直接修改其私有变量
     * @param {cc.view} view The target view 目标view
     * @param {cc.Size} designedResolution The user defined design resolution 用户定义的分辨率设计
     * @return {object} An object contains the scale X/Y values and the viewport rect 一个对象包含缩放X/ Y值和视口矩形
     */
    apply: function (view, designedResolution) {
        this._containerStrategy.apply(view, designedResolution);
        return this._contentStrategy.apply(view, designedResolution);
    },

    /**
     * Manipulation after appyling the strategy
     * 操作该方法在应用该策略后
     * @param {cc.view} view The target view
     */
    postApply: function (view) {
        this._containerStrategy.postApply(view);
        this._contentStrategy.postApply(view);
    },

    /**
     * Setup the container's scale strategy
     * 设置容器的缩放策略
     * @param {cc.ContainerStrategy} containerStg
     */
    setContainerStrategy: function (containerStg) {
        if (containerStg instanceof cc.ContainerStrategy)
            this._containerStrategy = containerStg;
    },

    /**
     * Setup the content's scale strategy
     * 设置容器的缩放策略
     * @param {cc.ContentStrategy} contentStg
     */
    setContentStrategy: function (contentStg) {
        if (contentStg instanceof cc.ContentStrategy)
            this._contentStrategy = contentStg;
    }
});

/**
 * @memberOf cc.ResolutionPolicy#
 * @name EXACT_FIT
 * @constant
 * @type Number
 * @static
 * The entire application is visible in the specified area without trying to preserve the original aspect ratio.<br/>
 * 整个应用程序在指定区域中可见，但不尝试保持原始宽高比
 * Distortion can occur, and the application may appear stretched or compressed.
 * 会发生变形，并且该应用程序可能会出现拉伸或压缩
 */
cc.ResolutionPolicy.EXACT_FIT = 0;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name NO_BORDER
 * @constant
 * @type Number
 * @static
 * The entire application fills the specified area, without distortion but possibly with some cropping,<br/>
 * while maintaining the original aspect ratio of the application.
 * 整个应用程序填满指定区域，不发生扭曲，但有可能会进行一些裁切，同时保持应用程序的原始宽高比。
 */
cc.ResolutionPolicy.NO_BORDER = 1;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name SHOW_ALL
 * @constant
 * @type Number
 * @static
 * The entire application is visible in the specified area without distortion while maintaining the original<br/>
 * aspect ratio of the application. Borders can appear on two sides of the application.
 */
cc.ResolutionPolicy.SHOW_ALL = 2;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name FIXED_HEIGHT
 * @constant
 * @type Number
 * @static
 * The application takes the height of the design resolution size and modifies the width of the internal<br/>
 * canvas so that it fits the aspect ratio of the device<br/>
 * no distortion will occur however you must make sure your application works on different<br/>
 * 应用程序需要设计分辨率大小的高度和修改内部canvas的宽度，使其设备的纵横比不会发生变形但你必须确保你的应用程序的工作原理不同
 * aspect ratios
 */
cc.ResolutionPolicy.FIXED_HEIGHT = 3;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name FIXED_WIDTH
 * @constant
 * @type Number
 * @static
 * The application takes the width of the design resolution size and modifies the height of the internal<br/>
 * canvas so that it fits the aspect ratio of the device<br/>
 * no distortion will occur however you must make sure your application works on different<br/>
 * 应用程序需要设计分辨率大小的宽度和修改内部canvas的高度，使其设备的纵横比不会发生变形但你必须确保你的应用程序的工作原理不同
 * aspect ratios
 */
cc.ResolutionPolicy.FIXED_WIDTH = 4;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name UNKNOWN
 * @constant
 * @type Number
 * @static
 * Unknow policy
 */
cc.ResolutionPolicy.UNKNOWN = 5;
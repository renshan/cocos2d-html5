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
 * 游戏窗口cc.view是单例模式的对象<br/>
 * 它的主要任务包括：<br/>
 *  - 应用设计分辨率解决策略<br/>
 *  - 提供互动窗口，就像web中的resize事件，Retina显示屏的支持等等<br/>
 *  - 管理与窗口不同游戏视图端口<br/>
 *  - 管理内容的缩放和平移<br/>
 * <br/>
 *  由于cc.view是单例，你不需要调用任何构造或创建函数，标准模式的调用方式：<br/>
 *  - cc.view.methodName();<br/>
 * @class
 * @name cc.view
 * @extend cc.Class
 */
cc.EGLView = cc.Class.extend(/** @lends cc.view# */{
    _delegate: null,
    // 父节点的大小，它包含cc.container和cc._canvas
    _frameSize: null,
    // 分辨率大小，它是适合于该应用的资源的尺寸大小
    _designResolutionSize: null,
    _originalDesignResolutionSize: null,
    // 视口为与内容有关的矩形的像素坐标
    _viewPortRect: null,
    // 可见内容的矩形的点坐标
    _visibleRect: null,
	_retinaEnabled: false,
    _autoFullScreen: true,
    // 设备的像素比（针对视网膜显示器）
    _devicePixelRatio: 1,
    // 视图的名字
    _viewName: "",
    // 为resize事件的自定义回调
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

    // 含cc.container和cc._canvas的父节点
    _frame: null,
    _frameZoomFactor: 1.0,
    __resizeWithBrowserSize: false,
    _isAdjustViewPort: true,
    _targetDensityDPI: null,

    /**
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

        // 设置系统默认分辨率策略
        _t._rpExactFit = new cc.ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.EXACT_FIT);
        _t._rpShowAll = new cc.ResolutionPolicy(_strategyer.PROPORTION_TO_FRAME, _strategy.SHOW_ALL);
        _t._rpNoBorder = new cc.ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.NO_BORDER);
        _t._rpFixedHeight = new cc.ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.FIXED_HEIGHT);
        _t._rpFixedWidth = new cc.ResolutionPolicy(_strategyer.EQUAL_TO_FRAME, _strategy.FIXED_WIDTH);

        _t._hDC = cc._canvas;
        _t._hRC = cc._renderContext;
        _t._targetDensityDPI = cc.DENSITYDPI_HIGH;
    },

    // Resize的辅助函数
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
     * 设置Android手机浏览器视图的target-densitydpi。它可以被设置为：          <br/>
     *   1. cc.DENSITYDPI_DEVICE，值为“device-dpi”                          <br/>
     *   2. cc.DENSITYDPI_HIGH，值为“high-dpi”（默认值）                     <br/>
     *   3. cc.DENSITYDPI_MEDIUM，值为“medium-dpi”（浏览器的默认值）          <br/>
     *   4. cc.DENSITYDPI_LOW，值为“low-dpi”                                <br/>
     *   5. 自定义值，例如：“480”                                             <br/>
     * @param {String} densityDPI
     */
    setTargetDensityDPI: function(densityDPI){
        this._targetDensityDPI = densityDPI;
        this._setViewPortMeta();
    },

    /**
     * 返回当前cc.view的target-densitydpi值
     * @returns {String}
     */
    getTargetDensityDPI: function(){
        return this._targetDensityDPI;
    },

    /**
     * 设置canvas大小是否随浏览器的大小改变而自动调整.<br/>
     * 只在web中有用
     * @param {Boolean} enabled  是否启用随浏览器的resize事件自动调整大小
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
     * 设置cc.view大小调整动作的回调函数，这个回调函数将应用分辨率策略之前被调用,所以你可以在回调中的做任何额外的修改。<br/>
     * 只在web上有用<br/>
     * @param {Function|null} callback 回调函数
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
            // 采用某些Android设备不支持第二视图
            if (currentVP)
                currentVP.content = content;

            document.head.appendChild(vp);
        }
    },

    // 纹理渲染hacker
    _setScaleXYForRenderTexture: function () {
        //计算在画布上渲染纹理的模式以适应多种分辨率的资源
        var scaleFactor = cc.contentScaleFactor();
        this._scaleX = scaleFactor;
        this._scaleY = scaleFactor;
    },


    // 其它辅助方法
    _resetScale: function () {
        this._scaleX = this._originalScaleX;
        this._scaleY = this._originalScaleY;
    },

    // Useless, just make sure the compatibility temporarily, should be removed
    // 没用,只是暂时确保兼容性，应该被删除
    _adjustSizeToBrowser: function () {
    },

    initialize: function () {
        this._initialized = true;
    },

    /**
     * 设置该引擎是否修改你的网页中"viewport"元素.<br/>
     * 默认情况下它是启用的，我们强烈建议您不要禁用它.<br/>
     * 当它的启用时，你还可以设置自己的"viewport"元素，它是不会被覆盖的.<br/>
     * 只在web中有效
     * @param {Boolean} enabled  是否启用自动修改"viewport"元素
     */
    adjustViewPort: function (enabled) {
        this._isAdjustViewPort = enabled;
    },

	/**
     * 视网膜支持，默认情况下，为苹果设备启用，但其他设备停用<br/>
     * 只会在调用setDesignResolutionPolicy时生效<br/>
     * 只在web中有效
	 * @param {Boolean} enabled  启用或禁用支持Retina显示屏
	 */
	enableRetina: function(enabled) {
		this._retinaEnabled = enabled ? true : false;
	},

	/**
     * 检查视网膜显示屏是否启用<br/>
     * 只在web中有效
	 * @return {Boolean}
	 */
	isRetinaEnabled: function() {
		return this._retinaEnabled;
	},

    /**
     * 如果启用，在移动设备上该应用程序会自动尝试进入全屏模式<br/>
     * 您可以传递参数true来启用它，或通过传递参数false来禁用它.<br/>
     * 只在web中有效
     * @param {Boolean} enabled  启用或禁用移动设备上自动全屏
     */
    enableAutoFullScreen: function(enabled) {
        this._autoFullScreen = enabled ? true : false;
    },

    /**
     * 检查自动全屏是否启用<br/>
     * 只在web中有效
     * @return {Boolean} Auto 自动全屏启用与否
     */
    isAutoFullScreenEnabled: function() {
        return this._autoFullScreen;
    },

    /**
     * 强制摧毁EGL视图，子类必须实现该方法
     */
    end: function () {
    },

    /**
     * 获取渲染系统是否已准备就绪(无论opengl或者canvas),<br/>
     * 使用这个名字是为了与cocos2d-x保持一致，子类必须实现此方法<br/>
     * @return {Boolean}
     */
    isOpenGLReady: function () {
        return (this._hDC != null && this._hRC != null);
    },

    /*
     * 设置帧的缩放因子。这种方法是用于在桌面设备上调试的大分辨率应用程序（像new iPad）
     * @param {Number} zoomFactor 缩放因子
     */
    setFrameZoomFactor: function (zoomFactor) {
        this._frameZoomFactor = zoomFactor;
        this.centerWindow();
        cc.director.setProjection(cc.director.getProjection());
    },

    /**
     * 交换前后缓冲区，子类必须实现此方法
     */
    swapBuffers: function () {
    },

    /**
     * 开启或关闭IME键盘，子类必须实现该方法
     * @param {Boolean} isOpen
     */
    setIMEKeyboardState: function (isOpen) {
    },

    /**
     * 在EGLView上设置分辨率转换
     * @param {Number} offsetLeft
     * @param {Number} offsetTop
     */
    setContentTranslateLeftTop: function (offsetLeft, offsetTop) {
        this._contentTranslateLeftTop = {left: offsetLeft, top: offsetTop};
    },

    /**
     * 返回EGLView的分辨率转换
     * @return {cc.Size|Object}
     */
    getContentTranslateLeftTop: function () {
        return this._contentTranslateLeftTop;
    },

    /**
     * 返回view的frame大小<br/>
     * 在原生平台上，它返回屏幕尺寸，因为视图是一个全屏视图<br/>
     * 在web上,它返回canvas的外层DOM元素的大小
     * @return {cc.Size}
     */
    getFrameSize: function () {
        return cc.size(this._frameSize.width, this._frameSize.height);
    },

    /**
     * 在原生原生平台上,该方法设置view的frame大小<br/>
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
     * 空方法
     */
    centerWindow: function () {
    },

    /**
     * 返回view的可见区域大小
     * @return {cc.Size}
     */
    getVisibleSize: function () {
        return cc.size(this._visibleRect.width,this._visibleRect.height);
    },

    /**
     * 返回view的可见区域原点
     * @return {cc.Point}
     */
    getVisibleOrigin: function () {
        return cc.p(this._visibleRect.x,this._visibleRect.y);
    },

    /**
     * 返回开发者是否可以设置内容缩放因子大小
     * @return {Boolean}
     */
    canSetContentScaleFactor: function () {
        return true;
    },

    /**
     * 返回当前的分辨率策略
     * @see cc.ResolutionPolicy
     * @return {cc.ResolutionPolicy}
     */
    getResolutionPolicy: function () {
        return this._resolutionPolicy;
    },

    /**
     * 设置当前分辨率策略
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
     * 设置设计视图点大小的分辨率策略<br/>
     * 分辨率策略包括：<br/>
     * [1] ResolutionExactFit 通过拉伸适配填充屏幕：如果设计分辨率的宽高比与屏幕分辨率的宽高比不相同，那么你的游戏视图将被拉伸<br/>
     * [2] ResolutionNoBorder 全屏无黑边：如果设计分辨率的宽高比与屏幕分辨率的宽高比不相同，那么你的游戏视图的两个区域会被裁剪<br/>
     * [3] ResolutionShowAll 全屏带黑边框：如果设计分辨率的宽高比与屏幕分辨率的宽高比不相同，那么将显示两个黑边框<br/>
     * [4] ResolutionFixedHeight 按内容和屏幕的高度比，缩放内容的宽高<br/>
     * [5] ResolutionFixedWidth 按内容和屏幕的宽度比，缩放内容的宽高<br/>
     * [cc.ResolutionPolicy] [仅限于Web功能]自定义分辨率策略，通过cc.ResolutionPolicy构建<br/>
     * @param {Number} width  设计分辨率宽度
     * @param {Number} height 设计分辨率高度
     * @param {cc.ResolutionPolicy|Number} resolutionPolicy 分辨率策略
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

        // 重初始化frame大小
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

        // 重置导演(director)的成员变量以适应可见矩形
        var director = cc.director;
        director._winSizeInPoints.width = this._designResolutionSize.width;
        director._winSizeInPoints.height = this._designResolutionSize.height;
        policy.postApply(this);
        cc.winSize.width = director._winSizeInPoints.width;
        cc.winSize.height = director._winSizeInPoints.height;

        if (cc._renderType == cc._RENDER_TYPE_WEBGL) {
            // 重置导演(director)的成员变量以适应可见矩形
            director._createStatsLabel();
            director.setGLDefaultValues();
        }

        this._originalScaleX = this._scaleX;
        this._originalScaleY = this._scaleY;
        // For editbox
        if (cc.DOM)
            cc.DOM._resetEGLViewDiv();
        cc.visibleRect && cc.visibleRect.init(this._visibleRect);
    },

    /**
     * 返回视图的设计大小
     * 默认分辨率的大小同“getFrameSize”一样
     * @return {cc.Size}
     */
    getDesignResolutionSize: function () {
        return cc.size(this._designResolutionSize.width, this._designResolutionSize.height);
    },

    /**
     * 设置矩形视图坐标
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
     * 设置裁剪矩形坐标
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
     * 返回GL_SCISSOR_TEST是否启用
     * @return {Boolean}
     */
    isScissorEnabled: function () {
        var gl = cc._renderContext;
        return gl.isEnabled(gl.SCISSOR_TEST);
    },

    /**
     * 返回当前裁剪矩形
     * @return {cc.Rect}
     */
    getScissorRect: function () {
        var gl = cc._renderContext, scaleX = this._scaleX, scaleY = this._scaleY;
        var boxArr = gl.getParameter(gl.SCISSOR_BOX);
        return cc.rect((boxArr[0] - this._viewPortRect.x) / scaleX, (boxArr[1] - this._viewPortRect.y) / scaleY,
            boxArr[2] / scaleX, boxArr[3] / scaleY);
    },

    /**
     * 设置view的名字
     * @param {String} viewName
     */
    setViewName: function (viewName) {
        if (viewName != null && viewName.length > 0) {
            this._viewName = viewName;
        }
    },

    /**
     * 返回view的名字
     * @return {String}
     */
    getViewName: function () {
        return this._viewName;
    },

    /**
     * 返回视图矩形
     * @return {cc.Rect}
     */
    getViewPortRect: function () {
        return this._viewPortRect;
    },

    /**
     * 返回水平方向上的比例因子（X轴）
     * @return {Number}
     */
    getScaleX: function () {
        return this._scaleX;
    },

    /**
     * 返回垂直方向上的比例因子（y轴）
     * @return {Number}
     */
    getScaleY: function () {
        return this._scaleY;
    },

    /**
     * 返回Retina显示屏设备像素比例
     * @return {Number}
     */
    getDevicePixelRatio: function() {
        return this._devicePixelRatio;
    },

    /**
     * 返回视图中基于关联位置转换的真实位置
     * @param {Number} tx The X axis translation x轴位移
     * @param {Number} ty The Y axis translation y轴位移
     * @param {Object} relatedPos  关联位置对象包含"left","top","width","height"信息
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
 * <p>cc.ContainerStrategy类是容器缩放策略的基类,它控制如何缩放cc.container和cc._canvas对象的行为</p>
 *
 * @class
 * @extends cc.Class
 */
cc.ContainerStrategy = cc.Class.extend(/** @lends cc.ContainerStrategy# */{
    /**
     * 在采用策略之前处理
     * @param {cc.view} view 目标视图
     */
    preApply: function (view) {
    },

    /**
     * 应用此策略的方法
     * @param {cc.view} view
     * @param {cc.Size} designedResolution
     */
    apply: function (view, designedResolution) {
    },

    /**
     * 在应用策略之后处理
     * @param {cc.view} view  目标视图
     */
    postApply: function (view) {

    },

    _setupContainer: function (view, w, h) {
        var frame = view._frame;
        if (cc.view._autoFullScreen && cc.sys.isMobile && frame == document.documentElement) {
            // 当用户触摸手机版时自动全屏
            cc.screen.autoFullScreen(frame);
        }

        var locCanvasElement = cc._canvas, locContainer = cc.container;
        // 设置容器
        locContainer.style.width = locCanvasElement.style.width = w + "px";
        locContainer.style.height = locCanvasElement.style.height = h + "px";
        // 设置Retina显示像素比
        var devicePixelRatio = view._devicePixelRatio = 1;
        if (view.isRetinaEnabled())
            devicePixelRatio = view._devicePixelRatio = window.devicePixelRatio || 1;
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
        // 为文档正文加入容器
        document.body.insertBefore(cc.container, document.body.firstChild);
        // 设置文档正文的宽高适应于window的大小，并且禁止溢出，因此游戏可能会集中
        var bs = document.body.style;
        bs.width = window.innerWidth + "px";
        bs.height = window.innerHeight + "px";
        bs.overflow = "hidden";
        // 正文大小的解决方案并不能在所有的移动浏览器工作，所以这里选择：固定容器
        var contStyle = cc.container.style;
        contStyle.position = "fixed";
        contStyle.left = contStyle.top = "0px";
        // 重定位文档正文
        document.body.scrollTop = 0;
    }
});

/**
 * <p>cc.ContentStrategy类是内容缩放策略的基类,，控制如何缩放场景和设置视图的游戏行为</p>
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
        // 使内容更好的适配canvas
	    Math.abs(containerW - contentW) < 2 && (contentW = containerW);
	    Math.abs(containerH - contentH) < 2 && (contentH = containerH);

        var viewport = cc.rect(Math.round((containerW - contentW) / 2),
                               Math.round((containerH - contentH) / 2),
                               contentW, contentH);

        // 转换内容
        if (cc._renderType == cc._RENDER_TYPE_CANVAS)
            cc._renderContext.translate(viewport.x, viewport.y + contentH);

        this._result.scale = [scaleX, scaleY];
        this._result.viewport = viewport;
        return this._result;
    },

    /**
     * 在应用该策略之前处理
     * @param {cc.view} view The target view
     */
    preApply: function (view) {
    },

    /**
     * 应用该策略方法
     * 返回值{scale: [scaleX, scaleY], viewport: {cc.Rect}}
     * 目标view可以自适应这些值，且不愿直接修改其私有变量
     * @param {cc.view} view
     * @param {cc.Size} designedResolution
     * @return {object} scaleAndViewportRect
     */
    apply: function (view, designedResolution) {
        return {"scale": [1, 1]};
    },

    /**
     * 在应用该策略后处理
     * @param {cc.view} view 目标视图
     */
    postApply: function (view) {
    }
});

(function () {

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

            // 使用整数值调整容器的大小
            var offx = Math.round((frameW - containerW) / 2);
            var offy = Math.round((frameH - containerH) / 2);
            containerW = frameW - 2 * offx;
            containerH = frameH - 2 * offy;

            this._setupContainer(view, containerW, containerH);
            // 设置容器的边距(margin)
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


// #在Android上还不稳定# Alias：该策略使容器的大小等于窗口的大小
//    cc.ContainerStrategy.EQUAL_TO_WINDOW = new EqualToWindow();
// #在Android上还不稳定# Alias：该策略按比例缩放容器大小到窗口的大小
//    cc.ContainerStrategy.PROPORTION_TO_WINDOW = new ProportionalToWindow();
// Alias: 该策略使容器的大小等于frame的大小
    cc.ContainerStrategy.EQUAL_TO_FRAME = new EqualToFrame();
// Alias: 该策略按比例缩放容器大小到frame的大小
    cc.ContainerStrategy.PROPORTION_TO_FRAME = new ProportionalToFrame();
// Alias: 该策略保持原来的容器大小
    cc.ContainerStrategy.ORIGINAL_CONTAINER = new OriginalContainer();

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

// Alias: 缩放内容大小到容器大小，不成正比
    cc.ContentStrategy.EXACT_FIT = new ExactFit();
// Alias: 按比例缩放内容尺寸到最大尺寸，并保持了整个内容区域是可见
    cc.ContentStrategy.SHOW_ALL = new ShowAll();
// Alias: 按比例缩放内容的大小来填满整个容器
    cc.ContentStrategy.NO_BORDER = new NoBorder();
// Alias: 按内容和容器的高度比，缩放内容的宽高
    cc.ContentStrategy.FIXED_HEIGHT = new FixedHeight();
// Alias: 按内容和容器的宽度比，缩放内容的宽高
    cc.ContentStrategy.FIXED_WIDTH = new FixedWidth();

})();

/**
 * <p>cc.ResolutionPolicy类是缩放策略的根类，其主要任务是保持与Cocos2D-X的兼容</p>
 *
 * @class
 * @extends cc.Class
 * @param {cc.ContainerStrategy} containerStg  容器策略
 * @param {cc.ContentStrategy} contentStg 内容策略
 */
cc.ResolutionPolicy = cc.Class.extend(/** @lends cc.ResolutionPolicy# */{
	_containerStrategy: null,
    _contentStrategy: null,

    /**
     * cc.ResolutionPolicy的构造函数
     * @param {cc.ContainerStrategy} containerStg
     * @param {cc.ContentStrategy} contentStg
     */
    ctor: function (containerStg, contentStg) {
        this.setContainerStrategy(containerStg);
        this.setContentStrategy(contentStg);
    },

    /**
     * 在应用该策略前处理
     * @param {cc.view} view 目标view
     */
    preApply: function (view) {
        this._containerStrategy.preApply(view);
        this._contentStrategy.preApply(view);
    },

    /**
     * 应用该策略的方法
     * 返回值 {scale: [scaleX, scaleY], viewport: {cc.Rect}}
     * 目标view可以自适应这些值，且不愿直接修改其私有变量
     * @param {cc.view} view 目标view
     * @param {cc.Size} designedResolution 用户定义的设计分辨率
     * @return {object}  一个包含X/Y缩放值和视图矩形的对象
     */
    apply: function (view, designedResolution) {
        this._containerStrategy.apply(view, designedResolution);
        return this._contentStrategy.apply(view, designedResolution);
    },

    /**
     * 在应用该策略后处理
     * @param {cc.view} view 目标视图
     */
    postApply: function (view) {
        this._containerStrategy.postApply(view);
        this._contentStrategy.postApply(view);
    },

    /**
     * 设置容器的缩放策略
     * @param {cc.ContainerStrategy} containerStg
     */
    setContainerStrategy: function (containerStg) {
        if (containerStg instanceof cc.ContainerStrategy)
            this._containerStrategy = containerStg;
    },

    /**
     * 设置内容的缩放策略
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
 * 整个应用程序在指定区域中可见，没有试图保持原始宽高比<br/>
 * 会发生变形，并且该应用程序可能会出现拉伸或压缩
 */
cc.ResolutionPolicy.EXACT_FIT = 0;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name NO_BORDER
 * @constant
 * @type Number
 * @static
 * 整个应用程序填满指定区域，不发生扭曲，但有可能会进行一些裁切，同时保持应用程序的原始宽高比。<br/>
 */
cc.ResolutionPolicy.NO_BORDER = 1;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name SHOW_ALL
 * @constant
 * @type Number
 * @static
 * 整个应用程序在指定区域可见，没有失真同时保持原始比例适配应用。在应用的两侧可能会出现黑边。<br/>
 */
cc.ResolutionPolicy.SHOW_ALL = 2;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name FIXED_HEIGHT
 * @constant
 * @type Number
 * @static
 * 应用程序采用设计分辨率大小的高，同时修改内部canvas的宽，使其适配设备的长宽比不会失真，但是你必须确保你的应用程序在不同宽高比下工作<br/>
 */
cc.ResolutionPolicy.FIXED_HEIGHT = 3;

/**
 * @memberOf cc.ResolutionPolicy#
 * @name FIXED_WIDTH
 * @constant
 * @type Number
 * @static
 * 应用程序采用设计分辨率大小的宽，同时修改内部canvas的高，使其适配设备的长宽比不会失真，但是你必须确保你的应用程序在不同宽高比下工作<br/>
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
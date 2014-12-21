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

//CONSTANTS:

/**
 * 水平居中，垂直居中。
 * @constant
 * @type Number
 */
cc.ALIGN_CENTER = 0x33;

/**
 * 水平居中，垂直居上。
 * @constant
 * @type Number
 */
cc.ALIGN_TOP = 0x13;

/**
 * 水平居右，垂直居上。
 * @constant
 * @type Number
 */
cc.ALIGN_TOP_RIGHT = 0x12;

/**
 * 水平居右，垂直居中。
 * @constant
 * @type Number
 */
cc.ALIGN_RIGHT = 0x32;

/**
 * 水平居右，垂直居底。
 * @constant
 * @type Number
 */
cc.ALIGN_BOTTOM_RIGHT = 0x22;

/**
 * 水平居中，垂直居底。
 * @constant
 * @type Number
 */
cc.ALIGN_BOTTOM = 0x23;

/**
 * 水平居左，垂直居底。
 * @constant
 * @type Number
 */
cc.ALIGN_BOTTOM_LEFT = 0x21;

/**
 * 水平居左，垂直居中。
 * @constant
 * @type Number
 */
cc.ALIGN_LEFT = 0x31;

/**
 * 水平居左，垂直居上。
 * @constant
 * @type Number
 */
cc.ALIGN_TOP_LEFT = 0x11;
//----------------------Possible texture pixel formats----------------------------


// 默认 PVR 图片不预乘透明通道
cc.PVRHaveAlphaPremultiplied_ = false;

//cc.Texture2DWebGL move to TextureWebGL.js

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {

    /**
     * <p>
     * 这个类可以很简单的从图片、文本或者raw数据创建OpenGL 或者Canvas 2D贴图。                                <br/>
     * 对象总是2倍尺寸。                                           <br/>
     * 贴图中实际的图片区域可能会比贴图尺寸小，这取决于你怎么创建cc.Texture2D对象<br/>
     *  i.e. "contentSize" != (pixelsWide, pixelsHigh) and (maxS, maxT) != (1.0, 1.0).                                           <br/>
     * 注意生成的贴图内容会上下颠倒！</p>
     * @name cc.Texture2D
     * @class
     * @extends cc.Class
     *
     * @property {WebGLTexture}     name            - <@readonly> WebGLTexture对象
     * @property {Number}           defaultPixelFormat - 默认像素格式
     * @property {Number}           pixelFormat     - <@readonly> 贴图像素格式
     * @property {Number}           pixelsWidth     - <@readonly> 宽（单位像素)
     * @property {Number}           pixelsHeight    - <@readonly> 高（单位像素）
     * @property {Number}           width           - 内容宽度（单位point）
     * @property {Number}           height          - 内容高度（单位point）
     * @property {cc.GLProgram}     shaderProgram   - 函数drawAtPoint, drawInRect使用的着色器程序
     * @property {Number}           maxS            - Texture max S
     * @property {Number}           maxT            - Texture max T
     */
    cc.Texture2D = cc.Class.extend(/** @lends cc.Texture2D# */{
        _contentSize: null,
        _isLoaded: false,
        _htmlElementObj: null,

        url: null,

        _pattern: null,

        ctor: function () {
            this._contentSize = cc.size(0, 0);
            this._isLoaded = false;
            this._htmlElementObj = null;
            this._pattern = "";
        },

        /**
         * 获取宽（单位像素)
         * @return {Number}
         */
        getPixelsWide: function () {
            return this._contentSize.width;
        },

        /**
         * 获取高（单位像素）
         * @return {Number}
         */
        getPixelsHigh: function () {
            return this._contentSize.height;
        },

        /**
         * 获取内容大小
         * @returns {cc.Size}
         */
        getContentSize: function () {
            var locScaleFactor = cc.contentScaleFactor();
            return cc.size(this._contentSize.width / locScaleFactor, this._contentSize.height / locScaleFactor);
        },

        _getWidth: function () {
            return this._contentSize.width / cc.contentScaleFactor();
        },
        _getHeight: function () {
            return this._contentSize.height / cc.contentScaleFactor();
        },

        /**
         * 获取内容大小（单位像素）
         * @returns {cc.Size}
         */
        getContentSizeInPixels: function () {
            return this._contentSize;
        },

        /**
         * 用HTML 元素初始化
         * @param {HTMLImageElement|HTMLCanvasElement} element
         */
        initWithElement: function (element) {
            if (!element)
                return;
            this._htmlElementObj = element;
        },

        /**
         * 获取HTMLElement 对象
         * @return {HTMLImageElement|HTMLCanvasElement}
         */
        getHtmlElementObj: function () {
            return this._htmlElementObj;
        },

        /**
         * 检查贴图是否加载完成
         * @returns {boolean}
         */
        isLoaded: function () {
            return this._isLoaded;
        },

        /**
         * 处理加载的贴图
         */
        handleLoadedTexture: function () {
            var self = this;
            if (self._isLoaded) return;
            if (!self._htmlElementObj) {
                var img = cc.loader.getRes(self.url);
                if (!img) return;
                self.initWithElement(img);
            }

            self._isLoaded = true;
            var locElement = self._htmlElementObj;
            self._contentSize.width = locElement.width;
            self._contentSize.height = locElement.height;

            //向监听者分发加载事件
            self.dispatchEvent("load");
        },

        /**
         * cc.Texture2D的描述
         * @returns {string}
         */
        description: function () {
            return "<cc.Texture2D | width = " + this._contentSize.width + " height " + this._contentSize.height + ">";
        },

        initWithData: function (data, pixelFormat, pixelsWide, pixelsHigh, contentSize) {
            //只支持WebGL渲染模式
            return false;
        },

        initWithImage: function (uiImage) {
            //只支持WebGL渲染模式
            return false;
        },

        initWithString: function (text, fontName, fontSize, dimensions, hAlignment, vAlignment) {
            //只支持WebGL渲染模式
            return false;
        },

        releaseTexture: function () {
            //只支持WebGL渲染模式
        },

        getName: function () {
            //只支持WebGL渲染模式
            return null;
        },

        getMaxS: function () {
            //只支持WebGL渲染模式
            return 1;
        },

        setMaxS: function (maxS) {
            //只支持WebGL渲染模式
        },

        getMaxT: function () {
            return 1;
        },

        setMaxT: function (maxT) {
            //只支持WebGL渲染模式
        },

        getPixelFormat: function () {
            //只支持WebGL渲染模式
            return null;
        },

        getShaderProgram: function () {
            //只支持WebGL渲染模式
            return null;
        },

        setShaderProgram: function (shaderProgram) {
            //只支持WebGL渲染模式
        },

        hasPremultipliedAlpha: function () {
            //只支持WebGL渲染模式
            return false;
        },

        hasMipmaps: function () {
            //只支持WebGL渲染模式
            return false;
        },

        releaseData: function (data) {
            //只支持WebGL渲染模式
            data = null;
        },

        keepData: function (data, length) {
            //只支持WebGL渲染模式
            return data;
        },

        drawAtPoint: function (point) {
            //只支持WebGL渲染模式
        },

        drawInRect: function (rect) {
            //只支持WebGL渲染模式
        },

        /**
         * init with ETC file
         * @warning 在HTML5不支持
         */
        initWithETCFile: function (file) {
            cc.log(cc._LogInfos.Texture2D_initWithETCFile);
            return false;
        },

        /**
         * init with PVR file
         * @warning 在HTML5不支持
         */
        initWithPVRFile: function (file) {
            cc.log(cc._LogInfos.Texture2D_initWithPVRFile);
            return false;
        },

        /**
         * init with PVRTC data
         * @warning 在HTML5不支持
         */
        initWithPVRTCData: function (data, level, bpp, hasAlpha, length, pixelFormat) {
            cc.log(cc._LogInfos.Texture2D_initWithPVRTCData);
            return false;
        },

        setTexParameters: function (texParams, magFilter, wrapS, wrapT) {
            if(magFilter !== undefined)
                texParams = {minFilter: texParams, magFilter: magFilter, wrapS: wrapS, wrapT: wrapT};

            if(texParams.wrapS === cc.REPEAT && texParams.wrapT === cc.REPEAT){
                this._pattern = "repeat";
                return;
            }

            if(texParams.wrapS === cc.REPEAT ){
                this._pattern = "repeat-x";
                return;
            }

            if(texParams.wrapT === cc.REPEAT){
                this._pattern = "repeat-y";
                return;
            }

            this._pattern = "";
        },

        setAntiAliasTexParameters: function () {
            //只支持WebGL渲染模式
        },

        setAliasTexParameters: function () {
            //只支持WebGL渲染模式
        },

        generateMipmap: function () {
            //只支持WebGL渲染模式
        },

        stringForFormat: function () {
            //只支持WebGL渲染模式
            return "";
        },

        bitsPerPixelForFormat: function (format) {
            //只支持WebGL渲染模式
            return -1;
        },

        /**
         * 对加载事件添加监听
         * @param {Function} callback
         * @param {cc.Node} target
         * @deprecated 3.1开始弃用，请使用addEventListener接口
         */
        addLoadedEventListener: function (callback, target) {
            this.addEventListener("load", callback, target);
        },

        /**
         * 目标移除监听
         * @param {cc.Node} target
         * @deprecated since 3.1, please use addEventListener instead
         */
        removeLoadedEventListener: function (target) {
            this.removeEventListener("load", target);
        }
    });

} else {
    cc.assert(cc.isFunction(cc._tmp.WebGLTexture2D), cc._LogInfos.MissingFile, "TexturesWebGL.js");
    cc._tmp.WebGLTexture2D();
    delete cc._tmp.WebGLTexture2D;
}

cc.EventHelper.prototype.apply(cc.Texture2D.prototype);

cc.assert(cc.isFunction(cc._tmp.PrototypeTexture2D), cc._LogInfos.MissingFile, "TexturesPropertyDefine.js");
cc._tmp.PrototypeTexture2D();
delete cc._tmp.PrototypeTexture2D;

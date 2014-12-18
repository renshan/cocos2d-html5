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
 *
 * <p>cc.AtlasNode是cc.Node的子类,cc.AtlasNode可以用来渲染一个TextureAtlas对象</p>
 *
 * <p>如果你想要渲染一个TextureAtlas 可以考虑继承cc.AtlasNode(或者cc.AtlasNode的子类)</p>
 *
 * <p>所有继承自cc.Node的功能都是可用的</p>
 *
 * <p>你可以使用一个Atlas文件,item的宽、高跟items数量来进行绘制</p>
 *
 * @class
 * @extends cc.Node
 *
 * @param {String} tile
 * @param {Number} tileWidth
 * @param {Number} tileHeight
 * @param {Number} itemsToRender
 * @example
 * var node = new cc.AtlasNode("pathOfTile", 16, 16, 1);
 *
 * @property {cc.Texture2D}     texture         - 当前使用的纹理
 * @property {cc.TextureAtlas}  textureAtlas    - cc.AtlasNode的texture atlas	
 * @property {Number}           quadsToDraw     - 要绘制的四边形的数量
 * 
 */
cc.AtlasNode = cc.Node.extend(/** @lends cc.AtlasNode# */{
    textureAtlas: null,
    quadsToDraw: 0,

    //! chars per row
    //! 每行字符数
    _itemsPerRow: 0,
    //! chars per column
    //! 每列字符数
    _itemsPerColumn: 0,
    //! width of each char
    //! 每个字符的宽
    _itemWidth: 0,
    //! height of each char
    //! 每个字符的高
    _itemHeight: 0,

    _colorUnmodified: null,

    // 协议是否可用
    _opacityModifyRGB: false,
    _blendFunc: null,

    // 该值只用于CCLabelAtlas FPS的显示.所以plz不用修改该值
    _ignoreContentScaleFactor: false,
    _className: "AtlasNode",

    /**
     * <p>构造函数,重写它进行继承父类中的构造动作,在"ctor"函数中记得调用"this._super()"进行继承</p>
     * @param {String} tile
     * @param {Number} tileWidth
     * @param {Number} tileHeight
     * @param {Number} itemsToRender
     */
    ctor: function (tile, tileWidth, tileHeight, itemsToRender) {
        cc.Node.prototype.ctor.call(this);
        this._colorUnmodified = cc.color.WHITE;
        this._blendFunc = {src: cc.BLEND_SRC, dst: cc.BLEND_DST};
        this._ignoreContentScaleFactor = false;

        itemsToRender !== undefined && this.initWithTileFile(tile, tileWidth, tileHeight, itemsToRender);
    },

    _initRendererCmd: function () {
        if(cc._renderType === cc._RENDER_TYPE_WEBGL)
            this._rendererCmd = new cc.AtlasNodeRenderCmdWebGL(this);
    },

    /**
     * 更新Atlas(顶点索引数组).
     * 清空实现方法,需要被子类重写
     * @function
     */
    updateAtlasValues: function () {
        cc.log(cc._LogInfos.AtlasNode_updateAtlasValues);
    },

    /**
     * 获取atlas节点的颜色值
     * @function
     * @return {cc.Color}
     */
    getColor: function () {
        if (this._opacityModifyRGB)
            return this._colorUnmodified;
        return cc.Node.prototype.getColor.call(this);
    },

    /**
     * 设置颜色值是否要跟着不透明度进行改变,
     * 如果为true,节点的颜色会因不透明度值的改变而改变.
     * @function
     * @param {Boolean} value
     */
    setOpacityModifyRGB: function (value) {
        var oldColor = this.color;
        this._opacityModifyRGB = value;
        this.color = oldColor;
    },

    /**
     * 获取颜色值是否会因不透明度值的改变而改变
     * @function
     * @return {Boolean}
     */
    isOpacityModifyRGB: function () {
        return this._opacityModifyRGB;
    },

    /**
     * 获取节点的混合函数
     * @function
     * @return {cc.BlendFunc}
     */
    getBlendFunc: function () {
        return this._blendFunc;
    },

    /**
     * 设置节点的混合函数
     * 该函数接受一个混合函数对象或者一个源跟目标值
     * @function
     * @param {Number | cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc: function (src, dst) {
        if (dst === undefined)
            this._blendFunc = src;
        else
            this._blendFunc = {src: src, dst: dst};
    },

    /**
     * 设置atlas纹理
     * @function
     * @param {cc.TextureAtlas} 纹理的值
     */
    setTextureAtlas: function (value) {
        this.textureAtlas = value;
    },

    /**
     * 获取atlas纹理
     * @function
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas: function () {
        return this.textureAtlas;
    },

    /**
     * 获取渲染的四边形的数量
     * @function
     * @return {Number}
     */
    getQuadsToDraw: function () {
        return this.quadsToDraw;
    },

    /**
     * 设置要进行渲染的四边形的数量
     * @function
     * @param {Number} quadsToDraw
     */
    setQuadsToDraw: function (quadsToDraw) {
        this.quadsToDraw = quadsToDraw;
    },

    _textureForCanvas: null,
    _originalTexture: null,

    _uniformColor: null,
    _colorF32Array: null,

    /**
     * 用Atlas文件初始化cc.AtlasNode对象,并设置宽、高、itmes数量 
     * @function
     * @param {String} tile             atlas纹理的文件名
     * @param {Number} tileWidth        每个瓦片的宽度
     * @param {Number} tileHeight       每个瓦片的高度
     * @param {Number} itemsToRender    要渲染的瓦片数量
     * 
     * @return {Boolean}
     */
    initWithTileFile: function (tile, tileWidth, tileHeight, itemsToRender) {
        if (!tile)
            throw "cc.AtlasNode.initWithTileFile(): title should not be null";
        var texture = cc.textureCache.addImage(tile);
        return this.initWithTexture(texture, tileWidth, tileHeight, itemsToRender);
    },

    /**
     * 用atlas纹理初始化AtlasNode,并设置宽、高、itmes数量 
     * @function
     * @param {cc.Texture2D} texture    atlas纹理
     * @param {Number} tileWidth        每个瓦片的宽度
     * @param {Number} tileHeight       每个瓦片的高度
     * @param {Number} itemsToRender    要渲染的瓦片数量
     * @return {Boolean}
     */
    initWithTexture: null,

    _initWithTextureForCanvas: function (texture, tileWidth, tileHeight, itemsToRender) {
        this._itemWidth = tileWidth;
        this._itemHeight = tileHeight;

        this._opacityModifyRGB = true;
        this._originalTexture = texture;
        if (!this._originalTexture) {
            cc.log(cc._LogInfos.AtlasNode__initWithTexture);
            return false;
        }
        this._textureForCanvas = this._originalTexture;
        this._calculateMaxItems();

        this.quadsToDraw = itemsToRender;
        return true;
    },

    _initWithTextureForWebGL: function (texture, tileWidth, tileHeight, itemsToRender) {
        this._itemWidth = tileWidth;
        this._itemHeight = tileHeight;
        this._colorUnmodified = cc.color.WHITE;
        this._opacityModifyRGB = true;

        this._blendFunc.src = cc.BLEND_SRC;
        this._blendFunc.dst = cc.BLEND_DST;

        var locRealColor = this._realColor;
        this._colorF32Array = new Float32Array([locRealColor.r / 255.0, locRealColor.g / 255.0, locRealColor.b / 255.0, this._realOpacity / 255.0]);
        this.textureAtlas = new cc.TextureAtlas();
        this.textureAtlas.initWithTexture(texture, itemsToRender);

        if (!this.textureAtlas) {
            cc.log(cc._LogInfos.AtlasNode__initWithTexture);
            return false;
        }

        this._updateBlendFunc();
        this._updateOpacityModifyRGB();
        this._calculateMaxItems();
        this.quadsToDraw = itemsToRender;

        //shader stuff
        this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURE_UCOLOR);
        this._uniformColor = cc._renderContext.getUniformLocation(this.shaderProgram.getProgram(), "u_color");
        return true;
    },

    /**
     * 使用canvas 2d上下文或者WebGL上下文渲染函数,仅供内部使用,请不要调用该函数
     * @function
     * @param {CanvasRenderingContext2D | WebGLRenderingContext} ctx 渲染上下文
     */
    draw: null,

    _drawForWebGL: function (ctx) {
        var context = ctx || cc._renderContext;
        cc.nodeDrawSetup(this);
        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);
        if(this._uniformColor && this._colorF32Array){
            context.uniform4fv(this._uniformColor, this._colorF32Array);
            this.textureAtlas.drawNumberOfQuads(this.quadsToDraw, 0);
        }
    },

    /**
     * 设置节点的颜色
     * @function
     * @param {cc.Color} color 使用cc.color(r, g, b)创建的颜色对象.
     */
    setColor: null,

    _setColorForCanvas: function (color3) {
        var locRealColor = this._realColor;
        if ((locRealColor.r == color3.r) && (locRealColor.g == color3.g) && (locRealColor.b == color3.b))
            return;
        var temp = cc.color(color3.r, color3.g, color3.b);
        this._colorUnmodified = color3;

        if (this._opacityModifyRGB) {
            var locDisplayedOpacity = this._displayedOpacity;
            temp.r = temp.r * locDisplayedOpacity / 255;
            temp.g = temp.g * locDisplayedOpacity / 255;
            temp.b = temp.b * locDisplayedOpacity / 255;
        }
//        cc.Node.prototype.setColor.call(this, color3);
        this._changeTextureColor();
    },

    _changeTextureColor: function(){
        var locTexture = this.getTexture();
        if (locTexture && this._originalTexture) {
            var element = this._originalTexture.getHtmlElementObj();
            if(!element)
                return;
            var locElement = locTexture.getHtmlElementObj();
            var textureRect = cc.rect(0, 0, element.width, element.height);
            if (locElement instanceof HTMLCanvasElement)
                cc.generateTintImageWithMultiply(element, this._colorUnmodified, textureRect, locElement);
            else {
                locElement = cc.generateTintImageWithMultiply(element, this._colorUnmodified, textureRect);
                locTexture = new cc.Texture2D();
                locTexture.initWithElement(locElement);
                locTexture.handleLoadedTexture();
                this.setTexture(locTexture);
            }
        }
    },

    _setColorForWebGL: function (color3) {
        var temp = cc.color(color3.r, color3.g, color3.b);
        this._colorUnmodified = color3;
        var locDisplayedOpacity = this._displayedOpacity;
        if (this._opacityModifyRGB) {
            temp.r = temp.r * locDisplayedOpacity / 255;
            temp.g = temp.g * locDisplayedOpacity / 255;
            temp.b = temp.b * locDisplayedOpacity / 255;
        }
        cc.Node.prototype.setColor.call(this, color3);
        var locDisplayedColor = this._displayedColor;
        this._colorF32Array = new Float32Array([locDisplayedColor.r / 255.0, locDisplayedColor.g / 255.0,
            locDisplayedColor.b / 255.0, locDisplayedOpacity / 255.0]);
    },

    /**
     * 设置节点的透明度
     * @function
     * @param {Number} opacity 透明度的值
     */
    setOpacity: function (opacity) {
    },

    _setOpacityForCanvas: function (opacity) {
        cc.Node.prototype.setOpacity.call(this, opacity);
        // 左乘纹理的特殊不透明度
        if (this._opacityModifyRGB) {
            this.color = this._colorUnmodified;
        }
    },

    _setOpacityForWebGL: function (opacity) {
        cc.Node.prototype.setOpacity.call(this, opacity);
        // 左乘纹理的特殊不透明度
        if (this._opacityModifyRGB) {
            this.color = this._colorUnmodified;
        } else {
            var locDisplayedColor = this._displayedColor;
            this._colorF32Array = new Float32Array([locDisplayedColor.r / 255.0, locDisplayedColor.g / 255.0,
                locDisplayedColor.b / 255.0, this._displayedOpacity / 255.0]);
        }
    },

    /**
     * 获取当前纹理
     * @function
     * @return {cc.Texture2D}
     */
    getTexture: null,

    _getTextureForCanvas: function () {
        return  this._textureForCanvas;
    },

    _getTextureForWebGL: function () {
        return  this.textureAtlas.texture;
    },

    /**
     * 使用新纹理替换当前纹理
     * @function
     * @param {cc.Texture2D} texture    新的纹理
     */
    setTexture: null,

    _setTextureForCanvas: function (texture) {
        this._textureForCanvas = texture;
    },

    _setTextureForWebGL: function (texture) {
        this.textureAtlas.texture = texture;
        this._updateBlendFunc();
        this._updateOpacityModifyRGB();
    },

    _calculateMaxItems: null,

    _calculateMaxItemsForCanvas: function () {
        var selTexture = this.texture;
        var size = selTexture.getContentSize();

        this._itemsPerColumn = 0 | (size.height / this._itemHeight);
        this._itemsPerRow = 0 | (size.width / this._itemWidth);
    },

    _calculateMaxItemsForWebGL: function () {
        var selTexture = this.texture;
        var size = selTexture.getContentSize();
        if (this._ignoreContentScaleFactor)
            size = selTexture.getContentSizeInPixels();

        this._itemsPerColumn = 0 | (size.height / this._itemHeight);
        this._itemsPerRow = 0 | (size.width / this._itemWidth);
    },

    _updateBlendFunc: function () {
        if (!this.textureAtlas.texture.hasPremultipliedAlpha()) {
            this._blendFunc.src = cc.SRC_ALPHA;
            this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        }
    },

    _updateOpacityModifyRGB: function () {
        this._opacityModifyRGB = this.textureAtlas.texture.hasPremultipliedAlpha();
    },

    _setIgnoreContentScaleFactor: function (ignoreContentScaleFactor) {
        this._ignoreContentScaleFactor = ignoreContentScaleFactor;
    }
});

var _p = cc.AtlasNode.prototype;
if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
    _p.initWithTexture = _p._initWithTextureForWebGL;
    _p.draw = _p._drawForWebGL;
    _p.setColor = _p._setColorForWebGL;
    _p.setOpacity = _p._setOpacityForWebGL;
    _p.getTexture = _p._getTextureForWebGL;
    _p.setTexture = _p._setTextureForWebGL;
    _p._calculateMaxItems = _p._calculateMaxItemsForWebGL;
} else {
    _p.initWithTexture = _p._initWithTextureForCanvas;
    _p.draw = cc.Node.prototype.draw;
    _p.setColor = _p._setColorForCanvas;
    _p.setOpacity = _p._setOpacityForCanvas;
    _p.getTexture = _p._getTextureForCanvas;
    _p.setTexture = _p._setTextureForCanvas;
    _p._calculateMaxItems = _p._calculateMaxItemsForCanvas;
    if(!cc.sys._supportCanvasNewBlendModes)
        _p._changeTextureColor = function(){
            var locElement, locTexture = this.getTexture();
            if (locTexture && this._originalTexture) {
                locElement = locTexture.getHtmlElementObj();
                if (!locElement)
                    return;
                var element = this._originalTexture.getHtmlElementObj();
                var cacheTextureForColor = cc.textureCache.getTextureColors(element);
                if (cacheTextureForColor) {
                    var textureRect = cc.rect(0, 0, element.width, element.height);
                    if (locElement instanceof HTMLCanvasElement)
                        cc.generateTintImage(locElement, cacheTextureForColor, this._displayedColor, textureRect, locElement);
                    else {
                        locElement = cc.generateTintImage(locElement, cacheTextureForColor, this._displayedColor, textureRect);
                        locTexture = new cc.Texture2D();
                        locTexture.initWithElement(locElement);
                        locTexture.handleLoadedTexture();
                        this.setTexture(locTexture);
                    }
                }
            }
        };
}

// 重写属性
cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);
cc.defineGetterSetter(_p, "color", _p.getColor, _p.setColor);

// 扩展属性
/** @expose */
_p.texture;
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);
/** @expose */
_p.textureAtlas;
/** @expose */
_p.quadsToDraw;


/**
 * 从Atlas文件创建一个cc.AtlasNode,并设置它的宽、高以及itmes数量
 * @deprecated 																													v3.0版本后弃用,请使用新的构造器代替
 * @function
 * @static
 * @param {String} tile
 * @param {Number} tileWidth
 * @param {Number} tileHeight
 * @param {Number} itemsToRender
 * @return {cc.AtlasNode}
 */
cc.AtlasNode.create = function (tile, tileWidth, tileHeight, itemsToRender) {
    return new cc.AtlasNode(tile, tileWidth, tileHeight, itemsToRender);
};


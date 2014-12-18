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
 * cc.LabelTTF是cc.TextureNode的子类，此类可以使用系统字体或者指定的ttf字体文件在游戏中显示文本
 * 所有cc.Sprite的特性都可以在cc.LabelTTF中使用
 * cc.LabelTTF对象在使用js-binding方式编译的移动设备app上运行比较缓慢，可以考虑使用cc.LabelAtlas或者cc.LabelBMFont来代替
 * 你在创建cc.LabelTTF的时候可以指定字体名称、字体对齐方式、字体尺寸和字体大小，或者使用cc.FontDefinition对象来创建
 * @class
 * @extends cc.Sprite
 *
 * @param {String} text
 * @param {String|cc.FontDefinition} [fontName="Arial"]
 * @param {Number} [fontSize=16]
 * @param {cc.Size} [dimensions=cc.size(0,0)]
 * @param {Number} [hAlignment=cc.TEXT_ALIGNMENT_LEFT]
 * @param {Number} [vAlignment=cc.VERTICAL_TEXT_ALIGNMENT_TOP]
 * @example
 * var myLabel = new cc.LabelTTF('label text',  'Times New Roman', 32, cc.size(320,32), cc.TEXT_ALIGNMENT_LEFT);
 *
 * var fontDef = new cc.FontDefinition();
 * fontDef.fontName = "Arial";
 * fontDef.fontSize = "32";
 * var myLabel = new cc.LabelTTF('label text',  fontDef);
 *
 * @property {String}       string          - 标签的内容
 * @property {Number}       textAlign       - 标签水平对齐可以传入：cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT
 * @property {Number}       verticalAlign   - 标签垂直对齐可以传入：cc.VERTICAL_TEXT_ALIGNMENT_TOP|cc.VERTICAL_TEXT_ALIGNMENT_CENTER|cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM
 * @property {Number}       fontSize        - 标签的字体大小
 * @property {String}       fontName        - 标签名称
 * @property {String}       font            - 可以用样式字符串表示标签的字体，例如"18px Verdan"
 * @property {Number}       boundingWidth   - 绑定区域标签的宽度，实际的标签内容宽度最大不能超过boundingWidth
 * @property {Number}       boundingHeight  - 绑定区域标签的高度，实际的标签内容高度最大不能超过boundingHeight
 * @property {cc.Color}     fillStyle       -  填充的颜色
 * @property {cc.Color}     strokeStyle     -  描边颜色
 * @property {Number}       lineWidth       -  描边的宽度
 * @property {Number}       shadowOffsetX   - 阴影的x轴偏移
 * @property {Number}       shadowOffsetY   - 阴影的y轴偏移
 * @property {Number}       shadowOpacity   - 阴影的y轴偏移
 * @property {Number}       shadowBlur      - 阴影的模糊大小
 */
cc.LabelTTF = cc.Sprite.extend(/** @lends cc.LabelTTF# */{
    _dimensions: null,
    _hAlignment: cc.TEXT_ALIGNMENT_CENTER,
    _vAlignment: cc.VERTICAL_TEXT_ALIGNMENT_TOP,
    _fontName: null,
    _fontSize: 0.0,
    _string: "",
    _originalText: null,
    _isMultiLine: false,
    _fontStyleStr: null,

    //字体阴影属性
    _shadowEnabled: false,
    _shadowOffset: null,
    _shadowOpacity: 0,
    _shadowBlur: 0,
    _shadowColorStr: null,
    _shadowColor: null,

    // 字体描边属性
    _strokeEnabled: false,
    _strokeColor: null,
    _strokeSize: 0,
    _strokeColorStr: null,

    //字体色彩属性
    _textFillColor: null,
    _fillColorStr: null,

    _strokeShadowOffsetX: 0,
    _strokeShadowOffsetY: 0,
    _needUpdateTexture: false,

    _labelCanvas: null,
    _labelContext: null,
    _lineWidths: null,
    _className: "LabelTTF",

    _lineHeight: 0,

    /**
     * 使用字体名称、对齐方式、字体尺寸和字体大小初始化cc.LabelTTF，请不要直接使用此函数初始化，
     * 应当在cc.LabelTTF的构造函数中使用正确的参数来初始化cc.LabelTTF
     * @param {String} label string
     * @param {String} fontName
     * @param {Number} fontSize
     * @param {cc.Size} [dimensions=]
     * @param {Number} [hAlignment=]
     * @param {Number} [vAlignment=]
     * @return {Boolean} return false on error
     */
    initWithString: function (label, fontName, fontSize, dimensions, hAlignment, vAlignment) {
        var strInfo;
        if (label)
            strInfo = label + "";
        else
            strInfo = "";

        fontSize = fontSize || 16;
        dimensions = dimensions || cc.size(0, 0/*fontSize*/);
        hAlignment = hAlignment || cc.TEXT_ALIGNMENT_LEFT;
        vAlignment = vAlignment || cc.VERTICAL_TEXT_ALIGNMENT_TOP;

        this._opacityModifyRGB = false;
        this._dimensions = cc.size(dimensions.width, dimensions.height);
        this._fontName = fontName || "Arial";
        this._hAlignment = hAlignment;
        this._vAlignment = vAlignment;

        //this._fontSize = (cc._renderType === cc._RENDER_TYPE_CANVAS) ? fontSize : fontSize * cc.contentScaleFactor();
        this._fontSize = fontSize;
        this._fontStyleStr = this._fontSize + "px '" + fontName + "'";
        this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(fontName, this._fontSize);
        this.string = strInfo;
        this._setColorsString();
        this._updateTexture();
        this._setUpdateTextureDirty();
        return true;
    },

    _setUpdateTextureDirty: function(){
        this._renderCmdDiry = this._needUpdateTexture = true;
        cc.renderer.pushDirtyNode(this);
    },

    ctor: function (text, fontName, fontSize, dimensions, hAlignment, vAlignment) {
        cc.Sprite.prototype.ctor.call(this);

        this._dimensions = cc.size(0, 0);
        this._hAlignment = cc.TEXT_ALIGNMENT_LEFT;
        this._vAlignment = cc.VERTICAL_TEXT_ALIGNMENT_TOP;
        this._opacityModifyRGB = false;
        this._fontStyleStr = "";
        this._fontName = "Arial";
        this._isMultiLine = false;

        this._shadowEnabled = false;
        this._shadowOffset = cc.p(0, 0);
        this._shadowOpacity = 0;
        this._shadowBlur = 0;
        this._shadowColorStr = "rgba(128, 128, 128, 0.5)";

        this._strokeEnabled = false;
        this._strokeColor = cc.color(255, 255, 255, 255);
        this._strokeSize = 0;
        this._strokeColorStr = "";

        this._textFillColor = cc.color(255, 255, 255, 255);
        this._fillColorStr = "rgba(255,255,255,1)";
        this._strokeShadowOffsetX = 0;
        this._strokeShadowOffsetY = 0;
        this._needUpdateTexture = false;

        this._lineWidths = [];

        this._setColorsString();

        if (fontName && fontName instanceof cc.FontDefinition) {
            this.initWithStringAndTextDefinition(text, fontName);
        } else {
            cc.LabelTTF.prototype.initWithString.call(this, text, fontName, fontSize, dimensions, hAlignment, vAlignment);
        }
    },

    init: function () {
        return this.initWithString(" ", this._fontName, this._fontSize);
    },

    _measureConfig: function () {
        this._getLabelContext().font = this._fontStyleStr;
    },
    _measure: function (text) {
        return this._getLabelContext().measureText(text).width;
    },

    description: function () {
        return "<cc.LabelTTF | FontName =" + this._fontName + " FontSize = " + this._fontSize.toFixed(1) + ">";
    },

    setColor: null,

    _setColorsString: null,

    updateDisplayedColor: null,

    setOpacity: null,

    updateDisplayedOpacity: null,

    updateDisplayedOpacityForCanvas: function (parentOpacity) {
        cc.Node.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this._setColorsString();
    },

    getLineHeight: function(){
        return this._lineHeight || this._fontClientHeight;
    },

    setLineHeight: function(lineHeight){
        this._lineHeight = lineHeight;
    },

    /**
     * 返回标签的文本字符串
     * @return {String}
     */
    getString: function () {
        return this._string;
    },

    /**
     * 返回cc.LabelTTF的垂直对齐方式
     * @return {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT}
     */
    getHorizontalAlignment: function () {
        return this._hAlignment;
    },

    /**
     * 返回cc.LabelTTF的垂直对齐方式
     * @return {cc.VERTICAL_TEXT_ALIGNMENT_TOP|cc.VERTICAL_TEXT_ALIGNMENT_CENTER|cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM}
     */
    getVerticalAlignment: function () {
        return this._vAlignment;
    },

    /**
     * 返回cc.LabelTTF的尺寸，这个尺寸是标签的最大尺寸，设置这个值将会在必要的时候自动改变线条
     * @see cc.LabelTTF#setDimensions, cc.LabelTTF#boundingWidth and cc.LabelTTF#boundingHeight
     * @return {cc.Size}
     */
    getDimensions: function () {
        return cc.size(this._dimensions);
    },

    /**
     * 返回cc.LabelTTF的字体大小
     * @return {Number}
     */
    getFontSize: function () {
        return this._fontSize;
    },

    /**
     *  返回cc.LabelTTF的字体名称
     * @return {String}
     */
    getFontName: function () {
        return this._fontName;
    },

    /**
     * 使用字体名称、对齐方式、字体尺寸和字体大小初始化cc.LabelTTF，请不要直接使用此函数初始化，
     * 应当在cc.LabelTTF的构造函数中使用正确的参数来初始化cc.LabelTTF
     * @param {String} text
     * @param {cc.FontDefinition} textDefinition
     * @return {Boolean}
     */
    initWithStringAndTextDefinition: null,

    /**
     * 设置此标签的文本属性
     * @param {cc.FontDefinition} theDefinition
     */
    setTextDefinition: function (theDefinition) {
        if (theDefinition)
            this._updateWithTextDefinition(theDefinition, true);
    },

    /**
     * 获取此标签的文本属性
     * @return {cc.FontDefinition}
     */
    getTextDefinition: function () {
        return this._prepareTextDefinition(false);
    },

    /**
     * 开启或者关闭标签阴影
     * @param {cc.Color | Number} a 阴影的颜色或者是x轴偏移
     * @param {cc.Size | Number} b 阴影的尺寸或者是y轴偏移
     * @param {Number} c 阴影的模糊大小或者是阴影的透明度（值从0到1）
     * @param {null | Number} d 空值或者是阴影的模糊大小
     * @示例
     *   old:
     *     labelttf.enableShadow(shadowOffsetX, shadowOffsetY, shadowOpacity, shadowBlur);
     *   new:
     *     labelttf.enableShadow(shadowColor, offset, blurRadius);
     */
    enableShadow: function (a, b, c, d) {
        if(a.r != null && a.g != null && a.b != null && a.a != null){
            this._enableShadow(a, b, c);
        }else{
            this._enableShadowNoneColor(a, b, c, d)
        }
    },

    _enableShadowNoneColor: function(shadowOffsetX, shadowOffsetY, shadowOpacity, shadowBlur){
        shadowOpacity = shadowOpacity || 0.5;
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        var locShadowOffset = this._shadowOffset;
        if (locShadowOffset && (locShadowOffset.x != shadowOffsetX) || (locShadowOffset._y != shadowOffsetY)) {
            locShadowOffset.x = shadowOffsetX;
            locShadowOffset.y = shadowOffsetY;
        }

        if (this._shadowOpacity != shadowOpacity) {
            this._shadowOpacity = shadowOpacity;
        }
        this._setColorsString();

        if (this._shadowBlur != shadowBlur)
            this._shadowBlur = shadowBlur;
        this._setUpdateTextureDirty();
    },

    _enableShadow: function(shadowColor, offset, blurRadius){

        if(!this._shadowColor){
            this._shadowColor = cc.color(255, 255, 255, 128);
        }
        this._shadowColor.r = shadowColor.r;
        this._shadowColor.g = shadowColor.g;
        this._shadowColor.b = shadowColor.b;

        var x, y, a, b;
        x = offset.width || offset.x || 0;
        y = offset.height || offset.y || 0;
        a = (shadowColor.a != null) ? (shadowColor.a / 255) : 0.5;
        b = blurRadius;

        this._enableShadowNoneColor(x, y, a, b);
    },

    _getShadowOffsetX: function () {
        return this._shadowOffset.x;
    },
    _setShadowOffsetX: function (x) {
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        if (this._shadowOffset.x != x) {
            this._shadowOffset.x = x;
            this._setUpdateTextureDirty();
        }
    },

    _getShadowOffsetY: function () {
        return this._shadowOffset._y;
    },
    _setShadowOffsetY: function (y) {
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        if (this._shadowOffset._y != y) {
            this._shadowOffset._y = y;
            this._setUpdateTextureDirty();
        }
    },

    _getShadowOffset: function () {
        return cc.p(this._shadowOffset.x, this._shadowOffset.y);
    },
    _setShadowOffset: function (offset) {
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        if (this._shadowOffset.x != offset.x || this._shadowOffset.y != offset.y) {
            this._shadowOffset.x = offset.x;
            this._shadowOffset.y = offset.y;
            this._setUpdateTextureDirty();
        }
    },

    _getShadowOpacity: function () {
        return this._shadowOpacity;
    },
    _setShadowOpacity: function (shadowOpacity) {
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        if (this._shadowOpacity != shadowOpacity) {
            this._shadowOpacity = shadowOpacity;
            this._setColorsString();
            this._setUpdateTextureDirty();
        }
    },

    _getShadowBlur: function () {
        return this._shadowBlur;
    },
    _setShadowBlur: function (shadowBlur) {
        if (false === this._shadowEnabled)
            this._shadowEnabled = true;

        if (this._shadowBlur != shadowBlur) {
            this._shadowBlur = shadowBlur;
            this._setUpdateTextureDirty();
        }
    },

    /**
     * 关闭阴影渲染
     */
    disableShadow: function () {
        if (this._shadowEnabled) {
            this._shadowEnabled = false;
            this._setUpdateTextureDirty();
        }
    },

    /**
     * 启用标签描边，传入描边参数
     * @param {cc.Color} 描边的颜色
     * @param {Number} 描边的大小
     */
    enableStroke: function (strokeColor, strokeSize) {
        if (this._strokeEnabled === false)
            this._strokeEnabled = true;

        var locStrokeColor = this._strokeColor;
        if ((locStrokeColor.r !== strokeColor.r) || (locStrokeColor.g !== strokeColor.g) || (locStrokeColor.b !== strokeColor.b)) {
            locStrokeColor.r = strokeColor.r;
            locStrokeColor.g = strokeColor.g;
            locStrokeColor.b = strokeColor.b;
            this._setColorsString();
        }

        if (this._strokeSize !== strokeSize)
            this._strokeSize = strokeSize || 0;
        this._setUpdateTextureDirty();
    },

    _getStrokeStyle: function () {
        return this._strokeColor;
    },
    _setStrokeStyle: function (strokeStyle) {
        if (this._strokeEnabled === false)
            this._strokeEnabled = true;

        var locStrokeColor = this._strokeColor;
        if ((locStrokeColor.r !== strokeStyle.r) || (locStrokeColor.g !== strokeStyle.g) || (locStrokeColor.b !== strokeStyle.b)) {
            locStrokeColor.r = strokeStyle.r;
            locStrokeColor.g = strokeStyle.g;
            locStrokeColor.b = strokeStyle.b;
            this._setColorsString();
            this._setUpdateTextureDirty();
        }
    },

    _getLineWidth: function () {
        return this._strokeSize;
    },
    _setLineWidth: function (lineWidth) {
        if (this._strokeEnabled === false)
            this._strokeEnabled = true;
        if (this._strokeSize !== lineWidth) {
            this._strokeSize = lineWidth || 0;
            this._setUpdateTextureDirty();
        }
    },

    /**
     * 关闭标签的描边
     */
    disableStroke: function () {
        if (this._strokeEnabled) {
            this._strokeEnabled = false;
            this._setUpdateTextureDirty();
        }
    },

    /**
     * 设置文本的填充颜色
     * @function
     * @param {cc.Color} fillColor 文本的填充颜色
     */
    setFontFillColor: null,

    _getFillStyle: function () {
        return this._textFillColor;
    },

    // 设置这个标签的文本属性
    _updateWithTextDefinition: function (textDefinition, mustUpdateTexture) {
        if (textDefinition.fontDimensions) {
            this._dimensions.width = textDefinition.boundingWidth;
            this._dimensions.height = textDefinition.boundingHeight;
        } else {
            this._dimensions.width = 0;
            this._dimensions.height = 0;
        }

        this._hAlignment = textDefinition.textAlign;
        this._vAlignment = textDefinition.verticalAlign;

        this._fontName = textDefinition.fontName;
        this._fontSize = textDefinition.fontSize || 12;
        this._fontStyleStr = this._fontSize + "px '" + this._fontName + "'";
        this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName, this._fontSize);

        // 阴影
        if (textDefinition.shadowEnabled)
            this.enableShadow(textDefinition.shadowOffsetX,
                textDefinition.shadowOffsetY,
                textDefinition.shadowOpacity,
                textDefinition.shadowBlur);

        // 描边
        if (textDefinition.strokeEnabled)
            this.enableStroke(textDefinition.strokeStyle, textDefinition.lineWidth);

        // 填充颜色
        this.setFontFillColor(textDefinition.fillStyle);

        if (mustUpdateTexture)
            this._updateTexture();
    },

    _prepareTextDefinition: function (adjustForResolution) {
        var texDef = new cc.FontDefinition();

        if (adjustForResolution) {
            //texDef.fontSize = (cc._renderType === cc._RENDER_TYPE_CANVAS) ? this._fontSize : this._fontSize * cc.contentScaleFactor();
            texDef.fontSize = this._fontSize;
            texDef.boundingWidth = cc.contentScaleFactor() * this._dimensions.width;
            texDef.boundingHeight = cc.contentScaleFactor() * this._dimensions.height;
        } else {
            texDef.fontSize = this._fontSize;
            texDef.boundingWidth = this._dimensions.width;
            texDef.boundingHeight = this._dimensions.height;
        }

        texDef.fontName = this._fontName;
        texDef.textAlign = this._hAlignment;
        texDef.verticalAlign = this._vAlignment;

        // 描边
        if (this._strokeEnabled) {
            texDef.strokeEnabled = true;
            var locStrokeColor = this._strokeColor;
            texDef.strokeStyle = cc.color(locStrokeColor.r, locStrokeColor.g, locStrokeColor.b);
            texDef.lineWidth = this._strokeSize;
        } else
            texDef.strokeEnabled = false;

        // 阴影
        if (this._shadowEnabled) {
            texDef.shadowEnabled = true;
            texDef.shadowBlur = this._shadowBlur;
            texDef.shadowOpacity = this._shadowOpacity;

            texDef.shadowOffsetX = (adjustForResolution ? cc.contentScaleFactor() : 1) * this._shadowOffset.x;
            texDef.shadowOffsetY = (adjustForResolution ? cc.contentScaleFactor() : 1) * this._shadowOffset.y;
        } else
            texDef._shadowEnabled = false;

        // 文本颜色
        var locTextFillColor = this._textFillColor;
        texDef.fillStyle = cc.color(locTextFillColor.r, locTextFillColor.g, locTextFillColor.b);
        return texDef;
    },

    _fontClientHeight: 18,

    /**
     * 改变标签的文本内容
     * @警告：使用cc.LabelTTF改变标签文本的内容会比较消耗资源，建议使用效率更高的cc.LabelAtlas
     * @param {String} text 标签的文本内容
     */
    setString: function (text) {
        text = String(text);
        if (this._originalText != text) {
            this._originalText = text + "";

            this._updateString();

            // 强制刷新
            this._setUpdateTextureDirty();
        }
    },
    _updateString: function () {
        if ((!this._string || this._string === "") && this._string !== this._originalText)
            cc.renderer.childrenOrderDirty = true;

        this._string = this._originalText;
    },

    /**
     * 设置cc.LabelTTF的水平对齐方式
     * @param {cc.TEXT_ALIGNMENT_LEFT|cc.TEXT_ALIGNMENT_CENTER|cc.TEXT_ALIGNMENT_RIGHT} alignment Horizontal Alignment
     */
    setHorizontalAlignment: function (alignment) {
        if (alignment !== this._hAlignment) {
            this._hAlignment = alignment;

            // Force update强制刷新
            this._setUpdateTextureDirty();
        }
    },

    /**
     * 设置cc.LabelTTF的垂直对齐方式
     * @param {cc.VERTICAL_TEXT_ALIGNMENT_TOP|cc.VERTICAL_TEXT_ALIGNMENT_CENTER|cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM} verticalAlignment
     */
    setVerticalAlignment: function (verticalAlignment) {
        if (verticalAlignment != this._vAlignment) {
            this._vAlignment = verticalAlignment;

            // Force update
            this._setUpdateTextureDirty();
        }
    },

    /**
     * 设置cc.LabelTTF的尺寸，这个尺寸是这个标签大小的最大值，设置这个值将会在必要的时候自动改变线条
     * @param {cc.Size|Number} dim 尺寸或者尺寸宽度
     * @param {Number} [height] 尺寸的高度
     */
    setDimensions: function (dim, height) {
        var width;
        if(height === undefined){
            width = dim.width;
            height = dim.height;
        }else
            width = dim;

        if (width != this._dimensions.width || height != this._dimensions.height) {
            this._dimensions.width = width;
            this._dimensions.height = height;
            this._updateString();
            // 强制刷新
            this._setUpdateTextureDirty();
        }
    },

    _getBoundingWidth: function () {
        return this._dimensions.width;
    },
    _setBoundingWidth: function (width) {
        if (width != this._dimensions.width) {
            this._dimensions.width = width;
            this._updateString();
            // 强制刷新
            this._setUpdateTextureDirty();
        }
    },

    _getBoundingHeight: function () {
        return this._dimensions.height;
    },
    _setBoundingHeight: function (height) {
        if (height != this._dimensions.height) {
            this._dimensions.height = height;
            this._updateString();
            // 强制刷新
            this._setUpdateTextureDirty();
        }
    },

    /**
     * 设置cc.LabelTTF的字体大小
     * @param {Number} fontSize
     */
    setFontSize: function (fontSize) {
        if (this._fontSize !== fontSize) {
            this._fontSize = fontSize;
            this._fontStyleStr = fontSize + "px '" + this._fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName, fontSize);
            // Force update强制刷新
            this._setUpdateTextureDirty();
        }
    },

    /**
     * 设置cc.LabelTTF的名称
     * @param {String} fontName
     */
    setFontName: function (fontName) {
        if (this._fontName && this._fontName != fontName) {
            this._fontName = fontName;
            this._fontStyleStr = this._fontSize + "px '" + fontName + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(fontName, this._fontSize);
            // Force update强制刷新
            this._setUpdateTextureDirty();
        }
    },

    _getFont: function () {
        return this._fontStyleStr;
    },
    _setFont: function (fontStyle) {
        var res = cc.LabelTTF._fontStyleRE.exec(fontStyle);
        if (res) {
            this._fontSize = parseInt(res[1]);
            this._fontName = res[2];
            this._fontStyleStr = fontStyle;
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(this._fontName, this._fontSize);
            // 强制刷新
            this._setUpdateTextureDirty();
        }
    },

    _drawTTFInCanvas: function (context) {
        if (!context)
            return;
        var locStrokeShadowOffsetX = this._strokeShadowOffsetX, locStrokeShadowOffsetY = this._strokeShadowOffsetY;
        var locContentSizeHeight = this._contentSize.height - locStrokeShadowOffsetY, locVAlignment = this._vAlignment, locHAlignment = this._hAlignment,
            locFontHeight = this._fontClientHeight, locStrokeSize = this._strokeSize;

        context.setTransform(1, 0, 0, 1, 0 + locStrokeShadowOffsetX * 0.5, locContentSizeHeight + locStrokeShadowOffsetY * 0.5);

        //画布的填充文本
        if (context.font != this._fontStyleStr)
            context.font = this._fontStyleStr;
        context.fillStyle = this._fillColorStr;

        var xOffset = 0, yOffset = 0;
        //设置描边的样式
        var locStrokeEnabled = this._strokeEnabled;
        if (locStrokeEnabled) {
            context.lineWidth = locStrokeSize * 2;
            context.strokeStyle = this._strokeColorStr;
        }

        //设置阴影的样式
        if (this._shadowEnabled) {
            var locShadowOffset = this._shadowOffset;
            context.shadowColor = this._shadowColorStr;
            context.shadowOffsetX = locShadowOffset.x;
            context.shadowOffsetY = -locShadowOffset.y;
            context.shadowBlur = this._shadowBlur;
        }

        context.textBaseline = cc.LabelTTF._textBaseline[locVAlignment];
        context.textAlign = cc.LabelTTF._textAlign[locHAlignment];

        var locContentWidth = this._contentSize.width - locStrokeShadowOffsetX;

        //行高
        var lineHeight = this.getLineHeight();
        var transformTop = (lineHeight - this._fontClientHeight) / 2;

        if (locHAlignment === cc.TEXT_ALIGNMENT_RIGHT)
            xOffset += locContentWidth;
        else if (locHAlignment === cc.TEXT_ALIGNMENT_CENTER)
            xOffset += locContentWidth / 2;
        else
            xOffset += 0;
        if (this._isMultiLine) {
            var locStrLen = this._strings.length;
            if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM)
                yOffset = lineHeight - transformTop * 2 + locContentSizeHeight - lineHeight * locStrLen;
            else if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_CENTER)
                yOffset = (lineHeight - transformTop * 2) / 2 + (locContentSizeHeight - lineHeight * locStrLen) / 2;

            for (var i = 0; i < locStrLen; i++) {
                var line = this._strings[i];
                var tmpOffsetY = -locContentSizeHeight + (lineHeight * i + transformTop) + yOffset;
                if (locStrokeEnabled)
                    context.strokeText(line, xOffset, tmpOffsetY);
                context.fillText(line, xOffset, tmpOffsetY);
            }
        } else {
            if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM) {
                if (locStrokeEnabled)
                    context.strokeText(this._string, xOffset, yOffset);
                context.fillText(this._string, xOffset, yOffset);
            } else if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_TOP) {
                yOffset -= locContentSizeHeight;
                if (locStrokeEnabled)
                    context.strokeText(this._string, xOffset, yOffset);
                context.fillText(this._string, xOffset, yOffset);
            } else {
                yOffset -= locContentSizeHeight * 0.5;
                if (locStrokeEnabled)
                    context.strokeText(this._string, xOffset, yOffset);
                context.fillText(this._string, xOffset, yOffset);
            }
        }
    },

    _getLabelContext: function () {
        if (this._labelContext)
            return this._labelContext;

        if (!this._labelCanvas) {
            var locCanvas = cc.newElement("canvas");
            var labelTexture = new cc.Texture2D();
            labelTexture.initWithElement(locCanvas);
            this.texture = labelTexture;
            this._labelCanvas = locCanvas;
        }
        this._labelContext = this._labelCanvas.getContext("2d");
        return this._labelContext;
    },

    _checkWarp: function(strArr, i, maxWidth){
        var text = strArr[i];
        var allWidth = this._measure(text);
        if(allWidth > maxWidth && text.length > 1){

            var fuzzyLen = text.length * ( maxWidth / allWidth ) | 0;
            var tmpText = text.substr(fuzzyLen);
            var width = allWidth - this._measure(tmpText);
            var sLine;
            var pushNum = 0;

            //增加周期的上限，默认100遍
            var checkWhile = 0;

            //超出大小
            while(width > maxWidth && checkWhile++ < 100){
                fuzzyLen *= maxWidth / width;
                fuzzyLen = fuzzyLen | 0;
                tmpText = text.substr(fuzzyLen);
                width = allWidth - this._measure(tmpText);
            }

            checkWhile = 0;

            //找到截断点
            while(width < maxWidth && checkWhile++ < 100){

                if(tmpText){
                    var exec = cc.LabelTTF._wordRex.exec(tmpText);
                    pushNum = exec ? exec[0].length : 1;
                    sLine = tmpText;
                }

                fuzzyLen = fuzzyLen + pushNum;

                tmpText = text.substr(fuzzyLen);

                width = allWidth - this._measure(tmpText);
            }

            fuzzyLen -= pushNum;
            if(fuzzyLen === 0){
                fuzzyLen = 1;
                sLine = sLine.substr(1);
            }

            var sText = text.substr(0, fuzzyLen);

            // 首先设置符号
            if(cc.LabelTTF.wrapInspection){
                if(cc.LabelTTF._symbolRex.test(sLine || tmpText)){
                    var result = cc.LabelTTF._lastWordRex.exec(sText);
                    fuzzyLen -= result ? result[0].length : 0;

                    sLine = text.substr(fuzzyLen);
                    sText = text.substr(0, fuzzyLen);
                }
            }

            // 判断英语单词是否被截断
            if(cc.LabelTTF._firsrEnglish.test(sLine)){
                var result = cc.LabelTTF._lastEnglish.exec(sText);
                if(result && sText !== result[0]){
                    fuzzyLen -= result[0].length;
                    sLine = text.substr(fuzzyLen);
                    sText = text.substr(0, fuzzyLen);
                }
            }

            strArr[i] = sLine || tmpText;
            strArr.splice(i, 0, sText);
        }
    },

    _updateTTF: function () {
        var locDimensionsWidth = this._dimensions.width, i, strLength;
        var locLineWidth = this._lineWidths;
        locLineWidth.length = 0;

        this._isMultiLine = false;
        this._measureConfig();
        if (locDimensionsWidth !== 0) {
            // 内容处理
            this._strings = this._string.split('\n');

            for(i = 0; i < this._strings.length; i++){
                this._checkWarp(this._strings, i, locDimensionsWidth);
            }
        } else {
            this._strings = this._string.split('\n');
            for (i = 0, strLength = this._strings.length; i < strLength; i++) {
                locLineWidth.push(this._measure(this._strings[i]));
            }
        }

        if (this._strings.length > 0)
            this._isMultiLine = true;

        var locSize, locStrokeShadowOffsetX = 0, locStrokeShadowOffsetY = 0;
        if (this._strokeEnabled)
            locStrokeShadowOffsetX = locStrokeShadowOffsetY = this._strokeSize * 2;
        if (this._shadowEnabled) {
            var locOffsetSize = this._shadowOffset;
            locStrokeShadowOffsetX += Math.abs(locOffsetSize.x) * 2;
            locStrokeShadowOffsetY += Math.abs(locOffsetSize.y) * 2;
        }

        // 得到描边和阴影的偏移
        if (locDimensionsWidth === 0) {
            if (this._isMultiLine)
                locSize = cc.size(0 | (Math.max.apply(Math, locLineWidth) + locStrokeShadowOffsetX),
                    0 | ((this._fontClientHeight * this._strings.length) + locStrokeShadowOffsetY));
            else
                locSize = cc.size(0 | (this._measure(this._string) + locStrokeShadowOffsetX), 0 | (this._fontClientHeight + locStrokeShadowOffsetY));
        } else {
            if (this._dimensions.height === 0) {
                if (this._isMultiLine)
                    locSize = cc.size(0 | (locDimensionsWidth + locStrokeShadowOffsetX), 0 | ((this.getLineHeight() * this._strings.length) + locStrokeShadowOffsetY));
                else
                    locSize = cc.size(0 | (locDimensionsWidth + locStrokeShadowOffsetX), 0 | (this.getLineHeight() + locStrokeShadowOffsetY));
            } else {
                // 尺寸已经被设置完毕，contentSize必须和dimension相同
                locSize = cc.size(0 | (locDimensionsWidth + locStrokeShadowOffsetX), 0 | (this._dimensions.height + locStrokeShadowOffsetY));
            }
        }
        this.setContentSize(locSize);
        this._strokeShadowOffsetX = locStrokeShadowOffsetX;
        this._strokeShadowOffsetY = locStrokeShadowOffsetY;

        // 需要计算_anchorPointInPoints
        var locAP = this._anchorPoint;
        this._anchorPointInPoints.x = (locStrokeShadowOffsetX * 0.5) + ((locSize.width - locStrokeShadowOffsetX) * locAP.x);
        this._anchorPointInPoints.y = (locStrokeShadowOffsetY * 0.5) + ((locSize.height - locStrokeShadowOffsetY) * locAP.y);
    },

    /**
     * 返回标签内容的真实大小，当标签所占据的尺寸大于所绑定的区域的时候，返回的还是标签本身真实的大小
     * @returns {cc.Size} 返回内容的大小
     */
    getContentSize: function () {
        if (this._needUpdateTexture)
            this._updateTTF();
        return cc.Sprite.prototype.getContentSize.call(this);
    },

    _getWidth: function () {
        if (this._needUpdateTexture)
            this._updateTTF();
        return cc.Sprite.prototype._getWidth.call(this);
    },
    _getHeight: function () {
        if (this._needUpdateTexture)
            this._updateTTF();
        return cc.Sprite.prototype._getHeight.call(this);
    },

    _updateTexture: function () {
        var locContext = this._getLabelContext(), locLabelCanvas = this._labelCanvas;
        var locContentSize = this._contentSize;

        if (this._string.length === 0) {
            locLabelCanvas.width = 1;
            locLabelCanvas.height = locContentSize.height || 1;
            this._texture && this._texture.handleLoadedTexture();
            this.setTextureRect(cc.rect(0, 0, 1, locContentSize.height));
            return true;
        }

        // 设置标签画布的大小
        locContext.font = this._fontStyleStr;
        this._updateTTF();
        var width = locContentSize.width, height = locContentSize.height;
        var flag = locLabelCanvas.width == width && locLabelCanvas.height == height;
        locLabelCanvas.width = width;
        locLabelCanvas.height = height;
        if (flag) locContext.clearRect(0, 0, width, height);

        // 画到标签画布上
        this._drawTTFInCanvas(locContext);
        this._texture && this._texture.handleLoadedTexture();

        this.setTextureRect(cc.rect(0, 0, width, height));
        return true;
    },

    visit: function (ctx) {
        if (!this._string || this._string == "")
            return;
        if (this._needUpdateTexture) {
            this._needUpdateTexture = false;
            this._updateTexture();
        }
        var context = ctx || cc._renderContext;
        cc.Sprite.prototype.visit.call(this, context);
    },

    draw: null,

    _setTextureCoords: function (rect) {
        var tex = this._batchNode ? this.textureAtlas.texture : this._texture;
        if (!tex)
            return;

        var atlasWidth = tex.pixelsWidth;
        var atlasHeight = tex.pixelsHeight;

        var left, right, top, bottom, tempSwap, locQuad = this._quad;
        if (this._rectRotated) {
            if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
                left = (2 * rect.x + 1) / (2 * atlasWidth);
                right = left + (rect.height * 2 - 2) / (2 * atlasWidth);
                top = (2 * rect.y + 1) / (2 * atlasHeight);
                bottom = top + (rect.width * 2 - 2) / (2 * atlasHeight);
            } else {
                left = rect.x / atlasWidth;
                right = (rect.x + rect.height) / atlasWidth;
                top = rect.y / atlasHeight;
                bottom = (rect.y + rect.width) / atlasHeight;
            }// CC_FIX_ARTIFACTS_BY_STRECHING_TEXEL

            if (this._flippedX) {
                tempSwap = top;
                top = bottom;
                bottom = tempSwap;
            }

            if (this._flippedY) {
                tempSwap = left;
                left = right;
                right = tempSwap;
            }

            locQuad.bl.texCoords.u = left;
            locQuad.bl.texCoords.v = top;
            locQuad.br.texCoords.u = left;
            locQuad.br.texCoords.v = bottom;
            locQuad.tl.texCoords.u = right;
            locQuad.tl.texCoords.v = top;
            locQuad.tr.texCoords.u = right;
            locQuad.tr.texCoords.v = bottom;
        } else {
            if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
                left = (2 * rect.x + 1) / (2 * atlasWidth);
                right = left + (rect.width * 2 - 2) / (2 * atlasWidth);
                top = (2 * rect.y + 1) / (2 * atlasHeight);
                bottom = top + (rect.height * 2 - 2) / (2 * atlasHeight);
            } else {
                left = rect.x / atlasWidth;
                right = (rect.x + rect.width) / atlasWidth;
                top = rect.y / atlasHeight;
                bottom = (rect.y + rect.height) / atlasHeight;
            } // ! CC_FIX_ARTIFACTS_BY_STRECHING_TEXEL

            if (this._flippedX) {
                tempSwap = left;
                left = right;
                right = tempSwap;
            }

            if (this._flippedY) {
                tempSwap = top;
                top = bottom;
                bottom = tempSwap;
            }

            locQuad.bl.texCoords.u = left;
            locQuad.bl.texCoords.v = bottom;
            locQuad.br.texCoords.u = right;
            locQuad.br.texCoords.v = bottom;
            locQuad.tl.texCoords.u = left;
            locQuad.tl.texCoords.v = top;
            locQuad.tr.texCoords.u = right;
            locQuad.tr.texCoords.v = top;
        }
        this._quadDirty = true;
    }
});

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {

    var _p = cc.LabelTTF.prototype;

    _p.setColor = function (color3) {
        cc.Node.prototype.setColor.call(this, color3);
        this._setColorsString();
    };

    _p._transformForRenderer = function(){
        if (this._needUpdateTexture) {
            this._needUpdateTexture = false;
            this._updateTexture();
        }
        cc.Node.prototype._transformForRenderer.call(this);
    };

    _p._setColorsString = function () {
        this._setUpdateTextureDirty();

        var locDisplayColor = this._displayedColor,
            locDisplayedOpacity = this._displayedOpacity,
            locShadowColor = this._shadowColor || this._displayedColor;
        var locStrokeColor = this._strokeColor, locFontFillColor = this._textFillColor;

        this._shadowColorStr = "rgba(" + (0 | (locShadowColor.r * 0.5)) + "," + (0 | (locShadowColor.g * 0.5)) + "," + (0 | (locShadowColor.b * 0.5)) + "," + this._shadowOpacity + ")";
        this._fillColorStr = "rgba(" + (0 | (locDisplayColor.r / 255 * locFontFillColor.r)) + "," + (0 | (locDisplayColor.g / 255 * locFontFillColor.g)) + ","
            + (0 | (locDisplayColor.b / 255 * locFontFillColor.b)) + ", " + locDisplayedOpacity / 255 + ")";
        this._strokeColorStr = "rgba(" + (0 | (locDisplayColor.r / 255 * locStrokeColor.r)) + "," + (0 | (locDisplayColor.g / 255 * locStrokeColor.g)) + ","
            + (0 | (locDisplayColor.b / 255 * locStrokeColor.b)) + ", " + locDisplayedOpacity / 255 + ")";
    };

    _p.updateDisplayedColor = function (parentColor) {
        cc.Node.prototype.updateDisplayedColor.call(this, parentColor);
        this._setColorsString();
    };

    _p.setOpacity = function (opacity) {
        if (this._opacity === opacity)
            return;
        cc.Sprite.prototype.setOpacity.call(this, opacity);
        this._setColorsString();
        this._setUpdateTextureDirty();
    };

    //TODO: _p._updateDisplayedOpacityForCanvas
    _p.updateDisplayedOpacity = cc.Sprite.prototype.updateDisplayedOpacity;

    _p.initWithStringAndTextDefinition = function (text, textDefinition) {
        // 渲染标签需要的所有准备
        this._updateWithTextDefinition(textDefinition, false);

        // 设置字符串
        this.string = text;

        return true;
    };

    _p.setFontFillColor = function (tintColor) {
        var locTextFillColor = this._textFillColor;
        if (locTextFillColor.r != tintColor.r || locTextFillColor.g != tintColor.g || locTextFillColor.b != tintColor.b) {
            locTextFillColor.r = tintColor.r;
            locTextFillColor.g = tintColor.g;
            locTextFillColor.b = tintColor.b;

            this._setColorsString();
            this._setUpdateTextureDirty();
        }
    };

    _p.draw = cc.Sprite.prototype.draw;

    _p.setTextureRect = function (rect, rotated, untrimmedSize) {
        this._rectRotated = rotated || false;
        untrimmedSize = untrimmedSize || rect;

        this.setContentSize(untrimmedSize);
        this.setVertexRect(rect);

        var locTextureCoordRect = this._rendererCmd._textureCoord;
        locTextureCoordRect.x = rect.x;
        locTextureCoordRect.y = rect.y;
        locTextureCoordRect.renderX = rect.x;
        locTextureCoordRect.renderY = rect.y;
        locTextureCoordRect.width = rect.width;
        locTextureCoordRect.height = rect.height;
        locTextureCoordRect.validRect = !(locTextureCoordRect.width === 0 || locTextureCoordRect.height === 0
            || locTextureCoordRect.x < 0 || locTextureCoordRect.y < 0);

        var relativeOffset = this._unflippedOffsetPositionFromCenter;
        if (this._flippedX)
            relativeOffset.x = -relativeOffset.x;
        if (this._flippedY)
            relativeOffset.y = -relativeOffset.y;
        this._offsetPosition.x = relativeOffset.x + (this._contentSize.width - this._rect.width) / 2;
        this._offsetPosition.y = relativeOffset.y + (this._contentSize.height - this._rect.height) / 2;

        // 使用批节点渲染
        if (this._batchNode) {
            this.dirty = true;
        }
    };
    _p = null;

} else {
    cc.assert(cc.isFunction(cc._tmp.WebGLLabelTTF), cc._LogInfos.MissingFile, "LabelTTFWebGL.js");
    cc._tmp.WebGLLabelTTF();
    delete cc._tmp.WebGLLabelTTF;
}

cc.assert(cc.isFunction(cc._tmp.PrototypeLabelTTF), cc._LogInfos.MissingFile, "LabelTTFPropertyDefine.js");
cc._tmp.PrototypeLabelTTF();
delete cc._tmp.PrototypeLabelTTF;

cc.LabelTTF._textAlign = ["left", "center", "right"];

cc.LabelTTF._textBaseline = ["top", "middle", "bottom"];

//检查第一个字符
cc.LabelTTF.wrapInspection = true;

//支持： 英语 法语 德语
//还有一些东方语言
cc.LabelTTF._wordRex = /([a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôû]+|\S)/;
cc.LabelTTF._symbolRex = /^[!,.:;}\]%\?>、‘“》？。，！]/;
cc.LabelTTF._lastWordRex = /([a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôû]+|\S)$/;
cc.LabelTTF._lastEnglish = /[a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôû]+$/;
cc.LabelTTF._firsrEnglish = /^[a-zA-Z0-9ÄÖÜäöüßéèçàùêâîôû]/;

// 只支持如下格式的字符串："18px Verdana" or "18px 'Helvetica Neue'"
cc.LabelTTF._fontStyleRE = /^(\d+)px\s+['"]?([\w\s\d]+)['"]?$/;

/**
 *  使用字体名称，对齐方式，尺寸和字体大小来创建一个cc.LabelTTF对象
 * @deprecated 3.0后的版本请新的构造器代替
 * @see cc.LabelTTF
 * @static
 * @param {String} text
 * @param {String|cc.FontDefinition} [fontName="Arial"]
 * @param {Number} [fontSize=16]
 * @param {cc.Size} [dimensions=cc.size(0,0)]
 * @param {Number} [hAlignment=cc.TEXT_ALIGNMENT_LEFT]
 * @param {Number} [vAlignment=cc.VERTICAL_TEXT_ALIGNMENT_TOP]
 * @return {cc.LabelTTF|Null}
 */
cc.LabelTTF.create = function (text, fontName, fontSize, dimensions, hAlignment, vAlignment) {
    return new cc.LabelTTF(text, fontName, fontSize, dimensions, hAlignment, vAlignment);
};

/**
 * @自v3.0版本之后，请使用新的构造函数来代替
 * @function
 * @static
 */
cc.LabelTTF.createWithFontDefinition = cc.LabelTTF.create;

if (cc.USE_LA88_LABELS)
    cc.LabelTTF._SHADER_PROGRAM = cc.SHADER_POSITION_TEXTURECOLOR;
else
    cc.LabelTTF._SHADER_PROGRAM = cc.SHADER_POSITION_TEXTUREA8COLOR;

cc.LabelTTF.__labelHeightDiv = cc.newElement("div");
cc.LabelTTF.__labelHeightDiv.style.fontFamily = "Arial";
cc.LabelTTF.__labelHeightDiv.style.position = "absolute";
cc.LabelTTF.__labelHeightDiv.style.left = "-100px";
cc.LabelTTF.__labelHeightDiv.style.top = "-100px";
cc.LabelTTF.__labelHeightDiv.style.lineHeight = "normal";

document.body ?
    document.body.appendChild(cc.LabelTTF.__labelHeightDiv) :
    cc._addEventListener(window, 'load', function () {
        this.removeEventListener('load', arguments.callee, false);
        document.body.appendChild(cc.LabelTTF.__labelHeightDiv);
    }, false);


cc.LabelTTF.__getFontHeightByDiv = function (fontName, fontSize) {
    var clientHeight = cc.LabelTTF.__fontHeightCache[fontName + "." + fontSize];
    if (clientHeight > 0) return clientHeight;
    var labelDiv = cc.LabelTTF.__labelHeightDiv;
    labelDiv.innerHTML = "ajghl~!";
    labelDiv.style.fontFamily = fontName;
    labelDiv.style.fontSize = fontSize + "px";
    clientHeight = labelDiv.clientHeight;
    cc.LabelTTF.__fontHeightCache[fontName + "." + fontSize] = clientHeight;
    labelDiv.innerHTML = "";
    return clientHeight;
};

cc.LabelTTF.__fontHeightCache = {};
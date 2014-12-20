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
 * 使用图片文件的方式将文本输出到屏幕上，可能会比使用cc.Label的方法慢点，和cc.LabelBMFont的方式类似
 * @class
 * @extends cc.AtlasNode
 *
 * @property {String}   string  - 标签的内容
 *
 * @param {String} strText
 * @param {String} charMapFile  地图文件或者fnt文件
 * @param {Number} [itemWidth=0]
 * @param {Number} [itemHeight=0]
 * @param {Number} [startCharMap=""]
 * @example
 * //创建一个cc.LabelAtlas同事产生一个字符串，一个字符地图文件，和该地图的么一个开始字符元素的宽度以及高度
 * var myLabel = new cc.LabelAtlas('Text to display', 'CharMapfile.png', 12, 20, ' ')
 * 
 *
 * //创建cc.LabelAtlas,同时产生一个字符串和地图文件
 * var myLabel = new cc.LabelAtlas('Text to display', 'CharMapFile.plist');
 */
cc.LabelAtlas = cc.AtlasNode.extend(/** @lends cc.LabelAtlas# */{

    // 存取器
    //

    // 着色
    _string: null,
    // 字符地图的第一个字符
    _mapStartChar: null,

    _textureLoaded: false,
    _className: "LabelAtlas",

   /**
     * <p>						
     *  构造器的功能,重写它以便可以扩充构造的功能，但是但我们使用扩展的"ctor"功能是记得调用"this._super()". <br />
     *  产生一个标签栏图谱. <br />
     *  它接受两组参数: <br/>
     * a) 字符串，fnt文件 <br/>
     * b) 标签, 纹理文件的名字, 宽度, 高度, 开始字符 <br/>
     * </p>
     * @param {String}  一个地图字符文件
     * @param {String} charMapFile  charMapFile or fntFile
     * @param {Number} [itemWidth=0]
     * @param {Number} [itemHeight=0]
     * @param {Number} [startCharMap=""]
     */
 
    ctor: function (strText, charMapFile, itemWidth, itemHeight, startCharMap) {
        cc.AtlasNode.prototype.ctor.call(this);

        this._cascadeOpacityEnabled = true;
        this._cascadeColorEnabled = true;

        charMapFile && cc.LabelAtlas.prototype.initWithString.call(this, strText, charMapFile, itemWidth, itemHeight, startCharMap);
    },

    /**
     * 返回被加载的纹理
     * @returns {boolean}
     */
    textureLoaded: function () {
        return this._textureLoaded;
    },

      /**
     * 增加纹理加载事件监听器
     * @param {Function} 回调
     * @param{cc.Node} 目标
     * @deprecated 从3.1版本后，请使用addEventListener代替之前的   /**
     * <p>						
        *  构造器的功能,重写它以便可以扩充构造的功能，但是但我们使用扩展的"ctor"功能是记得调用"this._super()". <br />
     *  产生一个标签栏图谱. <br />
     *  它接受两组参数: <br/>
     * a) 字符串，fnt文件 <br/>
     * b) 标签, 纹理文件的名字, 宽度, 高度, 开始字符 <br/>
     * </p>
     * @param {String}  一个地图字符文件
     * @param {String} charMapFile  charMapFile or fntFile
     * @param {Number} [itemWidth=0]
     * @param {Number} [itemHeight=0]
     * @param {Number} [startCharMap=""]
     */
    addLoadedEventListener: function (callback, target) {
        this.addEventListener("load", callback, target);
    },

    /**
     * <p>
     *  初始化cc.LabelAtlas并产生一个字符串和一个字符地图文件, <br/>
     *  每个元素和开始地图集字符的宽度和高度	<br/>
     *  它可以接收下面组参数	<br/>
     * a) 字符串，fnt文件 <br/>
     * b) 标签, 纹理文件的名字, 宽度, 高度, 开始字符 <br/>
     * </p>
     * @param {String} strText
     * @param {String|cc.Texture2D} charMapFile  字符地图文件或者fnt文件或者纹理文件
     * @param {Number} [itemWidth=0]
     * @param {Number} [itemHeight=0]
     * @param {Number} [startCharMap=""]
     * @return {Boolean} 成功就返回ture
     */
    initWithString: function (strText, charMapFile, itemWidth, itemHeight, startCharMap) {
        var label = strText + "", textureFilename, width, height, startChar;
        if (itemWidth === undefined) {
            var dict = cc.loader.getRes(charMapFile);
            if (parseInt(dict["version"], 10) !== 1) {
                cc.log("cc.LabelAtlas.initWithString(): Unsupported version. Upgrade cocos2d version");
                return false;
            }

            textureFilename = cc.path.changeBasename(charMapFile, dict["textureFilename"]);
            var locScaleFactor = cc.contentScaleFactor();
            width = parseInt(dict["itemWidth"], 10) / locScaleFactor;
            height = parseInt(dict["itemHeight"], 10) / locScaleFactor;
            startChar = String.fromCharCode(parseInt(dict["firstChar"], 10));
        } else {
            textureFilename = charMapFile;
            width = itemWidth || 0;
            height = itemHeight || 0;
            startChar = startCharMap || " ";
        }

        var texture = null;
        if (textureFilename instanceof cc.Texture2D)
            texture = textureFilename;
        else
            texture = cc.textureCache.addImage(textureFilename);
        var locLoaded = texture.isLoaded();
        this._textureLoaded = locLoaded;
        if (!locLoaded) {
            texture.addEventListener("load", function (sender) {
                this.initWithTexture(texture, width, height, label.length);
                this.string = label;
                this.dispatchEvent("load");
            }, this);
        }
        if (this.initWithTexture(texture, width, height, label.length)) {
            this._mapStartChar = startChar;
            this.string = label;
            return true;
        }
        return false;
    },

    /**
     * 设置颜色
     * @param {cc.Color} color3
     */
    setColor: function (color3) {
        cc.AtlasNode.prototype.setColor.call(this, color3);
        this.updateAtlasValues();
    },

    /**
     * 返回该文本标签
     * @return {String}
     */
    getString: function () {
        return this._string;
    },

    /**
     * 绘制标签
     */
    draw: function (ctx) {
        cc.AtlasNode.prototype.draw.call(this, ctx);
        if (cc.LABELATLAS_DEBUG_DRAW) {
            var s = this.size;
            var vertices = [cc.p(0, 0), cc.p(s.width, 0),
                cc.p(s.width, s.height), cc.p(0, s.height)];
            cc._drawingUtil.drawPoly(vertices, 4, true);
        }
    },

    _addChildForCanvas: function(child, zOrder, tag){
        child._lateChild = true;
        cc.Node.prototype.addChild.call(this, child, zOrder, tag);
    },

    /**
     * 地图集产生器
     * @function
     */
    updateAtlasValues: null,

    _updateAtlasValuesForCanvas: function () {
        var locString = this._string || "";
        var n = locString.length;
        var texture = this.texture;
        var locItemWidth = this._itemWidth , locItemHeight = this._itemHeight;     //不必增加cc.contentScaleFactor()，因为精灵的绘图函数将会做这些
        for (var i = 0; i < n; i++) {
            var a = locString.charCodeAt(i) - this._mapStartChar.charCodeAt(0);
            var row = parseInt(a % this._itemsPerRow, 10);
            var col = parseInt(a / this._itemsPerRow, 10);

            var rect = cc.rect(row * locItemWidth, col * locItemHeight, locItemWidth, locItemHeight);
            var c = locString.charCodeAt(i);
            var fontChar = this.getChildByTag(i);
            if (!fontChar) {
                fontChar = new cc.Sprite();
                if (c == 32) {
                    fontChar.init();
                    fontChar.setTextureRect(cc.rect(0, 0, 10, 10), false, cc.size(0, 0));
                } else
                    fontChar.initWithTexture(texture, rect);

                cc.Node.prototype.addChild.call(this, fontChar, 0, i);
            } else {
                if (c == 32) {
                    fontChar.init();
                    fontChar.setTextureRect(cc.rect(0, 0, 10, 10), false, cc.size(0, 0));
                } else {
                    // 重用字体
                    fontChar.initWithTexture(texture, rect);
                    // 恢复默认值以防止被修改
                    fontChar.visible = true;
                }
            }
            fontChar.setPosition(i * locItemWidth + locItemWidth / 2, locItemHeight / 2);
        }
    },

    _updateAtlasValuesForWebGL: function () {
        var locString = this._string;
        var n = locString.length;
        var locTextureAtlas = this.textureAtlas;

        var texture = locTextureAtlas.texture;
        var textureWide = texture.pixelsWidth;
        var textureHigh = texture.pixelsHeight;
        var itemWidthInPixels = this._itemWidth;
        var itemHeightInPixels = this._itemHeight;
        if (!this._ignoreContentScaleFactor) {
            itemWidthInPixels = this._itemWidth * cc.contentScaleFactor();
            itemHeightInPixels = this._itemHeight * cc.contentScaleFactor();
        }
        if (n > locTextureAtlas.getCapacity())
            cc.log("cc.LabelAtlas._updateAtlasValues(): Invalid String length");
        var quads = locTextureAtlas.quads;
        var locDisplayedColor = this._displayedColor;
        var curColor = {r: locDisplayedColor.r, g: locDisplayedColor.g, b: locDisplayedColor.b, a: this._displayedOpacity};
        var locItemWidth = this._itemWidth;
        for (var i = 0; i < n; i++) {
            var a = locString.charCodeAt(i) - this._mapStartChar.charCodeAt(0);
            var row = a % this._itemsPerRow;
            var col = 0 | (a / this._itemsPerRow);

            var left, right, top, bottom;
            if (cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL) {
                // Issue #938. 不要使用texStepX和texStepY
                left = (2 * row * itemWidthInPixels + 1) / (2 * textureWide);
                right = left + (itemWidthInPixels * 2 - 2) / (2 * textureWide);
                top = (2 * col * itemHeightInPixels + 1) / (2 * textureHigh);
                bottom = top + (itemHeightInPixels * 2 - 2) / (2 * textureHigh);
            } else {
                left = row * itemWidthInPixels / textureWide;
                right = left + itemWidthInPixels / textureWide;
                top = col * itemHeightInPixels / textureHigh;
                bottom = top + itemHeightInPixels / textureHigh;
            }
            var quad = quads[i];
            var locQuadTL = quad.tl, locQuadTR = quad.tr, locQuadBL = quad.bl, locQuadBR = quad.br;
            locQuadTL.texCoords.u = left;
            locQuadTL.texCoords.v = top;
            locQuadTR.texCoords.u = right;
            locQuadTR.texCoords.v = top;
            locQuadBL.texCoords.u = left;
            locQuadBL.texCoords.v = bottom;
            locQuadBR.texCoords.u = right;
            locQuadBR.texCoords.v = bottom;

            locQuadBL.vertices.x = (i * locItemWidth);
            locQuadBL.vertices.y = 0;
            locQuadBL.vertices.z = 0.0;
            locQuadBR.vertices.x = (i * locItemWidth + locItemWidth);
            locQuadBR.vertices.y = 0;
            locQuadBR.vertices.z = 0.0;
            locQuadTL.vertices.x = i * locItemWidth;
            locQuadTL.vertices.y = this._itemHeight;
            locQuadTL.vertices.z = 0.0;
            locQuadTR.vertices.x = i * locItemWidth + locItemWidth;
            locQuadTR.vertices.y = this._itemHeight;
            locQuadTR.vertices.z = 0.0;
            locQuadTL.colors = curColor;
            locQuadTR.colors = curColor;
            locQuadBL.colors = curColor;
            locQuadBR.colors = curColor;
        }
        if (n > 0) {
            locTextureAtlas.dirty = true;
            var totalQuads = locTextureAtlas.totalQuads;
            if (n > totalQuads)
                locTextureAtlas.increaseTotalQuadsWith(n - totalQuads);
        }
    },

    /**
     * 设置显示字符串
     * @function	
     * @param {String} label
     */
    setString: null,

    _setStringForCanvas: function (label) {
        label = String(label);
        var len = label.length;
        this._string = label;
        this.width = len * this._itemWidth;
        this.height = this._itemHeight;
        if (this._children) {
            var locChildren = this._children;
            len = locChildren.length;
            for (var i = 0; i < len; i++) {
                var node = locChildren[i];
                if (node && !node._lateChild)
                    node.visible = false;
            }
        }

        this.updateAtlasValues();
        this.quadsToDraw = len;
    },

    _setStringForWebGL: function (label) {
        label = String(label);
        var len = label.length;
        if (len > this.textureAtlas.totalQuads)
            this.textureAtlas.resizeCapacity(len);

        this._string = label;
        this.width = len * this._itemWidth;
        this.height = this._itemHeight;

        this.updateAtlasValues();
        this.quadsToDraw = len;
    },

    /**
     * 设置透明度
     * @function
     * @param {Number} opacity
     */
    setOpacity: null,

    _setOpacityForWebGL: function (opacity) {
        if (this._opacity !== opacity)
            cc.AtlasNode.prototype.setOpacity.call(this, opacity);
    }
});

var _p = cc.LabelAtlas.prototype;
cc.EventHelper.prototype.apply(_p);
if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
    _p.updateAtlasValues = _p._updateAtlasValuesForWebGL;
    _p.setString = _p._setStringForWebGL;
    _p.setOpacity = _p._setOpacityForWebGL;
} else {
    _p.updateAtlasValues = _p._updateAtlasValuesForCanvas;
    _p.setString = _p._setStringForCanvas;
    _p.setOpacity = _p._setOpacityForCanvas;
    _p.addChild = _p._addChildForCanvas;
}

// 可重写属性
cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);
cc.defineGetterSetter(_p, "color", _p.getColor, _p.setColor);

// 附加属性
/** @expose */
_p.string;
cc.defineGetterSetter(_p, "string", _p.getString, _p.setString);

/**
 * <p>
 *     请使用新的cc.LabelAtlas来替代。<br />
 *     产生一个地图集标签。<br />
 *     它可以接收下面两种参数：<br/>
 *         a)字符串，fntFile    <br/>
 *         b)标签，纹理的名字，宽度，高度，开始字符<br/>		    
 * </p>														<br/>
 * @deprecated 从3.0版本开始，请使用新的cc.LabelAttlas
 * @param {String} strText
 * @param {String} charMapFile  字符地图文件或者fnt文件
 * @param {Number} [itemWidth=0]
 * @param {Number} [itemHeight=0]
 * @param {Number} [startCharMap=""]
 * @return {cc.LabelAtlas} 成功则返回LabelAtlas对象
 */
cc.LabelAtlas.create = function (strText, charMapFile, itemWidth, itemHeight, startCharMap) {
    return new cc.LabelAtlas(strText, charMapFile, itemWidth, itemHeight, startCharMap);
};

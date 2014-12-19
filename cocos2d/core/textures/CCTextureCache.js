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
 * cc.textureCache 是一个单例对象，它是 cc.Texture2D 的全局缓存
 * @class
 * @name cc.textureCache
 */
cc.textureCache = /** @lends cc.textureCache# */{
    _textures: {},
    _textureColorsCache: {},
    _textureKeySeq: (0 | Math.random() * 1000),

    _loadedTexturesBefore: {},

    //handleLoadedTexture move to Canvas/WebGL 

    _initializingRenderer: function () {
        var selPath;
        //init texture from _loadedTexturesBefore
        var locLoadedTexturesBefore = this._loadedTexturesBefore, locTextures = this._textures;
        for (selPath in locLoadedTexturesBefore) {
            var tex2d = locLoadedTexturesBefore[selPath];
            tex2d.handleLoadedTexture();
            locTextures[selPath] = tex2d;
        }
        this._loadedTexturesBefore = {};
    },

    /**
     * <p>
     *     给定一个PVR文件名，返回一个 Texture2D 对象 <br/>
     *     如果文件中的图片之前未被加载，会创建一个新的 CCTexture2D对象返回，否则会返回一个之前已经加载过此图片的对象的引用<br/>
     *     注意：AddPVRTCImage 不支持 HTML5
     * </p>
     * @param {String} filename - 文件名
     * @return {cc.Texture2D}
     */
    addPVRTCImage: function (filename) {
        cc.log(cc._LogInfos.textureCache_addPVRTCImage);
    },

    /**
     * <p>
     *    传入一个ETC文件名，返回一个Texture2D 对象 <br/>
     *    如果文件中的图片之前未被加载，会创建一个新的 CCTexture2D对象返回，否则会返回一个之前已经加载过此图片的对象的引用<br/>
     *    addETCImage 不支持 HTML5
     * </p>
     * @param {String} filename
     * @return {cc.Texture2D}
     */
    addETCImage: function (filename) {
        cc.log(cc._LogInfos.textureCache_addETCImage);
    },

    /**
     * 描述
     * @return {String}
     */
    description: function () {
        return "<TextureCache | Number of textures = " + this._textures.length + ">";
    },

    /**
     * 返回创建好的贴图。如果贴图不存在，返回空。
     * @param {String} textureKeyName
     * @return {cc.Texture2D|Null}
     * @deprecated
     * @example
     * //example
     * var key = cc.textureCache.textureForKey("hello.png");
     */
    textureForKey: function (textureKeyName) {
        cc.log(cc._LogInfos.textureCache_textureForKey);
        return this.getTextureForKey(textureKeyName);
    },

    /**
     * 返回创建好的贴图。如果贴图不存在，返回空。
     * @param {String} textureKeyName
     * @return {cc.Texture2D|Null}
     * @example
     * //example
     * var key = cc.textureCache.getTextureForKey("hello.png");
     */
    getTextureForKey: function(textureKeyName){
        return this._textures[textureKeyName] || this._textures[cc.loader._aliases[textureKeyName]];
    },

    /**
     * @param {Image} texture
     * @return {String|Null}
     * @example
     * //example
     * var key = cc.textureCache.getKeyByTexture(texture);
     */
    getKeyByTexture: function (texture) {
        for (var key in this._textures) {
            if (this._textures[key] == texture) {
                return key;
            }
        }
        return null;
    },

    _generalTextureKey: function () {
        this._textureKeySeq++;
        return "_textureKey_" + this._textureKeySeq;
    },

    /**
     * @param {Image} texture
     * @return {Array}
     * @example
     * //example
     * var cacheTextureForColor = cc.textureCache.getTextureColors(texture);
     */
    getTextureColors: function (texture) {
        var key = this.getKeyByTexture(texture);
        if (!key) {
            if (texture instanceof HTMLImageElement)
                key = texture.src;
            else
                key = this._generalTextureKey();
        }

        if (!this._textureColorsCache[key])
            this._textureColorsCache[key] = cc.generateTextureCacheForColor(texture);
        return this._textureColorsCache[key];
    },

    /**
     * <p>传入一个PVR文件名返回一个 Texture2D 对象<br/>
     * 如果文件中的图片之前未被加载，会创建一个新的 CCTexture2D对象返回，否则会返回一个之前已经加载过该图片的对象的引用</p>
     * @param {String} path
     * @return {cc.Texture2D}
     */
    addPVRImage: function (path) {
        cc.log(cc._LogInfos.textureCache_addPVRImage);
    },

    /**
     * <p>清空加载贴图的字典，如果你收到“内存警告”时请调用此方法<br /> 
     * 短期来看:释放某些资源，防止app出现闪退<br />
     * 在中期:会分配更多的资源<br />
     * 长远来看:没有什么区别</p> 
     * @example
     * //example
     * cc.textureCache.removeAllTextures();
     */
    removeAllTextures: function () {
        var locTextures = this._textures;
        for (var selKey in locTextures) {
            if (locTextures[selKey])
                locTextures[selKey].releaseTexture();
        }
        this._textures = {};
    },

    /**
     * 从缓存中删除指定的贴图
     * @param {Image} texture
     * @example
     * //example
     * cc.textureCache.removeTexture(texture);
     */
    removeTexture: function (texture) {
        if (!texture)
            return;

        var locTextures = this._textures;
        for (var selKey in locTextures) {
            if (locTextures[selKey] == texture) {
                locTextures[selKey].releaseTexture();
                delete(locTextures[selKey]);
            }
        }
    },

    /**
     * 从缓存中根据给定的key删除贴图
     * @param {String} textureKeyName
     * @example
     * //example
     * cc.textureCache.removeTexture("hello.png");
     */
    removeTextureForKey: function (textureKeyName) {
        if (textureKeyName == null)
            return;
        if (this._textures[textureKeyName])
            delete(this._textures[textureKeyName]);
    },

    //addImage move to Canvas/WebGL

    /**
     * 缓存图片数据
     * @param {String} path
     * @param {Image|HTMLImageElement|HTMLCanvasElement} texture
     */
    cacheImage: function (path, texture) {
        if (texture instanceof  cc.Texture2D) {
            this._textures[path] = texture;
            return;
        }
        var texture2d = new cc.Texture2D();
        texture2d.initWithElement(texture);
        texture2d.handleLoadedTexture();
        this._textures[path] = texture2d;
    },

    /**
     * <p>通过给定的UIImage对象返回一个 Texture2D对象<br />
     * 如果图片之前未被加载，会创建一个新的 Texture2D对象返回，否则会返回一个之前已经加载过该图片的对象的引用<br />
     * "key"参数将被用作缓存的"key"<br />
     * 如果"key"为空，那么每次都会创建一个新的贴图</p>
     * @param {HTMLImageElement|HTMLCanvasElement} image
     * @param {String} key
     * @return {cc.Texture2D}
     */
    addUIImage: function (image, key) {

        cc.assert(image, cc._LogInfos.textureCache_addUIImage_2);

        if (key) {
            if (this._textures[key])
                return this._textures[key];
        }

        // prevents overloading the autorelease pool
        var texture = new cc.Texture2D();
        texture.initWithImage(image);
        if ((key != null) && (texture != null))
            this._textures[key] = texture;
        else
            cc.log(cc._LogInfos.textureCache_addUIImage);
        return texture;
    },

    /**
     * <p>把当前TextureCache的内容输出到cc.log<br />
     * 它会计算每个贴图的大小和贴图总共占用的内存 </p>
     */
    dumpCachedTextureInfo: function () {
        var count = 0;
        var totalBytes = 0, locTextures = this._textures;

        for (var key in locTextures) {
            var selTexture = locTextures[key];
            count++;
            if (selTexture.getHtmlElementObj() instanceof  HTMLImageElement)
                cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo, key, selTexture.getHtmlElementObj().src, selTexture.pixelsWidth, selTexture.pixelsHeight);
            else {
                cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_2, key, selTexture.pixelsWidth, selTexture.pixelsHeight);
            }
            totalBytes += selTexture.pixelsWidth * selTexture.pixelsHeight * 4;
        }

        var locTextureColorsCache = this._textureColorsCache;
        for (key in locTextureColorsCache) {
            var selCanvasColorsArr = locTextureColorsCache[key];
            for (var selCanvasKey in selCanvasColorsArr) {
                var selCanvas = selCanvasColorsArr[selCanvasKey];
                count++;
                cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_2, key, selCanvas.width, selCanvas.height);
                totalBytes += selCanvas.width * selCanvas.height * 4;
            }

        }
        cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_3, count, totalBytes / 1024, (totalBytes / (1024.0 * 1024.0)).toFixed(2));
    },

    _clear: function () {
        this._textures = {};
        this._textureColorsCache = {};
        this._textureKeySeq = (0 | Math.random() * 1000);
        this._loadedTexturesBefore = {};
    }
};

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {

    var _p = cc.textureCache;

    _p.handleLoadedTexture = function (url) {
        var locTexs = this._textures;
        //remove judge
        var tex = locTexs[url];
        if (!tex) {
            tex = locTexs[url] = new cc.Texture2D();
            tex.url = url;
        }
        tex.handleLoadedTexture();
    };

    /**
     * <p>通过给定的文件图片返回一个Texture2D对象<br />
     * 如果文件图片之前未被加载，会创建一个新的Texture2D 对象返回，并且使用文件名称作为"key",<br />
	 * 否则会返回一个之前加载过的图片对象的引用。<br />
     * 支持的图片扩展名: .png, .jpg, .gif</p>
     * @param {String} url
     * @param {Function} cb
     * @param {Object} target
     * @return {cc.Texture2D}
     * @example
     * //example
     * cc.textureCache.addImage("hello.png");
     */
    _p.addImage = function (url, cb, target) {

        cc.assert(url, cc._LogInfos.Texture2D_addImage);

        var locTexs = this._textures;
        //remove judge
        var tex = locTexs[url] || locTexs[cc.loader._aliases[url]];
        if (tex) {
            cb && cb.call(target, tex);
            return tex;
        }

        tex = locTexs[url] = new cc.Texture2D();
        tex.url = url;
        if (!cc.loader.getRes(url)) {
            if (cc.loader._checkIsImageURL(url)) {
                cc.loader.load(url, function (err) {
                    cb && cb.call(target);
                });
            } else {
                cc.loader.loadImg(url, function (err, img) {
                    if (err)
                        return cb ? cb(err) : err;
                    cc.loader.cache[url] = img;
                    cc.textureCache.handleLoadedTexture(url);
                    cb && cb.call(target, tex);
                });
            }
        }
        else {
            tex.handleLoadedTexture();
        }

        return tex;
    };

    _p = null;

} else {
    cc.assert(cc.isFunction(cc._tmp.WebGLTextureCache), cc._LogInfos.MissingFile, "TexturesWebGL.js");
    cc._tmp.WebGLTextureCache();
    delete cc._tmp.WebGLTextureCache;
}

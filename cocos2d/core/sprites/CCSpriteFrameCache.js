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
 * <p>
 * cc.spriteFrameCache是一个处理精灵帧加载的单例，它将精灵帧保存在缓存中<br/>
 * <br/>
 * example<br/>
 * // 用plist文件将精灵帧加入精灵帧缓存<br/>
 * cc.spriteFrameCache.addSpriteFrames(s_grossiniPlist);<br/>
 * </p>
 * @class
 * @name cc.spriteFrameCache
 */
cc.spriteFrameCache = /** @lends cc.spriteFrameCache# */{
    _CCNS_REG1 : /^\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*$/,
    _CCNS_REG2 : /^\s*\{\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*,\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*\}\s*$/,

    _spriteFrames: {},
    _spriteFramesAliases: {},
    _frameConfigCache : {},

    _rectFromString :  function (content) {
        var result = this._CCNS_REG2.exec(content);
        if(!result) return cc.rect(0, 0, 0, 0);
        return cc.rect(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]), parseFloat(result[4]));
    },

    _pointFromString : function (content) {
        var result = this._CCNS_REG1.exec(content);
        if(!result) return cc.p(0,0);
        return cc.p(parseFloat(result[1]), parseFloat(result[2]));
    },

    _sizeFromString : function (content) {
        var result = this._CCNS_REG1.exec(content);
        if(!result) return cc.size(0, 0);
        return cc.size(parseFloat(result[1]), parseFloat(result[2]));
    },

    _getFrameConfig : function(url){
        var dict = cc.loader.getRes(url);

        cc.assert(dict, cc._LogInfos.spriteFrameCache__getFrameConfig_2, url);

        cc.loader.release(url);//在加载器中释放
        if(dict._inited){
            this._frameConfigCache[url] = dict;
            return dict;
        }
        var tempFrames = dict["frames"], tempMeta = dict["metadata"] || dict["meta"];
        var frames = {}, meta = {};
        var format = 0;
        if(tempMeta){//初始化元数据
            var tmpFormat = tempMeta["format"];
            format = (tmpFormat.length <= 1) ? parseInt(tmpFormat) : tmpFormat;
            meta.image = tempMeta["textureFileName"] || tempMeta["textureFileName"] || tempMeta["image"];
        }
        for (var key in tempFrames) {
            var frameDict = tempFrames[key];
            if(!frameDict) continue;
            var tempFrame = {};

            if (format == 0) {
                tempFrame.rect = cc.rect(frameDict["x"], frameDict["y"], frameDict["width"], frameDict["height"]);
                tempFrame.rotated = false;
                tempFrame.offset = cc.p(frameDict["offsetX"], frameDict["offsetY"]);
                var ow = frameDict["originalWidth"];
                var oh = frameDict["originalHeight"];
                // check ow/oh
                if (!ow || !oh) {
                    cc.log(cc._LogInfos.spriteFrameCache__getFrameConfig);
                }
                // Math.abs ow/oh
                ow = Math.abs(ow);
                oh = Math.abs(oh);
                tempFrame.size = cc.size(ow, oh);
            } else if (format == 1 || format == 2) {
                tempFrame.rect = this._rectFromString(frameDict["frame"]);
                tempFrame.rotated = frameDict["rotated"] || false;
                tempFrame.offset = this._pointFromString(frameDict["offset"]);
                tempFrame.size = this._sizeFromString(frameDict["sourceSize"]);
            } else if (format == 3) {
                //获取值
                var spriteSize = this._sizeFromString(frameDict["spriteSize"]);
                var textureRect = this._rectFromString(frameDict["textureRect"]);
                if (spriteSize) {
                    textureRect = cc.rect(textureRect.x, textureRect.y, spriteSize.width, spriteSize.height);
                }
                tempFrame.rect = textureRect;
                tempFrame.rotated = frameDict["textureRotated"] || false; // == "true";
                tempFrame.offset = this._pointFromString(frameDict["spriteOffset"]);
                tempFrame.size = this._sizeFromString(frameDict["spriteSourceSize"]);
                tempFrame.aliases = frameDict["aliases"];
            } else {
                var tmpFrame = frameDict["frame"], tmpSourceSize = frameDict["sourceSize"];
                key = frameDict["filename"] || key;
                tempFrame.rect = cc.rect(tmpFrame["x"], tmpFrame["y"], tmpFrame["w"], tmpFrame["h"]);
                tempFrame.rotated = frameDict["rotated"] || false;
                tempFrame.offset = cc.p(0, 0);
                tempFrame.size = cc.size(tmpSourceSize["w"], tmpSourceSize["h"]);
            }
            frames[key] = tempFrame;
        }
        var cfg = this._frameConfigCache[url] = {
            _inited : true,
            frames : frames,
            meta : meta
        };
        return cfg;
    },

	/**
     * <p>
     *   从plist或者json文件中增加多个精灵帧<br/>
     *   纹理将会被自动加载，在纹理的名称中将会用.png代替.plist和.json<br/>
     *   如果需要另外一个纹理，应当使用addSpriteFrames:texture方法<br/>
     * </p>
     * @param {String} url 文件路径
     * @param {HTMLImageElement|cc.Texture2D|string} texture
     * @example
     * // 用plist或者json文件把精灵帧加入到精灵帧缓存中
     * cc.spriteFrameCache.addSpriteFrames(s_grossiniPlist);
     * cc.spriteFrameCache.addSpriteFrames(s_grossiniJson);
     */
    addSpriteFrames: function (url, texture) {
        cc.assert(url, cc._LogInfos.spriteFrameCache_addSpriteFrames_2);

		//这里是精灵帧的plist文件么？
        var dict = this._frameConfigCache[url] || cc.loader.getRes(url);
        if(!dict || !dict["frames"])
            return;

        var self = this;
        var frameConfig = self._frameConfigCache[url] || self._getFrameConfig(url);
        //self._checkConflict(frameConfig);                             //TODO
        var frames = frameConfig.frames, meta = frameConfig.meta;
        if(!texture){
            var texturePath = cc.path.changeBasename(url, meta.image || ".png");
            texture = cc.textureCache.addImage(texturePath);
        }else if(texture instanceof cc.Texture2D){
            //么都不做
        }else if(cc.isString(texture)){//string
            texture = cc.textureCache.addImage(texture);
        }else{
            cc.assert(0, cc._LogInfos.spriteFrameCache_addSpriteFrames_3);
        }

        //新建精灵帧
        var spAliases = self._spriteFramesAliases, spriteFrames = self._spriteFrames;
        for (var key in frames) {
            var frame = frames[key];
            var spriteFrame = spriteFrames[key];
            if (!spriteFrame) {
                spriteFrame = new cc.SpriteFrame(texture, frame.rect, frame.rotated, frame.offset, frame.size);
                var aliases = frame.aliases;
                if(aliases){//设置锯齿处理
                    for(var i = 0, li = aliases.length; i < li; i++){
                        var alias = aliases[i];
                        if (spAliases[alias]) {
                            cc.log(cc._LogInfos.spriteFrameCache_addSpriteFrames, alias);
                        }
                        spAliases[alias] = key;
                    }
                }

                if (cc._renderType === cc._RENDER_TYPE_CANVAS && spriteFrame.isRotated()) {
                    //放在画布上
                    var locTexture = spriteFrame.getTexture();
                    if (locTexture.isLoaded()) {
                        var tempElement = spriteFrame.getTexture().getHtmlElementObj();
                        tempElement = cc.cutRotateImageToCanvas(tempElement, spriteFrame.getRectInPixels());
                        var tempTexture = new cc.Texture2D();
                        tempTexture.initWithElement(tempElement);
                        tempTexture.handleLoadedTexture();
                        spriteFrame.setTexture(tempTexture);

                        var rect = spriteFrame._rect;
                        spriteFrame.setRect(cc.rect(0, 0, rect.width, rect.height));
                    }
                }

                spriteFrames[key] = spriteFrame;
            }
        }
    },

	// 判断帧是否已经存在，如果存在那可能会导致名称冲突，则必须要进行处理
    _checkConflict: function (dictionary) {
        var framesDict = dictionary["frames"];

        for (var key in framesDict) {
            if (this._spriteFrames[key]) {
                cc.log(cc._LogInfos.spriteFrameCache__checkConflict, key);
            }
        }
    },

    /**
     * <p>
     *  指定帧名称来添加一个精灵帧<br/>
	 *  如果名称已经存在，那么旧的内容将会被新的内容覆盖
     * </p>
     * @param {cc.SpriteFrame} frame
     * @param {String} frameName
     */
    addSpriteFrame: function (frame, frameName) {
        this._spriteFrames[frameName] = frame;
    },
	 
	/**
     * <p>
     *   清除已加载精灵帧的字典<br/>
     *   如果收到“内存警告”，可以调用此方法<br/>
     *   短期内它会释放一些资源，保证你的app不会被系统杀死<br/>
     *   中期会分配更多的资源<br/>
     *   长期来看没什么不同<br/>
     * </p>
     */
    removeSpriteFrames: function () {
        this._spriteFrames = {};
        this._spriteFramesAliases = {};
    },

    /**
     * 从精灵帧缓存中删除一个精灵帧
     * @param {String} name
     */
    removeSpriteFrameByName: function (name) {
		// 为空判断
        if (!name) {
            return;
        }

		// 是否是一个锯齿
        if (this._spriteFramesAliases[name]) {
            delete(this._spriteFramesAliases[name]);
        }
        if (this._spriteFrames[name]) {
            delete(this._spriteFrames[name]);
        }
		// 因为不知道.plist文件中的起始帧，所以必须从缓存中移除所有.plist文件
    },

    /**
     * <p>
     *     从plist文件中移除多个精灵帧<br/>
     *     存储在这个文件中的精灵帧将会被移除<br/>
     *     当指定的纹理需要被移除的时候，使用这个函数很方便<br/>
     * </p>
     * @param {String} url Plist文件名
     */
    removeSpriteFramesFromFile: function (url) {
        var self = this, spriteFrames = self._spriteFrames,
            aliases = self._spriteFramesAliases, cfg = self._frameConfigCache[url];
        if(!cfg) return;
        var frames = cfg.frames;
        for (var key in frames) {
            if (spriteFrames[key]) {
                delete(spriteFrames[key]);
                for (var alias in aliases) {//remove alias
                    if(aliases[alias] == key) delete aliases[alias];
                }
            }
        }
    },

	/**
     * <p>
     *    移除所有和指定纹理相关联的精灵帧<br/>
     *    当指定的纹理需要被移除的时候，使用这个函数很方便
     * </p>
     * @param {HTMLImageElement|HTMLCanvasElement|cc.Texture2D} texture
     */
    removeSpriteFramesFromTexture: function (texture) {
        var self = this, spriteFrames = self._spriteFrames, aliases = self._spriteFramesAliases;
        for (var key in spriteFrames) {
            var frame = spriteFrames[key];
            if (frame && (frame.getTexture() == texture)) {
                delete(spriteFrames[key]);
                for (var alias in aliases) {//remove alias
                    if(aliases[alias] == key) delete aliases[alias];
                }
            }
        }
    },

	/**
     * <p>
     *   返回之前添加的那个精灵帧<br/>
     *   如果名称没有找到，那么将会返回nil<br/>
     *   如果想使用这个精灵帧的话，应当重新retain一次<br/>
     * </p>
     * @param {String} name 精灵帧的名称
     * @return {cc.SpriteFrame}
     * @example
     * //通过名称来得到精灵帧
     * var frame = cc.spriteFrameCache.getSpriteFrame("grossini_dance_01.png");
     */
    getSpriteFrame: function (name) {
        var self = this, frame = self._spriteFrames[name];
        if (!frame) {
            // try alias dictionary
            var key = self._spriteFramesAliases[name];
            if (key) {
                frame = self._spriteFrames[key.toString()];
                if(!frame) delete self._spriteFramesAliases[name];
            }
        }
        if (!frame) cc.log(cc._LogInfos.spriteFrameCache_getSpriteFrame, name);
        return frame;
    },

	_clear: function () {
		this._spriteFrames = {};
		this._spriteFramesAliases = {};
		this._frameConfigCache = {};
	}
};

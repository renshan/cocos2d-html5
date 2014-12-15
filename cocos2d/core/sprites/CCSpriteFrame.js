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
 *    A cc.SpriteFrame has:<br/> 一个cc.SpriteFrame包括
 *      - texture: A cc.Texture2D that will be used by the cc.Sprite<br/>纹理：一个cc.Sprite使用的cc.Texture2D对象
 *      - rectangle: A rectangle of the texture<br/> 一个纹理的矩形区域
 *    <br/>
 *    You can modify the frame of a cc.Sprite by doing:<br/>可以修改一个cc.Sprite
 * </p>
 * @class
 * @extends cc.Class
 *
 * @param {String|cc.Texture2D} filename 文件名称
 * @param {cc.Rect} rect If parameters' length equal 2, rect in points, else rect in pixels 如果有两个参数，那么是一个用点集表示的矩形区域，非两个参数的话就是用像素画出的矩形区域
 * @param {Boolean} [rotated] Whether the frame is rotated in the texture 是否要在纹理中旋转帧
 * @param {cc.Point} [offset] The offset of the frame in the texture 帧在纹理中的偏移
 * @param {cc.Size} [originalSize] The size of the frame in the texture 帧在纹理中的尺寸
 *
 * @example
 * // 1. Create a cc.SpriteFrame with image path 
 * // 1、使用图像路径新建一个cc.SpriteFrame
 * var frame1 = new cc.SpriteFrame("res/grossini_dance.png",cc.rect(0,0,90,128));
 * var frame2 = new cc.SpriteFrame("res/grossini_dance.png",cc.rect(0,0,90,128),false,0,cc.size(90,128));
 *
 * // 2. Create a cc.SpriteFrame with a texture, rect, rotated, offset and originalSize in pixels. 
 * // 2、用纹理新建一个纹理、矩形区域、旋转值、偏移量和用像素表示的原始大小来新建一个cc.SpriteFrame
 * var texture = cc.textureCache.addImage("res/grossini_dance.png");
 * var frame1 = new cc.SpriteFrame(texture, cc.rect(0,0,90,128));
 * var frame2 = new cc.SpriteFrame(texture, cc.rect(0,0,90,128),false,0,cc.size(90,128));
 */
cc.SpriteFrame = cc.Class.extend(/** @lends cc.SpriteFrame# */{
    _offset:null,
    _originalSize:null,
    _rectInPixels:null,
    _rotated:false,
    _rect:null,
    _offsetInPixels:null,
    _originalSizeInPixels:null,
    _texture:null,
    _textureFilename:"",
    _textureLoaded:false,

    ctor:function (filename, rect, rotated, offset, originalSize) {
        this._offset = cc.p(0, 0);
        this._offsetInPixels = cc.p(0, 0);
        this._originalSize = cc.size(0, 0);
        this._rotated = false;
        this._originalSizeInPixels = cc.size(0, 0);
        this._textureFilename = "";
        this._texture = null;
        this._textureLoaded = false;

        if(filename !== undefined && rect !== undefined ){
            if(rotated === undefined || offset === undefined || originalSize === undefined)
                this.initWithTexture(filename, rect);
            else
                this.initWithTexture(filename, rect, rotated, offset, originalSize)
        }
    },

    /**
     * Returns whether the texture have been loaded 返回纹理是否已经被加载
     * @returns {boolean}
     */
    textureLoaded:function(){
        return this._textureLoaded;
    },

    /**
     * Add a event listener for texture loaded event. 为纹理加载事件增加一个监听
     * @param {Function} callback
     * @param {Object} target
     * @deprecated since 3.1, please use addEventListener instead 从v3.1之后，请使用addEventListener代替
     */
    addLoadedEventListener:function(callback, target){
        this.addEventListener("load", callback, target);
    },

    /**
     * Gets the rect of the frame in the texture 得到纹理中帧的矩形区域
     * @return {cc.Rect}
     */
    getRectInPixels:function () {
        var locRectInPixels = this._rectInPixels;
        return cc.rect(locRectInPixels.x, locRectInPixels.y, locRectInPixels.width, locRectInPixels.height);
    },

    /**
     * Sets the rect of the frame in the texture 设置纹理中帧的矩形区域
     * @param {cc.Rect} rectInPixels
     */
    setRectInPixels:function (rectInPixels) {
        if (!this._rectInPixels){
            this._rectInPixels = cc.rect(0,0,0,0);
        }
        this._rectInPixels.x = rectInPixels.x;
        this._rectInPixels.y = rectInPixels.y;
        this._rectInPixels.width = rectInPixels.width;
        this._rectInPixels.height = rectInPixels.height;
        this._rect = cc.rectPixelsToPoints(rectInPixels);
    },

    /**
     * Returns whether the sprite frame is rotated in the texture. 返回精灵帧是否在纹理中有旋转
     * @return {Boolean}
     */
    isRotated:function () {
        return this._rotated;
    },

    /**
     * Set whether the sprite frame is rotated in the texture. 设定精灵帧是否在纹理中有旋转
     * @param {Boolean} bRotated
     */
    setRotated:function (bRotated) {
        this._rotated = bRotated;
    },

    /**
     * Returns the rect of the sprite frame in the texture 返回在纹理中帧的矩形区域
     * @return {cc.Rect}
     */
    getRect:function () {
        var locRect = this._rect;
        return cc.rect(locRect.x, locRect.y, locRect.width, locRect.height);
    },

    /**
     * Sets the rect of the sprite frame in the texture 设置在纹理中帧的矩形区域
     * @param {cc.Rect} rect
     */
    setRect:function (rect) {
        if (!this._rect){
            this._rect = cc.rect(0,0,0,0);
        }
        this._rect.x = rect.x;
        this._rect.y = rect.y;
        this._rect.width = rect.width;
        this._rect.height = rect.height;
        this._rectInPixels = cc.rectPointsToPixels(this._rect);
    },

    /**
     * Returns the offset of the sprite frame in the texture in pixel 返回精灵帧在纹理中的偏移，返回值用像素表示
     * @return {cc.Point}
     */
    getOffsetInPixels:function () {
        return cc.p(this._offsetInPixels);
    },

    /**
     * Sets the offset of the sprite frame in the texture in pixel 用像素设置精灵帧在纹理中的偏移
     * @param {cc.Point} offsetInPixels
     */
    setOffsetInPixels:function (offsetInPixels) {
        this._offsetInPixels.x = offsetInPixels.x;
        this._offsetInPixels.y = offsetInPixels.y;
        cc._pointPixelsToPointsOut(this._offsetInPixels, this._offset);
    },

    /**
     * Returns the original size of the trimmed image 返回裁剪图像的原始大小
     * @return {cc.Size}
     */
    getOriginalSizeInPixels:function () {
        return cc.size(this._originalSizeInPixels);
    },

    /**
     * Sets the original size of the trimmed image 设置裁剪图像的原始大小
     * @param {cc.Size} sizeInPixels
     */
    setOriginalSizeInPixels:function (sizeInPixels) {
        this._originalSizeInPixels.width = sizeInPixels.width;
        this._originalSizeInPixels.height = sizeInPixels.height;
    },

    /**
     * Returns the original size of the trimmed image 返回裁剪图像的原始大小
     * @return {cc.Size}
     */
    getOriginalSize:function () {
        return cc.size(this._originalSize);
    },

    /**
     * Sets the original size of the trimmed image 设置裁剪图像的原始大小
     * @param {cc.Size} sizeInPixels
     */
    setOriginalSize:function (sizeInPixels) {
        this._originalSize.width = sizeInPixels.width;
        this._originalSize.height = sizeInPixels.height;
    },

    /**
     * Returns the texture of the frame 返回帧的纹理
     * @return {cc.Texture2D}
     */
    getTexture:function () {
        if (this._texture)
            return this._texture;
        if (this._textureFilename !== "") {
            var locTexture = cc.textureCache.addImage(this._textureFilename);
            if (locTexture)
                this._textureLoaded = locTexture.isLoaded();
            return locTexture;
        }
        return null;
    },

    /**
     * Sets the texture of the frame, the texture is retained automatically 设置帧的纹理，纹理将会默认被保持在帧中
     * @param {cc.Texture2D} texture
     */
    setTexture:function (texture) {
        if (this._texture != texture) {
            var locLoaded = texture.isLoaded();
            this._textureLoaded = locLoaded;
            this._texture = texture;
            if(!locLoaded){
                texture.addEventListener("load", function(sender){
                    this._textureLoaded = true;
                    if(this._rotated && cc._renderType === cc._RENDER_TYPE_CANVAS){
                        var tempElement = sender.getHtmlElementObj();
                        tempElement = cc.cutRotateImageToCanvas(tempElement, this.getRect());
                        var tempTexture = new cc.Texture2D();
                        tempTexture.initWithElement(tempElement);
                        tempTexture.handleLoadedTexture();
                        this.setTexture(tempTexture);

                        var rect = this.getRect();
                        this.setRect(cc.rect(0, 0, rect.width, rect.height));
                    }
                    var locRect = this._rect;
                    if(locRect.width === 0 && locRect.height === 0){
                        var w = sender.width, h = sender.height;
                        this._rect.width = w;
                        this._rect.height = h;
                        this._rectInPixels = cc.rectPointsToPixels(this._rect);
                        this._originalSizeInPixels.width = this._rectInPixels.width;
                        this._originalSizeInPixels.height = this._rectInPixels.height;
                        this._originalSize.width =  w;
                        this._originalSize.height =  h;
                    }
                    //dispatch 'load' event of cc.SpriteFrame 触发cc.SpriteFrame的load事件
                    this.dispatchEvent("load");
                }, this);
            }
        }
    },

    /**
     * Returns the offset of the frame in the texture 返回纹理中帧的偏移
     * @return {cc.Point}
     */
    getOffset:function () {
        return cc.p(this._offset);
    },

    /**
     * Sets the offset of the frame in the texture 设置纹理中帧的偏移
     * @param {cc.Point} offsets
     */
    setOffset:function (offsets) {
        this._offset.x = offsets.x;
        this._offset.y = offsets.y;
    },

    /**
     * Clone the sprite frame 复制精灵帧
     * @returns {SpriteFrame}
     */
    clone: function(){
        var frame = new cc.SpriteFrame();
        frame.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
        frame.setTexture(this._texture);
        return frame;
    },

    /**
     * Copy the sprite frame 拷贝精灵帧
     * @return {cc.SpriteFrame}
     */
    copyWithZone:function () {
        var copy = new cc.SpriteFrame();
        copy.initWithTexture(this._textureFilename, this._rectInPixels, this._rotated, this._offsetInPixels, this._originalSizeInPixels);
        copy.setTexture(this._texture);
        return copy;
    },

    /**
     * Copy the sprite frame 拷贝精灵帧
     * @returns {cc.SpriteFrame}
     */
    copy:function () {
        return this.copyWithZone();
    },

    /**
     * Initializes SpriteFrame with Texture, rect, rotated, offset and originalSize in pixels.<br/>
     * Please pass parameters to the constructor to initialize the sprite, do not call this function yourself.
     * @param {String|cc.Texture2D} texture
     * @param {cc.Rect} rect if parameters' length equal 2, rect in points, else rect in pixels
     * @param {Boolean} [rotated=false]
     * @param {cc.Point} [offset=cc.p(0,0)]
     * @param {cc.Size} [originalSize=rect.size]
     * @return {Boolean}
     */
	 
	/**
     * 使用纹理、矩形区域、旋转角度、偏移和用像素表示的原始尺寸来初始化一个精灵帧<br/>
     * 请使用构造函数来初始化精灵，不要直接调用这个函数
     * @param {String|cc.Texture2D} texture
     * @param {cc.Rect} rect 如果参数的个数为2，那么返回用点集表示的矩形区域，如果不为2，那么返回用像素表示的区域
     * @param {Boolean} [rotated=false]
     * @param {cc.Point} [offset=cc.p(0,0)]
     * @param {cc.Size} [originalSize=rect.size]
     * @return {Boolean}
     */
    initWithTexture:function (texture, rect, rotated, offset, originalSize) {
        if(arguments.length === 2)
            rect = cc.rectPointsToPixels(rect);

        offset = offset || cc.p(0, 0);
        originalSize = originalSize || rect;
        rotated = rotated || false;

        if (cc.isString(texture)){
            this._texture = null;
            this._textureFilename = texture;
        } else if (texture instanceof cc.Texture2D){
            this.setTexture(texture);
        }

        texture = this.getTexture();

        this._rectInPixels = rect;
        rect = this._rect = cc.rectPixelsToPoints(rect);
        
        if(texture && texture.url && texture.isLoaded()) {
            var _x, _y;
            if(rotated){
                _x = rect.x + rect.height;
                _y = rect.y + rect.width;
            }else{
                _x = rect.x + rect.width;
                _y = rect.y + rect.height;
            }
            if(_x > texture.getPixelsWide()){
                cc.error(cc._LogInfos.RectWidth, texture.url);
            }
            if(_y > texture.getPixelsHigh()){
                cc.error(cc._LogInfos.RectHeight, texture.url);
            }
        }

        this._offsetInPixels.x = offset.x;
        this._offsetInPixels.y = offset.y;
        cc._pointPixelsToPointsOut(offset, this._offset);
        this._originalSizeInPixels.width = originalSize.width;
        this._originalSizeInPixels.height = originalSize.height;
        cc._sizePixelsToPointsOut(originalSize, this._originalSize);
        this._rotated = rotated;
        return true;
    }
});

cc.EventHelper.prototype.apply(cc.SpriteFrame.prototype);

/**
 * <p>
 *    Create a cc.SpriteFrame with a texture filename, rect, rotated, offset and originalSize in pixels.<br/>
 *    使用纹理文件名、矩形区域、旋转角度、偏移和像素表示的原始大小来新建一个精灵帧<br/>
 *    The originalSize is the size in pixels of the frame before being trimmed.
 *    原始大小是指在帧被裁剪之前用像素表示的尺寸
 * </p>
 * @deprecated since v3.0, please use new construction instead 从v3.0版本之后，请使用新的构造函数来代替
 * @see cc.SpriteFrame
 * @param {String|cc.Texture2D} filename
 * @param {cc.Rect} rect if parameters' length equal 2, rect in points, else rect in pixels 
 * 如果参数的个数为2，那么返回用点集表示的矩形区域，如果不为2，那么返回用像素表示的区域
 * @param {Boolean} rotated
 * @param {cc.Point} offset
 * @param {cc.Size} originalSize
 * @return {cc.SpriteFrame}
 */
cc.SpriteFrame.create = function (filename, rect, rotated, offset, originalSize) {
    return new cc.SpriteFrame(filename,rect,rotated,offset,originalSize);
};

/**
 * @deprecated since v3.0, please use new construction instead 从v3.0版本之后，请使用新的构造函数来代替
 * @see cc.SpriteFrame
 * @function
 */
cc.SpriteFrame.createWithTexture = cc.SpriteFrame.create;

cc.SpriteFrame._frameWithTextureForCanvas = function (texture, rect, rotated, offset, originalSize) {
    var spriteFrame = new cc.SpriteFrame();
    spriteFrame._texture = texture;
    spriteFrame._rectInPixels = rect;
    spriteFrame._rect = cc.rectPixelsToPoints(rect);
    spriteFrame._offsetInPixels.x = offset.x;
    spriteFrame._offsetInPixels.y = offset.y;
    cc._pointPixelsToPointsOut(spriteFrame._offsetInPixels, spriteFrame._offset);
    spriteFrame._originalSizeInPixels.width = originalSize.width;
    spriteFrame._originalSizeInPixels.height = originalSize.height;
    cc._sizePixelsToPointsOut(spriteFrame._originalSizeInPixels, spriteFrame._originalSize);
    spriteFrame._rotated = rotated;
    return spriteFrame;
};

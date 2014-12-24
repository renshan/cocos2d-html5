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
 * 使用"multiply"操作，为一个纹理着色
 * @param {HTMLImageElement} image
 * @param {cc.Color} color
 * @param {cc.Rect} [rect]
 * @param {HTMLCanvasElement} renderCanvas
 * @returns {HTMLCanvasElement}
 */
cc.generateTintImageWithMultiply = function(image, color, rect, renderCanvas){
    renderCanvas = renderCanvas || cc.newElement("canvas");

    rect = rect || cc.rect(0,0, image.width, image.height);

    var context = renderCanvas.getContext( "2d" );
    if(renderCanvas.width != rect.width || renderCanvas.height != rect.height){
        renderCanvas.width = rect.width;
        renderCanvas.height = rect.height;
    }else{
        context.globalCompositeOperation = "source-over";
    }

    context.fillStyle = "rgb(" + (0|color.r) + "," + (0|color.g) + "," + (0|color.b) + ")";
    context.fillRect(0, 0, rect.width, rect.height);
    context.globalCompositeOperation = "multiply";
    context.drawImage(image,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        0,
        0,
        rect.width,
        rect.height);
    context.globalCompositeOperation = "destination-atop";
    context.drawImage(image,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        0,
        0,
        rect.width,
        rect.height);
    return renderCanvas;
};

/**
 * 使用lighter生成着色纹理。
 * lighter:    将原色以及目标色相加，得到一个更明亮的颜色，
 * 颜色值加1(那个颜色的最大亮度)。
 * @function
 * @param {HTMLImageElement} texture
 * @param {Array} tintedImgCache
 * @param {cc.Color} color
 * @param {cc.Rect} rect
 * @param {HTMLCanvasElement} [renderCanvas]
 * @return {HTMLCanvasElement}
 */
cc.generateTintImage = function (texture, tintedImgCache, color, rect, renderCanvas) {
    if (!rect)
        rect = cc.rect(0, 0, texture.width, texture.height);

    var r = color.r / 255;
    var g = color.g / 255;
    var b = color.b / 255;
    var w = Math.min(rect.width, tintedImgCache[0].width);
    var h = Math.min(rect.height, tintedImgCache[0].height);
    var buff = renderCanvas;
    var ctx;

    //如果条件允许，创建一个新的buffer
    if (!buff) {
        buff = cc.newElement("canvas");
        buff.width = w;
        buff.height = h;
        ctx = buff.getContext("2d");
    } else {
        ctx = buff.getContext("2d");
        ctx.clearRect(0, 0, w, h);
    }

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    //在心里牢牢记住renderCanvas测试版，防止透支
    var a = ctx.globalAlpha;
    if (r > 0) {
        ctx.globalAlpha = r * a;
        ctx.drawImage(tintedImgCache[0], rect.x, rect.y, w, h, 0, 0, w, h);
    }
    if (g > 0) {
        ctx.globalAlpha = g * a;
        ctx.drawImage(tintedImgCache[1], rect.x, rect.y, w, h, 0, 0, w, h);
    }
    if (b > 0) {
        ctx.globalAlpha = b * a;
        ctx.drawImage(tintedImgCache[2], rect.x, rect.y, w, h, 0, 0, w, h);
    }

    if (r + g + b < 1) {
        ctx.globalAlpha = a;
        ctx.drawImage(tintedImgCache[3], rect.x, rect.y, w, h, 0, 0, w, h);
    }

    ctx.restore();
    return buff;
};

/**
 * 为着色创建纹理缓存
 * @function
 * @param {HTMLImageElement} texture
 * @return {Array}
 */
cc.generateTextureCacheForColor = function (texture) {
    if (texture.channelCache) {
        return texture.channelCache;
    }

    var textureCache = [
        cc.newElement("canvas"),
        cc.newElement("canvas"),
        cc.newElement("canvas"),
        cc.newElement("canvas")
    ];

    function renderToCache() {
        var ref = cc.generateTextureCacheForColor;

        var w = texture.width;
        var h = texture.height;

        textureCache[0].width = w;
        textureCache[0].height = h;
        textureCache[1].width = w;
        textureCache[1].height = h;
        textureCache[2].width = w;
        textureCache[2].height = h;
        textureCache[3].width = w;
        textureCache[3].height = h;

        ref.canvas.width = w;
        ref.canvas.height = h;

        var ctx = ref.canvas.getContext("2d");
        ctx.drawImage(texture, 0, 0);

        ref.tempCanvas.width = w;
        ref.tempCanvas.height = h;

        var pixels = ctx.getImageData(0, 0, w, h).data;

        for (var rgbI = 0; rgbI < 4; rgbI++) {
            var cacheCtx = textureCache[rgbI].getContext('2d');
            cacheCtx.getImageData(0, 0, w, h).data;
            ref.tempCtx.drawImage(texture, 0, 0);

            var to = ref.tempCtx.getImageData(0, 0, w, h);
            var toData = to.data;

            for (var i = 0; i < pixels.length; i += 4) {
                toData[i  ] = (rgbI === 0) ? pixels[i  ] : 0;
                toData[i + 1] = (rgbI === 1) ? pixels[i + 1] : 0;
                toData[i + 2] = (rgbI === 2) ? pixels[i + 2] : 0;
                toData[i + 3] = pixels[i + 3];
            }
            cacheCtx.putImageData(to, 0, 0);
        }
        texture.onload = null;
    }

    try {
        renderToCache();
    } catch (e) {
        texture.onload = renderToCache;
    }

    texture.channelCache = textureCache;
    return textureCache;
};

cc.generateTextureCacheForColor.canvas = cc.newElement('canvas');
cc.generateTextureCacheForColor.tempCanvas = cc.newElement('canvas');
cc.generateTextureCacheForColor.tempCtx = cc.generateTextureCacheForColor.tempCanvas.getContext('2d');

cc.cutRotateImageToCanvas = function (texture, rect) {
    if (!texture)
        return null;

    if (!rect)
        return texture;

    var nCanvas = cc.newElement("canvas");
    nCanvas.width = rect.width;
    nCanvas.height = rect.height;
    var ctx = nCanvas.getContext("2d");
    ctx.translate(nCanvas.width / 2, nCanvas.height / 2);
    ctx.rotate(-1.5707963267948966);
    ctx.drawImage(texture, rect.x, rect.y, rect.height, rect.width, -rect.height / 2, -rect.width / 2, rect.height, rect.width);
    return nCanvas;
};

cc._getCompositeOperationByBlendFunc = function(blendFunc){
    if(!blendFunc)
        return "source-over";
    else{
        if(( blendFunc.src == cc.SRC_ALPHA && blendFunc.dst == cc.ONE) || (blendFunc.src == cc.ONE && blendFunc.dst == cc.ONE))
            return "lighter";
        else if(blendFunc.src == cc.ZERO && blendFunc.dst == cc.SRC_ALPHA)
            return "destination-in";
        else if(blendFunc.src == cc.ZERO && blendFunc.dst == cc.ONE_MINUS_SRC_ALPHA)
            return "destination-out";
        else
            return "source-over";
    }
};

/**
 * <p>Sprite是一个二维图像 ( 参见：http://en.wikipedia.org/wiki/Sprite_(computer_graphics)  <br/>
 *
 * 可以通过一个图像或者一个经过矩形裁剪后的图像创建Sprite。  <br/>
 *
 * 如果父节点或者任一个祖宗节点是cc.SpriteBatchNode，其特点或者限制如下：<br/>
 *    - 特点：（当父节点是cc.BatchNode）<br/>
 *        - 渲染快的多，特别是如果cc.SpriteBatchNode有许多的子节点类时，这些子类会在一个批处理内绘制。<br/>
 *
 *    - 限制：   <br/>
 *        - 相机暂时不支持 (例如： CCOrbitCamera 动作不工作)；  <br/>
 *        - 以GridBase为基类的动作不支持 (例如： CCLens, CCRipple, CCTwirl)； <br/>
 *        - Alias/Antialias属性属于CCSpriteBatchNode，所以不能分别设置aliased属性； <br/>
 *        - Blending function属性属于CCSpriteBatchNode，所以不能分别设置blending function属性；<br/>
 *        - 视差滚动（Parallax scroller）不支持，但是可以通过一个“代理”精灵来模拟      <br/>
 *
 *  如果父节点是一个标准的cc.Node，那么cc.Sprite的行为类似于其他的cc.Node:      <br/>
 *    - 支持blending functions    <br/>
 *    - 支持aliasing / antialiasing    <br/>
 *    - 但是渲染会慢一些：每个子节点绘制一次 <br/>
 *
 * 精灵的默认的锚点(anchorPoint)为(0.5, 0.5)。<p/>
 *
 * @class
 * @extends cc.Node
 *
 * @param {String|cc.SpriteFrame|HTMLImageElement|cc.Texture2D} fileName  一个表示图片文件路径的字符串 例如："scene1/monster.png"。
 * @param {cc.Rect} rect  仅在矩形范围内的纹理才用于创建精灵
 * @param {Boolean} [rotated] 纹理的矩形是否旋转
 * @example
 *
 * 1.通过图片路径和矩形创建精灵。
 * var sprite1 = new cc.Sprite("res/HelloHTML5World.png");
 * var sprite2 = new cc.Sprite("res/HelloHTML5World.png",cc.rect(0,0,480,320));
 *
 * 2.通过精灵帧名创建精灵，在精灵帧名之前必须加上"#"。
 * var sprite = new cc.Sprite('#grossini_dance_01.png');
 *
 * 3.通过精灵帧创建精灵。
 * var spriteFrame = cc.spriteFrameCache.getSpriteFrame("grossini_dance_01.png");
 * var sprite = new cc.Sprite(spriteFrame);
 *
 * 4.通过包含于CCTexture2D对象中的一个已经存在的纹理创建精灵，
 *      创建完成以后，矩形是纹理的尺寸，并且偏移是（0,0)。
 * var texture = cc.textureCache.addImage("HelloHTML5World.png");
 * var sprite1 = new cc.Sprite(texture);
 * var sprite2 = new cc.Sprite(texture, cc.rect(0,0,480,320));
 *
 * @property {Boolean}              dirty               - 表示精灵是否需要更新。
 * @property {Boolean}              flippedX            - 表示精灵的X轴方向是否翻转。
 * @property {Boolean}              flippedY            - 表示精灵的Y轴方向是否翻转。
 * @property {Number}               offsetX             - <@readonly> X轴方向精灵的偏移位置。像Zwoptex一样由编辑器计算。
 * @property {Number}               offsetY             - <@readonly> Y轴方向精灵的偏移位置。像Zwoptex一样由编辑器计算。
 * @property {Number}               atlasIndex          - 纹理集（TextureAtlas）使用的序号。
 * @property {cc.Texture2D}         texture             - 用于渲染精灵的纹理。
 * @property {Boolean}              textureRectRotated  - <@readonly> 表示纹理矩形是否旋转。
 * @property {cc.TextureAtlas}      textureAtlas        - 当精灵通过cc.SpriteBatchNode进行渲染时，cc.TextureAtlas的弱引用。
 * @property {cc.SpriteBatchNode}   batchNode           - 当精灵通过cc.SpriteBatchNode进行渲染时的批处理节点对象。
 * @property {cc.V3F_C4B_T2F_Quad}  quad                - <@readonly> 返回quad （纹理坐标，顶点坐标和颜色）信息。
 */
cc.Sprite = cc.Node.extend(/** @lends cc.Sprite# */{
	dirty:false,
	atlasIndex:0,
    textureAtlas:null,

    _batchNode:null,
    _recursiveDirty:null, //精灵子节点是否全部都需要更新
    _hasChildren:null, //精灵是否包含子节点
    _shouldBeHidden:false, //当祖先节点设置为不可视时不应该绘制
    _transformToBatch:null,

    //
    // 在精灵是自传递时使用的数据
    // 
    _blendFunc:null, //必须的，为了CCTextureProtocol的继承
    _texture:null, //用来传递精灵的cc.Texture2D对象

    //
    // 共享数据
    //
    // 纹理
    _rect:null, //cc.Texture2D矩形
    _rectRotated:false, //纹理是否有旋转

    // 位置偏移量(被Zwoptex所使用)
    _offsetPosition:null, // 绝对定位
    _unflippedOffsetPositionFromCenter:null,

    _opacityModifyRGB:false,

    // 图片翻转
    _flippedX:false, //精灵是否有水平翻转
    _flippedY:false, //精灵是否有垂直翻转

    _textureLoaded:false,
    _newTextureWhenChangeColor: null,         //LabelBMFont的hack属性
    _className:"Sprite",

    //为了更新纹理调整
    _oldDisplayColor: cc.color.WHITE,

    /**
     * 返回纹理是否被加载
     * @returns {boolean}
     */
    textureLoaded:function(){
        return this._textureLoaded;
    },

    /**
     * 为加载纹理事件增加一个事件侦听器
     * @param {Function} callback
     * @param {Object} target
     * @deprecated 自 3.1，使用addEventListener代替
     */
    addLoadedEventListener:function(callback, target){
        this.addEventListener("load", callback, target);
    },

    /**
     * 返回精灵在Atlas中是否需要更新
     * @return {Boolean} 如果精灵在Atlas中需要更新，则返回true，否则返回false。
     */
    isDirty:function () {
        return this.dirty;
    },

    /**
     * 设置精灵在Atlas中是否需要更新
     * @param {Boolean} bDirty
     */
    setDirty:function (bDirty) {
        this.dirty = bDirty;
    },

    /**
     * 返回纹理矩形是否旋转
     * @return {Boolean}
     */
    isTextureRectRotated:function () {
        return this._rectRotated;
    },

    /**
     * 返回在纹理集（TextureAtlas）中使用的序号。
     * @return {Number}
     */
    getAtlasIndex:function () {
        return this.atlasIndex;
    },

    /**
     * 设置纹理集（TextureAtlas）使用的序号。
     * @warning 除非你知道你在做什么，否则不要修改这个值。
     * @param {Number} atlasIndex
     */
    setAtlasIndex:function (atlasIndex) {
        this.atlasIndex = atlasIndex;
    },

    /**
     * 返回精灵的矩形
     * @return {cc.Rect}
     */
    getTextureRect:function () {
        return cc.rect(this._rect);
    },

    /**
     * 返回当精灵通过cc.SpriteBatchNode进行渲染时，cc.TextureAtlas的弱引用。
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas:function () {
        return this.textureAtlas;
    },

    /**
     * 设置当精灵通过cc.SpriteBatchNode进行渲染时，cc.TextureAtlas的弱引用。
     * @param {cc.TextureAtlas} textureAtlas
     */
    setTextureAtlas:function (textureAtlas) {
        this.textureAtlas = textureAtlas;
    },

    /**
     * 精灵的偏移位置。像Zwoptex一样由编辑器计算。
     * @return {cc.Point}
     */
    getOffsetPosition:function () {
        return cc.p(this._offsetPosition);
    },

	_getOffsetX: function () {
		return this._offsetPosition.x;
	},
	_getOffsetY: function () {
		return this._offsetPosition.y;
	},

    /**
     * 返回blend function
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._blendFunc;
    },

    /**
     * 使用精灵帧初始化精灵。精灵帧中包含的纹理和矩形会被应用于这个精灵。<br/>
     * 请把参数传递给构造函数来初始化精灵，不要自己调用这个方法。
     * @param {cc.SpriteFrame} spriteFrame 一个cc.SpriteFrame对象. 包含一个可用的纹理和矩形。
     * @return {Boolean}  如果精灵呗正常的初始化，则返回true，否则返回false。
     */
    initWithSpriteFrame:function (spriteFrame) {

        cc.assert(spriteFrame, cc._LogInfos.Sprite_initWithSpriteFrame);

        if(!spriteFrame.textureLoaded()){
            //add event listener
            this._textureLoaded = false;
            spriteFrame.addEventListener("load", this._spriteFrameLoadedCallback, this);
        }

        var rotated = cc._renderType === cc._RENDER_TYPE_CANVAS ? false : spriteFrame._rotated;
        var ret = this.initWithTexture(spriteFrame.getTexture(), spriteFrame.getRect(), rotated);
        this.setSpriteFrame(spriteFrame);

        return ret;
    },

    _spriteFrameLoadedCallback:null,

    /**
     * 使用一个精灵帧名初始化精灵。<br/>
     * 一个cc.SpriteFrame对象将通过名称从cc.SpriteFrameCache获取。  <br/>
     * 如果cc.SpriteFrame对象不存在，会抛出一个异常。<br/>
     * 请把参数传递给构造函数来初始化精灵，不要自己调用这个方法。
     * @param {String} spriteFrameName 一个可以从cc.SpriteFrameCache获取可用的cc.SpriteFrame对象的关键字。
     * @return {Boolean}  如果精灵呗正常的初始化，则返回true，否则返回false。
     * @example
     * var sprite = new cc.Sprite();
     * sprite.initWithSpriteFrameName("grossini_dance_01.png");
     */
    initWithSpriteFrameName:function (spriteFrameName) {
        cc.assert(spriteFrameName, cc._LogInfos.Sprite_initWithSpriteFrameName);
        var frame = cc.spriteFrameCache.getSpriteFrame(spriteFrameName);
        cc.assert(frame, spriteFrameName + cc._LogInfos.Sprite_initWithSpriteFrameName1);
        return this.initWithSpriteFrame(frame);
    },

    /**
     * 通知精灵使用batch node进行渲染。
     * @param {cc.SpriteBatchNode} batchNode
     */
    useBatchNode:function (batchNode) {
        this.textureAtlas = batchNode.textureAtlas; // weak ref
        this._batchNode = batchNode;
    },

    /**
     * <p>
     *    设置顶点矩形<br/>
     *    由setTextureRect方法会被内部调用。                      <br/>
     *    用于在视网膜屏(Retina Display)上显示2倍大小的标清图像。 <br/>
     *    不能手工调用此方法，应该调用setTextureRect实现相应的功能。 <br/>
     *    （重载这个方法可以创建"两倍缩放"的精灵）
     * </p>
     * @param {cc.Rect} rect
     */
    setVertexRect:function (rect) {
        var locRect = this._rect;
        locRect.x = rect.x;
        locRect.y = rect.y;
        locRect.width = rect.width;
        locRect.height = rect.height;
    },

    /**
     * 重新排序这个精灵节点的所有子节点。
     * @override
     */
    sortAllChildren:function () {
        if (this._reorderChildDirty) {
            var _children = this._children;

            // 插入排序法
            var len = _children.length, i, j, tmp;
            for(i=1; i<len; i++){
                tmp = _children[i];
                j = i - 1;

                //当zOrder较小或者zOrder一样大但mutatedIndex较小时向下移动元素
                while(j >= 0){
                    if(tmp._localZOrder < _children[j]._localZOrder){
                        _children[j+1] = _children[j];
                    }else if(tmp._localZOrder === _children[j]._localZOrder && tmp.arrivalOrder < _children[j].arrivalOrder){
                        _children[j+1] = _children[j];
                    }else{
                        break;
                    }
                    j--;
                }
                _children[j+1] = tmp;
            }

            if (this._batchNode) {
                this._arrayMakeObjectsPerformSelector(_children, cc.Node._stateCallbackType.sortAllChildren);
            }

            //不需要检查子节点递归, 在访问每个子节点时已检查
            this._reorderChildDirty = false;
        }

    },

    /**
     * 根据新的Z值重新排序子节点。  （重载 cc.Node）
     * @param {cc.Node} child
     * @param {Number} zOrder
     * @override
     */
    reorderChild:function (child, zOrder) {
        cc.assert(child, cc._LogInfos.Sprite_reorderChild_2);
        if(this._children.indexOf(child) === -1){
            cc.log(cc._LogInfos.Sprite_reorderChild);
            return;
        }

        if (zOrder === child.zIndex)
            return;

        if (this._batchNode && !this._reorderChildDirty) {
            this._setReorderChildDirtyRecursively();
            this._batchNode.reorderBatch(true);
        }
        cc.Node.prototype.reorderChild.call(this, child, zOrder);
    },

    /**
     * 从精灵中移除一个子节点。
     * @param child
     * @param cleanup  是否清理所有正在运行的动作
     * @override
     */
    removeChild:function (child, cleanup) {
        if (this._batchNode)
            this._batchNode.removeSpriteFromAtlas(child);
        cc.Node.prototype.removeChild.call(this, child, cleanup);
    },

    /**
     * 设置精灵是否可见。
     * @param {Boolean} visible
     * @override
     */
    setVisible:function (visible) {
        cc.Node.prototype.setVisible.call(this, visible);
        this.setDirtyRecursively(true);
    },

    /**
     * 从容器中移除所有的子节点。
     * @param cleanup 是否清理所有正在运行的动作
     * @override
     */
    removeAllChildren:function (cleanup) {
        var locChildren = this._children, locBatchNode = this._batchNode;
        if (locBatchNode && locChildren != null) {
            for (var i = 0, len = locChildren.length; i < len; i++)
                locBatchNode.removeSpriteFromAtlas(locChildren[i]);
        }

        cc.Node.prototype.removeAllChildren.call(this, cleanup);
        this._hasChildren = false;
    },

    //
    // cc.Node属性过量
    //
	/**
	 * 递归设置dirty标志。
	 * 仅在父节点是cc.SpriteBatchNode时使用。
	 * @param {Boolean} value
	 */
	setDirtyRecursively:function (value) {
		this._recursiveDirty = value;
		this.dirty = value;
		// recursively set dirty
		var locChildren = this._children, child, l = locChildren ? locChildren.length : 0;
		for (var i = 0; i < l; i++) {
			child = locChildren[i];
			(child instanceof cc.Sprite) && child.setDirtyRecursively(true);
		}
	},

	/**
	 * 设置节点为dirty
	 * @param {Boolean} norecursive 当传入true时，子节点不会递归设置为dirty，默认会
	 * @override
	 */
	setNodeDirty: function(norecursive) {
		cc.Node.prototype.setNodeDirty.call(this);
		// Lazy set dirty
		if (!norecursive && this._batchNode && !this._recursiveDirty) {
			if (this._hasChildren)
				this.setDirtyRecursively(true);
			else {
				this._recursiveDirty = true;
				this.dirty = true;
			}
		}
	},

    /**
     * 设置定位时是否忽略锚点
     * @param {Boolean} relative
     * @override
     */
    ignoreAnchorPointForPosition:function (relative) {
        if(this._batchNode){
            cc.log(cc._LogInfos.Sprite_ignoreAnchorPointForPosition);
            return;
        }
        cc.Node.prototype.ignoreAnchorPointForPosition.call(this, relative);
    },

    /**
     * 设置精灵横向是否翻转。
     * @param {Boolean} flippedX 传入true时，精灵会横向翻转，false不会
     */
    setFlippedX:function (flippedX) {
        if (this._flippedX != flippedX) {
            this._flippedX = flippedX;
            this.setTextureRect(this._rect, this._rectRotated, this._contentSize);
            this.setNodeDirty(true);
        }
    },

    /**
     * 设置精灵纵向是否翻转。
     * @param {Boolean} flippedY 传入true时，精灵会纵向翻转，false不会
     */
    setFlippedY:function (flippedY) {
        if (this._flippedY != flippedY) {
            this._flippedY = flippedY;
            this.setTextureRect(this._rect, this._rectRotated, this._contentSize);
            this.setNodeDirty(true);
        }
    },

    /**
     * <p>
     * 返回精灵是否横向翻转的标志。                  <br/>
     *                                                                                                              <br/>
     * 仅仅翻转精灵的纹理，而不是精灵子节点的纹理。                   <br/>
     * 并且翻转纹理不会修改锚点。                                               <br/>
     * 如果你想翻转精灵的锚点，并且翻转它的子节点，使用：                            <br/>
     *      sprite.setScaleX(sprite.getScaleX() * -1);  <p/>
     * @return {Boolean} 如果精灵横向翻转返回true，否则返回false。
     */
    isFlippedX:function () {
        return this._flippedX;
    },

    /**
     * <p>
     *     返回精灵是否纵向翻转的标志。                      <br/>
     *                                                                                                              <br/>
     * 仅仅翻转精灵的纹理，而不是精灵子节点的纹理。                   <br/>
     * 并且翻转纹理不会修改锚点。                                               <br/>
     * 如果你想翻转精灵的锚点，并且翻转它的子节点，使用：                            <br/>
     *         sprite.setScaleY(sprite.getScaleY() * -1); <p/>
     * @return {Boolean} 如果精灵纵向翻转返回true，否则返回false。
     */
    isFlippedY:function () {
        return this._flippedY;
    },

    //
    // RGBA protocol
    //
    /**
     * 设置透明度是否修改颜色。
     * @function
     * @param {Boolean} modify
     */
    setOpacityModifyRGB:null,

    /**
     * 返回透明度是否修改颜色。
     * @return {Boolean}
     */
    isOpacityModifyRGB:function () {
        return this._opacityModifyRGB;
    },

    /**
     * 更新显示透明度。
     * @function
     */
    updateDisplayedOpacity: null,

    // 动画
    /**
     * 通过动画名和序号修改显示的帧。<br/>
     * 从CCAnimationCache获取动画名
     * @param {String} animationName
     * @param {Number} frameIndex
     */
    setDisplayFrameWithAnimationName:function (animationName, frameIndex) {
        cc.assert(animationName, cc._LogInfos.Sprite_setDisplayFrameWithAnimationName_3);

        var cache = cc.animationCache.getAnimation(animationName);
        if(!cache){
            cc.log(cc._LogInfos.Sprite_setDisplayFrameWithAnimationName);
            return;
        }
        var animFrame = cache.getFrames()[frameIndex];
        if(!animFrame){
            cc.log(cc._LogInfos.Sprite_setDisplayFrameWithAnimationName_2);
            return;
        }
        this.setSpriteFrame(animFrame.getSpriteFrame());
    },

    /**
     * 如果精灵通过cc.SpriteBatchNode进行渲染，返回批处理节点对象。
     * @returns {cc.SpriteBatchNode|null} 如果精灵通过cc.SpriteBatchNode进行渲染，则返回cc.SpriteBatchNode对象，否则返回null。
     */
    getBatchNode:function () {
        return this._batchNode;
    },

    _setReorderChildDirtyRecursively:function () {
        //only set parents flag the first time
        if (!this._reorderChildDirty) {
            this._reorderChildDirty = true;
            var pNode = this._parent;
            while (pNode && pNode != this._batchNode) {
                pNode._setReorderChildDirtyRecursively();
                pNode = pNode.parent;
            }
        }
    },

    /**
     * 返回精灵节点的纹理
     * @returns {cc.Texture2D}
     */
    getTexture:function () {
        return this._texture;
    },

    _quad: null, // 顶点坐标, 纹理坐标和颜色说明
    _quadWebBuffer: null,
    _quadDirty: false,
    _colorized: false,
    _blendFuncStr: "source-over",
    _originalTexture: null,
    _drawSize_Canvas: null,

    ctor: null,

	_softInit: function (fileName, rect, rotated) {
		if (fileName === undefined)
			cc.Sprite.prototype.init.call(this);
		else if (cc.isString(fileName)) {
			if (fileName[0] === "#") {
				// 用精灵帧名称初始化
				var frameName = fileName.substr(1, fileName.length - 1);
				var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameName);
				this.initWithSpriteFrame(spriteFrame);
			} else {
				// 用文件名和矩形初始化
				cc.Sprite.prototype.init.call(this, fileName, rect);
			}
		} else if (cc.isObject(fileName)) {
			if (fileName instanceof cc.Texture2D) {
				// 用纹理和矩形初始化
				this.initWithTexture(fileName, rect, rotated);
			} else if (fileName instanceof cc.SpriteFrame) {
				// 用一个精灵帧初始化
				this.initWithSpriteFrame(fileName);
			} else if ((fileName instanceof HTMLImageElement) || (fileName instanceof HTMLCanvasElement)) {
				// 用一个canvas和图片元素初始化
				var texture2d = new cc.Texture2D();
				texture2d.initWithElement(fileName);
				texture2d.handleLoadedTexture();
				this.initWithTexture(texture2d);
			}
		}
	},

    /**
     * 返回quad （纹理坐标，顶点坐标和颜色）信息。
     * @return {cc.V3F_C4B_T2F_Quad}
     */
    getQuad:function () {
        return this._quad;
    },

    /**
     * cc.TextureProtocol采用的协议
     * @function
     * @param {Number|cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc: null,

    /**
     * 初始化一个所有信息都未设置的空的精灵节点。<br/>
     * 使用构造函数初始化精灵，不要自己调用此方法。
     * @function
     * @return {Boolean}
     */
    init:null,

    /**
     * <p>
     *     通过图片文件名初始化精灵。<br/>
     *
     *     这个方法会在本地文件系统中搜索指定文件名的图片，然后将他加载到CCTexture2D，<br/>
     *     然后使用这个CCTexture2D创建精灵。<br/>
     *     初始化完成以后，矩形是图片的尺寸，偏移是(0,0)。<br/>
     *     请将参数传递给构造函数初始化精灵，不要自己调用此方法。
     * </p>
     * @param {String} filename 在本地文件系统中图片文件名
     * @param {cc.Rect} rect 用于裁剪纹理的矩形
     * @return {Boolean} 初始化成功返回true，否则返回false
     */
    initWithFile:function (filename, rect) {
        cc.assert(filename, cc._LogInfos.Sprite_initWithFile);

        var tex = cc.textureCache.getTextureForKey(filename);
        if (!tex) {
            tex = cc.textureCache.addImage(filename);
            return this.initWithTexture(tex, rect || cc.rect(0, 0, tex._contentSize.width, tex._contentSize.height));
        } else {
            if (!rect) {
                var size = tex.getContentSize();
                rect = cc.rect(0, 0, size.width, size.height);
            }
            return this.initWithTexture(tex, rect);
        }
    },

    /**
     * 通过纹理对象、矩形以及是否旋转初始化精灵 <br/>
     * 初始化之后，矩形用于裁剪纹理，偏移被置为(0,0)。<br/>
     *     请将参数传递给构造函数初始化精灵，不要自己调用此方法。
     * @function
     * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture 一个纹理对象，可以使用一个对象创建多个精灵
     * @param {cc.Rect} rect 在矩形之内的纹理才会用于创建精灵
     * @param {Boolean} [rotated] 纹理矩形是否旋转
     * @return {Boolean} 初始化成功返回true，否则返回false
     */
    initWithTexture: null,

    _textureLoadedCallback: null,

    /**
     * 更新裁剪纹理的矩形。
     * @function
     * @param {cc.Rect} rect 裁剪纹理的矩形
     * @param {Boolean} [rotated] 纹理是否旋转
     * @param {cc.Size} [untrimmedSize] 纹理的原始像素尺寸
     */
    setTextureRect:null,

    /**
     * 根据旋转，位置和缩放值更新quad
     * @function
     */
    updateTransform: null,

    /**
     * 给精灵增加一个子节点(重载 cc.Node)
     * @function
     * @param {cc.Sprite} child
     * @param {Number} localZOrder 子节点的绘图顺序
     * @param {String} tag 子节点的标签
     * @override
     */
    addChild: null,

    /**
     * 更新精灵的颜色
     */
    updateColor:function () {
        var locDisplayedColor = this._displayedColor, locDisplayedOpacity = this._displayedOpacity;
        var color4 = {r: locDisplayedColor.r, g: locDisplayedColor.g, b: locDisplayedColor.b, a: locDisplayedOpacity};
        // 透明像素纹理的特殊透明度
        if (this._opacityModifyRGB) {
            color4.r *= locDisplayedOpacity / 255.0;
            color4.g *= locDisplayedOpacity / 255.0;
            color4.b *= locDisplayedOpacity / 255.0;
        }
        var locQuad = this._quad;
        locQuad.bl.colors = color4;
        locQuad.br.colors = color4;
        locQuad.tl.colors = color4;
        locQuad.tr.colors = color4;

        // 使用Sprite Manager渲染
        if (this._batchNode) {
            if (this.atlasIndex != cc.Sprite.INDEX_NOT_INITIALIZED) {
                this.textureAtlas.updateQuad(locQuad, this.atlasIndex)
            } else {
                // 不需要递归地进行设置
                // 更新dirty_, 不要更新recursiveDirty_
                this.dirty = true;
            }
        }
        // 自渲染
        // 没做什么...
        this._quadDirty = true;
    },

    /**
     * 设置精灵的透明度
     * @function
     * @param {Number} opacity
     */
    setOpacity:null,

    /**
     * 设置精灵的颜色
     * @function
     * @param {cc.Color} color3
     */
    setColor: null,

    /**
     * 更新显示的颜色
     * @function
     */
    updateDisplayedColor: null,

    // 帧
    /**
     * 为精灵设置一个新的精灵帧。
     * @function
     * @param {cc.SpriteFrame|String} newFrame
     */
    setSpriteFrame: null,

    /**
     * 为精灵设置一个新的显示帧。
     * @param {cc.SpriteFrame|String} newFrame
     * @deprecated 使用setSpriteFrame代替
     */
    setDisplayFrame: function(newFrame){
        cc.log(cc._LogInfos.Sprite_setDisplayFrame);
        this.setSpriteFrame(newFrame);
    },

    /**
     * 返回cc.SpriteFrame是否被显示
     * @function
     * @param {cc.SpriteFrame} frame
     * @return {Boolean}
     */
    isFrameDisplayed: null,

    /**
     * 返回当前显示帧
     * @return {cc.SpriteFrame}
     */
    displayFrame: function () {
        return new cc.SpriteFrame(this._texture,
                                  cc.rectPointsToPixels(this._rect),
                                  this._rectRotated,
                                  cc.pointPointsToPixels(this._unflippedOffsetPositionFromCenter),
                                  cc.sizePointsToPixels(this._contentSize));
    },

    /**
     * 给精灵指定一个批处理节点
     * @function
     * @param {cc.SpriteBatchNode|null} spriteBatchNode
     * @example
     *  var batch = new cc.SpriteBatchNode("Images/grossini_dance_atlas.png", 15);
     *  var sprite = new cc.Sprite(batch.texture, cc.rect(0, 0, 57, 57));
     *  batch.addChild(sprite);
     *  layer.addChild(batch);
     */
    setBatchNode:null,

    // CCTextureProtocol
    /**
     * 设置精灵的纹理
     * @function
     * @param {cc.Texture2D|String} texture
     */
    setTexture: null,

    // 纹理协议
    _updateBlendFunc:function () {
        if(this._batchNode){
            cc.log(cc._LogInfos.Sprite__updateBlendFunc);
            return;
        }

        // 允许拥有没有设置文里的精灵
        if (!this._texture || !this._texture.hasPremultipliedAlpha()) {
            this._blendFunc.src = cc.SRC_ALPHA;
            this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
            this.opacityModifyRGB = false;
        } else {
            this._blendFunc.src = cc.BLEND_SRC;
            this._blendFunc.dst = cc.BLEND_DST;
            this.opacityModifyRGB = true;
        }
    },

    _changeTextureColor: function () {
        var locElement, locTexture = this._texture, locRect = this._rendererCmd._textureCoord; //this.getTextureRect();
        if (locTexture && locRect.validRect && this._originalTexture) {
            locElement = locTexture.getHtmlElementObj();
            if (!locElement)
                return;

            this._colorized = true;
            if (locElement instanceof HTMLCanvasElement && !this._rectRotated && !this._newTextureWhenChangeColor
                && this._originalTexture._htmlElementObj != locElement)
                cc.generateTintImageWithMultiply(this._originalTexture._htmlElementObj, this._displayedColor, locRect, locElement);
            else {
                locElement = cc.generateTintImageWithMultiply(this._originalTexture._htmlElementObj, this._displayedColor, locRect);
                locTexture = new cc.Texture2D();
                locTexture.initWithElement(locElement);
                locTexture.handleLoadedTexture();
                this.texture = locTexture;
            }
        }
    },

    _setTextureCoords:function (rect) {
        rect = cc.rectPointsToPixels(rect);

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

/**
 * 通过图片文件路径，或者帧名，或者纹理，或者精灵帧来创建精灵
 * @deprecated 自v3.0弃用，使用新的构造函数代替
 * @see cc.Sprite
 * @param {String|cc.SpriteFrame|HTMLImageElement|cc.Texture2D} fileName  表示一个图片文件路径的字符串，例如 "scene1/monster.png".
 * @param {cc.Rect} rect  用于裁剪纹理的矩形。
 * @param {Boolean} [rotated] 裁剪纹理的矩形是否旋转。
 * @return {cc.Sprite} 一个有效的精灵对象。
 */
cc.Sprite.create = function (fileName, rect, rotated) {
    return new cc.Sprite(fileName, rect, rotated);
};

/**
 * @deprecated 自v3.0弃用，使用新的构造函数代替
 * @see cc.Sprite
 * @function
 */
cc.Sprite.createWithTexture = cc.Sprite.create;

/**
 * @deprecated 自v3.0弃用，使用新的构造函数代替
 * @see cc.Sprite
 * @function
 */
cc.Sprite.createWithSpriteFrameName = cc.Sprite.create;

/**
 * @deprecated 自v3.0弃用，使用新的构造函数代替
 * @see cc.Sprite
 * @function
 */
cc.Sprite.createWithSpriteFrame = cc.Sprite.create;

/**
 * 在cc.SpriteBatchNode中错误的cc.Sprite序号
 * @constant
 * @type {Number}
 */
cc.Sprite.INDEX_NOT_INITIALIZED = -1;


if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
    var _p = cc.Sprite.prototype;

    _p._spriteFrameLoadedCallback = function(spriteFrame){
        var _t = this;
        _t.setNodeDirty(true);
        _t.setTextureRect(spriteFrame.getRect(), spriteFrame.isRotated(), spriteFrame.getOriginalSize());
        var curColor = _t.color;
        if (curColor.r !== 255 || curColor.g !== 255 || curColor.b !== 255)
            _t._changeTextureColor();

        _t.dispatchEvent("load");
    };

    _p.setOpacityModifyRGB = function (modify) {
        if (this._opacityModifyRGB !== modify) {
            this._opacityModifyRGB = modify;
            this.setNodeDirty(true);
        }
    };

    _p.updateDisplayedOpacity = function (parentOpacity) {
        cc.Node.prototype.updateDisplayedOpacity.call(this, parentOpacity);
        this._setNodeDirtyForCache();
    };

    _p.ctor = function (fileName, rect, rotated) {
        var self = this;
        cc.Node.prototype.ctor.call(self);
        self._shouldBeHidden = false;
        self._offsetPosition = cc.p(0, 0);
        self._unflippedOffsetPositionFromCenter = cc.p(0, 0);
        self._blendFunc = {src: cc.BLEND_SRC, dst: cc.BLEND_DST};
        self._rect = cc.rect(0, 0, 0, 0);

        self._newTextureWhenChangeColor = false;
        self._textureLoaded = true;
        self._drawSize_Canvas = cc.size(0, 0);

        self._softInit(fileName, rect, rotated);
    };

    _p._initRendererCmd = function(){
        this._rendererCmd = new cc.TextureRenderCmdCanvas(this);
    };

    _p.setBlendFunc = function (src, dst) {
        var _t = this, locBlendFunc = this._blendFunc;
        if (dst === undefined) {
            locBlendFunc.src = src.src;
            locBlendFunc.dst = src.dst;
        } else {
            locBlendFunc.src = src;
            locBlendFunc.dst = dst;
        }
        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            _t._blendFuncStr = cc._getCompositeOperationByBlendFunc(locBlendFunc);
    };

    _p.init = function () {
        var _t = this;
        if (arguments.length > 0)
            return _t.initWithFile(arguments[0], arguments[1]);

        cc.Node.prototype.init.call(_t);
        _t.dirty = _t._recursiveDirty = false;

        _t._blendFunc.src = cc.BLEND_SRC;
        _t._blendFunc.dst = cc.BLEND_DST;

        // 更新纹理(调用 _updateBlendFunc)
        _t.texture = null;
        _t._textureLoaded = true;
        _t._flippedX = _t._flippedY = false;

        // 默认转化锚点: 中点
        _t.anchorX = 0.5;
        _t.anchorY = 0.5;

        // zwoptex默认值
        _t._offsetPosition.x = 0;
        _t._offsetPosition.y = 0;
        _t._hasChildren = false;

        // 在"useSelfRender"里更新
        // 身负重担的人: TexCoords
        _t.setTextureRect(cc.rect(0, 0, 0, 0), false, cc.size(0, 0));
        return true;
    };

    _p.initWithTexture = function (texture, rect, rotated) {
        var _t = this;
        cc.assert(arguments.length != 0, cc._LogInfos.CCSpriteBatchNode_initWithTexture);

        rotated = rotated || false;

        if (rotated && texture.isLoaded()) {
            var tempElement = texture.getHtmlElementObj();
            tempElement = cc.cutRotateImageToCanvas(tempElement, rect);
            var tempTexture = new cc.Texture2D();
            tempTexture.initWithElement(tempElement);
            tempTexture.handleLoadedTexture();
            texture = tempTexture;

            _t._rect = cc.rect(0, 0, rect.width, rect.height);
        }

        if (!cc.Node.prototype.init.call(_t))
            return false;

        _t._batchNode = null;
        _t._recursiveDirty = false;
        _t.dirty = false;
        _t._opacityModifyRGB = true;

        _t._blendFunc.src = cc.BLEND_SRC;
        _t._blendFunc.dst = cc.BLEND_DST;

        _t._flippedX = _t._flippedY = false;

        // 默认转化锚点: 中点
        _t.anchorX = 0.5;
        _t.anchorY = 0.5;

        // zwoptex默认值
        _t._offsetPosition.x = 0;
        _t._offsetPosition.y = 0;
        _t._hasChildren = false;

        var locTextureLoaded = texture.isLoaded();
        _t._textureLoaded = locTextureLoaded;

        if (!locTextureLoaded) {
            _t._rectRotated = rotated;
            if (rect) {
                _t._rect.x = rect.x;
                _t._rect.y = rect.y;
                _t._rect.width = rect.width;
                _t._rect.height = rect.height;
            }
            if(_t.texture)
                _t.texture.removeEventListener("load", _t);
            texture.addEventListener("load", _t._textureLoadedCallback, _t);
            _t.texture = texture;
            return true;
        }

        if (!rect) {
            rect = cc.rect(0, 0, texture.width, texture.height);
        }

        if(texture && texture.url) {
            var _x = rect.x + rect.width, _y = rect.y + rect.height;
            if(_x > texture.width){
                cc.error(cc._LogInfos.RectWidth, texture.url);
            }
            if(_y > texture.height){
                cc.error(cc._LogInfos.RectHeight, texture.url);
            }
        }
        _t._originalTexture = texture;
        _t.texture = texture;
        _t.setTextureRect(rect, rotated);

        // 默认使用"Self Render".
        // 如果精灵加到了batchnode中,会自动切换到"batchnode Render"
        _t.batchNode = null;
        return true;
    };

    _p._textureLoadedCallback = function (sender) {
        var _t = this;
        if(_t._textureLoaded)
            return;

        _t._textureLoaded = true;
        var locRect = _t._rect;
        if (!locRect) {
            locRect = cc.rect(0, 0, sender.width, sender.height);
        } else if (cc._rectEqualToZero(locRect)) {
            locRect.width = sender.width;
            locRect.height = sender.height;
        }
        _t._originalTexture = sender;

        _t.texture = sender;
        _t.setTextureRect(locRect, _t._rectRotated);

        //在装载之后设置纹理的颜色
        var locColor = this._displayedColor;
        if(locColor.r != 255 || locColor.g != 255 || locColor.b != 255)
            _t._changeTextureColor();

        // 默认使用"Self Render".
        // 如果精灵加到了batchnode中,会自动切换到"batchnode Render"
        _t.batchNode = _t._batchNode;
        _t.dispatchEvent("load");
    };

    _p.setTextureRect = function (rect, rotated, untrimmedSize) {
        var _t = this;
        _t._rectRotated = rotated || false;
        _t.setContentSize(untrimmedSize || rect);

        _t.setVertexRect(rect);

        var locTextureRect = _t._rendererCmd._textureCoord,
            scaleFactor = cc.contentScaleFactor();
        locTextureRect.renderX = locTextureRect.x = 0 | (rect.x * scaleFactor);
        locTextureRect.renderY = locTextureRect.y = 0 | (rect.y * scaleFactor);
        locTextureRect.width = 0 | (rect.width * scaleFactor);
        locTextureRect.height = 0 | (rect.height * scaleFactor);
        locTextureRect.validRect = !(locTextureRect.width === 0 || locTextureRect.height === 0 || locTextureRect.x < 0 || locTextureRect.y < 0);

        var relativeOffset = _t._unflippedOffsetPositionFromCenter;
        if (_t._flippedX)
            relativeOffset.x = -relativeOffset.x;
        if (_t._flippedY)
            relativeOffset.y = -relativeOffset.y;
        _t._offsetPosition.x = relativeOffset.x + (_t._contentSize.width - _t._rect.width) / 2;
        _t._offsetPosition.y = relativeOffset.y + (_t._contentSize.height - _t._rect.height) / 2;

        // 用batch node渲染
        if (_t._batchNode) {
            // 更新dirty, 不更新_recursiveDirty
            _t.dirty = true;
        }
    };

    _p.updateTransform = function () {
        var _t = this;
        //cc.assert(_t._batchNode, "updateTransform只当cc.Sprite is being用一个cc.SpriteBatchNode"渲染时才有效);

        // 如果dirty，从新计算矩阵
        if (_t.dirty) {
            // 如果不可视, 或者某一个祖先节点不可视, 则不作任何操作:
            var locParent = _t._parent;
            if (!_t._visible || ( locParent && locParent != _t._batchNode && locParent._shouldBeHidden)) {
                _t._shouldBeHidden = true;
            } else {
                _t._shouldBeHidden = false;

                if (!locParent || locParent == _t._batchNode) {
                    _t._transformToBatch = _t.getNodeToParentTransform();
                } else {
                    //cc.assert(_t._parent instanceof cc.Sprite, "Logic error in CCSprite. Parent must be a CCSprite");
                    _t._transformToBatch = cc.affineTransformConcat(_t.getNodeToParentTransform(), locParent._transformToBatch);
                }
            }
            _t._recursiveDirty = false;
            _t.dirty = false;
        }

        // 重复递归子节点
        if (_t._hasChildren)
            _t._arrayMakeObjectsPerformSelector(_t._children, cc.Node._stateCallbackType.updateTransform);
    };

    _p.addChild = function (child, localZOrder, tag) {
        cc.assert(child, cc._LogInfos.CCSpriteBatchNode_addChild_2);

        if (localZOrder == null)
            localZOrder = child._localZOrder;
        if (tag == null)
            tag = child.tag;

        //cc.Node已经设置isReorderChildDirty_ 所以需要在batchNode之后检查
        cc.Node.prototype.addChild.call(this, child, localZOrder, tag);
        this._hasChildren = true;
    };

    _p.setOpacity = function (opacity) {
        cc.Node.prototype.setOpacity.call(this, opacity);
        this._setNodeDirtyForCache();
    };

    _p.setColor = function (color3) {
        var _t = this;
        var curColor = _t.color;
        this._oldDisplayColor = curColor;
        if ((curColor.r === color3.r) && (curColor.g === color3.g) && (curColor.b === color3.b))
            return;
        cc.Node.prototype.setColor.call(_t, color3);
    };

    _p.updateDisplayedColor = function (parentColor) {
        var _t = this;
        cc.Node.prototype.updateDisplayedColor.call(_t, parentColor);
        var oColor = _t._oldDisplayColor;
        var nColor = _t._displayedColor;
        if (oColor.r === nColor.r && oColor.g === nColor.g && oColor.b === nColor.b)
            return;

        _t._changeTextureColor();
        _t._setNodeDirtyForCache();
    };

    _p.setSpriteFrame = function (newFrame) {
        var _t = this;
        if(cc.isString(newFrame)){
            newFrame = cc.spriteFrameCache.getSpriteFrame(newFrame);
            cc.assert(newFrame, cc._LogInfos.CCSpriteBatchNode_setSpriteFrame)
        }

        _t.setNodeDirty(true);

        var frameOffset = newFrame.getOffset();
        _t._unflippedOffsetPositionFromCenter.x = frameOffset.x;
        _t._unflippedOffsetPositionFromCenter.y = frameOffset.y;

        // 更新矩形
        _t._rectRotated = newFrame.isRotated();

        var pNewTexture = newFrame.getTexture();
        var locTextureLoaded = newFrame.textureLoaded();
        if (!locTextureLoaded) {
            _t._textureLoaded = false;
            newFrame.addEventListener("load", function (sender) {
                _t._textureLoaded = true;
                var locNewTexture = sender.getTexture();
                if (locNewTexture != _t._texture)
                    _t.texture = locNewTexture;
                _t.setTextureRect(sender.getRect(), sender.isRotated(), sender.getOriginalSize());
                _t.dispatchEvent("load");
            }, _t);
        }
        // 在更新矩形纹理时先更新纹理
        if (pNewTexture != _t._texture)
            _t.texture = pNewTexture;

        if (_t._rectRotated)
            _t._originalTexture = pNewTexture;

        _t.setTextureRect(newFrame.getRect(), _t._rectRotated, newFrame.getOriginalSize());
        _t._colorized = false;
        _t._rendererCmd._textureCoord.renderX = _t._rendererCmd._textureCoord.x;
        _t._rendererCmd._textureCoord.renderY = _t._rendererCmd._textureCoord.y;
        if (locTextureLoaded) {
            var curColor = _t.color;
            if (curColor.r !== 255 || curColor.g !== 255 || curColor.b !== 255)
                _t._changeTextureColor();
        }
    };

    _p.isFrameDisplayed = function (frame) {
        if (frame.getTexture() != this._texture)
            return false;
        return cc.rectEqualToRect(frame.getRect(), this._rect);
    };

    _p.setBatchNode = function (spriteBatchNode) {
        var _t = this;
        _t._batchNode = spriteBatchNode; // 弱参

        // 自传递
        if (!_t._batchNode) {
            _t.atlasIndex = cc.Sprite.INDEX_NOT_INITIALIZED;
            _t.textureAtlas = null;
            _t._recursiveDirty = false;
            _t.dirty = false;
        } else {
            // 用batch
            _t._transformToBatch = cc.affineTransformIdentity();
            _t.textureAtlas = _t._batchNode.textureAtlas; // 弱参
        }
    };

    _p.setTexture = function (texture) {
        var _t = this;
        if(texture && (cc.isString(texture))){
            texture = cc.textureCache.addImage(texture);
            _t.setTexture(texture);
            //TODO
            var size = texture.getContentSize();
            _t.setTextureRect(cc.rect(0,0, size.width, size.height));
            //如果图片没有加载. 监听load事件.
            if(!texture._isLoaded){
                texture.addEventListener("load", function(){
                    var size = texture.getContentSize();
                    _t.setTextureRect(cc.rect(0,0, size.width, size.height));
                }, this);
            }
            return;
        }

        // CCSprite: 当精灵使用CCSpriteSheet渲染时不执行setTexture
        cc.assert(!texture || texture instanceof cc.Texture2D, cc._LogInfos.CCSpriteBatchNode_setTexture);

        if (_t._texture != texture) {
            if (texture && texture.getHtmlElementObj() instanceof  HTMLImageElement) {
                _t._originalTexture = texture;
            }
            _t._texture = texture;
        }
    };

    if(!cc.sys._supportCanvasNewBlendModes)
        _p._changeTextureColor =  function () {
            var locElement, locTexture = this._texture, locRect = this._rendererCmd._textureCoord; //this.getTextureRect();
            if (locTexture && locRect.validRect && this._originalTexture) {
                locElement = locTexture.getHtmlElementObj();
                if (!locElement)
                    return;

                var cacheTextureForColor = cc.textureCache.getTextureColors(this._originalTexture.getHtmlElementObj());
                if (cacheTextureForColor) {
                    this._colorized = true;
                    //创建颜色纹理缓存
                    if (locElement instanceof HTMLCanvasElement && !this._rectRotated && !this._newTextureWhenChangeColor)
                        cc.generateTintImage(locElement, cacheTextureForColor, this._displayedColor, locRect, locElement);
                    else {
                        locElement = cc.generateTintImage(locElement, cacheTextureForColor, this._displayedColor, locRect);
                        locTexture = new cc.Texture2D();
                        locTexture.initWithElement(locElement);
                        locTexture.handleLoadedTexture();
                        this.texture = locTexture;
                    }
                }
            }
        };

    _p = null;
} else {
    cc.assert(cc.isFunction(cc._tmp.WebGLSprite), cc._LogInfos.MissingFile, "SpritesWebGL.js");
    cc._tmp.WebGLSprite();
    delete cc._tmp.WebGLSprite;
}

cc.EventHelper.prototype.apply(cc.Sprite.prototype);

cc.assert(cc.isFunction(cc._tmp.PrototypeSprite), cc._LogInfos.MissingFile, "SpritesPropertyDefine.js");
cc._tmp.PrototypeSprite();
delete cc._tmp.PrototypeSprite;


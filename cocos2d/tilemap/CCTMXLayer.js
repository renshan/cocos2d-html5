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
 * <p>cc.TMXLayer用来表示TMX格式的layer </p>
 * <p>它是cc.SpriteBatchNode的一个子类. 默认情况下，通过使用一个cc.TextureAtlas来渲染瓦片. <br />
 * 如果运行时修改一个tile，那么tile将变成一个cc.Sprite对象，反之，则不会有Sprite对象被创建。<br/ >
 * 使用cc.Sprite对象作为tiles有如下好处：<br/>
 * - tiles(即cc.Sprite)可以通过完善的API进行旋转/缩放/移动</p>
 * <p>如果这个layer包括了一个名为“cc.vertexz”整型属性, <br />
 * 那么属于layer的所有tiles将使用该属性值作为它们OpenGL用来渲染显示层次的Z值。 </p>
 * <p>在另一方面，如果"cc_vertexz"属性拥有 "automatic"值，那么这些tiles将使用一个自分配的Z值。<br />
 * 同样，在绘制这些tiles时，在绘制前，必须设置GL_ALPHA_TEST为可用，绘制后设置为禁用。使用的Alpha函数如下： </p>
 * glAlphaFunc( GL_GREATER, value ) <br />
 * glAlphaFunc( GL_GREATER, value ) <br />
 * <p>"value"默认值是0，也可通过添加"cc_alpha_func"属性给转换成tile的layer来进行改变。<br />
 * 大多数情况是value的值是0，但如果有些tiles是半透明的，那么这值则可能会有不同，比如0.5 </p>
 * @class
 * @extends cc.SpriteBatchNode
 *
 * @property {Array}                tiles               - Tiles的层
 * @property {cc.TMXTilesetInfo}    tileset             - Layer上的tile集合(Tileset)
 * @property {Number}               layerOrientation    - Layer的方向
 * @property {Array}                properties          - 这个Layer的属性, 使用tilemap编辑器添加这些属性
 * @property {String}               layerName           - layer的名称
 * @property {Number}               layerWidth          - ayer的宽度
 * @property {Number}               layerHeight         - layer的高度
 * @property {Number}               tileWidth           - tile的宽度
 * @property {Number}               tileHeight          - tile的高度
 */
cc.TMXLayer = cc.SpriteBatchNode.extend(/** @lends cc.TMXLayer# */{
	tiles: null,
	tileset: null,
	layerOrientation: null,
	properties: null,
	layerName: "",

    //size of the layer in tiles
    _layerSize: null,
    _mapTileSize: null,
    //TMX Layer supports opacity
    _opacity: 255,
    _minGID: null,
    _maxGID: null,
    //Only used when vertexZ is used
    _vertexZvalue: null,
    _useAutomaticVertexZ: null,
    //used for optimization
    _reusedTile: null,
    _atlasIndexArray: null,
    //used for retina display
    _contentScaleFactor: null,

    _cacheCanvas:null,
    _cacheContext:null,
    _cacheTexture:null,
    _className:"TMXLayer",

    /**
     * 创建一个TMXLayer包括tile信息, layer信息, 和map信息 <br />
     * cc.TMXLayer的构造函数
     * @param {cc.TMXTilesetInfo} tilesetInfo
     * @param {cc.TMXLayerInfo} layerInfo
     * @param {cc.TMXMapInfo} mapInfo
     */
    ctor:function (tilesetInfo, layerInfo, mapInfo) {
        cc.SpriteBatchNode.prototype.ctor.call(this);
        this._descendants = [];

        this._layerSize = cc.size(0, 0);
        this._mapTileSize = cc.size(0, 0);

        if(cc._renderType === cc._RENDER_TYPE_CANVAS){
            var locCanvas = cc._canvas;
            var tmpCanvas = cc.newElement('canvas');
            tmpCanvas.width = locCanvas.width;
            tmpCanvas.height = locCanvas.height;
            this._cacheCanvas = tmpCanvas;
            this._cacheContext = this._cacheCanvas.getContext('2d');
            var tempTexture = new cc.Texture2D();
            tempTexture.initWithElement(tmpCanvas);
            tempTexture.handleLoadedTexture();
            this._cacheTexture = tempTexture;
            this.width = locCanvas.width;
	        this.height = locCanvas.height;
	        // 这个类使用缓存, 所以cachedParent应该属于本身
	        this._cachedParent = this;
        }
        if(mapInfo !== undefined)
            this.initWithTilesetInfo(tilesetInfo, layerInfo, mapInfo);
    },

    _initRendererCmd: function(){
        if(cc._renderType === cc._RENDER_TYPE_CANVAS)
            this._rendererCmd = new cc.TMXLayerRenderCmdCanvas(this);
        else
            this._rendererCmd = new cc.TMXLayerRenderCmdWebGL(this);
    },

    /**
     * 设置未变换TMLayer的尺寸
     * @override
     * @param {cc.Size|Number} size 未变换TMXLayer的尺寸或者TMXLayer尺寸的宽度
     * @param {Number} [height] 未变换TMXLayer的高度
     */
    setContentSize:function (size, height) {
        var locContentSize = this._contentSize;
	    cc.Node.prototype.setContentSize.call(this, size, height);

        if(cc._renderType === cc._RENDER_TYPE_CANVAS){
            var locCanvas = this._cacheCanvas;
            var scaleFactor = cc.contentScaleFactor();
            locCanvas.width = 0 | (locContentSize.width * 1.5 * scaleFactor);
            locCanvas.height = 0 | (locContentSize.height * 1.5 * scaleFactor);

            if(this.layerOrientation === cc.TMX_ORIENTATION_HEX)
                this._cacheContext.translate(0, locCanvas.height - (this._mapTileSize.height * 0.5));                         //转换成6边形地图
            else
                this._cacheContext.translate(0, locCanvas.height);
            var locTexContentSize = this._cacheTexture._contentSize;
            locTexContentSize.width = locCanvas.width;
            locTexContentSize.height = locCanvas.height;

            // 如果需要的话初始化子缓存
            var totalPixel = locCanvas.width * locCanvas.height;
            if(totalPixel > this._maxCachePixel) {
                if(!this._subCacheCanvas) this._subCacheCanvas = [];
                if(!this._subCacheContext) this._subCacheContext = [];

                this._subCacheCount = Math.ceil( totalPixel / this._maxCachePixel );
                var locSubCacheCanvas = this._subCacheCanvas, i;
                for(i = 0; i < this._subCacheCount; i++) {
                    if(!locSubCacheCanvas[i]) {
                        locSubCacheCanvas[i] = document.createElement('canvas');
                        this._subCacheContext[i] = locSubCacheCanvas[i].getContext('2d');
                    }
                    var tmpCanvas = locSubCacheCanvas[i];
                    tmpCanvas.width = this._subCacheWidth = Math.round( locCanvas.width / this._subCacheCount );
                    tmpCanvas.height = locCanvas.height;
                }
                // 清理浪费的缓存, 释放内存
                for(i = this._subCacheCount; i < locSubCacheCanvas.length; i++) {
                    tmpCanvas.width = 0;
                    tmpCanvas.height = 0;
                }
            }
            // 否则使用一个数字标记去关闭子缓存
            else this._subCacheCount = 0;
        }
    },

    /**
     * 返回cc.SpriteBatchNote的渲染纹理
     * @function
     * @return {cc.Texture2D}
     */
	getTexture: null,

    _getTextureForCanvas:function () {
        return this._cacheTexture;
    },

    /**
     * 在它的孩子上不要调用visit(覆写cc.Node的visit方法)
     * @function
     * @override
     * @param {CanvasRenderingContext2D} ctx
     */
    visit: null,

    _visitForCanvas: function (ctx) {
        //TODO 以后会实现child的动态计算与自动剪切
        var i, len, locChildren = this._children;
        // quick return if not visible
        if (!this._visible || !locChildren || locChildren.length === 0)
            return;

        if( this._parent)
            this._curLevel = this._parent._curLevel + 1;

        this.transform();

        if (this._cacheDirty) {
            var locCacheContext = this._cacheContext, locCanvas = this._cacheCanvas, locView = cc.view,
                instanceID = this.__instanceId, renderer = cc.renderer;
            //开始缓存
            renderer._turnToCacheMode(instanceID);

            this.sortAllChildren();
            for (i = 0, len =  locChildren.length; i < len; i++) {
                if (locChildren[i]){
                    locChildren[i].visit();
                    locChildren[i]._cacheDirty = false;
                }
            }

            //复制缓存渲染命令组到TMXLayer的渲染器中
            this._rendererCmd._copyRendererCmds(renderer._cacheToCanvasCmds[instanceID]);

            locCacheContext.save();
            locCacheContext.clearRect(0, 0, locCanvas.width, -locCanvas.height);
            var t = cc.affineTransformInvert(this._transformWorld);
            locCacheContext.transform(t.a, t.c, t.b, t.d, t.tx * locView.getScaleX(), -t.ty * locView.getScaleY());

            //绘制canvas缓存
            renderer._renderingToCacheCanvas(locCacheContext, instanceID);
            locCacheContext.restore();
            this._cacheDirty = false;
        }
        cc.renderer.pushRenderCommand(this._rendererCmd);
    },

    //设置canvas的脏标记(dirty flag)
    _setNodeDirtyForCache: function () {
        this._cacheDirty  = true;
        if(cc.renderer._transformNodePool.indexOf(this) === -1)
            cc.renderer.pushDirtyNode(this);
        this._renderCmdDiry = true;
    },

    /**
     * 绘制SpriteBatchNode(覆盖Node的draw函数)
     * @function
     * @param {CanvasRenderingContext2D} ctx
     */
    draw:null,

    _drawForCanvas:function (ctx) {
        var context = ctx || cc._renderContext;
        //context.globalAlpha = this._opacity / 255;
        var posX = 0 | ( -this._anchorPointInPoints.x), posY = 0 | ( -this._anchorPointInPoints.y);
        var eglViewer = cc.view;
        var locCacheCanvas = this._cacheCanvas;
        //使用canvas drawImags直接绘制图片
        if (locCacheCanvas) {
            var locSubCacheCount = this._subCacheCount, locCanvasHeight = locCacheCanvas.height * eglViewer._scaleY;
            var halfTileSize = this._mapTileSize.height * 0.5 * eglViewer._scaleY;
            if(locSubCacheCount > 0) {
                var locSubCacheCanvasArr = this._subCacheCanvas;
                for(var i = 0; i < locSubCacheCount; i++){
                    var selSubCanvas = locSubCacheCanvasArr[i];
                    if (this.layerOrientation === cc.TMX_ORIENTATION_HEX)
                        context.drawImage(locSubCacheCanvasArr[i], 0, 0, selSubCanvas.width, selSubCanvas.height,
                                posX + i * this._subCacheWidth * eglViewer._scaleX, -(posY + locCanvasHeight) + halfTileSize, selSubCanvas.width * eglViewer._scaleX, locCanvasHeight);
                    else
                        context.drawImage(locSubCacheCanvasArr[i], 0, 0, selSubCanvas.width, selSubCanvas.height,
                                posX + i * this._subCacheWidth * eglViewer._scaleX, -(posY + locCanvasHeight), selSubCanvas.width * eglViewer._scaleX, locCanvasHeight);
                }
            } else{
                if (this.layerOrientation === cc.TMX_ORIENTATION_HEX)
                    context.drawImage(locCacheCanvas, 0, 0, locCacheCanvas.width, locCacheCanvas.height,
                        posX, -(posY + locCanvasHeight) + halfTileSize, locCacheCanvas.width * eglViewer._scaleX, locCanvasHeight);
                else
                    context.drawImage(locCacheCanvas, 0, 0, locCacheCanvas.width, locCacheCanvas.height,
                        posX, -(posY + locCanvasHeight), locCacheCanvas.width * eglViewer._scaleX, locCanvasHeight);
            }
        }
    },

    /**
     * 获取layer的尺寸
     * @return {cc.Size}
     */
    getLayerSize:function () {
        return cc.size(this._layerSize.width, this._layerSize.height);
    },

    /**
     * 设置layer的尺寸
     * @param {cc.Size} Var
     */
    setLayerSize:function (Var) {
        this._layerSize.width = Var.width;
        this._layerSize.height = Var.height;
    },

	_getLayerWidth: function () {
		return this._layerSize.width;
	},
	_setLayerWidth: function (width) {
		this._layerSize.width = width;
	},
	_getLayerHeight: function () {
		return this._layerSize.height;
	},
	_setLayerHeight: function (height) {
		this._layerSize.height = height;
	},

    /**
     * 地图的尺寸以tile为单位(与title的尺寸不同)
     * @return {cc.Size}
     */
    getMapTileSize:function () {
        return cc.size(this._mapTileSize.width,this._mapTileSize.height);
    },

    /**
     * 设置map tile的尺寸
     * @param {cc.Size} Var
     */
    setMapTileSize:function (Var) {
        this._mapTileSize.width = Var.width;
        this._mapTileSize.height = Var.height;
    },

	_getTileWidth: function () {
		return this._mapTileSize.width;
	},
	_setTileWidth: function (width) {
		this._mapTileSize.width = width;
	},
	_getTileHeight: function () {
		return this._mapTileSize.height;
	},
	_setTileHeight: function (height) {
		this._mapTileSize.height = height;
	},

    /**
     * 指向tiles的映射
     * @return {Array}
     */
    getTiles:function () {
        return this.tiles;
    },

    /**
     * 设置指向tiles的映射
     * @param {Array} Var
     */
    setTiles:function (Var) {
        this.tiles = Var;
    },

    /**
     * 获取layer的tile集合(Tileset)信息
     * @return {cc.TMXTilesetInfo}
     */
    getTileset:function () {
        return this.tileset;
    },

    /**
     * 设置layer的tile集合(Tileset)信息
     * @param {cc.TMXTilesetInfo} Var
     */
    setTileset:function (Var) {
        this.tileset = Var;
    },

    /**
     * 获取Layer的方向, 与地图方向相同
     * @return {Number}
     */
    getLayerOrientation:function () {
        return this.layerOrientation;
    },

    /**
     * 设置Layer的方向, 与地图方向相同
     * @param {Number} Var
     */
    setLayerOrientation:function (Var) {
        this.layerOrientation = Var;
    },

    /**
     * 获取layer的属性，它们可以被当作Tile添加
     * @return {Array}
     */
    getProperties:function () {
        return this.properties;
    },

    /**
     * 设置layer的属性，它们可以被当作Tile添加
     * @param {Array} Var
     */
    setProperties:function (Var) {
        this.properties = Var;
    },

    /**
     * 使用指定TMXTileset信息,TMXLayer信息和TMXMap信息初始化一个TMXLayer
     * @param {cc.TMXTilesetInfo} tilesetInfo
     * @param {cc.TMXLayerInfo} layerInfo
     * @param {cc.TMXMapInfo} mapInfo
     * @return {Boolean}
     */
    initWithTilesetInfo:function (tilesetInfo, layerInfo, mapInfo) {
        // XXX: is 35% a good estimate ?
        var size = layerInfo._layerSize;
        var totalNumberOfTiles = parseInt(size.width * size.height);
        var capacity = totalNumberOfTiles * 0.35 + 1; // 35 percent is occupied ?
        var texture;
        if (tilesetInfo)
            texture = cc.textureCache.addImage(tilesetInfo.sourceImage);

        if (this.initWithTexture(texture, capacity)) {
            // layerInfo
            this.layerName = layerInfo.name;
            this._layerSize = size;
            this.tiles = layerInfo._tiles;
            this._minGID = layerInfo._minGID;
            this._maxGID = layerInfo._maxGID;
            this._opacity = layerInfo._opacity;
            this.properties = layerInfo.properties;
            this._contentScaleFactor = cc.director.getContentScaleFactor();

            // tilesetInfo
            this.tileset = tilesetInfo;

            // mapInfo
            this._mapTileSize = mapInfo.getTileSize();
            this.layerOrientation = mapInfo.orientation;

            // offset (after layer orientation is set);
            var offset = this._calculateLayerOffset(layerInfo.offset);
            this.setPosition(cc.pointPixelsToPoints(offset));

            this._atlasIndexArray = [];
            this.setContentSize(cc.sizePixelsToPoints(cc.size(this._layerSize.width * this._mapTileSize.width,
                this._layerSize.height * this._mapTileSize.height)));
            this._useAutomaticVertexZ = false;
            this._vertexZvalue = 0;
            return true;
        }
        return false;
    },

    /**
     * <p>从内存中释放包含tile位置信息的地图.<br/>
     * 除非知道在运行时知道tiles的位置信息外，你都可以安全的调用此方法。<br />
     * 如果调用layer.tileGIDAt()，那么不能释放地图。 </p>
     */
    releaseMap:function () {
        if (this.tiles)
            this.tiles = null;

        if (this._atlasIndexArray)
            this._atlasIndexArray = null;
    },

    /**
     * <p>返回指定坐标处的瓦片精灵tile(cc.Sprite) <br/>
     * 返回的cc.Sprite已经是cc.TMXLayer的Child,不要再添加 <br/>
     * 这个cc.Sprite可以像别的cc.Sprite一样, 旋转,缩放,透明, 变色, 等等<br/>
     * 也可以删除通过调用 <br/>
     * - layer.removeChild(sprite, cleanup); <br/>
     * - or layer.removeTileAt(ccp(x,y)); </p>
     * @param {cc.Point|Number} pos or x
     * @param {Number} [y]
     * @return {cc.Sprite}
     */
    getTileAt: function (pos, y) {
        if(!pos)
            throw "cc.TMXLayer.getTileAt(): pos should be non-null";
        if(y !== undefined)
            pos = cc.p(pos, y);
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.getTileAt(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.getTileAt(): TMXLayer: the tiles map has been released");
            return null;
        }

        var tile = null, gid = this.getTileGIDAt(pos);

        // if GID == 0, then no tile is present
        if (gid === 0)
            return tile;

        var z = 0 | (pos.x + pos.y * this._layerSize.width);
        tile = this.getChildByTag(z);
        // tile not created yet. create it
        if (!tile) {
            var rect = this.tileset.rectForGID(gid);
            rect = cc.rectPixelsToPoints(rect);

            tile = new cc.Sprite();
            tile.initWithTexture(this.texture, rect);
            tile.batchNode = this;
            tile.setPosition(this.getPositionAt(pos));
            tile.vertexZ = this._vertexZForPos(pos);
            tile.anchorX = 0;
	        tile.anchorY = 0;
            tile.opacity = this._opacity;

            var indexForZ = this._atlasIndexForExistantZ(z);
            this.addSpriteWithoutQuad(tile, indexForZ, z);
        }
        return tile;
    },

    /**
     * 通过指定的tile坐标获取对应的tile gid. <br />
     * 如果返回0, 意味着这个tile是空的<br/>
     * 这个方法要求，在此之前tile map不会被释放 (比如. 不要调用 layer.releaseMap())<br />
     * @param {cc.Point|Number} pos or x
     * @param {Number} [y]
     * @return {Number}
     */
    getTileGIDAt:function (pos, y) {
        if(!pos)
            throw "cc.TMXLayer.getTileGIDAt(): pos should be non-null";
        if(y !== undefined)
            pos = cc.p(pos, y);
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.getTileGIDAt(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.getTileGIDAt(): TMXLayer: the tiles map has been released");
            return null;
        }

        var idx = 0 | (pos.x + pos.y * this._layerSize.width);
        // 32位全局的tile id的高位被用于tile的标记
        var tile = this.tiles[idx];

        return (tile & cc.TMX_TILE_FLIPPED_MASK) >>> 0;
    },
    // XXX: deprecated
    // tileGIDAt:getTileGIDAt,

    /**
     *  获取指定坐标处的tile的标记
     * @param {cc.Point|Number} pos or x
     * @param {Number} [y]
     * @return {Number}
     */
    getTileFlagsAt:function (pos, y) {
        if(!pos)
            throw "cc.TMXLayer.getTileFlagsAt(): pos should be non-null";
        if(y !== undefined)
            pos = cc.p(pos, y);
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.getTileFlagsAt(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.getTileFlagsAt(): TMXLayer: the tiles map has been released");
            return null;
        }

        var idx = 0 | (pos.x + pos.y * this._layerSize.width);
		// 32位全局的tile id的高位被用于tile的标记
        var tile = this.tiles[idx];

        return (tile & cc.TMX_TILE_FLIPPED_ALL) >>> 0;
    },
    // XXX: deprecated
    // tileFlagAt:getTileFlagsAt,

    /**
     * <p>设置指定坐标处tile的gid(gid = tile global id)。 <br />
     * Tile GID可以通过调用"tileGIDAt"方法或使用TMX编辑器 . Tileset管理器 +1得到.<br />
     * 如果该位置上已有一个tile，那么该位置上已有的tile将会被移除。
     * @param {Number} gid
     * @param {cc.Point|Number} posOrX position or x
     * @param {Number} flagsOrY flags or y
     * @param {Number} [flags]
     */
    setTileGID: function(gid, posOrX, flagsOrY, flags) {
        if(!posOrX)
            throw "cc.TMXLayer.setTileGID(): pos should be non-null";
        var pos;
        if (flags !== undefined) {
            pos = cc.p(posOrX, flagsOrY);
        } else {
            pos = posOrX;
            flags = flagsOrY;
        }
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.setTileGID(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.setTileGID(): TMXLayer: the tiles map has been released");
            return;
        }
        if(gid !== 0 && gid < this.tileset.firstGid){
            cc.log( "cc.TMXLayer.setTileGID(): invalid gid:" + gid);
            return;
        }

        flags = flags || 0;
        this._setNodeDirtyForCache();
        var currentFlags = this.getTileFlagsAt(pos);
        var currentGID = this.getTileGIDAt(pos);

        if (currentGID != gid || currentFlags != flags) {
            var gidAndFlags = (gid | flags) >>> 0;
            // 设置gid=0代表tile被删除
            if (gid === 0)
                this.removeTileAt(pos);
            else if (currentGID === 0)            // 空tile 生成一个新的
                this._insertTileForGID(gidAndFlags, pos);
            else {                // 修改一个非空的tile
                var z = pos.x + pos.y * this._layerSize.width;
                var sprite = this.getChildByTag(z);
                if (sprite) {
                    var rect = this.tileset.rectForGID(gid);
                    rect = cc.rectPixelsToPoints(rect);

                    sprite.setTextureRect(rect, false);
                    if (flags != null)
                        this._setupTileSprite(sprite, pos, gidAndFlags);

                    this.tiles[z] = gidAndFlags;
                } else
                    this._updateTileForGID(gidAndFlags, pos);
            }
        }
    },

    /**
     * 通过给定的坐标删除一个tile
     * @param {cc.Point|Number} pos position or x
     * @param {Number} [y]
     */
    removeTileAt:function (pos, y) {
        if(!pos)
            throw "cc.TMXLayer.removeTileAt(): pos should be non-null";
        if(y !== undefined)
            pos = cc.p(pos, y);
        if(pos.x >= this._layerSize.width || pos.y >= this._layerSize.height || pos.x < 0 || pos.y < 0)
            throw "cc.TMXLayer.removeTileAt(): invalid position";
        if(!this.tiles || !this._atlasIndexArray){
            cc.log("cc.TMXLayer.removeTileAt(): TMXLayer: the tiles map has been released");
            return;
        }

        var gid = this.getTileGIDAt(pos);
        if (gid !== 0) {
            if (cc._renderType === cc._RENDER_TYPE_CANVAS)
                this._setNodeDirtyForCache();
            var z = 0 | (pos.x + pos.y * this._layerSize.width);
            var atlasIndex = this._atlasIndexForExistantZ(z);
            // 从GID地图中删除Tile
            this.tiles[z] = 0;

            // 从位置数组中删除tile
            this._atlasIndexArray.splice(atlasIndex, 1);

            // 从sprites或texture atlas中删除
            var sprite = this.getChildByTag(z);

            if (sprite)
                cc.SpriteBatchNode.prototype.removeChild.call(this, sprite, true);           //this.removeChild(sprite, true);
            else {
                if(cc._renderType === cc._RENDER_TYPE_WEBGL)
                    this.textureAtlas.removeQuadAtIndex(atlasIndex);

                // 更新需要的children
                if (this._children) {
                    var locChildren = this._children;
                    for (var i = 0, len = locChildren.length; i < len; i++) {
                        var child = locChildren[i];
                        if (child) {
                            var ai = child.atlasIndex;
                            if (ai >= atlasIndex)
                                child.atlasIndex = ai - 1;
                        }
                    }
                }
            }
        }
    },

    /**
     * 获取指定tile坐标的位置(以像素为单位)
     * @param {cc.Point|Number} pos position or x
     * @param {Number} [y]
     * @return {cc.Point}
     */
    getPositionAt:function (pos, y) {
        if (y !== undefined)
            pos = cc.p(pos, y);
        var ret = cc.p(0,0);
        switch (this.layerOrientation) {
            case cc.TMX_ORIENTATION_ORTHO:
                ret = this._positionForOrthoAt(pos);
                break;
            case cc.TMX_ORIENTATION_ISO:
                ret = this._positionForIsoAt(pos);
                break;
            case cc.TMX_ORIENTATION_HEX:
                ret = this._positionForHexAt(pos);
                break;
        }
        return cc.pointPixelsToPoints(ret);
    },
    // XXX:废弃, 为了向后兼容
    // positionAt:getPositionAt,

    /**
     * 获取指定属性名的值
     * @param {String} propertyName
     * @return {*}
     */
    getProperty:function (propertyName) {
        return this.properties[propertyName];
    },

    /**
     * 创建tiles
     */
    setupTiles:function () {
        // 优化:快速在titleset上设置图片的尺寸
        if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
            this.tileset.imageSize = this._originalTexture.getContentSizeInPixels();
        } else {
            this.tileset.imageSize = this.textureAtlas.texture.getContentSizeInPixels();

            // By default all the tiles are aliased
            // pros:
            //  - easier to render
            // cons:
            //  - difficult to scale / rotate / etc.
            this.textureAtlas.texture.setAliasTexParameters();
        }

        // 解析cocos2d的属性
        this._parseInternalProperties();
        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            this._setNodeDirtyForCache();

        var locLayerHeight = this._layerSize.height, locLayerWidth = this._layerSize.width;
        for (var y = 0; y < locLayerHeight; y++) {
            for (var x = 0; x < locLayerWidth; x++) {
                var pos = x + locLayerWidth * y;
                var gid = this.tiles[pos];

                // XXX: gid == 0 -. empty tile
                if (gid !== 0) {
                    this._appendTileForGID(gid, cc.p(x, y));
                    // 优化:通过这个layer更新最大和最小的GID
                    this._minGID = Math.min(gid, this._minGID);
                    this._maxGID = Math.max(gid, this._maxGID);
                }
            }
        }

        if (!((this._maxGID >= this.tileset.firstGid) && (this._minGID >= this.tileset.firstGid))) {
            cc.log("cocos2d:TMX: Only 1 tileset per layer is supported");
        }
    },

    /**
     * cc.TMXLayer不支持手动添加一个cc.Sprite对象
     * @warning addChild(child)在cc.TMXLayer上不支持, 请使用setTileGID代替
     * @param {cc.Node} child
     * @param {number} zOrder
     * @param {number} tag
     */
    addChild:function (child, zOrder, tag) {
        cc.log("addChild: is not supported on cc.TMXLayer. Instead use setTileGID or tileAt.");
    },

    /**
     * 删除Child
     * @param  {cc.Sprite} sprite
     * @param  {Boolean} cleanup
     */
    removeChild:function (sprite, cleanup) {
        // 允许删除nil对象
        if (!sprite)
            return;

        if(this._children.indexOf(sprite) === -1){
            cc.log("cc.TMXLayer.removeChild(): Tile does not belong to TMXLayer");
            return;
        }

        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            this._setNodeDirtyForCache();
        var atlasIndex = sprite.atlasIndex;
        var zz = this._atlasIndexArray[atlasIndex];
        this.tiles[zz] = 0;
        this._atlasIndexArray.splice(atlasIndex, 1);
        cc.SpriteBatchNode.prototype.removeChild.call(this, sprite, cleanup);
        cc.renderer.childrenOrderDirty = true;
    },

    /**
     * 获取名称
     * @return {String}
     */
    getLayerName:function () {
        return this.layerName;
    },

    /**
     * 设置名称
     * @param {String} layerName
     */
    setLayerName:function (layerName) {
        this.layerName = layerName;
    },

    _positionForIsoAt:function (pos) {
        return cc.p(this._mapTileSize.width / 2 * ( this._layerSize.width + pos.x - pos.y - 1),
            this._mapTileSize.height / 2 * (( this._layerSize.height * 2 - pos.x - pos.y) - 2));
    },

    _positionForOrthoAt:function (pos) {
        return cc.p(pos.x * this._mapTileSize.width,
            (this._layerSize.height - pos.y - 1) * this._mapTileSize.height);
    },

    _positionForHexAt:function (pos) {
        var diffY = (pos.x % 2 == 1) ? (-this._mapTileSize.height / 2) : 0;
        return cc.p(pos.x * this._mapTileSize.width * 3 / 4,
            (this._layerSize.height - pos.y - 1) * this._mapTileSize.height + diffY);
    },

    _calculateLayerOffset:function (pos) {
        var ret = cc.p(0,0);
        switch (this.layerOrientation) {
            case cc.TMX_ORIENTATION_ORTHO:
                ret = cc.p(pos.x * this._mapTileSize.width, -pos.y * this._mapTileSize.height);
                break;
            case cc.TMX_ORIENTATION_ISO:
                ret = cc.p((this._mapTileSize.width / 2) * (pos.x - pos.y),
                    (this._mapTileSize.height / 2 ) * (-pos.x - pos.y));
                break;
            case cc.TMX_ORIENTATION_HEX:
                if(pos.x !== 0 || pos.y !== 0)
                    cc.log("offset for hexagonal map not implemented yet");
                break;
        }
        return ret;
    },

    _appendTileForGID:function (gid, pos) {
        var rect = this.tileset.rectForGID(gid);
        rect = cc.rectPixelsToPoints(rect);

        var z = 0 | (pos.x + pos.y * this._layerSize.width);
        var tile = this._reusedTileWithRect(rect);
        this._setupTileSprite(tile, pos, gid);

        // 优化:
        // appendTileForGID 与 insertTileforGID的不同是appendTileForGID更快, 因为
		// 它是在texutre atlas的尾部添加tile
        var indexForZ = this._atlasIndexArray.length;

        // 不要用"标准"的方法添加
        this.insertQuadFromSprite(tile, indexForZ);

        // 由于修改质量值了, 所以应该在addQuadFromSprite之后添加,
        this._atlasIndexArray.splice(indexForZ, 0, z);
        return tile;
    },

    _insertTileForGID:function (gid, pos) {
        var rect = this.tileset.rectForGID(gid);
        rect = cc.rectPixelsToPoints(rect);

        var z = 0 | (pos.x + pos.y * this._layerSize.width);
        var tile = this._reusedTileWithRect(rect);
        this._setupTileSprite(tile, pos, gid);

        // 得到atlas的索引
        var indexForZ = this._atlasIndexForNewZ(z);

        // 优化: 添加quad, 不添加child
        this.insertQuadFromSprite(tile, indexForZ);

        // 插入到本地的atlasindex数组
        this._atlasIndexArray.splice(indexForZ, 0, z);
        // 更新可能的children
        if (this._children) {
            var locChildren = this._children;
            for (var i = 0, len = locChildren.length; i < len; i++) {
                var child = locChildren[i];
                if (child) {
                    var ai = child.atlasIndex;
                    if (ai >= indexForZ)
                        child.atlasIndex = ai + 1;
                }
            }
        }
        this.tiles[z] = gid;
        return tile;
    },

    _updateTileForGID:function (gid, pos) {
        var rect = this.tileset.rectForGID(gid);
        var locScaleFactor = this._contentScaleFactor;
        rect = cc.rect(rect.x / locScaleFactor, rect.y / locScaleFactor,
            rect.width / locScaleFactor, rect.height / locScaleFactor);
        var z = pos.x + pos.y * this._layerSize.width;

        var tile = this._reusedTileWithRect(rect);
        this._setupTileSprite(tile, pos, gid);

        // get atlas index   得到atlas索引
        tile.atlasIndex = this._atlasIndexForExistantZ(z);
        tile.dirty = true;
        tile.updateTransform();
        this.tiles[z] = gid;

        return tile;
    },

    //这个Layer识别一些特别的属性, 比如cc_vertez
    _parseInternalProperties:function () {
        // 如果cc_vertex=automatic, 那么titles会使用vertexz渲染
        var vertexz = this.getProperty("cc_vertexz");
        if (vertexz) {
            if (vertexz == "automatic") {
                this._useAutomaticVertexZ = true;
                var alphaFuncVal = this.getProperty("cc_alpha_func");
                var alphaFuncValue = 0;
                if (alphaFuncVal)
                    alphaFuncValue = parseFloat(alphaFuncVal);

                if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
                    this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
                    var alphaValueLocation = cc._renderContext.getUniformLocation(this.shaderProgram.getProgram(), cc.UNIFORM_ALPHA_TEST_VALUE_S);
                    // 注意:透明度测试shader是被硬编码之中, 相当于使用glAphaFunc(GL_GREATER)
                    this.shaderProgram.use();
                    this.shaderProgram.setUniformLocationWith1f(alphaValueLocation, alphaFuncValue);
                }
            } else
                this._vertexZvalue = parseInt(vertexz, 10);
        }
    },

    _setupTileSprite:function (sprite, pos, gid) {
        var z = pos.x + pos.y * this._layerSize.width;
        sprite.setPosition(this.getPositionAt(pos));
        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            sprite.vertexZ = this._vertexZForPos(pos);
        else
            sprite.tag = z;

        sprite.anchorX = 0;
	    sprite.anchorY = 0;
        sprite.opacity = this._opacity;
        if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
            sprite.rotation = 0.0;
        }

        sprite.setFlippedX(false);
        sprite.setFlippedY(false);

        // 旋转tiles使用三个翻转状态完成, 水平, 垂直, 和对角线翻转tile
        if ((gid & cc.TMX_TILE_DIAGONAL_FLAG) >>> 0) {
            // 放置锚点在中间, 以方便旋转
            sprite.anchorX = 0.5;
	        sprite.anchorY = 0.5;
            sprite.x = this.getPositionAt(pos).x + sprite.width / 2;
	        sprite.y = this.getPositionAt(pos).y + sprite.height / 2;

            var flag = (gid & (cc.TMX_TILE_HORIZONTAL_FLAG | cc.TMX_TILE_VERTICAL_FLAG) >>> 0) >>> 0;
            // 处理对角线翻转状态
            if (flag == cc.TMX_TILE_HORIZONTAL_FLAG)
                sprite.rotation = 90;
            else if (flag == cc.TMX_TILE_VERTICAL_FLAG)
                sprite.rotation = 270;
            else if (flag == (cc.TMX_TILE_VERTICAL_FLAG | cc.TMX_TILE_HORIZONTAL_FLAG) >>> 0) {
                sprite.rotation = 90;
	            sprite.setFlippedX(true);
            } else {
                sprite.rotation = 270;
	            sprite.setFlippedX(true);
            }
        } else {
            if ((gid & cc.TMX_TILE_HORIZONTAL_FLAG) >>> 0) {
                sprite.setFlippedX(true);
            }

            if ((gid & cc.TMX_TILE_VERTICAL_FLAG) >>> 0) {
                sprite.setFlippedY(true);
            }
        }
    },

    _reusedTileWithRect:function (rect) {
        if(cc._renderType === cc._RENDER_TYPE_WEBGL){
            if (!this._reusedTile) {
                this._reusedTile = new cc.Sprite();
                this._reusedTile.initWithTexture(this.texture, rect, false);
                this._reusedTile.batchNode = this;
            } else { 
                // XXX HACK: 如果 "batch node" 是nil
                // 那么Sprite的quad会被重置
                this._reusedTile.batchNode = null;

                // 重新初始化sprite
                this._reusedTile.setTextureRect(rect, false);

                // 恢复batch node
                this._reusedTile.batchNode = this;
            }
        } else {
            this._reusedTile = new cc.Sprite();
            this._reusedTile.initWithTexture(this._textureForCanvas, rect, false);
            this._reusedTile.batchNode = this;
            this._reusedTile.parent = this;
            this._reusedTile._cachedParent = this;
        }
        return this._reusedTile;
    },

    _vertexZForPos:function (pos) {
        var ret = 0;
        var maxVal = 0;
        if (this._useAutomaticVertexZ) {
            switch (this.layerOrientation) {
                case cc.TMX_ORIENTATION_ISO:
                    maxVal = this._layerSize.width + this._layerSize.height;
                    ret = -(maxVal - (pos.x + pos.y));
                    break;
                case cc.TMX_ORIENTATION_ORTHO:
                    ret = -(this._layerSize.height - pos.y);
                    break;
                case cc.TMX_ORIENTATION_HEX:
                    cc.log("TMX Hexa zOrder not supported");
                    break;
                default:
                    cc.log("TMX invalid value");
                    break;
            }
        } else
            ret = this._vertexZvalue;
        return ret;
    },

    _atlasIndexForExistantZ:function (z) {
        var item;
        if (this._atlasIndexArray) {
            var locAtlasIndexArray = this._atlasIndexArray;
            for (var i = 0, len = locAtlasIndexArray.length; i < len; i++) {
                item = locAtlasIndexArray[i];
                if (item == z)
                    break;
            }
        }
        if(!cc.isNumber(item))
            cc.log("cc.TMXLayer._atlasIndexForExistantZ(): TMX atlas index not found. Shall not happen");
        return i;
    },

    _atlasIndexForNewZ:function (z) {
        var locAtlasIndexArray = this._atlasIndexArray;
        for (var i = 0, len = locAtlasIndexArray.length; i < len; i++) {
            var val = locAtlasIndexArray[i];
            if (z < val)
                break;
        }
        return i;
    }
});

var _p = cc.TMXLayer.prototype;

if(cc._renderType == cc._RENDER_TYPE_WEBGL){
	_p.draw = cc.SpriteBatchNode.prototype.draw;
    _p.visit = cc.SpriteBatchNode.prototype.visit;
	_p.getTexture = cc.SpriteBatchNode.prototype.getTexture;
}else{
    _p.draw = _p._drawForCanvas;
    _p.visit = _p._visitForCanvas;
	_p.getTexture = _p._getTextureForCanvas;
}

/** @expose */
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);

// 扩展属性
/** @expose */
_p.layerWidth;
cc.defineGetterSetter(_p, "layerWidth", _p._getLayerWidth, _p._setLayerWidth);
/** @expose */
_p.layerHeight;
cc.defineGetterSetter(_p, "layerHeight", _p._getLayerHeight, _p._setLayerHeight);
/** @expose */
_p.tileWidth;
cc.defineGetterSetter(_p, "tileWidth", _p._getTileWidth, _p._setTileWidth);
/** @expose */
_p.tileHeight;
cc.defineGetterSetter(_p, "tileHeight", _p._getTileHeight, _p._setTileHeight);


/**
 * 创建一个cc.TMXLayer包括tile集合信息, layer信息, 和map信息
 * @deprecated 从v3.0之后,请使用 new cc.TMXLayer(tilesetInfo, layerInfo, mapInfo) 替代
 * @param {cc.TMXTilesetInfo} tilesetInfo
 * @param {cc.TMXLayerInfo} layerInfo
 * @param {cc.TMXMapInfo} mapInfo
 * @return {cc.TMXLayer|Null}
 */
cc.TMXLayer.create = function (tilesetInfo, layerInfo, mapInfo) {
    return new cc.TMXLayer(tilesetInfo, layerInfo, mapInfo);
};

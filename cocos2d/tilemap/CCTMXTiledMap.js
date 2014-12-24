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
 直角鸟瞰
 * @constant
 * @type Number
 */
cc.TMX_ORIENTATION_ORTHO = 0;

/**
 * 六边形
 * @constant
 * @type Number
 */

cc.TMX_ORIENTATION_HEX = 1;

/**
 * 等距斜视地图
 * @constant
 * @type Number
 */
cc.TMX_ORIENTATION_ISO = 2;

/**
 * <p>cc.TMXTiledMap 知道如何解析并渲染一个TMX地图 </p>
 * <p>http://www.mapeditor.org 官网将其加入支持TMX
 * 它支持等距斜视(isometric),六边形(hexagonal),直角鸟瞰(orthogonal)tiles <br />
 * 也支持对象组,多对象以及多属性 </p>
 * <p>特性如下: <br />
 * - 每个Ttile都被当作一个cc.Sprite
 * - 这些精灵在需要时被创建而且仅当调用"layer.tileAt(position)"时才会被创建 <br />
 * - 由于每个tile是一个cc.Sprite，所以它们可以旋转/移动/缩放/着色/“透明化” <br />
 * - Tiles可以在运行时添加或删除 <br />
 * - Tiles的z-order亦可在运行时修改<br />
 * - 每个tile的锚点是(0,0)<br />
 * - TMXTileMap的锚点是(0,0) <br />
 * - TMX layers可以当作子节点添加<br />
 * - TXM layers默认会设置一个别名<br />
 * - Tileset图片可以在使用cc.TextureCache加载 <br />
 * - 每个tile都有一个唯一的tag <br />
 * - 每个tile都有一个唯一的z值.左上(top-left): z=1, 右下(bottom-right): z=max<br />
 * - 每个对象组将被被当作cc.MutableArray<br / >
 * - 对象类包含的属性都存储在一个字典中
 * - 属性可以赋值给地图(Map),层(Layer),对象属性(Object Group)以及对象(Object)
 * <p>限制: <br />
 * - 每个layer只支持一个tileset <br />
 * - 不支持内嵌的图片 <br />
 * - 只支持XML格式(不支持JSON格式)
 *
 * <p>技术描述: <br />
 * 每个layer通过使用cc.TMXLayer(cc.SpriteBatchNode的子类)创建  如果layer是可见的,那么如果你有5个layer,则5个TMXLayer被创建.<br />
 * 如果不可见,则layer根本不会被创建。 <br />
 * 在运行时,可通过如下获取layers(cc.TMXLayer对象)：<br />
 * - map.getChildByTag(tag_number);  // 0=1st layer, 1=2nd layer, 2=3rd layer, 等等...<br />           
 *  - map.getLayer(name_of_the_layer); </p>
 *
 * <p>使用cc.MutableArray的子类cc.TMXObjectGroup来创建对象组<br />
 * 在运行时,可通过如下获取该对象组：<br/>
 * - map.getObjectGroup(name_of_the_object_group); </p>
 *
 * <p>每个object都是一个cc.TMXObject对象.</p>
 *
 * <p>每个属性都以键值对的方式存储在一个cc.MutableDictionary中<br/>
 * 运行时,可通过如下获取属性：</p>
 * <p>map.getProperty(name_of_the_property); <br />
 * layer.getProperty(name_of_the_property); <br />
 * objectGroup.getProperty(name_of_the_property); <br />
 * object.getProperty(name_of_the_property);</p>
 * @class
 * @extends cc.Node
 * @param {String} tmxFile tmxFile fileName or content string 
 * @param {String} resourcePath   如果tmxFile是文件名则它不是必要的. 如果tmxFile是字符串则它是必要的

 *
 * @property {Array}    properties      - 地图的属性，它们可以使用tilemap 编辑器添加
 * @property {Number}   mapOrientation  - 地图方向
 * @property {Array}    objectGroups    - 地图的对象组
 * @property {Number}   mapWidth        - 地图的宽
 * @property {Number}   mapHeight       - 地图的高
 * @property {Number}   tileWidth       - tile的宽
 * @property {Number}   tileHeight      - tile的高
 *
 * @example
 * //例子
 * 1.
 * //通过指定TMX文件创建一个TMX Tiled地图
 * * var tmxTiledMap = new cc.TMXTiledMap("res/orthogonal-test1.tmx");
 * 2.
 * //通过指定字符串与资源路径创建一个TMX Tiled地图
 * var resources = "res/TileMaps";
 * var filePath = "res/TileMaps/orthogonal-test1.tmx";
 * var xmlStr = cc.loader.getRes(filePath);
 * var tmxTiledMap = new cc.TMXTiledMap(xmlStr, resources);
 */
cc.TMXTiledMap = cc.Node.extend(/** @lends cc.TMXTiledMap# */{
	properties: null,
	mapOrientation: null,
	objectGroups: null,

    //地图的尺寸属性
    _mapSize: null,
    _tileSize: null,
    //tile属性
    _tileProperties: null,
    _className: "TMXTiledMap",

    /**
     * 通过指定TMX文件或内容字符串创建一个TMX Tiled地图 <br />
     * cc.TMXTiledMap的构造函数
     * @param {String} tmxFile 文件名或内容字符串
     * @param {String} resourcePath   如果tmxFile是文件名则它不是必要的. 如果tmxFile是字符串则它是必要的
     */
    ctor:function(tmxFile,resourcePath){
        cc.Node.prototype.ctor.call(this);
        this._mapSize = cc.size(0, 0);
        this._tileSize = cc.size(0, 0);

        if(resourcePath !== undefined){
            this.initWithXML(tmxFile,resourcePath);
        }else if(tmxFile !== undefined){
            this.initWithTMXFile(tmxFile);
        }
    },

    /**
     * 获取map的尺寸
     * @return {cc.Size}
     */
    getMapSize:function () {
        return cc.size(this._mapSize.width, this._mapSize.height);
    },

    /**
     * 设置map的尺寸
     * @param {cc.Size} Var
     */
    setMapSize:function (Var) {
        this._mapSize.width = Var.width;
        this._mapSize.height = Var.height;
    },

	_getMapWidth: function () {
		return this._mapSize.width;
	},
	_setMapWidth: function (width) {
		this._mapSize.width = width;
	},
	_getMapHeight: function () {
		return this._mapSize.height;
	},
	_setMapHeight: function (height) {
		this._mapSize.height = height;
	},

    /**
     * 获取tile的尺寸
     * @return {cc.Size}
     */
    getTileSize:function () {
        return cc.size(this._tileSize.width, this._tileSize.height);
    },

    /**
     * 设置tile的尺寸
     * @param {cc.Size} Var
     */
    setTileSize:function (Var) {
        this._tileSize.width = Var.width;
        this._tileSize.height = Var.height;
    },

	_getTileWidth: function () {
		return this._tileSize.width;
	},
	_setTileWidth: function (width) {
		this._tileSize.width = width;
	},
	_getTileHeight: function () {
		return this._tileSize.height;
	},
	_setTileHeight: function (height) {
		this._tileSize.height = height;
	},

    /**
     * 获取map的方向
     * @return {Number}
     */
    getMapOrientation:function () {
        return this.mapOrientation;
    },

    /**
     * 设置map的方向
     * @param {Number} Var
     */
    setMapOrientation:function (Var) {
        this.mapOrientation = Var;
    },

    /**
     * 获取对象组
     * @return {Array}
     */
    getObjectGroups:function () {
        return this.objectGroups;
    },

    /**
     * 设置对象组
     * @param {Array} Var
     */
    setObjectGroups:function (Var) {
        this.objectGroups = Var;
    },

    /**
     * 获取属性
     * @return {object}
     */
    getProperties:function () {
        return this.properties;
    },

    /**
     * 设置属性
     * @param {object} Var
     */
    setProperties:function (Var) {
        this.properties = Var;
    },

    /**
     * 通过指定的TMX文件初始化一个cc.TMXTiledMap实例
     * @param {String} tmxFile
     * @return {Boolean} 是否初始化成功
     * @example
     * //example
     * var map = new cc.TMXTiledMap()
     * map.initWithTMXFile("hello.tmx");
     */
    initWithTMXFile:function (tmxFile) {
        if(!tmxFile || tmxFile.length == 0)
            throw "cc.TMXTiledMap.initWithTMXFile(): tmxFile should be non-null or non-empty string.";
	    this.width = 0;
	    this.height = 0;
        var mapInfo = new cc.TMXMapInfo(tmxFile);
        if (!mapInfo)
            return false;

        var locTilesets = mapInfo.getTilesets();
        if(!locTilesets || locTilesets.length === 0)
            cc.log("cc.TMXTiledMap.initWithTMXFile(): Map not found. Please check the filename.");
        this._buildWithMapInfo(mapInfo);
        return true;
    },

    /**
     * 通过一个指定的TMX格式的XML字符串和TMX资源路径初始化一个cc.TMXTiledMap实例
     * @param {String} tmxString
     * @param {String} resourcePath
     * @return {Boolean} 初始化是否成功
     */
    initWithXML:function(tmxString, resourcePath){
        this.width = 0;
	    this.height = 0;

        var mapInfo = new cc.TMXMapInfo(tmxString, resourcePath);
        var locTilesets = mapInfo.getTilesets();
        if(!locTilesets || locTilesets.length === 0)
            cc.log("cc.TMXTiledMap.initWithXML(): Map not found. Please check the filename.");
        this._buildWithMapInfo(mapInfo);
        return true;
    },

    _buildWithMapInfo:function (mapInfo) {
        this._mapSize = mapInfo.getMapSize();
        this._tileSize = mapInfo.getTileSize();
        this.mapOrientation = mapInfo.orientation;
        this.objectGroups = mapInfo.getObjectGroups();
        this.properties = mapInfo.properties;
        this._tileProperties = mapInfo.getTileProperties();

        var idx = 0;
        var layers = mapInfo.getLayers();
        if (layers) {
            var layerInfo = null;
            for (var i = 0, len = layers.length; i < len; i++) {
                layerInfo = layers[i];
                if (layerInfo && layerInfo.visible) {
                    var child = this._parseLayer(layerInfo, mapInfo);
                    this.addChild(child, idx, idx);
                    // update content size with the max size
	                this.width = Math.max(this.width, child.width);
	                this.height = Math.max(this.height, child.height);
                    idx++;
                }
            }
        }
    },

    /**
     * 返回所有的layer数组
     * @returns {Array}
     */
    allLayers: function () {
        var retArr = [], locChildren = this._children;
        for(var i = 0, len = locChildren.length;i< len;i++){
            var layer = locChildren[i];
            if(layer && layer instanceof cc.TMXLayer)
                retArr.push(layer);
        }
        return retArr;
    },

    /**
     * 通过layerName获取对应的TMXLayer
     * @param {String} layerName
     * @return {cc.TMXLayer}
     */
    getLayer:function (layerName) {
        if(!layerName || layerName.length === 0)
            throw "cc.TMXTiledMap.getLayer(): layerName should be non-null or non-empty string.";
        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var layer = locChildren[i];
            if (layer && layer.layerName == layerName)
                return layer;
        }
        // layer not found
        return null;
    },

    /**
     * 通过groupName获取对应的TMXObjectGroup
     * @param {String} groupName
     * @return {cc.TMXObjectGroup}
     */
    getObjectGroup:function (groupName) {
        if(!groupName || groupName.length === 0)
            throw "cc.TMXTiledMap.getObjectGroup(): groupName should be non-null or non-empty string.";
        if (this.objectGroups) {
            for (var i = 0; i < this.objectGroups.length; i++) {
                var objectGroup = this.objectGroups[i];
                if (objectGroup && objectGroup.groupName == groupName) {
                    return objectGroup;
                }
            }
        }
        // objectGroup not found
        return null;
    },

    /**
     * 通过propertyName获取对应的Property
     * @param {String} propertyName
     * @return {String}
     */
    getProperty:function (propertyName) {
        return this.properties[propertyName.toString()];
    },

    /**
     * 通过GID获取map对应的属性字典
     * @param {Number} GID
     * @return {object}
     * @deprecated
     */
    propertiesForGID:function (GID) {
        cc.log("propertiesForGID is deprecated. Please use getPropertiesForGID instead.");
        return this.getPropertiesForGID[GID];
    },

    /**
     * 通过指定GID查找tile对应的属性
     * @param {Number} GID
     * @return {object}
     */
    getPropertiesForGID: function(GID) {
        return this._tileProperties[GID];
    },

    _parseLayer:function (layerInfo, mapInfo) {
        var tileset = this._tilesetForLayer(layerInfo, mapInfo);
        var layer = new cc.TMXLayer(tileset, layerInfo, mapInfo);
        // 让layerinfo去释放tiles map的所属关系
        layerInfo.ownTiles = false;
        layer.setupTiles();
        return layer;
    },

    _tilesetForLayer:function (layerInfo, mapInfo) {
        var size = layerInfo._layerSize;
        var tilesets = mapInfo.getTilesets();
        if (tilesets) {
            for (var i = tilesets.length - 1; i >= 0; i--) {
                var tileset = tilesets[i];
                if (tileset) {
                    for (var y = 0; y < size.height; y++) {
                        for (var x = 0; x < size.width; x++) {
                            var pos = x + size.width * y;
                            var gid = layerInfo._tiles[pos];
                            if (gid != 0) {
                                // 优化: 快速返回
                                // 如果这个layer是非法的(每个layer有一个以上的tileset) 则会抛出一个cc.assert
                                if (((gid & cc.TMX_TILE_FLIPPED_MASK)>>>0) >= tileset.firstGid) {
                                    return tileset;
                                }
                            }

                        }
                    }
                }
            }
        }

        // 如果所有tiles为0 , 则返回空tileset
        cc.log("cocos2d: Warning: TMX Layer " + layerInfo.name + " has no tiles");
        return null;
    }
});

var _p = cc.TMXTiledMap.prototype;

// 扩展 properties
/** @expose */
_p.mapWidth;
cc.defineGetterSetter(_p, "mapWidth", _p._getMapWidth, _p._setMapWidth);
/** @expose */
_p.mapHeight;
cc.defineGetterSetter(_p, "mapHeight", _p._getMapHeight, _p._setMapHeight);
/** @expose */
_p.tileWidth;
cc.defineGetterSetter(_p, "tileWidth", _p._getTileWidth, _p._setTileWidth);
/** @expose */
_p.tileHeight;
cc.defineGetterSetter(_p, "tileHeight", _p._getTileHeight, _p._setTileHeight);


/**
 * 通过指定TMX文件或内容字符串创建一个TMX Tiled地图
 * 实现cc.TMXTiledMap
 * @deprecated 从v3.0后，请使用new cc.TMXTiledMap(tmxFile, resourcePath)代替
 * @param {String} tmxFile tmx文件名或内容字符串
 * @param {String} resourcePath   如果tmxFile是文件名则它不是必要的. 如果tmxFile是字符串则它是必要的
 * @return {cc.TMXTiledMap|undefined}
 */
cc.TMXTiledMap.create = function (tmxFile,resourcePath) {
    return new cc.TMXTiledMap(tmxFile,resourcePath);
};

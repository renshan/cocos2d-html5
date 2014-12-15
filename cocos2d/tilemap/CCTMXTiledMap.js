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
 Orthogonal orientation
 直角鸟瞰
 * @constant
 * @type Number
 */
cc.TMX_ORIENTATION_ORTHO = 0;

/**
 * Hexagonal orientation
 * 六边形
 * @constant
 * @type Number
 */

cc.TMX_ORIENTATION_HEX = 1;

/**
 * Isometric orientation
 * 等距斜视地图
 * @constant
 * @type Number
 */
cc.TMX_ORIENTATION_ISO = 2;

/**
 * <p>cc.TMXTiledMap knows how to parse and render a TMX map.</p>                              <p>cc.TMXTiledMap 知道如何渲染与解析TMX map </p>
 * <p>It adds support for the TMX tiled map format used by http://www.mapeditor.org <br />     <p>  http://www.mapeditor.org 官网将其加入支持TMX
 * It supports isometric, hexagonal and orthogonal tiles.<br />                                支持等距斜视(isometric),六边形(hexagonal),直角鸟瞰(orthogonal)tiles <br />
 * It also supports object groups, objects, and properties.</p>                                也支持对象组,多对象以及多属性 </p>
 * <p>Features: <br />                                                                         <p>特性如下: <br />
 * - Each tile will be treated as an cc.Sprite<br />                                            - 每个TMXTiledMap都被当作一个Sprite
 * - The sprites are created on demand. They will be created only when you call "layer.getTileAt(position)" <br />   - 这些精灵需要时被创建而且仅当调用layer.tileAt(position)时才会被创建 <br />
 * - Each tile can be rotated / moved / scaled / tinted / "opacitied", since each tile is a cc.Sprite<br />           - 每个tile继承了精灵的特点，可以旋转/移动/缩放/着色/透明化 <br />
 * - Tiles can be added/removed in runtime<br />                                                                      - Tiles可以在运行时添加或删除 <br />
 * - The z-order of the tiles can be modified in runtime<br />                                                        - Tiles的z-order亦可在运行时修改<br />
 * - Each tile has an anchorPoint of (0,0) <br />                                                                     - 每个tile的锚点是(0,0)<br />
 * - The anchorPoint of the TMXTileMap is (0,0) <br />                                                                - TMXTileMap的锚点是(0,0) <br />
 * - The TMX layers will be added as a child <br />                                                                   - TMX layers可以当作子节点添加<br />
 * - The TMX layers will be aliased by default <br />                                                                 - TXM layers默认会设置一个别名<br />
 * - The tileset image will be loaded using the cc.TextureCache <br />                                                - Tileset图片可以在使用TextureCache时加入 <br />
 * - Each tile will have a unique tag<br />                                                                           - 每个tile都有一个唯一的tag <br />
 * - Each tile will have a unique z value. top-left: z=1, bottom-right: z=max z<br />                                 - 每个tile都有一个唯一的z值.左上(top-left): z=1, 右下(bottom-right): z=max<br />
 * - Each object group will be treated as an cc.MutableArray <br />                                                   - 每个对象组可以被用作cc.MutableArray<br / >
 * - Object class which will contain all the properties in a dictionary<br />                                         - 对象类包含的属性都存储在一个字典中
 * - Properties can be assigned to the Map, Layer, Object Group, and Object</p>                                       - 属性可以赋值给地图(Map),层(Layer),对象属性(Object Group)以及对象(Object)
 * <p>Limitations: <br />                                                                                             <p>受限点: <br />
 * - It only supports one tileset per layer. <br />                                                                   - 每个layer只支持一个tileset <br />
 * - Embeded images are not supported <br />                                                                          - 不支持内嵌的图片 <br />
 * - It only supports the XML format (the JSON format is not supported)</p>                                           - 只支持XML格式(不支持JSON格式)
 *
 * <p>Technical description: <br />                                                                                   <p>技术描述: <br />
 * Each layer is created using an cc.TMXLayer (subclass of cc.SpriteBatchNode). If you have 5 layers, then 5 cc.TMXLayer will be created, <br />  如果layer是可视的,那么如果你有5个layer,则5个TMXLayer被创建.<br />
 * unless the layer visibility is off. In that case, the layer won't be created at all. <br />                                                    如果不可视,则layer根本不会被创建。 <br />
 * You can obtain the layers (cc.TMXLayer objects) at runtime by: <br />                                        在运行时,可通过如下获取layers
 * - map.getChildByTag(tag_number);  // 0=1st layer, 1=2nd layer, 2=3rd layer, etc...<br />           
 *  - map.getLayer(name_of_the_layer); </p>
 *
 * <p>Each object group is created using a cc.TMXObjectGroup which is a subclass of cc.MutableArray.<br />      <p>每个对象组被创建成一个继承自cc.MutableArray的cc.TMXObjectGroup<br />
 * You can obtain the object groups at runtime by: <br />                                                        运行时,可通过如下获取该对象组<br/>
 * - map.getObjectGroup(name_of_the_object_group); </p>
 *
 * <p>Each object is a cc.TMXObject.</p>                                                                         <p>每个object都是一个TMXObject.</p>
 *
 * <p>Each property is stored as a key-value pair in an cc.MutableDictionary.<br />                              <p>每个属性都以键值对的方式存入MutableDictionary<br/>
 * You can obtain the properties at runtime by: </p>                                                             运行时,可通过如下获取属性</p>
 * <p>map.getProperty(name_of_the_property); <br />
 * layer.getProperty(name_of_the_property); <br />
 * objectGroup.getProperty(name_of_the_property); <br />
 * object.getProperty(name_of_the_property);</p>
 * @class
 * @extends cc.Node
 * @param {String} tmxFile tmxFile fileName or content string 
 * @param {String} resourcePath   If tmxFile is a file name ,it is not required.If tmxFile is content string ,it is must required. 如果tmxFile是文件名则不是必要的. 如果tmxFile是字符串则是必要的

 *
 * @property {Array}    properties      - Properties from the map. They can be added using tilemap editors
 * @property {Number}   mapOrientation  - Map orientation
 * @property {Array}    objectGroups    - Object groups of the map
 * @property {Number}   mapWidth        - Width of the map
 * @property {Number}   mapHeight       - Height of the map
 * @property {Number}   tileWidth       - Width of a tile
 * @property {Number}   tileHeight      - Height of a tile
 *
 * @example
 * //example
 * 1.
 * //create a TMXTiledMap with file name   /通过指定TMX文件创建一个TMX Tiled地图
 * * var tmxTiledMap = new cc.TMXTiledMap("res/orthogonal-test1.tmx");
 * 2.
 * //create a TMXTiledMap with content string and resource path       通过指定字符串与资源路径创建一个TMX Tiled地图
 * var resources = "res/TileMaps";
 * var filePath = "res/TileMaps/orthogonal-test1.tmx";
 * var xmlStr = cc.loader.getRes(filePath);
 * var tmxTiledMap = new cc.TMXTiledMap(xmlStr, resources);
 */
cc.TMXTiledMap = cc.Node.extend(/** @lends cc.TMXTiledMap# */{
	properties: null,
	mapOrientation: null,
	objectGroups: null,

    //the map's size property measured in tiles   地图的尺寸属性
    _mapSize: null,
    _tileSize: null,
    //tile properties                            tile属性
    _tileProperties: null,
    _className: "TMXTiledMap",

    /**
     * Creates a TMX Tiled Map with a TMX file  or content string. <br/>    通过指定TMX文件或字符串创建一个TMX Tiled地图 <br />
     * Constructor of cc.TMXTiledMap                                        cc.TMXTiledMap的构造函数
     * @param {String} tmxFile fileName or content string                   文件名或有字符串
     * @param {String} resourcePath   If tmxFile is a file name ,it is not required.If tmxFile is content string ,it is must required. 如果tmxFile是文件名则不是必要的. 如果tmxFile是字符串则是必要的
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
     * Gets the map size.  获取map的尺寸
     * @return {cc.Size}
     */
    getMapSize:function () {
        return cc.size(this._mapSize.width, this._mapSize.height);
    },

    /**
     * Set the map size.   设置map的尺寸
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
     * Gets the tile size.   获取tile的尺寸
     * @return {cc.Size}
     */
    getTileSize:function () {
        return cc.size(this._tileSize.width, this._tileSize.height);
    },

    /**
     * Set the tile size     设置tile的尺寸
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
     * map orientation     获取map的定向
     * @return {Number}
     */
    getMapOrientation:function () {
        return this.mapOrientation;
    },

    /**
     * map orientation    设置map的定向
     * @param {Number} Var
     */
    setMapOrientation:function (Var) {
        this.mapOrientation = Var;
    },

    /**
     * object groups     获取对象组
     * @return {Array}
     */
    getObjectGroups:function () {
        return this.objectGroups;
    },

    /**
     * object groups    设置对象组
     * @param {Array} Var
     */
    setObjectGroups:function (Var) {
        this.objectGroups = Var;
    },

    /**
     * Gets the properties   获取属性
     * @return {object}
     */
    getProperties:function () {
        return this.properties;
    },

    /**
     * Set the properties   设置属性
     * @param {object} Var
     */
    setProperties:function (Var) {
        this.properties = Var;
    },

    /**
     * Initializes the instance of cc.TMXTiledMap with tmxFile      通过指定的TMX文件初始化一个TMX Tiled地图
     * @param {String} tmxFile
     * @return {Boolean} Whether the initialization was successful. 是否初始化成功
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
     * Initializes the instance of cc.TMXTiledMap with tmxString       通过一个指定的TMX格式的XML和TMX资源路径初始化一个TMX Tiled地图
     * @param {String} tmxString
     * @param {String} resourcePath
     * @return {Boolean} Whether the initialization was successful.    初始化是否成功
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
     * Return All layers array.    返回所有的layer数组
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
     * return the TMXLayer for the specific layer    通过layerName获取对应的TMXLayer
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
     * Return the TMXObjectGroup for the specific group    通过groupName获取对应的TMXObjectGroup
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
     * Return the value for the specific property name    通过propertyName获取对应的Property
     * @param {String} propertyName
     * @return {String}
     */
    getProperty:function (propertyName) {
        return this.properties[propertyName.toString()];
    },

    /**
     * Return properties dictionary for tile GID    通过GID获取对应的属性字典
     * @param {Number} GID
     * @return {object}
     * @deprecated
     */
    propertiesForGID:function (GID) {
        cc.log("propertiesForGID is deprecated. Please use getPropertiesForGID instead.");
        return this.getPropertiesForGID[GID];
    },

    /**
     * Return properties dictionary for tile GID      通过指定GID查找其对应的属性
     * @param {Number} GID
     * @return {object}
     */
    getPropertiesForGID: function(GID) {
        return this._tileProperties[GID];
    },

    _parseLayer:function (layerInfo, mapInfo) {
        var tileset = this._tilesetForLayer(layerInfo, mapInfo);
        var layer = new cc.TMXLayer(tileset, layerInfo, mapInfo);
        // tell the layerinfo to release the ownership of the tiles map.    让layerinfo去释放tiles map的所有关系
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
                                // Optimization: quick return   优化: 
                                // if the layer is invalid (more than 1 tileset per layer) an cc.assert will be thrown later   如果这个layer是非法的(每个layer多于一个tileset) 则会抛出一个cc.assert
                                if (((gid & cc.TMX_TILE_FLIPPED_MASK)>>>0) >= tileset.firstGid) {
                                    return tileset;
                                }
                            }

                        }
                    }
                }
            }
        }

        // If all the tiles are 0, return empty tileset   如果所有tiles为0 , 则返回空tileset
        cc.log("cocos2d: Warning: TMX Layer " + layerInfo.name + " has no tiles");
        return null;
    }
});

var _p = cc.TMXTiledMap.prototype;

// Extended properties
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
 * Creates a TMX Tiled Map with a TMX file  or content string. 通过指定TMX文件或字符串创建一个TMX Tiled地图
 * Implementation cc.TMXTiledMap  实现cc.TMXTiledMap
 * @deprecated since v3.0 please use new cc.TMXTiledMap(tmxFile,resourcePath) instead.从v3.0后请使用new cc.TMXTiledMap(tmxFile, resourcePath)代替
 * @param {String} tmxFile tmxFile fileName or content string
 * @param {String} resourcePath   If tmxFile is a file name ,it is not required.If t2mxFile is content string ,it is must required. 如果tmxFile是文件名则不是必要的. 如果tmxFile是字符串则是必要的
 * @return {cc.TMXTiledMap|undefined}
 */
cc.TMXTiledMap.create = function (tmxFile,resourcePath) {
    return new cc.TMXTiledMap(tmxFile,resourcePath);
};

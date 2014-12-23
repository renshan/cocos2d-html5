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
 * cc.TMXObjectGroup代表TMX对象组
 * @class
 * @extends cc.Class
 * @property {Array}    properties  - 来自对象组的属性, 可以使用tilemap编辑器添加
 * @property {String}   groupName   - 对象组的名称
 */
cc.TMXObjectGroup = cc.Class.extend(/** @lends cc.TMXObjectGroup# */{
	properties: null,
    groupName: "",

    _positionOffset: null,
    _objects: null,

    /**
     * <p>cc.TMXObjectGroup的构造函数 <br/>
     * 当使用新的node构造方式时("var node = new cc.TMXObjectGroup()"), 这个函数会自动的调用<br/>
     * 覆写和扩展它的功能, 记得在扩展的ctor函数中调用this._super();<br/>
     */
    ctor:function () {
        this.groupName = "";
        this._positionOffset = cc.p(0,0);
        this.properties = [];
        this._objects = [];
    },

    /**
     * 获取child对象的偏移位置
     * @return {cc.Point}
     */
    getPositionOffset:function () {
        return cc.p(this._positionOffset);
    },

    /**
     * 设置child对象的偏移位置
     * @param {cc.Point} offset
     */
    setPositionOffset:function (offset) {
        this._positionOffset.x = offset.x;
        this._positionOffset.y = offset.y;
    },

    /**
     * 获取存储在字典中列表的属性
     * @return {Array}
     */
    getProperties:function () {
        return this.properties;
    },

    /**
     * 设置存储在字典中列表的属性
     * @param {object} Var
     */
    setProperties:function (Var) {
        this.properties.push(Var);
    },

    /**
     * 获取对象组名
     * @return {String}
     */
    getGroupName:function () {
        return this.groupName.toString();
    },

    /**
     * 设置对象组名
     * @param {String} groupName
     */
    setGroupName:function (groupName) {
        this.groupName = groupName;
    },

    /**
     * 返回指定属性名的值
     * @param {String} propertyName
     * @return {object}
     */
    propertyNamed:function (propertyName) {
        return this.properties[propertyName];
    },

    /**
     * <p>返回指定对象名的对象. <br />
     * 它会返回数组中指定名找到的第一个对象</p>
     * @param {String} objectName
     * @return {object|Null}
     */
    objectNamed:function (objectName) {
        if (this._objects && this._objects.length > 0) {
            var locObjects = this._objects;
            for (var i = 0, len = locObjects.length; i < len; i++) {
                var name = locObjects[i]["name"];
                if (name && name == objectName)
                    return locObjects[i];
            }
        }
        // object not found
        return null;
    },

    /**
     * 获取对象组
     * @return {Array}
     */
    getObjects:function () {
        return this._objects;
    },

    /**
     * 设置对象组
     * @param {object} objects
     */
    setObjects:function (objects) {
        this._objects.push(objects);
    }
});

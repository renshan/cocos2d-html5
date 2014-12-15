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
 * cc.TMXObjectGroup represents the TMX object group.                                                    TMXObjectGroup代表TMX对象组
 * @class
 * @extends cc.Class
 * @property {Array}    properties  - Properties from the group. They can be added using tilemap editors 来自对象组的属性, 可以使用tilemap编辑器添加
 * @property {String}   groupName   - Name of the group                                                  对象组的名称
 */
cc.TMXObjectGroup = cc.Class.extend(/** @lends cc.TMXObjectGroup# */{
	properties: null,
    groupName: "",

    _positionOffset: null,
    _objects: null,

    /**
     * <p>The cc.TMXObjectGroup's constructor. <br/>                                                                                          <p>TMXObjectGroup的构造函数 <br/>
     * This function will automatically be invoked when you create a node using new construction: "var node = new cc.TMXObjectGroup()".<br/>  当使用新的node构造方式时("var node = new cc.TMXObjectGroup()"), 这个函数会自动的调用<br/>
     * Override it to extend its behavior, remember to call "this._super()" in the extended "ctor" function.</p>                               覆盖和拓展了功能, 记得在ctor函数中调用this._super();
     */
    ctor:function () {
        this.groupName = "";
        this._positionOffset = cc.p(0,0);
        this.properties = [];
        this._objects = [];
    },

    /**
     * Offset position of child objects   获取chiles对象的偏移位置
     * @return {cc.Point}
     */
    getPositionOffset:function () {
        return cc.p(this._positionOffset);
    },

    /**
     * Offset position of child objects   设置chiles对象的偏移位置
     * @param {cc.Point} offset
     */
    setPositionOffset:function (offset) {
        this._positionOffset.x = offset.x;
        this._positionOffset.y = offset.y;
    },

    /**
     * List of properties stored in a dictionary   获取在字典中排列好的属性
     * @return {Array}
     */
    getProperties:function () {
        return this.properties;
    },

    /**
     * List of properties stored in a dictionary   设置在字典中排列好的属性
     * @param {object} Var
     */
    setProperties:function (Var) {
        this.properties.push(Var);
    },

    /**
     * Gets the Group name. 获取对象组名
     * @return {String}
     */
    getGroupName:function () {
        return this.groupName.toString();
    },

    /**
     * Set the Group name  设置对象组名
     * @param {String} groupName
     */
    setGroupName:function (groupName) {
        this.groupName = groupName;
    },

    /**
     * Return the value for the specific property name  返回指定属性名的值
     * @param {String} propertyName
     * @return {object}
     */
    propertyNamed:function (propertyName) {
        return this.properties[propertyName];
    },

    /**
     * <p>Return the dictionary for the specific object name. <br />              <p>返回指定属性名的值. <br />
     * It will return the 1st object found on the array for the given name.</p>   会返回数组中第一个被命名的对象</p>
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
     * Gets the objects.   获取对象组
     * @return {Array}
     */
    getObjects:function () {
        return this._objects;
    },

    /**
     * Set the objects.   设置对象组
     * @param {object} objects
     */
    setObjects:function (objects) {
        this._objects.push(objects);
    }
});

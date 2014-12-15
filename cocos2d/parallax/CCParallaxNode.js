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
 * Parallax Object. <br />  Parallax对象
 * Parallax required attributes are stored. 存储Parallax必须的属性
 * @class
 * @extends cc.Class
 */
cc.PointObject = cc.Class.extend(/** @lends cc.PointObject# */{
    _ratio:null,
    _offset:null,
    _child:null,

    ctor: function(ratio, offset){
        this.initWithCCPoint(ratio, offset);
    },

    /**
     * Gets the ratio. 获取比例
     * @return  {cc.Point} Not point, this is ratio. 不是点，是比例。
     */
    getRatio:function () {
        return this._ratio;
    },

    /**
     * Set the ratio. 设置比例
     * @param  {cc.Point} value
     */
    setRatio:function (value) {
        this._ratio = value;
    },

    /**
     * Gets the offset. 获取偏移量
     * @return  {cc.Point}
     */
    getOffset:function () {
        return this._offset;
    },

    /**
     * Set the offset. 设置偏移量
     * @param {cc.Point} value
     */
    setOffset:function (value) {
        this._offset = value;
    },

    /**
     * Gets the child. 获取子元素
     * @return {cc.Node}
     */
    getChild:function () {
        return this._child;
    },

    /**
     * Set the child. 设置子元素
     * @param  {cc.Node} value
     */
    setChild:function (value) {
        this._child = value;
    },

    /**
     * initializes cc.PointObject 初始化cc.PointObject
     * @param  {cc.Point} ratio Not point, this is a ratio. 比例，不是点。
     * @param  {cc.Point} offset 偏移量
     * @return {Boolean}
     */
    initWithCCPoint:function (ratio, offset) {
        this._ratio = ratio;
        this._offset = offset;
        this._child = null;
        return true;
    }
});

/**
 * Create a object to stored parallax data. 创建存储parallax数据的对象
 * @param {cc.Point} ratio 比例
 * @param {cc.Point} offset 偏移量
 * @return {cc.PointObject}
 * @deprecated since v3.0 please use new cc.PointObject() instead. 自v3.0后请创建 cc.NodeGrid 对象代替。
 */
cc.PointObject.create = function (ratio, offset) {
    return new cc.PointObject(ratio, offset);
};

/**
 * <p>cc.ParallaxNode: A node that simulates a parallax scroller<br /> ParallaxNode：模拟parallax scroller的节点
 * The children will be moved faster / slower than the parent according the the parallax ratio. </p> 根据parallax ratio 子元素将会比父元素删除的更快活着更慢。
 * @class
 * @extends cc.Node
 *
 * @property {Array}    parallaxArray   - Parallax nodes array
 */
cc.ParallaxNode = cc.Node.extend(/** @lends cc.ParallaxNode# */{
	parallaxArray:null,

    _lastPosition:null,
    _className:"ParallaxNode",

    /**
     * Gets the parallax array. 获取parallax数组
     * @return {Array}
     */
    getParallaxArray:function () {
        return this.parallaxArray;
    },

    /**
     * Set parallax array. 设置parallax数组
     * @param {Array} value
     */
    setParallaxArray:function (value) {
        this.parallaxArray = value;
    },

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.构造器的功能，重写构造器为了扩展构造器行为，记住要调用"this._super()"在扩展的"ctor"函数。
     */
    ctor:function () {
        cc.Node.prototype.ctor.call(this);
        this.parallaxArray = [];
        this._lastPosition = cc.p(-100, -100);
    },

    /**
     * Adds a child to the container with a z-order, a parallax ratio and a position offset 在容器里添加一个子元素包含z-order、parallax比例、位置偏移量
     * It returns self, so you can chain several addChilds. 返回self，你可以链接多个addChilds函数。
     * @param {cc.Node} child
     * @param {Number} z
     * @param {cc.Point} ratio
     * @param {cc.Point} offset
     * @example
     * //example
     * voidNode.addChild(background, -1, cc.p(0.4, 0.5), cc.p(0,0));
     */
    addChild:function (child, z, ratio, offset) {
        if (arguments.length === 3) {
            cc.log("ParallaxNode: use addChild(child, z, ratio, offset) instead");
            return;
        }
        if(!child)
            throw "cc.ParallaxNode.addChild(): child should be non-null";
        var obj = new cc.PointObject(ratio, offset);
        obj.setChild(child);
        this.parallaxArray.push(obj);

	    child.setPosition(this._position.x * ratio.x + offset.x, this._position.y * ratio.y + offset.y);

        cc.Node.prototype.addChild.call(this, child, z, child.tag);
    },

    /**
     *  Remove Child 删除子元素
     * @param {cc.Node} child
     * @param {Boolean} cleanup
     * @example
     * //example
     * voidNode.removeChild(background,true);
     */
    removeChild:function (child, cleanup) {
        var locParallaxArray = this.parallaxArray;
        for (var i = 0; i < locParallaxArray.length; i++) {
            var point = locParallaxArray[i];
            if (point.getChild() == child) {
                locParallaxArray.splice(i, 1);
                break;
            }
        }
        cc.Node.prototype.removeChild.call(this, child, cleanup);
    },

    /**
     *  Remove all children with cleanup 删除所有子元素
     * @param {Boolean} cleanup
     */
    removeAllChildren:function (cleanup) {
        this.parallaxArray.length = 0;
        cc.Node.prototype.removeAllChildren.call(this, cleanup);
    },

    /**
     * Recursive method that visit its children and draw them  访问cc.ParallaxNode子元素和绘制它们的递归方法
     */
    visit:function () {
        var pos = this._absolutePosition();
        if (!cc.pointEqualToPoint(pos, this._lastPosition)) {
            var locParallaxArray = this.parallaxArray;
            for (var i = 0, len = locParallaxArray.length; i < len; i++) {
                var point = locParallaxArray[i];
	            var child = point.getChild();
	            child.setPosition(-pos.x + pos.x * point.getRatio().x + point.getOffset().x,
	                               -pos.y + pos.y * point.getRatio().y + point.getOffset().y);
            }
            this._lastPosition = pos;
        }
        cc.Node.prototype.visit.call(this);
    },

    _absolutePosition:function () {
        var ret = this._position;
        var cn = this;
        while (cn.parent != null) {
            cn = cn.parent;
            ret = cc.pAdd(ret, cn.getPosition());
        }
        return ret;
    },

    _transformForRenderer:function () {
        var pos = this._absolutePosition();
        if (!cc.pointEqualToPoint(pos, this._lastPosition)) {
            var locParallaxArray = this.parallaxArray;
            for (var i = 0, len = locParallaxArray.length; i < len; i++) {
                var point = locParallaxArray[i];
                var child = point.getChild();
                child.setPosition(-pos.x + pos.x * point.getRatio().x + point.getOffset().x,
                    -pos.y + pos.y * point.getRatio().y + point.getOffset().y);
            }
            this._lastPosition = pos;
        }
        cc.Node.prototype._transformForRenderer.call(this);
    }
});

/**
 * Create new parallax node. 创建新的parallax节点
 * @deprecated since v3.0 please use new cc.ParallaxNode() instead. 自v3.0后请用 new cc.NodeGrid() 代替。
 * @return {cc.ParallaxNode}
 * @example
 * //example
 * var voidNode = new cc.ParallaxNode();
 */
cc.ParallaxNode.create = function () {
    return new cc.ParallaxNode();
};

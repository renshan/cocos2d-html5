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
 * 美元符号($), 跟jquery中的一样经典, 这个选择器(selector)可以向HTMLElement中添加额外的方法而不需要接触它的原型(prototype)</br>
 * 像jquery中一样它是可链接的
 * @param {HTMLElement|String} x 以字符串或整个HTMLElement的形式传入一个css选择器
 * @function
 * @return {cc.$}
 */
cc.$ = function (x) {
    /** @lends cc.$# */
    var parent = (this == cc) ? document : this;

    var el = (x instanceof HTMLElement) ? x : parent.querySelector(x);

    if (el) {
        /**
         * 用css选择器查找并返回子元素(与jquery.find相同)
         * @lends cc.$#
         * @function
         * @param {HTMLElement|String} x 以字符串或整个HTMLElement的形式传入一个css选择器
         * @return {cc.$}
         */
        el.find = el.find || cc.$;
        /**
         * 检查一个DOMNode是否含有指定类
         * @lends cc.$#
         * @function
         * @param {String} cls
         * @return {Boolean}
         */
        el.hasClass = el.hasClass || function (cls) {
            return this.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        };
        /**
         * 为一个DOMNode添加一个类, 返回自身以允许链接
         * @lends cc.$#
         * @function
         * @param {String} cls
         * @return {cc.$}
         */
        el.addClass = el.addClass || function (cls) {
            if (!this.hasClass(cls)) {
                if (this.className) {
                    this.className += " ";
                }
                this.className += cls;
            }
            return this;
        };
        /**
         * 从一个DOMNode中移除指定类, 返回自身以允许链接
         * @lends cc.$#
         * @function
         * @param {String} cls
         * @return {cc.$}
         */
        el.removeClass = el.removeClass || function (cls) {
            if (this.hasClass(cls)) {
                this.className = this.className.replace(cls, '');
            }
            return this;
        };
        /**
         * 将元素从父节点分离
         * @lends cc.$#
         * @function
         */
        el.remove = el.remove || function () {
            if (this.parentNode)
                this.parentNode.removeChild(this);
            return this;
        };

        /**
         * 作为孩子添加到另一个元素
         * @lends cc.$#
         * @function
         * @param {HTMLElement|cc.$} x
         * @return {cc.$}
         */
        el.appendTo = el.appendTo || function (x) {
            x.appendChild(this);
            return this;
        };

        /**
         * 作为孩子添加到另一个元素，并放置在孩子列表的顶部
         * @lends cc.$#
         * @function
         * @param {HTMLElement|cc.$} x
         * @return {cc.$}
         */
        el.prependTo = el.prependTo || function (x) {
            ( x.childNodes[0]) ? x.insertBefore(this, x.childNodes[0]) : x.appendChild(this);
            return this;
        };

        /**
         * 更新css变换(transform)的辅助函数
         * @lends cc.$#
         * @function
         * @return {cc.$}
         */
        el.transforms = el.transforms || function () {
            this.style[cc.$.trans] = cc.$.translate(this.position) + cc.$.rotate(this.rotation) + cc.$.scale(this.scale) + cc.$.skew(this.skew);
            return this;
        };

        el.position = el.position || {x: 0, y: 0};
        el.rotation = el.rotation || 0;
        el.scale = el.scale || {x: 1, y: 1};
        el.skew = el.skew || {x: 0, y: 0};

        /**
         * 移动元素
         * @memberOf cc.$#
         * @name translates
         * @function
         * @param {Number} x 以像素为单位
         * @param {Number} y 以像素为单位
         * @return {cc.$}
         */
        el.translates = function (x, y) {
            this.position.x = x;
            this.position.y = y;
            this.transforms();
            return this
        };

        /**
         * 旋转元素
         * @memberOf cc.$#
         * @name rotate
         * @function
         * @param {Number} x 以角度为单位
         * @return {cc.$}
         */
        el.rotate = function (x) {
            this.rotation = x;
            this.transforms();
            return this
        };

        /**
         * 改变元素尺寸
         * @memberOf cc.$#
         * @name resize
         * @function
         * @param {Number} x
         * @param {Number} y
         * @return {cc.$}
         */
        el.resize = function (x, y) {
            this.scale.x = x;
            this.scale.y = y;
            this.transforms();
            return this
        };

        /**
         * 倾斜元素
         * @memberOf cc.$#
         * @name setSkew
         * @function
         * @param {Number} x 以角度为单位
         * @param {Number} y
         * @return {cc.$}
         */
        el.setSkew = function (x, y) {
            this.skew.x = x;
            this.skew.y = y;
            this.transforms();
            return this
        };
    }
    return el;
};
//获取前缀和css3 3D支持
switch (cc.sys.browserType) {
    case cc.sys.BROWSER_TYPE_FIREFOX:
        cc.$.pfx = "Moz";
        cc.$.hd = true;
        break;
    case cc.sys.BROWSER_TYPE_CHROME:
    case cc.sys.BROWSER_TYPE_SAFARI:
        cc.$.pfx = "webkit";
        cc.$.hd = true;
        break;
    case cc.sys.BROWSER_TYPE_OPERA:
        cc.$.pfx = "O";
        cc.$.hd = false;
        break;
    case cc.sys.BROWSER_TYPE_IE:
        cc.$.pfx = "ms";
        cc.$.hd = false;
        break;
    default:
        cc.$.pfx = "webkit";
        cc.$.hd = true;
}
//针对前缀转换的缓存
cc.$.trans = cc.$.pfx + "Transform";
//构造转换字符串的辅助函数
cc.$.translate = (cc.$.hd) ? function (a) {
    return "translate3d(" + a.x + "px, " + a.y + "px, 0) "
} : function (a) {
    return "translate(" + a.x + "px, " + a.y + "px) "
};
cc.$.rotate = (cc.$.hd) ? function (a) {
    return "rotateZ(" + a + "deg) ";
} : function (a) {
    return "rotate(" + a + "deg) ";
};
cc.$.scale = function (a) {
    return "scale(" + a.x + ", " + a.y + ") "
};
cc.$.skew = function (a) {
    return "skewX(" + -a.x + "deg) skewY(" + a.y + "deg)";
};


/**
 *  创建一个新元素, 并添加cc.$方法
 * @param {String} x 创建的元素的标签名
 * @return {cc.$}
 */
cc.$new = function (x) {
    return cc.$(document.createElement(x))
};
cc.$.findpos = function (obj) {
    var curleft = 0;
    var curtop = 0;
    do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return {x: curleft, y: curtop};
};

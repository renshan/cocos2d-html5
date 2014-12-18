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
 * cc.Point是点对象的类,请不要使用其构造器去创建点,使用cc.p()函数来代替.
 * @class cc.Point
 * @param {Number} x
 * @param {Number} y
 * @see cc.p
 */
cc.Point = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
};

/**
 * 创建cc.Point的辅助函数
 * @function
 * @param {Number|cc.Point} x 一个数字或者点对象
 * @param {Number} y
 * @return {cc.Point}
 * @example
 * var point1 = cc.p();
 * var point2 = cc.p(100, 100);
 * var point3 = cc.p(point2);
 * var point4 = cc.p({x: 100, y: 100});
 */
cc.p = function (x, y) {
    // 在JITs中,这里实际上可以使用"匿名类",来降低内存使用率跟提高性能
    // return cc.p(x, y);
    // 但这里可以对哈希映射进行重新分配,留下小幅度的优化空间给JIT,
    // 备注: 我们已经在Chrome跟firefox中进行测试过,它比cc.p(x,y)更快
    if (x == undefined)
        return {x: 0, y: 0};
    if (y == undefined)
        return {x: x.x, y: x.y};
    return {x: x, y: y};
};

/**
 * 判断两个点是否相等
 * @function
 * @param {cc.Point} point1
 * @param {cc.Point} point2
 * @return {Boolean}
 */
cc.pointEqualToPoint = function (point1, point2) {
    return point1 && point2 && (point1.x === point2.x) && (point1.y === point2.y);
};


/**
 * cc.Size是尺寸对象的类,请不要使用其构造器去创建尺寸,使用cc.size()函数来替代.
 * @class cc.Size
 * @param {Number} width
 * @param {Number} height
 * @see cc.size
 */
cc.Size = function (width, height) {
    this.width = width || 0;
    this.height = height || 0;
};

/**
 * 创建cc.Size对象的辅助函数
 * @function
 * @param {Number|cc.Size} w 宽度或者尺寸对象
 * @param {Number} h height
 * @return {cc.Size}
 * @example
 * var size1 = cc.size();
 * var size2 = cc.size(100,100);
 * var size3 = cc.size(size2);
 * var size4 = cc.size({width: 100, height: 100});
 */
cc.size = function (w, h) {
    // 在JITs中,这里实际上可以使用"匿名类",来降低内存使用率跟提高性能
    //return cc.size(w, h);
    // 但这里可以对哈希映射进行重新分配,留下小幅度的优化空间给JIT,
    // 备注: 我们已经在Chrome跟firefox中进行测试过,它比cc.size(w, h)更快
    if (w === undefined)
        return {width: 0, height: 0};
    if (h === undefined)
        return {width: w.width, height: w.height};
    return {width: w, height: h};
};

/**
 * 判断一个尺寸的值是否等于另外一个
 * @function
 * @param {cc.Size} size1
 * @param {cc.Size} size2
 * @return {Boolean}
 */
cc.sizeEqualToSize = function (size1, size2) {
    return (size1 && size2 && (size1.width == size2.width) && (size1.height == size2.height));
};


/**
 * cc.Rect是矩形对象的类,请不要使用其构造器去创建矩形,使用cc.rect()函数来替代.
 * @class cc.Rect
 * @param {Number} width
 * @param {Number} height
 * @see cc.rect
 */
cc.Rect = function (x, y, width, height) {
    this.x = x||0;
    this.y = y||0;
    this.width = width||0;
    this.height = height||0;
};

/**
 * 创建一个cc.Rect对象的辅助函数
 * @function
 * @param {Number|cc.Rect} x 一个数字或者一个矩形对象
 * @param {Number} y
 * @param {Number} w
 * @param {Number} h
 * @returns {cc.Rect}
 * @example
 * var rect1 = cc.rect();
 * var rect2 = cc.rect(100,100,100,100);
 * var rect3 = cc.rect(rect2);
 * var rect4 = cc.rect({x: 100, y: 100, width: 100, height: 100});
 */
cc.rect = function (x, y, w, h) {
    if (x === undefined)
        return {x: 0, y: 0, width: 0, height: 0};
    if (y === undefined)
        return {x: x.x, y: x.y, width: x.width, height: x.height};
    return {x: x, y: y, width: w, height: h };
};

/**
 * 判断一个矩形的值是否等于另外一个矩形
 * @function
 * @param {cc.Rect} rect1
 * @param {cc.Rect} rect2
 * @return {Boolean}
 */
cc.rectEqualToRect = function (rect1, rect2) {
    return rect1 && rect2 && (rect1.x === rect2.x) && (rect1.y === rect2.y) && (rect1.width === rect2.width) && (rect1.height === rect2.height);
};

cc._rectEqualToZero = function(rect){
    return rect && (rect.x === 0) && (rect.y === 0) && (rect.width === 0) && (rect.height === 0);
};

/**
 * 判断rect1是否包含rect2
 * @function
 * @param {cc.Rect} rect1
 * @param {cc.Rect} rect2
 * @return {Boolean}
 */
cc.rectContainsRect = function (rect1, rect2) {
    if (!rect1 || !rect2)
        return false;
    return !((rect1.x >= rect2.x) || (rect1.y >= rect2.y) ||
        ( rect1.x + rect1.width <= rect2.x + rect2.width) ||
        ( rect1.y + rect1.height <= rect2.y + rect2.height));
};

/**
 * 返回矩形X轴最右边的值
 * @function
 * @param {cc.Rect} rect
 * @return {Number} 最右边的X值
 */
cc.rectGetMaxX = function (rect) {
    return (rect.x + rect.width);
};

/**
 * 返回矩形X轴的中点
 * @function
 * @param {cc.Rect} rect
 * @return {Number} X轴的中点值
 */
cc.rectGetMidX = function (rect) {
    return (rect.x + rect.width / 2.0);
};
/**
 * 返回矩形X轴最左边的值
 * @function
 * @param {cc.Rect} rect
 * @return {Number} X轴最左边的值
 */
cc.rectGetMinX = function (rect) {
    return rect.x;
};

/**
 * 返回矩形Y轴最上面的值
 * @function
 * @param {cc.Rect} rect
 * @return {Number} Y轴最上面的值
 */
cc.rectGetMaxY = function (rect) {
    return(rect.y + rect.height);
};

/**
 * 返回矩形Y轴中点
 * @function
 * @param {cc.Rect} rect
 * @return {Number} Y轴的中点值
 */
cc.rectGetMidY = function (rect) {
    return rect.y + rect.height / 2.0;
};

/**
 * 返回矩形Y轴下方向最小值
 * @function
 * @param {cc.Rect} rect
 * @return {Number} Y轴最低端的值
 */
cc.rectGetMinY = function (rect) {
    return rect.y;
};

/**
 * 判断矩形是否包含某个点
 * @function
 * @param {cc.Rect} rect
 * @param {cc.Point} point
 * @return {Boolean}
 */
cc.rectContainsPoint = function (rect, point) {
    return (point.x >= cc.rectGetMinX(rect) && point.x <= cc.rectGetMaxX(rect) &&
        point.y >= cc.rectGetMinY(rect) && point.y <= cc.rectGetMaxY(rect)) ;
};

/**
 * 判断一个矩形是否在另外一个矩形内
 * @function
 * @param {cc.Rect} rectA
 * @param {cc.Rect} rectB
 * @return {Boolean}
 */
cc.rectIntersectsRect = function (ra, rb) {
    var maxax = ra.x + ra.width,
        maxay = ra.y + ra.height,
        maxbx = rb.x + rb.width,
        maxby = rb.y + rb.height;
    return !(maxax < rb.x || maxbx < ra.x || maxay < rb.y || maxby < ra.y);
};

/**
 * 判断两个矩形是否有交集
 * @function
 * @param {cc.Rect} rectA
 * @param {cc.Rect} rectB
 * @return {Boolean}
 */
cc.rectOverlapsRect = function (rectA, rectB) {
    return !((rectA.x + rectA.width < rectB.x) ||
        (rectB.x + rectB.width < rectA.x) ||
        (rectA.y + rectA.height < rectB.y) ||
        (rectB.y + rectB.height < rectA.y));
};

/**
 * 返回能包含两个矩形的最小矩形
 * @function
 * @param {cc.Rect} rectA
 * @param {cc.Rect} rectB
 * @return {cc.Rect}
 */
cc.rectUnion = function (rectA, rectB) {
    var rect = cc.rect(0, 0, 0, 0);
    rect.x = Math.min(rectA.x, rectB.x);
    rect.y = Math.min(rectA.y, rectB.y);
    rect.width = Math.max(rectA.x + rectA.width, rectB.x + rectB.width) - rect.x;
    rect.height = Math.max(rectA.y + rectA.height, rectB.y + rectB.height) - rect.y;
    return rect;
};

/**
 * 返回两个矩形的重叠部分
 * @function
 * @param {cc.Rect} rectA
 * @param {cc.Rect} rectB
 * @return {cc.Rect}
 */
cc.rectIntersection = function (rectA, rectB) {
    var intersection = cc.rect(
        Math.max(cc.rectGetMinX(rectA), cc.rectGetMinX(rectB)),
        Math.max(cc.rectGetMinY(rectA), cc.rectGetMinY(rectB)),
        0, 0);

    intersection.width = Math.min(cc.rectGetMaxX(rectA), cc.rectGetMaxX(rectB)) - cc.rectGetMinX(intersection);
    intersection.height = Math.min(cc.rectGetMaxY(rectA), cc.rectGetMaxY(rectB)) - cc.rectGetMinY(intersection);
    return intersection;
};



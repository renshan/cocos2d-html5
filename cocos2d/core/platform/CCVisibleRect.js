/****************************************************************************
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
 * cc.visibleRect是定义了当前view实际可见矩形区域的一个单例对象
 * 它与cc.view.getViewportRect()代表的是同一个矩形区域
 *
 * @property {cc.Point}     topLeft         - 游戏场景左上角的屏幕坐标
 * @property {cc.Point}     topRight        - 游戏场景右上角的屏幕坐标
 * @property {cc.Point}     top             - 游戏场景顶端中间的屏幕坐标
 * @property {cc.Point}     bottomLeft      - 游戏场景左下角的屏幕坐标
 * @property {cc.Point}     bottomRight     - 游戏场景右下角的屏幕坐标
 * @property {cc.Point}     bottom          - 游戏场景底部中间的屏幕坐标
 * @property {cc.Point}     center          - 游戏场景中心点的屏幕坐标
 * @property {cc.Point}     left            - 游戏场景左边中点的屏幕坐标
 * @property {cc.Point}     right           - 游戏场景右边中点的屏幕坐标
 * @property {Number}       width           - 屏幕宽度
 * @property {Number}       height          - 屏幕高度
 *
 * @class
 * @name cc.visibleRect
 */
cc.visibleRect = {
    topLeft:cc.p(0,0),
    topRight:cc.p(0,0),
    top:cc.p(0,0),
    bottomLeft:cc.p(0,0),
    bottomRight:cc.p(0,0),
    bottom:cc.p(0,0),
    center:cc.p(0,0),
    left:cc.p(0,0),
    right:cc.p(0,0),
    width:0,
    height:0,

    /**
     * initialize 	初始化
     * @param {cc.Rect} visibleRect
     */
    init:function(visibleRect){

        var w = this.width = visibleRect.width;
        var h = this.height = visibleRect.height;
        var l = visibleRect.x,
            b = visibleRect.y,
            t = b + h,
            r = l + w;

        //top
        this.topLeft.x = l;
        this.topLeft.y = t;
        this.topRight.x = r;
        this.topRight.y = t;
        this.top.x = l + w/2;
        this.top.y = t;

        //bottom
        this.bottomLeft.x = l;
        this.bottomLeft.y = b;
        this.bottomRight.x = r;
        this.bottomRight.y = b;
        this.bottom.x = l + w/2;
        this.bottom.y = b;

        //center
        this.center.x = l + w/2;
        this.center.y = b + h/2;

        //left
        this.left.x = l;
        this.left.y = b + h/2;

        //right
        this.right.x = r;
        this.right.y = b + h/2;
    }
};
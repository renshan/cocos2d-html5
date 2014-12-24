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
 * <p>
 *     这个action将一个页面从右下角的角度模拟成立体的场景.     <br/>         
 *     这个action本身不常用，但是会被PageTurnTransition调用.                     <br/>         
 *                                                                                            <br/>
 *     基于一个L Hong et al写的原始文件.                                            <br/>         
 *     http://www.parc.com/publication/1638/turning-pages-of-3d-electronic-books.html
 * </p>
 * @class
 * @extends cc.Grid3DAction
 */
cc.PageTurn3D = cc.Grid3DAction.extend(/** @lends cc.PageTurn3D# */{
    /**
     *  在每次tick循环里更新                                <br/>      
     * 时间参数是一个通过时长设置的百分比数  
     */
    update:function (time) {
        var tt = Math.max(0, time - 0.25);
        var deltaAy = (tt * tt * 500);
        var ay = -100 - deltaAy;

        var deltaTheta = -Math.PI / 2 * Math.sqrt(time);
        var theta = /*0.01f */ +Math.PI / 2 + deltaTheta;

        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        var locGridSize = this._gridSize;
        var locVer = cc.p(0, 0);
        for (var i = 0; i <= locGridSize.width; ++i) {
            for (var j = 0; j <= locGridSize.height; ++j) {
                locVer.x = i;
                locVer.y = j;
                // 获取原始的顶点
                var p = this.originalVertex(locVer);

                var R = Math.sqrt((p.x * p.x) + ((p.y - ay) * (p.y - ay)));
                var r = R * sinTheta;
                var alpha = Math.asin(p.x / R);
                var beta = alpha / sinTheta;
                var cosBeta = Math.cos(beta);

                // 如果beta变量大于PI，包裹成圆锥体
                // 减少半径大小防止顶点影响其他顶点
                if (beta <= Math.PI)
                    p.x = ( r * Math.sin(beta));
                else
                    p.x = 0;     //硬性设置 x=0 去停止包裹顶点    

                p.y = ( R + ay - ( r * (1 - cosBeta) * sinTheta));

                // We scale z here to avoid the animation being
                // 缩放z坐标去避免动画因为透镜转换变得比场景大     
                p.z = (r * ( 1 - cosBeta ) * cosTheta) / 7;//  如果是100，则没有效果        

                // 在变换过程中，防止z坐标减少到底层页面之下
                // issue #751
                if (p.z < 0.5)
                    p.z = 0.5;

                // 设置新的坐标     
                this.setVertex(locVer, p);
            }
        }
    }
});

/**
 * 创建一个PageTurn3D action      
 * @function
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @return {cc.PageTurn3D}
 */
cc.pageTurn3D = function (duration, gridSize) {
    return new cc.PageTurn3D(duration, gridSize);
};
/**
 * 3.0后的版本用cc.pageTurn3D代替
 * create PageTurn3D action
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @return {cc.PageTurn3D}
 * @static
 * @deprecated since v3.0 please use cc.pageTurn3D instead.
 */
cc.PageTurn3D.create = cc.pageTurn3D;
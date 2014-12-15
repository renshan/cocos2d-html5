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
 * @const
 * @type {number}
 */
cc.PI2 = Math.PI * 2;

/**
 * Canvas of DrawingPrimitive implement version use for canvasMode  DrawingPrimitive的Canvas渲染模式实现
 * @class
 * @extends cc.Class
 * @param {CanvasRenderingContext2D} renderContext
 */
cc.DrawingPrimitiveCanvas = cc.Class.extend(/** @lends cc.DrawingPrimitiveCanvas# */{
    _cacheArray:[],
    _renderContext:null,
    /**
     * Constructor of cc.DrawingPrimitiveCanvas  cc.DrawingPrimitiveCanvas的初始化方法
     * @param {CanvasRenderingContext2D} renderContext
     */
    ctor:function (renderContext) {
        this._renderContext = renderContext;
    },

    /**
     * draws a point given x and y coordinate measured in points 画出坐标为x和y的一个点，x和y的坐标系单位为points。
     * @override
     * @param {cc.Point} point 点
     * @param {Number} size 大小
     */
    drawPoint:function (point, size) {
        if (!size) {
            size = 1;
        }
        var locScaleX = cc.view.getScaleX(), locScaleY = cc.view.getScaleY();
        var newPoint = cc.p(point.x  * locScaleX, point.y * locScaleY);
        this._renderContext.beginPath();
        this._renderContext.arc(newPoint.x, -newPoint.y, size * locScaleX, 0, Math.PI * 2, false);
        this._renderContext.closePath();
        this._renderContext.fill();
    },

    /**
     * draws an array of points. 画出一个Array中的点
     * @override
     * @param {Array} points point of array  点的数组
     * @param {Number} numberOfPoints 点的个数
     * @param {Number} size 大小
     */
    drawPoints:function (points, numberOfPoints, size) {
        if (points == null) {
            return;
        }
        if (!size) {
            size = 1;
        }
        var locContext = this._renderContext,locScaleX = cc.view.getScaleX(), locScaleY = cc.view.getScaleY();

        locContext.beginPath();
        for (var i = 0, len = points.length; i < len; i++)
            locContext.arc(points[i].x * locScaleX, -points[i].y * locScaleY, size * locScaleX, 0, Math.PI * 2, false);
        locContext.closePath();
        locContext.fill();
    },

    /**
     * draws a line given the origin and destination point measured in points  根据一条直线的起点和终点绘制该条直线，起点和终点的单位为points
     * @override
     * @param {cc.Point} origin 起点
     * @param {cc.Point} destination 终点
     */
    drawLine:function (origin, destination) {
        var locContext = this._renderContext, locScaleX = cc.view.getScaleX(), locScaleY = cc.view.getScaleY();
        locContext.beginPath();
        locContext.moveTo(origin.x * locScaleX, -origin.y * locScaleY);
        locContext.lineTo(destination.x * locScaleX, -destination.y * locScaleY);
        locContext.closePath();
        locContext.stroke();
    },

    /**
     * draws a rectangle given the origin and destination point measured in points. 根据一个矩形的起点和终点绘制该矩形，起点和终点的单位为points（注：起点和终点为矩形对角线的顶点）
     * @param {cc.Point} origin 起点
     * @param {cc.Point} destination 终点
     */
    drawRect:function (origin, destination) {
        this.drawLine(cc.p(origin.x, origin.y), cc.p(destination.x, origin.y));
        this.drawLine(cc.p(destination.x, origin.y), cc.p(destination.x, destination.y));
        this.drawLine(cc.p(destination.x, destination.y), cc.p(origin.x, destination.y));
        this.drawLine(cc.p(origin.x, destination.y), cc.p(origin.x, origin.y));
    },

    /**
     * draws a solid rectangle given the origin and destination point measured in points. 根据一个实心矩形的起点和终点绘制该实心矩形，起点和终点的单位为points（注：起点和终点为矩形对角线的顶点）
     * @param {cc.Point} origin  起点
     * @param {cc.Point} destination  终点
     * @param {cc.Color} color  颜色
     */
    drawSolidRect:function (origin, destination, color) {
        var vertices = [
            origin,
            cc.p(destination.x, origin.y),
            destination,
            cc.p(origin.x, destination.y)
        ];

        this.drawSolidPoly(vertices, 4, color);
    },

    /**
     * draws a polygon given a pointer to cc.Point coordinates and the number of vertices measured in points.  根据一个指向多边形的顶点集合的指针和顶点的个数绘制该多边形，顶点的单位为point
     * @override
     * @param {Array} vertices a pointer to cc.Point coordinates  vertices是一个指向顶点数组的指针
     * @param {Number} numOfVertices the number of vertices measured in points  vertices中顶点的数量
     * @param {Boolean} closePolygon The polygon can be closed or open 多边形是否闭合
     * @param {Boolean} [fill=] The polygon can be closed or open and optionally filled with current color 根据多边形是否闭合来决定是否填充颜色
     */
    drawPoly:function (vertices, numOfVertices, closePolygon, fill) {
        fill = fill || false;

        if (vertices == null)
            return;

        if (vertices.length < 3)
            throw new Error("Polygon's point must greater than 2");

        var firstPoint = vertices[0], locContext = this._renderContext;
        var locScaleX = cc.view.getScaleX(), locScaleY = cc.view.getScaleY();
        locContext.beginPath();
        locContext.moveTo(firstPoint.x * locScaleX, -firstPoint.y * locScaleY);
        for (var i = 1, len = vertices.length; i < len; i++)
            locContext.lineTo(vertices[i].x * locScaleX, -vertices[i].y * locScaleY);

        if (closePolygon)
            locContext.closePath();

        if (fill)
            locContext.fill();
        else
            locContext.stroke();
    },

    /**
     * draws a solid polygon given a pointer to CGPoint coordinates, the number of vertices measured in points, and a color.  根据一个指向实心多边形CGPoint类型的顶点的指针和顶点的个数绘制该实心多边形，顶点的单位为point
     * @param {Array} polygons  指向多边形的顶点数组的指针
     * @param {Number} numberOfPoints  顶点的数量
     * @param {cc.Color} color  颜色
     */
    drawSolidPoly:function (polygons, numberOfPoints, color) {
        this.setDrawColor(color.r, color.g, color.b, color.a);
        this.drawPoly(polygons, numberOfPoints, true, true);
    },

    /**
     * draws a circle given the center, radius and number of segments.  根据一个圆的圆心、半径和弦绘制该圆
     * @override
     * @param {cc.Point} center center of circle  圆心
     * @param {Number} radius  半径
     * @param {Number} angle angle in radians  弧度
     * @param {Number} segments  曲线段数
     * @param {Boolean} [drawLineToCenter=]  是否需要绘制弦
     */
    drawCircle: function (center, radius, angle, segments, drawLineToCenter) {
        drawLineToCenter = drawLineToCenter || false;
        var locContext = this._renderContext;
        var locScaleX = cc.view.getScaleX(), locScaleY = cc.view.getScaleY();
        locContext.beginPath();
        var endAngle = angle - Math.PI * 2;
        locContext.arc(0 | (center.x * locScaleX), 0 | -(center.y * locScaleY), radius * locScaleX, -angle, -endAngle, false);
        if (drawLineToCenter) {
            locContext.lineTo(0 | (center.x * locScaleX), 0 | -(center.y * locScaleY));
        }
        locContext.stroke();
    },

    /**
     * draws a quad bezier path 绘制四次方贝塞尔曲线
     * @override
     * @param {cc.Point} origin 起点
     * @param {cc.Point} control 控制点
     * @param {cc.Point} destination 终点
     * @param {Number} segments 曲线段数
     */
    drawQuadBezier:function (origin, control, destination, segments) {
        //this is OpenGL Algorithm 这是OpenGL算法
        var vertices = this._cacheArray;
        vertices.length =0;

        var t = 0.0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 2) * origin.x + 2.0 * (1 - t) * t * control.x + t * t * destination.x;
            var y = Math.pow(1 - t, 2) * origin.y + 2.0 * (1 - t) * t * control.y + t * t * destination.y;
            vertices.push(cc.p(x, y));
            t += 1.0 / segments;
        }
        vertices.push(cc.p(destination.x, destination.y));

        this.drawPoly(vertices, segments + 1, false, false);
    },

    /**
     * draws a cubic bezier path 绘制三次方贝塞尔曲线
     * @override
     * @param {cc.Point} origin  起点
     * @param {cc.Point} control1 控制点1
     * @param {cc.Point} control2 控制点2
     * @param {cc.Point} destination 终点
     * @param {Number} segments 曲线段数
     */
    drawCubicBezier:function (origin, control1, control2, destination, segments) {
        //this is OpenGL Algorithm  这是OpenGL算法
        var vertices = this._cacheArray;
        vertices.length =0;

        var t = 0;
        for (var i = 0; i < segments; i++) {
            var x = Math.pow(1 - t, 3) * origin.x + 3.0 * Math.pow(1 - t, 2) * t * control1.x + 3.0 * (1 - t) * t * t * control2.x + t * t * t * destination.x;
            var y = Math.pow(1 - t, 3) * origin.y + 3.0 * Math.pow(1 - t, 2) * t * control1.y + 3.0 * (1 - t) * t * t * control2.y + t * t * t * destination.y;
            vertices.push(cc.p(x , y ));
            t += 1.0 / segments;
        }
        vertices.push(cc.p(destination.x , destination.y));

        this.drawPoly(vertices, segments + 1, false, false);
    },

    /**
     * draw a CatmullRom curve  绘制一条差值曲线
     * @override
     * @param {Array} points 点的数组
     * @param {Number} segments 曲线段数
     */
    drawCatmullRom:function (points, segments) {
        this.drawCardinalSpline(points, 0.5, segments);
    },

    /**
     * draw a cardinal spline path  绘制一个基数样条路径
     * @override
     * @param {Array} config 参数
     * @param {Number} tension 张力
     * @param {Number} segments 曲线段数
     */
    drawCardinalSpline:function (config, tension, segments) {
        //lazy_init();
        cc._renderContext.strokeStyle = "rgba(255,255,255,1)";
        var points = this._cacheArray;
        points.length = 0;
        var p, lt;
        var deltaT = 1.0 / config.length;

        for (var i = 0; i < segments + 1; i++) {
            var dt = i / segments;

            // border  边
            if (dt == 1) {
                p = config.length - 1;
                lt = 1;
            } else {
                p = 0 | (dt / deltaT);
                lt = (dt - deltaT * p) / deltaT;
            }

            // Interpolate  插值
            var newPos = cc.CardinalSplineAt(
                cc.getControlPointAt(config, p - 1),
                cc.getControlPointAt(config, p - 0),
                cc.getControlPointAt(config, p + 1),
                cc.getControlPointAt(config, p + 2),
                tension, lt);
            points.push(newPos);
        }
        this.drawPoly(points, segments + 1, false, false);
    },

    /**
     * draw an image  绘制一张图片
     * @override
     * @param {HTMLImageElement|HTMLCanvasElement} image
     * @param {cc.Point} sourcePoint
     * @param {cc.Size} sourceSize
     * @param {cc.Point} destPoint
     * @param {cc.Size} destSize
     */
    drawImage:function (image, sourcePoint, sourceSize, destPoint, destSize) {
        var len = arguments.length;
        switch (len) {
            case 2:
                var height = image.height;
                this._renderContext.drawImage(image, sourcePoint.x, -(sourcePoint.y + height));
                break;
            case 3:
                this._renderContext.drawImage(image, sourcePoint.x, -(sourcePoint.y + sourceSize.height), sourceSize.width, sourceSize.height);
                break;
            case 5:
                this._renderContext.drawImage(image, sourcePoint.x, sourcePoint.y, sourceSize.width, sourceSize.height, destPoint.x, -(destPoint.y + destSize.height),
                    destSize.width, destSize.height);
                break;
            default:
                throw new Error("Argument must be non-nil");
                break;
        }
    },

    /**
     * draw a star 绘制星型
     * @param {CanvasRenderingContext2D} ctx canvas context
     * @param {Number} radius
     * @param {cc.Color} color
     */
    drawStar:function (ctx, radius, color) {
        var context = ctx || this._renderContext;
        radius *= cc.view.getScaleX();
        var colorStr = "rgba(" + (0 | color.r) + "," + (0 | color.g) + "," + (0 | color.b);
        context.fillStyle = colorStr + ",1)";
        var subRadius = radius / 10;

        context.beginPath();
        context.moveTo(-radius, radius);
        context.lineTo(0, subRadius);
        context.lineTo(radius, radius);
        context.lineTo(subRadius, 0);
        context.lineTo(radius, -radius);
        context.lineTo(0, -subRadius);
        context.lineTo(-radius, -radius);
        context.lineTo(-subRadius, 0);
        context.lineTo(-radius, radius);
        context.closePath();
        context.fill();

        var g1 = context.createRadialGradient(0, 0, subRadius, 0, 0, radius);
        g1.addColorStop(0, colorStr + ", 1)");
        g1.addColorStop(0.3, colorStr + ", 0.8)");
        g1.addColorStop(1.0, colorStr + ", 0.0)");
        context.fillStyle = g1;
        context.beginPath();
        var startAngle_1 = 0;
        var endAngle_1 = cc.PI2;
        context.arc(0, 0, radius - subRadius, startAngle_1, endAngle_1, false);
        context.closePath();
        context.fill();
    },

    /**
     * draw a color ball  绘制一个颜色填充的球
     * @param {CanvasRenderingContext2D} ctx canvas context
     * @param {Number} radius
     * @param {cc.Color} color
     */
    drawColorBall:function (ctx, radius, color) {
        var context = ctx || this._renderContext;
        radius *= cc.view.getScaleX();
        var colorStr = "rgba(" +(0|color.r) + "," + (0|color.g) + "," + (0|color.b);
        var subRadius = radius / 10;

        var g1 = context.createRadialGradient(0, 0, subRadius, 0, 0, radius);
        g1.addColorStop(0, colorStr + ", 1)");
        g1.addColorStop(0.3, colorStr + ", 0.8)");
        g1.addColorStop(0.6, colorStr + ", 0.4)");
        g1.addColorStop(1.0, colorStr + ", 0.0)");
        context.fillStyle = g1;
        context.beginPath();
        var startAngle_1 = 0;
        var endAngle_1 = cc.PI2;
        context.arc(0, 0, radius, startAngle_1, endAngle_1, false);
        context.closePath();
        context.fill();
    },

    /**
     * fill text  填充文字
     * @param {String} strText 字符串
     * @param {Number} x  字符串x坐标
     * @param {Number} y  字符串y坐标
     */
    fillText:function (strText, x, y) {
        this._renderContext.fillText(strText, x, -y);
    },

    /**
     * set the drawing color with 4 unsigned bytes  根据四个无符号的比特数绘制颜色
     * @param {Number} r red value (0 to 255)  红色值（0到255）
     * @param {Number} g green value (0 to 255) 绿色值（0到255）
     * @param {Number} b blue value (0 to 255)  蓝色值（0到255）
     * @param {Number} a Alpha value (0 to 255)  透明度值（0到255）
     */
    setDrawColor:function (r, g, b, a) {
        this._renderContext.fillStyle = "rgba(" + r + "," + g + "," + b + "," + a / 255 + ")";
        this._renderContext.strokeStyle = "rgba(" + r + "," + g + "," + b + "," + a / 255 + ")";
    },

    /**
     * set the point size in points. Default 1.  设定点的大小.默认值为1.
     * @param {Number} pointSize  点的大小
     */
    setPointSize:function (pointSize) {
    },

    /**
     * set the line width. Default 1.  设定线的宽度.默认值为1.
     * @param {Number} width 线的宽度
     */
    setLineWidth:function (width) {
        this._renderContext.lineWidth = width * cc.view.getScaleX();
    }
});
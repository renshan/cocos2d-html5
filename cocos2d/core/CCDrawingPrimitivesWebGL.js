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
 * DrawingPrimitive的Canvas实现了WebGlMode
 * @class
 * @extends cc.Class
 */
cc.DrawingPrimitiveWebGL = cc.Class.extend(/** @lends cc.DrawingPrimitiveWebGL# */{
    _renderContext:null,
    _initialized:false,
    _shader: null,
    _colorLocation:-1,
    _colorArray: null,
    _pointSizeLocation:-1,
    _pointSize:-1,
    /**
     * cc.DrawingPrimitiveWebGL的构造方法
     * @param ctx rendercontext
     */
    ctor:function (ctx) {
        if (ctx == null)
            ctx = cc._renderContext;

        if (!ctx instanceof  WebGLRenderingContext)
            throw "Can't initialise DrawingPrimitiveWebGL. context need is WebGLRenderingContext";

        this._renderContext = ctx;
        this._colorArray = new Float32Array([1.0, 1.0, 1.0, 1.0]);
    },

    lazy_init:function () {
        var _t = this;
        if (!_t._initialized) {
            //
            //位置和颜色作为一个整体传递（为了模拟glColor4ub）
            //
            _t._shader = cc.shaderCache.programForKey(cc.SHADER_POSITION_UCOLOR);
            _t._colorLocation = _t._renderContext.getUniformLocation(_t._shader.getProgram(), "u_color");
            _t._pointSizeLocation = _t._renderContext.getUniformLocation(_t._shader.getProgram(), "u_pointSize");

            _t._initialized = true;
        }
    },

    /**
     * 初始化环境
     */
    drawInit:function () {
        this._initialized = false;
    },

    /**
     * 给定x和y坐标系的值绘制一个点,x和y的值的坐标单位为点
     * @param {cc.Point} 点
     */
    drawPoint:function (point) {
        this.lazy_init();

        var glContext = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        glContext.uniform4fv(this._colorLocation, this._colorArray);
        this._shader.setUniformLocationWith1f(this._pointSizeLocation, this._pointSize);

        var pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array([point.x, point.y]), glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);

        glContext.drawArrays(glContext.POINTS, 0, 1);
        glContext.deleteBuffer(pointBuffer);

        cc.incrementGLDraws(1);
    },

    /**
     * 绘制一个数组的点
     * @param {Array}  点的数组
     * @param {Number} 点的数量
     */
    drawPoints:function (points, numberOfPoints) {
        if (!points || points.length == 0)
            return;

        this.lazy_init();

        var glContext = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        glContext.uniform4fv(this._colorLocation, this._colorArray);
        this._shader.setUniformLocationWith1f(this._pointSizeLocation, this._pointSize);

        var pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, this._pointsToTypeArray(points), glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);

        glContext.drawArrays(glContext.POINTS, 0, points.length);
        glContext.deleteBuffer(pointBuffer);

        cc.incrementGLDraws(1);
    },

    _pointsToTypeArray:function (points) {
        var typeArr = new Float32Array(points.length * 2);
        for (var i = 0; i < points.length; i++) {
            typeArr[i * 2] = points[i].x;
            typeArr[i * 2 + 1] = points[i].y;
        }
        return typeArr;
    },

    /**
     * 给定一条线的起点和终点绘制该条线,起点和终点的单位为点
     * @param {cc.Point}  起点
     * @param {cc.Point}  终点
     */
    drawLine:function (origin, destination) {
        this.lazy_init();

        var glContext = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        glContext.uniform4fv(this._colorLocation, this._colorArray);

        var pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, this._pointsToTypeArray([origin, destination]), glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);

        glContext.drawArrays(glContext.LINES, 0, 2);
        glContext.deleteBuffer(pointBuffer);

        cc.incrementGLDraws(1);
    },

    /**
     * 给定一个矩形的起点和终点绘制该矩形，起点和终点的单位为point
     * @param {cc.Point}  起点
     * @param {cc.Point}  终点
     */
    drawRect:function (origin, destination) {
        this.drawLine(cc.p(origin.x, origin.y), cc.p(destination.x, origin.y));
        this.drawLine(cc.p(destination.x, origin.y), cc.p(destination.x, destination.y));
        this.drawLine(cc.p(destination.x, destination.y), cc.p(origin.x, destination.y));
        this.drawLine(cc.p(origin.x, destination.y), cc.p(origin.x, origin.y));
    },

    /**
     * 根据一个实心矩形的起点、终点和颜色绘制该实心矩形,起点和终点的单位为points(注:起点和终点为矩形对角线的顶点)
     * @param {cc.Point}  起点
     * @param {cc.Point}  终点
     * @param {cc.Color}  颜色
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
     * 根据一个指向多边形的顶点集合的指针和顶点的个数绘制该多边形,顶点的单位为point
     * @param {Array}   ertices是一个指向顶点数组的指针
     * @param {Number}  vertices中顶点的数量
     * @param {Boolean} 多边形是否闭合
     */
    drawPoly:function (vertices, numOfVertices, closePolygon) {
        this.lazy_init();

        var glContext = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        glContext.uniform4fv(this._colorLocation, this._colorArray);

        var pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, this._pointsToTypeArray(vertices), glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);

        if (closePolygon)
            glContext.drawArrays(glContext.LINE_LOOP, 0, vertices.length);
        else
            glContext.drawArrays(glContext.LINE_STRIP, 0, vertices.length);
        glContext.deleteBuffer(pointBuffer);

        cc.incrementGLDraws(1);
    },

    /**
     *  根据一个指向实心多边形CGPoint类型的顶点的指针、顶点的个数和颜色绘制该实心多边形,顶点的单位为point
     * @param {Array}     指向顶点数组的指针
     * @param {Number}    顶点的数量
     * @param {cc.Color}  颜色
     */
    drawSolidPoly:function (poli, numberOfPoints, color) {
        this.lazy_init();
        if (color)
            this.setDrawColor(color.r, color.g, color.b, color.a);

        var glContext = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        glContext.uniform4fv(this._colorLocation, this._colorArray);

        var pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, this._pointsToTypeArray(poli), glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);
        glContext.drawArrays(glContext.TRIANGLE_FAN, 0, poli.length);
        glContext.deleteBuffer(pointBuffer);

        cc.incrementGLDraws(1);
    },

    /**
     * 根据一个圆的圆心、半径和弦绘制该圆
     * @param {cc.Point} 圆心
     * @param {Number}   半径
     * @param {Number}   弧度
     * @param {Number}   曲线段数
     * @param {Boolean}  是否需要绘制弦
     */
    drawCircle:function (center, radius, angle, segments, drawLineToCenter) {
        this.lazy_init();

        var additionalSegment = 1;
        if (drawLineToCenter)
            additionalSegment++;

        var coef = 2.0 * Math.PI / segments;

        var vertices = new Float32Array((segments + 2) * 2);
        if (!vertices)
            return;

        for (var i = 0; i <= segments; i++) {
            var rads = i * coef;
            var j = radius * Math.cos(rads + angle) + center.x;
            var k = radius * Math.sin(rads + angle) + center.y;

            vertices[i * 2] = j;
            vertices[i * 2 + 1] = k;
        }
        vertices[(segments + 1) * 2] = center.x;
        vertices[(segments + 1) * 2 + 1] = center.y;

        var glContext = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        glContext.uniform4fv(this._colorLocation, this._colorArray);

        var pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);

        glContext.drawArrays(glContext.LINE_STRIP, 0, segments + additionalSegment);
        glContext.deleteBuffer(pointBuffer);

        cc.incrementGLDraws(1);
    },

    /**
     * 绘制四次方贝塞尔曲线
     * @param {cc.Point} 起点
     * @param {cc.Point} 控制点
     * @param {cc.Point} 终点
     * @param {Number}   曲线段数
     */
    drawQuadBezier:function (origin, control, destination, segments) {
        this.lazy_init();

        var vertices = new Float32Array((segments + 1) * 2);

        var t = 0.0;
        for (var i = 0; i < segments; i++) {
            vertices[i * 2] = Math.pow(1 - t, 2) * origin.x + 2.0 * (1 - t) * t * control.x + t * t * destination.x;
            vertices[i * 2 + 1] = Math.pow(1 - t, 2) * origin.y + 2.0 * (1 - t) * t * control.y + t * t * destination.y;
            t += 1.0 / segments;
        }
        vertices[segments * 2] = destination.x;
        vertices[segments * 2 + 1] = destination.y;

        var glContext = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        glContext.uniform4fv(this._colorLocation, this._colorArray);

        var pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);

        glContext.drawArrays(glContext.LINE_STRIP, 0, segments + 1);
        glContext.deleteBuffer(pointBuffer);

        cc.incrementGLDraws(1);
    },

    /**
     * 绘制三次方贝塞尔曲线
     * @param {cc.Point} 起点
     * @param {cc.Point} 控制点1
     * @param {cc.Point} 控制点2
     * @param {cc.Point} 终点
     * @param {Number}   曲线段数
     */
    drawCubicBezier:function (origin, control1, control2, destination, segments) {
        this.lazy_init();

        var vertices = new Float32Array((segments + 1) * 2);

        var t = 0;
        for (var i = 0; i < segments; i++) {
            vertices[i * 2] = Math.pow(1 - t, 3) * origin.x + 3.0 * Math.pow(1 - t, 2) * t * control1.x + 3.0 * (1 - t) * t * t * control2.x + t * t * t * destination.x;
            vertices[i * 2 + 1] = Math.pow(1 - t, 3) * origin.y + 3.0 * Math.pow(1 - t, 2) * t * control1.y + 3.0 * (1 - t) * t * t * control2.y + t * t * t * destination.y;
            t += 1.0 / segments;
        }
        vertices[segments * 2] = destination.x;
        vertices[segments * 2 + 1] = destination.y;

        var glContext = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        glContext.uniform4fv(this._colorLocation, this._colorArray);

        var pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);
        glContext.drawArrays(glContext.LINE_STRIP, 0, segments + 1);
        glContext.deleteBuffer(pointBuffer);

        cc.incrementGLDraws(1);
    },

    /**
     * 绘制一条差值曲线
     * @param {Array}  点的数组
     * @param {Number} 段的个数
     */
    drawCatmullRom:function (points, segments) {
        this.drawCardinalSpline(points, 0.5, segments);
    },

    /**
     * 绘制一个基数样条路径
     * @param {Array}  参数
     * @param {Number} 张力
     * @param {Number} 曲线段数
     */
    drawCardinalSpline:function (config, tension, segments) {
        this.lazy_init();

        var vertices = new Float32Array((segments + 1) * 2);
        var p, lt, deltaT = 1.0 / config.length;
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

            var newPos = cc.CardinalSplineAt(
                cc.getControlPointAt(config, p - 1),
                cc.getControlPointAt(config, p),
                cc.getControlPointAt(config, p + 1),
                cc.getControlPointAt(config, p + 2),
                tension, lt);
            // Interpolate

            vertices[i * 2] = newPos.x;
            vertices[i * 2 + 1] = newPos.y;
        }

        var glContext = this._renderContext;
        this._shader.use();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POSITION);
        glContext.uniform4fv(this._colorLocation, this._colorArray);

        var pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);
        glContext.drawArrays(glContext.LINE_STRIP, 0, segments + 1);
        glContext.deleteBuffer(pointBuffer);

        cc.incrementGLDraws(1);
    },

    /**
     * 根据四个无符号的比特数绘制颜色
     * @param {Number} r 红色值（0到255）
     * @param {Number} g 绿色值（0到255）
     * @param {Number} b 蓝色值（0到255）
     * @param {Number} a 透明度值（0到255）
     */
    setDrawColor:function (r, g, b, a) {
        this._colorArray[0] = r / 255.0;
        this._colorArray[1] = g / 255.0;
        this._colorArray[2] = b / 255.0;
        this._colorArray[3] = a / 255.0;
    },

    /**
     * 设定点的大小.默认值为1.
     * @param {Number} pointSize  点的大小
     */
    setPointSize:function (pointSize) {
        this._pointSize = pointSize * cc.contentScaleFactor();
    },

    /**
     * 设定线的宽度.默认值为1.
     * @param {Number} width  线的宽度
     */
    setLineWidth:function (width) {
        if(this._renderContext.lineWidth)
            this._renderContext.lineWidth(width);
    }
});

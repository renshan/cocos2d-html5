/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2008-2009 Jason Booth

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
 * cc.MotionStreak基于拖尾特效的绝对空间控制拖尾，<br/>
 * 通过设置拖尾消失的时间，最小分割尺寸，纹理路径，纹理长度和颜色来构建这种特效，<br/>
 * 消失时间控制特效条纹从顶点淡出的时间，最小分割尺寸控制下一特效开始之前本次特效条纹所包含的像素点数，<br/>
 * 纹理长度控制条纹伸展的像素点数，纹理沿着条纹段垂直对齐。
 * @class
 * @extends cc.Node
 *
 * @property {cc.Texture2D} texture                         - 用于拖尾效果的纹理
 * @property {Boolean}      fastMode                        - 声明是否使用快速模式
 * @property {Boolean}      startingPositionInitialized     - 声明是否重置开始位置
 * @example
 * //示例
 * new cc.MotionStreak(2, 3, 32, cc.color.GREEN, s_streak);
 */
cc.MotionStreak = cc.Node.extend(/** @lends cc.MotionStreak# */{
    texture:null,
    fastMode:false,
    startingPositionInitialized:false,

    _blendFunc:null,

    _stroke:0,
    _fadeDelta:0,
    _minSeg:0,

    _maxPoints:0,
    _nuPoints:0,
    _previousNuPoints:0,

    /* Pointers */
    _pointVertexes:null,
    _pointState:null,

    // webgl
    _vertices:null,
    _colorPointer:null,
    _texCoords:null,

    _verticesBuffer:null,
    _colorPointerBuffer:null,
    _texCoordsBuffer:null,
    _className:"MotionStreak",

    /**
     * 设置参数：消失的时间(s)、最小分割尺寸、笔画宽度、颜色、纹理文件名或纹理来构建和初始化拖尾特效。<br/>
     * cc.MotionStreak 构造函数
     * @param {Number} fade                     - 消失时间
     * @param {Number} minSeg                   - 最小分割尺寸
     * @param {Number} stroke                   - 笔画宽度
     * @param {Number} color                    - 颜色
     * @param {string|cc.Texture2D} texture     - 纹理文件名或纹理
     */
    ctor: function (fade, minSeg, stroke, color, texture) {
        cc.Node.prototype.ctor.call(this);
        this._positionR = cc.p(0, 0);
        this._blendFunc = new cc.BlendFunc(cc.SRC_ALPHA, cc.ONE_MINUS_SRC_ALPHA);
        this._vertexWebGLBuffer = cc._renderContext.createBuffer();

        this.fastMode = false;
        this.startingPositionInitialized = false;

        this.texture = null;

        this._stroke = 0;
        this._fadeDelta = 0;
        this._minSeg = 0;

        this._maxPoints = 0;
        this._nuPoints = 0;
        this._previousNuPoints = 0;

        /** Pointers */
        this._pointVertexes = null;
        this._pointState = null;

        // webgl
        this._vertices = null;
        this._colorPointer = null;
        this._texCoords = null;

        this._verticesBuffer = null;
        this._colorPointerBuffer = null;
        this._texCoordsBuffer = null;

        if(texture !== undefined)
            this.initWithFade(fade, minSeg, stroke, color, texture);
    },

    _initRendererCmd:function(){
        this._rendererCmd = new cc.MotionStreakCmdWebGL(this);
    },

    /**
     * 获取纹理。
     * @return {cc.Texture2D}
     */
    getTexture:function () {
        return this.texture;
    },

    /**
     * 设置纹理。
     * @param {cc.Texture2D} texture
     */
    setTexture:function (texture) {
        if (this.texture != texture)
            this.texture = texture;
    },

    /**
     * 获取混合函数。
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return this._blendFunc;
    },

    /**
     * 设置混合函数。
     * @param {Number} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        if (dst === undefined) {
            this._blendFunc = src;
        } else {
            this._blendFunc.src = src;
            this._blendFunc.dst = dst;
        }
    },

    /**
     * 获取透明度。
     * @warning 尚不支持 cc.MotionStreak.getOpacity
     * @returns {number}
     */
    getOpacity:function () {
        cc.log("cc.MotionStreak.getOpacity has not been supported.");
        return 0;
    },

    /**
     * 设置透明度。
     * @warning 尚不支持 cc.MotionStreak.setOpacity
     * @param opacity
     */
    setOpacity:function (opacity) {
        cc.log("cc.MotionStreak.setOpacity has not been supported.");
    },

    /**
     * 设置透明度修改RGB。
     * @warning 尚不支持 cc.MotionStreak.setOpacityModifyRGB
     * @param value
     */
    setOpacityModifyRGB:function (value) {
    },

    /**
     * 检查透明度修改RGB。
     * @returns {boolean}
     */
    isOpacityModifyRGB:function () {
        return false;
    },

    /**
     * <p>
     * 每当节点离开画布时触发的回调函数。<br/>
     * 如果节点经转换离开画布，此回调函数在转换完成后调用。<br/>
     * onExit期间你不能访问兄弟节点。<br/>
     * 如果重写onExit，应通过this._super()调用父类的onExit。
     * </p>
     * @function
     */
    onExit:function(){
        cc.Node.prototype.onExit.call(this);
        if(this._verticesBuffer)
            cc._renderContext.deleteBuffer(this._verticesBuffer);
        if(this._texCoordsBuffer)
            cc._renderContext.deleteBuffer(this._texCoordsBuffer);
        if(this._colorPointerBuffer)
            cc._renderContext.deleteBuffer(this._colorPointerBuffer);
    },

    /**
     * 检查快速模式
     * @returns {boolean}
     */
    isFastMode:function () {
        return this.fastMode;
    },

    /**
     * 设置快速模式
     * @param {Boolean} fastMode
     */
    setFastMode:function (fastMode) {
        this.fastMode = fastMode;
    },

    /**
     * 检查开始位置初始化
     * @returns {boolean}
     */
    isStartingPositionInitialized:function () {
        return this.startingPositionInitialized;
    },

    /**
     * 设置开始位置初始化
     * @param {Boolean} startingPositionInitialized
     */
    setStartingPositionInitialized:function (startingPositionInitialized) {
        this.startingPositionInitialized = startingPositionInitialized;
    },

    /**
     * 设置参数：消失的时间(s)、最小分割尺寸、笔画宽度、颜色、纹理文件名或纹理来初始化拖尾特效
     * @param {Number} fade                     - 消失时间
     * @param {Number} minSeg                   - 最小分割尺寸
     * @param {Number} stroke                   - 笔画宽度
     * @param {Number} color                    - 颜色
     * @param {string|cc.Texture2D} texture     - 纹理文件名或纹理
     * @return {Boolean}
     */
    initWithFade:function (fade, minSeg, stroke, color, texture) {
        if(!texture)
            throw "cc.MotionStreak.initWithFade(): Invalid filename or texture";

        if (cc.isString(texture))
            texture = cc.textureCache.addImage(texture);

        cc.Node.prototype.setPosition.call(this, cc.p(0,0));
        this.anchorX = 0;
        this.anchorY = 0;
        this.ignoreAnchor = true;
        this.startingPositionInitialized = false;

        this.fastMode = true;
        this._minSeg = (minSeg == -1.0) ? (stroke / 5.0) : minSeg;
        this._minSeg *= this._minSeg;

        this._stroke = stroke;
        this._fadeDelta = 1.0 / fade;

        var locMaxPoints = (0 | (fade * 60)) + 2;
        this._nuPoints = 0;
        this._pointState = new Float32Array(locMaxPoints);
        this._pointVertexes = new Float32Array(locMaxPoints * 2);

        this._vertices = new Float32Array(locMaxPoints * 4);
        this._texCoords = new Float32Array(locMaxPoints * 4);
        this._colorPointer = new Uint8Array(locMaxPoints * 8);
        this._maxPoints = locMaxPoints;

        var gl = cc._renderContext;

        this._verticesBuffer = gl.createBuffer();
        this._texCoordsBuffer = gl.createBuffer();
        this._colorPointerBuffer = gl.createBuffer();

        // 设置混合模式
        this._blendFunc.src = gl.SRC_ALPHA;
        this._blendFunc.dst = gl.ONE_MINUS_SRC_ALPHA;

        // 着色器程序
        this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);

        this.texture = texture;
        this.color = color;
        this.scheduleUpdate();

        // 绑定缓冲区
        gl.bindBuffer(gl.ARRAY_BUFFER, this._verticesBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._vertices, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._texCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._texCoords, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this._colorPointerBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this._colorPointer, gl.DYNAMIC_DRAW);

        return true;
    },

    /**
     * 用于染色的颜色
     * @param {cc.Color} color
     */
    tintWithColor:function (color) {
        this.color = color;

        // 快速赋值
        var locColorPointer = this._colorPointer;
        for (var i = 0, len = this._nuPoints * 2; i < len; i++) {
            locColorPointer[i * 4] = color.r;
            locColorPointer[i * 4 + 1] = color.g;
            locColorPointer[i * 4 + 2] = color.b;
        }
    },

    /**
     * 删除拖尾当前所有片段
     */
    reset:function () {
        this._nuPoints = 0;
    },

    /**
     * 设置位置
     *
     * @param {cc.Point|Number} position
     * @param {Number} [yValue=undefined] 若不存在该参数，则第一个参数类型应为cc.Point。
     */
    setPosition:function (position, yValue) {
        this.startingPositionInitialized = true;
        if(yValue === undefined){
            this._positionR.x = position.x;
            this._positionR.y = position.y;
        } else {
            this._positionR.x = position;
            this._positionR.y = yValue;
        }
    },

    /**
     * 获取位置横坐标
     * @return {Number}
     */
    getPositionX:function () {
        return this._positionR.x;
    },

    /**
     * 设置位置横坐标
     * @param {Number} x
     */
    setPositionX:function (x) {
        this._positionR.x = x;
        if(!this.startingPositionInitialized)
            this.startingPositionInitialized = true;
    },

    /**
     * 获取位置纵坐标
     * @return {Number}
     */
    getPositionY:function () {
        return  this._positionR.y;
    },

    /**
     * 设置位置纵坐标
     * @param {Number} y
     */
    setPositionY:function (y) {
        this._positionR.y = y;
        if(!this.startingPositionInitialized)
            this.startingPositionInitialized = true;
    },

    /**
     * 使用canvas 2d context或WebGL context的渲染函数，仅限内部使用，请勿调用该函数。
     * @function
     * @param {CanvasRenderingContext2D | WebGLRenderingContext} ctx  - 渲染上下文
     */
    draw:function (ctx) {
        if (this._nuPoints <= 1)
            return;

        if(this.texture && this.texture.isLoaded()){
            ctx = ctx || cc._renderContext;
            cc.nodeDrawSetup(this);
            cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);
            cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);

            cc.glBindTexture2D(this.texture);

            //位置
            ctx.bindBuffer(ctx.ARRAY_BUFFER, this._verticesBuffer);
            ctx.bufferData(ctx.ARRAY_BUFFER, this._vertices, ctx.DYNAMIC_DRAW);
            ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, ctx.FLOAT, false, 0, 0);

            //纹理坐标
            ctx.bindBuffer(ctx.ARRAY_BUFFER, this._texCoordsBuffer);
            ctx.bufferData(ctx.ARRAY_BUFFER, this._texCoords, ctx.DYNAMIC_DRAW);
            ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, ctx.FLOAT, false, 0, 0);

            //颜色
            ctx.bindBuffer(ctx.ARRAY_BUFFER, this._colorPointerBuffer);
            ctx.bufferData(ctx.ARRAY_BUFFER, this._colorPointer, ctx.DYNAMIC_DRAW);
            ctx.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, ctx.UNSIGNED_BYTE, true, 0, 0);

            ctx.drawArrays(ctx.TRIANGLE_STRIP, 0, this._nuPoints * 2);
            cc.g_NumberOfDraws ++;
        }
    },

    /**
     * <p>更新方法调度。<br/>
     * 使用序号，每一帧都会调用此方法。<br/>
     * 序号较小的被调度方法会在序号较大的之前被调用。<br/>
     * 每个节点仅可安排一个更新方法。</p>
     * @param {Number} delta
     */
    update:function (delta) {
        if (!this.startingPositionInitialized)
            return;

        delta *= this._fadeDelta;

        var newIdx, newIdx2, i, i2;
        var mov = 0;

        // 更新当前点
        var locNuPoints = this._nuPoints;
        var locPointState = this._pointState, locPointVertexes = this._pointVertexes, locVertices = this._vertices;
        var locColorPointer = this._colorPointer;

        for (i = 0; i < locNuPoints; i++) {
            locPointState[i] -= delta;

            if (locPointState[i] <= 0)
                mov++;
            else {
                newIdx = i - mov;
                if (mov > 0) {
                    // 更改数据
                    locPointState[newIdx] = locPointState[i];
                    // 更改点
                    locPointVertexes[newIdx * 2] = locPointVertexes[i * 2];
                    locPointVertexes[newIdx * 2 + 1] = locPointVertexes[i * 2 + 1];

                    // 更改顶点
                    i2 = i * 2;
                    newIdx2 = newIdx * 2;
                    locVertices[newIdx2 * 2] = locVertices[i2 * 2];
                    locVertices[newIdx2 * 2 + 1] = locVertices[i2 * 2 + 1];
                    locVertices[(newIdx2 + 1) * 2] = locVertices[(i2 + 1) * 2];
                    locVertices[(newIdx2 + 1) * 2 + 1] = locVertices[(i2 + 1) * 2 + 1];

                    // 移动颜色
                    newIdx2 *= 4;
                    locColorPointer[newIdx2 + 0] = locColorPointer[i2 + 0];
                    locColorPointer[newIdx2 + 1] = locColorPointer[i2 + 1];
                    locColorPointer[newIdx2 + 2] = locColorPointer[i2 + 2];
                    locColorPointer[newIdx2 + 4] = locColorPointer[i2 + 4];
                    locColorPointer[newIdx2 + 5] = locColorPointer[i2 + 5];
                    locColorPointer[newIdx2 + 6] = locColorPointer[i2 + 6];
                } else
                    newIdx2 = newIdx * 8;

                var op = locPointState[newIdx] * 255.0;
                locColorPointer[newIdx2 + 3] = op;
                locColorPointer[newIdx2 + 7] = op;
            }
        }
        locNuPoints -= mov;

        // 追加新的点
        var appendNewPoint = true;
        if (locNuPoints >= this._maxPoints)
            appendNewPoint = false;
        else if (locNuPoints > 0) {
            var a1 = cc.pDistanceSQ(cc.p(locPointVertexes[(locNuPoints - 1) * 2], locPointVertexes[(locNuPoints - 1) * 2 + 1]),
                this._positionR) < this._minSeg;
            var a2 = (locNuPoints == 1) ? false : (cc.pDistanceSQ(
                cc.p(locPointVertexes[(locNuPoints - 2) * 2], locPointVertexes[(locNuPoints - 2) * 2 + 1]), this._positionR) < (this._minSeg * 2.0));
            if (a1 || a2)
                appendNewPoint = false;
        }

        if (appendNewPoint) {
            locPointVertexes[locNuPoints * 2] = this._positionR.x;
            locPointVertexes[locNuPoints * 2 + 1] = this._positionR.y;
            locPointState[locNuPoints] = 1.0;

            // 颜色赋值
            var offset = locNuPoints * 8;

            var locDisplayedColor = this._displayedColor;
            locColorPointer[offset] = locDisplayedColor.r;
            locColorPointer[offset + 1] = locDisplayedColor.g;
            locColorPointer[offset + 2] = locDisplayedColor.b;
            //*((ccColor3B*)(m_pColorPointer + offset+4)) = this._color;
            locColorPointer[offset + 4] = locDisplayedColor.r;
            locColorPointer[offset + 5] = locDisplayedColor.g;
            locColorPointer[offset + 6] = locDisplayedColor.b;

            // 透明度
            locColorPointer[offset + 3] = 255;
            locColorPointer[offset + 7] = 255;

            // 生成多边形
            if (locNuPoints > 0 && this.fastMode) {
                if (locNuPoints > 1)
                    cc.vertexLineToPolygon(locPointVertexes, this._stroke, this._vertices, locNuPoints, 1);
                else
                    cc.vertexLineToPolygon(locPointVertexes, this._stroke, this._vertices, 0, 2);
            }
            locNuPoints++;
        }

        if (!this.fastMode)
            cc.vertexLineToPolygon(locPointVertexes, this._stroke, this._vertices, 0, locNuPoints);

        // 仅当与前一步不同时更新纹理坐标
        if (locNuPoints && this._previousNuPoints != locNuPoints) {
            var texDelta = 1.0 / locNuPoints;
            var locTexCoords = this._texCoords;
            for (i = 0; i < locNuPoints; i++) {
                locTexCoords[i * 4] = 0;
                locTexCoords[i * 4 + 1] = texDelta * i;

                locTexCoords[(i * 2 + 1) * 2] = 1;
                locTexCoords[(i * 2 + 1) * 2 + 1] = texDelta * i;
            }

            this._previousNuPoints = locNuPoints;
        }

        this._nuPoints = locNuPoints;
    }
});

/**
 * 请使用new cc.MotionStreak替代原来的函数调用。<br />
 * 设置参数：消失的时间(s)、最小分割尺寸、笔画宽度、颜色、纹理文件名或纹理来构建和初始化拖尾特效。
 * @deprecated since v3.0 please use new cc.MotionStreak instead.
 * @param {Number} fade time to fade
 * @param {Number} minSeg minimum segment size
 * @param {Number} stroke stroke's width
 * @param {Number} color
 * @param {string|cc.Texture2D} texture texture filename or texture
 * @return {cc.MotionStreak}
 * @example
 * //example
 * new cc.MotionStreak(2, 3, 32, cc.color.GREEN, s_streak);
 */
cc.MotionStreak.create = function (fade, minSeg, stroke, color, texture) {
    return new cc.MotionStreak(fade, minSeg, stroke, color, texture);
};

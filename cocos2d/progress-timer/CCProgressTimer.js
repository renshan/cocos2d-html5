/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2010      Lam Pham

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
 * cc.Progresstimer是cc.Node的子类。   <br/>
 * 它根据百分比来渲染内部的精灵对象。<br/>
 * 进度条可以是圆形、水平或者竖直的
 * @class
 * @extends cc.Node
 *
 * @property {cc.Point}     midPoint        <p>- 中点（Midpoint）用于改变进度条的起始位置。<br/>
 *                                          如果进度条是径向变化，中点代表其中心点；<br/>
 *                                          如果是条形的进度条，中点代表进度条展开的方向<br/>
 *                                              进度条从中心位置向两边展开，因此：<br/>
 *                                              从左往右时始终设置中点为cc.p(0,y)<br/>
 *                                              从右往左时始终设置中点为cc.p(1,y)<br/>
 *                                              从下往上时始终设置中点为cc.p(x,0)<br/>
 *                                              从上往下时始终设置中点为cc.p(x,1)</p>
 * @property {cc.Point}     barChangeRate   - 条形进度条的非变化方向的显示比例。
 * @property {enum}         type            - 进度条的类型：圆形|条形 : cc.ProgressTimer.TYPE_RADIAL|cc.ProgressTimer.TYPE_BAR。
 * @property {Number}       percentage      - 进度条显示的百分比，从0到100。
 * @property {cc.Sprite}    sprite          - 显示进度条百分比的精灵。
 * @property {Boolean}      reverseDir      - 表明方向是否是反转的。
 *
 */
cc.ProgressTimer = cc.Node.extend(/** @lends cc.ProgressTimer# */{
    _type:null,
    _percentage:0.0,
    _sprite:null,

    _midPoint:null,
    _barChangeRate:null,
    _reverseDirection:false,
    _className:"ProgressTimer",
 
    /**
     *    中点（Midpoint）用于改变进度条的起始位置
     *    如果进度条是径向变化，中点代表其中心点
     *    如果是条形的进度条，中点代表进度条展开的方向
     *        进度条从中心位置向两边展开，因此：
     *        从左往右时始终设置中点为cc.p(0,y)
     *        从右往左时始终设置中点为cc.p(1,y)
     *        从下往上时始终设置中点为cc.p(x,0)
     *        从上往下时始终设置中点为cc.p(x,1)
     *  @return {cc.Point}
     */
    getMidpoint:function () {
        return cc.p(this._midPoint.x, this._midPoint.y);
    },

    /**
     * 设置中点属性
     * @param {cc.Point} mpoint
     */
    setMidpoint:function (mpoint) {
        this._midPoint = cc.pClamp(mpoint, cc.p(0, 0), cc.p(1, 1));
    },

    /**
     *    通过本方法设置条形模式的进度条显示特定的比例
     *    设为0可以使其始终显示100%.
     *    例如，如果你需要一个进度条从左往右的方向始终显示100%，上下方向可变
     *    设置rate为cc.p(0,1); 并且设置midpoint为cc.p(0,.5f)。
     *  @return {cc.Point}
     */
    getBarChangeRate:function () {
        return cc.p(this._barChangeRate.x, this._barChangeRate.y);
    },

    /**
     * @param {cc.Point} barChangeRate
     */
    setBarChangeRate:function (barChangeRate) {
        this._barChangeRate = cc.pClamp(barChangeRate, cc.p(0, 0), cc.p(1, 1));
    },

    /**
     * 获取进度条的类型
     * @return {cc.ProgressTimer.TYPE_RADIAL|cc.ProgressTimer.TYPE_BAR}
     */
    getType:function () {
        return this._type;
    },

    /**
     * 百分比为0到100
     * @return {Number}
     */
    getPercentage:function () {
        return this._percentage;
    },

    /**
     * 显示该进度条的精灵对象, retain
     * @return {cc.Sprite}
     */
    getSprite:function () {
        return this._sprite;
    },

    /**
     * 从0到100
     * @param {Number} percentage
     */
    setPercentage:function (percentage) {
        if (this._percentage != percentage) {
            this._percentage = cc.clampf(percentage, 0, 100);
            this._updateProgress();
        }
    },
    /**
     * 仅用于 jsbinding
     * @param bValue
     */
    setOpacityModifyRGB:function (bValue) {
    },
    /**
     * 仅用于 jsbinding
     * @param bValue
     */
    isOpacityModifyRGB:function () {
        return false;
    },
    /**
     * 返回是否反向
     * @returns {boolean}
     */
    isReverseDirection:function () {
        return this._reverseDirection;
    },

    _boundaryTexCoord:function (index) {
        if (index < cc.ProgressTimer.TEXTURE_COORDS_COUNT) {
            var locProTextCoords = cc.ProgressTimer.TEXTURE_COORDS;
            if (this._reverseDirection)
                return cc.p((locProTextCoords >> (7 - (index << 1))) & 1, (locProTextCoords >> (7 - ((index << 1) + 1))) & 1);
            else
                return cc.p((locProTextCoords >> ((index << 1) + 1)) & 1, (locProTextCoords >> (index << 1)) & 1);
        }
        return cc.p(0,0);
    },

    _vertexDataCount:0,
    _vertexData:null,
    _vertexArrayBuffer:null,
    _vertexWebGLBuffer:null,
    _vertexDataDirty:false,

    /**
     * cc.cc.ProgressTimer的构造函数
     * @function
     * @param {cc.Sprite} sprite
     */
    ctor: null,

    _ctorForCanvas: function (sprite) {
        cc.Node.prototype.ctor.call(this);

        this._type = cc.ProgressTimer.TYPE_RADIAL;
        this._percentage = 0.0;
        this._midPoint = cc.p(0, 0);
        this._barChangeRate = cc.p(0, 0);
        this._reverseDirection = false;

        this._sprite = null;
        this._rendererCmd = new cc.ProgressRenderCmdCanvas(this);
        sprite && this._initWithSpriteForCanvas(sprite);
    },

    _ctorForWebGL: function (sprite) {
        cc.Node.prototype.ctor.call(this);
        this._type = cc.ProgressTimer.TYPE_RADIAL;
        this._percentage = 0.0;
        this._midPoint = cc.p(0, 0);
        this._barChangeRate = cc.p(0, 0);
        this._reverseDirection = false;

        this._sprite = null;

        this._vertexWebGLBuffer = cc._renderContext.createBuffer();
        this._vertexDataCount = 0;
        this._vertexData = null;
        this._vertexArrayBuffer = null;
        this._vertexDataDirty = false;
        this._rendererCmd = new cc.ProgressRenderCmdWebGL(this);

        sprite && this._initWithSpriteForWebGL(sprite);
    },

    /**
     * 设置精灵的颜色
     * @param {cc.Color} color
     */
    setColor:function (color) {
        this._sprite.color = color;
        this._updateColor();
    },

    /**
     *  设置精灵的透明度
     * @param {Number} opacity
     */
    setOpacity:function (opacity) {
        this._sprite.opacity = opacity;
        this._updateColor();
    },

    /**
     * 返回精灵的颜色
     * @return {cc.Color}
     */
    getColor:function () {
        return this._sprite.color;
    },

    /**
     * 返回精灵的透明度
     * @return {Number}
     */
    getOpacity:function () {
        return this._sprite.opacity;
    },

    /**
     * 设置 cc.ProgressTimer 反向
     * @function
     * @param {Boolean} reverse
     */
    setReverseProgress:null,

    _setReverseProgressForCanvas:function (reverse) {
        if (this._reverseDirection !== reverse)
            this._reverseDirection = reverse;
    },

    _setReverseProgressForWebGL:function (reverse) {
        if (this._reverseDirection !== reverse) {
            this._reverseDirection = reverse;

            //    release all previous information
            this._vertexData = null;
            this._vertexArrayBuffer = null;
            this._vertexDataCount = 0;
        }
    },

    /**
     * 为 cc.ProgressTimer 指定精灵
     * @function
     * @param {cc.Sprite} sprite
     */
    setSprite:null,

    _setSpriteForCanvas:function (sprite) {
        if (this._sprite != sprite) {
            this._sprite = sprite;
            this._rendererCmd._sprite = sprite;
            this.width = this._sprite.width;
	        this.height = this._sprite.height;
        }
    },

    _setSpriteForWebGL:function (sprite) {
        if (sprite && this._sprite != sprite) {
            this._sprite = sprite;
            this.width = sprite.width;
	        this.height = sprite.height;

            // 每次我们设置新的精灵时, 释放当前顶点数据
            if (this._vertexData) {
                this._vertexData = null;
                this._vertexArrayBuffer = null;
                this._vertexDataCount = 0;
            }
        }
    },

    /**
     * 设置cc.ProgressTimer的类型
     * @function
     * @param {cc.ProgressTimer.TYPE_RADIAL|cc.ProgressTimer.TYPE_BAR} type
     */
    setType:null,

    _setTypeForCanvas:function (type) {
        if (type !== this._type){
            this._type = type;
            this._rendererCmd._type = type;
        }
    },

    _setTypeForWebGL:function (type) {
        if (type !== this._type) {
            //	释放之前的数据
            if (this._vertexData) {
                this._vertexData = null;
                this._vertexArrayBuffer = null;
                this._vertexDataCount = 0;
            }
            this._type = type;
        }
    },

    /**
     * 设置进度条反向
     * @function
     * @param {Boolean} reverse
     */
    setReverseDirection: null,

    _setReverseDirectionForCanvas: function (reverse) {
        if (this._reverseDirection !== reverse)
            this._reverseDirection = reverse;
    },

    _setReverseDirectionForWebGL: function (reverse) {
        if (this._reverseDirection !== reverse) {
            this._reverseDirection = reverse;
            //释放之前的数据
            this._vertexData = null;
            this._vertexArrayBuffer = null;
            this._vertexDataCount = 0;
        }
    },

    /**
     * @param {cc.Point} alpha
     * @return {cc.Vertex2F | Object} 纹理坐标系中的顶点位置
     * @private
     */
    _textureCoordFromAlphaPoint:function (alpha) {
        var locSprite = this._sprite;
        if (!locSprite) {
            return {u:0, v:0}; //new cc.Tex2F(0, 0);
        }
        var quad = locSprite.quad;
        var min = cc.p(quad.bl.texCoords.u, quad.bl.texCoords.v);
        var max = cc.p(quad.tr.texCoords.u, quad.tr.texCoords.v);

        //  Fix bug #1303 progress timer 可以处理精灵帧纹理的旋转了
        if (locSprite.textureRectRotated) {
            var temp = alpha.x;
            alpha.x = alpha.y;
            alpha.y = temp;
        }
        return {u: min.x * (1 - alpha.x) + max.x * alpha.x, v: min.y * (1 - alpha.y) + max.y * alpha.y};
    },

    _vertexFromAlphaPoint:function (alpha) {
        if (!this._sprite) {
            return {x: 0, y: 0};
        }
        var quad = this._sprite.quad;
        var min = cc.p(quad.bl.vertices.x, quad.bl.vertices.y);
        var max = cc.p(quad.tr.vertices.x, quad.tr.vertices.y);
        return {x: min.x * (1 - alpha.x) + max.x * alpha.x, y: min.y * (1 - alpha.y) + max.y * alpha.y};
    },

    /**
     * 以精灵对象作为进度条图形初始化进度条
     * @function
     * @param {cc.Sprite} sprite
     * @return {Boolean}
     */
    initWithSprite:null,

    _initWithSpriteForCanvas:function (sprite) {
        this.percentage = 0;
        this.anchorX = 0.5;
	    this.anchorY = 0.5;

        this._type = cc.ProgressTimer.TYPE_RADIAL;
        this._reverseDirection = false;
	    this.midPoint = cc.p(0.5, 0.5);
	    this.barChangeRate = cc.p(1, 1);
	    this.sprite = sprite;

        return true;
    },

    _initWithSpriteForWebGL:function (sprite) {
        this.percentage = 0;
        this._vertexData = null;
        this._vertexArrayBuffer = null;
        this._vertexDataCount = 0;
        this.anchorX = 0.5;
	    this.anchorY = 0.5;

        this._type = cc.ProgressTimer.TYPE_RADIAL;
        this._reverseDirection = false;
        this.midPoint = cc.p(0.5, 0.5);
        this.barChangeRate = cc.p(1, 1);
        this.sprite = sprite;

        //shader program
        this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
        return true;
    },

    /**
     * 显示内容在这里被绘制
     * @function
     * @param {CanvasRenderingContext2D} ctx
     */
    draw:null,

    _drawForWebGL:function (ctx) {
        var context = ctx || cc._renderContext;
        if (!this._vertexData || !this._sprite)
            return;

        cc.nodeDrawSetup(this);

        var blendFunc = this._sprite.getBlendFunc();
        cc.glBlendFunc(blendFunc.src, blendFunc.dst);
        cc.glEnableVertexAttribs(cc.VERTEX_ATTRIB_FLAG_POS_COLOR_TEX);

        cc.glBindTexture2D(this._sprite.texture);

        context.bindBuffer(context.ARRAY_BUFFER, this._vertexWebGLBuffer);
        if(this._vertexDataDirty){
            context.bufferData(context.ARRAY_BUFFER, this._vertexArrayBuffer, context.DYNAMIC_DRAW);
            this._vertexDataDirty = false;
        }
        var locVertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, context.FLOAT, false, locVertexDataLen, 0);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_COLOR, 4, context.UNSIGNED_BYTE, true, locVertexDataLen, 8);
        context.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, context.FLOAT, false, locVertexDataLen, 12);

        if (this._type === cc.ProgressTimer.TYPE_RADIAL)
            context.drawArrays(context.TRIANGLE_FAN, 0, this._vertexDataCount);
        else if (this._type == cc.ProgressTimer.TYPE_BAR) {
            if (!this._reverseDirection)
                context.drawArrays(context.TRIANGLE_STRIP, 0, this._vertexDataCount);
            else {
                context.drawArrays(context.TRIANGLE_STRIP, 0, this._vertexDataCount / 2);
                context.drawArrays(context.TRIANGLE_STRIP, 4, this._vertexDataCount / 2);
                // 2 draw calls
                cc.g_NumberOfDraws++;
            }
        }
        cc.g_NumberOfDraws++;
    },

    /**
     * <p>
     *    更新操作将纹理映射到进度条的三角形上。                          <br/>
     *    现在每次更新操作不在花费资源在free/alloc 数据上面 ，            <br/>
     *    并且如果没有包含其他的变化，则仅仅更新百分比 。                 <br/>
     *                                                                    <br/>
     *    现在可以处理反转的纹理，如果你要处理这个问题，                  <br/>
     *    使用精灵对象的FlipX和FlipY方法即可。                            <br/>
     * </p>
     * @private
     */
    _updateRadial:function () {
        if (!this._sprite)
            return;

        var i, locMidPoint = this._midPoint;
        var alpha = this._percentage / 100;
        var angle = 2 * (cc.PI) * ( this._reverseDirection ? alpha : 1.0 - alpha);

        //    We find the vector to do a hit detection based on the percentage
        //    We know the first vector is the one @ 12 o'clock (top,mid) so we rotate
        //    from that by the progress angle around the m_tMidpoint pivot
        var topMid = cc.p(locMidPoint.x, 1);
        var percentagePt = cc.pRotateByAngle(topMid, locMidPoint, angle);

        var index = 0;
        var hit;

        if (alpha == 0) {
            //    More efficient since we don't always need to check intersection
            //    If the alpha is zero then the hit point is top mid and the index is 0.
            hit = topMid;
            index = 0;
        } else if (alpha == 1) {
            //    More efficient since we don't always need to check intersection
            //    If the alpha is one then the hit point is top mid and the index is 4.
            hit = topMid;
            index = 4;
        } else {
            //    We run a for loop checking the edges of the texture to find the
            //    intersection point
            //    We loop through five points since the top is split in half

            var min_t = cc.FLT_MAX;
            var locProTextCoordsCount = cc.ProgressTimer.TEXTURE_COORDS_COUNT;
            for (i = 0; i <= locProTextCoordsCount; ++i) {
                var pIndex = (i + (locProTextCoordsCount - 1)) % locProTextCoordsCount;

                var edgePtA = this._boundaryTexCoord(i % locProTextCoordsCount);
                var edgePtB = this._boundaryTexCoord(pIndex);

                //    Remember that the top edge is split in half for the 12 o'clock position
                //    Let's deal with that here by finding the correct endpoints
                if (i == 0)
                    edgePtB = cc.pLerp(edgePtA, edgePtB, 1 - locMidPoint.x);
                else if (i == 4)
                    edgePtA = cc.pLerp(edgePtA, edgePtB, 1 - locMidPoint.x);

                // retPoint are returned by ccpLineIntersect
                var retPoint = cc.p(0, 0);
                if (cc.pLineIntersect(edgePtA, edgePtB, locMidPoint, percentagePt, retPoint)) {
                    //    Since our hit test is on rays we have to deal with the top edge
                    //    being in split in half so we have to test as a segment
                    if ((i == 0 || i == 4)) {
                        //    s represents the point between edgePtA--edgePtB
                        if (!(0 <= retPoint.x && retPoint.x <= 1))
                            continue;
                    }
                    //    As long as our t isn't negative we are at least finding a
                    //    correct hitpoint from m_tMidpoint to percentagePt.
                    if (retPoint.y >= 0) {
                        //    Because the percentage line and all the texture edges are
                        //    rays we should only account for the shortest intersection
                        if (retPoint.y < min_t) {
                            min_t = retPoint.y;
                            index = i;
                        }
                    }
                }
            }

            //    Now that we have the minimum magnitude we can use that to find our intersection
            hit = cc.pAdd(locMidPoint, cc.pMult(cc.pSub(percentagePt, locMidPoint), min_t));
        }

        //    The size of the vertex data is the index from the hitpoint
        //    the 3 is for the m_tMidpoint, 12 o'clock point and hitpoint position.
        var sameIndexCount = true;
        if (this._vertexDataCount != index + 3) {
            sameIndexCount = false;
            this._vertexData = null;
            this._vertexArrayBuffer = null;
            this._vertexDataCount = 0;
        }

        if (!this._vertexData) {
            this._vertexDataCount = index + 3;
            var locCount = this._vertexDataCount, vertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT;
            this._vertexArrayBuffer = new ArrayBuffer(locCount * vertexDataLen);
            var locData = [];
            for (i = 0; i < locCount; i++)
                locData[i] = new cc.V2F_C4B_T2F(null, null, null, this._vertexArrayBuffer, i * vertexDataLen);

            this._vertexData = locData;
            if(!this._vertexData){
                cc.log( "cc.ProgressTimer._updateRadial() : Not enough memory");
                return;
            }
        }
        this._updateColor();

        var locVertexData = this._vertexData;
        if (!sameIndexCount) {
            //    First we populate the array with the m_tMidpoint, then all
            //    vertices/texcoords/colors of the 12 'o clock start and edges and the hitpoint
            locVertexData[0].texCoords = this._textureCoordFromAlphaPoint(locMidPoint);
            locVertexData[0].vertices = this._vertexFromAlphaPoint(locMidPoint);

            locVertexData[1].texCoords = this._textureCoordFromAlphaPoint(topMid);
            locVertexData[1].vertices = this._vertexFromAlphaPoint(topMid);

            for (i = 0; i < index; i++) {
                var alphaPoint = this._boundaryTexCoord(i);
                locVertexData[i + 2].texCoords = this._textureCoordFromAlphaPoint(alphaPoint);
                locVertexData[i + 2].vertices = this._vertexFromAlphaPoint(alphaPoint);
            }
        }

        //    hitpoint will go last
        locVertexData[this._vertexDataCount - 1].texCoords = this._textureCoordFromAlphaPoint(hit);
        locVertexData[this._vertexDataCount - 1].vertices = this._vertexFromAlphaPoint(hit);
    },

    /**
     * <p>
     *    更新操作将纹理映射到进度条的三角形上。                          <br/>
     *    现在每次更新操作不在花费资源在free/alloc 数据上面 ，            <br/>
     *    并且如果没有包含其他的变化，则仅仅更新百分比 。                 <br/>
     *                                                                    <br/>
     *    现在可以处理反转的纹理，如果你要处理这个问题，                  <br/>
     *    使用精灵对象的FlipX和FlipY方法即可。                            <br/>
     * </p>
     * @private
     */
    _updateBar:function () {
        if (!this._sprite)
            return;

        var i;
        var alpha = this._percentage / 100.0;
        var locBarChangeRate = this._barChangeRate;
        var alphaOffset = cc.pMult(cc.p((1.0 - locBarChangeRate.x) + alpha * locBarChangeRate.x,
            (1.0 - locBarChangeRate.y) + alpha * locBarChangeRate.y), 0.5);
        var min = cc.pSub(this._midPoint, alphaOffset);
        var max = cc.pAdd(this._midPoint, alphaOffset);

        if (min.x < 0) {
            max.x += -min.x;
            min.x = 0;
        }

        if (max.x > 1) {
            min.x -= max.x - 1;
            max.x = 1;
        }

        if (min.y < 0) {
            max.y += -min.y;
            min.y = 0;
        }

        if (max.y > 1) {
            min.y -= max.y - 1;
            max.y = 1;
        }

        var locVertexData;
        if (!this._reverseDirection) {
            if (!this._vertexData) {
                this._vertexDataCount = 4;
                var vertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT, locCount = 4;
                this._vertexArrayBuffer = new ArrayBuffer(locCount * vertexDataLen);
                this._vertexData = [];
                for (i = 0; i < locCount; i++)
                    this._vertexData[i] = new cc.V2F_C4B_T2F(null, null, null, this._vertexArrayBuffer, i * vertexDataLen);
            }

            locVertexData = this._vertexData;
            //    TOPLEFT
            locVertexData[0].texCoords = this._textureCoordFromAlphaPoint(cc.p(min.x, max.y));
            locVertexData[0].vertices = this._vertexFromAlphaPoint(cc.p(min.x, max.y));

            //    BOTLEFT
            locVertexData[1].texCoords = this._textureCoordFromAlphaPoint(cc.p(min.x, min.y));
            locVertexData[1].vertices = this._vertexFromAlphaPoint(cc.p(min.x, min.y));

            //    TOPRIGHT
            locVertexData[2].texCoords = this._textureCoordFromAlphaPoint(cc.p(max.x, max.y));
            locVertexData[2].vertices = this._vertexFromAlphaPoint(cc.p(max.x, max.y));

            //    BOTRIGHT
            locVertexData[3].texCoords = this._textureCoordFromAlphaPoint(cc.p(max.x, min.y));
            locVertexData[3].vertices = this._vertexFromAlphaPoint(cc.p(max.x, min.y));
        } else {
            if (!this._vertexData) {
                this._vertexDataCount = 8;
                var rVertexDataLen = cc.V2F_C4B_T2F.BYTES_PER_ELEMENT, rLocCount = 8;
                this._vertexArrayBuffer = new ArrayBuffer(rLocCount * rVertexDataLen);
                var rTempData = [];
                for (i = 0; i < rLocCount; i++)
                    rTempData[i] = new cc.V2F_C4B_T2F(null, null, null, this._vertexArrayBuffer, i * rVertexDataLen);
                //    TOPLEFT 1
                rTempData[0].texCoords = this._textureCoordFromAlphaPoint(cc.p(0, 1));
                rTempData[0].vertices = this._vertexFromAlphaPoint(cc.p(0, 1));

                //    BOTLEFT 1
                rTempData[1].texCoords = this._textureCoordFromAlphaPoint(cc.p(0, 0));
                rTempData[1].vertices = this._vertexFromAlphaPoint(cc.p(0, 0));

                //    TOPRIGHT 2
                rTempData[6].texCoords = this._textureCoordFromAlphaPoint(cc.p(1, 1));
                rTempData[6].vertices = this._vertexFromAlphaPoint(cc.p(1, 1));

                //    BOTRIGHT 2
                rTempData[7].texCoords = this._textureCoordFromAlphaPoint(cc.p(1, 0));
                rTempData[7].vertices = this._vertexFromAlphaPoint(cc.p(1, 0));

                this._vertexData = rTempData;
            }

            locVertexData = this._vertexData;
            //    TOPRIGHT 1
            locVertexData[2].texCoords = this._textureCoordFromAlphaPoint(cc.p(min.x, max.y));
            locVertexData[2].vertices = this._vertexFromAlphaPoint(cc.p(min.x, max.y));

            //    BOTRIGHT 1
            locVertexData[3].texCoords = this._textureCoordFromAlphaPoint(cc.p(min.x, min.y));
            locVertexData[3].vertices = this._vertexFromAlphaPoint(cc.p(min.x, min.y));

            //    TOPLEFT 2
            locVertexData[4].texCoords = this._textureCoordFromAlphaPoint(cc.p(max.x, max.y));
            locVertexData[4].vertices = this._vertexFromAlphaPoint(cc.p(max.x, max.y));

            //    BOTLEFT 2
            locVertexData[5].texCoords = this._textureCoordFromAlphaPoint(cc.p(max.x, min.y));
            locVertexData[5].vertices = this._vertexFromAlphaPoint(cc.p(max.x, min.y));
        }
        this._updateColor();
    },

    _updateColor:function () {
        if (!this._sprite || !this._vertexData)
            return;

        var sc = this._sprite.quad.tl.colors;
        var locVertexData = this._vertexData;
        for (var i = 0, len = this._vertexDataCount; i < len; ++i)
            locVertexData[i].colors = sc;
        this._vertexDataDirty = true;
    },

    _updateProgress:null,

    _updateProgressForCanvas:function () {
        var locSprite = this._sprite;
        var sw = locSprite.width, sh = locSprite.height;
        var locMidPoint = this._midPoint;
        var locCmd = this._rendererCmd;

        if (this._type == cc.ProgressTimer.TYPE_RADIAL) {
            locCmd._radius = Math.round(Math.sqrt(sw * sw + sh * sh));
            var locStartAngle, locEndAngle, locCounterClockWise = false, locOrigin = locCmd._origin;
            locOrigin.x = sw * locMidPoint.x;
            locOrigin.y = -sh * locMidPoint.y;

            if (this._reverseDirection) {
                locEndAngle = 270;
                locStartAngle = 270 - 3.6 * this._percentage;
            } else {
                locStartAngle = -90;
                locEndAngle = -90 + 3.6 * this._percentage;
            }

            if (locSprite._flippedX) {
                locOrigin.x -= sw * (this._midPoint.x * 2);
                locStartAngle= -locStartAngle;
                locEndAngle= -locEndAngle;
                locStartAngle -= 180;
                locEndAngle -= 180;
                locCounterClockWise = !locCounterClockWise;
            }
            if (locSprite._flippedY) {
                locOrigin.y+=sh*(this._midPoint.y*2);
                locCounterClockWise = !locCounterClockWise;
                locStartAngle= -locStartAngle;
                locEndAngle= -locEndAngle;
            }

            locCmd._startAngle = locStartAngle;
            locCmd._endAngle = locEndAngle;
            locCmd._counterClockWise = locCounterClockWise;
        } else {
            var locBarChangeRate = this._barChangeRate;
            var percentageF = this._percentage / 100;
            var locBarRect = locCmd._barRect;

            var drawedSize = cc.size((sw * (1 - locBarChangeRate.x)), (sh * (1 - locBarChangeRate.y)));
            var drawingSize = cc.size((sw - drawedSize.width) * percentageF, (sh - drawedSize.height) * percentageF);
            var currentDrawSize = cc.size(drawedSize.width + drawingSize.width, drawedSize.height + drawingSize.height);

            var startPoint = cc.p(sw * locMidPoint.x, sh * locMidPoint.y);

            var needToLeft = startPoint.x - currentDrawSize.width / 2;
            if ((locMidPoint.x > 0.5) && (currentDrawSize.width / 2 >= sw - startPoint.x)) {
                needToLeft = sw - currentDrawSize.width;
            }

            var needToTop = startPoint.y - currentDrawSize.height / 2;
            if ((locMidPoint.y > 0.5) && (currentDrawSize.height / 2 >= sh - startPoint.y)) {
                needToTop = sh - currentDrawSize.height;
            }

            //left pos
            locBarRect.x = 0;
            var flipXNeed = 1;
            if (locSprite._flippedX) {
                locBarRect.x -= currentDrawSize.width;
                flipXNeed = -1;
            }

            if (needToLeft > 0)
                locBarRect.x += needToLeft * flipXNeed;

            //right pos
            locBarRect.y = 0;
            var flipYNeed = 1;
            if (locSprite._flippedY) {
                locBarRect.y += currentDrawSize.height;
                flipYNeed = -1;
            }

            if (needToTop > 0)
                locBarRect.y -= needToTop * flipYNeed;

            //clip width and clip height
            locBarRect.width = currentDrawSize.width;
            locBarRect.height = -currentDrawSize.height;
        }
    },

    _updateProgressForWebGL:function () {
        var locType = this._type;
        if(locType === cc.ProgressTimer.TYPE_RADIAL)
            this._updateRadial();
        else if(locType === cc.ProgressTimer.TYPE_BAR)
            this._updateBar();
        this._vertexDataDirty = true;
    }
});

var _p = cc.ProgressTimer.prototype;
if(cc._renderType == cc._RENDER_TYPE_WEBGL){
    _p.ctor = _p._ctorForWebGL;
    _p.setReverseProgress = _p._setReverseProgressForWebGL;
    _p.setSprite = _p._setSpriteForWebGL;
    _p.setType = _p._setTypeForWebGL;
    _p.setReverseDirection = _p._setReverseDirectionForWebGL;
    _p.initWithSprite = _p._initWithSpriteForWebGL;
    _p.draw = _p._drawForWebGL;
    _p._updateProgress = _p._updateProgressForWebGL;
} else {
    _p.ctor = _p._ctorForCanvas;
    _p.setReverseProgress = _p._setReverseProgressForCanvas;
    _p.setSprite = _p._setSpriteForCanvas;
    _p.setType = _p._setTypeForCanvas;
    _p.setReverseDirection = _p._setReverseDirectionForCanvas;
    _p.initWithSprite = _p._initWithSpriteForCanvas;
    _p.draw = _p._drawForCanvas;
    _p._updateProgress = cc.ProgressTimer.prototype._updateProgressForCanvas;
}

// Extended properties
/** @expose */
_p.midPoint;
cc.defineGetterSetter(_p, "midPoint", _p.getMidpoint, _p.setMidpoint);
/** @expose */
_p.barChangeRate;
cc.defineGetterSetter(_p, "barChangeRate", _p.getBarChangeRate, _p.setBarChangeRate);
/** @expose */
_p.type;
cc.defineGetterSetter(_p, "type", _p.getType, _p.setType);
/** @expose */
_p.percentage;
cc.defineGetterSetter(_p, "percentage", _p.getPercentage, _p.setPercentage);
/** @expose */
_p.sprite;
cc.defineGetterSetter(_p, "sprite", _p.getSprite, _p.setSprite);
/** @expose */
_p.reverseDir;
cc.defineGetterSetter(_p, "reverseDir", _p.isReverseDirection, _p.setReverseDirection);


/**
 * 通过根据百分比渲染内部精灵的图片文件创建一个进度条对象
 * @deprecated 自v3.0弃用，使用new cc.ProgressTimer(sprite) 代替.
 * @param {cc.Sprite} sprite
 * @return {cc.ProgressTimer}
 */
cc.ProgressTimer.create = function (sprite) {
    return new cc.ProgressTimer(sprite);
};

/**
 * @constant
 * @type Number
 */
cc.ProgressTimer.TEXTURE_COORDS_COUNT = 4;

/**
 * @constant
 * @type Number
 */
cc.ProgressTimer.TEXTURE_COORDS = 0x4b;

/**
 * 圆形，逆时针
 * @type Number
 * @constant
 */
cc.ProgressTimer.TYPE_RADIAL = 0;

/**
 * 条形
 * @type Number
 * @constant
 */
cc.ProgressTimer.TYPE_BAR = 1;

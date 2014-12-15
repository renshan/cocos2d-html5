/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2012 Pierre-David Bélanger

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
 * 模板位的值。
 * @type Number
 */
cc.stencilBits = -1;

/**
 * <p>
 *     cc.ClippingNode是cc.Node的一个子类。<br/>
 *     利用裁剪模板绘制可裁剪的内容（子节点）。<br/>
 *     裁剪模板是另一个cc.Node节点，且不会被绘制。<br/>
 *     利用模板的透明部分完成裁剪过程（由透明度阈值alphaThreshold调整）
 * </p>
 * @class
 * @extends cc.Node
 * @param {cc.Node} [stencil=null]
 *
 * @property {Number}   alphaThreshold  - alpha透明度阈值
 * @property {Boolean}  inverted        - 表明是否为反转模式
 */
//@property {cc.Node}  stencil         - 裁剪使用的cc.Node模板
cc.ClippingNode = cc.Node.extend(/** @lends cc.ClippingNode# */{
    alphaThreshold: 0,
    inverted: false,

    _rendererSaveCmd: null,
    _rendererClipCmd: null,
    _rendererRestoreCmd: null,

    _beforeVisitCmd: null,
    _afterDrawStencilCmd: null,
    _afterVisitCmd: null,

    _stencil: null,
    _godhelpme: false,
    _clipElemType: null,

    _currentStencilFunc: null,
    _currentStencilRef: null,
    _currentStencilValueMask: null,
    _currentStencilFail: null,
    _currentStencilPassDepthFail: null,
    _currentStencilPassDepthPass:null,
    _currentStencilWriteMask:null,
    _currentStencilEnabled:null,
    _currentDepthWriteMask: null,
    _mask_layer_le: null,


    /**
     * 构造函数。扩展构造行为重写该函数时，请在继承的"ctor"函数中调用"this._super()"。
     * @param {cc.Node} [stencil=null]
     */
    ctor: function (stencil) {
        cc.Node.prototype.ctor.call(this);
        this._stencil = null;
        this.alphaThreshold = 0;
        this.inverted = false;
        stencil = stencil || null;
        cc.ClippingNode.prototype.init.call(this, stencil);
    },

    _initRendererCmd: function(){
        if(cc._renderType === cc._RENDER_TYPE_CANVAS){
            this._rendererSaveCmd = new cc.ClippingNodeSaveRenderCmdCanvas(this);
            this._rendererClipCmd = new cc.ClippingNodeClipRenderCmdCanvas(this);
            this._rendererRestoreCmd = new cc.ClippingNodeRestoreRenderCmdCanvas(this);
        }else{
            this._beforeVisitCmd = new cc.CustomRenderCmdWebGL(this, this._onBeforeVisit);
            this._afterDrawStencilCmd  = new cc.CustomRenderCmdWebGL(this, this._onAfterDrawStencil);
            this._afterVisitCmd = new cc.CustomRenderCmdWebGL(this, this._onAfterVisit);
        }
    },

    /**
     * 初始化节点，请不要擅自调用该函数，初始化时应该传参数给构造函数。
     * @function
     * @param {cc.Node} [stencil=null]
     */
    init: null,

    _className: "ClippingNode",

    _initForWebGL: function (stencil) {
        this._stencil = stencil;

        this.alphaThreshold = 1;
        this.inverted = false;
        //获取裁剪模板缓冲区的位数（仅一次）
        cc.ClippingNode._init_once = true;
        if (cc.ClippingNode._init_once) {
            cc.stencilBits = cc._renderContext.getParameter(cc._renderContext.STENCIL_BITS);
            if (cc.stencilBits <= 0)
                cc.log("Stencil buffer is not enabled.");
            cc.ClippingNode._init_once = false;
        }
        return true;
    },

    _initForCanvas: function (stencil) {
        this._stencil = stencil;
        this.alphaThreshold = 1;
        this.inverted = false;
        return true;
    },

    /**
     * <p>
     *     每当节点进入舞台时触发的回调函数。<br/>
     *     如果此CCNode节点伴随转换（transition）进入舞台，这个事件会在转换开始时被调用。<br/>
     *     onEnter中不允许访问兄弟节点。<br/>
     *     如果你重写onEnter，应该用this.super()调用它的父类onEnter函数。
     * </p>
     * @function
     */
    onEnter: function () {
        cc.Node.prototype.onEnter.call(this);
        this._stencil.onEnter();
    },

    /**
     * <p>
     *     每当节点进入舞台时触发的回调函数。<br/>
     *     如果此CCNode节点伴随转换（transition）进入舞台，这个事件会在转换结束时被调用。<br/>
     *     如果你重写onEnterTransitionDidFinish，应该用this.super()调用它的父类onEnterTransitionDidFinish函数。
     * </p>
     * @function
     */
    onEnterTransitionDidFinish: function () {
        cc.Node.prototype.onEnterTransitionDidFinish.call(this);
        this._stencil.onEnterTransitionDidFinish();
    },

    /**
     * <p>
     *     每当节点离开舞台时触发的回调函数。<br/>                                                     
     *     如果此CCNode节点伴随转换（transition）离开舞台，这个事件会在转换开始时被调用。<br/>
     *     如果你重写onExitTransitionDidStart，应该用this.super()调用它的父类onExitTransitionDidStart函数。
     * </p>
     * @function
     */
    onExitTransitionDidStart: function () {
        this._stencil.onExitTransitionDidStart();
        cc.Node.prototype.onExitTransitionDidStart.call(this);
    },

    /**
     * <p>
     *     每当节点离开舞台时触发的回调函数。<br/>
     *     如果此CCNode节点伴随转换（transition）离开舞台，这个事件会在转换结束时被调用。<br/>
     *     onExit中不允许访问兄弟节点。<br/>
     *     如果你重写onExit，应该用this.super()调用它的父类onExit函数。
     * </p>
     * @function
     */
    onExit: function () {
        this._stencil.onExit();
        cc.Node.prototype.onExit.call(this);
    },

    /**
     * 遍历并绘制子节点的递归函数。
     * @function
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx
     */
    visit: null,

    _visitForWebGL: function (ctx) {
        var gl = ctx || cc._renderContext;

        // 如果模板缓冲区不可用
        if (cc.stencilBits < 1) {
            // 就如没有裁剪模板一样，完全绘制
            cc.Node.prototype.visit.call(this, ctx);
            return;
        }

        if (!this._stencil || !this._stencil.visible) {
            if (this.inverted)
                cc.Node.prototype.visit.call(this, ctx);   // 完全绘制
            return;
        }

        if (cc.ClippingNode._layer + 1 == cc.stencilBits) {
            cc.ClippingNode._visit_once = true;
            if (cc.ClippingNode._visit_once) {
                cc.log("Nesting more than " + cc.stencilBits + "stencils is not supported. Everything will be drawn without stencil for this node and its children.");
                cc.ClippingNode._visit_once = false;
            }
            // 就如没有裁剪模板一样，完全绘制
            cc.Node.prototype.visit.call(this, ctx);
            return;
        }

        cc.renderer.pushRenderCommand(this._beforeVisitCmd);

        // javascript性能优化
        var currentStack = cc.current_stack;
        currentStack.stack.push(currentStack.top);
        cc.kmMat4Assign(this._stackMatrix, currentStack.top);
        currentStack.top = this._stackMatrix;

        this.transform();
        //this._stencil._stackMatrix = this._stackMatrix;
        this._stencil.visit();

        cc.renderer.pushRenderCommand(this._afterDrawStencilCmd);

        // （根据模板测试函数）绘制节点及其子节点
        var locChildren = this._children;
        if (locChildren && locChildren.length > 0) {
            var childLen = locChildren.length;
            this.sortAllChildren();
            // 绘制 zOrder<0 的子节点
            for (var i = 0; i < childLen; i++) {
                if (locChildren[i] && locChildren[i]._localZOrder < 0)
                    locChildren[i].visit();
                else
                    break;
            }
            if(this._rendererCmd)
                cc.renderer.pushRenderCommand(this._rendererCmd);
            // 绘制 zOrder>=0 的子节点
            for (; i < childLen; i++) {
                if (locChildren[i]) {
                    locChildren[i].visit();
                }
            }
        } else{
            if(this._rendererCmd)
                cc.renderer.pushRenderCommand(this._rendererCmd);
        }

        cc.renderer.pushRenderCommand(this._afterVisitCmd);

        // javascript性能优化
        currentStack.top = currentStack.stack.pop();
    },

    _onBeforeVisit: function(ctx){
        var gl = ctx || cc._renderContext;
        ///////////////////////////////////
        // 初始化

        // 增加当前图层
        cc.ClippingNode._layer++;

        // 当前图层掩码（以图层3为例：00000100）
        var mask_layer = 0x1 << cc.ClippingNode._layer;
        // 所有小于当前图层的图层掩码（以图层3为例：00000011）
        var mask_layer_l = mask_layer - 1;
        // 所有小于或等于当前图层的图层掩码（以图层3为例：00000111）
        //var mask_layer_le = mask_layer | mask_layer_l;
        this._mask_layer_le = mask_layer | mask_layer_l;
        // 手动保存模板状态
        this._currentStencilEnabled = gl.isEnabled(gl.STENCIL_TEST);
        this._currentStencilWriteMask = gl.getParameter(gl.STENCIL_WRITEMASK);
        this._currentStencilFunc = gl.getParameter(gl.STENCIL_FUNC);
        this._currentStencilRef = gl.getParameter(gl.STENCIL_REF);
        this._currentStencilValueMask = gl.getParameter(gl.STENCIL_VALUE_MASK);
        this._currentStencilFail = gl.getParameter(gl.STENCIL_FAIL);
        this._currentStencilPassDepthFail = gl.getParameter(gl.STENCIL_PASS_DEPTH_FAIL);
        this._currentStencilPassDepthPass = gl.getParameter(gl.STENCIL_PASS_DEPTH_PASS);

        // 启用模板
        gl.enable(gl.STENCIL_TEST);
        // 启用模板测试时检查OpenGL错误
        //cc.checkGLErrorDebug();

        // 除了当前图层位以外，模板缓冲区的其余所有位均为只读。
        // 这意味着glClear或glStencliOp这类操作将会被该值遮罩。
        gl.stencilMask(mask_layer);

        // 手动保存深度测试状态
        //GLboolean currentDepthTestEnabled = GL_TRUE;
        //currentDepthTestEnabled = glIsEnabled(GL_DEPTH_TEST);
        //var currentDepthWriteMask = gl.getParameter(gl.DEPTH_WRITEMASK);
        this._currentDepthWriteMask = gl.getParameter(gl.DEPTH_WRITEMASK);
        // 绘制模板时禁用深度测试
        //glDisable(GL_DEPTH_TEST);
        // 绘制模板时禁止更新深度缓冲区
        // 因为模板在实际场景中不被渲染
        // 它不应妨碍其他内容的绘制
        // 只有禁止深度缓冲区更新才可满足需求
        gl.depthMask(false);

        ///////////////////////////////////
        // 清空模板模板缓存

        // 通过在它上面绘制一个全屏大小的矩形手动清除模板缓存
        // 以下是创建模板测试函数的方法：
        // 对于全屏矩形中的每一个像素
        //     禁止把它绘制到帧缓存中
        //     如果不是反转模式，在模板缓存中将当前图层值置0
        //     如果是反转模式，在模板缓存中将当前图层值置1
        gl.stencilFunc(gl.NEVER, mask_layer, mask_layer);
        gl.stencilOp(!this.inverted ? gl.ZERO : gl.REPLACE, gl.KEEP, gl.KEEP);

        this._drawFullScreenQuadClearStencil();

        // 绘制裁剪模板
        // 以下是创建模板测试函数的方法：
        // 对于模板节点中的每个像素
        //     禁止把它绘制到帧缓存中
        //     如果不是反转模式，在模板缓存中将当前图层值置1
        //     如果是反转模式，在模板缓存中将当前图层值置0
        gl.stencilFunc(gl.NEVER, mask_layer, mask_layer);
        gl.stencilOp(!this.inverted ? gl.REPLACE : gl.ZERO, gl.KEEP, gl.KEEP);

        if (this.alphaThreshold < 1) {            //TODO desktop
            // OES中不存在glAlphaTest，使用一个仅写入高于alpha透明度阈值的像素的shader
            var program = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLORALPHATEST);
            var alphaValueLocation = gl.getUniformLocation(program.getProgram(), cc.UNIFORM_ALPHA_TEST_VALUE_S);
            // set our alphaThreshold 设置alphaThreshold
            cc.glUseProgram(program.getProgram());
            program.setUniformLocationWith1f(alphaValueLocation, this.alphaThreshold);
            // 我们应该对模板节点中的所有节点应递归使用这个shader
            // XXX：我们应该有不必这样也能对所有节点使用shader的办法
            cc.setProgram(this._stencil, program);
        }
    },

    _drawFullScreenQuadClearStencil: function () {
        // 绘制一个全屏纯色矩形来清除模板缓存
        cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
        cc.kmGLPushMatrix();
        cc.kmGLLoadIdentity();
        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        cc.kmGLPushMatrix();
        cc.kmGLLoadIdentity();
        cc._drawingUtil.drawSolidRect(cc.p(-1, -1), cc.p(1, 1), cc.color(255, 255, 255, 255));
        cc.kmGLMatrixMode(cc.KM_GL_PROJECTION);
        cc.kmGLPopMatrix();
        cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
        cc.kmGLPopMatrix();
    },

    _onAfterDrawStencil: function(ctx){
        var gl = ctx || cc._renderContext;
        // 恢复alpha测试状态
        //if (this.alphaThreshold < 1) {
        // XXX：我们需要找到一种恢复模板节点和它子节点的shader的方法
        //}

        // 恢复深度测试状态
        gl.depthMask(this._currentDepthWriteMask);

        ///////////////////////////////////
        // 绘制内容

        // 以下是创建模板测试函数的方法：
        // 对于该节点与其子节点的每个像素
        //     如果模板缓存中所有不大于当前图层的图层位都被设为1
        //         绘制像素并保持模板缓存中的当前图层
        //     否则 
        //         不绘制像素但保持模板缓存中的当前图层
        gl.stencilFunc(gl.EQUAL, this._mask_layer_le, this._mask_layer_le);
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    },

    _onAfterVisit: function(ctx){
        var gl = ctx || cc._renderContext;
        ///////////////////////////////////
        // 清理

        // 手动恢复模板状态
        gl.stencilFunc(this._currentStencilFunc, this._currentStencilRef, this._currentStencilValueMask);
        gl.stencilOp(this._currentStencilFail, this._currentStencilPassDepthFail, this._currentStencilPassDepthPass);
        gl.stencilMask(this._currentStencilWriteMask);
        if (!this._currentStencilEnabled)
            gl.disable(gl.STENCIL_TEST);

        // 这个图层搞定，自减
        cc.ClippingNode._layer--;
    },

    _visitForCanvas: function (ctx) {
        // 组合模式，开销大但支持贴图模板
        this._clipElemType = (this._cangodhelpme() || this._stencil instanceof cc.Sprite);

        var context = ctx || cc._renderContext;
        var i, children = this._children, locChild;

        if (!this._stencil || !this._stencil.visible) {
            if (this.inverted)
                cc.Node.prototype.visit.call(this, ctx);   // 绘制所有内容
            return;
        }

        if(this._rendererSaveCmd)
            cc.renderer.pushRenderCommand(this._rendererSaveCmd);

        if(this._clipElemType){

            // 先利用节点遍历函数绘制所有内容
            cc.Node.prototype.visit.call(this, context);
        }else{
            this._stencil.visit(context);
        }

        if(this._rendererClipCmd)
            cc.renderer.pushRenderCommand(this._rendererClipCmd);

        this.transform();

        if(this._clipElemType){
            this._stencil.visit();
        }else{
            // 裁剪模式不支持递归模板，所以一旦使用裁剪模板
            // 如果存在ClippingNode作为子节点，这个子节点必须使用组合模板
            this._cangodhelpme(true);
            var len = children.length;
            if (len > 0) {
                this.sortAllChildren();
                // 绘制 zOrder < 0 的子节点
                for (i = 0; i < len; i++) {
                    locChild = children[i];
                    if (locChild._localZOrder < 0)
                        locChild.visit(context);
                    else
                        break;
                }
                if(this._rendererCmd)
                    cc.renderer.pushRenderCommand(this._rendererCmd);
                for (; i < len; i++) {
                    children[i].visit(context);
                }
            } else
            if(this._rendererCmd)
                cc.renderer.pushRenderCommand(this._rendererCmd);
            this._cangodhelpme(false);

        }

        if(this._rendererRestoreCmd)
            cc.renderer.pushRenderCommand(this._rendererRestoreCmd);
    },

    /**
     * 裁剪使用的cc.Node模板。<br/>
     * 模板节点将会被保留，默认值为nil。
     * @return {cc.Node}
     */
    getStencil: function () {
        return this._stencil;
    },

    /**
     * 设置模板
     * @function
     * @param {cc.Node} stencil
     */
    setStencil: null,

    _setStencilForWebGL: function (stencil) {
        if(this._stencil == stencil)
            return;
        if(this._stencil)
            this._stencil._parent = null;
        this._stencil = stencil;
        if(this._stencil)
            this._stencil._parent = this;
    },

    _setStencilForCanvas: function (stencil) {
        this._stencil = stencil;
        if(stencil._buffer){
            for(var i=0; i<stencil._buffer.length; i++){
                stencil._buffer[i].isFill = false;
                stencil._buffer[i].isStroke = false;
            }
        }
        var locContext = cc._renderContext;
        // 对于贴图模板，使用精灵自身
        //if (stencil instanceof cc.Sprite) {
        //    return;
        //}
        // 对于形状模板，重写模板的draw，仅初始化裁剪路径，不绘制
        //else
        if (stencil instanceof cc.DrawNode) {
            stencil._rendererCmd.rendering = function (ctx, scaleX, scaleY) {
                scaleX = scaleX || cc.view.getScaleX();
                scaleY = scaleY ||cc.view.getScaleY();
                var context = ctx || cc._renderContext;
                var t = this._node._transformWorld;
                context.save();
                context.transform(t.a, t.b, t.c, t.d, t.tx * scaleX, -t.ty * scaleY);

                context.beginPath();
                for (var i = 0; i < stencil._buffer.length; i++) {
                    var vertices = stencil._buffer[i].verts;
                    //cc.assert(cc.vertexListIsClockwise(vertices),
                    //    "Only clockwise polygons should be used as stencil");

                    var firstPoint = vertices[0];
                    context.moveTo(firstPoint.x * scaleX, -firstPoint.y * scaleY);
                    for (var j = 1, len = vertices.length; j < len; j++)
                        context.lineTo(vertices[j].x * scaleX, -vertices[j].y * scaleY);
                }
                context.restore();
            };
        }
    },

    /**
     * <p>
     * alpha透明度阈值。<br/>
     * 只有模板中像素alpha透明度高于阈值的地方才会绘制内容。<br/>
     * 应为0-1之间的float型浮点数。<br/>
     * 默认值为1。(此时alpha test不可用)
     * </p>
     * @return {Number}
     */
    getAlphaThreshold: function () {
        return this.alphaThreshold;
    },

    /**
     * 设置alpha透明度阈值。
     * @param {Number} alphaThreshold
     */
    setAlphaThreshold: function (alphaThreshold) {
        this.alphaThreshold = alphaThreshold;
    },

    /**
     * <p>
     *     设为YES时为反转模式，此时模板反转，模板没有绘制的地方才会绘制内容。<br/>
     *     默认值为NO。
     * </p>
     * @return {Boolean}
     */
    isInverted: function () {
        return this.inverted;
    },

    /**
     * 设置模板是否反转。
     * @param {Boolean} inverted
     */
    setInverted: function (inverted) {
        this.inverted = inverted;
    },

    _cangodhelpme: function (godhelpme) {
        if (godhelpme === true || godhelpme === false)
            cc.ClippingNode.prototype._godhelpme = godhelpme;
        return cc.ClippingNode.prototype._godhelpme;
    },

    _transformForRenderer: function(parentMatrix){
        cc.Node.prototype._transformForRenderer.call(this, parentMatrix);
        if(this._stencil)
            this._stencil._transformForRenderer(this._stackMatrix);
    }
});

var _p = cc.ClippingNode.prototype;

if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
    //WebGL
    _p.init = _p._initForWebGL;
    _p.visit = _p._visitForWebGL;
    _p.setStencil = _p._setStencilForWebGL;
} else {
    _p.init = _p._initForCanvas;
    _p.visit = _p._visitForCanvas;
    _p.setStencil = _p._setStencilForCanvas;
}

// 扩展属性
cc.defineGetterSetter(_p, "stencil", _p.getStencil, _p.setStencil);
/** @expose */
_p.stencil;


cc.ClippingNode._init_once = null;
cc.ClippingNode._visit_once = null;
cc.ClippingNode._layer = -1;
cc.ClippingNode._sharedCache = null;

cc.ClippingNode._getSharedCache = function () {
    return (cc.ClippingNode._sharedCache) || (cc.ClippingNode._sharedCache = document.createElement("canvas"));
};

/**
 * 创建并初始化一个以指定节点为模板的裁剪节点。<br/>
 * 模板节点会被保留。
 * @deprecated since v3.0 ，建议使用"new cc.ClippingNode(stencil)"替代
 * @param {cc.Node} [stencil=null]
 * @return {cc.ClippingNode}
 * @example
 * //示例
 * new cc.ClippingNode(stencil);
 */
cc.ClippingNode.create = function (stencil) {
    return new cc.ClippingNode(stencil);
};

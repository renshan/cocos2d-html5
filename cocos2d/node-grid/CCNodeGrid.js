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
 * <p>NodeGrid class is a class serves as a decorator of cc.Node,<br/> NodeGrid 是作为cc.Node的装饰器的类
 * Grid node can run grid actions over all its children</p> Grid 节点能够在所有它的子元素上运行grid动作
 * @type {Class}
 *
 * @property {cc.GridBase}  grid    - Grid object that is used when applying effects 被用来应用效果的Grid对象
 * @property {cc.Node}      target  - <@writeonly>Target 目标对象
 */
cc.NodeGrid = cc.Node.extend({
    grid: null,
    _target: null,
    _gridBeginCommand:null,
    _gridEndCommand:null,

    ctor: function(){
        cc.Node.prototype.ctor.call(this);
        if(cc._renderType === cc._RENDER_TYPE_WEBGL){
            this._gridBeginCommand = new cc.CustomRenderCmdWebGL(this, this.onGridBeginDraw);
            this._gridEndCommand = new cc.CustomRenderCmdWebGL(this, this.onGridEndDraw);
        }
    },

    /**
     * Gets the grid object. 获取grid对象
     * @returns {cc.GridBase}
     */
    getGrid: function () {
        return this.grid;
    },

    /**
     * Set the grid object. 设置grid对象
     * @param {cc.GridBase} grid
     */
    setGrid: function (grid) {
        this.grid = grid;
    },

    /**
     * Set the target 设置目标对象
     * @param {cc.Node} target
     */
    setTarget: function (target) {
        this._target = target;
    },

    onGridBeginDraw: function(){
        var isWebGL = cc._renderType == cc._RENDER_TYPE_WEBGL, locGrid = this.grid;
        if (isWebGL && locGrid && locGrid._active)
            locGrid.beforeDraw();
    },

    onGridEndDraw: function(){
        var isWebGL = cc._renderType == cc._RENDER_TYPE_WEBGL, locGrid = this.grid;
        if (isWebGL && locGrid && locGrid._active)
            locGrid.afterDraw(this._target);
    },

    /**
     * Recursive method that visit its children and draw them 访问NodeGrid子元素和绘制它们的递归方法
     */
    visit: function () {
        var self = this;
        // quick return if not visible  如果没有子元素则返回
        if (!self._visible)
            return;

        var isWebGL = cc._renderType == cc._RENDER_TYPE_WEBGL, locGrid = this.grid;
        if(isWebGL){
            var currentStack = cc.current_stack;
            currentStack.stack.push(currentStack.top);
            cc.kmMat4Assign(this._stackMatrix, currentStack.top);
            currentStack.top = this._stackMatrix;
        }

        self.transform();

        if(isWebGL){

            var beforeProjectionType = cc.director.PROJECTION_DEFAULT;
            if (locGrid && locGrid._active){
                //var backMatrix = new cc.kmMat4();
                //cc.kmMat4Assign(backMatrix, this._stackMatrix);

                beforeProjectionType = cc.director.getProjection();
                //locGrid.set2DProjection();

                //reset this._stackMatrix to current_stack.top
                //cc.kmMat4Assign(currentStack.top, backMatrix);
            }
            if(this._gridBeginCommand)
                cc.renderer.pushRenderCommand(this._gridBeginCommand);

            if(this._target)
                this._target.visit();
        }

        var locChildren = this._children;
        if (locChildren && locChildren.length > 0) {
            var childLen = locChildren.length;
            this.sortAllChildren();
            // draw children 绘制子元素
            for (var i = 0; i < childLen; i++) {
                var child = locChildren[i];
                child && child.visit();
            }
        }

        if(isWebGL){
            if(locGrid && locGrid._active){
                //cc.director.setProjection(beforeProjectionType);
            }
            if(this._gridEndCommand)
                cc.renderer.pushRenderCommand(this._gridEndCommand);
            currentStack.top = currentStack.stack.pop();
        }
    },

    _transformForWebGL: function () {
        //optimize performance for javascript 优化javascript性能
        var t4x4 = this._transform4x4, topMat4 = cc.current_stack.top;

        // Convert 3x3 into 4x4 matrix 将3x3 转换成 4x4 矩阵
        var trans = this.getNodeToParentTransform();
        var t4x4Mat = t4x4.mat;
        t4x4Mat[0] = trans.a;
        t4x4Mat[4] = trans.c;
        t4x4Mat[12] = trans.tx;
        t4x4Mat[1] = trans.b;
        t4x4Mat[5] = trans.d;
        t4x4Mat[13] = trans.ty;

        // Update Z vertex manually 手动更新Z轴顶点
        //this._transform4x4.mat[14] = this._vertexZ;
        t4x4Mat[14] = this._vertexZ;

        //optimize performance for Javascript 优化javascript性能
        cc.kmMat4Multiply(topMat4, topMat4, t4x4); // = cc.kmGLMultMatrix(this._transform4x4);

        // XXX: Expensive calls. Camera should be integrated into the cached affine matrix  XXX:代价昂贵的调用。相机应该被集成到被缓存的仿射矩阵
        if (this._camera != null && !(this.grid && this.grid.isActive())) {
            var apx = this._anchorPointInPoints.x, apy = this._anchorPointInPoints.y;
            var translate = (apx !== 0.0 || apy !== 0.0);
            if (translate) {
                if(!cc.SPRITEBATCHNODE_RENDER_SUBPIXEL) {
                    apx = 0 | apx;
                    apy = 0 | apy;
                }
                cc.kmGLTranslatef(apx, apy, 0);
                this._camera.locate();
                cc.kmGLTranslatef(-apx, -apy, 0);
            } else {
                this._camera.locate();
            }
        }
    }
});

var _p = cc.NodeGrid.prototype;
if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
    _p.transform = _p._transformForWebGL;
    //The parent class method directly from canvas model  父类方法直接来自canvas模块
}
// Extended property 扩展的属性
/** @expose */
_p.grid;
/** @expose */
_p.target;
cc.defineGetterSetter(_p, "target", null, _p.setTarget);


/**
 * Creates a NodeGrid. <br /> 创建NodeGrid对象
 * Implementation cc.NodeGrid 实现cc.NodeGrid
 * @deprecated since v3.0 please new cc.NodeGrid instead. 自v3.0后请用 new cc.NodeGrid() 代替。
 * @return {cc.NodeGrid}
 */
cc.NodeGrid.create = function () {
    return new cc.NodeGrid();
};
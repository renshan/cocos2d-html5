/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2012 Scott Lembcke and Howling Moon Software

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


/*
重要 - READ ME！
这个文件提供了一些引用Chipmunk空间的私有API，这些API可以提供高效的调试渲染。
在你自己的游戏中不建议编写类似的渲染代码，这些私有API可能在没有警告的情况下发生修改。
*/

 /**
 *  将一个数字数组转换为向量（x,y）数组
 *  @function
 *  @param {Array} verts
 *  @return {Array}
 */
cc.__convertVerts = function (verts) {
    var ret = [];
    for (var i = 0; i < verts.length / 2; i++) {
        ret[i] = {x:verts[i * 2], y:verts[i * 2 + 1]};
    }
    return ret;
};

/**
 * 刚体（body）的颜色
 * @function
 * @param {cp.Body} body
 * @return {cc.color}
 */
cc.ColorForBody = function (body) {
    if (body.isRogue() || body.isSleeping()) {
        return cc.color(128, 128, 128, 128);
    } else if (body.nodeIdleTime > body.space.sleepTimeThreshold) {
        return cc.color(84, 84, 84, 128);
    } else {
        return cc.color(255, 0, 0, 128);
    }
};

/**
 * 绘制形状（Shape）
 * @param {cp.Shape} shape
 * @param renderer
 */
cc.DrawShape = function (shape, renderer) {
    var body = shape.body;
    var color = cc.ColorForBody(body);
    switch (shape.collisionCode) {
        case cp.CircleShape.prototype.collisionCode:
            this.drawDot(shape.tc, Math.max(shape.r, 1.0), color);
            this.drawSegment(shape.tc, cp.v.add(shape.tc, cp.v.mult(body.rot, shape.r)), 1.0, color);
            break;
        case cp.SegmentShape.prototype.collisionCode:
            this.drawSegment(shape.ta, shape.tb, Math.max(shape.r, 2.0), color);
            break;
        case cp.PolyShape.prototype.collisionCode:
            var line = cc.color(color.r, color.g, color.b, cc.lerp(color.a, 255, 0.5));
            this.drawPoly(cc.__convertVerts(shape.tVerts), color, 1.0, line);
            break;
        default:
            cc.log("cc.DrawShape(): Bad assertion in DrawShape()");
            break;
    }
};

/**
 * 绘制约束
 * @param {cp.Constraint} constraint
 * @param renderer
 */
cc.DrawConstraint = function (constraint, renderer) {
    var body_a = constraint.a;
    var body_b = constraint.b;
    var a, b;

    if (constraint instanceof cp.PinJoint) {
        a = body_a.local2World(constraint.anchr1);
        b = body_b.local2World(constraint.anchr2);
        this.drawDot(a, 3.0, cc.CONSTRAINT_COLOR);
        this.drawDot(b, 3.0, cc.CONSTRAINT_COLOR);
        this.drawSegment(a, b, 1.0, cc.CONSTRAINT_COLOR);
    } else if (constraint instanceof cp.SlideJoint) {
        a = body_a.local2World(constraint.anchr1);
        b = body_b.local2World(constraint.anchr2);

        this.drawDot(a, 3.0, cc.CONSTRAINT_COLOR);
        this.drawDot(b, 3.0, cc.CONSTRAINT_COLOR);
        this.drawSegment(a, b, 1.0, cc.CONSTRAINT_COLOR);
    } else if (constraint instanceof cp.PivotJoint) {
        a = body_a.local2World(constraint.anchr1);
        b = body_b.local2World(constraint.anchr2);
        this.drawDot(a, 3.0, cc.CONSTRAINT_COLOR);
        this.drawDot(b, 3.0, cc.CONSTRAINT_COLOR);
    } else if (constraint instanceof cp.GrooveJoint) {
        a = body_a.local2World(constraint.grv_a);
        b = body_a.local2World(constraint.grv_b);
        var c = body_b.local2World(constraint.anchr2);

        this.drawDot(c, 3.0, cc.CONSTRAINT_COLOR);
        this.drawSegment(a, b, 1.0, cc.CONSTRAINT_COLOR);
    } else if (constraint instanceof cp.DampedSpring) {
        // TODO
    } else {
        //printf("Cannot draw constraint\n");
    }
};

/**
 * @constant
 * @type {cc.color}
 */
cc.CONSTRAINT_COLOR = cc.color(0, 255, 0, 128);


 /**
 * <p>绘制物理引擎组件的节点.<br/>
 * 支持的物理引擎:<br/>
 * - Chipmunk<br/>
 * - Objective-Chipmunk</p>
 *
 * @class
 * @extends cc.DrawNode
 *
 * @property {cp.Space} space     物理空间
 */
cc.PhysicsDebugNode = cc.DrawNode.extend({
    _space:null,
    _className:"PhysicsDebugNode",

     /**
     * cc.PhysicsDebugNode的构造函数
     * @param {cp.Space} space
     */
    ctor: function (space) {
        cc.DrawNode.prototype.ctor.call(this);
        this._space = space;
    },

    _initRendererCmd:function(){
        if(cc._renderType === cc._RENDER_TYPE_CANVAS)
            this._rendererCmd = new cc.PhysicsDebugNodeRenderCmdCanvas(this);
        else
            this._rendererCmd = new cc.PhysicsDebugNodeRenderCmdWebGL(this);
    },
     /**
     * 获取物理空间
     * @returns {cp.Space}
     */
    getSpace:function () {
        return this._space;
    },

     /**
     * 设置物理空间
     * @param {cp.Space} space
     */
    setSpace:function (space) {
        this._space = space;
    },

     /**
     * 绘制
     * @param {object} context
     */
    draw:function (context) {
        if (!this._space)
            return;

        this._space.eachShape(cc.DrawShape.bind(this));
        this._space.eachConstraint(cc.DrawConstraint.bind(this));
        cc.DrawNode.prototype.draw.call(this);
        this.clear();
    }
});

 /**
 * 为一个普通的Chipmunk空间创建debug节点.
 * @deprecated since v3.0, please use new cc.PhysicsDebugNode(space)
 * @param {cp.Space} 物理空间
 * @return {cc.PhysicsDebugNode}
 */
cc.PhysicsDebugNode.create = function (space) {
    return new cc.PhysicsDebugNode(space);
};

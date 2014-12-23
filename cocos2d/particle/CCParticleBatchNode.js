/**
 * Copyright (c) 2008-2010 Ricardo Quesada
 * Copyright (c) 2011-2012 cocos2d-x.org
 * Copyright (c) 2013-2014 Chukong Technologies Inc.
 * Copyright (C) 2009 Matt Oswald
 * Copyright (c) 2011 Marco Tillemans
 *
 * http://www.cocos2d-x.org
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

/**
 * 默认粒子容量
 * @constant
 * @type Number
 */
cc.PARTICLE_DEFAULT_CAPACITY = 500;

/**
 * <p>
 *    cc.ParticleBatchNode 像一个批处理节点：如果包含子节点，会利用单独一次OpenGL调用绘制它们。<br/>
 *    （通常被称之为“批量绘制”）。</br>
 *
 *    一个cc.ParticleBatchNode对象能且只能引用一个纹理（一个图片文件，一个纹理图集）。<br/>
 *    只有被包含在纹理对象中的cc.ParticleSystem才能被添加到cc.SpriteBatchNode。<br/>
 *    所有被添加到cc.SpriteBatchNode的 cc.ParticleSystem会在单独一次OpenGL ES绘制调用中被绘制。<br/>
 *    如果cc.ParticleSystem没有被添加到cc.ParticleBatchNode，那么每个cc.ParticleSystem都会有一次OpenGL ES绘制调用，这样做效率很低。<br/>
 *
 *    局限性：<br/>
 *    - 目前仅支持cc.ParticleSystem。<br/>
 *    - 所有系统的绘制都需要使用同样的参数，混合函数，失真（aliasing）和纹理。<br/>
 *
 *    最有效的用法：<br/>
 *    - 对于所有的粒子系统，使用纹理和足够的容量初始化ParticleBatchNode。<br/>
 *    - 初始化所有粒子系统并且把它们作为子元素添加到批处理节点
 * </p>
 * @class
 * @extends cc.ParticleSystem
 * @param {String|cc.Texture2D} fileImage
 * @param {Number} capacity
 *
 * @property {cc.Texture2D|HTMLImageElement|HTMLCanvasElement}  texture         - 使用的纹理
 * @property {cc.TextureAtlas}                                  textureAtlas    - 用来绘制图块（quad）的纹理图集
 *
 * @example
 * 1.
 * //用图片路径和容量作为参数创建cc.ParticleBatchNode对象
 * var particleBatchNode = new cc.ParticleBatchNode("res/grossini_dance.png",30);
 *
 * 2.
 * //用纹理对象和容量作为参数创建cc.ParticleBatchNode对象
 * var texture = cc.TextureCache.getInstance().addImage("res/grossini_dance.png");
 * var particleBatchNode = new cc.ParticleBatchNode(texture, 30);
 */
cc.ParticleBatchNode = cc.Node.extend(/** @lends cc.ParticleBatchNode# */{
	textureAtlas:null,

    TextureProtocol:true,
    //绘制图块使用的混合函数
    _blendFunc:null,
    _className:"ParticleBatchNode",

    /**
     * 用磁盘上的文件名称（支持的列表格式请查阅cc.Texture2D类）和粒子容量作为参数初始化粒子系统。
     * cc.ParticleBatchNode的构造函数。
     * @param {String|cc.Texture2D} fileImage
     * @param {Number} capacity
     * @example
     * 1.
     * //用图片路径和容量作为参数创建cc.ParticleBatchNode对象
     * var particleBatchNode = new cc.ParticleBatchNode("res/grossini_dance.png",30);
     *
     * 2.
     * //用纹理对象和容量作为参数创建cc.ParticleBatchNode对象
     * var texture = cc.TextureCache.getInstance().addImage("res/grossini_dance.png");
     * var particleBatchNode = new cc.ParticleBatchNode(texture, 30);
     */
    ctor:function (fileImage, capacity) {
        cc.Node.prototype.ctor.call(this);
        this._blendFunc = {src:cc.BLEND_SRC, dst:cc.BLEND_DST};
        if (cc.isString(fileImage)) {
            this.init(fileImage, capacity);
        } else if (fileImage instanceof cc.Texture2D) {
            this.initWithTexture(fileImage, capacity);
        }
    },

    /**
     * 用cc.Texture2D对象和粒子容量作为参数初始化粒子系统
     * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture
     * @param {Number} capacity
     * @return {Boolean}
     */
    initWithTexture:function (texture, capacity) {
        this.textureAtlas = new cc.TextureAtlas();
        this.textureAtlas.initWithTexture(texture, capacity);

        // 该节点不使用惰性分配（lazy alloc）
        this._children.length = 0;

        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
        return true;
    },

    /**
     * 用磁盘上的文件名称（支持的列表格式请查阅cc.Texture2D类）和粒子容量作为参数初始化粒子系统
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
    initWithFile:function (fileImage, capacity) {
        var tex = cc.textureCache.addImage(fileImage);
        return this.initWithTexture(tex, capacity);
    },

    /**
     * 用磁盘上的文件名称（支持的列表格式请查阅cc.Texture2D类）和粒子容量作为参数初始化粒子系统
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
    init:function (fileImage, capacity) {
        var tex = cc.TextureCache.getInstance().addImage(fileImage);
        return this.initWithTexture(tex, capacity);
    },

    /**
     * 添加cc.ParticleBatchNode的子元素
     * @param {cc.ParticleSystem} child
     * @param {Number} zOrder
     * @param {Number} tag
     */
    addChild:function (child, zOrder, tag) {
        if(!child)
            throw "cc.ParticleBatchNode.addChild() : child should be non-null";
        if(!(child instanceof cc.ParticleSystem))
            throw "cc.ParticleBatchNode.addChild() : only supports cc.ParticleSystem as children";
        zOrder = (zOrder == null) ? child.zIndex : zOrder;
        tag = (tag == null) ? child.tag : tag;

        if(child.getTexture() != this.textureAtlas.texture)
            throw "cc.ParticleSystem.addChild() : the child is not using the same texture id";

        // 如果是第一个子元素，复制混合函数
        var childBlendFunc = child.getBlendFunc();
        if (this._children.length === 0)
            this.setBlendFunc(childBlendFunc);
        else{
            if((childBlendFunc.src != this._blendFunc.src) || (childBlendFunc.dst != this._blendFunc.dst)){
                cc.log("cc.ParticleSystem.addChild() : Can't add a ParticleSystem that uses a different blending function");
                return;
            }
        }

        // 不是惰性排序，所以调用helper而不是父类的addChild
        var pos = this._addChildHelper(child, zOrder, tag);

        // 获取新的atlasIndex
        var atlasIndex = 0;

        if (pos != 0) {
            var p = this._children[pos - 1];
            atlasIndex = p.getAtlasIndex() + p.getTotalParticles();
        } else
            atlasIndex = 0;

        this.insertChild(child, atlasIndex);

        // 更新图块信息
        child.setBatchNode(this);
    },

    /**
     * 给cc.ParticleBatchNode插入一个子元素
     * @param {cc.ParticleSystem} pSystem
     * @param {Number} index
     */
    insertChild:function (pSystem, index) {
        var totalParticles = pSystem.getTotalParticles();
        var locTextureAtlas = this.textureAtlas;
        var totalQuads = locTextureAtlas.totalQuads;
        pSystem.setAtlasIndex(index);
        if (totalQuads + totalParticles > locTextureAtlas.getCapacity()) {
            this._increaseAtlasCapacityTo(totalQuads + totalParticles);
            // realloc后textureAtlas的空图块可能会包含垃圾数据（realloc不会执行calloc），插入空图块来避免这个问题。
            locTextureAtlas.fillWithEmptyQuadsFromIndex(locTextureAtlas.getCapacity() - totalParticles, totalParticles);
        }

        // 给图块让出地方，最后一个子元素不用
        if (pSystem.getAtlasIndex() + totalParticles != totalQuads)
            locTextureAtlas.moveQuadsFromIndex(index, index + totalParticles);

        // 这里为新的粒子增加totalParticles，粒子系统的update方法将会填充图块
        locTextureAtlas.increaseTotalQuadsWith(totalParticles);
        this._updateAllAtlasIndexes();
    },

    /**
     * @param {cc.ParticleSystem} child
     * @param {Boolean} cleanup
     */
    removeChild:function (child, cleanup) {
        // 显式nil处理
        if (child == null)
            return;

        if(!(child instanceof cc.ParticleSystem))
            throw "cc.ParticleBatchNode.removeChild(): only supports cc.ParticleSystem as children";
        if(this._children.indexOf(child) == -1){
            cc.log("cc.ParticleBatchNode.removeChild(): doesn't contain the sprite. Can't remove it");
            return;
        }

        cc.Node.prototype.removeChild.call(this, child, cleanup);

        var locTextureAtlas = this.textureAtlas;
        // 删除子元素的helper
        locTextureAtlas.removeQuadsAtIndex(child.getAtlasIndex(), child.getTotalParticles());

        // 当数据移动后，清空数组尾部的图块
        locTextureAtlas.fillWithEmptyQuadsFromIndex(locTextureAtlas.totalQuads, child.getTotalParticles());

        // 粒子可为自渲染而重用
        child.setBatchNode(null);

        this._updateAllAtlasIndexes();
    },

    /**
     * 在这个函数中完成粒子的重新排序，粒子无惰性排序
     * @param {cc.ParticleSystem} child
     * @param {Number} zOrder
     */
    reorderChild:function (child, zOrder) {
        if(!child)
            throw "cc.ParticleBatchNode.reorderChild(): child should be non-null";
        if(!(child instanceof cc.ParticleSystem))
            throw "cc.ParticleBatchNode.reorderChild(): only supports cc.QuadParticleSystems as children";
        if(this._children.indexOf(child) === -1){
            cc.log("cc.ParticleBatchNode.reorderChild(): Child doesn't belong to batch");
            return;
        }

        if (zOrder == child.zIndex)
            return;

        // 如果只有一个子元素不用重新排序
        if (this._children.length > 1) {
            var getIndexes = this._getCurrentIndex(child, zOrder);

            if (getIndexes.oldIndex != getIndexes.newIndex) {
                // 重新排序m_pChildren.array
                this._children.splice(getIndexes.oldIndex, 1)
                this._children.splice(getIndexes.newIndex, 0, child);

                // 保存旧的图集索引
                var oldAtlasIndex = child.getAtlasIndex();

                // 更新图集索引
                this._updateAllAtlasIndexes();

                // 查找新的图集索引
                var newAtlasIndex = 0;
                var locChildren = this._children;
                for (var i = 0; i < locChildren.length; i++) {
                    var pNode = locChildren[i];
                    if (pNode == child) {
                        newAtlasIndex = child.getAtlasIndex();
                        break;
                    }
                }

                // 重新排序纹理图集的图块
                this.textureAtlas.moveQuadsFromIndex(oldAtlasIndex, child.getTotalParticles(), newAtlasIndex);

                child.updateWithNoTime();
            }
        }
        child._setLocalZOrder(zOrder);
    },

    /**
     * @param {Number} index
     * @param {Boolean} doCleanup
     */
    removeChildAtIndex:function (index, doCleanup) {
        this.removeChild(this._children[i], doCleanup);
    },

    /**
     * @param {Boolean} doCleanup
     */
    removeAllChildren:function (doCleanup) {
        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            locChildren[i].setBatchNode(null);
        }
        cc.Node.prototype.removeAllChildren.call(this, doCleanup);
        this.textureAtlas.removeAllQuads();
    },

    /**
     * 通过向纹理图集中插入一个填0图块来禁用指定粒子
     * @param {Number} particleIndex
     */
    disableParticle:function (particleIndex) {
        var quad = this.textureAtlas.quads[particleIndex];
        quad.br.vertices.x = quad.br.vertices.y = quad.tr.vertices.x = quad.tr.vertices.y =
            quad.tl.vertices.x = quad.tl.vertices.y = quad.bl.vertices.x = quad.bl.vertices.y = 0.0;
        this.textureAtlas._setDirty(true);
    },

    /**
     * 使用canvas 2d context或WebGL context的渲染函数，仅限内部使用，请不要调用此函数
     * @function
     * @param {CanvasRenderingContext2D | WebGLRenderingContext} ctx The render context
     */
    draw:function (ctx) {
        //cc.PROFILER_STOP("CCParticleBatchNode - draw");
        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            return;

        if (this.textureAtlas.totalQuads == 0)
            return;

        cc.nodeDrawSetup(this);
        cc.glBlendFuncForParticle(this._blendFunc.src, this._blendFunc.dst);
        this.textureAtlas.drawQuads();

        //cc.PROFILER_STOP("CCParticleBatchNode - draw");
    },

    /**
     * 返回使用中的纹理
     * @return {cc.Texture2D|HTMLImageElement|HTMLCanvasElement}
     */
    getTexture:function () {
        return this.textureAtlas.texture;
    },

    /**
     * 设置新的纹理，该纹理将被保留
     * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture
     */
    setTexture:function (texture) {
        this.textureAtlas.texture = texture;

        // 如果新的纹理［没有］预乘alpha通道，［并且］混合函数未变，则更新混合函数
        var locBlendFunc = this._blendFunc;
        if (texture && !texture.hasPremultipliedAlpha() && ( locBlendFunc.src == cc.BLEND_SRC && locBlendFunc.dst == cc.BLEND_DST )) {
            locBlendFunc.src = cc.SRC_ALPHA;
            locBlendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        }
    },

    /**
     * 设置纹理使用的混合函数
     * @param {Number|Object} src
     * @param {Number} dst
     */
    setBlendFunc:function (src, dst) {
        if (dst === undefined){
            this._blendFunc.src = src.src;
            this._blendFunc.dst = src.dst;
        } else{
            this._blendFunc.src = src;
            this._blendFunc.src = dst;
        }

    },

    /**
     * 返回纹理使用的混合函数
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return {src:this._blendFunc.src, dst:this._blendFunc.dst};
    },

    // 重写visit函数
    // 不对其子元素调用visit
    /**
     * 访问CCParticleBatchNode子元素并绘制它们的递归方法
     * @function
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx
     */
    visit:function (ctx) {
        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            return;

        // 注意：
        // 这个visit函数几乎和cc.Node的visit函数一样，
        // 不同之处在于它不会对其子元素调用visit函数。
        //
        // 虽说还有一个void cc.Sprite的visit函数可供选择，
        // 而且这个函数相对不易维护，不过运行更快。
        //
        if (!this._visible)
            return;

        var currentStack = cc.current_stack;
        currentStack.stack.push(currentStack.top);
        cc.kmMat4Assign(this._stackMatrix, currentStack.top);
        currentStack.top = this._stackMatrix;

        this.transform(ctx);
        //this.draw(ctx);
        if(this._rendererCmd)
            cc.renderer.pushRenderCommand(this._rendererCmd);

        cc.kmGLPopMatrix();
    },

    _updateAllAtlasIndexes:function () {
        var index = 0;
        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var child = locChildren[i];
            child.setAtlasIndex(index);
            index += child.getTotalParticles();
        }
    },

    _increaseAtlasCapacityTo:function (quantity) {
        cc.log("cocos2d: cc.ParticleBatchNode: resizing TextureAtlas capacity from [" + this.textureAtlas.getCapacity()
            + "] to [" + quantity + "].");

        if (!this.textureAtlas.resizeCapacity(quantity)) {
            // 严重问题
            cc.log("cc.ParticleBatchNode._increaseAtlasCapacityTo() : WARNING: Not enough memory to resize the atlas");
        }
    },

    _searchNewPositionInChildrenForZ:function (z) {
        var locChildren = this._children;
        var count = locChildren.length;
        for (var i = 0; i < count; i++) {
            if (locChildren[i].zIndex > z)
                return i;
        }
        return count;
    },

    _getCurrentIndex:function (child, z) {
        var foundCurrentIdx = false;
        var foundNewIdx = false;

        var newIndex = 0;
        var oldIndex = 0;

        var minusOne = 0, locChildren = this._children;
        var count = locChildren.length;
        for (var i = 0; i < count; i++) {
            var pNode = locChildren[i];
            // 新索引
            if (pNode.zIndex > z && !foundNewIdx) {
                newIndex = i;
                foundNewIdx = true;

                if (foundCurrentIdx && foundNewIdx)
                    break;
            }
            // 当前索引
            if (child == pNode) {
                oldIndex = i;
                foundCurrentIdx = true;
                if (!foundNewIdx)
                    minusOne = -1;
                if (foundCurrentIdx && foundNewIdx)
                    break;
            }
        }
        if (!foundNewIdx)
            newIndex = count;
        newIndex += minusOne;
        return {newIndex:newIndex, oldIndex:oldIndex};
    },

    //
    // <p>
    //     不要使用惰性排序，那样的话重整粒子系统图块的工作会变得非常复杂。<br/>
    //	   XXX 研究一下惰性排序＋释放当前图块和calloc一个指定容量的新块哪个更快。<br/>
    //     XXX 或者利用vertexZ，这个可能是最快的。<br/>
    //     这个helper几乎和CCNode's的addChild函数一样，但是不使用惰性排序。
    // </p>
    // @param {cc.ParticleSystem} child
    // @param {Number} z
    // @param {Number} aTag
    // @return {Number}
    // @private
    //
    _addChildHelper:function (child, z, aTag) {
        if(!child)
            throw "cc.ParticleBatchNode._addChildHelper(): child should be non-null";
        if(child.parent){
            cc.log("cc.ParticleBatchNode._addChildHelper(): child already added. It can't be added again");
            return null;
        }


        if (!this._children)
            this._children = [];

        // 不要惰性插入
        var pos = this._searchNewPositionInChildrenForZ(z);

        this._children.splice(pos, 0, child);
        child.tag = aTag;
        child._setLocalZOrder(z);
        child.parent = this;
        if (this._running) {
            child.onEnter();
            child.onEnterTransitionDidFinish();
        }
        return pos;
    },

    _updateBlendFunc:function () {
        if (!this.textureAtlas.texture.hasPremultipliedAlpha()) {
            this._blendFunc.src = cc.SRC_ALPHA;
            this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        }
    },

    /**
     * 返回绘制图块使用的纹理图集
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas:function () {
        return this.textureAtlas;
    },

    /**
     * 设置绘制图块使用的纹理图集
     * @param {cc.TextureAtlas} textureAtlas
     */
    setTextureAtlas:function (textureAtlas) {
        this.textureAtlas = textureAtlas;
    },

    _initRendererCmd:function(){
        if(cc._renderType === cc._RENDER_TYPE_WEBGL)
            this._rendererCmd = new cc.ParticleBatchNodeRenderCmdWebGL(this);
    }
});

var _p = cc.ParticleBatchNode.prototype;

// 扩展属性
/** @expose */
_p.texture;
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);


/**
 * 用磁盘上的文件名称（支持的列表格式请查阅cc.Texture2D类）和粒子容量作为参数初始化粒子系统
 * @deprecated since v3.0 自v3.0后请用 new cc.ParticleBatchNode(filename, capacity) 代替。
 * @param {String|cc.Texture2D} fileImage
 * @param {Number} capacity
 * @return {cc.ParticleBatchNode}
 */
cc.ParticleBatchNode.create = function (fileImage, capacity) {
    return new cc.ParticleBatchNode(fileImage, capacity);
};

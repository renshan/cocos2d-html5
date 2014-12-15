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
 *    cc.ParticleBatchNode is like a batch node: if it contains children, it will draw them in 1 single OpenGL call  <br/> 
 *    cc.ParticleBatchNode 像一个批处理节点：如果包含子元素，会调用独立的OpenGL绘制它们。
 *    (often known as "batch draw").  </br>
 *    （通常被称之为“批量绘制”）
 *
 *    A cc.ParticleBatchNode can reference one and only one texture (one image file, one texture atlas).<br/>
 *    一个cc.ParticleBatchNode对象能且只能引用一个纹理（一个图片文件，一个纹理地图集）。
 *    Only the cc.ParticleSystems that are contained in that texture can be added to the cc.SpriteBatchNode.<br/>
 *    只有被包含在纹理对象中的cc.ParticleSystems才能被添加到cc.SpriteBatchNode。
 *    All cc.ParticleSystems added to a cc.SpriteBatchNode are drawn in one OpenGL ES draw call.<br/>
 *    所有被添加到cc.SpriteBatchNode的 cc.ParticleSystems 被OpenGL ES 绘制调用绘制一次。
 *    If the cc.ParticleSystems are not added to a cc.ParticleBatchNode then an OpenGL ES draw call will be needed for each one, which is less efficient.</br>
 *    如果cc.ParticleSystems没有被添加到cc.ParticleBatchNode那么OpenGL ES绘制方法将会被cc.ParticleSystems依次调用，这样做效率很低。
 *
 *    Limitations:<br/>
 *    局限性：
 *    - At the moment only cc.ParticleSystem is supported<br/>
 *    -目前为止只有cc.ParticleSystem被支持
 *    - All systems need to be drawn with the same parameters, blend function, aliasing, texture<br/>
 *    -所有系统需要被同样的参数绘制，blend function，aliasing，texture
 *
 *    Most efficient usage<br/>
 *    最有效的用法：
 *    - Initialize the ParticleBatchNode with the texture and enough capacity for all the particle systems<br/>
 *    -对于所有的粒子系统，使用纹理和足够的容量初始化ParticleBatchNode
 *    - Initialize all particle systems and add them as child to the batch node<br/>
 *    -初始化所有粒子系统并且把它们作为子元素添加到批处理节点
 * </p>
 * @class
 * @extends cc.ParticleSystem
 * @param {String|cc.Texture2D} fileImage
 * @param {Number} capacity
 *
 * @property {cc.Texture2D|HTMLImageElement|HTMLCanvasElement}  texture         - The used texture 使用的纹理
 * @property {cc.TextureAtlas}                                  textureAtlas    - The texture atlas used for drawing the quads 用来绘制quads的纹理地图集
 *
 * @example
 * 1.
 * //Create a cc.ParticleBatchNode with image path  and capacity
 * //用图片路径和容量作为参数创建cc.ParticleBatchNode对象
 * var particleBatchNode = new cc.ParticleBatchNode("res/grossini_dance.png",30);
 *
 * 2.
 * //Create a cc.ParticleBatchNode with a texture and capacity
 * //用纹理对象和容量作为参数创建cc.ParticleBatchNode对象
 * var texture = cc.TextureCache.getInstance().addImage("res/grossini_dance.png");
 * var particleBatchNode = new cc.ParticleBatchNode(texture, 30);
 */
cc.ParticleBatchNode = cc.Node.extend(/** @lends cc.ParticleBatchNode# */{
	textureAtlas:null,

    TextureProtocol:true,
    //the blend function used for drawing the quads
    _blendFunc:null,
    _className:"ParticleBatchNode",

    /**
     * initializes the particle system with the name of a file on disk (for a list of supported formats look at the cc.Texture2D class), a capacity of particles
     * 用磁盘上的文件名称（支持的列表格式请查阅cc.Texture2D类）和particles的容量作为参数初始化粒子系统
     * Constructor of cc.ParticleBatchNode
     * @param {String|cc.Texture2D} fileImage
     * @param {Number} capacity
     * @example
     * 1.
     * //Create a cc.ParticleBatchNode with image path  and capacity
     * //用图片路径和容量作为参数创建cc.ParticleBatchNode对象
     * var particleBatchNode = new cc.ParticleBatchNode("res/grossini_dance.png",30);
     *
     * 2.
     * //Create a cc.ParticleBatchNode with a texture and capacity
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
     * initializes the particle system with cc.Texture2D, a capacity of particles
     * 用cc.Texture2D对象和粒子容量作为参数初始化粒子系统
     * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture
     * @param {Number} capacity
     * @return {Boolean}
     */
    initWithTexture:function (texture, capacity) {
        this.textureAtlas = new cc.TextureAtlas();
        this.textureAtlas.initWithTexture(texture, capacity);

        // no lazy alloc in this node
        this._children.length = 0;

        if (cc._renderType === cc._RENDER_TYPE_WEBGL)
            this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
        return true;
    },

    /**
     * initializes the particle system with the name of a file on disk (for a list of supported formats look at the cc.Texture2D class), a capacity of particles
     * 用磁盘上的文件名称（支持的列表格式请查阅cc.Texture2D类）和particles的容量作为参数初始化粒子系统
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
    initWithFile:function (fileImage, capacity) {
        var tex = cc.textureCache.addImage(fileImage);
        return this.initWithTexture(tex, capacity);
    },

    /**
     * initializes the particle system with the name of a file on disk (for a list of supported formats look at the cc.Texture2D class), a capacity of particles
     * 用磁盘上的文件名称（支持的列表格式请查阅cc.Texture2D类）和particles的容量作为参数初始化粒子系统
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
    init:function (fileImage, capacity) {
        var tex = cc.TextureCache.getInstance().addImage(fileImage);
        return this.initWithTexture(tex, capacity);
    },

    /**
     * Add a child into the cc.ParticleBatchNode
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

        // If this is the 1st children, then copy blending function 如果是第一个子元素，拷贝blending函数
        var childBlendFunc = child.getBlendFunc();
        if (this._children.length === 0)
            this.setBlendFunc(childBlendFunc);
        else{
            if((childBlendFunc.src != this._blendFunc.src) || (childBlendFunc.dst != this._blendFunc.dst)){
                cc.log("cc.ParticleSystem.addChild() : Can't add a ParticleSystem that uses a different blending function");
                return;
            }
        }

        //no lazy sorting, so don't call super addChild, call helper instead 不是懒排序，所以调用helper而不是父类的addChild
        var pos = this._addChildHelper(child, zOrder, tag);

        //get new atlasIndex
        var atlasIndex = 0;

        if (pos != 0) {
            var p = this._children[pos - 1];
            atlasIndex = p.getAtlasIndex() + p.getTotalParticles();
        } else
            atlasIndex = 0;

        this.insertChild(child, atlasIndex);

        // update quad info 更新quad信息
        child.setBatchNode(this);
    },

    /**
     * Inserts a child into the cc.ParticleBatchNode
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
            // after a realloc empty quads of textureAtlas can be filled with gibberish (realloc doesn't perform calloc), insert empty quads to prevent it
            //当重新分配一个空的纹理地图集的quads之后能被无用数据填充（realloc不执行calloc），插入空的quads展现
            locTextureAtlas.fillWithEmptyQuadsFromIndex(locTextureAtlas.getCapacity() - totalParticles, totalParticles);
        }

        // make room for quads, not necessary for last child
        // 给quads让出地方，最后一个子元素不用
        if (pSystem.getAtlasIndex() + totalParticles != totalQuads)
            locTextureAtlas.moveQuadsFromIndex(index, index + totalParticles);

        // increase totalParticles here for new particles, update method of particlesystem will fill the quads
        // 为新的粒子增加totalParticles，particlesystem的更新方法将会填充quads
        locTextureAtlas.increaseTotalQuadsWith(totalParticles);
        this._updateAllAtlasIndexes();
    },

    /**
     * @param {cc.ParticleSystem} child
     * @param {Boolean} cleanup
     */
    removeChild:function (child, cleanup) {
        // explicit nil handling 明确为空处理
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
        // remove child helper 移除子元素的helper方法
        locTextureAtlas.removeQuadsAtIndex(child.getAtlasIndex(), child.getTotalParticles());

        // after memmove of data, empty the quads at the end of array  当数据的块拷贝之后，清空数组最后的quads
        locTextureAtlas.fillWithEmptyQuadsFromIndex(locTextureAtlas.totalQuads, child.getTotalParticles());

        // paticle could be reused for self rendering 粒子能够被重用为了自我渲染
        child.setBatchNode(null);

        this._updateAllAtlasIndexes();
    },

    /**
     * Reorder will be done in this function, no "lazy" reorder to particles
     * 在这个函数中重新排序会被完成，particles没有懒排序
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

        // no reordering if only 1 child 如果只有一个子元素不用重新排序
        if (this._children.length > 1) {
            var getIndexes = this._getCurrentIndex(child, zOrder);

            if (getIndexes.oldIndex != getIndexes.newIndex) {
                // reorder m_pChildren.array
                this._children.splice(getIndexes.oldIndex, 1)
                this._children.splice(getIndexes.newIndex, 0, child);

                // save old altasIndex 保存旧的地图集索引
                var oldAtlasIndex = child.getAtlasIndex();

                // update atlas index 更新地图集索引
                this._updateAllAtlasIndexes();

                // Find new AtlasIndex 查找新的地图集索引
                var newAtlasIndex = 0;
                var locChildren = this._children;
                for (var i = 0; i < locChildren.length; i++) {
                    var pNode = locChildren[i];
                    if (pNode == child) {
                        newAtlasIndex = child.getAtlasIndex();
                        break;
                    }
                }

                // reorder textureAtlas quads 重新排序纹理地图集的quads
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
     * disables a particle by inserting a 0'd quad into the texture atlas
     * 禁用一个particle 通过插入一个0'd quad 到纹理地图集
     * @param {Number} particleIndex
     */
    disableParticle:function (particleIndex) {
        var quad = this.textureAtlas.quads[particleIndex];
        quad.br.vertices.x = quad.br.vertices.y = quad.tr.vertices.x = quad.tr.vertices.y =
            quad.tl.vertices.x = quad.tl.vertices.y = quad.bl.vertices.x = quad.bl.vertices.y = 0.0;
        this.textureAtlas._setDirty(true);
    },

    /**
     * Render function using the canvas 2d context or WebGL context, internal usage only, please do not call this function
     * 渲染函数使用canvas 2d 上下文或者WebGL 上下文，如果只有内部调用，请不要调用此函数
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
     * returns the used texture
     * @return {cc.Texture2D|HTMLImageElement|HTMLCanvasElement}
     */
    getTexture:function () {
        return this.textureAtlas.texture;
    },

    /**
     * sets a new texture. it will be retained 设置新的纹理，将会被保留
     * @param {cc.Texture2D|HTMLImageElement|HTMLCanvasElement} texture
     */
    setTexture:function (texture) {
        this.textureAtlas.texture = texture;

        // If the new texture has No premultiplied alpha, AND the blendFunc hasn't been changed, then update it 
        // 如果新的纹理没有阿尔法通道并且blend函数没有变化，那么更新blend函数
        var locBlendFunc = this._blendFunc;
        if (texture && !texture.hasPremultipliedAlpha() && ( locBlendFunc.src == cc.BLEND_SRC && locBlendFunc.dst == cc.BLEND_DST )) {
            locBlendFunc.src = cc.SRC_ALPHA;
            locBlendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        }
    },

    /**
     * set the blending function used for the texture
     * 设置供texture使用的blending函数
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
     * returns the blending function used for the texture
     * 返回供texture使用的blending函数
     * @return {cc.BlendFunc}
     */
    getBlendFunc:function () {
        return {src:this._blendFunc.src, dst:this._blendFunc.dst};
    },

    // override visit. 重写visit函数
    // Don't call visit on it's children 不要在它的子元素里调用visit函数
    /**
     * Recursive method that visit its children and draw them
     * 访问CCParticleBatchNode子元素和绘制它们的递归方法
     * @function
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx
     */
    visit:function (ctx) {
        if (cc._renderType === cc._RENDER_TYPE_CANVAS)
            return;

        // CAREFUL: 注意：
        // This visit is almost identical to cc.Node#visit visit函数几乎和cc.Node的visit函数一样
        // with the exception that it doesn't call visit on it's children 除了不要在它的子元素里调用visit函数
        //
        // The alternative is to have a void cc.Sprite#visit, but 尽管还有一个返回值是void的cc.Sprite的visit函数可选
        // although this is less mantainable, is faster 但是这个是更少的维护，更快的函数。
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
            // serious problems
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
            // new index
            if (pNode.zIndex > z && !foundNewIdx) {
                newIndex = i;
                foundNewIdx = true;

                if (foundCurrentIdx && foundNewIdx)
                    break;
            }
            // current index
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
    //     don't use lazy sorting, reordering the particle systems quads afterwards would be too complex                                    <br/>
    //     不要用懒排序，渲染粒子系统的quads会变得太复杂
    //     XXX research whether lazy sorting + freeing current quads and calloc a new block with size of capacity would be faster           <br/>
    //	   XXX 调查显示不管懒排序+释放当前quads并且分配一个新的一定容量的内存块会更快点
    //     XXX or possibly using vertexZ for reordering, that would be fastest                                                              <br/>
    //     XXX 还是用vertexZ 渲染可能更快
    //     this helper is almost equivalent to CCNode's addChild, but doesn't make use of the lazy sorting                                  <br/>
    //     这个helper函数几乎和CCNode's的addChild函数一样，但是不要利用懒排序
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

        //don't use a lazy insert
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
     * return the texture atlas used for drawing the quads 返回为绘制quads使用的纹理地图集
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas:function () {
        return this.textureAtlas;
    },

    /**
     * set the texture atlas used for drawing the quads 设置为绘制quads使用的纹理地图集
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

// Extended properties 扩展属性
/** @expose */
_p.texture;
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);


/**
 * initializes the particle system with the name of a file on disk (for a list of supported formats look at the cc.Texture2D class), a capacity of particles
 * 用磁盘上的文件名称（支持的列表格式请查阅cc.Texture2D类）和particles的容量作为参数初始化粒子系统
 * @deprecated since v3.0 please use new cc.ParticleBatchNode(filename, capacity) instead. 自v3.0后请用 new cc.ParticleBatchNode(filename, capacity) 代替。
 * @param {String|cc.Texture2D} fileImage
 * @param {Number} capacity
 * @return {cc.ParticleBatchNode}
 */
cc.ParticleBatchNode.create = function (fileImage, capacity) {
    return new cc.ParticleBatchNode(fileImage, capacity);
};

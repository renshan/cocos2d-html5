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
 * @constant
 * @type Number
 */
cc.DEFAULT_SPRITE_BATCH_CAPACITY = 29;

 /**
 * <p>
 *     在Canvas渲染模式下，如果cc.SpriteBatchNodeCanvas包括子节点，那么它的特性将和一个普通的结点相同            <br/>   
 *     如果它的_useCache被设置为true，就可以缓存所有SpriteBatchNode的子节点到画布中 <br/>  
 *    （这就是通常所说的“批量渲染”）<br/>
 *     <br/>
 *     一个cc.SpriteBatchNode只能有一个纹理（一个图片文件或者一个纹理图集）.<br/>
 *     只有包含在这个纹理中的cc.Sprites才能够加入到cc.SpriteBatchNode中<br/>
 *     所有加入到cc.SpriteBatchNode中的cc.Sprites都会在同一次WebGL渲染调用中被渲染 <br/>
 *     如果cc.Sprites没有加入到一个cc.SpriteBatchNode中，那么每个cc.Sprite都将调用一次WebGL的渲染过程，这样效率会很低 <br/>
 *     <br/>
 *     限制:<br/>
 *       - 只有cc.Sprite类型或者继承于cc.Sprite类型的结点才可以加入 <br/>
 *          比如particles, labels 还有 layer都不能加入到cc.SpriteBatchNode中<br/>
 *       - 所有子节点要么是带有锯齿要么是防锯齿的，不能同时拥有两种类型的子节点<br/>
 *		   这是因为锯齿效果是纹理的一个属性，而所有在cc.SpriteBatchNode中的精灵都使用同一个纹理。</br>
 * </p>
 * @class
 * @extends cc.Node
 *
 * @param {String|cc.Texture2D} fileImage
 * @param {Number} capacity
 * @example
 *
 * // 1. 使用一个文件路径来新建一个spriteBatchNode
 * var spriteBatchNode = new cc.SpriteBatchNode("res/animations/grossini.png", 50);
 *
 * // 2. 使用一个纹理来新建一个spriteBatchNode
 * var texture = cc.textureCache.addImage("res/animations/grossini.png");
 * var spriteBatchNode = new cc.SpriteBatchNode(texture,50);
 *
 * @property {cc.TextureAtlas}  textureAtlas    - 纹理图集
 * @property {Array}            descendants     - <@readonly> 批处理结点的子节点
 */
cc.SpriteBatchNode = cc.Node.extend(/** @lends cc.SpriteBatchNode# */{
    textureAtlas: null,

    _blendFunc: null,
	// 所有其子节点，包括子节点的子节点，以此类推
    _descendants: null,
    _className: "SpriteBatchNode",

	/**
     * <p>
     *    这是与addQuadFromSprite相对的操作.<br/>
     *    这个函数将一个精灵加入子节点集合，但它不更新纹理图集<br/>
     * </p>
     * @param {cc.Sprite} child
     * @param {Number} z zOrder
     * @param {Number} aTag
     * @return {cc.SpriteBatchNode}
     */
    addSpriteWithoutQuad: function (child, z, aTag) {

        cc.assert(child, cc._LogInfos.SpriteBatchNode_addSpriteWithoutQuad_2);

        if (!(child instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.SpriteBatchNode_addSpriteWithoutQuad);
            return null;
        }

		// quad下标为Z
        child.atlasIndex = z;

		// 使用二进制查找来优化
        var i = 0, locDescendants = this._descendants;
        if (locDescendants && locDescendants.length > 0) {
            for (var index = 0; index < locDescendants.length; index++) {
                var obj = locDescendants[index];
                if (obj && (obj.atlasIndex >= z))
                    ++i;
            }
        }
        locDescendants.splice(i, 0, child);

		// 重要：调用父类方法而不是本身的addChild方法，防止加入到纹理图集的数组中
        cc.Node.prototype.addChild.call(this, child, z, aTag);

		//#issue 1262 不要使用lazy排序，瓦片图作为quads加入而不是sprites，所以sprites需要按照顺序加入
        this.reorderBatch(false);
        return this;
    },

	// 属性
    /**
     * 返回cc.SpriteBatchNode的纹理图集
     * @return {cc.TextureAtlas}
     */
    getTextureAtlas: function () {
        return this.textureAtlas;
    },

    /**
     * 设置纹理图集的方法
     * @param {cc.TextureAtlas} textureAtlas
     */
    setTextureAtlas: function (textureAtlas) {
        if (textureAtlas != this.textureAtlas) {
            this.textureAtlas = textureAtlas;
        }
    },

    /**
     * 返回cc.SpriteBatchNode的子节点
     * @return {Array}
     */
    getDescendants: function () {
        return  this._descendants;
    },

    /**
     * <p>
     *    Initializes a cc.SpriteBatchNode with a file image (.png, .jpeg, .pvr, etc) and a capacity of children.<br/>
     *    The capacity will be increased in 33% in runtime if it run out of space.<br/>
     *    The file will be loaded using the TextureMgr.<br/>
     *    Please pass parameters to constructor to initialize the sprite batch node, do not call this function yourself.
     * </p>
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
	 
	/**
     * <p>
     *    使用一个图像文件(.png, .jpeg, .pvr, 等格式)和容量(capacity)来初始化cc.SpriteBatchNode<br/> 
     *    在超出当前最大容量的时候，容量增加33%<br/>
     *    文件将会使用TextureMgr进行加载<br/>
     *    请使用构造函数来构造批处理结点，不要直接使用此函数初始化
     * </p>
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
    initWithFile: function (fileImage, capacity) {
        var texture2D = cc.textureCache.getTextureForKey(fileImage);
        if (!texture2D)
            texture2D = cc.textureCache.addImage(fileImage);
        return this.initWithTexture(texture2D, capacity);
    },

    _setNodeDirtyForCache: function () {
        this._cacheDirty = true;
    },

	/**
     * <p>
     *    使用一个图像文件(.png, .jpeg, .pvr, 等格式)和容量(capacity)来初始化cc.SpriteBatchNode<br/> 
     *    在超出当前最大容量的时候，容量增加33%<br/>
     *    文件将会使用TextureMgr进行加载<br/>
     *    请使用构造函数来构造批处理结点，不要直接使用此函数初始化
     * </p>
     * @param {String} fileImage
     * @param {Number} capacity
     * @return {Boolean}
     */
    init: function (fileImage, capacity) {
        var texture2D = cc.textureCache.getTextureForKey(fileImage);
        if (!texture2D)
            texture2D = cc.textureCache.addImage(fileImage);
        return this.initWithTexture(texture2D, capacity);
    },

    /**
     * 增加图集容量
     */
    increaseAtlasCapacity: function () {
		// 如果将要超出图集容量
		// 所有之前加入的精灵将需要重新定位他们的纹理坐标
		// 这可能增加计算量
        var locCapacity = this.textureAtlas.capacity;
        var quantity = Math.floor((locCapacity + 1) * 4 / 3);

        cc.log(cc._LogInfos.SpriteBatchNode_increaseAtlasCapacity, locCapacity, quantity);

        if (!this.textureAtlas.resizeCapacity(quantity)) {
			// 到这里说明出现了很严重的问题哦！
            cc.log(cc._LogInfos.SpriteBatchNode_increaseAtlasCapacity_2);
        }
    },

	/**
     * 根据给出的下标移除指定的子节点，并且根据给定的cleanup参数清除正在执行中的动作
     * @warning 在cc.SpriteBatchNode中移除一个sprite将会很慢
     * @param {Number} index
     * @param {Boolean} doCleanup
     */
    removeChildAtIndex: function (index, doCleanup) {
        this.removeChild(this._children[index], doCleanup);
    },

    /**
     * 重新设置所有子节点下标
     * @param {cc.Sprite} pobParent
     * @param {Number} index
     * @return {Number}
     */
    rebuildIndexInOrder: function (pobParent, index) {
        var children = pobParent.children;
        if (children && children.length > 0) {
            for (var i = 0; i < children.length; i++) {
                var obj = children[i];
                if (obj && (obj.zIndex < 0))
                    index = this.rebuildIndexInOrder(obj, index);
            }
        }
		// 忽略本身结点
        if (!pobParent == this) {
            pobParent.atlasIndex = index;
            index++;
        }
        if (children && children.length > 0) {
            for (i = 0; i < children.length; i++) {
                obj = children[i];
                if (obj && (obj.zIndex >= 0))
                    index = this.rebuildIndexInOrder(obj, index);
            }
        }
        return index;
    },

    /**
     * 返回子节点中最大的图集下标
     * @param {cc.Sprite} sprite
     * @return {Number}
     */
    highestAtlasIndexInChild: function (sprite) {
        var children = sprite.children;

        if (!children || children.length == 0)
            return sprite.atlasIndex;
        else
            return this.highestAtlasIndexInChild(children[children.length - 1]);
    },

    /**
     * 返回子节点中最小的图集下标
     * @param {cc.Sprite} sprite
     * @return {Number}
     */
    lowestAtlasIndexInChild: function (sprite) {
        var children = sprite.children;

        if (!children || children.length == 0)
            return sprite.atlasIndex;
        else
            return this.lowestAtlasIndexInChild(children[children.length - 1]);
    },

    /**
     * 返回子节点的图集下标
     * @param {cc.Sprite} sprite
     * @param {Number} nZ
     * @return {Number}
     */
    atlasIndexForChild: function (sprite, nZ) {
        var selParent = sprite.parent;
        var brothers = selParent.children;
        var childIndex = brothers.indexOf(sprite);

		// 忽略父节点Z，如果父节点是一个spriteSheet的话
        var ignoreParent = selParent == this;
        var previous = null;
        if (childIndex > 0 && childIndex < cc.UINT_MAX)
            previous = brothers[childIndex - 1];

		// 精灵集合的第一个子节点
        if (ignoreParent) {
            if (childIndex == 0)
                return 0;
            return this.highestAtlasIndexInChild(previous) + 1;
        }

		// 父节点是一个cc.Sprite,所以必须计算在内
		// 如果第一个子节点是cc.Sprite呢？
        if (childIndex == 0) {
            // less than parent and brothers
			// 小于父节点和兄弟结点
            if (nZ < 0)
                return selParent.atlasIndex;
            else
                return selParent.atlasIndex + 1;
        } else {
			// 如果之前的遍历的结点和当前结点属于同一个分支的话
            if ((previous.zIndex < 0 && nZ < 0) || (previous.zIndex >= 0 && nZ >= 0))
                return this.highestAtlasIndexInChild(previous) + 1;

            // else (previous < 0 and sprite >= 0 )
            return selParent.atlasIndex + 1;
        }
    },

    /**
     * Sprites使用这个函数开始排列子结点，不要手动调用这个函数
     * @param {Boolean} reorder
     */
    reorderBatch: function (reorder) {
        this._reorderChildDirty = reorder;
    },

    /**
     * 设置纹理的源混合函数和目标混合函数
     * @param {Number | cc.BlendFunc} src
     * @param {Number} dst
     */
    setBlendFunc: function (src, dst) {
        if (dst === undefined)
            this._blendFunc = src;
        else
            this._blendFunc = {src: src, dst: dst};
    },

    /**
     * 返回纹理的混合方法
     * @return {cc.BlendFunc}
     */
    getBlendFunc: function () {
        return this._blendFunc;
    },

    /**
     * 重新排列子结点（重写了cc.Node的方法）
     * @override
     * @param {cc.Sprite} child
     * @param {Number} zOrder
     */
    reorderChild: function (child, zOrder) {

        cc.assert(child, cc._LogInfos.SpriteBatchNode_reorderChild_2);

        if (this._children.indexOf(child) === -1) {
            cc.log(cc._LogInfos.SpriteBatchNode_reorderChild);
            return;
        }

        if (zOrder === child.zIndex)
            return;

		//设置z-order，随后进行排列
        cc.Node.prototype.reorderChild.call(this, child, zOrder);
        this.setNodeDirty();
    },

    /**
     * 从cc.SpriteBatchNode中移除子节点（重写了cc.Node的removeChild方法）
     * @param {cc.Sprite} child
     * @param {Boolean} cleanup
     */
    removeChild: function (child, cleanup) {
		// 处理空值情况
        if (child == null)
            return;
        if (this._children.indexOf(child) === -1) {
            cc.log(cc._LogInfos.SpriteBatchNode_removeChild);
            return;
        }

		// 在移除之前清理
        this.removeSpriteFromAtlas(child);
        cc.Node.prototype.removeChild.call(this, child, cleanup);
    },

    _textureForCanvas: null,
    _useCache: false,
    _originalTexture: null,

    ctor: null,

    _ctorForCanvas: function (fileImage, capacity) {
        cc.Node.prototype.ctor.call(this);

        var texture2D;
        capacity = capacity || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
        if (cc.isString(fileImage)) {
            texture2D = cc.textureCache.getTextureForKey(fileImage);
            if (!texture2D)
                texture2D = cc.textureCache.addImage(fileImage);
        }
        else if (fileImage instanceof cc.Texture2D)
            texture2D = fileImage;

        texture2D && this.initWithTexture(texture2D, capacity);
    },

    _ctorForWebGL: function (fileImage, capacity) {
        cc.Node.prototype.ctor.call(this);

        var texture2D;
        capacity = capacity || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
        if (cc.isString(fileImage)) {
            texture2D = cc.textureCache.getTextureForKey(fileImage);
            if (!texture2D)
                texture2D = cc.textureCache.addImage(fileImage);
        } else if (fileImage instanceof cc.Texture2D)
            texture2D = fileImage;
        texture2D && this.initWithTexture(texture2D, capacity);
    },

    _initRendererCmd: function(){
         if(cc._renderType === cc._RENDER_TYPE_WEBGL)
            this._rendererCmd = new cc.SpriteBatchNodeRenderCmdWebGL(this);
    },

	/**
     * <p>
     *   更新由下标指定的quad到纹理图集，精灵对象将不会加入到子节点数组中                <br/>
     *   当你处理一个非常大的精灵图集对象并且其他精灵对象不需要更新的时候才用到这个函数.<br/>
     *   比如：一个瓦片图(cc.TMXMap) 或者一个有很长内容的文字标签(BitmapFontAtlas)<br/>
     * </p>
     * @function
     * @param {cc.Sprite} sprite
     * @param {Number} index
     */
    updateQuadFromSprite: null,

    _updateQuadFromSpriteForCanvas: function (sprite, index) {

        cc.assert(sprite, cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite_2);

        if (!(sprite instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite);
            return;
        }

        //
        // 直接更新quad，不要添加精灵到场景图中
        sprite.batchNode = this;
        sprite.atlasIndex = index;

        sprite.dirty = true;
		// UpdateTransform更新纹理图集的quad
        sprite.updateTransform();
    },

    _updateQuadFromSpriteForWebGL: function (sprite, index) {

        cc.assert(sprite, cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite);

        if (!(sprite instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.CCSpriteBatchNode_updateQuadFromSprite);
            return;
        }

		// 创建需要的空间
        var locCapacity = this.textureAtlas.capacity;
        while (index >= locCapacity || locCapacity == this.textureAtlas.totalQuads) {
            this.increaseAtlasCapacity();
        }

        //
        // 直接更新quad，不要加入精灵到场景图像中
        sprite.batchNode = this;
        sprite.atlasIndex = index;

        sprite.dirty = true;
		// UpdateTransform更新纹理图集的quad
        sprite.updateTransform();
    },

    _swap: function (oldIndex, newIndex) {
        var locDescendants = this._descendants;
        var locTextureAtlas = this.textureAtlas;
        var quads = locTextureAtlas.quads;
        var tempItem = locDescendants[oldIndex];
        var tempIteQuad = cc.V3F_C4B_T2F_QuadCopy(quads[oldIndex]);

		//更新另外一个交换对象的下标
        locDescendants[newIndex].atlasIndex = oldIndex;
        locDescendants[oldIndex] = locDescendants[newIndex];

        locTextureAtlas.updateQuad(quads[newIndex], oldIndex);
        locDescendants[newIndex] = tempItem;
        locTextureAtlas.updateQuad(tempIteQuad, newIndex);
    },

	/**
     * <p>
     *   更新由下标指定的quad到纹理图集，精灵对象将不会加入到子节点数组中                <br/>
     *   当你处理一个非常大的精灵图集对象并且其他精灵对象不需要更新的时候才用到这个函数.<br/>
     *   比如：一个瓦片图(cc.TMXMap)或者一个有很长内容的文字标签(cc.LabelBMFont)<br/>
     * </p>
     * @function
     * @param {cc.Sprite} sprite
     * @param {Number} index
     */
    insertQuadFromSprite: null,

    _insertQuadFromSpriteForCanvas: function (sprite, index) {

        cc.assert(sprite, cc._LogInfos.CCSpriteBatchNode_insertQuadFromSprite_2);

        if (!(sprite instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.CCSpriteBatchNode_insertQuadFromSprite);
            return;
        }

        //
        // 直接更新quad，不要把精灵加入场景图中
        sprite.batchNode = this;
        sprite.atlasIndex = index;

		// updateTransform同样会使用updateQuad来更新纹理图集
		// 所以应当在insertQuad之后调用
        sprite.dirty = true;
        sprite.updateTransform();
        sprite._setCachedParent(this);
        this._children.splice(index, 0, sprite);
    },

    _insertQuadFromSpriteForWebGL: function (sprite, index) {

        cc.assert(sprite, cc._LogInfos.Sprite_insertQuadFromSprite_2);

        if (!(sprite instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.Sprite_insertQuadFromSprite);
            return;
        }

		// 申请空间资源
        var locTextureAtlas = this.textureAtlas;
        while (index >= locTextureAtlas.capacity || locTextureAtlas.capacity === locTextureAtlas.totalQuads)
            this.increaseAtlasCapacity();

        //
        // 直接更新quad，不要将精灵加入场景图
        sprite.batchNode = this;
        sprite.atlasIndex = index;
        locTextureAtlas.insertQuad(sprite.quad, index);

		// updateTransform同样会使用updateQuad来更新纹理图集
		// 所以应当在insertQuad之后调用 
        sprite.dirty = true;
        sprite.updateTransform();
    },

    _updateAtlasIndex: function (sprite, curIndex) {
        var count = 0;
        var pArray = sprite.children;
        if (pArray)
            count = pArray.length;

        var oldIndex = 0;
        if (count === 0) {
            oldIndex = sprite.atlasIndex;
            sprite.atlasIndex = curIndex;
            sprite.arrivalOrder = 0;
            if (oldIndex != curIndex)
                this._swap(oldIndex, curIndex);
            curIndex++;
        } else {
            var needNewIndex = true;
            if (pArray[0].zIndex >= 0) {
                //all children are in front of the parent
                oldIndex = sprite.atlasIndex;
                sprite.atlasIndex = curIndex;
                sprite.arrivalOrder = 0;
                if (oldIndex != curIndex)
                    this._swap(oldIndex, curIndex);
                curIndex++;
                needNewIndex = false;
            }
            for (var i = 0; i < pArray.length; i++) {
                var child = pArray[i];
                if (needNewIndex && child.zIndex >= 0) {
                    oldIndex = sprite.atlasIndex;
                    sprite.atlasIndex = curIndex;
                    sprite.arrivalOrder = 0;
                    if (oldIndex != curIndex) {
                        this._swap(oldIndex, curIndex);
                    }
                    curIndex++;
                    needNewIndex = false;
                }
                curIndex = this._updateAtlasIndex(child, curIndex);
            }

            if (needNewIndex) {
				//所有子节点的zOrder都小于0
                oldIndex = sprite.atlasIndex;
                sprite.atlasIndex = curIndex;
                sprite.arrivalOrder = 0;
                if (oldIndex != curIndex) {
                    this._swap(oldIndex, curIndex);
                }
                curIndex++;
            }
        }

        return curIndex;
    },

    _updateBlendFunc: function () {
        if (!this.textureAtlas.texture.hasPremultipliedAlpha()) {
            this._blendFunc.src = cc.SRC_ALPHA;
            this._blendFunc.dst = cc.ONE_MINUS_SRC_ALPHA;
        }
    },

	/**
     * <p>
     *    使用texture2d和容量（capacity）初始化cc.SpriteBatchNode<br/>  
     *    超出运行时容量的时候容器容量将会自动增加33%<br/>	  
	 *    请使用批处理结点的构造函数来初始化，不要直接调用此函数
     * </p>
     * @function
     * @param {cc.Texture2D} tex
     * @param {Number} [capacity]
     * @return {Boolean}
     */
    initWithTexture: null,

    _initWithTextureForCanvas: function (tex, capacity) {
        this._children = [];
        this._descendants = [];

        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);

        this._originalTexture = tex;
        this._textureForCanvas = tex;
        return true;
    },

    _initWithTextureForWebGL: function (tex, capacity) {
        this._children = [];
        this._descendants = [];

        this._blendFunc = new cc.BlendFunc(cc.BLEND_SRC, cc.BLEND_DST);
        capacity = capacity || cc.DEFAULT_SPRITE_BATCH_CAPACITY;
        this.textureAtlas = new cc.TextureAtlas();
        this.textureAtlas.initWithTexture(tex, capacity);
        this._updateBlendFunc();
        this.shaderProgram = cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR);
        return true;
    },

    /**
     * 插入一个子节点
     * @param {cc.Sprite} sprite 插入的子精灵
     * @param {Number} index 插入的下标
     */
    insertChild: function (sprite, index) {
        sprite.batchNode = this;
        sprite.atlasIndex = index;
        sprite.dirty = true;

        var locTextureAtlas = this.textureAtlas;
        if (locTextureAtlas.totalQuads >= locTextureAtlas.capacity)
            this.increaseAtlasCapacity();

        locTextureAtlas.insertQuad(sprite.quad, index);
        this._descendants.splice(index, 0, sprite);

		// 更新下标
        var i = index + 1, locDescendant = this._descendants;
        if (locDescendant && locDescendant.length > 0) {
            for (; i < locDescendant.length; i++)
                locDescendant[i].atlasIndex++;
        }

		// 递归加入子节点
        var locChildren = sprite.children, child;
        if (locChildren) {
            for (i = 0, l = locChildren.length || 0; i < l; i++) {
                child = locChildren[i];
                if (child) {
                    var getIndex = this.atlasIndexForChild(child, child.zIndex);
                    this.insertChild(child, getIndex);
                }
            }
        }
    },

    /**
     * 在队尾加入子节点，比插入子节点执行速度快
     * @function
     * @param {cc.Sprite} sprite
     */
    appendChild: null,

    _appendChildForCanvas: function (sprite) {
        this._reorderChildDirty = true;
        sprite.batchNode = this;
        sprite.dirty = true;

        this._descendants.push(sprite);
        sprite.atlasIndex = this._descendants.length - 1;

		// 递归加入子节点
        var children = sprite.children;
        for (var i = 0, l = children.length || 0; i < l; i++)
            this.appendChild(children[i]);
    },

    _appendChildForWebGL: function (sprite) {
        this._reorderChildDirty = true;
        sprite.batchNode = this;
        sprite.dirty = true;

        this._descendants.push(sprite);
        var index = this._descendants.length - 1;
        sprite.atlasIndex = index;

        var locTextureAtlas = this.textureAtlas;
        if (locTextureAtlas.totalQuads == locTextureAtlas.capacity)
            this.increaseAtlasCapacity();
        locTextureAtlas.insertQuad(sprite.quad, index);

		// 递归加入子节点
        var children = sprite.children;
        for (var i = 0, l = children.length || 0; i < l; i++)
            this.appendChild(children[i]);
    },

    /**
     * 从纹理图集中移除精灵
     * @function
     * @param {cc.Sprite} sprite
     */
    removeSpriteFromAtlas: null,

    _removeSpriteFromAtlasForCanvas: function (sprite) {
		// 清除精灵，可以重用
        sprite.batchNode = null;
        var locDescendants = this._descendants;
        var index = locDescendants.indexOf(sprite);
        if (index != -1) {
            locDescendants.splice(index, 1)

			// 更新所有在此之前的精灵
            var len = locDescendants.length;
            for (; index < len; ++index) {
                var s = locDescendants[index];
                s.atlasIndex--;
            }
        }

		// 递归移除子节点
        var children = sprite.children;
        if (children) {
            for (var i = 0, l = children.length || 0; i < l; i++)
                children[i] && this.removeSpriteFromAtlas(children[i]);
        }
    },

    _removeSpriteFromAtlasForWebGL: function (sprite) {
        this.textureAtlas.removeQuadAtIndex(sprite.atlasIndex);   // 移除所有纹理图集

		// 清除精灵，可以重用
        sprite.batchNode = null;

        var locDescendants = this._descendants;
        var index = locDescendants.indexOf(sprite);
        if (index != -1) {
            locDescendants.splice(index, 1);

			// 更新所有在此之前的精灵
            var len = locDescendants.length;
            for (; index < len; ++index) {
                var s = locDescendants[index];
                s.atlasIndex--;
            }
        }

		// 递归移除子节点
        var children = sprite.children;
        if (children) {
            for (var i = 0, l = children.length || 0; i < l; i++)
                children[i] && this.removeSpriteFromAtlas(children[i]);
        }
    },
    // CCTextureProtocol
    /**
     * 返回批处理结点的纹理
     * @function
     * @return {cc.Texture2D|HTMLImageElement|HTMLCanvasElement}
     */
    getTexture: null,

    _getTextureForCanvas: function () {
        return this._textureForCanvas;
    },

    _getTextureForWebGL: function () {
        return this.textureAtlas.texture;
    },

    /**
     * 设置批处理结点的纹理
     * @function
     * @param {cc.Texture2D} texture
     */
    setTexture: null,

    _setTextureForCanvas: function (texture) {
        this._textureForCanvas = texture;
        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++)
            locChildren[i].texture = texture;
    },

    _setTextureForWebGL: function (texture) {
        this.textureAtlas.texture = texture;
        this._updateBlendFunc();
    },

    /**
     * 不要调用其子节点的visit方法（重写了cc.Node的visit）
     * @function
     * @override
     * @param {CanvasRenderingContext2D} ctx
     */
    visit: null,

    _visitForCanvas: function (ctx) {
        var context = ctx || cc._renderContext;
		// 如果不可见则直接返回
        if (!this._visible)
            return;

        context.save();
        this.transform(ctx);
        var i, locChildren = this._children;
        if (locChildren) {
            this.sortAllChildren();
            for (i = 0; i < locChildren.length; i++) {
                if (locChildren[i])
                    locChildren[i].visit(context);
            }
        }
        context.restore();
    },

    _visitForWebGL: function (ctx) {
        var gl = ctx || cc._renderContext;

		// 注意:
        // 这个visit方法基本和CocosNode的visit方法相同，
        // 不过并不访问其子节点
		// 可以用CCSprite的visit方法来访问
        // 尽管不太容易维护，但速度更快
        if (!this._visible)
            return;

        var currentStack = cc.current_stack;
        currentStack.stack.push(currentStack.top);
        cc.kmMat4Assign(this._stackMatrix, currentStack.top);
        currentStack.top = this._stackMatrix;

/*        var locGrid = this.grid;
        if (locGrid && locGrid.isActive()) {
            locGrid.beforeDraw();
            this.transformAncestors();
        }*/

        this.sortAllChildren();
        this.transform(gl);
        //this.draw(gl);
        if(this._rendererCmd)
            cc.renderer.pushRenderCommand(this._rendererCmd);

/*        if (locGrid && locGrid.isActive())
            locGrid.afterDraw(this);*/

		//优化javascript的性能
        currentStack.top = currentStack.stack.pop();
    },

    /**
     * 在批处理结点中添加一个子节点（重写了cc.Node的方法）
     * @function
     * @override
     * @param {cc.Sprite} child
     * @param {Number} [zOrder]
     * @param {Number} [tag]
     */
    addChild: null,

    _addChildForCanvas: function (child, zOrder, tag) {

        cc.assert(child != null, cc._LogInfos.CCSpriteBatchNode_addChild_3);

        if (!(child instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.CCSpriteBatchNode_addChild);
            return;
        }

        zOrder = (zOrder == null) ? child.zIndex : zOrder;
        tag = (tag == null) ? child.tag : tag;

        cc.Node.prototype.addChild.call(this, child, zOrder, tag);
        this.appendChild(child);
        this.setNodeDirty();
    },

    _addChildForWebGL: function (child, zOrder, tag) {

        cc.assert(child != null, cc._LogInfos.Sprite_addChild_6);

        if (!(child instanceof cc.Sprite)) {
            cc.log(cc._LogInfos.Sprite_addChild_4);
            return;
        }
        if (child.texture != this.textureAtlas.texture) {                    // 检查是否使用了同一个纹理id
            cc.log(cc._LogInfos.Sprite_addChild_5);
            return;
        }

        zOrder = (zOrder == null) ? child.zIndex : zOrder;
        tag = (tag == null) ? child.tag : tag;

        cc.Node.prototype.addChild.call(this, child, zOrder, tag);
        this.appendChild(child);
        this.setNodeDirty();
    },

    /**
	 * 从容器中移除了所有子节点，然后根据cleanup参数来决定是否清除所有正在执行的actions<br/>
	 * （重写了cc.Node的removeAllChildren方法）
     * @function
     * @param {Boolean} cleanup
     */
    removeAllChildren: null,

    _removeAllChildrenForCanvas: function (cleanup) {
		// 不正确的图集下标
		// useSelfRender应当在所有子节点及孙子结点中执行
        var locDescendants = this._descendants;
        if (locDescendants && locDescendants.length > 0) {
            for (var i = 0, len = locDescendants.length; i < len; i++) {
                if (locDescendants[i])
                    locDescendants[i].batchNode = null;
            }
        }

        cc.Node.prototype.removeAllChildren.call(this, cleanup);
        this._descendants.length = 0;
    },

    _removeAllChildrenForWebGL: function (cleanup) {
		// 不正确的图集下标
		// useSelfRender应当在所有子节点及孙子结点中执行
        var locDescendants = this._descendants;
        if (locDescendants && locDescendants.length > 0) {
            for (var i = 0, len = locDescendants.length; i < len; i++) {
                if (locDescendants[i])
                    locDescendants[i].batchNode = null;
            }
        }
        cc.Node.prototype.removeAllChildren.call(this, cleanup);
        this._descendants.length = 0;
        this.textureAtlas.removeAllQuads();
    },

    /**
     * 对所有子节点进行排序（重写了cc.Node的方法）
     */
    sortAllChildren: null,

    _sortAllChildrenForCanvas: function () {
        if (this._reorderChildDirty) {
            var i, j = 0, locChildren = this._children;
            var length = locChildren.length, tempChild;
			//插入排序
            for (i = 1; i < length; i++) {
                var tempItem = locChildren[i];
                j = i - 1;
                tempChild = locChildren[j];

				//如果当前结点的zOrder小于子节点的zOrder，或者当两者相等时当前结点的mutatedIndex较小，那么继续向下移动元素
                while (j >= 0 && ( tempItem._localZOrder < tempChild._localZOrder ||
                    ( tempItem._localZOrder == tempChild._localZOrder && tempItem.arrivalOrder < tempChild.arrivalOrder ))) {
                    locChildren[j + 1] = tempChild;
                    j = j - 1;
                    tempChild = locChildren[j];
                }
                locChildren[j + 1] = tempItem;
            }

			//检查所有子节点
            if (locChildren.length > 0) {
				//首先基于zOrder对所有子节点进行递归排序
                this._arrayMakeObjectsPerformSelector(locChildren, cc.Node._stateCallbackType.sortAllChildren);
            }
            this._reorderChildDirty = false;
        }
    },

    _sortAllChildrenForWebGL: function () {
        if (this._reorderChildDirty) {
            var childrenArr = this._children;
            var i, j = 0, length = childrenArr.length, tempChild;
			//插入排序
            for (i = 1; i < length; i++) {
                var tempItem = childrenArr[i];
                j = i - 1;
                tempChild = childrenArr[j];

				//如果当前结点的zOrder小于子节点的zOrder，或者当两者相等时当前结点的mutatedIndex较小，那么继续向下移动元素
                while (j >= 0 && ( tempItem._localZOrder < tempChild._localZOrder ||
                    ( tempItem._localZOrder == tempChild._localZOrder && tempItem.arrivalOrder < tempChild.arrivalOrder ))) {
                    childrenArr[j + 1] = tempChild;
                    j = j - 1;
                    tempChild = childrenArr[j];
                }
                childrenArr[j + 1] = tempItem;
            }

			//检查所有子节点
            if (childrenArr.length > 0) {
				//首先基于zOrder对所有子节点进行递归排序
                this._arrayMakeObjectsPerformSelector(childrenArr, cc.Node._stateCallbackType.sortAllChildren);

                var index = 0;
				//快速分配，基于他们相对的zOrder给每个子节点一个新的图集下标（保持父子关系的完整性）
				//同时重新对子节点的下标进行重新排序
                for (i = 0; i < childrenArr.length; i++)
                    index = this._updateAtlasIndex(childrenArr[i], index);
            }
            this._reorderChildDirty = false;
        }
    },

    /**
     * 渲染出批处理结点（重写了cc.Node的方法）
     * @function
     */
    draw: null,

    _drawForWebGL: function () {
		// 优化：快速分配
        if (this.textureAtlas.totalQuads === 0)
            return;

        //cc.nodeDrawSetup(this);
        this._shaderProgram.use();
        this._shaderProgram.setUniformForModelViewAndProjectionMatrixWithMat4();
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.updateTransform);
        cc.glBlendFunc(this._blendFunc.src, this._blendFunc.dst);

        this.textureAtlas.drawQuads();
    }
});

var _p = cc.SpriteBatchNode.prototype;

if (cc._renderType === cc._RENDER_TYPE_WEBGL) {
    _p.ctor = _p._ctorForWebGL;
    _p.updateQuadFromSprite = _p._updateQuadFromSpriteForWebGL;
    _p.insertQuadFromSprite = _p._insertQuadFromSpriteForWebGL;
    _p.initWithTexture = _p._initWithTextureForWebGL;
    _p.appendChild = _p._appendChildForWebGL;
    _p.removeSpriteFromAtlas = _p._removeSpriteFromAtlasForWebGL;
    _p.getTexture = _p._getTextureForWebGL;
    _p.setTexture = _p._setTextureForWebGL;
    _p.visit = _p._visitForWebGL;
    _p.addChild = _p._addChildForWebGL;
    _p.removeAllChildren = _p._removeAllChildrenForWebGL;
    _p.sortAllChildren = _p._sortAllChildrenForWebGL;
    _p.draw = _p._drawForWebGL;
} else {
    _p.ctor = _p._ctorForCanvas;
    _p.updateQuadFromSprite = _p._updateQuadFromSpriteForCanvas;
    _p.insertQuadFromSprite = _p._insertQuadFromSpriteForCanvas;
    _p.initWithTexture = _p._initWithTextureForCanvas;
    _p.appendChild = _p._appendChildForCanvas;
    _p.removeSpriteFromAtlas = _p._removeSpriteFromAtlasForCanvas;
    _p.getTexture = _p._getTextureForCanvas;
    _p.setTexture = _p._setTextureForCanvas;
    _p.visit = _p._visitForCanvas;
    _p.removeAllChildren = _p._removeAllChildrenForCanvas;
    _p.addChild = _p._addChildForCanvas;
    _p.sortAllChildren = _p._sortAllChildrenForCanvas;
    _p.draw = cc.Node.prototype.draw;
}

// 重写属性
cc.defineGetterSetter(_p, "texture", _p.getTexture, _p.setTexture);

// 扩展属性
/** @expose */
_p.descendants;
cc.defineGetterSetter(_p, "descendants", _p.getDescendants);


/**
 * <p>
 *    使用一个图片文件（.png, .jpg等格式）生成一个cc.SpriteBatchNodeCanvas，默认容器大小是29个子节点<br/>
 *	  容器将在运行时超出最大容量后增加33%的容量。<br/>
 *    文件将会使用TextureMgr来加载<br/> 
 * </p>
 * @deprecated v3.0版本后请使用新的构造函数
 * @see cc.SpriteBatchNode
 * @param {String|cc.Texture2D} fileImage
 * @param {Number} capacity
 * @return {cc.SpriteBatchNode}
 */
cc.SpriteBatchNode.create = function (fileImage, capacity) {
    return new cc.SpriteBatchNode(fileImage, capacity);
};

/**
 * @deprecated v3.0版本之后，请使用新的构造函数
 * @see cc.SpriteBatchNode
 * @function
 */
cc.SpriteBatchNode.createWithTexture = cc.SpriteBatchNode.create;
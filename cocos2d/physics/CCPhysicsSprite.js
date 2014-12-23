/**
 * Copyright (c) 2012 Scott Lembcke and Howling Moon Software
 * Copyright (c) 2008-2010 Ricardo Quesada
 * Copyright (c) 2011-2012 cocos2d-x.org
 * Copyright (c) 2013-2014 Chukong Technologies Inc.
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
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

 /** 精灵(cc.Sprite)的子类，绑定到一个物理Body
 支持以下几个物理引擎：
 - Chipmunk： 需要定义预处理器宏 CC_ENABLE_CHIPMUNK_INTEGRATION
 - ObjectiveChipmunk：需要定义预处理器宏 CC_ENABLE_CHIPMUNK_INTEGRATION
 - Box2d：需要定义预处理器宏 CC_ENABLE_BOX2D_INTEGRATION
 
 特性和限制：
 - 缩放（Scale）和偏移（Skew）属性被忽略；
 - 位置（Position）和旋转（Rotation）将更新物理刚体；
 - 如果你手动更新了位置和旋转，物理刚体会被更新；
 - 你不能同时启用Chipmunk和Box2d两个引擎的支持，在编译时只能启用一种。
 */
(function () {
    var box2dAPI = {
        _ignoreBodyRotation:false,
        _body:null,
        _PTMRatio:32,
        _rotation:1,
        /**
         * Create a PhysicsSprite with filename and rect
         * Constructor of cc.PhysicsSprite for Box2d
         * @param {String|cc.Texture2D|cc.SpriteFrame} fileName
         * @param {cc.Rect} rect
         * @example
         *
         * 1.Create a sprite with image path and rect
         * var physicsSprite1 = new cc.PhysicsSprite("res/HelloHTML5World.png");
         * var physicsSprite2 = new cc.PhysicsSprite("res/HelloHTML5World.png",cc.rect(0,0,480,320));
         *
         * 2.Create a sprite with a sprite frame name. Must add "#" before fame name.
         * var physicsSprite = new cc.PhysicsSprite('#grossini_dance_01.png');
         *
         * 3.Create a sprite with a sprite frame
         * var spriteFrame = cc.spriteFrameCache.getSpriteFrame("grossini_dance_01.png");
         * var physicsSprite = new cc.PhysicsSprite(spriteFrame);
         *
         * 4.Creates a sprite with an exsiting texture contained in a CCTexture2D object
         *      After creation, the rect will be the size of the texture, and the offset will be (0,0).
         * var texture = cc.textureCache.addImage("HelloHTML5World.png");
         * var physicsSprite1 = new cc.PhysicsSprite(texture);
         * var physicsSprite2 = new cc.PhysicsSprite(texture, cc.rect(0,0,480,320));
         *
         */
         /**
         * 通过文件名和矩形创建物理精灵
         * 针对Box2d的cc.PhysicsSprite构造函数
         * @param {String|cc.Texture2D|cc.SpriteFrame} fileName
         * @param {cc.Rect} rect
         * @example
         *
         * 1.通过图片路径和矩形创建精灵
         * var physicsSprite1 = new cc.PhysicsSprite("res/HelloHTML5World.png");
         * var physicsSprite2 = new cc.PhysicsSprite("res/HelloHTML5World.png",cc.rect(0,0,480,320));
         *
         * 2.通过精灵帧（sprite frame）名创建精灵。在帧名之前需要添加“#”
         * var physicsSprite = new cc.PhysicsSprite('#grossini_dance_01.png');
         *
         * 3.通过精灵帧创建精灵
         * var spriteFrame = cc.spriteFrameCache.getSpriteFrame("grossini_dance_01.png");
         * var physicsSprite = new cc.PhysicsSprite(spriteFrame);
         *
         * 4.通过一个已经存在的CCTexture2D对象中包含的纹理（textture）创建精灵
         *      创建之后，矩形的大小将使用纹理的大小，偏移是（0,0）
         * var texture = cc.textureCache.addImage("HelloHTML5World.png");
         * var physicsSprite1 = new cc.PhysicsSprite(texture);
         * var physicsSprite2 = new cc.PhysicsSprite(texture, cc.rect(0,0,480,320));
         *
         */
        ctor:function(fileName, rect){
            cc.Sprite.prototype.ctor.call(this);

            if (fileName === undefined) {
                cc.PhysicsSprite.prototype.init.call(this);
            }else if (cc.isString(fileName)) {
                if (fileName[0] === "#") {
                    //init with a sprite frame name
                    var frameName = fileName.substr(1, fileName.length - 1);
                    var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameName);
                    this.initWithSpriteFrame(spriteFrame);
                } else {
                    //init  with filename and rect
                    this.init(fileName, rect);
                }
            }else if (cc.isObject(fileName)) {
                if (fileName instanceof cc.Texture2D) {
                    //init  with texture and rect
                    this.initWithTexture(fileName, rect);
                } else if (fileName instanceof cc.SpriteFrame) {
                    //init with a sprite frame
                    this.initWithSpriteFrame(fileName);
                }
            }
            //this._transformCmd = new cc.PhysicsSpriteTransformCmdCanvas(this);
            //cc.rendererCanvas.pushRenderCommand(this._transformCmd);
        },

        //visit: function(){
        //    cc.Sprite.prototype.visit.call(this);
        //    cc.rendererCanvas.pushRenderCommand(this._transformCmd);
        //},

        /**
         * set body
         * @param {Box2D.Dynamics.b2Body} body
         */
        /**
         * 设置物理body
         * @param {Box2D.Dynamics.b2Body} body
         */
        setBody:function (body) {
            this._body = body;
        },

        /**
         * get body
         * @return {Box2D.Dynamics.b2Body}
         */
        /**
         * 获取物理body
         * @return {Box2D.Dynamics.b2Body}
         */
        getBody:function () {
            return this._body;
        },

        /**
         * set PTM ratio
         * @param {Number} r
         */
        /**
         * 设置 PTM ratio
         * @param {Number} r
         */
        setPTMRatio:function (r) {
            this._PTMRatio = r;
        },

        /**
         * get PTM ration
         * @return {Number}
         */
        /**
         * 获取 PTM ration
         * @return {Number}
         */
        getPTMRatio:function () {
            return this._PTMRatio;
        },

        /**
         * get position
         * @return {cc.Point}
         */
        /**
         * 获取位置
         * @return {cc.Point}
         */
        getPosition:function () {
            var pos = this._body.GetPosition();
            var locPTMRatio =this._PTMRatio;
            return cc.p(pos.x * locPTMRatio, pos.y * locPTMRatio);
        },

        /**
         * set position
         * @param {cc.Point} p
         */
         /**
         * 设置位置
         * @param {cc.Point} p
         */
        setPosition:function (p) {
            var angle = this._body.GetAngle();
            var locPTMRatio =this._PTMRatio;
            this._body.setTransform(Box2D.b2Vec2(p.x / locPTMRatio, p.y / locPTMRatio), angle);
            this.setNodeDirty();
        },

        /**
         * get rotation
         * @return {Number}
         */
         /**
         * 获取旋转
         * @return {Number}
         */
        getRotation:function () {
            return (this._ignoreBodyRotation ? cc.radiansToDegrees(this._rotationRadians) : cc.radiansToDegrees(this._body.GetAngle()));
        },

        /**
         * set rotation
         * @param {Number} r
         */
         /**
         * 设置旋转
         * @param {Number} r
         */
        setRotation:function (r) {
            if (this._ignoreBodyRotation) {
                this._rotation = r;
            } else {
                var locBody = this._body;
                var p = locBody.GetPosition();
                locBody.SetTransform(p, cc.degreesToRadians(r));
            }
            this.setNodeDirty();
        },
        _syncPosition:function () {
            var pos = this._body.GetPosition();
            this._position.x = pos.x * this._PTMRatio;
            this._position.y = pos.y * this._PTMRatio;
            this._rotationRadians = this._rotation * (Math.PI / 180);
        },
        _syncRotation:function () {
            this._rotationRadians = this._body.GetAngle();
        },
        /**
         * visit
         */
        visit:function () {
            if (this._body && this._PTMRatio) {
                this._syncPosition();
                if (!this._ignoreBodyRotation)
                    this._syncRotation();
            }
            else {
                cc.log("PhysicsSprite body or PTIMRatio was not set");
            }
            this._super();
        },

        /**
         * set whether to ingore body's rotation
         * @param {Boolean} b
         */
         /**
         * 设置是否忽略body的旋转
         * @param {Boolean} b
         */
        setIgnoreBodyRotation: function(b) {
            this._ignoreBodyRotation = b;
        }
    };

    var chipmunkAPI = {
        _ignoreBodyRotation:false,
        _body:null, //physics body
        _rotation:1,

        /**
         * Create a PhysicsSprite with filename and rect
         * Constructor of cc.PhysicsSprite for chipmunk
         * @param {String|cc.Texture2D|cc.SpriteFrame} fileName
         * @param {cc.Rect} rect
         * @example
         *
         * 1.Create a sprite with image path and rect
         * var physicsSprite1 = new cc.PhysicsSprite("res/HelloHTML5World.png");
         * var physicsSprite2 = new cc.PhysicsSprite("res/HelloHTML5World.png",cc.rect(0,0,480,320));
         *
         * 2.Create a sprite with a sprite frame name. Must add "#" before frame name.
         * var physicsSprite = new cc.PhysicsSprite('#grossini_dance_01.png');
         *
         * 3.Create a sprite with a sprite frame
         * var spriteFrame = cc.spriteFrameCache.getSpriteFrame("grossini_dance_01.png");
         * var physicsSprite = new cc.PhysicsSprite(spriteFrame);
         *
         * 4.Creates a sprite with an exsiting texture contained in a CCTexture2D object
         *      After creation, the rect will be the size of the texture, and the offset will be (0,0).
         * var texture = cc.textureCache.addImage("HelloHTML5World.png");
         * var physicsSprite1 = new cc.PhysicsSprite(texture);
         * var physicsSprite2 = new cc.PhysicsSprite(texture, cc.rect(0,0,480,320));
         *
         */
         /**
         * 通过文件名和矩形创建物理精灵
         * 针对Chipmunk的cc.PhysicsSprite构造函数
         * @param {String|cc.Texture2D|cc.SpriteFrame} fileName
         * @param {cc.Rect} rect
         * @example
         *
         * 1.通过图片路径和矩形创建精灵
         * var physicsSprite1 = new cc.PhysicsSprite("res/HelloHTML5World.png");
         * var physicsSprite2 = new cc.PhysicsSprite("res/HelloHTML5World.png",cc.rect(0,0,480,320));
         *
         * 2.通过精灵帧（sprite frame）名创建精灵。在帧名之前需增加“#”。
         * var physicsSprite = new cc.PhysicsSprite('#grossini_dance_01.png');
         *
         * 3.通过精灵帧创建精灵
         * var spriteFrame = cc.spriteFrameCache.getSpriteFrame("grossini_dance_01.png");
         * var physicsSprite = new cc.PhysicsSprite(spriteFrame);
         *
         * 4.通过一个已经存在的CCTexture2D对象中包含的纹理（textture）创建精灵
         *      创建之后，矩形的大小将使用纹理的大小，偏移是（0,0）
         * var texture = cc.textureCache.addImage("HelloHTML5World.png");
         * var physicsSprite1 = new cc.PhysicsSprite(texture);
         * var physicsSprite2 = new cc.PhysicsSprite(texture, cc.rect(0,0,480,320));
         *
         */
        ctor:function(fileName, rect){
            cc.Sprite.prototype.ctor.call(this);

            if (fileName === undefined) {
                cc.PhysicsSprite.prototype.init.call(this);
            }else if (cc.isString(fileName)) {
                if (fileName[0] === "#") {
                    //init with a sprite frame name
                    var frameName = fileName.substr(1, fileName.length - 1);
                    var spriteFrame = cc.spriteFrameCache.getSpriteFrame(frameName);
                    this.initWithSpriteFrame(spriteFrame);
                } else {
                    //init  with filename and rect
                    this.init(fileName, rect);
                }
            }else if (cc.isObject(fileName)) {
                if (fileName instanceof cc.Texture2D) {
                    //init  with texture and rect
                    this.initWithTexture(fileName, rect);
                } else if (fileName instanceof cc.SpriteFrame) {
                    //init with a sprite frame
                    this.initWithSpriteFrame(fileName);
                }
            }

            if(cc._renderType === cc._RENDER_TYPE_CANVAS)
                this._transformCmd = new cc.CustomRenderCmdCanvas(this, function(){
                    if (this.transform) {
                        this.transform();
                    }
                });
            else
                this._transformCmd = new cc.CustomRenderCmdWebGL(this, function(){
                    if(this._transformForRenderer){
                        this._transformForRenderer();
                    }
                });
            cc.renderer.pushRenderCommand(this._transformCmd);
        },

        visit: function(){
            cc.renderer.pushRenderCommand(this._transformCmd);
            cc.Sprite.prototype.visit.call(this);
        },

        /**
         * set body
         * @param {cp.Body} body
         */
        /**
         * 设置 body
         * @param {cp.Body} body
         */
        setBody:function (body) {
            this._body = body;
        },

        /**
         * get body
         * @returns {cp.Body}
         */
        /**
         * 获取 body
         * @returns {cp.Body}
         */
        getBody:function () {
            return this._body;
        },

        /**
         * get position
         * @return {cc.Point}
         */
        /**
         * 获取位置
         * @return {cc.Point}
         */
        getPosition:function () {
            var locBody = this._body;
            return {x:locBody.p.x, y:locBody.p.y};
        },

        /**
         * get position x
         * @return {Number}
         */
        /**
         * 获取位置的x坐标
         * @return {Number}
         */
        getPositionX:function () {
            return this._body.p.x;
        },

        /**
         * get position y
         * @return {Number}
         */
        /**
         * 获取位置的y坐标
         * @return {Number}
         */
        getPositionY:function () {
            return this._body.p.y;
        },

        /**
         * set position
         * @param {cc.Point|Number}newPosOrxValue
         * @param {Number}yValue
         */
        /**
         * 设置位置
         * @param {cc.Point|Number}newPosOrxValue
         * @param {Number}yValue
         */
        setPosition:function (newPosOrxValue, yValue) {
            if (yValue === undefined) {
                this._body.p.x = newPosOrxValue.x;
                this._body.p.y = newPosOrxValue.y;
            } else {
                this._body.p.x = newPosOrxValue;
                this._body.p.y = yValue;
            }
            //this._syncPosition();
        },

        /**
         * set position x
         * @param {Number} xValue
         */
        /**
         * 设置位置的x坐标
         * @param {Number} xValue
         */
        setPositionX:function (xValue) {
            this._body.p.x = xValue;
            //this._syncPosition();
        },

        /**
         * set position y
         * @param {Number} yValue
         */
        /**
         * 设置位置的y坐标
         * @param {Number} yValue
         */
        setPositionY:function (yValue) {
            this._body.p.y = yValue;
            //this._syncPosition();
        },

        _syncPosition:function () {
            var locPosition = this._position, locBody = this._body;
            if (locPosition.x != locBody.p.x || locPosition.y != locBody.p.y) {
                cc.Sprite.prototype.setPosition.call(this, locBody.p.x, locBody.p.y);
            }
        },

        /**
         * get rotation
         * @return {Number}
         */
        /**
         * 获取旋转
         * @return {Number}
         */
        getRotation:function () {
            return this._ignoreBodyRotation ? cc.radiansToDegrees(this._rotationRadiansX) : -cc.radiansToDegrees(this._body.a);
        },

        /**
         * set rotation
         * @param {Number} r
         */
        /**
         * 设置旋转
         * @param {Number} r
         */
        setRotation:function (r) {
            if (this._ignoreBodyRotation) {
                cc.Sprite.prototype.setRotation.call(this, r);
            } else {
                this._body.a = -cc.degreesToRadians(r);
                //this._syncRotation();
            }
        },
        _syncRotation:function () {
            if (this._rotationRadiansX != -this._body.a) {
                cc.Sprite.prototype.setRotation.call(this, -cc.radiansToDegrees(this._body.a));
            }
        },
        /**
         * @deprecated since v3.0, please use getNodeToParentTransform instead
         */
        /**
         * @deprecated 自v3.0弃用,使用 getNodeToParentTransform 代替
         */
        nodeToParentTransform: function(){
            return this.getNodeToParentTransform();
        },

        /**
         * get the affine transform matrix of node to parent coordinate frame
         * @return {cc.AffineTransform}
         */
        /**
         * 获取将节点坐标变换到父节点坐标系的仿射变换矩阵
         * @return {cc.AffineTransform}
         */
        getNodeToParentTransform:function () {
            var _t = this;
            if(_t._usingNormalizedPosition && _t._parent){        //TODO need refactor
                var conSize = _t._parent._contentSize;
                _t._position.x = _t._normalizedPosition.x * conSize.width;
                _t._position.y = _t._normalizedPosition.y * conSize.height;
                _t._normalizedPositionDirty = false;
            }

            if(cc._renderType === cc._RENDER_TYPE_CANVAS)
                return this._nodeToParentTransformForCanvas();

            var locBody = this._body, locAnchorPIP = this._anchorPointInPoints, locScaleX = this._scaleX, locScaleY = this._scaleY;
            var x = locBody.p.x;
            var y = locBody.p.y;

            if (this._ignoreAnchorPointForPosition) {
                x += locAnchorPIP.x;
                y += locAnchorPIP.y;
            }

            // Make matrix
            var radians = locBody.a;
            var c = Math.cos(radians);
            var s = Math.sin(radians);

            // Although scale is not used by physics engines, it is calculated just in case
            // the sprite is animated (scaled up/down) using actions.
            // For more info see: http://www.cocos2d-iphone.org/forum/topic/68990
            if (!cc._rectEqualToZero(locAnchorPIP)) {
                x += c * -locAnchorPIP.x * locScaleX + -s * -locAnchorPIP.y * locScaleY;
                y += s * -locAnchorPIP.x * locScaleX + c * -locAnchorPIP.y * locScaleY;
            }

            // Rot, Translate Matrix
            this._transform = cc.affineTransformMake(c * locScaleX, s * locScaleX,
                -s * locScaleY, c * locScaleY,
                x, y);

            return this._transform;
        },

        _nodeToParentTransformForCanvas: function () {
            if (this.dirty) {
                var t = this._transform;// quick reference
                // base position
                var locBody = this._body, locScaleX = this._scaleX, locScaleY = this._scaleY, locAnchorPIP = this._anchorPointInPoints;
                t.tx = locBody.p.x;
                t.ty = locBody.p.y;

                // rotation Cos and Sin
                var radians = -locBody.a;
                var Cos = 1, Sin = 0;
                if (radians) {
                    Cos = Math.cos(radians);
                    Sin = Math.sin(radians);
                }

                // base abcd
                t.a = t.d = Cos;
                t.b = -Sin;
                t.c = Sin;

                // scale
                if (locScaleX !== 1 || locScaleY !== 1) {
                    t.a *= locScaleX;
                    t.c *= locScaleX;
                    t.b *= locScaleY;
                    t.d *= locScaleY;
                }

                // adjust anchorPoint
                t.tx += Cos * -locAnchorPIP.x * locScaleX + -Sin * locAnchorPIP.y * locScaleY;
                t.ty -= Sin * -locAnchorPIP.x * locScaleX + Cos * locAnchorPIP.y * locScaleY;

                // if ignore anchorPoint
                if (this._ignoreAnchorPointForPosition) {
                    t.tx += locAnchorPIP.x;
                    t.ty += locAnchorPIP.y;
                }
                this._transformDirty = false;
            }
            return this._transform;
        },

        /**
         * whether dirty
         * @return {Boolean}
         */
        /**
         * 判断精灵在Atlas中是否需要更新
         * @return {Boolean}
         */
        isDirty:function(){
           return !this._body.isSleeping();
        },
        setDirty: function(){ },

        /**
         * set whether to ignore rotation of body
         * @param {Boolean} b
         */
        /**
         * 设置是否忽略body的旋转
         * @param {Boolean} b
         */
        setIgnoreBodyRotation: function(b) {
            this._ignoreBodyRotation = b;
        }
    };
    cc.PhysicsSprite = cc.Sprite.extend(chipmunkAPI);
    cc.PhysicsSprite._className = "PhysicsSprite";
    var _p = cc.PhysicsSprite.prototype;
    // Extended properties
    /** @expose */
    _p.body;
    cc.defineGetterSetter(_p, "body", _p.getBody, _p.setBody);
    /** @expose */
    _p.dirty;
    cc.defineGetterSetter(_p, "dirty", _p.isDirty, _p.setDirty);


    /**
     * Create a PhysicsSprite with filename and rect
     * @deprecated since v3.0, please use new cc.PhysicsSprite(fileName, rect) instead
     * @param {String|cc.Texture2D|cc.SpriteFrame} fileName
     * @param {cc.Rect} rect
     * @return {cc.PhysicsSprite}
     */
    /**
     * 通过文件名和矩形创建一个PhysicsSprite
     * @deprecated 自v3.0弃用, 使用new cc.PhysicsSprite(fileName, rect) 代替
     * @param {String|cc.Texture2D|cc.SpriteFrame} fileName
     * @param {cc.Rect} rect
     * @return {cc.PhysicsSprite}
     */
    cc.PhysicsSprite.create = function (fileName, rect) {
        return new cc.PhysicsSprite(fileName, rect);
    };

    /**
     * @deprecated since v3.0, please use new cc.PhysicsSprite(spriteFrameName) instead
     * @type {Function}
     */
    /**
     * @deprecated 自v3.0弃用, 使用new cc.PhysicsSprite(spriteFrameName) 代替
     * @type {Function}
     */
    cc.PhysicsSprite.createWithSpriteFrameName = cc.PhysicsSprite.create;

    /**
     * @deprecated since v3.0, please use new cc.PhysicsSprite(spriteFrame) instead
     * @type {Function}
     */
    /**
     * @deprecated 自v3.0弃用, 使用new cc.PhysicsSprite(spriteFrame) 代替
     * @type {Function}
     */
    cc.PhysicsSprite.createWithSpriteFrame = cc.PhysicsSprite.create;
})();

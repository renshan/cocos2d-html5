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
 * 默认节点标签
 * @constant
 * @type Number
 */
cc.NODE_TAG_INVALID = -1;

/**
 * XXX: 是的,节点或许会有一个排序问题,如果游戏运行在60FPS且每一个游戏帧都重新排序,15天一次.
 */
cc.s_globalOrderOfArrival = 1;

/**
 * <p>cc.Node是所有节点的父类,所有的绘制或者包含的东西都是一个cc.Node.
 * 最典型的cc.Nodes有:cc.Scene,cc.Layer,cc.Sprite,cc.Menu.</p>
 *
 * <p>一个cc.Node的主要特点:<br/>
 * - 他们可以包含其他的节点对象(addChild, getChildByTag, removeChild, etc)<br/>	
 * - 他们可以安排定期的回调(schedule, unschedule, etc)<br/>
 * 他们可以执行一些动作(runAction, stopAction, etc)<br/></p>
 *
 * <p>有些cc.Node节点为其自身或者子类提供额外的功能.</p>
 *
 * <<p>继承一个cc.Node通常意味着(下列其中之一/所有):<br/>
 * - 重写构造函数"ctor"去初始化资源跟安排回调<br/>
 * - 创建回调来响应时间的进行<br/></p>
 *
 * <p>cc.Node特性:<br/>
 * - 位置<br/>
 * - x,y轴缩放<br/>
 * - 角度的旋转(以度为单位,顺时针)<br/>
 * - 锚点<br/>	
 * - 尺寸 <br/>
 * - 颜色 <br/>
 * - 透明度 <br/>
 * - 可见性<br/>	
 * - Z轴排序<br/>
 * - WebGL的Z轴位置<br/></p>
 *
 * <p> 默认值:<br/>
 * - 旋转:0 <br/>
 * - 位置: (x=0,y=0) <br/>
 * - 缩放比例: (x=1,y=1) <br/>
 * - 文本尺寸: (x=0,y=0)<br/>
 * - 锚点: (x=0,y=0)<br/>		
 * - 颜色: (r=255,g=255,b=255)<br/>
 * - 透明度: 255</p>
 *
 * <p> 限制:<br/>
 * - 一个cc.Node是一个"void"对象.它没有纹理<br/></p>
 *
 * 																																				<p>启用网格时在变换中排序<br/>
 * -# 节点的位置会被变换  <br/>
 * -# 节点会被旋转<br/>
 * -# 节点会被缩放<br/>
 *
 * <p>禁用网格时在变换中排序<br/>
 * -# 节点的位置会被变换  <br/>
 * -# 节点会被旋转<br/>
 * -# 节点会被缩放<br/>
 * -# 网格将会捕捉屏幕<br/>
 * -# 节点将会根据摄像机的值进行移动 <br/>
 * -# 网格将会渲染被捕捉的屏幕 <br/></P>
 *
 * @class
 * @extends cc.Class
 *
 * @property {Number}               x                   - 节点的X轴位置
 * @property {Number}               y                   - 节点的Y轴位置
 * @property {Number}               width               - 节点的宽
 * @property {Number}               height              - 节点的高	
 * @property {Number}               anchorX             - X轴上的锚点位置
 * @property {Number}               anchorY             - Y轴上的锚点位置	
 * @property {Boolean}              ignoreAnchor        - 当设置位置属性时是否忽略锚点
 * @property {Number}               skewX               - X轴倾斜
 * @property {Number}               skewY               - Y轴倾斜
 * @property {Number}               zIndex              - Z顺序值用于表示绘制的先后顺序	
 * @property {Number}               vertexZ             - 节点的WebGL的Z顶点, 如果所有的节点使用相同的WebGL的Z顶点,Z顺序的排序不会有影响
 * @property {Number}               rotation            - 节点的旋转角度
 * @property {Number}               rotationX           - X轴旋转角度
 * @property {Number}               rotationY           - Y轴旋转角度
 * @property {Number}               scale               - 节点缩放比例
 * @property {Number}               scaleX              - X轴的缩放比例
 * @property {Number}               scaleY              - Y轴的缩放比例
 * @property {Boolean}              visible             - 节点是否可见	
 * @property {cc.Color}             color               - 节点的颜色,默认值为白色: (255, 255, 255)
 * @property {Boolean}              cascadeColor        - 节点颜色是否影响它的子节点,默认值为false.	
 * @property {Number}               opacity             - 节点的透明度,默认值为255
 * @property {Boolean}              opacityModifyRGB    - 透明度是否影响颜色的值,默认值为false.	
 * @property {Boolean}              cascadeOpacity      - 节点透明度是否影响它的子节点,默认值为false.
 * @property {Array}                children            - <@readonly> 所有的子节点
 * @property {Number}               childrenCount       - <@readonly> 子节点的数量
 * @property {cc.Node}              parent              - 父亲节点
 * @property {Boolean}              running             - <@readonly> 节点是否在运行
 * @property {Number}               tag                 - 节点标签	
 * @property {Object}               userData            - 用户自定义数据
 * @property {Object}               userObject          - 用户分配的CCObject, 类似于用户数据, 但它不是使用一个void*,而是使用一个id
 * @property {Number}               arrivalOrder        - 到达顺序值,表示哪些子节点先被添加.
 * @property {cc.ActionManager}     actionManager       - 被所有动作使用的CCActionManager对象.
 * @property {cc.Scheduler}         scheduler           - cc.Scheduler用来调度所有的更新和定时器.
 * @property {cc.GridBase}          grid                - 当使用效果的时候,被使用的网格对象
 * @property {cc.GLProgram}         shaderProgram       - 获取节点当前所使用的着色程序
 * @property {Number}               glServerState       - OpenGL服务的状态		
 */
cc.Node = cc.Class.extend(/** @lends cc.Node# */{
    _localZOrder: 0,                                     ///< 本地排序(相对于其同级类)用来排序节点
    _globalZOrder: 0,                                    ///<用来全局排序节点
    _vertexZ: 0.0,

    _rotationX: 0,
    _rotationY: 0.0,
    _scaleX: 1.0,
    _scaleY: 1.0,
    _position: null,

    _normalizedPosition:null,
    _usingNormalizedPosition: false,
    _normalizedPositionDirty: false,

    _skewX: 0.0,
    _skewY: 0.0,
    // children (lazy allocs),
    // 子类(延迟内存分配),
    _children: null,
    // lazy alloc,
    _visible: true,
    _anchorPoint: null,
    _anchorPointInPoints: null,
    _contentSize: null,
    _running: false,
    _parent: null,
    // "全屏"对象.就像Scenes跟Layers,需要设置_ignoreAnchorPointForPosition为true
    _ignoreAnchorPointForPosition: false,
    tag: cc.NODE_TAG_INVALID,
    // userData一般被初始化成nil
    userData: null,
    userObject: null,
    _transformDirty: true,
    _inverseDirty: true,
    _cacheDirty: false,
    // 服务于父类的缓存,用于构建父类的缓存链
    _cachedParent: null,
    _transformGLDirty: null,
    _transform: null,                            //本地变换
    _transformWorld: null,                       //全局变换
    _inverse: null,

    //since 2.0 api
    _reorderChildDirty: false,
    _shaderProgram: null,
    arrivalOrder: 0,

    _actionManager: null,
    _scheduler: null,
    _eventDispatcher: null,

    _initializedNode: false,
    _additionalTransformDirty: false,
    _additionalTransform: null,
    _componentContainer: null,
    _isTransitionFinished: false,

    _rotationRadiansX: 0,
    _rotationRadiansY: 0,
    _className: "Node",
    _showNode: false,
    _name: "",                     ///<一个字符串标签,用户定义一个字符串标签给节点

    _displayedOpacity: 255,
    _realOpacity: 255,
    _displayedColor: null,
    _realColor: null,
    _cascadeColorEnabled: false,
    _cascadeOpacityEnabled: false,
    _hashOfName: 0,

    _curLevel: -1,                           //为了新的渲染器
    _rendererCmd:null,
    _renderCmdDirty: false,

    _initNode: function () {
        var _t = this;
        _t._anchorPoint = cc.p(0, 0);
        _t._anchorPointInPoints = cc.p(0, 0);
        _t._contentSize = cc.size(0, 0);
        _t._position = cc.p(0, 0);
        _t._normalizedPosition = cc.p(0,0);
        _t._children = [];
        _t._transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
        _t._transformWorld = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};

        var director = cc.director;
        _t._actionManager = director.getActionManager();
        _t._scheduler = director.getScheduler();
        _t._initializedNode = true;
        _t._additionalTransform = cc.affineTransformMakeIdentity();
        if (cc.ComponentContainer) {
            _t._componentContainer = new cc.ComponentContainer(_t);
        }

        this._displayedOpacity = 255;
        this._realOpacity = 255;
        this._displayedColor = cc.color(255, 255, 255, 255);
        this._realColor = cc.color(255, 255, 255, 255);
        this._cascadeColorEnabled = false;
        this._cascadeOpacityEnabled = false;
    },

    /**
     * 初始化cc.Node实例
     * @function
     * @returns {boolean} 初始化是否成功.
     */
    init: function () {
        if (this._initializedNode === false)
            this._initNode();
        return true;
    },

    _arrayMakeObjectsPerformSelector: function (array, callbackType) {
        if (!array || array.length === 0)
            return;

        var i, len = array.length, node;
        var nodeCallbackType = cc.Node._stateCallbackType;
        switch (callbackType) {
            case nodeCallbackType.onEnter:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.onEnter();
                }
                break;
            case nodeCallbackType.onExit:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.onExit();
                }
                break;
            case nodeCallbackType.onEnterTransitionDidFinish:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.onEnterTransitionDidFinish();
                }
                break;
            case nodeCallbackType.cleanup:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.cleanup();
                }
                break;
            case nodeCallbackType.updateTransform:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.updateTransform();
                }
                break;
            case nodeCallbackType.onExitTransitionDidStart:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.onExitTransitionDidStart();
                }
                break;
            case nodeCallbackType.sortAllChildren:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.sortAllChildren();
                }
                break;
            default :
                cc.assert(0, cc._LogInfos.Node__arrayMakeObjectsPerformSelector);
                break;
        }
    },

    /**
     * 设置节点的dirty标志为true,以便于下一帧访问函数时进行更新
 
     * @function
     */
    setNodeDirty: null,

    /**
     * <p>属性配置方法</br>
     * 所有在attrs中的属性将会被设置到节点中,</br>
     * 当节点的setter方法可用时,</br>
     * 属性将通过setter方法进行设置.</br>
     * </p>
     * @function
     * @param {Object} attrs 设置到这个节点的属性
     */
    attr: function (attrs) {
        for (var key in attrs) {
            this[key] = attrs[key];
        }
    },

    /**
     * <p>获取X轴方向的倾斜角度</br>
     * 节点X轴的倾斜角 单位:度<br/>
     * 该角度表示的是X轴方向上的倾斜程度<br/>
     * 该角度是Y轴与其左边缘之间的夹角</br>
     * 默认的X轴倾斜角为0.确切的值表示的是节点在CW方向上的倾斜度.</br>
     * </p>
     * @function
     * @return {Number} 节点X轴的倾斜角度.
     */
    getSkewX: function () {
        return this._skewX;
    },

    /**
     * <p>
     * 改变节点X轴方向的倾斜角度<br/>
     * 该角度表示的是X轴方向上的倾斜程度<br/>
     * 该角度是Y轴与其左边缘之间的夹角</br>
     * 默认的X轴倾斜角为0.确切的值表示的是节点在CW方向上的倾斜度.</br>
     * </p>
     * @function
     * @param {Number} newSkewX 节点X轴的倾斜角度.
     */
    setSkewX: function (newSkewX) {
        this._skewX = newSkewX;
        this.setNodeDirty();
    },

    /**
     * <p>获取Y轴的倾斜角度</br>
     * 节点Y轴方向的倾斜角度 单位:度<br/>
     * 该角度表示的是Y轴方向上的倾斜程度<br/>
     * 该角度是X轴与其底边缘之间的夹角</br>
     * 默认的Y轴倾斜角为0.确切的值表示的是节点在CCW方向上的倾斜度.</br>
     * </p>
     * @function
     * @return {Number} 节点Y轴的倾斜角度.
     */
    getSkewY: function () {
        return this._skewY;
    },

    /**
     * <p>
     * 改变节点Y轴方向上的倾斜角度                                                    <br/>
     * 
     * 该角度表示的是Y轴方向上的倾斜程度<br/>
     * 该角度是X轴与其底边缘之间的夹角</br>
     * 默认的Y轴倾斜角为0.确切的值表示的是节点在CCW方向上的倾斜度.</br>
     * </p>
     * @function
     * @param {Number} newSkewY  节点Y轴的倾斜角度.
     * 
     */
    setSkewY: function (newSkewY) {
        this._skewY = newSkewY;
        this.setNodeDirty();
    },

    /**
     * <p> LocalZOrder是用来与其同级节点进行排序的key<br/>
     *                                                                                                                 <br/>
     * 节点的父类会基于LocalZOrder值对所有的子类进行排序<br/>
     * 如果两个节点拥有相同的LocalZOrder,那么先被添加到子节点数组中的节点将会排在另一个节点的前面<br/>
     * 
     * 
     * <br/>
     * 同时,场景绘图使用的是"In-Order"树遍历算法(http://en.wikipedia.org/wiki/Tree_traversal#In-order)
     * <br/>
     * LocalZOder的值小于0的节点为左子树<br/>
     * LocalZOder值大于等于0的为右子树</p>
     * @function
     * @param {Number} localZOrder
     */
    setLocalZOrder: function (localZOrder) {
        this._localZOrder = localZOrder;
        if (this._parent)
            this._parent.reorderChild(this, localZOrder);
        cc.eventManager._setDirtyForNode(this);
    },

    //Helper function used by `setLocalZOrder`. Don't use it unless you know what you are doing.
    _setLocalZOrder: function (localZOrder) {
        this._localZOrder = localZOrder;
    },

    /**
     * 返回节点的本地Z顺序值.
     * @function
     * @returns {Number} 本地的Z顺序值(与其同级节点相关).
     */
    getLocalZOrder: function () {
        return this._localZOrder;
    },

    /**
     * 返回节点的Z轴顺序值
     * @function
     * @return {Number}
     * @deprecated 自3.0,请使用getLocalZOrder代替.
     */
    getZOrder: function () {
        cc.log(cc._LogInfos.Node_getZOrder);
        return this.getLocalZOrder();
    },

    /**
     * <p>
     *     设置表示绘制顺序的Z轴顺序值,并且重新排序该节点在父类子节点数组中的位置<br/>
     *                                                                                                                    <br/>
     *      节点的Z轴顺序值和其兄弟节点(父节点相同的同级节点)相关:<br/>
     *      不必要处理OpenGL的Z轴顶点值.该值在cocos2d中只影响绘制节点的顺序<br/>
     *      该值越大,该节点将会在每个消息循环的绘制过程中越置后.<br/>
     *      请参阅setVertexZ(float)跟该函数的区别.
     *			
     * </p>
     * @function
     * @param {Number} z 节点的Z顺序值.
     * @deprecated 自3.0, 请使用setLocalZOrder代替.
     */
    setZOrder: function (z) {
        cc.log(cc._LogInfos.Node_setZOrder);
        this.setLocalZOrder(z);
    },

    /**
     * <p>定义渲染节点的顺序<br/>
     * 拥有全局Z顺序越小的节点,最先被渲染 <br/>
     *                                                                                                                                    <br/>
     * 假设两个或者更多的节点拥有相同的全局Z顺序,那么渲染顺序无法保证.<br/>
     * 唯一的例外是如果节点的全局Z顺序为零,那么使用场景(Sence)的绘图顺序.<br/>
     *                                                                                                                                    <br/>
     * 默认的,所有的节点全局Z顺序都是零.这就是说,默认使用场景(Sence)绘图顺序来渲染节点.<br/>
     *                                                                                                                                    <br/>
     * 全局Z顺序可以用于处理当你需要按照与场景绘图顺序不同的顺序渲染节点的情况.<br/>
     *                                                                                                                                    <br/>
     * 局限性:全局Z顺序不能够被继承"SpriteBatchNode"的节点使用<br/>
     * 并且如果"ClippingNode"是父类中的一个，那么"global Z order" 将会和"ClippingNode"有关</p>
     * 
     * @function
     * @param {Number} globalZOrder
     */
    setGlobalZOrder: function (globalZOrder) {
        if (this._globalZOrder != globalZOrder) {
            this._globalZOrder = globalZOrder;
            cc.eventManager._setDirtyForNode(this);
        }
    },

    /**
     * 返回节点的全局Z顺序.
     * @function
     * @returns {number} 节点的全局Z顺序值
     */
    getGlobalZOrder: function () {
        return this._globalZOrder;
    },

    /**
     * 返回节点的WebGL的Z顶点.
     * @function
     * @return {Number} 节点的WebGL的Z顶点
     */
    getVertexZ: function () {
        return this._vertexZ;
    },

    /**
     * <p>
     *     设置实际的WebGL的Z顶点<br/>
     *                                                                                                            <br/>
     *      openGL的Z顶点跟cocos2d的Z顺序的不同之处:<br/>
     *      - WebGL的Z修改Z顶点,而不是跟父子类有关联的Z顺序.<br/>
     *      - WebGL的Z顶点要求设置2D投影模式.<br/>
     *      - 如果所有的节点使用相同的WebGL的Z顶点,cocos2d的Z顺序的排序不会有影响.<br/>
     *                                                                                                            <br/>
     *      @warning 使用它是有风险的,它可能会破坏cocos2d的父子类的Z顺序<br/>
     *			
     * </p>
     * @function
     * @param {Number} Var
     */
    setVertexZ: function (Var) {
        this._vertexZ = Var;
    },

    /**
     * 返回节点的旋转角度(以度为单位).默认的旋转角度为0.正数表示节点顺时针旋转.
     * @function
     * @return {Number} 节点的旋转角度(以度为单位).
     */
    getRotation: function () {
        if (this._rotationX !== this._rotationY)
            cc.log(cc._LogInfos.Node_getRotation);
        return this._rotationX;
    },

    /**
     * <p>
     *     设置节点的旋转角度<br/>
     *                                                                                                   <br/>
     *     默认的旋转角度为0<br/>
     *     正数顺时针旋转,负数逆时针旋转.
     * </p>
     * @function
     * @param {Number} newRotation 节点的旋转角度.
     */
    setRotation: function (newRotation) {
        this._rotationX = this._rotationY = newRotation;
        this._rotationRadiansX = this._rotationX * 0.017453292519943295; //(Math.PI / 180);
        this._rotationRadiansY = this._rotationY * 0.017453292519943295; //(Math.PI / 180);
        this.setNodeDirty();
    },

    /**
     * 返回X轴的旋转角度表示的是节点的水平旋转倾斜角度.<br/>
     * 
     * 默认的旋转角度值为0.正数顺时针旋转<br/>
     * (只在WebGL的渲染模式下支持)
     * @function
     * @return {Number} X轴旋转角度(以度为单位)
     */
    getRotationX: function () {
        return this._rotationX;
    },

    /**
     * <p>
     *     设置节点的X轴旋转角度来进行水平旋转倾斜<br/>
     *     (只在WebGL的渲染模式下支持)<br/>
     *     默认的旋转角度值为0.<br/>
     *     正数顺时针旋转,负数逆时针旋转.
     * </p>
     * @param {Number} rotationX X轴来进行水平旋转倾斜的旋转角度.
     */
    setRotationX: function (rotationX) {
        this._rotationX = rotationX;
        this._rotationRadiansX = this._rotationX * 0.017453292519943295; //(Math.PI / 180);
        this.setNodeDirty();
    },

    /**
     * 返回Y轴的旋转角度表示的是节点的竖直旋转倾斜角度.<br/>
     * 默认的旋转角度值为0.正数顺时针旋转<br/>
     * (只在WebGL的渲染模式下支持)<br/>
     * @function
     * @return {Number} Y轴旋转角度.
     */
    getRotationY: function () {
        return this._rotationY;
    },

    /**
     * <p>
     *    设置节点的Y轴旋转角度来进行竖直旋转倾斜<br/>
     *    (只在WebGL的渲染模式下支持)<br/>
     *    默认的旋转角度值为0.<br/>
     *    正数顺时针旋转,负数逆时针旋转.
     * </p>
     * @param rotationY Y轴旋转角度.
     */
    setRotationY: function (rotationY) {
        this._rotationY = rotationY;
        this._rotationRadiansY = this._rotationY * 0.017453292519943295;  //(Math.PI / 180);
        this.setNodeDirty();
    },

    /**
     * 返回节点的缩放比例
     * @warning: 当_scaleX != _scaleY断言会失败.
     * @function
     * @return {Number} 缩放比例
     */
    getScale: function () {
        if (this._scaleX !== this._scaleY)
            cc.log(cc._LogInfos.Node_getScale);
        return this._scaleX;
    },

    /**
     * 设置节点的缩放比例.默认的缩放比例是1.0.该函数可以同时修改X轴跟Y轴的缩放比例.
     * @function
     * @param {Number} 缩放或者X轴缩放值
     * @param {Number} [scaleY=]
     */
    setScale: function (scale, scaleY) {
        this._scaleX = scale;
        this._scaleY = (scaleY || scaleY === 0) ? scaleY : scale;
        this.setNodeDirty();
    },

    /**
     * 返回节点X轴的缩放比例
     * @function
     * @return {Number} X轴缩放比例.
     */
    getScaleX: function () {
        return this._scaleX;
    },

    /**
     * <p>
     *     改变节点X轴的缩放比例<br/>
     *     如果你没有修改过该值的话,默认值为1.0.
     * </p>
     * @function
     * @param {Number} newScaleX X轴缩放系数.
     */
    setScaleX: function (newScaleX) {
        this._scaleX = newScaleX;
        this.setNodeDirty();
    },

    /**
     * 返回节点Y轴的缩放比例
     * @function
     * @return {Number} Y轴缩放系数.
     */
    getScaleY: function () {
        return this._scaleY;
    },

    /**
     * <p>
     *     改变节点的Y轴的缩放比例<br/>
     *     如果你没有修改过该值的话,默认值为1.0
     * </p>
     * @function
     * @param {Number} newScaleY Y轴缩放系数.
     */
    setScaleY: function (newScaleY) {
        this._scaleY = newScaleY;
        this.setNodeDirty();
    },

    /**
     * <p>
     *     改变节点的在cocos2d坐标系中的位置<br/>
     *     原点(0,0)在屏幕的左下角.<br/>
     *     我们经常使用cc.p(x,y)来构建CCPoint对象.<br/>
     *     并且传递两个数字(x,y)比使用CCPoint更高效.
     * </p>
     * @function
     * @param {cc.Point|Number} newPosOrxValue 节点坐标的位置或者X坐标的位置
     * @param {Number} [yValue] Y坐标系位置
     * @example
     *    var size = cc.winSize;
     *    node.setPosition(size.width/2, size.height/2);
     */
    setPosition: function (newPosOrxValue, yValue) {
        var locPosition = this._position;
        if (yValue === undefined) {
            locPosition.x = newPosOrxValue.x;
            locPosition.y = newPosOrxValue.y;
        } else {
            locPosition.x = newPosOrxValue;
            locPosition.y = yValue;
        }
        this.setNodeDirty();
        this._usingNormalizedPosition = false;
    },

    /**
     * <p>
     * 设置位置的值在区间[0,1]内.<br/>
     * 像素位置的计算如下:<br/>
     *   _position = _normalizedPosition * parent.getContentSize()
     * </p>
     * @param {cc.Point|Number} posOrX
     * @param {Number} [y]
     */
    setNormalizedPosition: function(posOrX, y){
        var locPosition = this._normalizedPosition;
        if (y === undefined) {
            locPosition.x = posOrX.x;
            locPosition.y = posOrX.y;
        } else {
            locPosition.x = posOrX;
            locPosition.y = y;
        }
        this.setNodeDirty();
        this._normalizedPositionDirty = this._usingNormalizedPosition = true;
    },

    /**
     * <p>返回表示节点在cocos2d坐标系中的位置的cc.p对象的拷贝.(0,0)为左下角的点</p>
     * @function
     * @return {cc.Point} 节点在OpenGL坐标系中的位置
     */
    getPosition: function () {
        return cc.p(this._position);
    },

    /**
     * 返回格式化位置
     * @returns {cc.Point}
     */
    getNormalizedPosition: function(){
        return cc.p(this._normalizedPosition);
    },

    /**
     * <p>返回节点在coco2d坐标系中的X轴位置.</p>
     * @function
     * @return {Number}
     */
    getPositionX: function () {
        return this._position.x;
    },

    /**
     * <p>设置节点在coco2d坐标系中的X轴位置.</p>
     * @function
     * @param {Number} x X轴新的位置值
     */
    setPositionX: function (x) {
        this._position.x = x;
        this.setNodeDirty();
    },

    /**
     * <p>返回节点在coco2d坐标系中的Y轴位置.</p>
     * @function
     * @return {Number}
     */
    getPositionY: function () {
        return  this._position.y;
    },

    /**
     * <p>设置节点在coco2d坐标系中的Y轴位置.</p>
     * @function
     * @param {Number} y Y轴新的位置值
     */
    setPositionY: function (y) {
        this._position.y = y;
        this.setNodeDirty();
    },

    /**
     * 返回子节点的数量.
     * @function
     * @return {Number} 子节点数量.
     */
    getChildrenCount: function () {
        return this._children.length;
    },

    /**
     * 返回包含所有子节点的数组<br/>
     * 构建一个树结构是CCNode非常重要的特征
     * @function
     * @return {Array} 子节点数组
     * @example
     *  //此示例代码遍历所有的子节点,并设置他们的位置为(0,0)
     *  var allChildren = parent.getChildren();
     *  for(var i = 0; i< allChildren.length; i++) {
     *      allChildren[i].setPosition(0,0);
     *  }
     */
    getChildren: function () {
        return this._children;
    },

    /**
     * 返回节点是否可见
     * @function
     * @see cc.Node#setVisible
     * @return {Boolean} 如果为true则节点可见,如果为false则节点不可见.
     * 
     */
    isVisible: function () {
        return this._visible;
    },

    /**
     * 设置节点是否可见<br/>	
     * 默认值为ture
     * @function
     * @param {Boolean} visible 传入true使得节点可见,传入false的话则隐藏节点.
     */
    setVisible: function (visible) {
        if(this._visible != visible){
            this._visible = visible;
            if(visible) this.setNodeDirty();
            cc.renderer.childrenOrderDirty = true;
        }
    },

    /**
     *  <p>返回一个新的cc.p实例表示节点的锚点位置.<br/>
	 
     *  锚点是所有的转换和定位操作的基点.<br/>
     *  它就像节点附加到其父节点的大头针.<br/>
     *  锚点是格式化(normalized)点,就像百分比一样.。(0,0)表示左下角,(1,1)表示右上角.<br/>
     *  但是你可以使用比(1,1)更大的值或者比(0,0)更小的值.<br/>
     *  默认的锚点是(0.5,0.5),因此它开始于节点的中心位置<br/></p>
     * @function
     * @return {cc.Point}  节点的锚点.
     * 
     */
    getAnchorPoint: function () {
        return cc.p(this._anchorPoint);
    },

    /**
     * <p>
     *  设置锚点,用百分比表示.<br/>
     *     
     *  锚点是所有的转换和定位操作的基点.<br/>
     *  它就像节点附加到其父节点的大头针.<br/>
     *  锚点是格式化(normalized)点,就像百分比一样.。(0,0)表示左下角,(1,1)表示右上角.<br/>
     *  但是你可以使用比(1,1)更大的值或者比(0,0)更小的值.<br/>
     *  默认的锚点是(0.5,0.5),因此它开始于节点的中心位置<br/></p>
     * @function
     * @param {cc.Point|Number} point 节点的锚点或者节点X轴的锚点值.
     * @param {Number} [y] 节点Y轴的锚点值
     */
    setAnchorPoint: function (point, y) {
        var locAnchorPoint = this._anchorPoint;
        if (y === undefined) {
            if ((point.x === locAnchorPoint.x) && (point.y === locAnchorPoint.y))
                return;
            locAnchorPoint.x = point.x;
            locAnchorPoint.y = point.y;
        } else {
            if ((point === locAnchorPoint.x) && (y === locAnchorPoint.y))
                return;
            locAnchorPoint.x = point;
            locAnchorPoint.y = y;
        }
        var locAPP = this._anchorPointInPoints, locSize = this._contentSize;
        locAPP.x = locSize.width * locAnchorPoint.x;
        locAPP.y = locSize.height * locAnchorPoint.y;
        this.setNodeDirty();
    },

    _getAnchor: function () {
        return this._anchorPoint;
    },
    _setAnchor: function (p) {
        var x = p.x, y = p.y;
        if (this._anchorPoint.x !== x) {
            this._anchorPoint.x = x;
            this._anchorPointInPoints.x = this._contentSize.width * x;
        }
        if (this._anchorPoint.y !== y) {
            this._anchorPoint.y = y;
            this._anchorPointInPoints.y = this._contentSize.height * y;
        }
        this.setNodeDirty();
    },
    _getAnchorX: function () {
        return this._anchorPoint.x;
    },
    _setAnchorX: function (x) {
        if (this._anchorPoint.x === x) return;
        this._anchorPoint.x = x;
        this._anchorPointInPoints.x = this._contentSize.width * x;
        this.setNodeDirty();
    },
    _getAnchorY: function () {
        return this._anchorPoint.y;
    },
    _setAnchorY: function (y) {
        if (this._anchorPoint.y === y) return;
        this._anchorPoint.y = y;
        this._anchorPointInPoints.y = this._contentSize.height * y;
        this.setNodeDirty();
    },

    /**
     * 返回一个新的cc.p实例表示锚点的绝对像素<br/>
     * 你只能读取它.如果你想要修改它,使用setAnchorPoint
     * @see cc.Node#getAnchorPoint
     * @function
     * @return {cc.Point} 绝对像素中的锚点.
     */
    getAnchorPointInPoints: function () {
        return cc.p(this._anchorPointInPoints);
    },

    _getWidth: function () {
        return this._contentSize.width;
    },
    _setWidth: function (width) {
        this._contentSize.width = width;
        this._anchorPointInPoints.x = width * this._anchorPoint.x;
        this.setNodeDirty();
    },
    _getHeight: function () {
        return this._contentSize.height;
    },
    _setHeight: function (height) {
        this._contentSize.height = height;
        this._anchorPointInPoints.y = height * this._anchorPoint.y;
        this.setNodeDirty();
    },

    /**
     * <p>返回一个新的cc.size实例表示节点未进行变换之前的大小.<br/>
     * 不管节点是缩放或者旋转,contentSize都保持不变.<br/>
     * 左右的节点都有大小.图层(Layer)和场景(Scene)默认拥有跟屏幕一样的大小.<br/></p>
     * @function
     * @return {cc.Size} 节点未进行变换之前的大小
     */
    getContentSize: function () {
        return cc.size(this._contentSize);
    },

    /**
     * <p>
     *     设置节点未进行转换之前的大小<br/>
     *     
     *     不管节点是缩放或者旋转,contentSize都保持不变.<br/>
     *     左右的节点都有大小.图层(Layer)和场景(Scene)默认拥有跟屏幕一样的大小.<br/></p>	
     * </p>
     * @function
     * @param {cc.Size|Number} size 节点未进行变换之前的尺寸或者节点未变换前的高度.
     * @param {Number} [height] 节点未变换尺寸前的高度.
     */
    setContentSize: function (size, height) {
        var locContentSize = this._contentSize;
        if (height === undefined) {
            if ((size.width === locContentSize.width) && (size.height === locContentSize.height))
                return;
            locContentSize.width = size.width;
            locContentSize.height = size.height;
        } else {
            if ((size === locContentSize.width) && (height === locContentSize.height))
                return;
            locContentSize.width = size;
            locContentSize.height = height;
        }
        var locAPP = this._anchorPointInPoints, locAnchorPoint = this._anchorPoint;
        locAPP.x = locContentSize.width * locAnchorPoint.x;
        locAPP.y = locContentSize.height * locAnchorPoint.y;
        this.setNodeDirty();
    },

    /**
     * <p>
     *     不管节点是否接受回调事件都返回<br/>
     *     运行意味着接受回调事件例如:onEnter(), onExit(), update()
     * </p>
     * @function
     * @return {Boolean} 节点是否在运行.
     */
    isRunning: function () {
        return this._running;
    },

    /**
     * 返回父节点的引用
     * @function
     * @return {cc.Node} 父节点的引用
     */
    getParent: function () {
        return this._parent;
    },

    /**
     * 设置父节点
     * @param {cc.Node} parent 父节点的引用
     */
    setParent: function (parent) {
        this._parent = parent;
    },

    /**
     * 返回当你移动节点的位置时,是否忽略节点的锚点.<br/>
     * 当锚点被忽略的时候,位置将会在父节点坐标系中基于原点(0,0)进行计算.
     * @function
     * @see cc.Node#ignoreAnchorPointForPosition
     * @return {Boolean} 当你设置节点位置,锚点将会被忽略的话,则为true.
     */
    isIgnoreAnchorPointForPosition: function () {
        return this._ignoreAnchorPointForPosition;
    },

    /**
     * <p>
     *     设置当你移动节点的位置时,是否忽略节点的锚点.<br/>
     *     当锚点被忽略的时候,位置将会在父节点坐标系中基于原点(0,0)进行计算.<br/>	
     *     这是一个内部调用方法,仅仅在CCLayer和CCScene中使用.不要在框架以外调用.<br/>		
     *     默认值为false,当在CCLayer和CCScene是true
     * </p>
     * @function
     * @param {Boolean} newValue 当你设置节点的位置时,如果锚点被忽略则为true.
     */
    ignoreAnchorPointForPosition: function (newValue) {
        if (newValue != this._ignoreAnchorPointForPosition) {
            this._ignoreAnchorPointForPosition = newValue;
            this.setNodeDirty();
        }
    },

    /**
     * 返回用于标识一个节点的标签.
     * @function
     * @return {Number} 标识节点的一个整数.
     * @example
     * // 你可以给节点设置标签,那就很容易识别节点了.
     * // 设置标签
     * node1.setTag(TAG_PLAYER);
     * node2.setTag(TAG_MONSTER);
     * node3.setTag(TAG_BOSS);
     * parent.addChild(node1);
     * parent.addChild(node2);
     * parent.addChild(node3);
     * // 通过标签识别
     * var allChildren = parent.getChildren();
     * for(var i = 0; i < allChildren.length; i++){
     *     switch(node.getTag()) {
     *         case TAG_PLAYER:
     *             break;
     *         case TAG_MONSTER:
     *             break;
     *         case TAG_BOSS:
     *             break;
     *     }
     * }
     */
    getTag: function () {
        return this.tag;
    },

    /**
     * 改变用于标识节点的标签.<br/>
     * 请参阅getTag方法的示例代码
     * @function
     * @see cc.Node#getTag
     * @param {Number} tag 标识节点的一个整数.
     * 
     */
    setTag: function (tag) {
        this.tag = tag;
    },

    /**
     * 修改用于标识节点的名字.
     * @function
     * @param {String} name
     */
    setName: function(name){
         this._name = name;
    },

    /**
     * 返回标识节点名字的字符串.
     * @function
     * @returns {string} 标识节点的字符串.
     */
    getName: function(){
        return this._name;
    },

    /**
     * <p>
     *     返回一个自定义的用户数据<br/>
     *     你可以随意为UserData赋值,一个数据块,结构体或者一个对象.
     * </p>
     * @function
     * @return {object}  用户自定义的数据
     * 
     */
    getUserData: function () {
        return this.userData;
    },

    /**
     * <p>
     *    设置自定义用户数据的引用<br/>
     *    你可以随意为UserData赋值,一个数据块,结构体或者一个对象.
     * </p>
     * @function
     * @warning 别忘记在JSB中手工释放内存,特别在你改变数据的指针,和节点自动释放的时候.
     * @param {object} Var 一个自定义的用户数据
     */
    setUserData: function (Var) {
        this.userData = Var;
    },

    /**
     * 返回一个用户指定的cocos2d对象.<br/>
     * 和userData类似,但它只能存储cocos2d对象而不是所有类型的对象
     * @function
     * @return {object} 用户指定的CCObject对象
     */
    getUserObject: function () {
        return this.userObject;
    },

    /**
     * <p>
     *      设置一个用户指定的cocos2d对象<br/>
     *      <br/>
     *      在JSB中,UserObject在该函数中会retain一次,上一个UserObject（如果有）会被释放掉.<br/>
     *      UserObject将会在CCNode的析构函数释放.
     * </p>
     * @param {object} newValue 一个用户cocos2d对象
     * 
     */
    setUserObject: function (newValue) {
        if (this.userObject != newValue) {
            this.userObject = newValue;
        }
    },


    /**
     * 返回到达顺序,指出哪一个子节点先被添加.
     * @function
     * @return {Number} 到达顺序值.
     */
    getOrderOfArrival: function () {
        return this.arrivalOrder;
    },

    /**
     * <p>
     *     设置到达顺序,当这个节点和其他子节点有相同的ZOrder时                                                      <br/>
	 *                                                                                                              <br/>
     *     后调用addChild函数的节点到达顺序值更大<br/>
     *     如果两个子节点有相同的Zorder,有更大到达顺序的子节点将会后绘制.
     * </p>
     * @function
     * @warning 该方法是为了内部Z顺序值排序用的,请不要手工改变.
     * @param {Number} Var  到达顺序.
     */
    setOrderOfArrival: function (Var) {
        this.arrivalOrder = Var;
    },

    /**
     * <p>得到被所有动作使用的CCActionManager对象<br/>
     * (重要:如果你设置了一个新的cc.ActionManager,则先前创建的动作将会被清除掉.)</p>	
     * @function
     * @see cc.Node#setActionManager
     * @return {cc.ActionManager} 一个CCActionManager对象.
     */
    getActionManager: function () {
        if (!this._actionManager) {
            this._actionManager = cc.director.getActionManager();
        }
        return this._actionManager;
    },

    /**
     * <p>设置被所有动作使用的cc.ActionManager对象</p>
     * @function
     * @warning 如果你想要设置一个新的CCActionManager,则先前创建的动作都将被清除.
     * @param {cc.ActionManager} actionManager 用来管理所有动作的CCActionManager对象.
     */
    setActionManager: function (actionManager) {
        if (this._actionManager != actionManager) {
            this.stopAllActions();
            this._actionManager = actionManager;
        }
    },

    /**
     * <p>
     *   返回用来调度所有的"updates"跟定时器的cc.Scheduler对象
     * </p>
     * @function
     * @return {cc.Scheduler} 一个CCScheduler对象.
     */
    getScheduler: function () {
        if (!this._scheduler) {
            this._scheduler = cc.director.getScheduler();
        }
        return this._scheduler;
    },

    /**
     * <p>
     *   设置一个调度器对象来用于调度所有的"updates"和定时器<br/>
     *   重要:如果你设置了一个新的cc.Scheduler,那么先前创建的定时器/更新函数都将会被清除掉.
     * </p>
     * @function
     * @warning 如果你想要设置一个新的CCScheduler,则先前创建的timers/update将会被清除.
     * @param scheduler 一个被用来调度所有的更新跟定时器的cc.Scheduler对象.
     */
    setScheduler: function (scheduler) {
        if (this._scheduler != scheduler) {
            this.unscheduleAllCallbacks();
            this._scheduler = scheduler;
        }
    },

    /**
     * 返回节点的本地坐标系的外边框.<br/>
     * 
     * @deprecated 3.0版本后弃用,请使用getBoundingBox代替
     * @return {cc.Rect}
     */
    boundingBox: function(){
        cc.log(cc._LogInfos.Node_boundingBox);
        return this.getBoundingBox();
    },

    /**
     * 返回节点的本地坐标系的外边框.<br/>
     * 该返回的边框只跟它的父节点有关联.	
     * @function
     * @return {cc.Rect} 节点计算出来的外边框
     */
    getBoundingBox: function () {
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        return cc._rectApplyAffineTransformIn(rect, this.getNodeToParentTransform());
    },

    /**
     * 停止所有的动作跟调度器.
     * @function
     */
    cleanup: function () {
        // 动作
        this.stopAllActions();
        this.unscheduleAllCallbacks();

        // 事件
        cc.eventManager.removeListeners(this);

        // 定时器
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.cleanup);
    },

    // composition:GET
    /**
     * 从容器中通过子节点的标签获取一个子节点
     * @function
     * @param {Number} aTag 寻找子节点的标记.
     * @return {cc.Node} 一个标签等于传入参数的CCNode对象	
     */
    getChildByTag: function (aTag) {
        var __children = this._children;
        if (__children != null) {
            for (var i = 0; i < __children.length; i++) {
                var node = __children[i];
                if (node && node.tag == aTag)
                    return node;
            }
        }
        return null;
    },

    /**
     * 从容器中通过子节点的名称获取一个子节点
     * @function
     * @param {Number} name 寻找子节点的名称标记.
     * @return {cc.Node} 一个名称等于传入参数的CCNode对象
     */
    getChildByName: function(name){
        if(!name){
            cc.log("Invalid name");
            return null;
        }

        var locChildren = this._children;
        for(var i = 0, len = locChildren.length; i < len; i++){
           if(locChildren[i]._name == name)
            return locChildren[i];
        }
        return null;
    },

    // composition: ADD
    /** <p>"add" 逻辑必须仅使用该方法<br/> </p>
     *
     * <p>如果子节点被添加到了一个"running(活动着的)"节点,那么'onEnter'和'onEnterTransitionDidFinish' 将会立即调用</p>
     * @function
     * @param {cc.Node} child  子节点
     * @param {Number} [localZOrder=]  绘制优先级中的Z顺序值.请参阅setZOrder(int).
     * @param {Number} [tag=]  便于标记节点的整数. 请参阅setTag(int).
     */
    addChild: function (child, localZOrder, tag) {
        localZOrder = localZOrder === undefined ? child._localZOrder : localZOrder;
        var name, setTag = false;
        if(cc.isUndefined(tag)){
            tag = undefined;
            name = child._name;
        } else if(cc.isString(tag)){
            name = tag;
            tag = undefined;
        } else if(cc.isNumber(tag)){
            setTag = true;
            name = "";
        }

        cc.assert(child, cc._LogInfos.Node_addChild_3);
        cc.assert(child._parent === null, "child already added. It can't be added again");

        this._addChildHelper(child, localZOrder, tag, name, setTag);
    },

    _addChildHelper: function(child, localZOrder, tag, name, setTag){
        if(!this._children)
            this._children = [];

        this._insertChild(child, localZOrder);
        if(setTag)
            child.setTag(tag);
        else
            child.setName(name);

        child.setParent(this);
        child.setOrderOfArrival(cc.s_globalOrderOfArrival++);

        if( this._running ){
            child.onEnter();
            // 当一个节点在onEnter被添加那么防止onEnterTransitionDidFinish被调用两次
            if (this._isTransitionFinished)
                child.onEnterTransitionDidFinish();
        }

        if (this._cascadeColorEnabled)
            this._enableCascadeColor();
        if (this._cascadeOpacityEnabled)
            this._enableCascadeOpacity();
    },

    // composition: REMOVE
    /**
     * 从它的父类中删除其本身.如果cleanup为true,那么将会删除其所有的动作跟回调.<br/>
     * 如果cleanup参数没有传递进来,那么默认执行清除操作.<br/>
     * 如果该节点没有任何的父节点,那么就不会有任何的效果.
     * @function
     * @param {Boolean} [cleanup=true] 如果子节点中所有的动作和回调函数都被清除的话则为true,否则为false.
     * @see cc.Node#removeFromParentAndCleanup
     */
    removeFromParent: function (cleanup) {
        if (this._parent) {
            if (cleanup == null)
                cleanup = true;
            this._parent.removeChild(this, cleanup);
        }
    },

    /**
     * 从该节点的父节点中删除该节点本身.<br/>
     * 如果该节点没有任何的父节点,那么就不会有任何的效果.
     * @deprecated v3.0弃用,请用removeFromParent()代替
     * @param {Boolean} [cleanup=true] 如果子节点中所有的动作和回调函数都被清除的话则为true,否则为false.
     * 
     */
    removeFromParentAndCleanup: function (cleanup) {
        cc.log(cc._LogInfos.Node_removeFromParentAndCleanup);
        this.removeFromParent(cleanup);
    },

    /** <p>从这个容器中删除一个子节点.该函数会依据cleanup来对所有的运行动作进行处理.</p>
     * 如果cleanup参数没有传递进来,那么默认执行一个清除操作.<br/>
     * <p> "remove" 逻辑必须只调用该方法<br/>
     * 如果一个类想要继承'removeChild'行为,则只需要重写该方法.</p>
     * @function
     * @param {cc.Node} child  将被删除的子节点.
     * @param {Boolean} [cleanup=true]  如果子节点中所有的执行中的动作和回调函数都被清除的话则为true,否则为false.
     */
    removeChild: function (child, cleanup) {
        // explicit nil handling
        if (this._children.length === 0)
            return;

        if (cleanup == null)
            cleanup = true;
        if (this._children.indexOf(child) > -1)
            this._detachChild(child, cleanup);

        this.setNodeDirty();
        cc.renderer.childrenOrderDirty = true;
    },

    /**
     * 根据标签值从这个容器中删除一个子节点.该函数会依据cleanup参数对所有活动的动作进行清理.
     * 如果cleanup参数没有传递进来,默认执行清理操作.<br/>
     * @function
     * @param {Number} tag 标记某个子节点的整数
     * @param {Boolean} [cleanup=true] 如果子节点中所有的执行中的动作和回调函数都被清除的话则为true,否则为false.
     * @see cc.Node#removeChildByTag
     */
    removeChildByTag: function (tag, cleanup) {
        if (tag === cc.NODE_TAG_INVALID)
            cc.log(cc._LogInfos.Node_removeChildByTag);

        var child = this.getChildByTag(tag);
        if (child == null)
            cc.log(cc._LogInfos.Node_removeChildByTag_2, tag);
        else
            this.removeChild(child, cleanup);
    },

    /**
     * 从容器中删除所有的子节点并且依据cleanup参数来对所有活动的动作进行清理.
     * @param {Boolean} [cleanup=true]
     */
    removeAllChildrenWithCleanup: function (cleanup) {
        //cc.log(cc._LogInfos.Node_removeAllChildrenWithCleanup);        //TODO It should be discuss in v3.0
        this.removeAllChildren(cleanup);
    },

    /**
     * 从容器中删除所有的子节点并且依据cleanup参数来对所有活动的动作进行清理.<br/>
     * 如果cleanup参数没有传递进来,默认执行清理操作.<br/>
     * @function
     * @param {Boolean} [cleanup=true] 如果所有子节点中所有的执行中的动作都被清除的话则为true,否则为false.
     */
    removeAllChildren: function (cleanup) {
        // 在这里不使用detachChild来提高速度
        var __children = this._children;
        if (__children != null) {
            if (cleanup == null)
                cleanup = true;
            for (var i = 0; i < __children.length; i++) {
                var node = __children[i];
                if (node) {
                    // 重要
                    //  -1st 执行onExit
                    //  -2nd 清除
                    if (this._running) {
                        node.onExitTransitionDidStart();
                        node.onExit();
                    }
                    if (cleanup)
                        node.cleanup();
                    // 最后设置父节点为nil
                    node.parent = null;
                }
            }
            this._children.length = 0;
        }
    },

    _detachChild: function (child, doCleanup) {
        // 重要
        //  -1st 执行onExit
        //  -2nd 清除
        if (this._running) {
            child.onExitTransitionDidStart();
            child.onExit();
        }

		// 如果你不想进行清除,那么子节点的动作将不会被移除
        if (doCleanup)
            child.cleanup();

        // 最后设置父节点为nil
        child.parent = null;
        child._cachedParent = null;

        cc.arrayRemoveObject(this._children, child);
    },

    _insertChild: function (child, z) {
        cc.renderer.childrenOrderDirty = this._reorderChildDirty = true;
        this._children.push(child);
        child._setLocalZOrder(z);
    },

    /** 根据新的ZOrder对子节点进行排序<br/>
     * 子节点必须已经添加.
     * @function
     * @param {cc.Node} child 一个被添加过的子节点.它必须已经被添加过.
     * @param {Number} zOrder 绘制优先级中的Z顺序值,请参阅setZOrder(int)
     */
    reorderChild: function (child, zOrder) {
        cc.assert(child, cc._LogInfos.Node_reorderChild);
        cc.renderer.childrenOrderDirty = this._reorderChildDirty = true;
        child.arrivalOrder = cc.s_globalOrderOfArrival;
        cc.s_globalOrderOfArrival++;
        child._setLocalZOrder(zOrder);
        this.setNodeDirty();
    },

    /**
     * <p>
     *     在绘制之前对子节点数组进行一次排序,而不是每次添加或者排序子节点时.<br>
     *     这个方法可以大幅提高性能.
     * </p>
     * @function
     * @note 不要手工调用该函数除非一个被添加过的子节点需要在同一帧中被删除.
     * 
     */
    sortAllChildren: function () {
        if (this._reorderChildDirty) {
            var _children = this._children;

            // 插入排序
            var len = _children.length, i, j, tmp;
            for(i=1; i<len; i++){
                tmp = _children[i];
                j = i - 1;

                //当zOrder是更小或者当zOrder是一样的但mutatedIndex更小时继续往下移动元素
                while(j >= 0){
                    if(tmp._localZOrder < _children[j]._localZOrder){
                        _children[j+1] = _children[j];
                    }else if(tmp._localZOrder === _children[j]._localZOrder && tmp.arrivalOrder < _children[j].arrivalOrder){
                        _children[j+1] = _children[j];
                    }else{
                        break;
                    }
                    j--;
                }
                _children[j+1] = tmp;
            }

            //不需要递归确认子节点,在访问每个子节点的时候都已经确认完了
            this._reorderChildDirty = false;
        }
    },

    /**
     * 2d上下文跟WebGL上下文进行渲染的函数,仅供内部使用,请不要调用该函数
     * @function
     * @param {CanvasRenderingContext2D | WebGLRenderingContext} ctx 渲染上下文
     */
    draw: function (ctx) {
        // 需要重写
        // 只使用该函数进行绘制你的工作
        // 别在该函数以外进行你的绘制工作
    },

    // 仅供内部使用,请别调用该函数.
    transformAncestors: function () {
        if (this._parent != null) {
            this._parent.transformAncestors();
            this._parent.transform();
        }
    },

    //场景管理
    /**
     * <p>
     *     每次当CCNode进入"stage"时才调用事件回调<br/>
     *     如果CCNode进入"stage"状态时伴随着一个转换(transition),那么事件将会在这个转换开始的时候被调用.<br/>
     *     在onEnter过程中,你不能够访问兄弟节点.<br/>
     *     如果你重写了onEnter方法,你必须使用this._super()调用它的父类的onEnter函数.
     * </p>
     * @function
     */
    onEnter: function () {
        this._isTransitionFinished = false;
        this._running = true; //需要在resumeSchedule之前执行
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.onEnter);
        this.resume();
    },

    /**
     * <p>
     *     每次当CCNode进入"stage"时才调用事件回调.<br/>
     *     如果CCNode进入"stage"状态时伴随着一个转换(transition),那么事件将会在这个转换结束的时候被调用.<br/>
     *     如果你重写了onEnterTransitionDidFinish方法,你应该使用this._super()调用它的父类中的onEnterTransitionDidFinish函数
     * </p>
     * @function
     */
    onEnterTransitionDidFinish: function () {
        this._isTransitionFinished = true;
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.onEnterTransitionDidFinish);
    },

    /**
     * <p>每次当cc.Node离开"stage"时才调用事件回调.<br/>
     * 如果cc.Node离开"stage"状态时伴随着一个转换(transition),那么事件将会在这个转换开始的时候被调用.<br/>
     * 如果你重写了onExitTransitionDidStart方法,你应该使用this._super()调用它的父类中的onExitTransitionDidStart函数</p>
     * @function
     */
    onExitTransitionDidStart: function () {
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.onExitTransitionDidStart);
    },

    /**
     * <p>
     * 每次当cc.Node离开"stage"时才调用事件回调<br/>
     * 如果cc.Node离开"stage"状态时伴随着一个转换(transition), 那么事件将会在这个转换结束的时候被调用<br/>
     * 在onEnter过程中中你不能够访问兄弟节点.<br/>
     * 如果你重写了onExit方法,你应该使用this._super()调用它的父类中的onExit函数
     * </p>
     * @function
     */
    onExit: function () {
        this._running = false;
        this.pause();
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.onExit);
        this.removeAllComponents();
    },

    // actions
    /**
     * 执行一个动作,并且返回执行的该动作.<br/>
     * 这个节点将会变成动作的目标,参考cc.Action的getTarget()
     * @function
     * @warning 自从v0.8版本后,动作将不在retain他们的目标对象.
     * @param {cc.Action} action
     * @return {cc.Action} 动作对象的指针
     * 
     */
    runAction: function (action) {
        cc.assert(action, cc._LogInfos.Node_runAction);

        this.actionManager.addAction(action, this, !this._running);
        return action;
    },

    /**
     * 从活动中的动作列表中停止和删除所有的动作.
     * @function
     */
    stopAllActions: function () {
        this.actionManager && this.actionManager.removeAllActionsFromTarget(this);
    },

    /**
     * 从活动中的动作列表中停止和删除一个动作.
     * @function
     * @param {cc.Action} action 要被删除的动作对象.
     */
    stopAction: function (action) {
        this.actionManager.removeAction(action);
    },

    /**
     * 根据它的标签从活动中的动作列表中删除该动作.
     * @function
     * @param {Number} tag 要被删除的动作的标签.
     */
    stopActionByTag: function (tag) {
        if (tag === cc.ACTION_TAG_INVALID) {
            cc.log(cc._LogInfos.Node_stopActionByTag);
            return;
        }
        this.actionManager.removeActionByTag(tag, this);
    },

    /**
     * 根据它的标签从活动中的动作列表中返回一个动作.
     * @function
     * @see cc.Node#getTag and cc.Node#setTag
     * @param {Number} tag
     * @return {cc.Action} 给定标签的动作对象.
     */
    getActionByTag: function (tag) {
        if (tag === cc.ACTION_TAG_INVALID) {
            cc.log(cc._LogInfos.Node_getActionByTag);
            return null;
        }
        return this.actionManager.getActionByTag(tag, this);
    },

    /** <p>返回活动中的动作数量加上正在调度运行的动作的数量的和(在actionsToAdd状态的动作和动作数组中的).<br/>
     *    组合的动作被记为一个动作.例如:<br/>
     *    如果你正在运行一个包含7个动作的序列(Sequence), 它将返回 1.<br/>
     *    如果你正在运行包含2个动作中的7个序列(Sequence),它将返回 7.</p>
     * @function
     * @return {Number} 被调度去执行的动作数量加上正在运行中的动作数量.
     */
    getNumberOfRunningActions: function () {
        return this.actionManager.numberOfRunningActionsInTarget(this);
    },

    // cc.Node - 回调
    // 定时器
    /**
     * <p>调度器调度"update"方法.<br/>
     * 它使用的序列号是0.该方法每帧调用一次.<br/>
     * 拥有低顺序值的调度方法将会在有用高顺序值的方法之前被调用.<br/>
     * 在每一个节点中,只有一个"update"方法能够被调度.</p>
     * @function
     */
    scheduleUpdate: function () {
        this.scheduleUpdateWithPriority(0);
    },

    /**
     * <p>
     * 使用一个自定义优先级调度这个"update"方法
     * 这个回调函数将会在每一帧被调用一次.<br/>
     * 拥有低顺序值的调度方法将会在有用高顺序值的方法之前被调用.<br/>
     * 在每一个节点中,只有一个"update"方法能够被调度(你不能够有2个"update"回调函数).<br/>
     * </p>
     * @function
     * @param {Number} priority
     */
    scheduleUpdateWithPriority: function (priority) {
        this.scheduler.scheduleUpdateForTarget(this, priority, !this._running);
    },

    /**
     * 不调度"update"方法.
     * @function
     * @see cc.Node#scheduleUpdate
     */
    unscheduleUpdate: function () {
        this.scheduler.unscheduleUpdateForTarget(this);
    },

    /**
     * <p>调度一个自定义的选择器.<br/>
     * 如果这个选择器已经被调度了,那么内部的参数将会被更新而不用再次调度一遍.</p>	
     * @function
     * @param {function} callback_fn 封装成的选择器的函数
     * @param {Number} interval  运行时间间隔,以秒为单位.0表示每一帧运行一次.如果 interval = 0, 推荐使用scheduleUpdate()来代替.
     * @param {Number} repeat    选择器将会被执行(repeat + 1)次,你可以使用kCCRepeatForever来无限循环执行.
     * @param {Number} delay     在执行之前,第一次运行需要等待的时间.
     * 
     */
    schedule: function (callback_fn, interval, repeat, delay) {
        interval = interval || 0;

        cc.assert(callback_fn, cc._LogInfos.Node_schedule);
        cc.assert(interval >= 0, cc._LogInfos.Node_schedule_2);

        repeat = (repeat == null) ? cc.REPEAT_FOREVER : repeat;
        delay = delay || 0;

        this.scheduler.scheduleCallbackForTarget(this, callback_fn, interval, repeat, delay, !this._running);
    },

    /**
     * 使用一个0s或者更大时长的延时,调度一个只运行一次的回调函数
     * @function
     * @see cc.Node#schedule
     * @param {function} callback_fn  封装成的选择器的函数
     * @param {Number} delay  在执行之前,第一次运行需要等待的时间数.	
     */
    scheduleOnce: function (callback_fn, delay) {
        this.schedule(callback_fn, 0.0, 0, delay);
    },

    /**
     * 不调度一个自定义的回调函数.
     * @function
     * @see cc.Node#schedule
     * @param {function} callback_fn  函数包装成的选择器
     */
    unschedule: function (callback_fn) {
        if (!callback_fn)
            return;

        this.scheduler.unscheduleCallbackForTarget(this, callback_fn);
    },

    /**
     * <p>不调度所有的调度回调函数:自定义回调函数,和'update'回调函数.<br/>
     * 动作不会受到该方法的影响.</p>
     * @function
     */
    unscheduleAllCallbacks: function () {
        this.scheduler.unscheduleAllCallbacksForTarget(this);
    },

    /**
     * 重置所有的调度选择器跟调度动作.<br/>
     * 该方法在onEnter方法内部被调用.
     * @function
     * @deprecated v3.0后弃用,请使用resume()代替	
     */
    resumeSchedulerAndActions: function () {
        cc.log(cc._LogInfos.Node_resumeSchedulerAndActions);
        this.resume();
    },

    /**
     * <p>重置所有的调度选择器跟调度动作.<br/>
     * 该方法在onEnter方法内部被调用.</p>
     */
    resume: function () {
        this.scheduler.resumeTarget(this);
        this.actionManager && this.actionManager.resumeTarget(this);
        cc.eventManager.resumeTarget(this);
    },

    /**
     * <p>暂停所有的调度选择器跟调度动作.<br/>
     * 该方法在onExit方法内部被调用.</p>
     * @deprecated v3.0后弃用,请使用pause代替
     * 
     * @function
     */
    pauseSchedulerAndActions: function () {
        cc.log(cc._LogInfos.Node_pauseSchedulerAndActions);
        this.pause();
    },

    /**
     * <p>暂停所有的调度选择器跟调度动作.<br/>
     * 该方法在onExit方法内部被调用.</p>
     * 
     * @function
     */
    pause: function () {
        this.scheduler.pauseTarget(this);
        this.actionManager && this.actionManager.pauseTarget(this);
        cc.eventManager.pauseTarget(this);
    },

    /**
     *<p>为节点设置一个附加转换矩阵.<br/>
     *  该附加转换矩阵将会在getNodeToParentTransform结束后进行级联.<br/>
     *  它将被用于模拟两个节点之间的父子关系(例如:一个BatchNode,另一个不是).<br/>
     *  </p>
     *  @function
     *  @param {cc.AffineTransform} additionalTransform  附加的转换
     *  @example
     * // 创建batchNode
     * var batch = new cc.SpriteBatchNode("Icon-114.png");
     * this.addChild(batch);
     *
     * // 创建两个精灵,spriteA将会被添加到batchNode,他们使用不同的纹理.
     * var spriteA = new cc.Sprite(batch->getTexture());
     * var spriteB = new cc.Sprite("Icon-72.png");
     *
     * batch.addChild(spriteA);
     *
     * // 我们不能将spriteB当做spriteA的子节点来处理因为他们使用不同的纹理.所以将其添加到layer中.
     * // 但我们想为这两个节点模拟'parent-child'(父子)关系.
     * this.addChild(spriteB);
     *
     * //位置
     * spriteA.setPosition(ccp(200, 200));
     *
     * // 获取spriteA的变换.
     * var t = spriteA.getNodeToParentTransform();
     *
     * // 设置附加变换矩阵给spriteB,spriteB的位置将会基于其伪父亲的位置即spriteA.
     * spriteB.setAdditionalTransform(t);
     *
     * //缩放
     * spriteA.setScale(2);
     *
     * // 获取spriteA的变换.
     * t = spriteA.getNodeToParentTransform();
     *
     * // 设置附加变换矩阵给spriteB,spriteB的缩放比例将会基于其伪父亲的缩放比例即spriteA.
     * spriteB.setAdditionalTransform(t);
     *
     * //旋转
     * spriteA.setRotation(20);
     *
     * // 获取spriteA的变换.
     * t = spriteA.getNodeToParentTransform();
     *
     * // 设置附加变换矩阵给spriteB,spriteB的旋转将会基于其伪父亲的旋转即spriteA.
     * spriteB.setAdditionalTransform(t);
     */
    setAdditionalTransform: function (additionalTransform) {
        this._additionalTransform = additionalTransform;
        this._transformDirty = true;
        this._additionalTransformDirty = true;
    },

    /**
     * 返回由父节点空间坐标系变换至本节点的本地坐标系的矩阵.<br/>
     * 矩阵单位是像素.	
     * @function
     * @return {cc.AffineTransform}
     */
    getParentToNodeTransform: function () {
        if (this._inverseDirty) {
            this._inverse = cc.affineTransformInvert(this.getNodeToParentTransform());
            this._inverseDirty = false;
        }
        return this._inverse;
    },

    /**
     * @function
     * @deprecated v3.0版本后弃用,请使用getParentToNodeTransform代替.
     */
    parentToNodeTransform: function () {
        return this.getParentToNodeTransform();
    },

    /**
     * 返回世界仿射变换矩阵.矩阵单位是像素.
     * @function
     * @return {cc.AffineTransform}
     */
    getNodeToWorldTransform: function () {
        var t = this.getNodeToParentTransform();
        for (var p = this._parent; p != null; p = p.parent)
            t = cc.affineTransformConcat(t, p.getNodeToParentTransform());
        return t;
    },

    /**
     * @function
     * @deprecated v3.0版本后弃用,请使用getNodeToWorldTransform代替.
     */
    nodeToWorldTransform: function(){
        return this.getNodeToWorldTransform();
    },

    /**
     * 返回世界仿射变换矩阵的逆变换矩阵.矩阵单位是像素.
     * @function
     * @return {cc.AffineTransform}
     */
    getWorldToNodeTransform: function () {
        return cc.affineTransformInvert(this.getNodeToWorldTransform());
    },

    /**
     * @function
     * @deprecated v3.0版本后弃用,请使用getWorldToNodeTransform代替.
     */
    worldToNodeTransform: function () {
        return this.getWorldToNodeTransform();
    },

    /**
     * 将一个世界坐标点转换到节点空间坐标系.结果以Points为单位.
     * @function
     * @param {cc.Point} worldPoint
     * @return {cc.Point}
     */
    convertToNodeSpace: function (worldPoint) {
        return cc.pointApplyAffineTransform(worldPoint, this.getWorldToNodeTransform());
    },

    /**
     * 将一个节点坐标点转换到世界坐标系.结果以Points为单位.
     * @function
     * @param {cc.Point} nodePoint
     * @return {cc.Point}
     */
    convertToWorldSpace: function (nodePoint) {
        nodePoint = nodePoint || cc.p(0,0);
        return cc.pointApplyAffineTransform(nodePoint, this.getNodeToWorldTransform());
    },

    /**
     * 将一个世界坐标点转换到节点空间坐标系.结果以Points为单位.<br/>
     * 将传入/传出点作为节点的的锚点.
     * @function
     * @param {cc.Point} worldPoint
     * @return {cc.Point}
     */
    convertToNodeSpaceAR: function (worldPoint) {
        return cc.pSub(this.convertToNodeSpace(worldPoint), this._anchorPointInPoints);
    },

    /**
     * 将一个节点坐标点转换到世界坐标系.结果以Points为单位.<br/>
     * 将传入/传出点作为节点的的锚点.
     * @function
     * @param {cc.Point} nodePoint
     * @return {cc.Point}
     */
    convertToWorldSpaceAR: function (nodePoint) {
        nodePoint = nodePoint || cc.p(0,0);
        var pt = cc.pAdd(nodePoint, this._anchorPointInPoints);
        return this.convertToWorldSpace(pt);
    },

    _convertToWindowSpace: function (nodePoint) {
        var worldPoint = this.convertToWorldSpace(nodePoint);
        return cc.director.convertToUI(worldPoint);
    },

    /** 将cc.Touch转换成cc.Point的简单方法
     * @function
     * @param {cc.Touch} touch 触摸对象
     * @return {cc.Point}
     */
    convertTouchToNodeSpace: function (touch) {
        var point = touch.getLocation();
        //TODO 该点在HTML5中不需要转换至GL
        //point = cc.director.convertToGL(point);
        return this.convertToNodeSpace(point);
    },

    /**
     * 将cc.Touch(世界坐标系)转换成本地坐标系.这个方法是AR(锚点相关). 
     * @function
     * @param {cc.Touch} touch 触摸对象
     * @return {cc.Point}
     */
    convertTouchToNodeSpaceAR: function (touch) {
        var point = touch.getLocation();
        point = cc.director.convertToGL(point);
        return this.convertToNodeSpaceAR(point);
    },

    /**
     * 如果"scheduleUpdate"被调用且当节点活动(live)时,Update将会在每一帧自动调用.<br/>
     * 默认的动作是调用节点的componentContainer的visit函数.<br/>
     * 重写该函数从而实现你自己的更新方法.
     * @function
     * @param {Number} dt 最近一次更新后的间隔时间
     */
    update: function (dt) {
        if (this._componentContainer && !this._componentContainer.isEmpty())
            this._componentContainer.visit(dt);
    },

    /**
     * <p>
     * 递归调用子节点的updateTransform()方法.<br/>
     * 这个方法已经从Sprite类中迁移,因此它不仅仅是Sprite特有的.<br/>
     * 因此,你可以在你自定义的CCNode中使用SpriteBatchNode的优化.<br/>
     * 例如,batchNode->addChild(myCustomNode),之前只能使用addChild(sprite).
     * </p>
     * @function
     */
    updateTransform: function () {
        // Recursively iterate over children
        // 递归遍历子节点
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.updateTransform);
    },

    /**
     * <p>当前JavaScript Bindings (JSB),由于某些原因,需要使用retain和release.<p>		
     * 这是在JSB中的一个bug,而且是不好的解决方式. 这两个方法需要添加使其兼容JSB.
     * 这是一个漏洞,一旦JSB修复了retain/release的bug,则它需要被移除<br/>
     * 你将需要retain一个对象,如果你创建一个引擎对象但没有在同一帧中将其添加进scene graph中.<br/>
     * 否则,JSB本地自动释放池将会认为它是一个未被使用的对象并直接释放它,<br/>
     * 如果想要在后面使用它,则会抛出一个"Invalid Native Object"错误.<br/>
     * retain方法会为原生对象增加一个引用计数避免其被释放掉,<br/>
     * 当你认为一个对象不再需要的时候你需要手工调用release方法,否则,将会造成内存泄露.<br/>
     * 在开发者的代码中,retain和release方法需要成对调用.</p>
     * 
     * @function
     * @see cc.Node#release
     */
    retain: function () {
    },
    /**
     * <p>当前JavaScript Bindings (JSB),由于某些原因,需要使用retain和release.<p>		
     * 这是在JSB中的一个bug,而且是不好的解决方式. 这两个方法需要添加使其兼容JSB.
     * 这是一个漏洞,一旦JSB修复了retain/release的bug,则它需要被移除<br/>
     * 你将需要retain一个对象,如果你创建一个引擎对象但没有在同一帧中将其添加进scene graph中.<br/>
     * 否则,JSB本地自动释放池将会认为它是一个未被使用的对象并直接释放它,<br/>
     * 如果想要在后面使用它,则会抛出一个"Invalid Native Object"错误.<br/>
     * retain方法会为原生对象增加一个引用计数避免其被释放掉,<br/>
     * 当你认为一个对象不再需要的时候你需要手工调用release方法,否则,将会造成内存泄露.<br/>
     * 在开发者的代码中,retain和release方法需要成对调用.</p>
     * @function
     * @see cc.Node#retain
     */
    release: function () {
    },

    /**
     * 根据组件名称获取组件
     * @function
     * @param {String} name 搜索用的名称
     * @return {cc.Component} 找到的组件
     */
    getComponent: function (name) {
        if(this._componentContainer)
            return this._componentContainer.getComponent(name);
        return null;
    },

    /**
     * 添加一个组件到节点的组件容器中.
     * @function
     * @param {cc.Component} component
     */
    addComponent: function (component) {
        if(this._componentContainer)
            this._componentContainer.add(component);
    },

    /**
     * 根据定义的组件名称或者组件对象删除组件
     * @function
     * @param {String|cc.Component} component
     */
    removeComponent: function (component) {
        if(this._componentContainer)
            return this._componentContainer.remove(component);
        return false;
    },

    /**
     * 删除节点的所有组件,当节点从stage退出的时候会被调用.
     * @function
     */
    removeAllComponents: function () {
        if(this._componentContainer)
            this._componentContainer.removeAll();
    },

    grid: null,

    /**
     * 构造函数,为了继承父类构造器中的行为进行重写,记得在要继承的函数中调用"this._super()".
     * @function
     */
    ctor: null,

    /**
     * 递归访问子类并绘制出子类
     * @function
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx
     */
    visit: null,

    /**
     * 执行基于位置,缩放,旋转及其他属性的视图矩阵变换.
     * @function
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx 渲染上下文
     */
    transform: null,

    /**
     * <p>获取节点从本地空间坐标到父节点中的空间坐标的转换矩阵<br/>
     * 矩阵单位是像素.</p>
     * @function
     * @return {cc.AffineTransform}
     * @deprecated v3.0版本后弃用, 请使用getNodeToParentTransform替代
     */
    nodeToParentTransform: function(){
        return this.getNodeToParentTransform();
    },

    /**
     * 获取节点从本地空间坐标到父节点中的空间坐标的转换矩阵<br/>
     * 矩阵单位是像素.
     * @function
     * @return {cc.AffineTransform} 仿射变换矩阵对象
     */
    getNodeToParentTransform: null,

    _setNodeDirtyForCache: function () {
        if (this._cacheDirty === false) {
            this._cacheDirty = true;

            var cachedP = this._cachedParent;
            //var cachedP = this._parent;
            cachedP && cachedP != this && cachedP._setNodeDirtyForCache();
        }
    },

    _setCachedParent: function(cachedParent){
        if(this._cachedParent ==  cachedParent)
            return;

        this._cachedParent = cachedParent;
        var children = this._children;
        for(var i = 0, len = children.length; i < len; i++)
            children[i]._setCachedParent(cachedParent);
    },

    /**
     * 返回一个摄像机对象,使你可以使用一个gluLookAt对节点进行移动	
     * @function
     * @return {cc.Camera} A CCCamera可以让你使用一个gluLookAt来移动节点
     * @deprecated v3.0后弃用,不再使用的函数.
     * @example
     * var camera = node.getCamera();
     * camera.setEye(0, 0, 415/2);
     * camera.setCenter(0, 0, 0);
     */
    getCamera: function () {
        if (!this._camera) {
            this._camera = new cc.Camera();
        }
        return this._camera;
    },

    /**
     * <p>当应用效果的时候,获取一个被使用的网格对象<br/>
     * 该函数已被废弃,请使用cc.NodeGrid进行创建网格动作</p>
     * @function
     * @return {cc.GridBase} 使用效果时将被使用的CCGrid对象
     * @deprecated v3.0后弃用,不再使用的函数.
     */
    getGrid: function () {
        return this.grid;
    },

    /**
     * <p>当使用效果的时候,改变一个被使用的网格对象<br/>
     * 该函数已被废弃,请使用cc.NodeGrid进行创建网格动作</p>
     * @function
     * @param {cc.GridBase} grid 使用效果时将被使用的CCGrid对象
     * @deprecated v3.0后弃用,不再使用的函数.
     */
    setGrid: function (grid) {
        this.grid = grid;
    },

    /**
     * 返回节点当前所使用的着色程序
     * @function
     * @return {cc.GLProgram} 该节点当前使用的着色器.
     * 
     */
    getShaderProgram: function () {
        return this._shaderProgram;
    },

    /**
     * <p>
     *     设置节点着色程序
     *
     *     v2.0版本以后,每个要渲染的节点都要设置它的着色程序.
     *     它必须在初始化阶段进行
     * </p>
     * @function
     * @param {cc.GLProgram} newShaderProgram 从CCShaderCache获得的着色器程序.
     * @example
     * node.setGLProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
     */
    setShaderProgram: function (newShaderProgram) {
        this._shaderProgram = newShaderProgram;
    },

    /**
     * 返回OpenGL服务的状态.
     * @function
     * @return {Number} OpenGL服务的状态.
     * @deprecated v3.0后弃用,不再被使用	
     */
    getGLServerState: function () {
        return this._glServerState;
    },

    /**
     * 设置OpenGL服务的状态.
     * @function
     * @param {Number} state OpenGL服务的状态.
     * @deprecated v3.0后弃用,不再被使用
     */
    setGLServerState: function (state) {
        this._glServerState = state;
    },

    /**
     * 返回节点的世界坐标系的边框.
     * @function
     * @return {cc.Rect}
     */
    getBoundingBoxToWorld: function () {
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        var trans = this.getNodeToWorldTransform();
        rect = cc.rectApplyAffineTransform(rect, this.getNodeToWorldTransform());

        //查询子节点的BoundingBox
        if (!this._children)
            return rect;

        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var child = locChildren[i];
            if (child && child._visible) {
                var childRect = child._getBoundingBoxToCurrentNode(trans);
                if (childRect)
                    rect = cc.rectUnion(rect, childRect);
            }
        }
        return rect;
    },

    _getBoundingBoxToCurrentNode: function (parentTransform) {
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        var trans = (parentTransform == null) ? this.getNodeToParentTransform() : cc.affineTransformConcat(this.getNodeToParentTransform(), parentTransform);
        rect = cc.rectApplyAffineTransform(rect, trans);

        //查询子节点的BoundingBox
        if (!this._children)
            return rect;

        var locChildren = this._children;
        for (var i = 0; i < locChildren.length; i++) {
            var child = locChildren[i];
            if (child && child._visible) {
                var childRect = child._getBoundingBoxToCurrentNode(trans);
                if (childRect)
                    rect = cc.rectUnion(rect, childRect);
            }
        }
        return rect;
    },

    _getNodeToParentTransformForWebGL: function () {
        var _t = this;
        if(_t._usingNormalizedPosition && _t._parent){        //TODO need refactor
            var conSize = _t._parent._contentSize;
            _t._position.x = _t._normalizedPosition.x * conSize.width;
            _t._position.y = _t._normalizedPosition.y * conSize.height;
            _t._normalizedPositionDirty = false;
        }
        if (_t._transformDirty) {
            // 变换值
            var x = _t._position.x;
            var y = _t._position.y;
            var apx = _t._anchorPointInPoints.x, napx = -apx;
            var apy = _t._anchorPointInPoints.y, napy = -apy;
            var scx = _t._scaleX, scy = _t._scaleY;

            if (_t._ignoreAnchorPointForPosition) {
                x += apx;
                y += apy;
            }

            // 旋转值
            // 改变旋转代码来处理处理X轴跟Y轴
            // 如果我们只用相同的值来对X轴跟Y轴进行倾斜,那么我们仅仅只是进行了旋转
            var cx = 1, sx = 0, cy = 1, sy = 0;
            if (_t._rotationX !== 0 || _t._rotationY !== 0) {
                cx = Math.cos(-_t._rotationRadiansX);
                sx = Math.sin(-_t._rotationRadiansX);
                cy = Math.cos(-_t._rotationRadiansY);
                sy = Math.sin(-_t._rotationRadiansY);
            }
            var needsSkewMatrix = ( _t._skewX || _t._skewY );

            // 优化:
            // 如果不需要倾斜 则进行内联锚点的计算
            // 对旋转倾斜进行变换计算
            if (!needsSkewMatrix && (apx !== 0 || apy !== 0)) {
                x += cy * napx * scx + -sx * napy * scy;
                y += sy * napx * scx + cx * napy * scy;
            }

            // 生成转换矩阵
            // 对旋转倾斜进行变换计算
            var t = _t._transform;
            t.a = cy * scx;
            t.b = sy * scx;
            t.c = -sx * scy;
            t.d = cx * scy;
            t.tx = x;
            t.ty = y;

            // XXX: 尝试内联倾斜
            // 如果需要倾斜,使用倾斜然后再锚点
            if (needsSkewMatrix) {
                t = cc.affineTransformConcat({a: 1.0, b: Math.tan(cc.degreesToRadians(_t._skewY)),
                    c: Math.tan(cc.degreesToRadians(_t._skewX)), d: 1.0, tx: 0.0, ty: 0.0}, t);

                // adjust anchor point
                if (apx !== 0 || apy !== 0)
                    t = cc.affineTransformTranslate(t, napx, napy);
            }

            if (_t._additionalTransformDirty) {
                t = cc.affineTransformConcat(t, _t._additionalTransform);
                _t._additionalTransformDirty = false;
            }
            _t._transform = t;
            _t._transformDirty = false;
        }
        return _t._transform;
    },

    _updateColor: function(){
        //TODO
    },

    /**
     * 返回节点的透明度
     * @function
     * @returns {number} opacity
     */
    getOpacity: function () {
        return this._realOpacity;
    },

    /**
     * 返回节点的显示的透明度值,
     * 显示透明度跟透明度的区别在于:当启用级联不透明度的时候,显示透明度是基于自身的透明度跟父节点的透明度计算出来的.
     * @function
     * @returns {number} 显示的透明度
     * 
     */
    getDisplayedOpacity: function () {
        return this._displayedOpacity;
    },

    /**
     * 设置节点的透明度值
     * @function
     * @param {Number} opacity
     */
    setOpacity: function (opacity) {
        this._displayedOpacity = this._realOpacity = opacity;

        var parentOpacity = 255, locParent = this._parent;
        if (locParent && locParent.cascadeOpacity)
            parentOpacity = locParent.getDisplayedOpacity();
        this.updateDisplayedOpacity(parentOpacity);

        this._displayedColor.a = this._realColor.a = opacity;
    },

    /**
     * 更新显示透明度
     * @function
     * @param {Number} parentOpacity
     */
    updateDisplayedOpacity: function (parentOpacity) {
        this._displayedOpacity = this._realOpacity * parentOpacity / 255.0;
        if(this._rendererCmd && this._rendererCmd._opacity !== undefined)
            this._rendererCmd._opacity = this._displayedOpacity / 255;
        if (this._cascadeOpacityEnabled) {
            var selChildren = this._children;
            for (var i = 0; i < selChildren.length; i++) {
                var item = selChildren[i];
                if (item)
                    item.updateDisplayedOpacity(this._displayedOpacity);
            }
        }
    },

    /**
     * 返回节点的透明度值是否会影响到其子节点.
     * @function
     * @returns {boolean}
     */
    isCascadeOpacityEnabled: function () {
        return this._cascadeOpacityEnabled;
    },

    /**
     * 启用或禁用级联不透明度,如果启用,子节点的透明度值是父节点的透明度值跟其本身透明度值的乘积.
     * @function
     * @param {boolean} cascadeOpacityEnabled
     */
    setCascadeOpacityEnabled: function (cascadeOpacityEnabled) {
        if (this._cascadeOpacityEnabled === cascadeOpacityEnabled)
            return;

        this._cascadeOpacityEnabled = cascadeOpacityEnabled;
        if (cascadeOpacityEnabled)
            this._enableCascadeOpacity();
        else
            this._disableCascadeOpacity();
    },

    _enableCascadeOpacity: function () {
        var parentOpacity = 255, locParent = this._parent;
        if (locParent && locParent.cascadeOpacity)
            parentOpacity = locParent.getDisplayedOpacity();
        this.updateDisplayedOpacity(parentOpacity);
    },

    _disableCascadeOpacity: function () {
        this._displayedOpacity = this._realOpacity;

        var selChildren = this._children;
        for (var i = 0; i < selChildren.length; i++) {
            var item = selChildren[i];
            if (item)
                item.updateDisplayedOpacity(255);
        }
    },

    /**
     * 返回节点的颜色
     * @function
     * @returns {cc.Color}
     */
    getColor: function () {
        var locRealColor = this._realColor;
        return cc.color(locRealColor.r, locRealColor.g, locRealColor.b, locRealColor.a);
    },

    /**
     * 返回节点显示的颜色,			
     * 显示颜色跟颜色的区别在于:当启用级联颜色的时候,显示颜色是基于自身的颜色跟父节点的颜色计算出来的.
     * @function
     * @returns {cc.Color}
     */
    getDisplayedColor: function () {
        var tmpColor = this._displayedColor;
        return cc.color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a);
    },

    /**
     * <p>设置节点的颜色.<br/>
     * 当颜色未包含透明度的值 例如:cc.color(128,128,128),该函数仅仅是改变颜色.<br/>
     * 当颜色包含透明度值 例如:cc.color(128,128,128,100),该函数将改变颜色跟透明度.</p>
     * @function
     * @param {cc.Color} color 传入的新的颜色
     * 
     */
    setColor: function (color) {
        var locDisplayedColor = this._displayedColor, locRealColor = this._realColor;
        locDisplayedColor.r = locRealColor.r = color.r;
        locDisplayedColor.g = locRealColor.g = color.g;
        locDisplayedColor.b = locRealColor.b = color.b;

        var parentColor, locParent = this._parent;
        if (locParent && locParent.cascadeColor)
            parentColor = locParent.getDisplayedColor();
        else
            parentColor = cc.color.WHITE;
        this.updateDisplayedColor(parentColor);
    },

    /**
     * 更新节点的显示颜色
     * @function
     * @param {cc.Color} parentColor
     */
    updateDisplayedColor: function (parentColor) {
        var locDispColor = this._displayedColor, locRealColor = this._realColor;
        locDispColor.r = 0 | (locRealColor.r * parentColor.r / 255.0);
        locDispColor.g = 0 | (locRealColor.g * parentColor.g / 255.0);
        locDispColor.b = 0 | (locRealColor.b * parentColor.b / 255.0);

        if (this._cascadeColorEnabled) {
            var selChildren = this._children;
            for (var i = 0; i < selChildren.length; i++) {
                var item = selChildren[i];
                if (item)
                    item.updateDisplayedColor(locDispColor);
            }
        }
    },

    /**
     * 返回该节点的颜色值是否会影响到其子节点.
     * @function
     * @returns {boolean}
     */
    isCascadeColorEnabled: function () {
        return this._cascadeColorEnabled;
    },

    /**
     * 启用或者禁用级联颜色,如果启用,则子节点的颜色将级联父节点的颜色值跟其本身的颜色值.
     * @param {boolean} cascadeColorEnabled
     */
    setCascadeColorEnabled: function (cascadeColorEnabled) {
        if (this._cascadeColorEnabled === cascadeColorEnabled)
            return;
        this._cascadeColorEnabled = cascadeColorEnabled;
        if (this._cascadeColorEnabled)
            this._enableCascadeColor();
        else
            this._disableCascadeColor();
    },

    _enableCascadeColor: function () {
        var parentColor , locParent = this._parent;
        if (locParent && locParent.cascadeColor)
            parentColor = locParent.getDisplayedColor();
        else
            parentColor = cc.color.WHITE;
        this.updateDisplayedColor(parentColor);
    },

    _disableCascadeColor: function () {
        var locDisplayedColor = this._displayedColor, locRealColor = this._realColor;
        locDisplayedColor.r = locRealColor.r;
        locDisplayedColor.g = locRealColor.g;
        locDisplayedColor.b = locRealColor.b;

        var selChildren = this._children, whiteColor = cc.color.WHITE;
        for (var i = 0; i < selChildren.length; i++) {
            var item = selChildren[i];
            if (item)
                item.updateDisplayedColor(whiteColor);
        }
    },

    /**
     * 设置颜色值是否要跟着透明度进行改变,
     * 该函数在cc.Node中无效,但该函数在某些类中被重写了,以便使用该功能.
     * @function
     * @param {Boolean} opacityValue
     */
    setOpacityModifyRGB: function (opacityValue) {
    },

    /**
     * 获取颜色值是否因透明度值的改变而改变
     * @function
     * @return {Boolean}
     */
    isOpacityModifyRGB: function () {
        return false;
    },

    _initRendererCmd: function(){
    },

    _transformForRenderer: null
});

/**
 * 为一个节点分配内存并初始化这个节点
 * @deprecated v3.0版本后弃用, 请用新的构造器替代.
 * @see cc.Node
 * @return {cc.Node}
 */
cc.Node.create = function () {
    return new cc.Node();
};

cc.Node._stateCallbackType = {onEnter: 1, onExit: 2, cleanup: 3, onEnterTransitionDidFinish: 4, updateTransform: 5, onExitTransitionDidStart: 6, sortAllChildren: 7};

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
    //重定义 cc.Node
    var _p = cc.Node.prototype;
    _p.ctor = function () {
        this._initNode();
        this._initRendererCmd();
    };

    _p.setNodeDirty = function () {
        var _t = this;
        if(_t._transformDirty === false){
            _t._setNodeDirtyForCache();
            _t._renderCmdDiry = _t._transformDirty = _t._inverseDirty = true;
            cc.renderer.pushDirtyNode(this);
        }
    };

    _p.visit = function (ctx) {
        var _t = this;
        // 如果不可见则立即返回
        if (!_t._visible)
            return;

        if( _t._parent)
            _t._curLevel = _t._parent._curLevel + 1;

        //访问canvas(画布)
        var i, children = _t._children, child;
        _t.transform();
        var len = children.length;
        if (len > 0) {
            _t.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < len; i++) {
                child = children[i];
                if (child._localZOrder < 0)
                    child.visit();
                else
                    break;
            }
            //_t.draw(context);
            if(this._rendererCmd)
                cc.renderer.pushRenderCommand(this._rendererCmd);
            for (; i < len; i++) {
                children[i].visit();
            }
        } else{
            if(this._rendererCmd)
                cc.renderer.pushRenderCommand(this._rendererCmd);
        }
        this._cacheDirty = false;
    };

    _p._transformForRenderer = function () {
        var t = this.getNodeToParentTransform(), worldT = this._transformWorld;
        if(this._parent){
            var pt = this._parent._transformWorld;
            //worldT = cc.AffineTransformConcat(t, pt);
            worldT.a = t.a * pt.a + t.b * pt.c;                               //a
            worldT.b = t.a * pt.b + t.b * pt.d;                               //b
            worldT.c = t.c * pt.a + t.d * pt.c;                               //c
            worldT.d = t.c * pt.b + t.d * pt.d;                               //d
            var plt = this._parent._transform;
            var xOffset = -(plt.b + plt.c) * t.ty;
            var yOffset = -(plt.b + plt.c) * t.tx;
            worldT.tx = (t.tx * pt.a + t.ty * pt.c + pt.tx + xOffset);        //tx
            worldT.ty = (t.tx * pt.b + t.ty * pt.d + pt.ty + yOffset);		  //ty
        } else {
            worldT.a = t.a;
            worldT.b = t.b;
            worldT.c = t.c;
            worldT.d = t.d;
            worldT.tx = t.tx;
            worldT.ty = t.ty;
        }
        this._renderCmdDiry = false;
        if(!this._children || this._children.length === 0)
            return;
        var i, len, locChildren = this._children;
        for(i = 0, len = locChildren.length; i< len; i++){
            locChildren[i]._transformForRenderer();
        }
    };

    _p.transform = function (ctx) {
        // transform for canvas
        var t = this.getNodeToParentTransform(),
            worldT = this._transformWorld;         //获取世界坐标变换

        if(this._parent){
            var pt = this._parent._transformWorld;
            // cc.AffineTransformConcat is incorrect at get world transform
            worldT.a = t.a * pt.a + t.b * pt.c;                               //a
            worldT.b = t.a * pt.b + t.b * pt.d;                               //b
            worldT.c = t.c * pt.a + t.d * pt.c;                               //c
            worldT.d = t.c * pt.b + t.d * pt.d;                               //d

            var plt = this._parent._transform;
            var xOffset = -(plt.b + plt.c) * t.ty;
            var yOffset = -(plt.b + plt.c) * t.tx;
            worldT.tx = (t.tx * pt.a + t.ty * pt.c + pt.tx + xOffset);        //tx
            worldT.ty = (t.tx * pt.b + t.ty * pt.d + pt.ty + yOffset);		  //ty
        } else {
            worldT.a = t.a;
            worldT.b = t.b;
            worldT.c = t.c;
            worldT.d = t.d;
            worldT.tx = t.tx;
            worldT.ty = t.ty;
        }
    };

    _p.getNodeToParentTransform = function () {
        var _t = this;
        if(_t._usingNormalizedPosition && _t._parent){        //TODO 需要重构
            var conSize = _t._parent._contentSize;
            _t._position.x = _t._normalizedPosition.x * conSize.width;
            _t._position.y = _t._normalizedPosition.y * conSize.height;
            _t._normalizedPositionDirty = false;
        }
        if (_t._transformDirty) {
            var t = _t._transform;//快速引用

            // base position
            t.tx = _t._position.x;
            t.ty = _t._position.y;

            // Cos和Sin旋转
            var Cos = 1, Sin = 0;
            if (_t._rotationX) {
                Cos = Math.cos(_t._rotationRadiansX);
                Sin = Math.sin(_t._rotationRadiansX);
            }

            // 基准abcd
            t.a = t.d = Cos;
            t.b = -Sin;
            t.c = Sin;

            var lScaleX = _t._scaleX, lScaleY = _t._scaleY;
            var appX = _t._anchorPointInPoints.x, appY = _t._anchorPointInPoints.y;

            // Firefox on Vista and XP crashes
            // GPU thread in case of scale(0.0, 0.0)
            var sx = (lScaleX < 0.000001 && lScaleX > -0.000001) ? 0.000001 : lScaleX,
                sy = (lScaleY < 0.000001 && lScaleY > -0.000001) ? 0.000001 : lScaleY;

            // skew
            if (_t._skewX || _t._skewY) {
                // 偏移锚点
                var skx = Math.tan(-_t._skewX * Math.PI / 180);
                var sky = Math.tan(-_t._skewY * Math.PI / 180);
                if(skx === Infinity){
                    skx = 99999999;
                }
                if(sky === Infinity){
                    sky = 99999999;
                }
                var xx = appY * skx * sx;
                var yy = appX * sky * sy;
                t.a = Cos + -Sin * sky;
                t.b = Cos * skx + -Sin;
                t.c = Sin + Cos * sky;
                t.d = Sin * skx + Cos;
                t.tx += Cos * xx + -Sin * yy;
                t.ty += Sin * xx + Cos * yy;
            }

            // scale
            if (lScaleX !== 1 || lScaleY !== 1) {
                t.a *= sx;
                t.c *= sx;
                t.b *= sy;
                t.d *= sy;
            }

            // 调整锚点
            t.tx += Cos * -appX * sx + -Sin * appY * sy;
            t.ty -= Sin * -appX * sx + Cos * appY * sy;

            // 如果忽略锚点
            if (_t._ignoreAnchorPointForPosition) {
                t.tx += appX;
                t.ty += appY;
            }

            if (_t._additionalTransformDirty) {
                _t._transform = cc.affineTransformConcat(t, _t._additionalTransform);
                _t._additionalTransformDirty = false;
            }

            _t._transformDirty = false;
        }
        return _t._transform;
    };

    _p = null;

} else {
    cc.assert(cc.isFunction(cc._tmp.WebGLCCNode), cc._LogInfos.MissingFile, "BaseNodesWebGL.js");
    cc._tmp.WebGLCCNode();
    delete cc._tmp.WebGLCCNode;
}
cc.assert(cc.isFunction(cc._tmp.PrototypeCCNode), cc._LogInfos.MissingFile, "BaseNodesPropertyDefine.js");
cc._tmp.PrototypeCCNode();
delete cc._tmp.PrototypeCCNode;
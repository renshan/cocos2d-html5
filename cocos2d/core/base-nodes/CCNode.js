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
 * Default Node tag
 * 默认节点标签
 * @constant
 * @type Number
 */
cc.NODE_TAG_INVALID = -1;

/**
 * XXX: Yes, nodes might have a sort problem once every 15 days if the game runs at 60 FPS and each frame sprites are reordered.
 * XXX: 是的,节点或许会有一个排序问题,如果游戏运行在60FPS且每一个游戏帧都重新排序,15天一次.
 */
cc.s_globalOrderOfArrival = 1;

/**
 * <p>cc.Node is the root class of all node. Anything that gets drawn or contains things that get drawn is a cc.Node.<br/>			<p>cc.Node是所有节点的父类,所有的绘制或者包含的东西都是一个cc.Node.
 * The most popular cc.Nodes are: cc.Scene, cc.Layer, cc.Sprite, cc.Menu.</p>																										最典型的cc.Nodes有:cc.Scene,cc.Layer,cc.Sprite,cc.Menu.</p>
 *
 * <p>The main features of a cc.Node are: <br/>																																									<p>一个cc.Node的主要特点:
 * - They can contain other cc.Node nodes (addChild, getChildByTag, removeChild, etc) <br/>																			- 他们可以包含其他的节点对象(addChild, getChildByTag, removeChild, etc)<br/>	
 * - They can schedule periodic callback (schedule, unschedule, etc) <br/>																											- 他们可以安排定期的回调(schedule, unschedule, etc)<br/>
 * - They can execute actions (runAction, stopAction, etc) <br/></p>																														- 他们可以执行一些动作(runAction, stopAction, etc)<br/></p>
 *
 * <p>Some cc.Node nodes provide extra functionality for them or their children.</p>																						<p>有些cc.Node节点提供额外的函数给其自己获取其子类.</p>
 *
 * <p>Subclassing a cc.Node usually means (one/all) of: <br/>																																		<p>子类节点通常意味着(单一的/所有的):<br/>
 * - overriding constructor function "ctor" to initialize resources and schedule callbacks<br/>																	- 重写构造函数"ctor"去初始化资源跟安排回调<br/>
 * - create callbacks to handle the advancement of time<br/></p>																																- 创建回调来操作进行的时间<br/></p>
 *
 * <p>Features of cc.Node: <br/>																																																<p>cc.Node功能:<br/>
 * - position  <br/>																																																						- 位置<br/>
 * - scale (x, y) <br/>																																																					- x,y轴缩放<br/>
 * - rotation (in degrees, clockwise)<br/>																																											- 角度的旋转<br/>
 * - anchor point<br/>																																																					- 锚点<br/>	
 * - size <br/>																																																									- 尺寸 <br/>
 * - color <br/>																																																								- 颜色 <br/>
 * - opacity <br/>																																																							- 不透明度 <br/>
 * - visible<br/>																																																								- 可见性<br/>	
 * - z-order<br/>																																																								- Z轴排序<br/>
 * - WebGL z position<br/></P>																																																	- WebGL的Z轴位置<br/></p>
 *
 * <p> Default values: <br/>																																																		<p> 默认值:<br/>
 * - rotation: 0 <br/>																																																					- 旋转:0 <br/>
 * - position: (x=0,y=0) <br/>																																																	- 位置: (x=0,y=0) <br/>
 * - scale: (x=1,y=1) <br/>																																																			- 缩放比例: (x=1,y=1) <br/>
 * - contentSize: (x=0,y=0)<br/>																																																- 文本尺寸: (x=0,y=0)<br/>
 * - anchorPoint: (x=0,y=0)<br/>																																																- 锚点: (x=0,y=0)<br/>		
 * - color: (r=255,g=255,b=255)<br/>																																														- 颜色: (r=255,g=255,b=255)<br/>
 * - opacity: 255</p>																																																						- 不透明度: 255</p>
 *
 * <p> Limitations:<br/>																																																				<p> 局限性:<br/>
 * - A cc.Node is a "void" object. It doesn't have a texture <br/></P>																													- 一个cc.Node是一个"void"对象.它没有纹理<br/></p>
 *
 * <p>Order in transformations with grid disabled <br/>																																					<p>启用网格变换排序<br/>
 * -# The node will be translated (position)  <br/>																																							-# 节点的位置会被变换  <br/>
 * -# The node will be rotated (rotation)<br/>																																									-# 节点会被旋转<br/>
 * -# The node will be scaled (scale)  <br/>																																										-# 节点会被缩放<br/>
 *
 * <p>Order in transformations with grid enabled<br/>																																						<p>不启用网格变换排序<br/>
 * -# The node will be translated (position)<br/>																																								-# 节点的位置会被变换  <br/>
 * -# The node will be rotated (rotation) <br/>																																									-# 节点会被旋转<br/>
 * -# The node will be scaled (scale) <br/>																																											-# 节点会被缩放<br/>
 * -# The grid will capture the screen <br/>																																										-# 网格将会捕捉屏幕<br/>
 * -# The node will be moved according to the camera values (camera) <br/>																											-# 节点将会根据摄像机的值进行移动 <br/>
 * -# The grid will render the captured screen <br/></P>																																				-# 网格将会渲染被捕捉的屏幕 <br/></P>
 *
 * @class
 * @extends cc.Class
 *
 * @property {Number}               x                   - x axis position of node																																							@property {Number}               x                   - 节点的X轴位置
 * @property {Number}               y                   - y axis position of node																																							@property {Number}               y                   - 节点的Y轴位置
 * @property {Number}               width               - Width of node																																												@property {Number}               width               - 节点的宽
 * @property {Number}               height              - Height of node																																											@property {Number}               height              - 节点的高	
 * @property {Number}               anchorX             - Anchor point's position on x axis																																		@property {Number}               anchorX             - X轴上的锚点位置
 * @property {Number}               anchorY             - Anchor point's position on y axis																																		@property {Number}               anchorY             - Y轴上的锚点位置	
 * @property {Boolean}              ignoreAnchor        - Indicate whether ignore the anchor point property for positioning																		@property {Boolean}              ignoreAnchor        - 指出是否忽略锚点当设置位置属性的时候
 * @property {Number}               skewX               - Skew x																																															@property {Number}               skewX               - X轴倾斜
 * @property {Number}               skewY               - Skew y																																															@property {Number}               skewY               - Y轴倾斜
 * @property {Number}               zIndex              - Z order in depth which stands for the drawing order																									@property {Number}               zIndex              - Z顺序值依据于绘制的先后顺序	
 * @property {Number}               vertexZ             - WebGL Z vertex of this node, z order works OK if all the nodes uses the same openGL Z vertex				@property {Number}               vertexZ             - 节点的WebGL的Z顶点, 如果所有的节点使用相同的WebGL的Z顶点,Z顺序的排序不会有影响
 * @property {Number}               rotation            - Rotation of node																																										@property {Number}               rotation            - 节点的旋转角度
 * @property {Number}               rotationX           - Rotation on x axis																																									@property {Number}               rotationX           - X轴旋转角度
 * @property {Number}               rotationY           - Rotation on y axis																																									@property {Number}               rotationY           - Y轴旋转角度
 * @property {Number}               scale               - Scale of node																																												@property {Number}               scale               - 节点缩放比例
 * @property {Number}               scaleX              - Scale on x axis																																											@property {Number}               scaleX              - X轴的缩放比例
 * @property {Number}               scaleY              - Scale on y axis																																											@property {Number}               scaleY              - Y轴的缩放比例
 * @property {Boolean}              visible             - Indicate whether node is visible or not																															@property {Boolean}              visible             - 指出节点是否可见	
 * @property {cc.Color}             color               - Color of node, default value is white: (255, 255, 255)																							@property {cc.Color}             color               - 节点的颜色,默认值为白色: (255, 255, 255)
 * @property {Boolean}              cascadeColor        - Indicate whether node's color value affect its child nodes, default value is false									@property {Boolean}              cascadeColor        - 指出节点颜色是否影响它的子节点,默认值为false.	
 * @property {Number}               opacity             - Opacity of node, default value is 255																																@property {Number}               opacity             - 节点的不透明度,默认值为255
 * @property {Boolean}              opacityModifyRGB    - Indicate whether opacity affect the color value, default value is false															@property {Boolean}              opacityModifyRGB    - 指出不透明度是否影响颜色的值,默认值为false.	
 * @property {Boolean}              cascadeOpacity      - Indicate whether node's opacity value affect its child nodes, default value is false								@property {Boolean}              cascadeOpacity      - 指出节点不透明度是否影响它的子节点,默认值为false.
 * @property {Array}                children            - <@readonly> All children nodes																																			@property {Array}                children            - <@只读> 所有的子节点
 * @property {Number}               childrenCount       - <@readonly> Number of children																																			@property {Number}               childrenCount       - <@只读> 子节点的数量
 * @property {cc.Node}              parent              - Parent node																																													@property {cc.Node}              parent              - 父亲节点
 * @property {Boolean}              running             - <@readonly> Indicate whether node is running or not																									@property {Boolean}              running             - <@只读> 指出节点是否在运行
 * @property {Number}               tag                 - Tag of node																																													@property {Number}               tag                 - 节点标签	
 * @property {Object}               userData            - Custom user data																																										@property {Object}               userData            - 用户自定义数据
 * @property {Object}               userObject          - User assigned CCObject, similar to userData, but instead of holding a void* it holds an id					@property {Object}               userObject          - 用户分配的CCObject, 类似于用户数据, 但它不是使用一个void*,而是使用一个id
 * @property {Number}               arrivalOrder        - The arrival order, indicates which children is added previously																			@property {Number}               arrivalOrder        - 到达顺序值,指出哪些子节点先被添加.
 * @property {cc.ActionManager}     actionManager       - The CCActionManager object that is used by all actions.																							@property {cc.ActionManager}     actionManager       - 被所有动作使用的CCActionManager对象.
 * @property {cc.Scheduler}         scheduler           - cc.Scheduler used to schedule all "updates" and timers.																							@property {cc.Scheduler}         scheduler           - cc.Scheduler用来调度所有的更新跟定时器.
 * @property {cc.GridBase}          grid                - grid object that is used when applying effects																											@property {cc.GridBase}          grid                - 当使用效果的时候,被使用的网格对象
 * @property {cc.GLProgram}         shaderProgram       - The shader program currently used for this node																											@property {cc.GLProgram}         shaderProgram       - 获取节点当前所使用的着色过程
 * @property {Number}               glServerState       - The state of OpenGL server side																																			@property {Number}               glServerState       - OpenGL服务端的状态		
 */
cc.Node = cc.Class.extend(/** @lends cc.Node# */{
    _localZOrder: 0,                                     ///< Local order (relative to its siblings) used to sort the node //< 本地排序(相对于其同级类)用来排序节点
    _globalZOrder: 0,                                    ///< Global order used to sort the node //<用来全局排序节点
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
    // "whole screen" objects. like Scenes and Layers, should set _ignoreAnchorPointForPosition to true
    // "全屏"对象.就像Scenes跟Layers,需要设置_ignoreAnchorPointForPosition为true
    _ignoreAnchorPointForPosition: false,
    tag: cc.NODE_TAG_INVALID,
    // userData is always initialized as nil
    // userData一般被初始化成nil
    userData: null,
    userObject: null,
    _transformDirty: true,
    _inverseDirty: true,
    _cacheDirty: false,
    // Cached parent serves to construct the cached parent chain
    // 服务于父类的缓存,用于构建父类的缓存链
    _cachedParent: null,
    _transformGLDirty: null,
    _transform: null,                            //local transform //本地变换
    _transformWorld: null,                       //world transform //世界坐标变换
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
    _name: "",                     ///<a string label, an user defined string to identify this node ///<一个字符串标签,用户定义一个字符串标签给节点

    _displayedOpacity: 255,
    _realOpacity: 255,
    _displayedColor: null,
    _realColor: null,
    _cascadeColorEnabled: false,
    _cascadeOpacityEnabled: false,
    _hashOfName: 0,

    _curLevel: -1,                           //for new renderer //为了新的渲染器
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
     * Initializes the instance of cc.Node																初始化cc.Node实例
     * @function
     * @returns {boolean} Whether the initialization was successful.			@returns {boolean} 初始化是否成功.
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
     * Sets node's dirty flag to true so that it can be updated in visit function of the next frame		设置节点的标志为true,以便于下一帧访问函数时进行更新
 
     * @function
     */
    setNodeDirty: null,

    /**
     * <p>Properties configuration function </br>									<p>属性配置函数</br>
     * All properties in attrs will be set to the node, </br>			所有在attrs中的属性将会被设置到节点中,</br>
     * when the setter of the node is available, </br>						当节点的setter方法可用时,</br>
     * the property will be set via setter function.</br>					属性将通过setter函数进行设置.</br>
     * </p>
     * @function
     * @param {Object} attrs Properties to be set to node					@param {Object} 设置节点的属性
     */
    attr: function (attrs) {
        for (var key in attrs) {
            this[key] = attrs[key];
        }
    },

    /**
     * <p>Returns the skew degrees in X </br>																										<p>获取X轴的倾斜角度</br>
     * The X skew angle of the node in degrees.  <br/>																					节点X轴的倾斜角 单位:度<br/>
     * This angle describes the shear distortion in the X direction.<br/>												该角度表示的是X轴方向上的倾斜程度<br/>
     * Thus, it is the angle between the Y axis and the left edge of the shape </br>						该角度是Y轴与其左边缘之间的夹角</br>
     * The default skewX angle is 0. Positive values distort the node in a CW direction.</br>		默认的X轴倾斜角为0.确切的值表示的是节点在CW方向上的倾斜度.</br>
     * </p>
     * @function
     * @return {Number} The X skew angle of the node in degrees.																@return {Number} 节点X轴的倾斜角度.
     */
    getSkewX: function () {
        return this._skewX;
    },

    /**
     * <p>
     * Changes the X skew angle of the node in degrees.                                                    <br/>				改变节点X轴方向上的倾斜角度<br/>
     * This angle describes the shear distortion in the X direction.                                       <br/>				该角度表示的是X轴方向上的倾斜程度<br/>
     * Thus, it is the angle between the Y axis and the left edge of the shape                             <br/>				该角度是Y轴与其左边缘之间的夹角</br>
     * The default skewX angle is 0. Positive values distort the node in a CW direction.																默认的X轴倾斜角为0.确切的值表示的是节点在CW方向上的倾斜度.</br>
     * </p>
     * @function
     * @param {Number} newSkewX The X skew angle of the node in degrees.																								@param {Number} newSkewX 节点X轴的倾斜角度.
     */
    setSkewX: function (newSkewX) {
        this._skewX = newSkewX;
        this.setNodeDirty();
    },

    /**
     * <p>Returns the skew degrees in Y               <br/>																							<p>获取Y轴的倾斜角度</br>
     * The Y skew angle of the node in degrees.                            <br/>												节点Y轴方向的倾斜角度 单位:度<br/>
     * This angle describes the shear distortion in the Y direction.       <br/>												该角度表示的是Y轴方向上的倾斜程度<br/>
     * Thus, it is the angle between the X axis and the bottom edge of the shape       <br/>						该角度是X轴与其底边缘之间的夹角</br>
     * The default skewY angle is 0. Positive values distort the node in a CCW direction.    <br/>			默认的Y轴倾斜角为0.确切的值表示的是节点在CCW方向上的倾斜度.</br>
     * </p>
     * @function
     * @return {Number} The Y skew angle of the node in degrees.																				@return {Number} 节点Y轴的倾斜角度.
     */
    getSkewY: function () {
        return this._skewY;
    },

    /**
     * <p>
     * Changes the Y skew angle of the node in degrees.                                                        <br/>	改变节点Y轴方向上的倾斜角度                                                    <br/>
     * 
     * This angle describes the shear distortion in the Y direction.                                           <br/>	该角度表示的是Y轴方向上的倾斜程度<br/>
     * Thus, it is the angle between the X axis and the bottom edge of the shape                               <br/>	该角度是X轴与其底边缘之间的夹角</br>
     * The default skewY angle is 0. Positive values distort the node in a CCW direction.                      <br/>	默认的Y轴倾斜角为0.确切的值表示的是节点在CCW方向上的倾斜度.</br>
     * </p>
     * @function
     * @param {Number} newSkewY  The Y skew angle of the node in degrees.		@param {Number} newSkewY  节点Y轴的倾斜角度.
     * 
     */
    setSkewY: function (newSkewY) {
        this._skewY = newSkewY;
        this.setNodeDirty();
    },

    /**
     * <p> LocalZOrder is the 'key' used to sort the node relative to its siblings.                                    <br/>	<p> LocalZOrder是用来与其同级节点进行排序的关键<br/>
     *                                                                                                                 <br/>
     * The Node's parent will sort all its children based ont the LocalZOrder value.                                   <br/>	节点的父类会基于LocalZOrder值对所有的子类进行排序<br/>
     * If two nodes have the same LocalZOrder, then the node that was added first to the children's array              <br/>
     * will be in front of the other node in the array.                                                                <br/>	如果两个节点拥有相同的LocalZOrder,那么先被添加到子节点数组中的节点将会排在另一个节点的前面<br/>
     * 
     * 
     * <br/>
     * Also, the Scene Graph is traversed using the "In-Order" tree traversal algorithm ( http://en.wikipedia.org/wiki/Tree_traversal#In-order )		同时,Scene Graph使用的是"In-Order"树遍历算法(http://en.wikipedia.org/wiki/Tree_traversal#In-order)
     * <br/>
     * And Nodes that have LocalZOder values < 0 are the "left" subtree                                                 <br/>		拥有LocalZOder的值小于0的节点为左边的子节点树<br/>
     * While Nodes with LocalZOder >=0 are the "right" subtree.    </p>																													LocalZOder值大于等于0的为右边的子节点树</p>
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
    //setLocalZOrder的帮助函数.除非你知道你在做什么,否则别调用该函数.
    _setLocalZOrder: function (localZOrder) {
        this._localZOrder = localZOrder;
    },

    /**
     * Returns the local Z order of this node.		返回节点的本地Z轴顺序值.
     * @function
     * @returns {Number} The local (relative to its siblings) Z order.		@returns {Number} 本地的Z顺序值(关联其同级节点).
     */
    getLocalZOrder: function () {
        return this._localZOrder;
    },

    /**
     * Returns z order of this node			返回节点的Z轴顺序值
     * @function
     * @return {Number}
     * @deprecated since 3.0, please use getLocalZOrder instead		@3.0版本后弃用,请使用getLocalZOrder代替.
     */
    getZOrder: function () {
        cc.log(cc._LogInfos.Node_getZOrder);
        return this.getLocalZOrder();
    },

    /**
     * <p>
     *     Sets the Z order which stands for the drawing order, and reorder this node in its parent's children array.     <br/>		设置基于绘制顺序的Z轴顺序值,并且重新排序该节点在父类子节点数组中的位置<br/>
     *                                                                                                                    <br/>
     *      The Z order of node is relative to its "brothers": children of the same parent.                               <br/>		节点的Z轴顺序值关系到其兄弟:同级子类<br/>
     *      It's nothing to do with OpenGL's z vertex. This one only affects the draw order of nodes in cocos2d.          <br/>		不必要处理OpenGL的Z轴顶点值.该值在cocos2d中只影响绘制节点的顺序<br/>
     *      The larger number it is, the later this node will be drawn in each message loop.                              <br/>		该值越大,该节点将会在每个消息循环中越置后.<br/>
     *      Please refer to setVertexZ(float) for the difference.																																	请参阅setVertexZ(float)跟该函数的区别.
     *			
     * </p>
     * @function
     * @param {Number} z Z order of this node.																		@param {Number} z 节点的Z顺序值.
     * @deprecated since 3.0, please use setLocalZOrder instead										@3.0版本后弃用,请使用setLocalZOrder代替.
     */
    setZOrder: function (z) {
        cc.log(cc._LogInfos.Node_setZOrder);
        this.setLocalZOrder(z);
    },

    /**
     * <p>Defines the oder in which the nodes are renderer.                                                                               <br/>	<p>定义渲染节点的顺序<br/>
     * Nodes that have a Global Z Order lower, are renderer first.                                                                        <br/>	定义渲染节点的顺序 拥有全局Z顺序越小的节点,最先渲染 <br/>
     *                                                                                                                                    <br/>
     * In case two or more nodes have the same Global Z Order, the oder is not guaranteed.                                                <br/>	假设两个或者更多的节点拥有相同的全局Z顺序,那么渲染顺序无法保证.<br/>
     * The only exception if the Nodes have a Global Z Order == 0. In that case, the Scene Graph order is used.                           <br/>	唯一的例外是如果节点的全局Z顺序为零,那么场景图顺序是可以使用的.<br/>
     *                                                                                                                                    <br/>
     * By default, all nodes have a Global Z Order = 0. That means that by default, the Scene Graph order is used to render the nodes.    <br/>	默认的,所有的节点全局Z顺序都是零.这就是说,默认使用场景图顺序来渲染节点.<br/>
     *                                                                                                                                    <br/>
     * Global Z Order is useful when you need to render nodes in an order different than the Scene Graph order.                           <br/>	全局Z顺序是非常有用的当你需要渲染节点按照不同的顺序而不是场景图顺序<br/>
     *                                                                                                                                    <br/>
     * Limitations: Global Z Order can't be used used by Nodes that have SpriteBatchNode as one of their ancestors.                       <br/>	局限性:全局Z顺序不能够被拥有继承"SpriteBatchNode"的节点使用<br/>
     * And if ClippingNode is one of the ancestors, then "global Z order" will be relative to the ClippingNode.   </p>														并且如果"ClippingNode"是其中之一的上代，那么"global Z order" 将会和"ClippingNode"有关</p>
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
     * Return the Node's Global Z Order.		返回节点的全局Z顺序.
     * @function
     * @returns {number} The node's global Z order		@returns {number} 节点的全局Z顺序值
     */
    getGlobalZOrder: function () {
        return this._globalZOrder;
    },

    /**
     * Returns WebGL Z vertex of this node.							返回节点的WebGL的Z顶点.
     * @function
     * @return {Number} WebGL Z vertex of this node			@return {Number} 节点的WebGL的Z顶点
     */
    getVertexZ: function () {
        return this._vertexZ;
    },

    /**
     * <p>
     *     Sets the real WebGL Z vertex.                                                                          <br/>			设置实际的WebGL的Z顶点<br/>
     *                                                                                                            <br/>
     *      Differences between openGL Z vertex and cocos2d Z order:                                              <br/>			openGL的Z顶点跟cocos2d的Z顺序的不同:<br/>
     *      - WebGL Z modifies the Z vertex, and not the Z order in the relation between parent-children         <br/>			- WebGL的Z顶点修改Z顶点,而不是跟父子类有关联的Z顺序<br/>
     *      - WebGL Z might require to set 2D projection                                                         <br/>			- WebGL的Z顶点要求设置2D模式<br/>
     *      - cocos2d Z order works OK if all the nodes uses the same WebGL Z vertex. eg: vertexZ = 0            <br/>			- 如果所有的节点使用相同的WebGL的Z顶点,cocos2d的Z顺序的排序不会有影响<br/>
     *                                                                                                            <br/>
     *      @warning Use it at your own risk since it might break the cocos2d parent-children z order												@警告:使用其是有风险的,它可能会破坏cocos2d的父子类的Z顺序<br/>
     *			
     * </p>
     * @function
     * @param {Number} Var
     */
    setVertexZ: function (Var) {
        this._vertexZ = Var;
    },

    /**
     * Returns the rotation (angle) of the node in degrees. 0 is the default rotation angle. Positive values rotate node clockwise.		返回节点的旋转角度.默认的旋转角度为0.正数使得节点顺时针旋转.
     * @function
     * @return {Number} The rotation of the node in degrees.		@return {Number} 节点的旋转角度.
     */
    getRotation: function () {
        if (this._rotationX !== this._rotationY)
            cc.log(cc._LogInfos.Node_getRotation);
        return this._rotationX;
    },

    /**
     * <p>
     *     Sets the rotation (angle) of the node in degrees.                                             <br/>	设置节点的旋转角度<br/>
     *                                                                                                   <br/>
     *      0 is the default rotation angle.                                                             <br/>	默认的旋转角度为0<br/>
     *      Positive values rotate node clockwise, and negative values for anti-clockwise.											正数使得节点顺时针旋转,负数使得节点逆时针旋转.
     * </p>
     * @function
     * @param {Number} newRotation The rotation of the node in degrees.			@param {Number} newRotation 节点的旋转角度.
     */
    setRotation: function (newRotation) {
        this._rotationX = this._rotationY = newRotation;
        this._rotationRadiansX = this._rotationX * 0.017453292519943295; //(Math.PI / 180);
        this._rotationRadiansY = this._rotationY * 0.017453292519943295; //(Math.PI / 180);
        this.setNodeDirty();
    },

    /**
     * Returns the X axis rotation (angle) which represent a horizontal rotational skew of the node in degrees. <br/>		返回X轴的旋转角度表示的是节点的水平旋转倾斜角度.<br/>
     * 
     * 0 is the default rotation angle. Positive values rotate node clockwise<br/>																			默认的旋转角度值为0.正数使得节点顺时针旋转<br/>
     * (support only in WebGL rendering mode)																																						(只在WebGL的渲染模式下支持)
     * @function
     * @return {Number} The X rotation in degrees.																																			@return {Number} X轴旋转角度
     */
    getRotationX: function () {
        return this._rotationX;
    },

    /**
     * <p>
     *     Sets the X rotation (angle) of the node in degrees which performs a horizontal rotational skew.        <br/>		设置节点的X轴旋转角度来进行水平旋转倾斜<br/>
     *     (support only in WebGL rendering mode)                                                                 <br/>		(只在WebGL的渲染模式下支持)<br/>
     *     0 is the default rotation angle.                                                                       <br/>		默认的旋转角度值为0.
     *     Positive values rotate node clockwise, and negative values for anti-clockwise.																	正数使得节点顺时针旋转,负数使得节点逆时针旋转.
     * </p>
     * @param {Number} rotationX The X rotation in degrees which performs a horizontal rotational skew.										@param {Number} rotationX X轴来进行水平旋转倾斜的旋转角度.
     */
    setRotationX: function (rotationX) {
        this._rotationX = rotationX;
        this._rotationRadiansX = this._rotationX * 0.017453292519943295; //(Math.PI / 180);
        this.setNodeDirty();
    },

    /**
     * Returns the Y axis rotation (angle) which represent a vertical rotational skew of the node in degrees. <br/>	返回Y轴的旋转角度表示的是节点的竖直旋转倾斜角度.<br/>
     * 0 is the default rotation angle. Positive values rotate node clockwise<br/>																	默认的旋转角度值为0.正数使得节点顺时针旋转<br/>
     * (support only in WebGL rendering mode)																																				(只在WebGL的渲染模式下支持)<br/>
     * @function
     * @return {Number} The Y rotation in degrees.			@return {Number} Y轴旋转角度.
     */
    getRotationY: function () {
        return this._rotationY;
    },

    /**
     * <p>
     *    Sets the Y rotation (angle) of the node in degrees which performs a vertical rotational skew.         <br/>		设置节点的Y轴旋转角度来进行竖直旋转倾斜<br/>
     *    (support only in WebGL rendering mode)                                                                <br/>		(只在WebGL的渲染模式下支持)<br/>
     *    0 is the default rotation angle.                                                                      <br/>		默认的旋转角度值为0.<br/>
     *    Positive values rotate node clockwise, and negative values for anti-clockwise.																正数使得节点顺时针旋转,负数使得节点逆时针旋转.
     * </p>
     * @param rotationY The Y rotation in degrees.		@param rotationY Y轴旋转角度.
     */
    setRotationY: function (rotationY) {
        this._rotationY = rotationY;
        this._rotationRadiansY = this._rotationY * 0.017453292519943295;  //(Math.PI / 180);
        this.setNodeDirty();
    },

    /**
     * Returns the scale factor of the node.										返回节点的缩放比例
     * @warning: Assertion will fail when _scaleX != _scaleY.		@警告:当_scaleX != _scaleY断言会失败.
     * @function
     * @return {Number} The scale factor			@return {Number} 缩放系数
     */
    getScale: function () {
        if (this._scaleX !== this._scaleY)
            cc.log(cc._LogInfos.Node_getScale);
        return this._scaleX;
    },

    /**
     * Sets the scale factor of the node. 1.0 is the default scale factor. This function can modify the X and Y scale at the same time. 设置节点的缩放比例.默认的缩放比例是1.0.该函数可以同时修改X轴跟Y轴的缩放比例.
     * @function
     * @param {Number} scale or scaleX value			@param {Number} 缩放或者X轴缩放值
     * @param {Number} [scaleY=]
     */
    setScale: function (scale, scaleY) {
        this._scaleX = scale;
        this._scaleY = (scaleY || scaleY === 0) ? scaleY : scale;
        this.setNodeDirty();
    },

    /**
     * Returns the scale factor on X axis of this node		返回节点X轴的缩放比例
     * @function
     * @return {Number} The scale factor on X axis.			@return {Number} X轴缩放比例.
     */
    getScaleX: function () {
        return this._scaleX;
    },

    /**
     * <p>
     *     Changes the scale factor on X axis of this node                                   <br/>		改变节点X轴的缩放比例<br/>
     *     The deafult value is 1.0 if you haven't changed it before																	如果你没有修改过该值的话,默认值为1.0.
     * </p>
     * @function
     * @param {Number} newScaleX The scale factor on X axis.			@param {Number} newScaleX X轴缩放系数.
     */
    setScaleX: function (newScaleX) {
        this._scaleX = newScaleX;
        this.setNodeDirty();
    },

    /**
     * Returns the scale factor on Y axis of this node	返回节点Y轴的缩放比例
     * @function
     * @return {Number} The scale factor on Y axis.			@return {Number} Y轴缩放系数.
     */
    getScaleY: function () {
        return this._scaleY;
    },

    /**
     * <p>
     *     Changes the scale factor on Y axis of this node                                            <br/>			改变节点的Y轴的缩放比例<br/>
     *     The Default value is 1.0 if you haven't changed it before.																						如果你没有修改过该值的话,默认值为1.0.
     * </p>
     * @function
     * @param {Number} newScaleY The scale factor on Y axis.		@param {Number} newScaleY Y轴缩放系数.
     */
    setScaleY: function (newScaleY) {
        this._scaleY = newScaleY;
        this.setNodeDirty();
    },

    /**
     * <p>
     *     Changes the position (x,y) of the node in cocos2d coordinates.<br/>						改变节点的在cocos2d坐标系中的位置<br/>
     *     The original point (0,0) is at the left-bottom corner of screen.<br/>					原点(0,0)在屏幕的左下角.<br/>
     *     Usually we use cc.p(x,y) to compose CCPoint object.<br/>												我们经常使用cc.p(x,y)来构建CCPoint对象.<br/>
     *     and Passing two numbers (x,y) is more efficient than passing CCPoint object.		并且使用两个数字(x,y)比使用CCPoint更有效率.
     * </p>
     * @function
     * @param {cc.Point|Number} newPosOrxValue The position (x,y) of the node in coordinates or the X coordinate for position		@param {cc.Point|Number} newPosOrxValue 节点坐标系的位置或者X坐标系的位置
     * @param {Number} [yValue] Y coordinate for position																																				@param {Number} [yValue] Y坐标系位置
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
     * Sets the position (x,y) using values between 0 and 1.                                                <br/>		设置位置的值在区间[0,1]内.<br/>
     * The positions in pixels is calculated like the following:                                            <br/>		像素位置的计算如下:<br/>
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
     * <p>Returns a copy of the position (x,y) of the node in cocos2d coordinates. (0,0) is the left-bottom corner.</p>		<p>返回节点在cocos2d坐标系中的位置的备份.(0,0)为左下角的点</p>
     * @function
     * @return {cc.Point} The position (x,y) of the node in OpenGL coordinates		@return {cc.Point} 节点在OpenGL坐标系中的位置
     */
    getPosition: function () {
        return cc.p(this._position);
    },

    /**
     * returns the normalized position		返回正常位置
     * @returns {cc.Point}
     */
    getNormalizedPosition: function(){
        return cc.p(this._normalizedPosition);
    },

    /**
     * <p>Returns the x axis position of the node in cocos2d coordinates.</p>		<p>返回节点在coco2d坐标系中的X轴位置.</p>
     * @function
     * @return {Number}
     */
    getPositionX: function () {
        return this._position.x;
    },

    /**
     * <p>Sets the x axis position of the node in cocos2d coordinates.</p>		<p>设置节点在coco2d坐标系中的X轴位置.</p>
     * @function
     * @param {Number} x The new position in x axis			@param {Number} x X轴新的位置值
     */
    setPositionX: function (x) {
        this._position.x = x;
        this.setNodeDirty();
    },

    /**
     * <p>Returns the y axis position of the node in cocos2d coordinates.</p>		<p>返回节点在coco2d坐标系中的Y轴位置.</p>
     * @function
     * @return {Number}
     */
    getPositionY: function () {
        return  this._position.y;
    },

    /**
     * <p>Sets the y axis position of the node in cocos2d coordinates.</p>		<p>设置节点在coco2d坐标系中的Y轴位置.</p>
     * @function
     * @param {Number} y The new position in y axis			@param {Number} y Y轴新的位置值
     */
    setPositionY: function (y) {
        this._position.y = y;
        this.setNodeDirty();
    },

    /**
     * Returns the amount of children.		返回子节点的数量.
     * @function
     * @return {Number} The amount of children. @return {Number} 子节点数量.
     */
    getChildrenCount: function () {
        return this._children.length;
    },

    /**
     * Returns an array of all children  <br/>																返回包含所有子类的数组<br/>
     * Composing a "tree" structure is a very important feature of CCNode			构建一个数结构体是CCNode非常重要的功能
     * @function
     * @return {Array} An array of children		@return {Array} 子节点数组
     * @example
     *  //This sample code traverses all children nodes, and set their position to (0,0)
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
     * Returns if the node is visible
     * 返回节点是否可见
     * @function
     * @see cc.Node#setVisible
     * @return {Boolean} true if the node is visible, false if the node is hidden.	@return {Boolean} 如果为true则节点可见,如果为false则节点不可见.
     * 
     */
    isVisible: function () {
        return this._visible;
    },

    /**
     * Sets whether the node is visible <br/>	 设置节点是否可见<br/>	
     * The default value is true							 默认值是可见的
     * @function
     * @param {Boolean} visible Pass true to make the node visible, false to hide the node.		@param {Boolean} visible 传入true使得节点可见,传入false的话则隐藏节点.
     */
    setVisible: function (visible) {
        if(this._visible != visible){
            this._visible = visible;
            if(visible) this.setNodeDirty();
            cc.renderer.childrenOrderDirty = true;
        }
    },

    /**
     *  <p>Returns a copy of the anchor point.<br/>																																													<p>返回节点的锚点备份.<br/>
     *  Anchor point is the point around which all transformations and positioning manipulations take place.<br/>														一个锚点是所有的转换和定位操作发生的点.<br/>
     *  It's like a pin in the node where it is "attached" to its parent. <br/>																															它就像在节点上连接其父类的大头针.<br/>
     *  The anchorPoint is normalized, like a percentage. (0,0) means the bottom-left corner and (1,1) means the top-right corner. <br/>		锚点是标准化的,就像百分比一样.。(0,0)表示左下角,(1,1)表示右上角.<br/>
     *  But you can use values higher than (1,1) and lower than (0,0) too.  <br/>																														但是你可以使用比(1,1)更高的值或者比(0,0)更低的值.<br/>
     *  The default anchor point is (0.5,0.5), so it starts at the center of the node. <br/></p>																						默认的锚点是(0.5,0.5),因此它开始于节点的中心位置<br/></p>
     * @function
     * @return {cc.Point}  The anchor point of node.				@return {cc.Point}  节点的锚点.
     * 
     */
    getAnchorPoint: function () {
        return cc.p(this._anchorPoint);
    },

    /**
     * <p>
     *     Sets the anchor point in percent.                                                                                              <br/>			设置锚点,用百分比表示.<br/>
     *                                                                                                                                    <br/>
     *     anchor point is the point around which all transformations and positioning manipulations take place.                            <br/>		一个锚点是所有的转换和定位操作发生的点.<br/>
     *     It's like a pin in the node where it is "attached" to its parent.                                                              <br/>			它就像在节点上连接其父类的大头针.<br/>
     *     The anchorPoint is normalized, like a percentage. (0,0) means the bottom-left corner and (1,1) means the top-right corner.     <br/>			锚点是标准化的,就像百分比一样.。(0,0)表示左下角,(1,1)表示右上角.<br/>
     *     But you can use values higher than (1,1) and lower than (0,0) too. 																																			但是你可以使用比(1,1)更高的值或者比(0,0)更低的值.<br/>                                                            <br/>
     *     The default anchor point is (0.5,0.5), so it starts at the center of the node.																														默认的锚点是(0.5,0.5),因此它开始于节点的中心位置
     * </p>
     * @function
     * @param {cc.Point|Number} point The anchor point of node or The x axis anchor of node.		@param {cc.Point|Number} point 节点的锚点或者节点X轴的锚点值.
     * @param {Number} [y] The y axis anchor of node.																						@param {Number} [y] 节点Y轴的锚点值
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
     * Returns a copy of the anchor point in absolute pixels.  <br/>				返回绝对像素的锚点的备份<br/>
     * you can only read it. If you wish to modify it, use setAnchorPoint		你只能读取它.如果你想要修改它,使用setAnchorPoint
     * @see cc.Node#getAnchorPoint
     * @function
     * @return {cc.Point} The anchor point in absolute pixels.							@return {cc.Point} 绝对像素中的锚点.
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
     * <p>Returns a copy the untransformed size of the node. <br/>																		<p>返回未转换节点的大小.<br/>
     * The contentSize remains the same no matter the node is scaled or rotated.<br/>									该contentSize保持一致不管节点是缩放或者旋转.<br/>
     * All nodes has a size. Layer and Scene has the same size of the screen by default. <br/></p>		左右的节点都有大小.Layer和Scene默认拥有跟屏幕一样的大小.<br/></p>
     * @function
     * @return {cc.Size} The untransformed size of the node.			@return {cc.Size} 节点未变换的尺寸.
     */
    getContentSize: function () {
        return cc.size(this._contentSize);
    },

    /**
     * <p>
     *     Sets the untransformed size of the node.                                             <br/>		设置转换节点的大小<br/>
     *                                                                                          <br/>
     *     The contentSize remains the same no matter the node is scaled or rotated.            <br/>		该contentSize保持一致不管节点是缩放或者旋转.<br/>
     *     All nodes has a size. Layer and Scene has the same size of the screen.												左右的节点都有大小.Layer和Scene默认拥有跟屏幕一样的大小.	
     * </p>
     * @function
     * @param {cc.Size|Number} size The untransformed size of the node or The untransformed size's width of the node.		@param {cc.Size|Number} size 节点未变换的尺寸或者节点未变换尺寸前的高度.
     * @param {Number} [height] The untransformed size's height of the node.																						@param {Number} [height] 节点未变换尺寸前的高度.
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
     *     Returns whether or not the node accepts event callbacks.                                     <br/>		不管节点是否接受回调事件都返回<br/>
     *     Running means the node accept event callbacks like onEnter(), onExit(), update()											运行意味着接受回调事件例如:onEnter(), onExit(), update()
     * </p>
     * @function
     * @return {Boolean} Whether or not the node is running.		@return {Boolean} 节点是否在运行.
     */
    isRunning: function () {
        return this._running;
    },

    /**
     * Returns a reference to the parent node		返回父类节点的引用
     * @function
     * @return {cc.Node} A reference to the parent node		@return {cc.Node} 父节点的引用
     */
    getParent: function () {
        return this._parent;
    },

    /**
     * Sets the parent node		设置父类节点
     * @param {cc.Node} parent A reference to the parent node		@param {cc.Node} parent 父节点的引用
     */
    setParent: function (parent) {
        this._parent = parent;
    },

    /**
     * Returns whether the anchor point will be ignored when you position this node.<br/>																返回当你移动节点的位置时,是否忽略节点的锚点.<br/>
     * When anchor point ignored, position will be calculated based on the origin point (0, 0) in parent's coordinates.	当锚点被忽略的时候,位置将会在父类坐标系中基于原点(0,0)进行计算.
     * @function
     * @see cc.Node#ignoreAnchorPointForPosition
     * @return {Boolean} true if the anchor point will be ignored when you position this node.		@return {Boolean} 当你设置节点位置,锚点将会被忽略的话,则为true.
     */
    isIgnoreAnchorPointForPosition: function () {
        return this._ignoreAnchorPointForPosition;
    },

    /**
     * <p>
     *     Sets whether the anchor point will be ignored when you position this node.                              <br/>						设置当你移动节点的位置时,是否忽略节点的锚点.<br/>
     *     When anchor point ignored, position will be calculated based on the origin point (0, 0) in parent's coordinates.  <br/>	当锚点被忽略的时候,位置将会在父类坐标系中基于原点(0,0)进行计算.<br/>	
     *     This is an internal method, only used by CCLayer and CCScene. Don't call it outside framework.        <br/>							这是一个内部调用方法,仅仅在CCLayer和CCScene中使用.别在外围框架中调用.<br/>		
     *     The default value is false, while in CCLayer and CCScene are true																												默认值为false,当在CCLayer和CCScene是true
     * </p>
     * @function
     * @param {Boolean} newValue true if anchor point will be ignored when you position this node		@param {Boolean} newValue 当你设置节点的位置时,如果锚点被忽略则为true.
     */
    ignoreAnchorPointForPosition: function (newValue) {
        if (newValue != this._ignoreAnchorPointForPosition) {
            this._ignoreAnchorPointForPosition = newValue;
            this.setNodeDirty();
        }
    },

    /**
     * Returns a tag that is used to identify the node easily.		返回用于标记一个节点的标签.
     * @function
     * @return {Number} An integer that identifies the node.			@return {Number} 定义节点的一个整数.
     * @example
     *  //You can set tags to node then identify them easily.
     *  //你可以给节点设置标签,那就很容易定义节点了.
     * // set tags
     * node1.setTag(TAG_PLAYER);
     * node2.setTag(TAG_MONSTER);
     * node3.setTag(TAG_BOSS);
     * parent.addChild(node1);
     * parent.addChild(node2);
     * parent.addChild(node3);
     * // identify by tags
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
     * Changes the tag that is used to identify the node easily. <br/>		改变用于标记节点的标签.<br/>
     * Please refer to getTag for the sample code.			请参阅getTag进行使用.
     * @function
     * @see cc.Node#getTag
     * @param {Number} tag A integer that identifies the node.		@param {Number} tag 定义节点的一个整数.
     * 
     */
    setTag: function (tag) {
        this.tag = tag;
    },

    /**
     * Changes the name that is used to identify the node easily.		改变用于标记节点的名字.
     * @function
     * @param {String} name
     */
    setName: function(name){
         this._name = name;
    },

    /**
     * Returns a string that is used to identify the node.		返回标记节点名字的字符串.
     * @function
     * @returns {string} A string that identifies the node.		@returns {string} 定义节点的字符串.
     */
    getName: function(){
        return this._name;
    },

    /**
     * <p>
     *     Returns a custom user data pointer                                                               <br/>		返回一个自定义的用户数据点<br/>
     *     You can set everything in UserData pointer, a data block, a structure or an object.											你可以随意设置UserData为指针,一个数据块,结构体或者一个对象.
     * </p>
     * @function
     * @return {object}  A custom user data pointer			@return {object}  一个用户自定义的数据指针
     * 
     */
    getUserData: function () {
        return this.userData;
    },

    /**
     * <p>
     *    Sets a custom user data reference                                                                   <br/>				设置自定义用户数据引用<br/>
     *    You can set everything in UserData reference, a data block, a structure or an object, etc.											你可以随意设置UserData为指针, 一个数据块, 结构体或者一个对象.
     * </p>
     * @function
     * @warning Don't forget to release the memory manually in JSB, especially before you change this data pointer, and before this node is autoreleased.		@警告:别忘记在JSB中手工释放内存,特别在你改变数据的指针,和节点自动释放的时候.
     * @param {object} Var A custom user data																																																								@param {object} Var 一个自定义的用户数据
     */
    setUserData: function (Var) {
        this.userData = Var;
    },

    /**
     * Returns a user assigned cocos2d object.                             <br/>													返回一个用户指定的cocos2d对象.<br/>
     * Similar to userData, but instead of holding all kinds of data it can only hold a cocos2d object		类似的,但不是可以获取所有类型的数据,它只能获取cocos2d对象
     * @function
     * @return {object} A user assigned CCObject			@return {object} 用户分配的CCObject对象
     */
    getUserObject: function () {
        return this.userObject;
    },

    /**
     * <p>
     *      Sets a user assigned cocos2d object                                                                                    <br/>			设置一个用户指定的cocos2d对象<br/>
     *      Similar to UserData, but instead of holding all kinds of data it can only hold a cocos2d object                        <br/>			类似的,但不是可以获取所有类型的数据,它只能获取cocos2d对象<br/>
     *      In JSB, the UserObject will be retained once in this method, and the previous UserObject (if existed) will be release. <br/>			在JSB中,UserObject在该函数中只保存一次,上一个UserObject会被释放掉.<br/>
     *      The UserObject will be released in CCNode's destruction.																																					UserObject将会在CCNode中释放破坏掉.
     * </p>
     * @param {object} newValue A user cocos2d object																																													@param {object} newValue 一个用户cocos2d对象
     * 
     */
    setUserObject: function (newValue) {
        if (this.userObject != newValue) {
            this.userObject = newValue;
        }
    },


    /**
     * Returns the arrival order, indicates which children should be added previously.		返回到达顺序,指出哪一个子类先被添加.
     * @function
     * @return {Number} The arrival order.	@return {Number} 到达顺序值.
     */
    getOrderOfArrival: function () {
        return this.arrivalOrder;
    },

    /**
     * <p>
     *     Sets the arrival order when this node has a same ZOrder with other children.                             <br/>			设置到达顺序,当这个节点和其他子节点有相同的ZOrder时<br/>
     *                                                                                                              <br/>
     *     A node which called addChild subsequently will take a larger arrival order,                              <br/>			一个调用了之后调用了addChild函数的节点将会有更大的到达顺序值<br/>
     *     If two children have the same Z order, the child with larger arrival order will be drawn later.										如果两个子对象有相同的Z轴顺序,这个有更大到达顺序的子类将会后绘制.
     * </p>
     * @function
     * @warning This method is used internally for zOrder sorting, don't change this manually																	@警告:该方法是为了内部Z顺序值排序用的,请别手工改变.
     * @param {Number} Var  The arrival order.																																								@param {Number} Var  到达顺序.
     */
    setOrderOfArrival: function (Var) {
        this.arrivalOrder = Var;
    },

    /**
     * <p>Returns the CCActionManager object that is used by all actions.<br/>																				<p>得到被所有动作使用的CCActionManager对象<br/>
     * (IMPORTANT: If you set a new cc.ActionManager, then previously created actions are going to be removed.)</p>		(重要:如果你设置了一个新的cc.ActionManager,则先前创建的动作将会被清除掉.)</p>	
     * @function
     * @see cc.Node#setActionManager
     * @return {cc.ActionManager} A CCActionManager object.		@return {cc.ActionManager} 一个CCActionManager对象.
     */
    getActionManager: function () {
        if (!this._actionManager) {
            this._actionManager = cc.director.getActionManager();
        }
        return this._actionManager;
    },

    /**
     * <p>Sets the cc.ActionManager object that is used by all actions. </p>													<p>设置被所有动作使用的cc.ActionManager对象</p>
     * @function
     * @warning If you set a new CCActionManager, then previously created actions will be removed.		@警告:如果你想要设置一个新的CCActionManager,则先前创建的动作都将被清除.
     * @param {cc.ActionManager} actionManager A CCActionManager object that is used by all actions.	@param {cc.ActionManager} actionManager 用来管理所有动作的CCActionManager对象.
     */
    setActionManager: function (actionManager) {
        if (this._actionManager != actionManager) {
            this.stopAllActions();
            this._actionManager = actionManager;
        }
    },

    /**
     * <p>
     *   Returns the cc.Scheduler object used to schedule all "updates" and timers.		返回用来调度所有的"updates"跟定时器的调度器对象
     * </p>
     * @function
     * @return {cc.Scheduler} A CCScheduler object.			@return {cc.Scheduler} 一个CCScheduler对象.
     */
    getScheduler: function () {
        if (!this._scheduler) {
            this._scheduler = cc.director.getScheduler();
        }
        return this._scheduler;
    },

    /**
     * <p>
     *   Sets a CCScheduler object that is used to schedule all "updates" and timers.           <br/>								设置一个调度器对象来用于调度所有的"updates"和定时器<br/>
     *   IMPORTANT: If you set a new cc.Scheduler, then previously created timers/update are going to be removed.		重要:如果你设置了一个新的cc.Scheduler,那么先前创建的定时器/更新函数都将会被清除掉.
     * </p>
     * @function
     * @warning If you set a new CCScheduler, then previously created timers/update are going to be removed.				@警告:如果你想要设置一个新的CCScheduler,则先前创建的timers/update将会被清除.
     * @param scheduler A cc.Scheduler object that is used to schedule all "update" and timers.											@param scheduler 一个被用来调度所有的更新跟定时器的cc.Scheduler对象.
     */
    setScheduler: function (scheduler) {
        if (this._scheduler != scheduler) {
            this.unscheduleAllCallbacks();
            this._scheduler = scheduler;
        }
    },

    /**
     * Returns a "local" axis aligned bounding box of the node. <br/>		返回节点的本地坐标系的外边框.<br/>
     * 
     * @deprecated since v3.0, please use getBoundingBox instead				@v3.0版本后弃用,请使用getBoundingBox代替
     * @return {cc.Rect}
     */
    boundingBox: function(){
        cc.log(cc._LogInfos.Node_boundingBox);
        return this.getBoundingBox();
    },

    /**
     * Returns a "local" axis aligned bounding box of the node. <br/>		返回节点的本地坐标系的外边框.<br/>
     * The returned box is relative only to its parent.									该返回的边框只跟它的父类有关联.	
     * @function
     * @return {cc.Rect} The calculated bounding box of the node				@return {cc.Rect} 节点计算出来的外边框
     */
    getBoundingBox: function () {
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        return cc._rectApplyAffineTransformIn(rect, this.getNodeToParentTransform());
    },

    /**
     * Stops all running actions and schedulers		停止所有的动作跟调度器.
     * @function
     */
    cleanup: function () {
        // actions
        // 动作
        this.stopAllActions();
        this.unscheduleAllCallbacks();

        // event
        // 事件
        cc.eventManager.removeListeners(this);

        // timers
        // 定时器
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.cleanup);
    },

    // composition: GET
    // 组成:GET
    /**
     * Returns a child from the container given its tag														从容器中通过子节点的标签获取一个子节点
     * @function
     * @param {Number} aTag An identifier to find the child node.									@param {Number} aTag 寻找子节点的标记.
     * @return {cc.Node} a CCNode object whose tag equals to the input parameter	@return {cc.Node} 一个标签等于入参的CCNode对象	
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
     * Returns a child from the container given its name														从容器中通过子节点的名称获取一个子节点
     * @function
     * @param {Number} name An identifier to find the child node.										@param {Number} name 寻找子节点的标记.
     * @return {cc.Node} a CCNode object whose name equals to the input parameter		@return {cc.Node} 一个名称等于入参的CCNode对象
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
		// 组成:ADD
    /** <p>"add" logic MUST only be in this method <br/> </p>																																						<p>"add" 方式必须使用该方法<br/> </p>
     *
     * <p>If the child is added to a 'running' node, then 'onEnter' and 'onEnterTransitionDidFinish' will be called immediately.</p>		<p>如果子节点被添加到了一个"running(活动着的)"节点,那么'onEnter'和'onEnterTransitionDidFinish' 将会立即调用</p>
     * @function
     * @param {cc.Node} child  A child node																														@param {cc.Node} child  子节点
     * @param {Number} [localZOrder=]  Z order for drawing priority. Please refer to setZOrder(int)		@param {Number} [localZOrder=]  绘制优先级中的Z顺序值.请参阅setZOrder(int).
     * @param {Number} [tag=]  A integer to identify the node easily. Please refer to setTag(int)			@param {Number} [tag=]  便于标记节点的整数. 请参阅setTag(int).
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
            // prevent onEnterTransitionDidFinish to be called twice when a node is added in onEnter
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
    // 组成:REMOVE
    /**
     * Remove itself from its parent node. If cleanup is true, then also remove all actions and callbacks. <br/>		从它的父类中删除其本身.如果cleanup为true,那么将会删除其所有的动作跟回调.<br/>
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>																				如果cleanup没有传递进来,那么它将会强制设置一个cleanup.<br/>
     * If the node orphan, then nothing happens.																																		如果该节点没有任何的父类,那么就不会有任何的效果.
     * @function
     * @param {Boolean} [cleanup=true] true if all actions and callbacks on this node should be removed, false otherwise.		@param {Boolean} [cleanup=true] 如果子节点中所有的动作和回调函数都被清除的话则为true,否则为false.
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
     * Removes this node itself from its parent node.  <br/>							从该节点的父类中删除该节点本身.<br/>
     * If the node orphan, then nothing happens.													如果该节点没有任何的父类,那么就不会有任何的效果.
     * @deprecated since v3.0, please use removeFromParent() instead			@v3.0版本后弃用,请用removeFromParent()代替
     * @param {Boolean} [cleanup=true] true if all actions and callbacks on this node should be removed, false otherwise.		@param {Boolean} [cleanup=true] 如果子节点中所有的动作和回调函数都被清除的话则为true,否则为false.
     * 
     */
    removeFromParentAndCleanup: function (cleanup) {
        cc.log(cc._LogInfos.Node_removeFromParentAndCleanup);
        this.removeFromParent(cleanup);
    },

    /** <p>Removes a child from the container. It will also cleanup all running actions depending on the cleanup parameter. </p>				<p>从一个容器中删除一个子节点.该函数会依据cleanup来对所有的运行动作进行处理.</p>
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>																														如果cleanup参数没有传递进来,它将会强制设置一个cleanup.<br/>
     * <p> "remove" logic MUST only be on this method  <br/>																																						<p> "remove" 方式必须使用该方法<br/>
     * If a class wants to extend the 'removeChild' behavior it only needs <br/>
     * to override this method </p>																																																			如果一个类想要继承'removeChild'行为,则只需要重写该方法就行.</p>
     * @function
     * @param {cc.Node} child  The child node which will be removed.																																		@param {cc.Node} child  将被删除的子节点.
     * @param {Boolean} [cleanup=true]  true if all running actions and callbacks on the child node will be cleanup, false otherwise.		@param {Boolean} [cleanup=true]  如果子节点中所有的执行中的动作和回调函数都被清除的话则为true,否则为false.
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
     * Removes a child from the container by tag value. It will also cleanup all running actions depending on the cleanup parameter.		根据标签值从一个容器中删除一个子节点.该函数会依据cleanup来对所有的运行动作进行处理.
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>																														如果cleanup参数没有传递进来,它将会强制设置一个cleanup.<br/>
     * @function
     * @param {Number} tag An integer number that identifies a child node																																@param {Number} tag 标记某个子节点的整数
     * @param {Boolean} [cleanup=true] true if all running actions and callbacks on the child node will be cleanup, false otherwise.		@param {Boolean} [cleanup=true] 如果子节点中所有的执行中的动作和回调函数都被清除的话则为true,否则为false.
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
     * Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter.		从容器中删除所有的子节点并且依据cleanup来对所有的运行动作进行处理.
     * @param {Boolean} [cleanup=true]
     */
    removeAllChildrenWithCleanup: function (cleanup) {
        //cc.log(cc._LogInfos.Node_removeAllChildrenWithCleanup);        //TODO It should be discuss in v3.0
        this.removeAllChildren(cleanup);
    },

    /**
     * Removes all children from the container and do a cleanup all running actions depending on the cleanup parameter. <br/>		从容器中删除所有的子节点并且依据cleanup来对所有的运行动作进行处理.<br/>
     * If the cleanup parameter is not passed, it will force a cleanup. <br/>																										如果cleanup参数没有传递进来,它将会强制设置一个cleanup.<br/>
     * @function
     * @param {Boolean} [cleanup=true] true if all running actions on all children nodes should be cleanup, false otherwise.		@param {Boolean} [cleanup=true] 如果所有子节点中所有的执行中的动作都被清除的话则为true,否则为false.
     */
    removeAllChildren: function (cleanup) {
        // not using detachChild improves speed here
        // 在这里不使用detachChild来提高速度
        var __children = this._children;
        if (__children != null) {
            if (cleanup == null)
                cleanup = true;
            for (var i = 0; i < __children.length; i++) {
                var node = __children[i];
                if (node) {
                    // IMPORTANT:
                    // 重要
                    //  -1st do onExit
                    //  -1st 执行onExit
                    //  -2nd cleanup
                    //  -2nd 清除
                    if (this._running) {
                        node.onExitTransitionDidStart();
                        node.onExit();
                    }
                    if (cleanup)
                        node.cleanup();
                    // set parent nil at the end
                    // 最后设置父类为nil
                    node.parent = null;
                }
            }
            this._children.length = 0;
        }
    },

    _detachChild: function (child, doCleanup) {
        // IMPORTANT:
        // 重要
        //  -1st do onExit
        //  -1st 执行onExit
        //  -2nd cleanup
        //  -2nd 清除
        if (this._running) {
            child.onExitTransitionDidStart();
            child.onExit();
        }

        // If you don't do cleanup, the child's actions will not get removed and the
        // 如果你不想进行清除,那么子节点的动作将不会被移除
        if (doCleanup)
            child.cleanup();

        // set parent nil at the end
        // 最后设置父类为nil
        child.parent = null;
        child._cachedParent = null;

        cc.arrayRemoveObject(this._children, child);
    },

    _insertChild: function (child, z) {
        cc.renderer.childrenOrderDirty = this._reorderChildDirty = true;
        this._children.push(child);
        child._setLocalZOrder(z);
    },

    /** Reorders a child according to a new z value. <br/>		对一个孩子重新排序,设定一个新的z轴的值<br/>
     * The child MUST be already added.												子节点必须已经添加.
     * @function
     * @param {cc.Node} child An already added child node. It MUST be already added.				@param {cc.Node} child 一个被添加过的子节点.它必须已经被添加过.
     * @param {Number} zOrder Z order for drawing priority. Please refer to setZOrder(int)	@param {Number} zOrder 绘制优先级中的Z顺序值,请参阅setZOrder(int)
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
     *     Sorts the children array once before drawing, instead of every time when a child is added or reordered.    <br/>		在绘制之前对子节点数组进行排序一次,而不是每次添加或者删除子节点时都排序.<br>
     *     This approach can improves the performance massively.																															这个方法可以大量地提高性能.
     * </p>
     * @function
     * @note Don't call this manually unless a child added needs to be removed in the same frame		@注意:别手工调用该函数除非一个被添加过的子节点需要在同一帧中被删除.
     * 
     */
    sortAllChildren: function () {
        if (this._reorderChildDirty) {
            var _children = this._children;

            // insertion sort
            // 插入排序
            var len = _children.length, i, j, tmp;
            for(i=1; i<len; i++){
                tmp = _children[i];
                j = i - 1;

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
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

            //don't need to check children recursively, that's done in visit of each child
            //不需要递归确认子节点,在访问每个子节点的时候都已经确认完了
            this._reorderChildDirty = false;
        }
    },

    /**
     * Render function using the canvas 2d context or WebGL context, internal usage only, please do not call this function		使用canvas 2d上下文跟WebGL上下文进行渲染的函数,仅供内部使用,请不要调用该函数
     * @function
     * @param {CanvasRenderingContext2D | WebGLRenderingContext} ctx The render context			@param {CanvasRenderingContext2D | WebGLRenderingContext} ctx 渲染上下文
     */
    draw: function (ctx) {
        // override me
        // 重写
        // Only use- this function to draw your staff.
        // 只使用该函数进行绘制你的工作
        // DON'T draw your stuff outside this method
        // 别在该函数以外进行你的绘制工作
    },

    // Internal use only, do not call it by yourself,
    // 仅供内部使用,请别调用该函数.
    transformAncestors: function () {
        if (this._parent != null) {
            this._parent.transformAncestors();
            this._parent.transform();
        }
    },

    //scene managment
    //场景管理
    /**
     * <p>
     *     Event callback that is invoked every time when CCNode enters the 'stage'.                                   <br/>		每次当CCNode进入"stage"时才调用事件回调<br/>
     *     If the CCNode enters the 'stage' with a transition, this event is called when the transition starts.        <br/>		如果CCNode进入"stage"状态时伴随着一个转换(transition),那么事件将会在这个转换开始的时候被调用.<br/>
     *     During onEnter you can't access a "sister/brother" node.                                                    <br/>		在onEnter过程中,你不能够接入"sister/brother"同级节点.<br/>
     *     If you override onEnter, you must call its parent's onEnter function with this._super().															如果你重写了onEnter方法,你应该使用this._super()调用它的父类的onEnter函数.
     * </p>
     * @function
     */
    onEnter: function () {
        this._isTransitionFinished = false;
        this._running = true;//should be running before resumeSchedule //需要在resumeSchedule之前执行
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.onEnter);
        this.resume();
    },

    /**
     * <p>
     *     Event callback that is invoked when the CCNode enters in the 'stage'.                                                        <br/>		每次当CCNode进入"stage"时才调用事件回调.<br/>
     *     If the CCNode enters the 'stage' with a transition, this event is called when the transition finishes.                       <br/>		如果CCNode进入"stage"状态时伴随着一个转换(transition),那么事件将会在这个转换结束的时候被调用.<br/>
     *     If you override onEnterTransitionDidFinish, you shall call its parent's onEnterTransitionDidFinish with this._super()								如果你重写了onEnterTransitionDidFinish方法,你应该使用this._super()调用它的父类中的onEnterTransitionDidFinish函数
     * </p>
     * @function
     */
    onEnterTransitionDidFinish: function () {
        this._isTransitionFinished = true;
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.onEnterTransitionDidFinish);
    },

    /**
     * <p>callback that is called every time the cc.Node leaves the 'stage'.  <br/>																							<p>每次当cc.Node离开"stage"时才调用事件回调.<br/>
     * If the cc.Node leaves the 'stage' with a transition, this callback is called when the transition starts. <br/>						如果cc.Node离开"stage"状态时伴随着一个转换(transition),那么事件将会在这个转换开始的时候被调用.<br/>
     * If you override onExitTransitionDidStart, you shall call its parent's onExitTransitionDidStart with this._super()</p>		如果你重写了onExitTransitionDidStart方法,你应该使用this._super()调用它的父类中的onExitTransitionDidStart函数</p>
     * @function
     */
    onExitTransitionDidStart: function () {
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.onExitTransitionDidStart);
    },

    /**
     * <p>
     * callback that is called every time the cc.Node leaves the 'stage'.                                         <br/>	每次当cc.Node离开"stage"时才调用事件回调<br/>
     * If the cc.Node leaves the 'stage' with a transition, this callback is called when the transition finishes. <br/>	如果cc.Node离开"stage"状态时伴随着一个转换(transition), 那么事件将会在这个转换结束的时候被调用<br/>
     * During onExit you can't access a sibling node.                                                             <br/>	在onEnter过程中中你不能够接入一个同级节点.<br/>
     * If you override onExit, you shall call its parent's onExit with this._super().																		如果你重写了onExit方法,你应该使用this._super()调用它的父类中的onExit函数
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
     * Executes an action, and returns the action that is executed.<br/>				执行一个动作,并且返回执行的该动作.<br/>
     * The node becomes the action's target. Refer to cc.Action's getTarget()		这个节点将会变成动作的目标,参考cc.Action的getTarget()
     * @function
     * @warning Starting from v0.8 actions don't retain their target anymore.		@警告:自从v0.8版本后,动作将不在保留他们的目标对象.
     * @param {cc.Action} action
     * @return {cc.Action} An Action pointer		@return {cc.Action} 锚点
     * 
     */
    runAction: function (action) {
        cc.assert(action, cc._LogInfos.Node_runAction);

        this.actionManager.addAction(action, this, !this._running);
        return action;
    },

    /**
     * Stops and removes all actions from the running action list .		从运行中的动作列表中停止和删除所有的动作.
     * @function
     */
    stopAllActions: function () {
        this.actionManager && this.actionManager.removeAllActionsFromTarget(this);
    },

    /**
     * Stops and removes an action from the running action list.		从运行中的动作列表中停止和删除一个动作.
     * @function
     * @param {cc.Action} action An action object to be removed.		@param {cc.Action} action 要被删除的动作对象.
     */
    stopAction: function (action) {
        this.actionManager.removeAction(action);
    },

    /**
     * Removes an action from the running action list by its tag.				根据它的标签从运行着的动作列表中删除该动作.
     * @function
     * @param {Number} tag A tag that indicates the action to be removed.		@param {Number} tag 要被删除的动作的标签.
     */
    stopActionByTag: function (tag) {
        if (tag === cc.ACTION_TAG_INVALID) {
            cc.log(cc._LogInfos.Node_stopActionByTag);
            return;
        }
        this.actionManager.removeActionByTag(tag, this);
    },

    /**
     * Returns an action from the running action list by its tag.		根据它的标签从运行着的动作列表中返回一个动作.
     * @function
     * @see cc.Node#getTag and cc.Node#setTag
     * @param {Number} tag
     * @return {cc.Action} The action object with the given tag.		@return {cc.Action} 拥有标签的动作对象.
     */
    getActionByTag: function (tag) {
        if (tag === cc.ACTION_TAG_INVALID) {
            cc.log(cc._LogInfos.Node_getActionByTag);
            return null;
        }
        return this.actionManager.getActionByTag(tag, this);
    },

    /** <p>Returns the numbers of actions that are running plus the ones that are schedule to run (actions in actionsToAdd and actions arrays).<br/>		<p>返回活动着的动作加上正在调度运行的动作的总数(在actionsToAdd状态的动作和动作数组中的).<br/>
     *    Composable actions are counted as 1 action. Example:<br/>																																											组成的动作被记为一个动作.例如:<br/>
     *    If you are running 1 Sequence of 7 actions, it will return 1. <br/>																																						如果你正在运行一个包含7个动作的Sequence, 它将返回 1.<br/>
     *    If you are running 7 Sequences of 2 actions, it will return 7.</p>																																						如果你正在运行包含2个动作中的7个Sequences,它将返回 7.</p>
     * @function
     * @return {Number} The number of actions that are running plus the ones that are schedule to run		@return {Number} 被调度去执行的且正在运行中的动作数量.
     */
    getNumberOfRunningActions: function () {
        return this.actionManager.numberOfRunningActionsInTarget(this);
    },

    // cc.Node - Callbacks			cc.Node - 回调
    // timers  定时器
    /**
     * <p>schedules the "update" method.                                                                           <br/>			<p>调度器调度"update"方法.<br/>
     * It will use the order number 0. This method will be called every frame.                                  <br/>					它使用的序列号是0.该方法将调用每一帧.<br/>
     * Scheduled methods with a lower order value will be called before the ones that have a higher order value.<br/>					拥有低顺序值的调度方法将会在有用高顺序值的方法之前被调用.<br/>
     * Only one "update" method could be scheduled per node.</p>																															在每一个节点中,只有一个"update"方法能够被调度.</p>
     * @function
     */
    scheduleUpdate: function () {
        this.scheduleUpdateWithPriority(0);
    },

    /**
     * <p>
     * schedules the "update" callback function with a custom priority.																												调度这个"update"方法伴随着一个自定义优先级
     * This callback function will be called every frame.<br/>																																这个回调函数将会在每一帧被调用.<br/>
     * Scheduled callback functions with a lower priority will be called before the ones that have a higher value.<br/>				拥有低顺序值的调度方法将会在有用高顺序值的方法之前被调用.<br/>
     * Only one "update" callback function could be scheduled per node (You can't have 2 'update' callback functions).<br/>		在每一个节点中,只有一个"update"方法能够被调度(你不能够有2个"update"回调函数).<br/>
     * </p>
     * @function
     * @param {Number} priority
     */
    scheduleUpdateWithPriority: function (priority) {
        this.scheduler.scheduleUpdateForTarget(this, priority, !this._running);
    },

    /**
     * Unschedules the "update" method.			不调度"update"方法.
     * @function
     * @see cc.Node#scheduleUpdate
     */
    unscheduleUpdate: function () {
        this.scheduler.unscheduleUpdateForTarget(this);
    },

    /**
     * <p>Schedules a custom selector.         <br/>																																					<p>调度一个自定义的选择器.<br/>
     * If the selector is already scheduled, then the interval parameter will be updated without scheduling it again.</p>			如果这个选择器已经被调度了,那么内部的参数将会被更新而不用再次调度一遍.</p>	
     * @function
     * @param {function} callback_fn A function wrapped as a selector																																											@param {function} callback_fn 函数包装成的选择器
     * @param {Number} interval  Tick interval in seconds. 0 means tick every frame. If interval = 0, it's recommended to use scheduleUpdate() instead.		@param {Number} interval  运行时间间隔.0表示运行每一帧.如果 interval = 0, 推荐使用scheduleUpdate()来代替.
     * @param {Number} repeat    The selector will be executed (repeat + 1) times, you can use kCCRepeatForever for tick infinitely.											@param {Number} repeat    选择器将会被执行(repeat + 1)次,你可以使用kCCRepeatForever来无限循环执行.
     * @param {Number} delay     The amount of time that the first tick will wait before execution.																												@param {Number} delay     在执行之前,第一次运行需要等待的时间数.
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
     * Schedules a callback function that runs only once, with a delay of 0 or larger							调度一个只运行一次的回调函数,伴随着一个0s或者更大时长的延时
     * @function
     * @see cc.Node#schedule
     * @param {function} callback_fn  A function wrapped as a selector														@param {function} callback_fn  函数包装成的选择器
     * @param {Number} delay  The amount of time that the first tick will wait before execution.	@param {Number} delay  在执行之前,第一次运行需要等待的时间数.	
     */
    scheduleOnce: function (callback_fn, delay) {
        this.schedule(callback_fn, 0.0, 0, delay);
    },

    /**
     * unschedules a custom callback function.										不调度一个自定义的回调函数.
     * @function
     * @see cc.Node#schedule
     * @param {function} callback_fn  A function wrapped as a selector		@param {function} callback_fn  函数包装成的选择器
     */
    unschedule: function (callback_fn) {
        if (!callback_fn)
            return;

        this.scheduler.unscheduleCallbackForTarget(this, callback_fn);
    },

    /**
     * <p>unschedule all scheduled callback functions: custom callback functions, and the 'update' callback function.<br/>		<p>不调度所有的调度回调函数:自定义回调函数,和'update'回调函数.<br/>
     * Actions are not affected by this method.</p>																																						动作不会受到该方法的影响.</p>
     * @function
     */
    unscheduleAllCallbacks: function () {
        this.scheduler.unscheduleAllCallbacksForTarget(this);
    },

    /**
     * Resumes all scheduled selectors and actions.<br/>		重置所有的调度选择器跟调度动作.<br/>
     * This method is called internally by onEnter					该方法在onEnter方法内部被调用.
     * @function
     * @deprecated since v3.0, please use resume() instead	@v3.0后弃用,请使用resume()代替	
     */
    resumeSchedulerAndActions: function () {
        cc.log(cc._LogInfos.Node_resumeSchedulerAndActions);
        this.resume();
    },

    /**
     * <p>Resumes all scheduled selectors and actions.<br/>		<p>重置所有的调度选择器跟调度动作.<br/>
     * This method is called internally by onEnter</p>				该方法在onEnter方法内部被调用.</p>
     */
    resume: function () {
        this.scheduler.resumeTarget(this);
        this.actionManager && this.actionManager.resumeTarget(this);
        cc.eventManager.resumeTarget(this);
    },

    /**
     * <p>Pauses all scheduled selectors and actions.<br/>		<p>暂停所有的调度选择器跟调度动作.<br/>
     * This method is called internally by onExit</p>					该方法在onExit方法内部被调用.</p>
     * @deprecated since v3.0, please use pause instead				@v3.0后弃用,请使用pause代替
     * 
     * @function
     */
    pauseSchedulerAndActions: function () {
        cc.log(cc._LogInfos.Node_pauseSchedulerAndActions);
        this.pause();
    },

    /**
     * <p>Pauses all scheduled selectors and actions.<br/>			<p>暂停所有的调度选择器跟调度动作.<br/>
     * This method is called internally by onExit</p>						该方法在onExit方法内部被调用.</p>
     * 
     * @function
     */
    pause: function () {
        this.scheduler.pauseTarget(this);
        this.actionManager && this.actionManager.pauseTarget(this);
        cc.eventManager.pauseTarget(this);
    },

    /**
     *<p>Sets the additional transform.<br/>																																														<p>为节点设置一个附加转换矩阵.<br/>
     *  The additional transform will be concatenated at the end of getNodeToParentTransform.<br/>																			该附加转换矩阵将会在getNodeToParentTransform结束后进行级联.<br/>
     *  It could be used to simulate `parent-child` relationship between two nodes (e.g. one is in BatchNode, another isn't).<br/>			它将被用于模拟两个节点之间的父子关系(例如:一个BatchNode,另一个不是).<br/>
     *  </p>
     *  @function
     *  @param {cc.AffineTransform} additionalTransform  The additional transform			@param {cc.AffineTransform} additionalTransform  附加的转换
     *  @example
     * // create a batchNode
     * var batch = new cc.SpriteBatchNode("Icon-114.png");
     * this.addChild(batch);
     *
     * // create two sprites, spriteA will be added to batchNode, they are using different textures.
     * // 创建两个精灵,spriteA将会被添加到batchNode,他们使用不同的纹理.
     * var spriteA = new cc.Sprite(batch->getTexture());
     * var spriteB = new cc.Sprite("Icon-72.png");
     *
     * batch.addChild(spriteA);
     *
     * // We can't make spriteB as spriteA's child since they use different textures. So just add it to layer.
     * // 我们不能将spriteB当做spriteA的子节点来处理因为他们使用不同的纹理.所以将其添加到layer中.
     * // But we want to simulate `parent-child` relationship for these two node.
     * // 但我们想为这两个节点模拟'parent-child'(父子)关系.
     * this.addChild(spriteB);
     *
     * //position
     * spriteA.setPosition(ccp(200, 200));
     *
     * // Gets the spriteA's transform.
     * // 获取spriteA的变换.
     * var t = spriteA.getNodeToParentTransform();
     *
     * // Sets the additional transform to spriteB, spriteB's position will based on its pseudo parent i.e. spriteA.
     * // 设置附加变换矩阵给spriteB,spriteB的位置将会基于其伪父亲的位置即spriteA.
     * spriteB.setAdditionalTransform(t);
     *
     * //scale
     * //缩放
     * spriteA.setScale(2);
     *
     * // Gets the spriteA's transform.
     * // 获取spriteA的变换.
     * t = spriteA.getNodeToParentTransform();
     *
     * // Sets the additional transform to spriteB, spriteB's scale will based on its pseudo parent i.e. spriteA.
     * // 设置附加变换矩阵给spriteB,spriteB的缩放比例将会基于其伪父亲的缩放比例即spriteA.
     * spriteB.setAdditionalTransform(t);
     *
     * //rotation
     * //旋转
     * spriteA.setRotation(20);
     *
     * // Gets the spriteA's transform.
     * // 获取spriteA的变换.
     * t = spriteA.getNodeToParentTransform();
     *
     * // Sets the additional transform to spriteB, spriteB's rotation will based on its pseudo parent i.e. spriteA.
     * // 设置附加变换矩阵给spriteB,spriteB的旋转将会基于其伪父亲的旋转即spriteA.
     * spriteB.setAdditionalTransform(t);
     */
    setAdditionalTransform: function (additionalTransform) {
        this._additionalTransform = additionalTransform;
        this._transformDirty = true;
        this._additionalTransformDirty = true;
    },

    /**
     * Returns the matrix that transform parent's space coordinates to the node's (local) space coordinates.<br/>			返回由父类空间坐标系变换至节点的本地坐标系的矩阵.<br/>
     * The matrix is in Pixels.																																												矩阵单位是像素.	
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
     * @deprecated since v3.0, please use getParentToNodeTransform instead		@v3.0版本后弃用,请使用getParentToNodeTransform代替.
     */
    parentToNodeTransform: function () {
        return this.getParentToNodeTransform();
    },

    /**
     * Returns the world affine transform matrix. The matrix is in Pixels.		返回世界仿射变换矩阵.矩阵单位是像素.
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
     * @deprecated since v3.0, please use getNodeToWorldTransform instead		@v3.0版本后弃用,请使用getNodeToWorldTransform代替.
     */
    nodeToWorldTransform: function(){
        return this.getNodeToWorldTransform();
    },

    /**
     * Returns the inverse world affine transform matrix. The matrix is in Pixels.		返回逆世界仿射变换矩阵.矩阵单位是像素.
     * @function
     * @return {cc.AffineTransform}
     */
    getWorldToNodeTransform: function () {
        return cc.affineTransformInvert(this.getNodeToWorldTransform());
    },

    /**
     * @function
     * @deprecated since v3.0, please use getWorldToNodeTransform instead			@v3.0版本后弃用,请使用getWorldToNodeTransform代替.
     */
    worldToNodeTransform: function () {
        return this.getWorldToNodeTransform();
    },

    /**
     * Converts a Point to node (local) space coordinates. The result is in Points.		一个节点到空间坐标系的转换.结果以Points为单位.
     * @function
     * @param {cc.Point} worldPoint
     * @return {cc.Point}
     */
    convertToNodeSpace: function (worldPoint) {
        return cc.pointApplyAffineTransform(worldPoint, this.getWorldToNodeTransform());
    },

    /**
     * Converts a Point to world space coordinates. The result is in Points.		一个节点到世界坐标系的转换.结果以Points为单位.
     * @function
     * @param {cc.Point} nodePoint
     * @return {cc.Point}
     */
    convertToWorldSpace: function (nodePoint) {
        nodePoint = nodePoint || cc.p(0,0);
        return cc.pointApplyAffineTransform(nodePoint, this.getNodeToWorldTransform());
    },

    /**
     * Converts a Point to node (local) space coordinates. The result is in Points.<br/>			一个节点至本地空间坐标系的转.结果以Points为单位.
     * treating the returned/received node point as anchor relative.													将returned/received节点的point当作相对应的锚点.
     * @function
     * @param {cc.Point} worldPoint
     * @return {cc.Point}
     */
    convertToNodeSpaceAR: function (worldPoint) {
        return cc.pSub(this.convertToNodeSpace(worldPoint), this._anchorPointInPoints);
    },

    /**
     * Converts a local Point to world space coordinates.The result is in Points.<br/>		一个节点到世界坐标系的转换.结果以Points为单位.<br/>
     * treating the returned/received node point as anchor relative.											将returned/received节点的point当作相对应的锚点.
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

    /** convenience methods which take a cc.Touch instead of cc.Point				一个便利的将cc.Touch转换成cc.Point的方法
     * @function
     * @param {cc.Touch} touch The touch object			@param {cc.Touch} touch 触摸对象
     * @return {cc.Point}
     */
    convertTouchToNodeSpace: function (touch) {
        var point = touch.getLocation();
        //TODO This point needn't convert to GL in HTML5
        //TODO 该点在HTML5中不需要转换至GL
        //point = cc.director.convertToGL(point);
        return this.convertToNodeSpace(point);
    },

    /**
     * converts a cc.Touch (world coordinates) into a local coordiante. This method is AR (Anchor Relative).		将cc.Touch(世界坐标系)转换成本地坐标系.这个方法是AR(相对于锚点). 
     * @function
     * @param {cc.Touch} touch The touch object			@param {cc.Touch} touch 触摸对象
     * @return {cc.Point}
     */
    convertTouchToNodeSpaceAR: function (touch) {
        var point = touch.getLocation();
        point = cc.director.convertToGL(point);
        return this.convertToNodeSpaceAR(point);
    },

    /**
     * Update will be called automatically every frame if "scheduleUpdate" is called when the node is "live".<br/>		如果"scheduleUpdate"被调用且节点是活动的,Update将会被每一帧调用.<br/>
     * The default behavior is to invoke the visit function of node's componentContainer.<br/>												默认的动作是调用节点的componentContainer访问函数.<br/>
     * Override me to implement your own update logic.																																重写该函数从而实现你自己的更新方法.
     * @function
     * @param {Number} dt Delta time since last update																																@param {Number} dt 最近一次更新后的延迟时间
     */
    update: function (dt) {
        if (this._componentContainer && !this._componentContainer.isEmpty())
            this._componentContainer.visit(dt);
    },

    /**
     * <p>
     * Calls children's updateTransform() method recursively.                                        <br/>			递归调用子节点的updateTransform()方法.<br/>
     * This method is moved from CCSprite, so it's no longer specific to CCSprite.                   <br/>			这个方法从Sprite类中删除,因此它不再适用于Sprite.<br/>
     * As the result, you apply CCSpriteBatchNode's optimization on your customed CCNode.            <br/>			因此,你应该在你自定义的CCNode中使用SpriteBatchNode的优化.<br/>
     * e.g., batchNode->addChild(myCustomNode), while you can only addChild(sprite) before.											例如,batchNode->addChild(myCustomNode),你只能先addChild(sprite).
     * </p>
     * @function
     */
    updateTransform: function () {
        // Recursively iterate over children
        // 递归遍历子节点
        this._arrayMakeObjectsPerformSelector(this._children, cc.Node._stateCallbackType.updateTransform);
    },

    /**
     * <p>Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,																		<p>当前JavaScript Bindings (JSB),在某些情况下,需要使用retain和release,这是在JSB中的一个bug,		
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.																			且不好的解决方式是使用retain/release.所以,这两个方法需要添加使其兼容JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug<br/>																																	这是一个漏洞,一旦JSB修复了retain/release的bug,则它需要被移除<br/>
     * You will need to retain an object if you created an engine object and haven't added it into the scene graph during the same frame.<br/>					你将需要保留一个对象,如果你创建一个引擎对象但在每一帧中没有将其添加进scene graph中.<br/>
     * Otherwise, JSB's native autorelease pool will consider this object a useless one and release it directly,<br/>																		然后,JSB本地自动释放池将会判断一个未被使用的对象并立即释放该对象,<br/>
     * when you want to use it later, a "Invalid Native Object" error will be raised.<br/>																															当然想要在后面中使用它,一个"无效的原生对象"错误将会被提示.<br/>
     * The retain function can increase a reference count for the native object to avoid it being released,<br/>																				该保留函数会为原生对象进行计算引用数量避免其被释放掉,<br/>
     * you need to manually invoke release function when you think this object is no longer needed, otherwise, there will be memory learks.<br/>				你需要手工调用该释放函数当你认为一个对象将不在被需要的时候,否则,将会内存泄露.<br/>
     * retain and release function call should be paired in developer's game code.</p>																																	在开发者的代码中,retain和release函数需要备成对的调用.</p>
     * 
     * @function
     * @see cc.Node#release
     */
    retain: function () {
    },
    /**
     * <p>Currently JavaScript Bindings (JSB), in some cases, needs to use retain and release. This is a bug in JSB,																		<p>当前JavaScript Bindings (JSB),在某些情况下,需要使用retain和release,这是在JSB中的一个bug,
     * and the ugly workaround is to use retain/release. So, these 2 methods were added to be compatible with JSB.																			且不好的解决方式是使用retain/release.所以,这两个方法需要添加使其兼容JSB.
     * This is a hack, and should be removed once JSB fixes the retain/release bug<br/>																																	这是一个漏洞,一旦JSB修复了retain/release的bug,则它需要被移除<br/>
     * You will need to retain an object if you created an engine object and haven't added it into the scene graph during the same frame.<br/>					你将需要保留一个对象,如果你创建一个引擎对象但在每一帧中没有将其添加进scene graph中.<br/>
     * Otherwise, JSB's native autorelease pool will consider this object a useless one and release it directly,<br/>																		然后,JSB本地自动释放池将会判断一个未被使用的对象并立即释放该对象,<br/>
     * when you want to use it later, a "Invalid Native Object" error will be raised.<br/>																															当然想要在后面中使用它,一个"无效的原生对象"错误将会被提示.<br/>
     * The retain function can increase a reference count for the native object to avoid it being released,<br/>																				该保留函数会为原生对象进行计算引用数量避免其被释放掉,<br/>
     * you need to manually invoke release function when you think this object is no longer needed, otherwise, there will be memory learks.<br/>				你需要手工调用该释放函数当你认为一个对象将不在被需要的时候,否则,将会内存泄露.<br/>
     * retain and release function call should be paired in developer's game code.</p>																																	在开发者的代码中,retain和release函数需要备成对的调用.</p>
     * @function
     * @see cc.Node#retain
     */
    release: function () {
    },

    /**
     * Returns a component identified by the name given.		根据组件名称获取组件
     * @function
     * @param {String} name The name to search for			@param {String} name 搜索用的名称
     * @return {cc.Component} The component found				@return {cc.Component} 找到的组件
     */
    getComponent: function (name) {
        if(this._componentContainer)
            return this._componentContainer.getComponent(name);
        return null;
    },

    /**
     * Adds a component to the node's component container.			添加一个组价到节点的组件容器中.
     * @function
     * @param {cc.Component} component
     */
    addComponent: function (component) {
        if(this._componentContainer)
            this._componentContainer.add(component);
    },

    /**
     * Removes a component identified by the given name or removes the component object given			根据定义的组件名称或者组件对象删除组件
     * @function
     * @param {String|cc.Component} component
     */
    removeComponent: function (component) {
        if(this._componentContainer)
            return this._componentContainer.remove(component);
        return false;
    },

    /**
     * Removes all components of cc.Node, it called when cc.Node is exiting from stage.			删除节点的所有组件,当节点退出的时候会进行调用.
     * @function
     */
    removeAllComponents: function () {
        if(this._componentContainer)
            this._componentContainer.removeAll();
    },

    grid: null,

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function.	构造函数,为了继承父类构造器中的行为进行重写,记得在要继承的函数中调用"this._super()".
     * @function
     */
    ctor: null,

    /**
     * Recursive method that visit its children and draw them			递归访问子类并绘制出子类
     * @function
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx
     */
    visit: null,

    /**
     * Performs view-matrix transformation based on position, scale, rotation and other attributes.					执行基于位置,缩放,旋转及其他属性的视图矩阵变换.
     * @function
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx Render context		@param {CanvasRenderingContext2D|WebGLRenderingContext} ctx 渲染上下文
     */
    transform: null,

    /**
     * <p>Returns the matrix that transform the node's (local) space coordinates into the parent's space coordinates.<br/>		<p>获取节点从本地空间坐标到父类中的空间坐标的转换矩阵<br/>
     * The matrix is in Pixels.</p>																																														矩阵单位是像素.</p>
     * @function
     * @return {cc.AffineTransform}
     * @deprecated since v3.0, please use getNodeToParentTransform instead						@v3.0版本后弃用, 请使用getNodeToParentTransform替代
     */
    nodeToParentTransform: function(){
        return this.getNodeToParentTransform();
    },

    /**
     * Returns the matrix that transform the node's (local) space coordinates into the parent's space coordinates.<br/>				获取节点从本地空间坐标到父类中的空间坐标的转换矩阵<br/>
     * The matrix is in Pixels.																																																矩阵单位是像素.
     * @function
     * @return {cc.AffineTransform} The affine transform object			@return {cc.AffineTransform} 仿射变换对象
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
     * Returns a camera object that lets you move the node using a gluLookAt											返回一个摄像机对象,使你可以使用一个gluLookAt对节点进行移动	
     * @function
     * @return {cc.Camera} A CCCamera object that lets you move the node using a gluLookAt				@return {cc.Camera} A CCCamera可以让你使用一个gluLookAt来移动节点
     * @deprecated since v3.0, no alternative function																						@v3.0后弃用,不再使用的函数.
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
     * <p>Returns a grid object that is used when applying effects.<br/>											<p>当使用效果的时候,获取一个被使用的网格对象<br/>
     * This function have been deprecated, please use cc.NodeGrid to run grid actions</p>			该函数已被废弃,请使用cc.NodeGrid进行创建网格动作</p>
     * @function
     * @return {cc.GridBase} A CCGrid object that is used when applying effects								@return {cc.GridBase} A 使用效果时将被使用的CCGrid对象
     * @deprecated since v3.0, no alternative function																				@v3.0后弃用,不再使用的函数.
     */
    getGrid: function () {
        return this.grid;
    },

    /**
     * <p>Changes a grid object that is used when applying effects<br/>														<p>当使用效果的时候,改变一个被使用的网格对象<br/>
     * This function have been deprecated, please use cc.NodeGrid to run grid actions</p>					该函数已被废弃,请使用cc.NodeGrid进行创建网格动作</p>
     * @function
     * @param {cc.GridBase} grid A CCGrid object that is used when applying effects								@param {cc.GridBase} grid 使用效果时将被使用的CCGrid对象
     * @deprecated since v3.0, no alternative function																						@v3.0后弃用,不再使用的函数.
     */
    setGrid: function (grid) {
        this.grid = grid;
    },

    /**
     * Return the shader program currently used for this node												返回节点当前所使用的着色过程
     * @function
     * @return {cc.GLProgram} The shader program currently used for this node				@return {cc.GLProgram} 该节点当前使用的着色器.
     * 
     */
    getShaderProgram: function () {
        return this._shaderProgram;
    },

    /**
     * <p>
     *     Sets the shader program for this node																			设置节点着色过程
     *
     *     Since v2.0, each rendering node must set its shader program.								v2.0版本以后,每个要渲染的节点都要设置它的着色过程.
     *     It should be set in initialize phase.																			它必须在初始化阶段进行
     * </p>
     * @function
     * @param {cc.GLProgram} newShaderProgram The shader program which fetches from CCShaderCache.			@param {cc.GLProgram} newShaderProgram 从CCShaderCache获得的着色器程序.
     * @example
     * node.setGLProgram(cc.shaderCache.programForKey(cc.SHADER_POSITION_TEXTURECOLOR));
     */
    setShaderProgram: function (newShaderProgram) {
        this._shaderProgram = newShaderProgram;
    },

    /**
     * Returns the state of OpenGL server side.									返回OpenGL服务端的状态.
     * @function
     * @return {Number} The state of OpenGL server side.				@return {Number} OpenGL服务端的状态.
     * @deprecated since v3.0, no need anymore									@v3.0后弃用,不再被使用	
     */
    getGLServerState: function () {
        return this._glServerState;
    },

    /**
     * Sets the state of OpenGL server side.											设置OpenGL服务端的状态.
     * @function
     * @param {Number} state The state of OpenGL server side.			@param {Number} state OpenGL服务端的状态.
     * @deprecated since v3.0, no need anymore										@v3.0后弃用,不再被使用
     */
    setGLServerState: function (state) {
        this._glServerState = state;
    },

    /**
     * Returns a "world" axis aligned bounding box of the node.		返回节点的世界坐标系的边框.
     * @function
     * @return {cc.Rect}
     */
    getBoundingBoxToWorld: function () {
        var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
        var trans = this.getNodeToWorldTransform();
        rect = cc.rectApplyAffineTransform(rect, this.getNodeToWorldTransform());

        //query child's BoundingBox
        //查询子类的BoundingBox
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

        //query child's BoundingBox
        //查询子类的BoundingBox
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
            // Translate values
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

            // Rotation values
            // 旋转值
            // Change rotation code to handle X and Y
            // 改变旋转代码来处理处理X轴跟Y轴
            // If we skew with the exact same value for both x and y then we're simply just rotating
            // 如果我们只用相同的值来对X轴跟Y轴进行倾斜,那么我们仅仅只是进行了旋转
            var cx = 1, sx = 0, cy = 1, sy = 0;
            if (_t._rotationX !== 0 || _t._rotationY !== 0) {
                cx = Math.cos(-_t._rotationRadiansX);
                sx = Math.sin(-_t._rotationRadiansX);
                cy = Math.cos(-_t._rotationRadiansY);
                sy = Math.sin(-_t._rotationRadiansY);
            }
            var needsSkewMatrix = ( _t._skewX || _t._skewY );

            // optimization:
            // 优化:
            // inline anchor point calculation if skew is not needed
            // 如果不需要倾斜 则进行内联锚点的计算
            // Adjusted transform calculation for rotational skew
            // 对旋转倾斜进行变换计算
            if (!needsSkewMatrix && (apx !== 0 || apy !== 0)) {
                x += cy * napx * scx + -sx * napy * scy;
                y += sy * napx * scx + cx * napy * scy;
            }

            // Build Transform Matrix
            // 生成转换矩阵
            // Adjusted transform calculation for rotational skew
            // 对旋转倾斜进行变换计算
            var t = _t._transform;
            t.a = cy * scx;
            t.b = sy * scx;
            t.c = -sx * scy;
            t.d = cx * scy;
            t.tx = x;
            t.ty = y;

            // XXX: Try to inline skew
            // XXX: 尝试内联倾斜
            // If skew is needed, apply skew and then anchor point
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
     * Returns the opacity of Node			返回节点的不透明度
     * @function
     * @returns {number} opacity
     */
    getOpacity: function () {
        return this._realOpacity;
    },

    /**
     * Returns the displayed opacity of Node,																																																																			返回节点的显示的不透明度值,
     * the difference between displayed opacity and opacity is that displayed opacity is calculated based on opacity and parent node's opacity when cascade opacity enabled.			显示不透明度跟不透明度的区别在于:当启用级联不透明度的时候,显示不透明度是基于自身的不透明度跟父类的不透明度计算出来的.
     * @function
     * @returns {number} displayed opacity				@returns {number} 显示的不透明度
     * 
     */
    getDisplayedOpacity: function () {
        return this._displayedOpacity;
    },

    /**
     * Sets the opacity of Node				设置节点的不透明度值
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
     * Update displayed opacity			更新显示的不透明度值
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
     * Returns whether node's opacity value affect its child nodes.			返回节点的不透明度值是否会影响到其子节点.
     * @function
     * @returns {boolean}
     */
    isCascadeOpacityEnabled: function () {
        return this._cascadeOpacityEnabled;
    },

    /**
     * Enable or disable cascade opacity, if cascade enabled, child nodes' opacity will be the multiplication of parent opacity and its own opacity.			启用或不启用级联不透明度,如果启用,子节点的不透明度值是父类的不透明度值跟其本身不透明度值的乘积.
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
     * Returns the color of Node		返回节点的颜色
     * @function
     * @returns {cc.Color}
     */
    getColor: function () {
        var locRealColor = this._realColor;
        return cc.color(locRealColor.r, locRealColor.g, locRealColor.b, locRealColor.a);
    },

    /**
     * Returns the displayed color of Node,																																																																	返回节点显示的颜色,			
     * the difference between displayed color and color is that displayed color is calculated based on color and parent node's color when cascade color enabled.						显示颜色跟颜色的区别在于:当启用级联颜色的时候,显示颜色是基于自身的颜色跟父类的颜色计算出来的.
     * @function
     * @returns {cc.Color}
     */
    getDisplayedColor: function () {
        var tmpColor = this._displayedColor;
        return cc.color(tmpColor.r, tmpColor.g, tmpColor.b, tmpColor.a);
    },

    /**
     * <p>Sets the color of Node.<br/>																																																	<p>设置节点的颜色.<br/>
     * When color doesn't include opacity value like cc.color(128,128,128), this function only change the color. <br/>									当颜色未包含不透明度的值 例如:cc.color(128,128,128),该函数仅仅是改变颜色.<br/>
     * When color include opacity like cc.color(128,128,128,100), then this function will change the color and the opacity.</p>					但颜色包含不透明度值 例如:cc.color(128,128,128,100),该函数将改变颜色跟不透明度.</p>
     * @function
     * @param {cc.Color} color The new color given					@param {cc.Color} color 传入的新的颜色
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
     * Update the displayed color of Node				更新节点显示的颜色
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
     * Returns whether node's color value affect its child nodes.			返回该节点的颜色值是否会影响到其子节点.
     * @function
     * @returns {boolean}
     */
    isCascadeColorEnabled: function () {
        return this._cascadeColorEnabled;
    },

    /**
     * Enable or disable cascade color, if cascade enabled, child nodes' opacity will be the cascade value of parent color and its own color.			启用或者不启用级联颜色,如果启用,则子节点的不透明度将级联父类的颜色值跟其本身的颜色值.
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
     * Set whether color should be changed with the opacity value,																设置颜色值是否要跟着不透明度进行改变,
     * useless in cc.Node, but this function is override in some class to have such behavior.			该函数在cc.Node中无效,但该函数在某些类中被重写了,以便使用该功能.
     * @function
     * @param {Boolean} opacityValue
     */
    setOpacityModifyRGB: function (opacityValue) {
    },

    /**
     * Get whether color should be changed with the opacity value				获取颜色值是否有因不透明度值的改变而改变
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
 * Allocates and initializes a node.																	分配并初始化一个节点
 * @deprecated since v3.0, please use new construction instead.				@v3.0版本后弃用, 请用新的构造器替代.
 * @see cc.Node
 * @return {cc.Node}
 */
cc.Node.create = function () {
    return new cc.Node();
};

cc.Node._stateCallbackType = {onEnter: 1, onExit: 2, cleanup: 3, onEnterTransitionDidFinish: 4, updateTransform: 5, onExitTransitionDidStart: 6, sortAllChildren: 7};

if (cc._renderType === cc._RENDER_TYPE_CANVAS) {
    //redefine cc.Node
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
        // quick return if not visible
        // 如果不可见则立即返回
        if (!_t._visible)
            return;

        if( _t._parent)
            _t._curLevel = _t._parent._curLevel + 1;

        //visit for canvas
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
        // 对canvas(画布)进行坐标变换
        var t = this.getNodeToParentTransform(),
            worldT = this._transformWorld;         //get the world transform //获取世界坐标变换

        if(this._parent){
            var pt = this._parent._transformWorld;
            // cc.AffineTransformConcat is incorrect at get world transform
            // cc.AffineTransformConcat无法获得世界坐标变换
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
        if(_t._usingNormalizedPosition && _t._parent){        //TODO need refactor //TODO 需要重构
            var conSize = _t._parent._contentSize;
            _t._position.x = _t._normalizedPosition.x * conSize.width;
            _t._position.y = _t._normalizedPosition.y * conSize.height;
            _t._normalizedPositionDirty = false;
        }
        if (_t._transformDirty) {
            var t = _t._transform;// quick reference //快速引用

            // base position
            t.tx = _t._position.x;
            t.ty = _t._position.y;

            // rotation Cos and Sin
            // Cos和Sin旋转
            var Cos = 1, Sin = 0;
            if (_t._rotationX) {
                Cos = Math.cos(_t._rotationRadiansX);
                Sin = Math.sin(_t._rotationRadiansX);
            }

            // base abcd
            // 基准abcd
            t.a = t.d = Cos;
            t.b = -Sin;
            t.c = Sin;

            var lScaleX = _t._scaleX, lScaleY = _t._scaleY;
            var appX = _t._anchorPointInPoints.x, appY = _t._anchorPointInPoints.y;

            // Firefox on Vista and XP crashes
            // GPU thread in case of scale(0.0, 0.0)
            // 如果在GPU线程中进行缩放
            var sx = (lScaleX < 0.000001 && lScaleX > -0.000001) ? 0.000001 : lScaleX,
                sy = (lScaleY < 0.000001 && lScaleY > -0.000001) ? 0.000001 : lScaleY;

            // skew
            if (_t._skewX || _t._skewY) {
                // offset the anchorpoint
                // 锚点偏移
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

            // adjust anchorPoint
            // 调整锚点
            t.tx += Cos * -appX * sx + -Sin * appY * sy;
            t.ty -= Sin * -appX * sx + Cos * appY * sy;

            // if ignore anchorPoint
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
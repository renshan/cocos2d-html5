/****************************************************************************
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
 * @ignore
 */
cc._EventListenerVector = cc.Class.extend({
    _fixedListeners: null,
    _sceneGraphListeners: null,
    gt0Index: 0,

    ctor: function () {
        this._fixedListeners = [];
        this._sceneGraphListeners = [];
    },

    size: function () {
        return this._fixedListeners.length + this._sceneGraphListeners.length;
    },

    empty: function () {
        return (this._fixedListeners.length === 0) && (this._sceneGraphListeners.length === 0);
    },

    push: function (listener) {
        if (listener._getFixedPriority() == 0)
            this._sceneGraphListeners.push(listener);
        else
            this._fixedListeners.push(listener);
    },

    clearSceneGraphListeners: function () {
        this._sceneGraphListeners.length = 0;
    },

    clearFixedListeners: function () {
        this._fixedListeners.length = 0;
    },

    clear: function () {
        this._sceneGraphListeners.length = 0;
        this._fixedListeners.length = 0;
    },

    getFixedPriorityListeners: function () {
        return this._fixedListeners;
    },

    getSceneGraphPriorityListeners: function () {
        return this._sceneGraphListeners;
    }
});

cc.__getListenerID = function (event) {
    var eventType = cc.Event, getType = event.getType();
    if(getType === eventType.ACCELERATION)
        return cc._EventListenerAcceleration.LISTENER_ID;
    if(getType === eventType.CUSTOM)
        return event.getEventName();
    if(getType === eventType.KEYBOARD)
        return cc._EventListenerKeyboard.LISTENER_ID;
    if(getType === eventType.MOUSE)
        return cc._EventListenerMouse.LISTENER_ID;
    if(getType === eventType.TOUCH){
        // 触摸监听者非常特殊，它包括两种监听者：EventListenerTouchOneByOne 和 EventListenerTouchAllAtOnce。
        // 返回UNKNOWN
        cc.log(cc._LogInfos.__getListenerID);
    }
    return "";
};

/**
 * <p>
 *  cc.eventManager是一个单例对象，它管理事件监听者的订阅和事件的调度。 <br/> 
 *                                                                                                              <br/>
 *  EventListener列表以这种方式被管理，因此事件监听者能在事件被调度的时候被加入和移除。
 * </p>
 * @class
 * @name cc.eventManager
 */
cc.eventManager = /** @lends cc.eventManager# */{
    //Priority dirty flag （优先级污点标志）
    DIRTY_NONE:0,
    DIRTY_FIXED_PRIORITY:1 <<0,
    DIRTY_SCENE_GRAPH_PRIORITY : 1<< 1,
    DIRTY_ALL: 3,

    _listenersMap: {},
    _priorityDirtyFlagMap: {},
    _nodeListenersMap: {},
    _nodePriorityMap: {},
    _globalZOrderNodeMap: {},
    _toAddedListeners: [],
    _dirtyNodes: [],
    _inDispatch: 0,
    _isEnabled: false,
    _nodePriorityIndex: 0,

    _internalCustomListenerIDs:[cc.game.EVENT_HIDE, cc.game.EVENT_SHOW],

    _setDirtyForNode: function (node) {
        // Mark the node dirty only when there is an event listener associated with it. 标识节点污点，仅在有一个事件监听者与它有关联时。
        if (this._nodeListenersMap[node.__instanceId] != null)
            this._dirtyNodes.push(node);
        var _children = node.getChildren();
        for(var i = 0, len = _children.length; i < len; i++)
            this._setDirtyForNode(_children[i]);
    },

    /**
     * 暂停所有与特定的目标相关联的监听者。
     * @param {cc.Node} node
     * @param {Boolean} [recursive=false]
     */
    pauseTarget: function (node, recursive) {
        var listeners = this._nodeListenersMap[node.__instanceId], i, len;
        if (listeners) {
            for ( i = 0, len = listeners.length; i < len; i++)
                listeners[i]._setPaused(true);
        }
        if (recursive === true) {
            var locChildren = node.getChildren();
            for ( i = 0, len = locChildren.length; i< len; i++)
                this.pauseTarget(locChildren[i], true);
        }
    },

    /**
     * 唤醒所有与特定的目标相关联的监听者。
     * @param {cc.Node} node
     * @param {Boolean} [recursive=false]
     */
    resumeTarget: function (node, recursive) {
        var listeners = this._nodeListenersMap[node.__instanceId], i, len;
        if (listeners){
            for ( i = 0, len = listeners.length; i < len; i++)
                listeners[i]._setPaused(false);
        }
        this._setDirtyForNode(node);
        if (recursive === true) {
            var locChildren = node.getChildren();
            for ( i = 0, len = locChildren.length; i< len; i++)
                this.resumeTarget(locChildren[i], true);
        }
    },

    _addListener: function (listener) {
        if (this._inDispatch === 0)
            this._forceAddEventListener(listener);
        else
            this._toAddedListeners.push(listener);
    },

    _forceAddEventListener: function (listener) {
        var listenerID = listener._getListenerID();
        var listeners = this._listenersMap[listenerID];
        if (!listeners) {
            listeners = new cc._EventListenerVector();
            this._listenersMap[listenerID] = listeners;
        }
        listeners.push(listener);

        if (listener._getFixedPriority() == 0) {
            this._setDirty(listenerID, this.DIRTY_SCENE_GRAPH_PRIORITY);

            var node = listener._getSceneGraphPriority();
            if (node == null)
                cc.log(cc._LogInfos.eventManager__forceAddEventListener);

            this._associateNodeAndEventListener(node, listener);
            if (node.isRunning())
                this.resumeTarget(node);
        } else
            this._setDirty(listenerID, this.DIRTY_FIXED_PRIORITY);
    },

    _getListeners: function (listenerID) {
        return this._listenersMap[listenerID];
    },

    _updateDirtyFlagForSceneGraph: function () {
        if (this._dirtyNodes.length == 0)
            return;

        var locDirtyNodes = this._dirtyNodes, selListeners, selListener, locNodeListenersMap = this._nodeListenersMap;
        for (var i = 0, len = locDirtyNodes.length; i < len; i++) {
            selListeners = locNodeListenersMap[locDirtyNodes[i].__instanceId];
            if (selListeners) {
                for (var j = 0, listenersLen = selListeners.length; j < listenersLen; j++) {
                    selListener = selListeners[j];
                    if (selListener)
                        this._setDirty(selListener._getListenerID(), this.DIRTY_SCENE_GRAPH_PRIORITY);
                }
            }
        }
        this._dirtyNodes.length = 0;
    },

    _removeAllListenersInVector: function (listenerVector) {
        if (!listenerVector)
            return;
        var selListener;
        for (var i = 0; i < listenerVector.length;) {
            selListener = listenerVector[i];
            selListener._setRegistered(false);
            if (selListener._getSceneGraphPriority() != null){
                this._dissociateNodeAndEventListener(selListener._getSceneGraphPriority(), selListener);
                selListener._setSceneGraphPriority(null);   // NULL out the node pointer so we don't have any dangling pointers to destroyed nodes. 把节点指针设置为NULL, 我们就不需要dangling指针来销毁节点。
            }

            if (this._inDispatch === 0)
                cc.arrayRemoveObject(listenerVector, selListener);
            else
                ++i;
        }
    },

    _removeListenersForListenerID: function (listenerID) {
        var listeners = this._listenersMap[listenerID], i;
        if (listeners) {
            var fixedPriorityListeners = listeners.getFixedPriorityListeners();
            var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

            this._removeAllListenersInVector(sceneGraphPriorityListeners);
            this._removeAllListenersInVector(fixedPriorityListeners);

            // 根据listenerID来移除污点标识。
            // 不需要检查调度起是否正在调度事件。
            delete this._priorityDirtyFlagMap[listenerID];

            if (!this._inDispatch) {
                listeners.clear();
                delete this._listenersMap[listenerID];
            }
        }

        var locToAddedListeners = this._toAddedListeners, listener;
        for (i = 0; i < locToAddedListeners.length;) {
            listener = locToAddedListeners[i];
            if (listener && listener._getListenerID() == listenerID)
                cc.arrayRemoveObject(locToAddedListeners, listener);
            else
                ++i;
        }
    },

    _sortEventListeners: function (listenerID) {
        var dirtyFlag = this.DIRTY_NONE,  locFlagMap = this._priorityDirtyFlagMap;
        if (locFlagMap[listenerID])
            dirtyFlag = locFlagMap[listenerID];

        if (dirtyFlag != this.DIRTY_NONE) {
            // 如果rootNode是NULL,先清楚所有的污点标识,然后设置场景图优先级的污点标识
            locFlagMap[listenerID] = this.DIRTY_NONE;

            if (dirtyFlag & this.DIRTY_FIXED_PRIORITY)
                this._sortListenersOfFixedPriority(listenerID);

            if (dirtyFlag & this.DIRTY_SCENE_GRAPH_PRIORITY){
                var rootNode = cc.director.getRunningScene();
                if(rootNode)
                    this._sortListenersOfSceneGraphPriority(listenerID, rootNode);
                else
                    locFlagMap[listenerID] = this.DIRTY_SCENE_GRAPH_PRIORITY;
            }
        }
    },

    _sortListenersOfSceneGraphPriority: function (listenerID, rootNode) {
        var listeners = this._getListeners(listenerID);
        if (!listeners)
            return;

        var sceneGraphListener = listeners.getSceneGraphPriorityListeners();
        if(!sceneGraphListener || sceneGraphListener.length === 0)
            return;

        // 重新设置优先级索引
        this._nodePriorityIndex = 0;
        this._nodePriorityMap = {};

        this._visitTarget(rootNode, true);

        // 分类后：优先级< 0, > 0
        listeners.getSceneGraphPriorityListeners().sort(this._sortEventListenersOfSceneGraphPriorityDes);
    },

    _sortEventListenersOfSceneGraphPriorityDes : function(l1, l2){
        var locNodePriorityMap = cc.eventManager._nodePriorityMap;
        if(!l1 || !l2 || !l1._getSceneGraphPriority() || !l2._getSceneGraphPriority())
            return -1;
        return locNodePriorityMap[l2._getSceneGraphPriority().__instanceId] - locNodePriorityMap[l1._getSceneGraphPriority().__instanceId];
    },

    _sortListenersOfFixedPriority: function (listenerID) {
        var listeners = this._listenersMap[listenerID];
        if (!listeners)
            return;

        var fixedListeners = listeners.getFixedPriorityListeners();
        if(!fixedListeners || fixedListeners.length === 0)
            return;
        // 分类后：优先级< 0, > 0
        fixedListeners.sort(this._sortListenersOfFixedPriorityAsc);

        // FIXME: 应该用二分搜索
        var index = 0;
        for (var len = fixedListeners.length; index < len;) {
            if (fixedListeners[index]._getFixedPriority() >= 0)
                break;
            ++index;
        }
        listeners.gt0Index = index;
    },

    _sortListenersOfFixedPriorityAsc: function (l1, l2) {
        return l1._getFixedPriority() - l2._getFixedPriority();
    },

    _onUpdateListeners: function (listenerID) {
        var listeners = this._listenersMap[listenerID];
        if (!listeners)
            return;

        var fixedPriorityListeners = listeners.getFixedPriorityListeners();
        var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();
        var i, selListener;

        if (sceneGraphPriorityListeners) {
            for (i = 0; i < sceneGraphPriorityListeners.length;) {
                selListener = sceneGraphPriorityListeners[i];
                if (!selListener._isRegistered()) {
                    cc.arrayRemoveObject(sceneGraphPriorityListeners, selListener);
                } else
                    ++i;
            }
        }

        if (fixedPriorityListeners) {
            for (i = 0; i < fixedPriorityListeners.length;) {
                selListener = fixedPriorityListeners[i];
                if (!selListener._isRegistered())
                    cc.arrayRemoveObject(fixedPriorityListeners, selListener);
                else
                    ++i;
            }
        }

        if (sceneGraphPriorityListeners && sceneGraphPriorityListeners.length === 0)
            listeners.clearSceneGraphListeners();

        if (fixedPriorityListeners && fixedPriorityListeners.length === 0)
            listeners.clearFixedListeners();
    },

    _updateListeners: function (event) {
        var locInDispatch = this._inDispatch;
        cc.assert(locInDispatch > 0, cc._LogInfos.EventManager__updateListeners);
        if (event.getType() == cc.Event.TOUCH) {
            this._onUpdateListeners(cc._EventListenerTouchOneByOne.LISTENER_ID);
            this._onUpdateListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID);
        } else
            this._onUpdateListeners(cc.__getListenerID(event));

        if(locInDispatch > 1)
            return;

        cc.assert(locInDispatch == 1, cc._LogInfos.EventManager__updateListeners_2);
        var locListenersMap = this._listenersMap, locPriorityDirtyFlagMap = this._priorityDirtyFlagMap;
        for (var selKey in locListenersMap) {
            if (locListenersMap[selKey].empty()) {
                delete locPriorityDirtyFlagMap[selKey];
                delete locListenersMap[selKey];
            }
        }

        var locToAddedListeners = this._toAddedListeners;
        if (locToAddedListeners.length !== 0) {
            for (var i = 0, len = locToAddedListeners.length; i < len; i++)
                this._forceAddEventListener(locToAddedListeners[i]);
            this._toAddedListeners.length = 0;
        }
    },

    _onTouchEventCallback: function(listener, argsObj){
        // 跳过如果监听者被移除。
        if (!listener._isRegistered)
            return false;

        var event = argsObj.event, selTouch = argsObj.selTouch;
        event._setCurrentTarget(listener._node);

        var isClaimed = false, removedIdx;
        var getCode = event.getEventCode(), eventCode = cc.EventTouch.EventCode;
        if (getCode == eventCode.BEGAN) {
            if (listener.onTouchBegan) {
                isClaimed = listener.onTouchBegan(selTouch, event);
                if (isClaimed && listener._registered)
                    listener._claimedTouches.push(selTouch);
            }
        } else if (listener._claimedTouches.length > 0
            && ((removedIdx = listener._claimedTouches.indexOf(selTouch)) != -1)) {
            isClaimed = true;
            if(getCode === eventCode.MOVED && listener.onTouchMoved){
                listener.onTouchMoved(selTouch, event);
            } else if(getCode === eventCode.ENDED){
                if (listener.onTouchEnded)
                    listener.onTouchEnded(selTouch, event);
                if (listener._registered)
                    listener._claimedTouches.splice(removedIdx, 1);
            } else if(getCode === eventCode.CANCELLED){
                if (listener.onTouchCancelled)
                    listener.onTouchCancelled(selTouch, event);
                if (listener._registered)
                    listener._claimedTouches.splice(removedIdx, 1);
            }
        }

        // 如果事件被停止，直接返回。
        if (event.isStopped()) {
            cc.eventManager._updateListeners(event);
            return true;
        }

        if (isClaimed && listener._registered && listener.swallowTouches) {
            if (argsObj.needsMutableSet)
                argsObj.touches.splice(selTouch, 1);
            return true;
        }
        return false;
    },

    _dispatchTouchEvent: function (event) {
        this._sortEventListeners(cc._EventListenerTouchOneByOne.LISTENER_ID);
        this._sortEventListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID);

        var oneByOneListeners = this._getListeners(cc._EventListenerTouchOneByOne.LISTENER_ID);
        var allAtOnceListeners = this._getListeners(cc._EventListenerTouchAllAtOnce.LISTENER_ID);

        // 如果没有任何触摸监听者，直接返回。
        if (null == oneByOneListeners && null == allAtOnceListeners)
            return;

        var originalTouches = event.getTouches(), mutableTouches = cc.copyArray(originalTouches);
        var oneByOneArgsObj = {event: event, needsMutableSet: (oneByOneListeners && allAtOnceListeners), touches: mutableTouches, selTouch: null};

        //
        // 首先处理目标处理程序
        //
        if (oneByOneListeners) {
            for (var i = 0; i < originalTouches.length; i++) {
                oneByOneArgsObj.selTouch = originalTouches[i];
                this._dispatchEventToListeners(oneByOneListeners, this._onTouchEventCallback, oneByOneArgsObj);
                if (event.isStopped())
                    return;
            }
        }

        //
        // 然后处理标准处理程序
        //
        if (allAtOnceListeners && mutableTouches.length > 0) {
            this._dispatchEventToListeners(allAtOnceListeners, this._onTouchesEventCallback, {event: event, touches: mutableTouches});
            if (event.isStopped())
                return;
        }
        this._updateListeners(event);
    },

    _onTouchesEventCallback: function (listener, callbackParams) {
        // 跳过如果监听者被移除。
        if (!listener._registered)
            return false;

        var eventCode = cc.EventTouch.EventCode, event = callbackParams.event, touches = callbackParams.touches, getCode = event.getEventCode();
        event._setCurrentTarget(listener._node);
        if(getCode == eventCode.BEGAN && listener.onTouchesBegan)
            listener.onTouchesBegan(touches, event);
        else if(getCode == eventCode.MOVED && listener.onTouchesMoved)
            listener.onTouchesMoved(touches, event);
        else if(getCode == eventCode.ENDED && listener.onTouchesEnded)
            listener.onTouchesEnded(touches, event);
        else if(getCode == eventCode.CANCELLED && listener.onTouchesCancelled)
            listener.onTouchesCancelled(touches, event);

        // 如果事件被停止，直接返回。
        if (event.isStopped()) {
            cc.eventManager._updateListeners(event);
            return true;
        }
        return false;
    },

    _associateNodeAndEventListener: function (node, listener) {
        var listeners = this._nodeListenersMap[node.__instanceId];
        if (!listeners) {
            listeners = [];
            this._nodeListenersMap[node.__instanceId] = listeners;
        }
        listeners.push(listener);
    },

    _dissociateNodeAndEventListener: function (node, listener) {
        var listeners = this._nodeListenersMap[node.__instanceId];
        if (listeners) {
            cc.arrayRemoveObject(listeners, listener);
            if (listeners.length === 0)
                delete this._nodeListenersMap[node.__instanceId];
        }
    },

    _dispatchEventToListeners: function (listeners, onEvent, eventOrArgs) {
        var shouldStopPropagation = false;
        var fixedPriorityListeners = listeners.getFixedPriorityListeners();
        var sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

        var i = 0, j, selListener;
        if (fixedPriorityListeners) {  // priority < 0
            if (fixedPriorityListeners.length !== 0) {
                for (; i < listeners.gt0Index; ++i) {
                    selListener = fixedPriorityListeners[i];
                    if (selListener.isEnabled() && !selListener._isPaused() && selListener._isRegistered() && onEvent(selListener, eventOrArgs)) {
                        shouldStopPropagation = true;
                        break;
                    }
                }
            }
        }

        if (sceneGraphPriorityListeners && !shouldStopPropagation) {    // priority == 0, scene graph priority
            for (j = 0; j < sceneGraphPriorityListeners.length; j++) {
                selListener = sceneGraphPriorityListeners[j];
                if (selListener.isEnabled() && !selListener._isPaused() && selListener._isRegistered() && onEvent(selListener, eventOrArgs)) {
                    shouldStopPropagation = true;
                    break;
                }
            }
        }

        if (fixedPriorityListeners && !shouldStopPropagation) {    // priority > 0
            for (; i < fixedPriorityListeners.length; ++i) {
                selListener = fixedPriorityListeners[i];
                if (selListener.isEnabled() && !selListener._isPaused() && selListener._isRegistered() && onEvent(selListener, eventOrArgs)) {
                    shouldStopPropagation = true;
                    break;
                }
            }
        }
    },

    _setDirty: function (listenerID, flag) {
        var locDirtyFlagMap = this._priorityDirtyFlagMap;
        if (locDirtyFlagMap[listenerID] == null)
            locDirtyFlagMap[listenerID] = flag;
        else
            locDirtyFlagMap[listenerID] = flag | locDirtyFlagMap[listenerID];
    },

    _visitTarget: function (node, isRootNode) {
        var children = node.getChildren(), i = 0;
        var childrenCount = children.length, locGlobalZOrderNodeMap = this._globalZOrderNodeMap, locNodeListenersMap = this._nodeListenersMap;

        if (childrenCount > 0) {
            var child;
            // visit children zOrder < 0
            for (; i < childrenCount; i++) {
                child = children[i];
                if (child && child.getLocalZOrder() < 0)
                    this._visitTarget(child, false);
                else
                    break;
            }

            if (locNodeListenersMap[node.__instanceId] != null) {
                if (!locGlobalZOrderNodeMap[node.getGlobalZOrder()])
                    locGlobalZOrderNodeMap[node.getGlobalZOrder()] = [];
                locGlobalZOrderNodeMap[node.getGlobalZOrder()].push(node.__instanceId);
            }

            for (; i < childrenCount; i++) {
                child = children[i];
                if (child)
                    this._visitTarget(child, false);
            }
        } else {
            if (locNodeListenersMap[node.__instanceId] != null) {
                if (!locGlobalZOrderNodeMap[node.getGlobalZOrder()])
                    locGlobalZOrderNodeMap[node.getGlobalZOrder()] = [];
                locGlobalZOrderNodeMap[node.getGlobalZOrder()].push(node.__instanceId);
            }
        }

        if (isRootNode) {
            var globalZOrders = [];
            for (var selKey in locGlobalZOrderNodeMap)
                globalZOrders.push(selKey);

            globalZOrders.sort(this._sortNumberAsc);

            var zOrdersLen = globalZOrders.length, selZOrders, j, locNodePriorityMap = this._nodePriorityMap;
            for (i = 0; i < zOrdersLen; i++) {
                selZOrders = locGlobalZOrderNodeMap[globalZOrders[i]];
                for (j = 0; j < selZOrders.length; j++)
                    locNodePriorityMap[selZOrders[j]] = ++this._nodePriorityIndex;
            }
            this._globalZOrderNodeMap = {};
        }
    },

    _sortNumberAsc : function (a, b) {
        return a - b;
    },

    /**
     * <p>
     * 为特定时间添加一个事件监听者。                                                                                                          <br/>
     * 如果参数"nodeOrPriority"是一个节点，这意味着为一个带有场景图优先级的特定事件添加一个事件监听者。               <br/> 
     * 如果参数"nodeOrPriority"是一个数字，这意味着为一个带有固定优先级的特定事件添加一个事件监听者。   <br/> 
     * </p>
     * @param {cc.EventListener|Object} listener 一个特定事件的监听者，或者一个有一些事件参数的对象。
     * @param {cc.Node|Number} nodeOrPriority 监听者的优先级是基于这个节点绘制的顺序，或者这个监听者的固定优先级。
     * @note  场景图的优先级将被固定为0. 所以监听者在矢量中的顺序为' <0, scene graph (0 priority), >0'。
     *         低优先级将先于高优先级被调用。0优先级对固定优先级时被禁止的，因为它被用语基于优先级的场景图。
     *         当添加一个固定优先级的监听者时，监听者必须是一个cc.EventListener对象，
     *         因为我们在没有监听者处理器的情况下不能移除一个固定优先级的监听者，除非调用removeAllListeners()。
     * @return {cc.EventListener} 返回监听者。为了从调度器中移除事件。
     */
    addListener: function (listener, nodeOrPriority) {
        cc.assert(listener && nodeOrPriority, cc._LogInfos.eventManager_addListener_2);
        if(!(listener instanceof cc.EventListener)){
            cc.assert(!cc.isNumber(nodeOrPriority), cc._LogInfos.eventManager_addListener_3);
            listener = cc.EventListener.create(listener);
        } else {
            if(listener._isRegistered()){
                cc.log(cc._LogInfos.eventManager_addListener_4);
                return;
            }
        }

        if (!listener.checkAvailable())
            return;

        if (cc.isNumber(nodeOrPriority)) {
            if (nodeOrPriority == 0) {
                cc.log(cc._LogInfos.eventManager_addListener);
                return;
            }

            listener._setSceneGraphPriority(null);
            listener._setFixedPriority(nodeOrPriority);
            listener._setRegistered(true);
            listener._setPaused(false);
            this._addListener(listener);
        } else {
            listener._setSceneGraphPriority(nodeOrPriority);
            listener._setFixedPriority(0);
            listener._setRegistered(true);
            this._addListener(listener);
        }

        return listener;
    },

    /**
     * 添加一个自定义事件监听者。它将用一个固定优先级1。
     * @param {string} eventName
     * @param {function} callback
     * @return {cc.EventListener} the generated event. 需要从调度器中移除事件。
     */
    addCustomListener: function (eventName, callback) {
        var listener = new cc._EventListenerCustom(eventName, callback);
        this.addListener(listener, 1);
        return listener;
    },

    /**
     * 移除一个监听者。
     * @param {cc.EventListener} listener 一个事件监听者或者一个注册了的节点目标。
     */
    removeListener: function (listener) {
        if (listener == null)
            return;

        var isFound, locListener = this._listenersMap;
        for (var selKey in locListener) {
            var listeners = locListener[selKey];
            var fixedPriorityListeners = listeners.getFixedPriorityListeners(), sceneGraphPriorityListeners = listeners.getSceneGraphPriorityListeners();

            isFound = this._removeListenerInVector(sceneGraphPriorityListeners, listener);
            if (isFound){
                // fixed #4160: Dirty flag need to be updated after listeners were removed. 污点标识需要在监听者被移除后更新。
               this._setDirty(listener._getListenerID(), this.DIRTY_SCENE_GRAPH_PRIORITY);
            }else{
                isFound = this._removeListenerInVector(fixedPriorityListeners, listener);
                if (isFound)
                    this._setDirty(listener._getListenerID(), this.DIRTY_FIXED_PRIORITY);
            }

            if (listeners.empty()) {
                delete this._priorityDirtyFlagMap[listener._getListenerID()];
                delete locListener[selKey];
            }

            if (isFound)
                break;
        }

        if (!isFound) {
            var locToAddedListeners = this._toAddedListeners;
            for (var i = 0, len = locToAddedListeners.length; i < len; i++) {
                var selListener = locToAddedListeners[i];
                if (selListener == listener) {
                    cc.arrayRemoveObject(locToAddedListeners, selListener);
                    break;
                }
            }
        }
    },

    _removeListenerInVector : function(listeners, listener){
        if (listeners == null)
            return false;

        for (var i = 0, len = listeners.length; i < len; i++) {
            var selListener = listeners[i];
            if (selListener == listener) {
                selListener._setRegistered(false);
                if (selListener._getSceneGraphPriority() != null){
                    this._dissociateNodeAndEventListener(selListener._getSceneGraphPriority(), selListener);
                    selListener._setSceneGraphPriority(null);         // NULL out the node pointer so we don't have any dangling pointers to destroyed nodes. 设置节点指针为NULL, 因此我们不会有只想已被销毁的节点的dangling指针。
                }

                if (this._inDispatch == 0)
                    cc.arrayRemoveObject(listeners, selListener);
                return true;
            }
        }
        return false;
    },

    /**
     * 移除有相同事件监听者类型的所有监听者，或者一个节点的所有监听者
     * @param {Number|cc.Node} listenerType listenerType或一个节点
     * @param {Boolean} [recursive=false]
     */
    removeListeners: function (listenerType, recursive) {
        var _t = this;
        if (listenerType instanceof cc.Node) {
            // 确定节点被立即移除。
            // 不想有任何的dangling指针和需要处理已被删除的对象的可能性。
            delete _t._nodePriorityMap[listenerType.__instanceId];
            cc.arrayRemoveObject(_t._dirtyNodes, listenerType);
            var listeners = _t._nodeListenersMap[listenerType.__instanceId], i;
            if (listeners) {
                var listenersCopy = cc.copyArray(listeners);
                for (i = 0; i < listenersCopy.length; i++)
                    _t.removeListener(listenersCopy[i]);
                listenersCopy.length = 0;
            }

            // 修正错误：确定在被加入的监听者列表里没有reference到node
            // 如果在这个列表中，我们发现任何和已销毁的节点有关的监听者，那么删除它们。
            // 在监听者被完全加入到调度起钱，捕捉节点被销毁的场景。当我们正在调度一个事件（比如触碰）时，
            // 如果一个节点注册了一个监听者而且被销毁，这个就会发生。
            var locToAddedListeners = _t._toAddedListeners;
            for (i = 0; i < locToAddedListeners.length; ) {
                var listener = locToAddedListeners[i];
                if (listener._getSceneGraphPriority() == listenerType) {
                    listener._setSceneGraphPriority(null);                      // 确定没有dangling指针指向目标节点。
                    listener._setRegistered(false);
                    locToAddedListeners.splice(i, 1);
                } else
                    ++i;
            }

            if (recursive === true) {
                var locChildren = listenerType.getChildren(), len;
                for (i = 0, len = locChildren.length; i< len; i++)
                    _t.removeListeners(locChildren[i], true);
            }
        } else {
            if (listenerType == cc.EventListener.TOUCH_ONE_BY_ONE)
                _t._removeListenersForListenerID(cc._EventListenerTouchOneByOne.LISTENER_ID);
            else if (listenerType == cc.EventListener.TOUCH_ALL_AT_ONCE)
                _t._removeListenersForListenerID(cc._EventListenerTouchAllAtOnce.LISTENER_ID);
            else if (listenerType == cc.EventListener.MOUSE)
                _t._removeListenersForListenerID(cc._EventListenerMouse.LISTENER_ID);
            else if (listenerType == cc.EventListener.ACCELERATION)
                _t._removeListenersForListenerID(cc._EventListenerAcceleration.LISTENER_ID);
            else if (listenerType == cc.EventListener.KEYBOARD)
                _t._removeListenersForListenerID(cc._EventListenerKeyboard.LISTENER_ID);
            else
                cc.log(cc._LogInfos.eventManager_removeListeners);
        }
    },

    /**
     * 移除有同样事件名字的所有自定义监听者
     * @param {string} customEventName
     */
    removeCustomListeners: function (customEventName) {
        this._removeListenersForListenerID(customEventName);
    },

    /**
     * 移除所有监听者
     */
    removeAllListeners: function () {
        var locListeners = this._listenersMap, locInternalCustomEventIDs = this._internalCustomListenerIDs;
        for (var selKey in locListeners){
            if(locInternalCustomEventIDs.indexOf(selKey) === -1)
                this._removeListenersForListenerID(selKey);
        }
    },

    /**
     * 设置监听者的有固定数值的有限制。
     * @param {cc.EventListener} listener
     * @param {Number} fixedPriority
     */
    setPriority: function (listener, fixedPriority) {
        if (listener == null)
            return;

        var locListeners = this._listenersMap;
        for (var selKey in locListeners) {
            var selListeners = locListeners[selKey];
            var fixedPriorityListeners = selListeners.getFixedPriorityListeners();
            if (fixedPriorityListeners) {
                var found = fixedPriorityListeners.indexOf(listener);
                if (found != -1) {
                    if(listener._getSceneGraphPriority() != null)
                        cc.log(cc._LogInfos.eventManager_setPriority);
                    if (listener._getFixedPriority() !== fixedPriority) {
                        listener._setFixedPriority(fixedPriority);
                        this._setDirty(listener._getListenerID(), this.DIRTY_FIXED_PRIORITY);
                    }
                    return;
                }
            }
        }
    },

    /**
     * 是否开启调度事件
     * @param {boolean} enabled
     */
    setEnabled: function (enabled) {
        this._isEnabled = enabled;
    },

    /**
     * 检测调度事件是否被开启
     * @returns {boolean}
     */
    isEnabled: function () {
        return this._isEnabled;
    },

    /**
     * 调度事件，也从事件调度列表中移除所有标志为删除的事件监听者。
     * @param {cc.Event} event
     */
    dispatchEvent: function (event) {
        if (!this._isEnabled)
            return;

        this._updateDirtyFlagForSceneGraph();
        this._inDispatch++;
        if(!event || !event.getType)
            throw "event is undefined";
        if (event.getType() == cc.Event.TOUCH) {
            this._dispatchTouchEvent(event);
            this._inDispatch--;
            return;
        }

        var listenerID = cc.__getListenerID(event);
        this._sortEventListeners(listenerID);
        var selListeners = this._listenersMap[listenerID];
        if (selListeners != null)
            this._dispatchEventToListeners(selListeners, this._onListenerCallback, event);

        this._updateListeners(event);
        this._inDispatch--;
    },

    _onListenerCallback: function(listener, event){
        event._setCurrentTarget(listener._getSceneGraphPriority());
        listener._onEvent(event);
        return event.isStopped();
    },

    /**
     * 调度一个有事件名字，有可选用户数据的自定义事件
     * @param {string} eventName
     * @param {*} optionalUserData
     */
    dispatchCustomEvent: function (eventName, optionalUserData) {
        var ev = new cc.EventCustom(eventName);
        ev.setUserData(optionalUserData);
        this.dispatchEvent(ev);
    }
};

// 事件助手
cc.EventHelper = function(){};

cc.EventHelper.prototype = {
    constructor: cc.EventHelper,

    apply: function ( object ) {
        object.addEventListener = cc.EventHelper.prototype.addEventListener;
        object.hasEventListener = cc.EventHelper.prototype.hasEventListener;
        object.removeEventListener = cc.EventHelper.prototype.removeEventListener;
        object.dispatchEvent = cc.EventHelper.prototype.dispatchEvent;
    },

    addEventListener: function ( type, listener, target ) {
        if ( this._listeners === undefined )
            this._listeners = {};

        var listeners = this._listeners;
        if ( listeners[ type ] === undefined )
            listeners[ type ] = [];

        if ( !this.hasEventListener(type, listener, target))
            listeners[ type ].push( {callback:listener, eventTarget: target} );
    },

    hasEventListener: function ( type, listener, target ) {
        if ( this._listeners === undefined )
            return false;

        var listeners = this._listeners;
        if ( listeners[ type ] !== undefined ) {
            for(var i = 0, len = listeners.length; i < len ; i++){
                var selListener = listeners[i];
                if(selListener.callback == listener && selListener.eventTarget == target)
                    return true;
            }
        }
        return false;
    },

    removeEventListener: function( type, target){
        if ( this._listeners === undefined )
            return;

        var listeners = this._listeners;
        var listenerArray = listeners[ type ];

        if ( listenerArray !== undefined ) {
            for(var i = 0; i < listenerArray.length ; ){
                var selListener = listenerArray[i];
                if(selListener.eventTarget == target)
                    listenerArray.splice( i, 1 );
                else
                    i++
            }
        }
    },

    dispatchEvent: function ( event, clearAfterDispatch ) {
        if ( this._listeners === undefined )
            return;

        if(clearAfterDispatch == null)
            clearAfterDispatch = true;
        var listeners = this._listeners;
        var listenerArray = listeners[ event];

        if ( listenerArray !== undefined ) {
            var array = [];
            var length = listenerArray.length;

            for ( var i = 0; i < length; i ++ ) {
                array[ i ] = listenerArray[ i ];
            }

            for ( i = 0; i < length; i ++ ) {
                array[ i ].callback.call( array[i].eventTarget, this );
            }

            if(clearAfterDispatch)
                listenerArray.length = 0;
        }
    }
};


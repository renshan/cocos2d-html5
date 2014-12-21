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
 * @class
 * @extends cc.Class
 * @example
 * var element = new cc.HashElement();
 */
cc.HashElement = cc.Class.extend(/** @lends cc.HashElement# */{
    actions:null,
    target:null, //ccobject
    actionIndex:0,
    currentAction:null, //CCAction
    currentActionSalvaged:false,
    paused:false,
    hh:null, //ut hash handle
    /**
     * 构造函数
     */
    ctor:function () {
        this.actions = [];
        this.target = null;
        this.actionIndex = 0;
        this.currentAction = null; //CCAction
        this.currentActionSalvaged = false;
        this.paused = false;
        this.hh = null; //ut hash handle
    }
});

/**
 * cc.ActionManager是一个管理动作的类.<br/>
 * 通常你不需要直接使用这个类，99%的情况下你可以使用CCNode的接口,
 * 该类是一个单例.                                                                
 * 但是有些情况下需要你直接使用这个cc.ActionManager这个类. <br/>       
 * 比如:<br/>
 * - 当你想在一个不同的Node上运行动作时.<br/>
 * - 当你想暂停、恢复(pause / resume)动作时<br/>
 * @class
 * @extends cc.Class
 * @example
 * var mng = new cc.ActionManager();
 */
cc.ActionManager = cc.Class.extend(/** @lends cc.ActionManager# */{
    _hashTargets:null,
    _arrayTargets:null,
    _currentTarget:null,
    _currentTargetSalvaged:false,

    _searchElementByTarget:function (arr, target) {
        for (var k = 0; k < arr.length; k++) {
            if (target == arr[k].target)
                return arr[k];
        }
        return null;
    },

    ctor:function () {
        this._hashTargets = {};
        this._arrayTargets = [];
        this._currentTarget = null;
        this._currentTargetSalvaged = false;
    },

    /** 添加一个动作以及他的目标对象
     * 如果这个目标对象已经存在，这个动作将会被添加到已存在的这个对象实例上。
     * 如果目标对象不存在，将创建一个该对象新的实例（该实例的状态将依据第三个参数paused而定，
     * 暂停与否，动作都将会被添加到这个新的实例上。
     * 如果目标实例的状态是暂停（paused参数）， 那么该动作将不会被播放                     
     * @param {cc.Action} action    动作
     * @param {cc.Node} target      目标对象
     * @param {Boolean} paused      是否暂停
     */
    addAction:function (action, target, paused) {
        if(!action)
            throw "cc.ActionManager.addAction(): action must be non-null";
        if(!target)
            throw "cc.ActionManager.addAction(): action must be non-null";

        //检查动作的目标对象实例是否已经存在
        var element = this._hashTargets[target.__instanceId];
        //如果目标对象实例不存在，那么就创建一个hashelement并把他加到mpTargets里面
        if (!element) {
            element = new cc.HashElement();
            element.paused = paused;
            element.target = target;
            this._hashTargets[target.__instanceId] = element;
            this._arrayTargets.push(element);
        }
        //创建一个数组来存放element所有动作
        this._actionAllocWithHashElement(element);

        element.actions.push(action);
        action.startWithTarget(target);
    },

    /**
     * 删除所有目标对象的所有动作
     */
    removeAllActions:function () {
        var locTargets = this._arrayTargets;
        for (var i = 0; i < locTargets.length; i++) {
            var element = locTargets[i];
            if (element)
                this.removeAllActionsFromTarget(element.target, true);
        }
    },
    /** 删除特定目标对象的所有动作. <br/>             
     *  目标对象的所有动作将会被删除
     * @param {object} target          目标对象
     * @param {boolean} forceDelete    是否强制删除
     */
    removeAllActionsFromTarget:function (target, forceDelete) {
        // explicit null handling
        if (target == null)
            return;
        var element = this._hashTargets[target.__instanceId];
        if (element) {
            if (element.actions.indexOf(element.currentAction) !== -1 && !(element.currentActionSalvaged))
                element.currentActionSalvaged = true;

            element.actions.length = 0;
            if (this._currentTarget == element && !forceDelete) {
                this._currentTargetSalvaged = true;
            } else {
                this._deleteHashElement(element);
            }
        }
    },
    /** 删除一个动作（传入动作的引用）
     * @param {cc.Action} action   动作
     */
    removeAction:function (action) {
        // explicit null handling
        if (action == null)
            return;
        var target = action.getOriginalTarget();
        var element = this._hashTargets[target.__instanceId];

        if (element) {
            for (var i = 0; i < element.actions.length; i++) {
                if (element.actions[i] == action) {
                    element.actions.splice(i, 1);
                    break;
                }
            }
        } else {
            cc.log(cc._LogInfos.ActionManager_removeAction);
        }
    },

    /** 删除一个动作（传入动作的标签tag 以及该动作的目标对象）
     * @param {Number} tag      标签
     * @param {object} target   目标对象
     */
    removeActionByTag:function (tag, target) {
        if(tag == cc.ACTION_TAG_INVALID)
            cc.log(cc._LogInfos.ActionManager_addAction);

        cc.assert(target, cc._LogInfos.ActionManager_addAction);

        var element = this._hashTargets[target.__instanceId];

        if (element) {
            var limit = element.actions.length;
            for (var i = 0; i < limit; ++i) {
                var action = element.actions[i];
                if (action && action.getTag() === tag && action.getOriginalTarget() == target) {
                    this._removeActionAtIndex(i, element);
                    break;
                }
            }
        }
    },

    /** 获取一个动作（传入动作的标签tag 以及该动作的目标对象）
     * @param {Number} tag     标签
     * @param {object} target  目标对象
     * @return {cc.Action|Null}  如果找到动作则返回该动作
     */
    getActionByTag:function (tag, target) {
        if(tag == cc.ACTION_TAG_INVALID)
            cc.log(cc._LogInfos.ActionManager_getActionByTag);

        var element = this._hashTargets[target.__instanceId];
        if (element) {
            if (element.actions != null) {
                for (var i = 0; i < element.actions.length; ++i) {
                    var action = element.actions[i];
                    if (action && action.getTag() === tag)
                        return action;
                }
            }
            cc.log(cc._LogInfos.ActionManager_getActionByTag_2, tag);
        }
        return null;
    },


    /** 返回目标对象上的正在运行的动作个数. <br/>       
     * 组合在一起的多个动作算作一个动作. <br/> 
     * 比如: <br/> 
     * - 如果正在运行一个包含7个子动作的动作序列，它会返回1. <br/>             
     * - 如果正在运行七个包含2个子动作的动作序列，它会返回7.                 
     * @param {object} target    目标对象
     * @return {Number}       动作个数
     */
    numberOfRunningActionsInTarget:function (target) {
        var element = this._hashTargets[target.__instanceId];
        if (element)
            return (element.actions) ? element.actions.length : 0;

        return 0;
    },
    /** 暂停目标对象：所有正在播放的或新添加的动作都将会被暂停
     * @param {object} target   目标对象
     */
    pauseTarget:function (target) {
        var element = this._hashTargets[target.__instanceId];
        if (element)
            element.paused = true;
    },
    /** 恢复目标对象,队列里所有的动作都将被恢复
     * @param {object} target
     */
    resumeTarget:function (target) {
        var element = this._hashTargets[target.__instanceId];
        if (element)
            element.paused = false;
    },

    /**
     * 暂停所有正在播放的动作，并返回被暂停动作的目标对象的列表
     * @return {Array}  返回被暂停动作的目标对象的列表
     */
    pauseAllRunningActions:function(){
        var idsWithActions = [];
        var locTargets = this._arrayTargets;
        for(var i = 0; i< locTargets.length; i++){
            var element = locTargets[i];
            if(element && !element.paused){
                element.paused = true;
                idsWithActions.push(element.target);
            }
        }
        return idsWithActions;
    },

    /**
     * 恢复集合里所有目标对象的动作，（这是一个很方便的方法恢复所有在pauseAllRunningActions方法中暂停的动作）
     * @param {Array} targetsToResume    要恢复的目标对象数组
     */
    resumeTargets:function(targetsToResume){
        if(!targetsToResume)
            return;

        for(var i = 0 ; i< targetsToResume.length; i++){
            if(targetsToResume[i])
                this.resumeTarget(targetsToResume[i]);
        }
    },

    /** 清理共享的动作管理器，它会释放保留的实例. <br/>          
     * 因为它在这里使用，所以它不能是静态的(static)
     */
    purgeSharedManager:function () {
        cc.director.getScheduler().unscheduleUpdateForTarget(this);
    },

    //保护类型函数
    _removeActionAtIndex:function (index, element) {
        var action = element.actions[index];

        if ((action == element.currentAction) && (!element.currentActionSalvaged))
            element.currentActionSalvaged = true;

        element.actions.splice(index, 1);

        // 更新actionIndex，比如周期或循环播放动作
        if (element.actionIndex >= index)
            element.actionIndex--;

        if (element.actions.length == 0) {
            if (this._currentTarget == element) {
                this._currentTargetSalvaged = true;
            } else {
                this._deleteHashElement(element);
            }
        }
    },

    _deleteHashElement:function (element) {
        if (element) {
            delete this._hashTargets[element.target.__instanceId];
            cc.arrayRemoveObject(this._arrayTargets, element);
            element.actions = null;
            element.target = null;
        }
    },

    _actionAllocWithHashElement:function (element) {
        // 默认情况下每个节点有四个动作
        if (element.actions == null) {
            element.actions = [];
        }
    },

    /**
     * @param {Number} dt 间隔时间（秒）
     */
    update:function (dt) {
        var locTargets = this._arrayTargets , locCurrTarget;
        for (var elt = 0; elt < locTargets.length; elt++) {
            this._currentTarget = locTargets[elt];
            locCurrTarget = this._currentTarget;
            //this._currentTargetSalvaged = false;
            if (!locCurrTarget.paused) {
                // 'actions'可变数组(CCMutableArray)在这个循环中有可能会被改变
                for (locCurrTarget.actionIndex = 0; locCurrTarget.actionIndex < locCurrTarget.actions.length;
                     locCurrTarget.actionIndex++) {
                    locCurrTarget.currentAction = locCurrTarget.actions[locCurrTarget.actionIndex];
                    if (!locCurrTarget.currentAction)
                        continue;

                    locCurrTarget.currentActionSalvaged = false;
                    //用于速度
                    locCurrTarget.currentAction.step(dt * ( locCurrTarget.currentAction._speedMethod ? locCurrTarget.currentAction._speed : 1 ) );
                    if (locCurrTarget.currentActionSalvaged) {
                        // currentAction告诉节点来移除它。我们保留(retained)该动作对象，以防止在循环过程中
                        // 动作被意外的释放掉。现在循环结束了，可以安全释放它了。
                        locCurrTarget.currentAction = null;//释放
                    } else if (locCurrTarget.currentAction.isDone()) {
                        locCurrTarget.currentAction.stop();
                        var action = locCurrTarget.currentAction;
                        // 设置currentAction为nil以防止removeAction重用它
                        locCurrTarget.currentAction = null;
                        this.removeAction(action);
                    }

                    locCurrTarget.currentAction = null;
                }
            }

            // 此时变量elt依然有效   
            // 因此它是安全的在这里讨论 (issue #490)

            // 如果没有动作在循环计划播放,那么仅删除currentTarget (issue #481) 
            if (this._currentTargetSalvaged && locCurrTarget.actions.length === 0) {
                this._deleteHashElement(locCurrTarget);
            }
        }
    }
});

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
 * 用户调度优先权的最小级别
 * @constant 常量
 * @type Number
 */
cc.PRIORITY_NON_SYSTEM = cc.PRIORITY_SYSTEM + 1;

//数据结构
/**
 * 用来更新优先级的双向链表
 * @Class
 * @name cc.ListEntry  链表中的元素
 * @param {cc.ListEntry} 向前的指针
 * @param {cc.ListEntry} 向后的指针
 * @param {cc.Class} 没有保存的对象（被hashUpdateEntry保存）
 * @param {Number}   优先级
 * @param {Boolean}  是否是暂停状态
 * @param {Boolean}  选择器将不会再被调用并且它的入口会在下次tick的时候被移除
 */
cc.ListEntry = function (prev, next, target, priority, paused, markedForDeletion) {
    this.prev = prev;
    this.next = next;
    this.target = target;
    this.priority = priority;
    this.paused = paused;
    this.markedForDeletion = markedForDeletion;
};

/**
 * 更新输入项序列
 * @Class
 * @name cc.HashUpdateEntry
 * @param {cc.ListEntry}  隶属的列表
 * @param {cc.ListEntry}  列表中的输入项
 * @param {cc.Class}      目标的哈希值
 * @param {Array} hh
 */
cc.HashUpdateEntry = function (list, entry, target, hh) {
    this.list = list;
    this.entry = entry;
    this.target = target;
    this.hh = hh;
};

//
/**
 * 定时器的哈希元素
 * @Class
 * @param {Array}  计时器
 * @param {cc.Class} 对象哈希值
 * @param {Number}   时间索引
 * @param {cc.Timer} 当前计时器
 * @param {Boolean}  当前计时器是否是恢复程序计时器
 * @param {Boolean}  是否是暂停状态
 * @param {Array} hh
 */
cc.HashTimerEntry = function (timers, target, timerIndex, currentTimer, currentTimerSalvaged, paused, hh) {
    var _t = this;
    _t.timers = timers;
    _t.target = target;
    _t.timerIndex = timerIndex;
    _t.currentTimer = currentTimer;
    _t.currentTimerSalvaged = currentTimerSalvaged;
    _t.paused = paused;
    _t.hh = hh;
};

/**
 * 轻量计时器
 * @class
 * @extends cc.Class
 */
cc.Timer = cc.Class.extend(/** @lends cc.Timer# */{
    _interval:0.0,
    _callback:null,//在_callback之前调用

    _target:null,//_callback函数的对象
    _elapsed:0.0,

    _runForever:false,
    _useDelay:false,
    _timesExecuted:0,
    _repeat:0, // 值为0的时候表示只执行一次,值为1的时候表示重复2X执行次数
    _delay:0,

    /**
     * @return {Number} 返回计时器时间间隔
     */
    getInterval : function(){return this._interval;},
    /**
     * @param {Number} 以秒为单位设定计时器间隔
     */
    setInterval : function(interval){this._interval = interval;},

    /**
     * @return {String|function} 返回回调函数
     */
    getCallback : function(){return this._callback},


    /**
     * cc.Timer的构造函数
     * 计时器构造函数
     * @param {cc.Class} 对象
     * @param {String|function} 回调选择器
     * @param {Number} [interval=0]  秒
     * @param {Number} [repeat=cc.REPEAT_FOREVER] 重复次数
     * @param {Number} [delay=0] 延时
     */
    ctor:function (target, callback, interval, repeat, delay) {
        var self = this;
        self._target = target;
        self._callback = callback;
        self._elapsed = -1;
        self._interval = interval || 0;
        self._delay = delay || 0;
        self._useDelay = self._delay > 0;
        self._repeat = (repeat == null) ? cc.REPEAT_FOREVER : repeat;
        self._runForever = (self._repeat == cc.REPEAT_FOREVER);
    },

    _doCallback:function(){
        var self = this;
        if (cc.isString(self._callback))
            self._target[self._callback](self._elapsed);
        else // if (typeof(this._callback) == "function") {
            self._callback.call(self._target, self._elapsed);
    },

    /**
     * 触发计时器
     * @param {Number} dt delta time
     */
    update:function (dt) {
        var self = this;
        if (self._elapsed == -1) {
            self._elapsed = 0;
            self._timesExecuted = 0;
        } else {
            var locTarget = self._target, locCallback = self._callback;
            self._elapsed += dt;//标准计时器用法
            if (self._runForever && !self._useDelay) {
                if (self._elapsed >= self._interval) {
                    if (locTarget && locCallback)
                        self._doCallback();
                    self._elapsed = 0;
                }
            } else {
                //高级用法
                if (self._useDelay) {
                    if (self._elapsed >= self._delay) {
                        if (locTarget && locCallback)
                            self._doCallback();

                        self._elapsed = self._elapsed - self._delay;
                        self._timesExecuted += 1;
                        self._useDelay = false;
                    }
                } else {
                    if (self._elapsed >= self._interval) {
                        if (locTarget && locCallback)
                            self._doCallback();

                        self._elapsed = 0;
                        self._timesExecuted += 1;
                    }
                }

                if (self._timesExecuted > self._repeat)
                    cc.director.getScheduler().unscheduleCallbackForTarget(locTarget, locCallback);
            }
        }
    }
});

/**
 * <p>
 *    调度程序负责出发预设的回调函数<br/>
 *    你不应该使用NSTimer，而应该使用这个类。<br/>
 *    <br/>
 *    有两种不同类型的回调函数(选择器):<br/>
 *       --更新回调函数:“更新”回调函数会在每一帧都被调用.你可以自定义优先级.<br/>
 *       --自定义回调函数:自定义回调函数会在每一帧都被调用,后者在自定义的时间间隔被调用.<br/>
 *       <br/>
 *    “自定义选择器”应该尽量避免。使用“回调函数”速度更快内存站占用更少.
 * </p>
 * @class
 * @extends cc.Class
 * @example
 * //注册schedule到scheduler
 * cc.director.getScheduler().scheduleSelector(callback, this, interval, !this._isRunning);
 */
cc.Scheduler = cc.Class.extend(/** @lends cc.Scheduler# */{
    _timeScale:1.0,

    _updates : null, //_updates[0] list of priority < 0, _updates[1] list of priority == 0, _updates[2] list of priority > 0,

    _hashForUpdates:null, //用来快速取用来暂停、删除列表元素的哈希值
    _arrayForUpdates:null,

    _hashForTimers:null, //有时间间隔的选择器使用这个变量。
    _arrayForTimes:null,

    _currentTarget:null,
    _currentTargetSalvaged:false,
    _updateHashLocked:false, //如果这个值为true,没有被调用的元素将不会从hash列表中被移除.元素仅仅会被标记为删除.

    ctor:function () {
        var self = this;
        self._timeScale = 1.0;
        self._updates = [[], [], []];

        self._hashForUpdates = {};
        self._arrayForUpdates = [];

        self._hashForTimers = {};
        self._arrayForTimers = [];

        self._currentTarget = null;
        self._currentTargetSalvaged = false;
        self._updateHashLocked = false;
    },

    //-----------------------private method----------------------
    _removeHashElement:function (element) {
        delete this._hashForTimers[element.target.__instanceId];
        cc.arrayRemoveObject(this._arrayForTimers, element);
        element.Timer = null;
        element.target = null;
        element = null;
    },

    _removeUpdateFromHash:function (entry) {
        var self = this, element = self._hashForUpdates[entry.target.__instanceId];
        if (element) {
            //列表元素
            cc.arrayRemoveObject(element.list, element.entry);

            delete self._hashForUpdates[element.target.__instanceId];
            cc.arrayRemoveObject(self._arrayForUpdates, element);
            element.entry = null;

            //哈希元素
            element.target = null;
        }
    },

    _priorityIn:function (ppList, target, priority, paused) {
        var self = this, listElement = new cc.ListEntry(null, null, target, priority, paused, false);

        //空列表
        if (!ppList) {
            ppList = [];
            ppList.push(listElement);
        } else {
            var index2Insert = ppList.length - 1;
            for(var i = 0; i <= index2Insert; i++){
                if (priority < ppList[i].priority) {
                    index2Insert = i;
                    break;
                }
            }
            ppList.splice(i, 0, listElement);
        }

        //为快速访问更新哈希元素
        var hashElement = new cc.HashUpdateEntry(ppList, listElement, target, null);
        self._arrayForUpdates.push(hashElement);
        self._hashForUpdates[target.__instanceId] = hashElement;

        return ppList;
    },

    _appendIn:function (ppList, target, paused) {
        var self = this, listElement = new cc.ListEntry(null, null, target, 0, paused, false);
        ppList.push(listElement);

        //为快速访问更新哈希数据
        var hashElement = new cc.HashUpdateEntry(ppList, listElement, target, null);
        self._arrayForUpdates.push(hashElement);
        self._hashForUpdates[target.__instanceId] = hashElement;
    },

    //-----------------------public method-------------------------
    /**
     * <p>
     *    修正所有预设回调函数的时间.<br/>
     *    你可以用这个属性来创建出“慢放”或者“快进”的效果.<br/>
     *    默认值是1.0.想要实现“慢放”的效果需要使用低于1.0的值.<br/>
     *    想要实现“快进”的效果需要使用高于1.0的值.<br/>
     *    @警告:这会影响每一个预设的选择器和action.
     * </p>
     * @param {Number} 时间刻度
     */
    setTimeScale:function (timeScale) {
        this._timeScale = timeScale;
    },

    /**
     * 返回调度程序的时间刻度
     * @return {Number}
     */
    getTimeScale:function () {
        return this._timeScale;
    },

    /**
     * 更新调度程序>(你永远都不应该调用这个方法,除非你知道自己在干什么)
     * @param {Number} dt delta time
     */
    update:function (dt) {
        var self = this;
        var locUpdates = self._updates, locArrayForTimers = self._arrayForTimers;
        var tmpEntry, elt, i, li;
        self._updateHashLocked = true;

        if (this._timeScale != 1.0) {
            dt *= this._timeScale;
        }

        for(i = 0, li = locUpdates.length; i < li && i >= 0; i++){
            var update = self._updates[i];
            for(var j = 0, lj = update.length; j < lj; j++){
                tmpEntry = update[j];
                if ((!tmpEntry.paused) && (!tmpEntry.markedForDeletion)) tmpEntry.target.update(dt);
            }
        }

        //迭代所有用户的回调函数
        for(i = 0, li = locArrayForTimers.length; i < li; i++){
            elt = locArrayForTimers[i];
            if(!elt) break;
            self._currentTarget = elt;
            self._currentTargetSalvaged = false;

            if (!elt.paused) {
                //在这个循环中的计时器列表可以该表
                for (elt.timerIndex = 0; elt.timerIndex < elt.timers.length; elt.timerIndex++) {
                    elt.currentTimer = elt.timers[elt.timerIndex];
                    elt.currentTimerSalvaged = false;

                    elt.currentTimer.update(dt);
                    elt.currentTimer = null;
                }
            }

            if ((self._currentTargetSalvaged) && (elt.timers.length == 0)){
                self._removeHashElement(elt);
                i--;
            }
        }

        for(i = 0, li = locUpdates.length; i < li; i++){
            var update = self._updates[i];
            for(var j = 0, lj = update.length; j < lj; ){
                tmpEntry = update[j];
                if(!tmpEntry) break;
                if (tmpEntry.markedForDeletion) self._removeUpdateFromHash(tmpEntry);
                else j++;
            }
        }

        self._updateHashLocked = false;
        self._currentTarget = null;
    },

    /**
     * <p>
     *   被调度的方法将会在每一个时间间隔重被调用</br>
     *   如果方法是被暂停状态,它将不会被调用,直到它的状态被设为继续.<br/>
     *   如果时间间隔的值被设为0,方法将会在每一帧被调用,但是如果这样的话,建议使用scheduleUpdateForTarget来替代这个方法.<br/>
     *   如果这个回调方法已经被设置为调度器,那么它的时间间隔只有在重新设置成为调度器时才会被更新<br/>
     *   repeat这个参数函数的行为重复repeat+1次,使用参数cc.REPEAT_FOREVER让函数持续运行.<br/>
     *   delay参数表明函数在多长时间之后被执行。<br/>
     * </p>
     * @param {cc.Class}   对象
     * @param {function}   回调函数
     * @param {Number}     时间间隔
     * @param {Number}     重复次数
     * @param {Number}     延迟时间
     * @param {Boolean}    是否暂停
     * @example
     * //为调度程序注册时间表
     * cc.director.getScheduler().scheduleCallbackForTarget(this, function, interval, repeat, delay, !this._isRunning );
     */
    scheduleCallbackForTarget:function (target, callback_fn, interval, repeat, delay, paused) {

        cc.assert(callback_fn, cc._LogInfos.Scheduler_scheduleCallbackForTarget_2);

        cc.assert(target, cc._LogInfos.Scheduler_scheduleCallbackForTarget_3);

        //默认参数
        interval = interval || 0;
        repeat = (repeat == null) ? cc.REPEAT_FOREVER : repeat;
        delay = delay || 0;
        paused = paused || false;

        var self = this, timer;
        var element = self._hashForTimers[target.__instanceId];

        if (!element) {
            //这是第一个元素么?如果是,为这个对象的所有回调函数设定暂停级别.
            element = new cc.HashTimerEntry(null, target, 0, null, null, paused, null);
            self._arrayForTimers.push(element);
            self._hashForTimers[target.__instanceId] = element;
        }

        if (element.timers == null) {
            element.timers = [];
        } else {
            for (var i = 0; i < element.timers.length; i++) {
                timer = element.timers[i];
                if (callback_fn == timer._callback) {
                    cc.log(cc._LogInfos.Scheduler_scheduleCallbackForTarget, timer.getInterval().toFixed(4), interval.toFixed(4));
                    timer._interval = interval;
                    return;
                }
            }
        }

        timer = new cc.Timer(target, callback_fn, interval, repeat, delay);
        element.timers.push(timer);
    },

    /**
     * <p>
     *    根据一个给定的优先级,调度一个给定对象的“更新”回调函数<br/>
     *    “更新”回调函数会在每一帧被调用.<br/>
     *    优先级月低,就越早被调用.
     * </p>
     * @param {cc.Class} 目标
     * @param {Number}   优先级
     * @param {Boolean}  是否是暂停
     * @example
     * //将object注册到scheduler
     * cc.director.getScheduler().scheduleUpdateForTarget(this, priority, !this._isRunning );
     */
    scheduleUpdateForTarget:function (target, priority, paused) {
        if(target === null)
            return;
        var self = this, locUpdates = self._updates;
        var hashElement = self._hashForUpdates[target.__instanceId];

        if (hashElement) {
            // TODO:检查优先级是否改变了!
            hashElement.entry.markedForDeletion = false;
            return;
        }

        //很多更新的优先级别都是0,我们对这种情况特别处理。
        // 这是一个优先级为0的更新表
        if (priority == 0) {
            self._appendIn(locUpdates[1], target, paused);
        } else if (priority < 0) {
            locUpdates[0] = self._priorityIn(locUpdates[0], target, priority, paused);
        } else {
            // priority > 0
            locUpdates[2] = self._priorityIn(locUpdates[2], target, priority, paused);
        }
    },

    /**
     * <p>
     *   将给定对象的回调函数设为非调度状态.<br/>
     *   如果你想将"update"函数设为非调度状态,使用unscheudleUpdateForTarget。
     * </p>
     * @param {cc.Class} 目标
     * @param {function} 回调函数
     * @example
     * //将一个对象的回调函数设为非调度状态
     * cc.director.getScheduler().unscheduleCallbackForTarget(function, this);
     */
    unscheduleCallbackForTarget:function (target, callback_fn) {
        //当移除一个对象的时候,明确的处理其中的nil变量
        if ((target == null) || (callback_fn == null)) {
            return;
        }

        var self = this, element = self._hashForTimers[target.__instanceId];
        if (element) {
            var timers = element.timers;
            for(var i = 0, li = timers.length; i < li; i++){
                var timer = timers[i];
                if (callback_fn == timer._callback) {
                    if ((timer == element.currentTimer) && (!element.currentTimerSalvaged)) {
                        element.currentTimerSalvaged = true;
                    }
                    timers.splice(i, 1)
                    //在tick的过程中更新tmerIndex,在actions中循环。
                    if (element.timerIndex >= i) {
                        element.timerIndex--;
                    }

                    if (timers.length == 0) {
                        if (self._currentTarget == element) {
                            self._currentTargetSalvaged = true;
                        } else {
                            self._removeHashElement(element);
                        }
                    }
                    return;
                }
            }
        }
    },

    /**
     * 将给定对象的更行回调函数设为非调度状态。
     * @param {cc.Class} 目标
     * @example
     * //将"update"函数设为非调度状态的方法
     * cc.director.getScheduler().unscheduleUpdateForTarget(this);
     */
    unscheduleUpdateForTarget:function (target) {
        if (target == null) {
            return;
        }

        var self = this, element = self._hashForUpdates[target.__instanceId];
        if (element != null) {
            if (self._updateHashLocked) {
                element.entry.markedForDeletion = true;
            } else {
                self._removeUpdateFromHash(element.entry);
            }
        }
    },

    /**
     * 将给定对象的所有回调函数设为非调度状态.也包括更新的回调函数。
     * @param {cc.Class} 目标
     */
    unscheduleAllCallbacksForTarget:function (target) {
        //explicit NULL handling
        if (target == null) {
            return;
        }

        var self = this, element = self._hashForTimers[target.__instanceId];
        if (element) {
            var timers = element.timers;
            if ((!element.currentTimerSalvaged) && (timers.indexOf(element.currentTimer) >= 0)) {
                element.currentTimerSalvaged = true;
            }
            timers.length = 0;

            if (self._currentTarget == element) {
                self._currentTargetSalvaged = true;
            } else {
                self._removeHashElement(element);
            }
        }
        //执行对象中的更新回调函数
        self.unscheduleUpdateForTarget(target);
    },

    /**
     *  <p>
     *      将所有对象的全部回调函数设置为非调度状态。<br/>
     *      你永远都不要调用这个方法,除非你知道自己在做什么。
     *  </p>
     */
    unscheduleAllCallbacks:function () {
        this.unscheduleAllCallbacksWithMinPriority(cc.Scheduler.PRIORITY_SYSTEM);
    },

    /**
     * <p>
     *    将所有对象的全部回调函数中最小优先级的设置为非调度状态.<br/>
     *    你在调用这个方法的时候一起调用kCCPriorityNonSystemMin类或者kCCPriorityNonSystemMin的父类.
     * </p>
     * @param {Number} 最小优先级
     */
    unscheduleAllCallbacksWithMinPriority:function (minPriority) {
        //自定义Selectors
        var self = this, locArrayForTimers = self._arrayForTimers, locUpdates = self._updates;
        for(var i = 0, li = locArrayForTimers.length; i < li; i++){
            //元素可以从unscheduleAllCallbacksForTarget中被移除
            self.unscheduleAllCallbacksForTarget(locArrayForTimers[i].target);
        }
        for(var i = 2; i >= 0; i--){
            if((i == 1 && minPriority > 0) || (i == 0 && minPriority >= 0)) continue;
            var updates = locUpdates[i];
            for(var j = 0, lj = updates.length; j < lj; j++){
                self.unscheduleUpdateForTarget(updates[j].target);
            }
        }
    },

    /**
     * <p>
     *  暂停所有对象的选择器.<br/>
     *  你永远都不要调用这个方法,除非你知道自己在做什么.
     * </p>
     */
    pauseAllTargets:function () {
        return this.pauseAllTargetsWithMinPriority(cc.Scheduler.PRIORITY_SYSTEM);
    },

    /**
     * 将那些运行优先级最低的对象的选择器全部暂停.<br/>
     * 你应该在调用这个方法的时候一起调用kCCPriorityNonSystemMin类或者kCCPriorityNonSystemMin的父类.
     * @param {Number} 最小优先级
     */
    pauseAllTargetsWithMinPriority:function (minPriority) {
        var idsWithSelectors = [];

        var self = this, element, locArrayForTimers = self._arrayForTimers, locUpdates = self._updates;
        //自定义Selectors
        for(var i = 0, li = locArrayForTimers.length; i < li; i++){
            element = locArrayForTimers[i];
            if (element) {
                element.paused = true;
                idsWithSelectors.push(element.target);
            }
        }
        for(var i = 0, li = locUpdates.length; i < li; i++){
            var updates = locUpdates[i];
            for(var j = 0, lj = updates.length; j < lj; j++){
                element = updates[j];
                if (element) {
                    element.paused = true;
                    idsWithSelectors.push(element.target);
                }
            }
        }
        return idsWithSelectors;
    },

    /**
     * 继续执行一个集合中对象上的选择器.<br/>
     * 这对撤销pauseAllCallbacks的调用很有用。
     * @param {Array} 继续执行的对象
     */
    resumeTargets:function (targetsToResume) {
        if (!targetsToResume)
            return;

        for (var i = 0; i < targetsToResume.length; i++) {
            this.resumeTarget(targetsToResume[i]);
        }
    },

    /**
     * <p>
     *    暂停对象<br/>
     *    在对象再次执行之前,给定的对象的预设的选择器或者是更新方法不会被计时.<br/>
     *    如果当前的对象并没有显示出来,则不做任何改变.
     * </p>
     * @param {cc.Class} 目标
     */
    pauseTarget:function (target) {

        cc.assert(target, cc._LogInfos.Scheduler_pauseTarget);

        //自定义Selectors
        var self = this, element = self._hashForTimers[target.__instanceId];
        if (element) {
            element.paused = true;
        }

        //执行对象中的更新回调函数
        var elementUpdate = self._hashForUpdates[target.__instanceId];
        if (elementUpdate) {
            elementUpdate.entry.paused = true;
        }
    },

    /**
     * 继续执行对象<br/>
     * 对象讲会被设为非暂停状态，所以所有的调度选择器和调度更新程序将会被再次激活.<br/>
     * 如果当前的对象并没有显示出来,则不做任何改变.
     * @param {cc.Class} 目标
     */
    resumeTarget:function (target) {

        cc.assert(target, cc._LogInfos.Scheduler_resumeTarget);

        //自定义selectors
        var self = this, element = self._hashForTimers[target.__instanceId];

        if (element) {
            element.paused = false;
        }

        //执行对象中的更新回调函数
        var elementUpdate = self._hashForUpdates[target.__instanceId];

        if (elementUpdate) {
            elementUpdate.entry.paused = false;
        }
    },

    /**
     * 返回对象是否是停止的状态
     * @param {cc.Class} 目标
     * @return {Boolean}
     */
    isTargetPaused:function (target) {

        cc.assert(target, cc._LogInfos.Scheduler_isTargetPaused);

        //自定义selectors
        var element = this._hashForTimers[target.__instanceId];
        if (element) {
            return element.paused;
        }
        return false;
    }
});
/**
 * 为系统预留的优先级
 * @constant 常量
 * @type Number
 */
cc.Scheduler.PRIORITY_SYSTEM = (-2147483647 - 1);

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
 * 输入法键盘信息结构
 * @param {cc.Rect} 当动作开始时打开软键盘
 * @param {cc.Rect} 当动作结束时关闭软键盘
 * @param {Number} 软键盘动作间隔
 */
cc.IMEKeyboardNotificationInfo = function (begin, end, duration) {
    this.begin = begin || cc.rect(0, 0, 0, 0);
    this.end = end || cc.rect(0, 0, 0, 0);
    this.duration = duration || 0;
};

/**
 * 输入法编辑器的委托
 * @class
 * @extends cc.Class
 */
cc.IMEDelegate = cc.Class.extend(/** @lends cc.IMEDelegate# */{
    /**
	 * 构造方法,覆盖了父类的构造方法，记得在子类ctor方法调用时要用this._super()
     */
    ctor:function () {
        cc.imeDispatcher.addDelegate(this);
    },
    /**
	 * 移除委托
     */
    removeDelegate:function () {
        cc.imeDispatcher.removeDelegate(this);
    },
    /**
	 * 打开键盘并允许输入
     * @return {Boolean}
     */
    attachWithIME:function () {
        return cc.imeDispatcher.attachDelegateWithIME(this);
    },
    /**
     * 关闭键盘并停止输入
     * @return {Boolean}
     */
    detachWithIME:function () {
        return cc.imeDispatcher.detachDelegateWithIME(this);
    },

    /**
     * 判断是否可以打开键盘并允许输入。<br/>
     * 由CCIMEDispatcher调用
     * @return {Boolean}
     */
    canAttachWithIME:function () {
        return false;
    },

    /**
     * 当关闭键盘并停止输入，这个方法会被CCIMEDispatcher调用
     */
    didAttachWithIME:function () {
    },

    /**
     * 判断是否可以阻止接收输入消息
     * @return {Boolean}
     */
    canDetachWithIME:function () {
        return false;
    },

    /**
     * 当关闭键盘并停止输入，这个方法会被CCIMEDispatcher调用
     */
    didDetachWithIME:function () {
    },

    /**
     * 有文本从输入时被CCIMEDispatcher调用
     */
    insertText:function (text, len) {
    },

    /**
     * 按退格键(backward)时被CCIMEDispatcher调用
     */
    deleteBackward:function () {
    },

    /**
     * CCIMEDispatcher调用此方法以获得已经存在的文本
     * @return {String}
     */
    getContentText:function () {
        return "";
    },

    //////////////////////////////////////////////////////////////////////////
    // keyboard show/hide notification
    //////////////////////////////////////////////////////////////////////////
    keyboardWillShow:function (info) {
    },
    keyboardDidShow:function (info) {
    },
    keyboardWillHide:function (info) {
    },
    keyboardDidHide:function (info) {
    }
});

/**
 * cc.imeDispatcher是一个用来管理输入消息分发的单例对象
 * @class
 * @name cc.imeDispatcher
 */
cc.IMEDispatcher = cc.Class.extend(/**  @lends cc.imeDispatcher# */{
    _domInputControl:null,
    impl:null,
    _currentInputString:"",
    _lastClickPosition:null,
    /**
	 * 构造方法,覆盖了父类的构造方法，记得在子类ctor方法调用时要用this._super()
     */
    ctor:function () {
        this.impl = new cc.IMEDispatcher.Impl();
        this._lastClickPosition = cc.p(0, 0);
    },

    init:function () {
        if (cc.sys.isMobile)
            return;
        this._domInputControl = cc.$("#imeDispatcherInput");
        if (!this._domInputControl) {
            this._domInputControl = cc.$new("input");
            this._domInputControl.setAttribute("type", "text");
            this._domInputControl.setAttribute("id", "imeDispatcherInput");
            this._domInputControl.resize(0.0, 0.0);
            this._domInputControl.translates(0, 0);
            this._domInputControl.style.opacity = "0";
            //this._domInputControl.style.filter = "alpha(opacity = 0)";
            this._domInputControl.style.fontSize = "1px";
            this._domInputControl.setAttribute('tabindex', 2);
            this._domInputControl.style.position = "absolute";
            this._domInputControl.style.top = 0;
            this._domInputControl.style.left = 0;
            document.body.appendChild(this._domInputControl);
        }
        var selfPointer = this;
        //add event listener
        cc._addEventListener(this._domInputControl, "input", function () {
            selfPointer._processDomInputString(selfPointer._domInputControl.value);
        }, false);
        cc._addEventListener(this._domInputControl, "keydown", function (e) {
            // ignore tab key
            if (e.keyCode === cc.KEY.tab) {
                e.stopPropagation();
                e.preventDefault();
            } else if (e.keyCode == cc.KEY.enter) {
                selfPointer.dispatchInsertText("\n", 1);
                e.stopPropagation();
                e.preventDefault();
            }
        }, false);

        if (/msie/i.test(navigator.userAgent)) {
            cc._addEventListener(this._domInputControl, "keyup", function (e) {
                if (e.keyCode == cc.KEY.backspace) {
                    selfPointer._processDomInputString(selfPointer._domInputControl.value);
                }
            }, false);
        }

        cc._addEventListener(window, 'mousedown', function (event) {
            var tx = event.pageX || 0;
            var ty = event.pageY || 0;

            selfPointer._lastClickPosition.x = tx;
            selfPointer._lastClickPosition.y = ty;
        }, false);
    },

    _processDomInputString:function (text) {
        var i, startPos;
        var len = this._currentInputString.length < text.length ? this._currentInputString.length : text.length;
        for (startPos = 0; startPos < len; startPos++) {
            if (text[startPos] !== this._currentInputString[startPos])
                break;
        }
        var delTimes = this._currentInputString.length - startPos;
        var insTimes = text.length - startPos;
        for (i = 0; i < delTimes; i++)
            this.dispatchDeleteBackward();

        for (i = 0; i < insTimes; i++)
            this.dispatchInsertText(text[startPos + i], 1);

        this._currentInputString = text;
    },

    /**
     * 分发键盘输入的文本信息
     * @param {String} text
     * @param {Number} len
     */
    dispatchInsertText:function (text, len) {
        if (!this.impl || !text || len <= 0)
            return;

        // there is no delegate attach with ime
        if (!this.impl._delegateWithIme)
            return;

        this.impl._delegateWithIme.insertText(text, len);
    },

    /**
     * 分发回退操作
     */
    dispatchDeleteBackward:function () {
        if (!this.impl) {
            return;
        }

        // there is no delegate attach with ime
        if (!this.impl._delegateWithIme)
            return;

        this.impl._delegateWithIme.deleteBackward();
    },

    /**
	 * 获取当前键盘输入内容
     * @return {String}
     */
    getContentText:function () {
        if (this.impl && this.impl._delegateWithIme) {
            var pszContentText = this.impl._delegateWithIme.getContentText();
            return (pszContentText) ? pszContentText : "";
        }
        return "";
    },

    /**
     * 分发键盘即将展示的消息
     * @param {cc.IMEKeyboardNotificationInfo} info
     */
    dispatchKeyboardWillShow:function (info) {
        if (this.impl) {
            for (var i = 0; i < this.impl._delegateList.length; i++) {
                var delegate = this.impl._delegateList[i];
                if (delegate) {
                    delegate.keyboardWillShow(info);
                }
            }
        }
    },

    /**
     * 分发键盘已经展示的消息
     * @param {cc.IMEKeyboardNotificationInfo} info
     */
    dispatchKeyboardDidShow:function (info) {
        if (this.impl) {
            for (var i = 0; i < this.impl._delegateList.length; i++) {
                var delegate = this.impl._delegateList[i];
                if (delegate)
                    delegate.keyboardDidShow(info);
            }
        }
    },

    /**
     * 分发键盘即将隐藏的消息
     * @param {cc.IMEKeyboardNotificationInfo} info
     */
    dispatchKeyboardWillHide:function (info) {
        if (this.impl) {
            for (var i = 0; i < this.impl._delegateList.length; i++) {
                var delegate = this.impl._delegateList[i];
                if (delegate) {
                    delegate.keyboardWillHide(info);
                }
            }
        }
    },

    /**
     * 分发键盘已经隐藏消息
     * @param {cc.IMEKeyboardNotificationInfo} info
     */
    dispatchKeyboardDidHide:function (info) {
        if (this.impl) {
            for (var i = 0; i < this.impl._delegateList.length; i++) {
                var delegate = this.impl._delegateList[i];
                if (delegate) {
                    delegate.keyboardDidHide(info);
                }
            }
        }
    },
	 
	/**
     * 添加委托接收IME消息
     * @param {cc.IMEDelegate} delegate
     * @example
     * //例如
     * cc.imeDispatcher.addDelegate(this);
     */
    addDelegate:function (delegate) {
        if (!delegate || !this.impl)
            return;

        if (this.impl._delegateList.indexOf(delegate) > -1) {
            // delegate already in list
            return;
        }
        this.impl._delegateList.splice(0, 0, delegate);
    },

	/**
     * 将委托附加到IME
     * @param {cc.IMEDelegate} delegate
     * @return {Boolean} 如果旧的委托可以解除，并且新的委托可以附加则返回ture，否则返回false
     * @example
     * //例如
     * var ret = cc.imeDispatcher.attachDelegateWithIME(this);
     */
    attachDelegateWithIME:function (delegate) {
        if (!this.impl || !delegate)
            return false;

        // if delegate is not in delegate list, return
        if (this.impl._delegateList.indexOf(delegate) == -1)
            return false;

        if (this.impl._delegateWithIme) {
            // if old delegate canDetachWithIME return false
            // or delegate canAttachWithIME return false,
            // do nothing.
            if (!this.impl._delegateWithIme.canDetachWithIME()
                || !delegate.canAttachWithIME())
                return false;

            // detach first
            var pOldDelegate = this.impl._delegateWithIme;
            this.impl._delegateWithIme = null;
            pOldDelegate.didDetachWithIME();

            this._focusDomInput(delegate);
            return true;
        }

        // havn't delegate attached with IME yet
        if (!delegate.canAttachWithIME())
            return false;

        this._focusDomInput(delegate);
        return true;
    },

    _focusDomInput:function (delegate) {
        if(cc.sys.isMobile){
            this.impl._delegateWithIme = delegate;
            delegate.didAttachWithIME();
            //prompt
            this._currentInputString = delegate.string || "";
            var userInput = prompt("please enter your word:", this._currentInputString);
            if(userInput != null)
                this._processDomInputString(userInput);
            this.dispatchInsertText("\n", 1);
        }else{
            this.impl._delegateWithIme = delegate;
            this._currentInputString = delegate.string || "";
            delegate.didAttachWithIME();
            this._domInputControl.focus();
            this._domInputControl.value = this._currentInputString;
            this._domInputControlTranslate();
        }
    },

    _domInputControlTranslate:function () {
        if (/msie/i.test(navigator.userAgent)) {
            this._domInputControl.style.left = this._lastClickPosition.x + "px";
            this._domInputControl.style.top = this._lastClickPosition.y + "px";
        } else {
            this._domInputControl.translates(this._lastClickPosition.x, this._lastClickPosition.y);
        }
    },

	/**
     * 从IME移除委托
     * @param {cc.IMEDelegate} delegate
     * @return {Boolean} 如果旧的委托可以关闭并且可以附加新的委托，则返回true 否则返回false
     * @example
     * //例如
     * var ret = cc.imeDispatcher.detachDelegateWithIME(this);
     */
    detachDelegateWithIME:function (delegate) {
        if (!this.impl || !delegate)
            return false;

        // if delegate is not the current delegate attached with ime, return
        if (this.impl._delegateWithIme != delegate)
            return false;

        if (!delegate.canDetachWithIME())
            return false;

        this.impl._delegateWithIme = null;
        delegate.didDetachWithIME();
        cc._canvas.focus();
        return true;
    },
	 
	/**
     * 在IME消息监听队列中，移除接收消息的委托
     * @param {cc.IMEDelegate} delegate
     * @example
     * //例如
     * cc.imeDispatcher.removeDelegate(this);
     */
    removeDelegate:function (delegate) {
        if (!this.impl || !delegate)
            return;

        // if delegate is not in delegate list, return
        if (this.impl._delegateList.indexOf(delegate) == -1)
            return;

        if (this.impl._delegateWithIme) {
            if (delegate == this.impl._delegateWithIme) {
                this.impl._delegateWithIme = null;
            }
        }
        cc.arrayRemoveObject(this.impl._delegateList, delegate);
    },

	/**
     * 处理按键事件
     * @param {Number} keyCode
     * @example
     * //例如
     * document.addEventListener("keydown", function (e) {
     *      cc.imeDispatcher.processKeycode(e.keyCode);
     * });
     */
    processKeycode:function (keyCode) {
        if (keyCode < 32) {
            if (keyCode == cc.KEY.backspace) {
                this.dispatchDeleteBackward();
            } else if (keyCode == cc.KEY.enter) {
                this.dispatchInsertText("\n", 1);
            } else if (keyCode == cc.KEY.tab) {
                //tab input
            } else if (keyCode == cc.KEY.escape) {
                //ESC input
            }
        } else if (keyCode < 255) {
            this.dispatchInsertText(String.fromCharCode(keyCode), 1);
        } else {
            //
        }
    }
});

 /**
 * 创建cc.IMEDispatcher.Imp对象<br />
 * 这是个内部类
 * @class
 * @extends cc.Class
 * @name cc.IMEDispatcher.Impl
 */
 
cc.IMEDispatcher.Impl = cc.Class.extend(/** @lends cc.IMEDispatcher.Impl# */{
    _delegateWithIme:null,
    _delegateList:null,
    /**
	 * 构造方法,覆盖了父类的构造方法，记得在子类ctor方法调用时要用this._super()
     */
    ctor:function () {
        this._delegateList = [];
    },
	
    /**
     * 查找委托
     * @param {cc.IMEDelegate} delegate
     * @return {Number|Null}
     */
    findDelegate:function (delegate) {
        for (var i = 0; i < this._delegateList.length; i++) {
            if (this._delegateList[i] == delegate)
                return i;
        }
        return null;
    }
});

// Initialize imeDispatcher singleton
cc.imeDispatcher = new cc.IMEDispatcher();

document.body ?
    cc.imeDispatcher.init() :
    cc._addEventListener(window, 'load', function () {
        cc.imeDispatcher.init();
    }, false);
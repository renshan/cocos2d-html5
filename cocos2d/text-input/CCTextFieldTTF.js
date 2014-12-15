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
 * Text field delegate - 文本块接口
 * @class
 * @extends cc.Class
 */
cc.TextFieldDelegate = cc.Class.extend(/** @lends cc.TextFieldDelegate# */{
    /**
     * If the sender doesn't want to attach with IME, return true;
     * @param {cc.TextFieldTTF} sender
     * @return {Boolean}
     */
	 
	/**
     * 如果发送者连接键盘输入, 返回成功;
     * @param {cc.TextFieldTTF} sender
     * @return {Boolean}
     */
    onTextFieldAttachWithIME:function (sender) {
        return false;
    },

    /**
     * If the sender doesn't want to detach with IME, return true; 
	 * 如果发送者不与断开键盘输入, 返回成功;
     * @param {cc.TextFieldTTF} sender
     * @return {Boolean}
     */
    onTextFieldDetachWithIME:function (sender) {
        return false;
    },

    /**
     * If the sender doesn't want to insert the text, return true;
	 * 如果发送者不插入文本, 返回成功;
     * @param {cc.TextFieldTTF} sender
     * @param {String} text
     * @param {Number} len
     * @return {Boolean}
     */
    onTextFieldInsertText:function (sender, text, len) {
        return false
    },

    /**
     * If the sender doesn't want to delete the delText, return true;
	 * 如果发送者不删除文本, 返回成功;
     * @param {cc.TextFieldTTF} sender
     * @param {String} delText
     * @param {Number} len
     * @return {Boolean}
     */
    onTextFieldDeleteBackward:function (sender, delText, len) {
        return false;
    },

    /**
     * If doesn't want draw sender as default, return true.
	 * 如果绘制默认消息, 返回成功;
     * @param {cc.TextFieldTTF} sender
     * @return {Boolean}
     */
    onDraw:function (sender) {
        return false;
    }
});

/**
 * A simple text input field with TTF font.
 * @class
 * @extends cc.LabelTTF
 *
 * @property {cc.Node}      delegate            - Delegate
 * @property {Number}       charCount           - <@readonly> Characators count
 * @property {String}       placeHolder         - Place holder for the field
 * @property {cc.Color}     colorSpaceHolder
 *
 * @param {String} placeholder
 * @param {cc.Size} dimensions
 * @param {Number} alignment
 * @param {String} fontName
 * @param {Number} fontSize
 *
 * @example
 * //example
 * // When five parameters
 * var textField = new cc.TextFieldTTF("<click here for input>", cc.size(100,50), cc.TEXT_ALIGNMENT_LEFT,"Arial", 32);
 * // When three parameters
 * var textField = new cc.TextFieldTTF("<click here for input>", "Arial", 32);
 */
 
/**
 * 一个带有ttf字体的简单文本输入框
 * @class
 * @extends cc.LabelTTF
 *
 * @property {cc.Node}      delegate            - Delegate
 * @property {Number}       charCount           - <@readonly> Characators count
 * @property {String}       placeHolder         - Place holder for the field
 * @property {cc.Color}     colorSpaceHolder
 *
 * @param {String} placeholder
 * @param {cc.Size} dimensions
 * @param {Number} alignment
 * @param {String} fontName
 * @param {Number} fontSize
 *
 * @example
 * //示例
 * // 当有五个参数
 * var textField = new cc.TextFieldTTF("<click here for input>", cc.size(100,50), cc.TEXT_ALIGNMENT_LEFT,"Arial", 32);
 * // 当有三个参数
 * var textField = new cc.TextFieldTTF("<click here for input>", "Arial", 32);
 */
cc.TextFieldTTF = cc.LabelTTF.extend(/** @lends cc.TextFieldTTF# */{
	delegate:null,
	colorSpaceHolder:null,

    _colorText: null,
    _lens:null,
    _inputText:"",
    _placeHolder:"",
    _charCount:0,
    _className:"TextFieldTTF",

    /**
     * Constructor function, override it to extend the construction behavior, remember to call "this._super()" in the extended "ctor" function. <br />
	 * 构造方法,覆盖了父类的构造方法，记得在子类ctor方法调用时要用this._super()
     * creates a cc.TextFieldTTF from a fontName, alignment, dimension and font size.
	 * 通过字体名称、对齐方式、文本框尺寸、字体大小参数创建一个 cc.TextFieldTTF 对象 
     * @param {String} placeholder
     * @param {cc.Size} dimensions
     * @param {Number} alignment
     * @param {String} fontName
     * @param {Number} fontSize
     */
    ctor:function (placeholder, dimensions, alignment, fontName, fontSize) {
        this.colorSpaceHolder = cc.color(127, 127, 127);
        this._colorText = cc.color(255,255,255, 255);
        cc.imeDispatcher.addDelegate(this);
        cc.LabelTTF.prototype.ctor.call(this);

        if(fontSize !== undefined){
            this.initWithPlaceHolder("", dimensions, alignment, fontName, fontSize);
            if(placeholder)
                this.setPlaceHolder(placeholder);
        }else if(fontName === undefined && alignment !== undefined){
            this.initWithString("", arguments[1], arguments[2]);
            if(placeholder)
                this.setPlaceHolder(placeholder);
        }
    },

    /**
     * Gets the delegate. -获得委托
     * @return {cc.Node}
     */
    getDelegate:function () {
        return this.delegate;
    },

    /**
     * Set the delegate. - 设置委托
     * @param {cc.Node} value
     */
    setDelegate:function (value) {
        this.delegate = value;
    },

    /**
     * Gets the char count. - 获得字符长度
     * @return {Number}
     */
    getCharCount:function () {
        return this._charCount;
    },

    /**
     * Returns the color of space holder.
	 * 获得动画显示字体颜色
     * @return {cc.Color}
     */
    getColorSpaceHolder:function () {
        return cc.color(this.colorSpaceHolder);
    },

    /**
     * Sets the color of space holder. - 设置动画显示字体颜色。
     * @param {cc.Color} value
     */
    setColorSpaceHolder:function (value) {
        this.colorSpaceHolder.r = value.r;
        this.colorSpaceHolder.g = value.g;
        this.colorSpaceHolder.b = value.b;
        this.colorSpaceHolder.a = cc.isUndefined(value.a) ? 255 : value.a;
    },

    /**
     * Sets the color of cc.TextFieldTTF's text. - 设置cc.TextFieldTTF文本颜色
     * @param {cc.Color} textColor
     */
    setTextColor:function(textColor){
        this._colorText.r = textColor.r;
        this._colorText.g = textColor.g;
        this._colorText.b = textColor.b;
        this._colorText.a = cc.isUndefined(textColor.a) ? 255 : textColor.a;
    },


	 
	/**
     * Initializes the cc.TextFieldTTF with a font name, alignment, dimension and font size
	 * 通过字体名称、对齐方式、文本框尺寸、字体大小参数初始化cc.TextFieldTTF 对象
     * @param {String} placeholder
     * @param {cc.Size} dimensions
     * @param {Number} alignment
     * @param {String} fontName
     * @param {Number} fontSize
     * @return {Boolean}
     * @example
     * //example -例如
     * var  textField = new cc.TextFieldTTF();
     * // When five parameters -五个参数
     * textField.initWithPlaceHolder("<click here for input>", cc.size(100,50), cc.TEXT_ALIGNMENT_LEFT,"Arial", 32);
     * // When three parameters - 三个参数
     * textField.initWithPlaceHolder("<click here for input>", "Arial", 32);
     */

    initWithPlaceHolder:function (placeholder, dimensions, alignment, fontName, fontSize) {
        switch (arguments.length) {
            case 5:
                if (placeholder)
                    this.setPlaceHolder(placeholder);
                return this.initWithString(this._placeHolder,fontName, fontSize, dimensions, alignment);
                break;
            case 3:
                if (placeholder)
                    this.setPlaceHolder(placeholder);
                return this.initWithString(this._placeHolder, arguments[1], arguments[2]);
                break;
            default:
                throw "Argument must be non-nil ";
                break;
        }
    },

    /**
     * Input text property - 设置文本
     * @param {String} text
     */
    setString:function (text) {
        text = String(text);
        this._inputText = text || "";

        // if there is no input text, display placeholder instead
        if (!this._inputText.length){
            cc.LabelTTF.prototype.setString.call(this, this._placeHolder);
            this.setColor(this.colorSpaceHolder);
        } else {
            cc.LabelTTF.prototype.setString.call(this,this._inputText);
            this.setColor(this._colorText);
        }
        if(cc._renderType === cc._RENDER_TYPE_CANVAS)
            this._updateTexture();
        this._charCount = this._inputText.length;
    },

    /**
     * Gets the string - 获得文本
     * @return {String}
     */
    getString:function () {
        return this._inputText;
    },

    /**
     * Set the place holder. <br />  - 设置默认字符。
     * display this string if string equal "". 展示空字符串
     * @param {String} text
     */
    setPlaceHolder:function (text) {
        this._placeHolder = text || "";
        if (!this._inputText.length) {
            cc.LabelTTF.prototype.setString.call(this,this._placeHolder);
            this.setColor(this.colorSpaceHolder);
        }
    },

    /**
     * Gets the place holder. <br /> - 获得默认字符
     * default display string.       - 默认展示字符
     * @return {String}
     */
    getPlaceHolder:function () {
        return this._placeHolder;
    },

    /**
     * Render function using the canvas 2d context or WebGL context, internal usage only, please do not call this function.
	 * 用canvas 2d或者WebGL渲染，仅内部使用，不要调用这个方法
     * @param {CanvasRenderingContext2D | WebGLRenderingContext} ctx The render context
     */
    draw:function (ctx) {
        //console.log("size",this._contentSize);
        var context = ctx || cc._renderContext;
        if (this.delegate && this.delegate.onDraw(this))
            return;

        cc.LabelTTF.prototype.draw.call(this, context);
    },

    /**
     * Recursive method that visit its children and draw them.
	 * 递归访问子节点并绘制
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} ctx
     */
    visit: function(ctx){
        this._super(ctx);
    },

    //////////////////////////////////////////////////////////////////////////
    // CCIMEDelegate interface
    //////////////////////////////////////////////////////////////////////////
    /**
     * Open keyboard and receive input text. 打开键盘并接受输入信息
     * @return {Boolean}
     */
    attachWithIME:function () {
        return cc.imeDispatcher.attachDelegateWithIME(this);
    },

    /**
     * End text input  and close keyboard. 关闭键盘输入信息
     * @return {Boolean}
     */
    detachWithIME:function () {
        return cc.imeDispatcher.detachDelegateWithIME(this);
    },

    /**
     * Return whether to allow attach with IME.
     * @return {Boolean}
     */
    canAttachWithIME:function () {
        return (this.delegate) ? (!this.delegate.onTextFieldAttachWithIME(this)) : true;
    },

    /**
     * When the delegate detach with IME, this method call by CCIMEDispatcher.
	 * 关闭键盘输入，方法由CCIMEDispatcher调用
     */
    didAttachWithIME:function () {
    },

    /**
     * Return whether to allow detach with IME.  - 返回是否允许关闭键盘
     * @return {Boolean}
     */
    canDetachWithIME:function () {
        return (this.delegate) ? (!this.delegate.onTextFieldDetachWithIME(this)) : true;
    },

    /**
     * When the delegate detach with IME, this method call by CCIMEDispatcher.
	 * 关闭键盘输入
     */
    didDetachWithIME:function () {
    },

    /**
     * Delete backward
	 * 处理回退事件
     */
    deleteBackward:function () {
        var strLen = this._inputText.length;
        if (strLen == 0)
            return;

        // get the delete byte number
        var deleteLen = 1;    // default, erase 1 byte

        if (this.delegate && this.delegate.onTextFieldDeleteBackward(this, this._inputText[strLen - deleteLen], deleteLen)) {
            // delegate don't want delete backward
            return;
        }

        // if delete all text, show space holder string
        if (strLen <= deleteLen) {
            this._inputText = "";
            this._charCount = 0;
            cc.LabelTTF.prototype.setString.call(this,this._placeHolder);
            this.setColor(this.colorSpaceHolder);
            return;
        }

        // set new input text
        this.string = this._inputText.substring(0, strLen - deleteLen);
    },

    /**
     *  Remove delegate
	 *  移除委托
     */
    removeDelegate:function () {
        cc.imeDispatcher.removeDelegate(this);
    },

    /**
     * Append the text. <br />  - 添加文本 
     * Input the character.     - 输入字符
     * @param {String} text
     * @param {Number} len
     */
    insertText:function (text, len) {
        var sInsert = text;

        // insert \n means input end
        var pos = sInsert.indexOf('\n');
        if (pos > -1) {
            sInsert = sInsert.substring(0, pos);
        }

        if (sInsert.length > 0) {
            if (this.delegate && this.delegate.onTextFieldInsertText(this, sInsert, sInsert.length)) {
                // delegate doesn't want insert text
                return;
            }

            var sText = this._inputText + sInsert;
            this._charCount = sText.length;
            this.string = sText;
        }

        if (pos == -1)
            return;

        // '\n' has inserted,  let delegate process first
        if (this.delegate && this.delegate.onTextFieldInsertText(this, "\n", 1))
            return;

        // if delegate hasn't process, detach with ime as default
        this.detachWithIME();
    },

    /**
     * Gets the input text. - 获得输入内容
     * @return {String}
     */
    getContentText:function () {
        return this._inputText;
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

var _p = cc.TextFieldTTF.prototype;

// Extended properties  - 继承的属性
/** @expose */
_p.charCount;
cc.defineGetterSetter(_p, "charCount", _p.getCharCount);
/** @expose */
_p.placeHolder;
cc.defineGetterSetter(_p, "placeHolder", _p.getPlaceHolder, _p.setPlaceHolder);


/**
 * Please use new TextFieldTTF instead. <br /> - 请使用new TextFieldTTF()方法代替
 * Creates a cc.TextFieldTTF from a fontName, alignment, dimension and font size. - 通过字体名称、对齐方式、文本框尺寸、字体大小参数创建cc.TextFieldTTF 对象
 * @deprecated since v3.0 Please use new TextFieldTTF instead. - 3.0版本后面请使用new TextFieldTTF()方法代替
 * @param {String} placeholder
 * @param {cc.Size} dimensions
 * @param {Number} alignment
 * @param {String} fontName
 * @param {Number} fontSize
 * @return {cc.TextFieldTTF|Null}
 */
cc.TextFieldTTF.create = function (placeholder, dimensions, alignment, fontName, fontSize) {
    return new cc.TextFieldTTF(placeholder, dimensions, alignment, fontName, fontSize);
};


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
 * <p>一个从右下角剥开卷起场景转场到场景下方模拟翻页效果的转场</p>
 * <p>因为这个转场效果会使用一个3DAction，所以强烈建议在cc.Director中通过下面方法开启深度缓冲区<br/></p>
 * <p>cc.director.setDepthBufferFormat(kDepthBuffer16);</p>
 * @class
 * @extends cc.TransitionScene
 * @param {Number} t time in seconds
 * @param {cc.Scene} scene
 * @param {Boolean} backwards
 * @example
 * var trans = new cc.TransitionPageTurn(t, scene, backwards);
 */
cc.TransitionPageTurn = cc.TransitionScene.extend(/** @lends cc.TransitionPageTurn# */{

    /**
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     * @param {Boolean} backwards
     */
    ctor:function (t, scene, backwards) {
        cc.TransitionScene.prototype.ctor.call(this);
        this._gridProxy = new cc.NodeGrid();
        this.initWithDuration(t, scene, backwards);
    },

    /**
     * @type Boolean
     */
    _back:true,
    _gridProxy: null,
    _className:"TransitionPageTurn",

    /**
     * 使用持续时间、传入的场景初始化一个基础转场.<br/>
     * 如果传人backwards参数是true，传入的转场效果会反转.<br/>
     * 传人场景从左边覆盖传出场景
     * @param {Number} t 持续时间(秒)
     * @param {cc.Scene} scene
     * @param {Boolean} backwards
     * @return {Boolean}
     */
    initWithDuration:function (t, scene, backwards) {
        // XXX: needed before [super init]
        this._back = backwards;

        if (cc.TransitionScene.prototype.initWithDuration.call(this, t, scene)) {
            // do something
        }
        return true;
    },

    /**
     * @param {cc.Size} vector
     * @return {cc.ReverseTime|cc.TransitionScene}
     */
    actionWithSize:function (vector) {
        if (this._back)
            return cc.reverseTime(cc.pageTurn3D(this._duration, vector));        // 得到PageTurn3DAction
        else
            return cc.pageTurn3D(this._duration, vector);     //得到PageTurn3DAction
    },

    /**
     * 自定义onEnter
     */
    onEnter:function () {
        cc.TransitionScene.prototype.onEnter.call(this);
        var winSize = cc.director.getWinSize();
        var x, y;
        if (winSize.width > winSize.height) {
            x = 16;
            y = 12;
        } else {
            x = 12;
            y = 16;
        }

        var action = this.actionWithSize(cc.size(x, y)), gridProxy = this._gridProxy;

        if (!this._back) {
            gridProxy.setTarget(this._outScene);
            gridProxy.onEnter();
            gridProxy.runAction( cc.sequence(action,cc.callFunc(this.finish, this),cc.stopGrid()));
        } else {
            gridProxy.setTarget(this._inScene);
            gridProxy.onEnter();
            // 防止闪烁
            this._inScene.visible = false;
            gridProxy.runAction(
                cc.sequence(action, cc.callFunc(this.finish, this), cc.stopGrid())
            );
            this._inScene.runAction(cc.show());
        }
    },

    visit: function(){
        //cc.TransitionScene.prototype.visit.call(this);
        if(this._back)
            this._outScene.visit();
        else
            this._inScene.visit();
        this._gridProxy.visit();
    },

    _sceneOrder:function () {
        this._isInSceneOnTop = this._back;
    }
});

/**
 * 使用持续时间、传入的场景创建一个基础转场.<br/>
 * 如果backwards参数为true，传入转场效果会反转 .<br/>
 * 传人场景从左边覆盖传出场景
 * @deprecated 从v3.0之后，请使用new cc.TransitionPageTurn(t, scene, backwards)替代
 * @param {Number} t 持续时间(秒)
 * @param {cc.Scene} scene
 * @param {Boolean} backwards
 * @return {cc.TransitionPageTurn}
 */
cc.TransitionPageTurn.create = function (t, scene, backwards) {
    return new cc.TransitionPageTurn(t, scene, backwards);
};

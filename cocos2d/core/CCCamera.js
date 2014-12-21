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
 * <p>
 *     CCamera可以在任何一个CCNode上使用                                                         <br/>            
 *     OpenGL的gluLookAt方法用来定位摄影机                                                       <br/>            
 *                                                                                               <br/>            
 *     如果对象被缩放、旋转、位置属性中任意一个改变,那么摄影机会被重写                           <br/>
 *                                                                                               <br/>
 *     重要:要么你使用摄影机要么你使用缩放、旋转、位置属性,你不能同时使用他们两个.               <br/> 
 *     如果你使用摄影机,世界坐标将无效                                                           <br/> 
 *                                                                                               <br/>
 *     限制:                                                                                     <br/> 
 *     - 一些节点，像CCParallaxNode、CCParticle使用世界节点坐标，当你使用摄影机移动              <br/>
 *     它们(或者它们的父类)时,它们可能不会如你所愿.                                              <br/>   
 *                                                                                               <br/>
 *     - 你将不能使用加到CCSpriteBatchNode上得批量节点（如CCSprite)                              <br/>
 *     - 我们强烈建议只有你想在创建3D效果的时候才使用摄影机，其他情况你可以使用动作CCFollow或者位置、缩放、旋转*  
 * </p>
 */
cc.Camera = cc.Class.extend({
    _eyeX:null,
    _eyeY:null,
    _eyeZ:null,

    _centerX:null,
    _centerY:null,
    _centerZ:null,

    _upX:null,
    _upY:null,
    _upZ:null,

    _dirty:null,
    _lookupMatrix:null,
    /**
     * cc.Camera构造函数
     */
    ctor:function () {
        this._lookupMatrix = new cc.kmMat4();
        this.restore();
    },

    /**
     * cc.Camera的描述
     * @return {String}
     */
    description:function () {
        return "<CCCamera | center =(" + this._centerX + "," + this._centerY + "," + this._centerZ + ")>";
    },

    /**
     * 设置dirty的值
     * @param value
     */
    setDirty:function (value) {
        this._dirty = value;
    },

    /**
     * 获得dirty的值 （boolean类型）
     * @return {Boolean}
     */
    isDirty:function () {
        return this._dirty;
    },

    /**
     * 设置摄影机的默认位置
     */
    restore:function () {
        this._eyeX = this._eyeY = 0.0;
        this._eyeZ = cc.Camera.getZEye();

        this._centerX = this._centerY = this._centerZ = 0.0;

        this._upX = 0.0;
        this._upY = 1.0;
        this._upZ = 0.0;

        cc.kmMat4Identity( this._lookupMatrix );

        this._dirty = false;
    },

    /**
     * 通过gluLookAt方法使用eye、center、up_vector 设置摄影机
     */
    locate:function () {
        if (this._dirty) {
            var eye = new cc.kmVec3(), center = new cc.kmVec3(), up = new cc.kmVec3();

            cc.kmVec3Fill( eye, this._eyeX, this._eyeY , this._eyeZ );
            cc.kmVec3Fill( center, this._centerX, this._centerY, this._centerZ);

            cc.kmVec3Fill( up, this._upX, this._upY, this._upZ);
            cc.kmMat4LookAt( this._lookupMatrix, eye, center, up);

            this._dirty = false;
        }
        cc.kmGLMultMatrix( this._lookupMatrix);
    },

    _locateForRenderer: function(matrix){
        if (this._dirty) {
            var eye = new cc.kmVec3(), center = new cc.kmVec3(), up = new cc.kmVec3();

            cc.kmVec3Fill( eye, this._eyeX, this._eyeY , this._eyeZ );
            cc.kmVec3Fill( center, this._centerX, this._centerY, this._centerZ);

            cc.kmVec3Fill( up, this._upX, this._upY, this._upZ);
            cc.kmMat4LookAt( this._lookupMatrix, eye, center, up);

            this._dirty = false;
        }
        cc.kmMat4Multiply(matrix, matrix, this._lookupMatrix);
    },

    /**
     * 设置视角点得坐标
     * @param {Number} eyeX    x值
     * @param {Number} eyeY    y值
     * @param {Number} eyeZ    z值
     * @这个方法以后会被废除，所以建议使用setEye方法
     */
    setEyeXYZ:function (eyeX, eyeY, eyeZ) {
        this.setEye(eyeX,eyeY,eyeZ);
    },

    /**
     * 设置视角点得坐标
     * @param {Number} eyeX
     * @param {Number} eyeY
     * @param {Number} eyeZ
     */
    setEye:function (eyeX, eyeY, eyeZ) {
        this._eyeX = eyeX ;
        this._eyeY = eyeY ;
        this._eyeZ = eyeZ ;

        this._dirty = true;
    },

    /**
     *设置中心坐标
     * @param {Number} centerX  中心点x值
     * @param {Number} centerY  中心点y值
     * @param {Number} centerZ  中心点z值
     * @这个方法以后会被废除，所以建议使用setCenter方法
     */
    setCenterXYZ:function (centerX, centerY, centerZ) {
        this.setCenter(centerX,centerY,centerZ);
    },
    
    /**
     * 设置中心坐标
     * @param {Number} centerX  中心点x值
     * @param {Number} centerY  中心点y值
     * @param {Number} centerZ  中心点z值
     */
    setCenter:function (centerX, centerY, centerZ) {
        this._centerX = centerX ;
        this._centerY = centerY ;
        this._centerZ = centerZ ;

        this._dirty = true;
    },

    /**
     * 设置up值
     * @param {Number} upX
     * @param {Number} upY
     * @param {Number} upZ
     * @这个方法以后会被废除
     */
    setUpXYZ:function (upX, upY, upZ) {
        this.setUp(upX, upY, upZ);
    },

    /**
     * 设置up值
     * @param {Number} upX
     * @param {Number} upY
     * @param {Number} upZ
     */
    setUp:function (upX, upY, upZ) {
        this._upX = upX;
        this._upY = upY;
        this._upZ = upZ;

        this._dirty = true;
    },

    /**
     * 获得视角向量值（在HTML5中返回一个对象如  {x:1,y:1,z:1} ）
     * @param {Number} eyeX
     * @param {Number} eyeY
     * @param {Number} eyeZ
     * @return {Object}
     * @这个方法以后会被废除,所以建议使用setEye方法
     */
    getEyeXYZ:function (eyeX, eyeY, eyeZ) {
        return {x:this._eyeX , y:this._eyeY , z: this._eyeZ };
    },

    /**
     * 获得视角向量值（在HTML5中返回一个对象如  {x:1,y:1,z:1} ）
     * @return {Object}
     */
    getEye:function () {
        return {x:this._eyeX , y:this._eyeY , z: this._eyeZ };
    },

    /**
     * 获得中心向量值（在HTML5中返回一个对象如  {x:1,y:1,z:1} ）
     * @param {Number} centerX
     * @param {Number} centerY
     * @param {Number} centerZ
     * @return {Object}
     * @这个方法以后会被废除,所以建议使用setCenter方法
     */
    getCenterXYZ:function (centerX, centerY, centerZ) {
        return {x:this._centerX ,y:this._centerY ,z:this._centerZ };
    },

    /**
     * 获得中心向量值（在HTML5中返回一个对象如  {x:1,y:1,z:1} ）
     * @return {Object}
     */
    getCenter:function () {
        return {x:this._centerX ,y:this._centerY ,z:this._centerZ };
    },

    /**
     * 获得up向量值（在HTML5中返回一个对象如  {x:1,y:1,z:1} ）
     * @param {Number} upX
     * @param {Number} upY
     * @param {Number} upZ
     * @return {Object}
     * @这个方法以后会被废除,所以建议使用setUp方法
     */
    getUpXYZ:function (upX, upY, upZ) {
        return {x:this._upX,y:this._upY,z:this._upZ};
    },

    /**
     * 获得up向量值（在HTML5中返回一个对象如  {x:1,y:1,z:1} ）
     * @return {Object}
     */
    getUp:function () {
        return {x:this._upX,y:this._upY,z:this._upZ};
    },

    _DISALLOW_COPY_AND_ASSIGN:function (CCCamera) {

    }
});

/**
 * 返回视角的Z值
 * @return {Number}
 */
cc.Camera.getZEye = function () {
    return cc.FLT_EPSILON;
};

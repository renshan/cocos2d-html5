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
 * cc.Camera动作的基类
 * @class
 * @extends cc.ActionInterval
 */
cc.ActionCamera = cc.ActionInterval.extend(/** @lends cc.ActionCamera# */{
    _centerXOrig:0,
    _centerYOrig:0,
    _centerZOrig:0,
    _eyeXOrig:0,
    _eyeYOrig:0,
    _eyeZOrig:0,
    _upXOrig:0,
    _upYOrig:0,
    _upZOrig:0,

    /**
     * 构造函数,通过重写此函数来继承构造函数行为， 在继承此函数的时候要调用"this._super()"函数
     */
    ctor:function(){
        var _t = this;
        cc.ActionInterval.prototype.ctor.call(_t);

        _t._centerXOrig=0;
        _t._centerYOrig=0;
        _t._centerZOrig=0;
        _t._eyeXOrig=0;
        _t._eyeYOrig=0;
        _t._eyeZOrig=0;
        _t._upXOrig=0;
        _t._upYOrig=0;
        _t._upZOrig=0;
    },

    /**
     * 在动作开始前调用此方法.该方法仍然会设置这个对象.
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        var _t = this;
        cc.ActionInterval.prototype.startWithTarget.call(_t, target);

        var camera = target.getCamera();
        var centerXYZ = camera.getCenter();
        _t._centerXOrig = centerXYZ.x;
        _t._centerYOrig = centerXYZ.y;
        _t._centerZOrig = centerXYZ.z;

        var eyeXYZ = camera.getEye();
        _t._eyeXOrig = eyeXYZ.x;
        _t._eyeYOrig = eyeXYZ.y;
        _t._eyeZOrig = eyeXYZ.z;

        var upXYZ = camera.getUp();
        _t._upXOrig = upXYZ.x;
        _t._upYOrig = upXYZ.y;
        _t._upZOrig = upXYZ.z;
    },

    /**
     * 深拷贝一个对象 返回一个动作的克隆
     *
     * @returns {cc.ActionCamera}
     */
    clone:function(){
       return new cc.ActionCamera();
    },

    /**
     * 返回一个逆动作<br>
     * 例如：<br>
     * - 一个X轴坐标从0移动到100的动作<br>
     * - 它的逆动作是从100移动到0
     * - 这个函数可以被重写
     */
    reverse:function () {
        return new cc.ReverseTime(this);
    }
});

/**
 * 使用圆形坐标系将相机轨道保持在屏幕中心周围
 * @param {Number} t time
 * @param {Number} radius
 * @param {Number} deltaRadius
 * @param {Number} angleZ
 * @param {Number} deltaAngleZ
 * @param {Number} angleX
 * @param {Number} deltaAngleX
 *
 * @class
 * @extends cc.ActionCamera
 */
cc.OrbitCamera = cc.ActionCamera.extend(/** @lends cc.OrbitCamera# */{
    _radius: 0.0,
    _deltaRadius: 0.0,
    _angleZ: 0.0,
    _deltaAngleZ: 0.0,
    _angleX: 0.0,
    _deltaAngleX: 0.0,
    _radZ: 0.0,
    _radDeltaZ: 0.0,
    _radX: 0.0,
    _radDeltaX: 0.0,

   /**
     * 构造函数，重写此函数以表现构造函数行为，在继承ctor函数的时候应调用"this._super()".<br>
     * 使用radius半径， delta-radius相对半径， z深度， deltaZ相对深度, x水平位置, deltaX相对水平位置创建一个 cc.OrbitCamera
	 * @param {Number} t time
	 * @param {Number} radius
	 * @param {Number} deltaRadius
	 * @param {Number} angleZ
	 * @param {Number} deltaAngleZ
	 * @param {Number} angleX
	 * @param {Number} deltaAngleX
	 */
    ctor:function(t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX){
        cc.ActionCamera.prototype.ctor.call(this);

		deltaAngleX !== undefined && this.initWithDuration(t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX);
    },

    /**
     * 使用radius, delta-radius, z, deltaZ, x, deltaX 初始化一个 cc.OrbitCamera动作
     *
     * @param {Number} t time
     * @param {Number} radius
     * @param {Number} deltaRadius
     * @param {Number} angleZ
     * @param {Number} deltaAngleZ
     * @param {Number} angleX
     * @param {Number} deltaAngleX
     * @return {Boolean}
     */
    initWithDuration:function (t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, t)) {
            var _t = this;
            _t._radius = radius;
            _t._deltaRadius = deltaRadius;
            _t._angleZ = angleZ;
            _t._deltaAngleZ = deltaAngleZ;
            _t._angleX = angleX;
            _t._deltaAngleX = deltaAngleX;

            _t._radDeltaZ = cc.degreesToRadians(deltaAngleZ);
            _t._radDeltaX = cc.degreesToRadians(deltaAngleX);
            return true;
        }
        return false;
    },

    /**
     * 相机在球面坐标的位置
     * @return {Object}
     */
    sphericalRadius:function () {
        var newRadius, zenith, azimuth;
        var camera = this.target.getCamera();
        var eyeXYZ = camera.getEye();
        var centerXYZ = camera.getCenter();

        var x = eyeXYZ.x - centerXYZ.x, y = eyeXYZ.y - centerXYZ.y, z = eyeXYZ.z - centerXYZ.z;

        var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
        var s = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        if (s === 0.0)
            s = cc.FLT_EPSILON;
        if (r === 0.0)
            r = cc.FLT_EPSILON;

        zenith = Math.acos(z / r);
        if (x < 0)
            azimuth = Math.PI - Math.asin(y / s);
        else
            azimuth = Math.asin(y / s);
        newRadius = r / cc.Camera.getZEye();
        return {newRadius:newRadius, zenith:zenith, azimuth:azimuth};
    },

    /**
     * 在动作开始前调用此方法.该方法仍然会设置这个对象.
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        var _t = this;
        cc.ActionInterval.prototype.startWithTarget.call(_t, target);
        var retValue = _t.sphericalRadius();
        if (isNaN(_t._radius))
            _t._radius = retValue.newRadius;

        if (isNaN(_t._angleZ))
            _t._angleZ = cc.radiansToDegrees(retValue.zenith);

        if (isNaN(_t._angleX))
            _t._angleX = cc.radiansToDegrees(retValue.azimuth);

        _t._radZ = cc.degreesToRadians(_t._angleZ);
        _t._radX = cc.degreesToRadians(_t._angleX);
    },

    /**
     * 深拷贝一个对象 返回一个动作的克隆
     * @returns {cc.ActionCamera}
     */
    clone:function(){
        var a = new cc.OrbitCamera(), _t = this;
        a.initWithDuration(_t._duration, _t._radius, _t._deltaRadius, _t._angleZ, _t._deltaAngleZ, _t._angleX, _t._deltaAngleX);
        return a;
    },

    /**
     * 每一帧调用一次。时间单位是每一帧持续的时间(秒)。
     * @param {Number}  dt
     */
    update:function (dt) {
        dt = this._computeEaseTime(dt);
        var r = (this._radius + this._deltaRadius * dt) * cc.Camera.getZEye();
        var za = this._radZ + this._radDeltaZ * dt;
        var xa = this._radX + this._radDeltaX * dt;

        var i = Math.sin(za) * Math.cos(xa) * r + this._centerXOrig;
        var j = Math.sin(za) * Math.sin(xa) * r + this._centerYOrig;
        var k = Math.cos(za) * r + this._centerZOrig;

        this.target.getCamera().setEye(i, j, k);
        this.target.setNodeDirty();
    }
});

/**
 * 创建一个 cc.OrbitCamera动作 使用radius, delta-radius, z, deltaZ, x, deltaX参数
 * @function
 * @param {Number} t time             
 * @param {Number} radius             
 * @param {Number} deltaRadius        
 * @param {Number} angleZ             
 * @param {Number} deltaAngleZ        
 * @param {Number} angleX             
 * @param {Number} deltaAngleX        
 * @return {cc.OrbitCamera}
 */
cc.orbitCamera = function (t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX) {
    return new cc.OrbitCamera(t, radius, deltaRadius, angleZ, deltaAngleZ, angleX, deltaAngleX);
};

/**
 * 请使用cc.orbitCamera代替此方法
 * 创建一个 cc.OrbitCamera动作 使用radius, delta-radius, z, deltaZ, x, deltaX参数
 * @param {Number} t time
 * @param {Number} radius
 * @param {Number} deltaRadius
 * @param {Number} angleZ
 * @param {Number} deltaAngleZ
 * @param {Number} angleX
 * @param {Number} deltaAngleX
 * @return {cc.OrbitCamera}
 * @static
 * 自v3.0版本以后请使用cc.orbitCamera()代替此方法
 */
cc.OrbitCamera.create = cc.orbitCamera;

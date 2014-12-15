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
 * 火焰粒子系统
 * @class
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = new cc.ParticleFire();
 */
cc.ParticleFire = cc.ParticleSystem.extend(/** @lends cc.ParticleFire# */{
    /**
     * <p>cc.ParticleFire的构造函数 <br/> 
     * 当使用new方式"var node = new cc.ParticleFire()"创建节点时，这个构造函数会被自动调用。<br/>
     * 重写该方法扩展行为时，记得在扩展的“ctor”函数里调用“this._super()”。</p>
     */
    ctor:function () {
        cc.ParticleSystem.prototype.ctor.call(this, (cc._renderType === cc._RENDER_TYPE_WEBGL) ? 300 : 150);
    },

    /**
     * 初始化一个包含指定数量粒子的火焰粒子系统
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // 持续时间
            this.setDuration(cc.ParticleSystem.DURATION_INFINITY);

            // 重力模式
            this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY);


            // 重力模式：重力
            this.setGravity(cc.p(0, 0));

            // 重力模式：径向加速度
            this.setRadialAccel(0);
            this.setRadialAccelVar(0);

            // 重力模式：粒子速度
            this.setSpeed(60);
            this.setSpeedVar(20);

            // 开始角度
            this.setAngle(90);
            this.setAngleVar(10);

            // 发射器位置
            var winSize = cc.director.getWinSize();
            this.setPosition(winSize.width / 2, 60);
            this.setPosVar(cc.p(40, 20));

            // 粒子生命周期
            this.setLife(3);
            this.setLifeVar(0.25);


            // 大小，以像素为单位
            this.setStartSize(54.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE);

            // 每秒发射数
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // 粒子颜色
            this.setStartColor(cc.color(194,64,31,255));
            this.setStartColorVar(cc.color(0,0,0,0));
            this.setEndColor(cc.color(0,0,0,255));
            this.setEndColorVar(cc.color(0,0,0,0));

            // 加色式混合
            this.setBlendAdditive(true);
            return true;
        }
        return false;
    }
});

/**
 * 创建一个火焰粒子系统
 * @deprecated since v3.0 please use new cc.ParticleFire() instead
 * @return {cc.ParticleFire}
 */
cc.ParticleFire.create = function () {
    return new cc.ParticleFire();
};

/**
 * 烟花粒子系统
 * @class
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = new cc.ParticleFireworks();
 */
cc.ParticleFireworks = cc.ParticleSystem.extend(/** @lends cc.ParticleFireworks# */{
    /**
     * <p>cc.ParticleFireworks的构造函数。 <br/>
     * 当使用new方式"var node = new cc.ParticleFireworks()"创建节点时，这个构造函数会被自动调用。<br/>
     * 重写该方法扩展行为时，记得在扩展的“ctor”函数里调用“this._super()”。</p>
     */
    ctor:function () {
        cc.ParticleSystem.prototype.ctor.call(this, (cc._renderType === cc._RENDER_TYPE_WEBGL) ? 1500 : 150);
    },

    /**
     * 初始化一个包含指定数量粒子的烟花粒子系统。
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // 持续时间
            this.setDuration(cc.ParticleSystem.DURATION_INFINITY);

            // 重力模式
            this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY);

            // 重力模式：重力
            this.setGravity(cc.p(0, -90));

            // 重力模式：径向加速度
            this.setRadialAccel(0);
            this.setRadialAccelVar(0);

            // 重力模式：粒子速度
            this.setSpeed(180);
            this.setSpeedVar(50);

            // 发射器位置
            var winSize = cc.director.getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);

            // 角度
            this.setAngle(90);
            this.setAngleVar(20);

            // 粒子生命周期
            this.setLife(3.5);
            this.setLifeVar(1);

            // 每秒发射数
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // 粒子颜色
            this.setStartColor(cc.color(128,128,128,255));
            this.setStartColorVar(cc.color(128,128,128,255));
            this.setEndColor(cc.color(26,26,26,51));
            this.setEndColorVar(cc.color(26,26,26,51));

            // 大小，以像素为单位
            this.setStartSize(8.0);
            this.setStartSizeVar(2.0);
            this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE);

            // 加色式混合
            this.setBlendAdditive(false);
            return true;
        }
        return false;
    }
});

/**
 * 创建烟花粒子系统
 * @deprecated since v3.0 please use new cc.ParticleFireworks() instead.
 * @return {cc.ParticleFireworks}
 */
cc.ParticleFireworks.create = function () {
    return new cc.ParticleFireworks();
};

/**
 * 太阳粒子系统
 * @class
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = new cc.ParticleSun();
 */
cc.ParticleSun = cc.ParticleSystem.extend(/** @lends cc.ParticleSun# */{
    /**
     * <p>cc.ParticleSun的构造函数。<br/>
     * 当使用new方式"var node = new cc.ParticleSun()"创建节点时，这个构造函数会被自动调用。<br/>
     * 重写该方法扩展行为时，记得在扩展的“ctor”函数里调用“this._super()”</p>
     */
    ctor:function () {
        cc.ParticleSystem.prototype.ctor.call(this, (cc._renderType === cc._RENDER_TYPE_WEBGL) ? 350 : 150);
    },

    /**
     * 初始化一个包含指定数量粒子的太阳粒子系统。
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // 加色式混合
            this.setBlendAdditive(true);

            // 持续时间
            this.setDuration(cc.ParticleSystem.DURATION_INFINITY);

            // 重力模式
            this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY);

            // 重力模式：重力
            this.setGravity(cc.p(0, 0));

            // 重力模式：径向加速度
            this.setRadialAccel(0);
            this.setRadialAccelVar(0);

            // 重力模式：粒子速度
            this.setSpeed(20);
            this.setSpeedVar(5);

            // 角度
            this.setAngle(90);
            this.setAngleVar(360);

            // 发射器位置
            var winSize = cc.director.getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);
            this.setPosVar(cc.p(0,0));

            // 粒子生命周期
            this.setLife(1);
            this.setLifeVar(0.5);

            // 大小，以像素为单位
            this.setStartSize(30.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE);

            // 每秒发射数
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // 粒子颜色
            this.setStartColor(cc.color(194, 64, 31, 255));
            this.setStartColorVar(cc.color(0, 0, 0, 0));
            this.setEndColor(cc.color(0, 0, 0, 255));
            this.setEndColorVar(cc.color(0, 0, 0, 0));

            return true;
        }
        return false;
    }
});

/**
 * 创建太阳粒子系统
 * @deprecated since v3.0 please use new cc.ParticleSun() instead.
 * @return {cc.ParticleSun}
 */
cc.ParticleSun.create = function () {
    return new cc.ParticleSun();
};

//! @brief 星系粒子系统
/**
 * 星系粒子系统
 * @class
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = new cc.ParticleGalaxy();
 */
cc.ParticleGalaxy = cc.ParticleSystem.extend(/** @lends cc.ParticleGalaxy# */{
    /**
     * <p>cc.ParticleGalaxy的构造函数。<br/>
     * 当使用new方式"var node = new cc.ParticleGalaxy()"创建节点时，这个构造函数会被自动调用。<br/>
     * 重写该方法扩展行为时，记得在扩展的“ctor”函数里调用“this._super()”。</p>
     */
    ctor:function () {
        cc.ParticleSystem.prototype.ctor.call(this, (cc._renderType === cc._RENDER_TYPE_WEBGL) ? 200 : 100);
    },

    /**
     * 初始化一个包含指定数量粒子的星系粒子系统
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // 持续时间
            this.setDuration(cc.ParticleSystem.DURATION_INFINITY);

            // 重力模式
            this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY);

            // 重力模式：重力
            this.setGravity(cc.p(0, 0));

            // 重力模式：粒子速度
            this.setSpeed(60);
            this.setSpeedVar(10);

            // 重力模式：径向加速度
            this.setRadialAccel(-80);
            this.setRadialAccelVar(0);

            // 重力模式：切向加速度
            this.setTangentialAccel(80);
            this.setTangentialAccelVar(0);

            // 角度
            this.setAngle(90);
            this.setAngleVar(360);

            // 发射器位置
            var winSize = cc.director.getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);
            this.setPosVar(cc.p(0,0));

            // 粒子生命周期
            this.setLife(4);
            this.setLifeVar(1);

            // 大小，以像素为单位
            this.setStartSize(37.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE);

            // 每秒发射数
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // 粒子颜色
            this.setStartColor(cc.color(31, 64, 194, 255));
            this.setStartColorVar(cc.color(0, 0, 0, 0));
            this.setEndColor(cc.color(0, 0, 0, 255));
            this.setEndColorVar(cc.color(0, 0, 0, 0));

            // 加色式混合
            this.setBlendAdditive(true);
            return true;
        }
        return false;
    }
});
/**
 * 创建星系粒子系统
 * @deprecated since v3.0 please use new cc.OarticleGalaxy() instead.
 * @return {cc.ParticleGalaxy}
 */
cc.ParticleGalaxy.create = function () {
    return new cc.ParticleGalaxy();
};

/**
 * 花粒子系统
 * @class
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = new cc.ParticleFlower();
 */
cc.ParticleFlower = cc.ParticleSystem.extend(/** @lends cc.ParticleFlower# */{
    /**
     * <p>cc.ParticleFlower的构造函数。<br/>
     * 当使用new方式"var node = new cc.ParticleFlower()"创建节点时，这个构造函数会被自动调用。<br/>
     * 重写该方法扩展行为时，记得在扩展的“ctor”函数里调用“this._super()”。</p>
     */
    ctor : function () {
        cc.ParticleSystem.prototype.ctor.call(this, (cc._renderType === cc._RENDER_TYPE_WEBGL) ? 250 : 100);
    },

    /**
     * 初始化一个包含指定数量粒子的花粒子系统
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // 持续时间
            this.setDuration(cc.ParticleSystem.DURATION_INFINITY);

            // 重力模式
            this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY);

            // 重力模式：重力
            this.setGravity(cc.p(0, 0));

            // 重力模式：粒子速度
            this.setSpeed(80);
            this.setSpeedVar(10);

            // 重力模式：径向加速度
            this.setRadialAccel(-60);
            this.setRadialAccelVar(0);

            // 重力模式：切向加速度
            this.setTangentialAccel(15);
            this.setTangentialAccelVar(0);

            // 角度
            this.setAngle(90);
            this.setAngleVar(360);

            // 发射器位置
            var winSize = cc.director.getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);
            this.setPosVar(cc.p(0,0));

            // 粒子生命周期
            this.setLife(4);
            this.setLifeVar(1);

            // 大小，以像素为单位
            this.setStartSize(30.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE);

            // 每秒发射数
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // 粒子颜色
            this.setStartColor(cc.color(128, 128, 128, 255));
            this.setStartColorVar(cc.color(128, 128, 128, 128));
            this.setEndColor(cc.color(0, 0, 0, 255));
            this.setEndColorVar(cc.color(0, 0, 0, 0));

            // 加色式混合
            this.setBlendAdditive(true);
            return true;
        }
        return false;
    }
});

/**
 * 创建花粒子系统
 * @deprecated since v3.0 please use new cc.ParticleFlower() instead.
 * @return {cc.ParticleFlower}
 */
cc.ParticleFlower.create = function () {
    return new cc.ParticleFlower();
};

//! @brief 流星粒子系统
/**
 * 流星粒子系统
 * @class
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = new cc.ParticleMeteor();
 */
cc.ParticleMeteor = cc.ParticleSystem.extend(/** @lends cc.ParticleMeteor# */{
    /**
     * <p>cc.ParticleMeteor的构造函数。<br/>
     * 当用新的构造函数"var node = new cc.ParticleMeteor()"创建节点时，这个构造函数会被自动调用。<br/>
     * 重写该方法扩展行为时，记得在扩展的“ctor”函数里调用“this._super()”。</p>
     */
    ctor:function () {
        cc.ParticleSystem.prototype.ctor.call(this, (cc._renderType === cc._RENDER_TYPE_WEBGL) ? 150 : 100);
    },

    /**
     * 初始化一个包含指定数量粒子的流星粒子系统
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // 持续时间
            this.setDuration(cc.ParticleSystem.DURATION_INFINITY);

            // 重力模式
            this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY);

            // 重力模式：重力
            this.setGravity(cc.p(-200, 200));

            // 重力模式：粒子速度
            this.setSpeed(15);
            this.setSpeedVar(5);

            // 重力模式：径向加速度
            this.setRadialAccel(0);
            this.setRadialAccelVar(0);

            // 重力模式：切向加速度
            this.setTangentialAccel(0);
            this.setTangentialAccelVar(0);

            // 角度
            this.setAngle(90);
            this.setAngleVar(360);

            // 发射器位置
            var winSize = cc.director.getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);
            this.setPosVar(cc.p(0,0));

            // 粒子生命周期
            this.setLife(2);
            this.setLifeVar(1);

            // 大小，以像素为单位
            this.setStartSize(60.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE);

            // 每秒发射数
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // 粒子颜色
            this.setStartColor(cc.color(51, 102, 179));
            this.setStartColorVar(cc.color(0, 0, 51, 26));
            this.setEndColor(cc.color(0, 0, 0, 255));
            this.setEndColorVar(cc.color(0, 0, 0, 0));

            // 加色式混合
            this.setBlendAdditive(true);
            return true;
        }
        return false;
    }
});

/**
 * 创建流星粒子系统
 * @deprecated since v3.0 please use new cc.ParticleMeteor() instead.
 * @return {cc.ParticleMeteor}
 */
cc.ParticleMeteor.create = function () {
    return new cc.ParticleMeteor();
};

/**
 * 旋涡粒子系统
 * @class
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = new cc.ParticleSpiral();
 */
cc.ParticleSpiral = cc.ParticleSystem.extend(/** @lends cc.ParticleSpiral# */{

    /**
     * <p>cc.ParticleSpiral的构造函数。<br/>
     * 当使用new方式"var node = new cc.ParticleSpiral()"创建节点时，这个构造函数会被自动调用。<br/>
     * 重写该方法扩展行为时，记得在扩展的“ctor”函数里调用“this._super()”。</p>
     */
    ctor:function() {
        cc.ParticleSystem.prototype.ctor.call(this,(cc._renderType === cc._RENDER_TYPE_WEBGL) ? 500 : 100);
    },

    /**
     * 初始化一个包含指定数量粒子的旋涡粒子系统
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // 持续时间
            this.setDuration(cc.ParticleSystem.DURATION_INFINITY);

            // 重力模式
            this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY);

            // 重力模式：重力
            this.setGravity(cc.p(0, 0));

            // 重力模式：粒子速度
            this.setSpeed(150);
            this.setSpeedVar(0);

            // 重力模式：径向加速度
            this.setRadialAccel(-380);
            this.setRadialAccelVar(0);

            // 重力模式：切向加速度
            this.setTangentialAccel(45);
            this.setTangentialAccelVar(0);

            // 角度
            this.setAngle(90);
            this.setAngleVar(0);

            // 发射器位置
            var winSize = cc.director.getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);
            this.setPosVar(cc.p(0,0));

            // 粒子生命周期
            this.setLife(12);
            this.setLifeVar(0);

            // 大小，以像素为单位
            this.setStartSize(20.0);
            this.setStartSizeVar(0.0);
            this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE);

            // 每秒发射数
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // 粒子颜色
            this.setStartColor(cc.color(128,128,128,255));
            this.setStartColorVar(cc.color(128,128,128,0));
            this.setEndColor(cc.color(128,128,128,255));
            this.setEndColorVar(cc.color(128,128,128,0));

            // 加色式混合
            this.setBlendAdditive(false);
            return true;
        }
        return false;
    }
});

/**
 * 创建旋涡粒子系统
 * @deprecated since v3.0 please use new cc.ParticleSpiral() instead.
 * @return {cc.ParticleSpiral}
 */
cc.ParticleSpiral.create = function () {
    return new cc.ParticleSpiral();
};

/**
 * 爆炸粒子系统
 * @class
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = new cc.ParticleExplosion();
 */
cc.ParticleExplosion = cc.ParticleSystem.extend(/** @lends cc.ParticleExplosion# */{
    /**
     * <p>cc.ParticleExplosion的构造函数。<br/>
     * 当使用new方式"var node = new cc.ParticleExplosion()"创建节点时，这个构造函数会被自动调用。<br/>
     * 重写该方法扩展行为时，记得在扩展的“ctor”函数里调用“this._super()”。</p>
     */
    ctor:function () {
        cc.ParticleSystem.prototype.ctor.call(this, (cc._renderType === cc._RENDER_TYPE_WEBGL) ? 700 : 300);
    },

    /**
     * 初始化一个包含指定数量粒子的爆炸粒子系统
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // 持续时间
            this.setDuration(0.1);

            this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY);

            // 重力模式：重力
            this.setGravity(cc.p(0, 0));

            // 重力模式：粒子速度
            this.setSpeed(70);
            this.setSpeedVar(40);

            // 重力模式：径向加速度
            this.setRadialAccel(0);
            this.setRadialAccelVar(0);

            // 重力模式：切向加速度
            this.setTangentialAccel(0);
            this.setTangentialAccelVar(0);

            // 角度
            this.setAngle(90);
            this.setAngleVar(360);

            // 发射器位置
            var winSize = cc.director.getWinSize();
            this.setPosition(winSize.width / 2, winSize.height / 2);
            this.setPosVar(cc.p(0,0));

            // 粒子生命周期
            this.setLife(5.0);
            this.setLifeVar(2);

            // 大小，以像素为单位
            this.setStartSize(15.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE);

            // 每秒发射数
            this.setEmissionRate(this.getTotalParticles() / this.getDuration());

            // 粒子颜色
            this.setStartColor(cc.color(179, 26, 51, 255));
            this.setStartColorVar(cc.color(128, 128, 128, 0));
            this.setEndColor(cc.color(128, 128, 128, 0));
            this.setEndColorVar(cc.color(128, 128, 128, 0));

            // 加色式混合
            this.setBlendAdditive(false);
            return true;
        }
        return false;
    }
});

/**
 * 创建爆炸粒子系统
 * @deprecated since v3.0 please use new cc.ParticleExplosion() instead.
 * @return {cc.ParticleExplosion}
 */
cc.ParticleExplosion.create = function () {
    return new cc.ParticleExplosion();
};

/**
 * 烟粒子系统
 * @class
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = new cc.ParticleSmoke();
 */
cc.ParticleSmoke = cc.ParticleSystem.extend(/** @lends cc.ParticleSmoke# */{

    /**
     * <p>cc.ParticleSmoke的构造函数。<br/>
     * 当使用new方式"var node = new cc.ParticleSmoke()"创建节点时，这个构造函数会被自动调用。<br/>
     * 重写该方法扩展行为时，记得在扩展的“ctor”函数里调用“this._super()”。</p>
     */
    ctor:function () {
        cc.ParticleSystem.prototype.ctor.call(this, (cc._renderType === cc._RENDER_TYPE_WEBGL) ? 200 : 100);
    },

    /**
     * 初始化一个包含指定数量粒子的烟粒子系统
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // 持续时间
            this.setDuration(cc.ParticleSystem.DURATION_INFINITY);

            // 发射模式：重力模式
            this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY);

            // 重力模式：重力
            this.setGravity(cc.p(0, 0));

            // 重力模式：径向加速度
            this.setRadialAccel(0);
            this.setRadialAccelVar(0);

            // 重力模式：粒子速度
            this.setSpeed(25);
            this.setSpeedVar(10);

            // 角度
            this.setAngle(90);
            this.setAngleVar(5);

            // 发射器位置
            var winSize = cc.director.getWinSize();
            this.setPosition(winSize.width / 2, 0);
            this.setPosVar(cc.p(20, 0));

            // 粒子生命周期
            this.setLife(4);
            this.setLifeVar(1);

            // 大小，以像素为单位
            this.setStartSize(60.0);
            this.setStartSizeVar(10.0);
            this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE);

            // 每秒发射数
            this.setEmissionRate(this.getTotalParticles() / this.getLife());

            // 粒子颜色
            this.setStartColor(cc.color(204, 204, 204, 255));
            this.setStartColorVar(cc.color(5, 5, 5, 0));
            this.setEndColor(cc.color(0, 0, 0, 255));
            this.setEndColorVar(cc.color(0, 0, 0, 0));

            // 加色式混合
            this.setBlendAdditive(false);
            return true;
        }
        return false;
    }
});

/**
 * 创建烟粒子系统
 * @deprecated since v3.0 please use new cc.ParticleSmoke() instead.
 * @return {cc.ParticleSmoke}
 */
cc.ParticleSmoke.create = function () {
    return new cc.ParticleSmoke();
};

/**
 * 雪粒子系统
 * @class
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = new cc.ParticleSnow();
 */
cc.ParticleSnow = cc.ParticleSystem.extend(/** @lends cc.ParticleSnow# */{

    /**
     * <p>cc.ParticleSnow的构造函数。<br/>
     * 当使用new方式"var node = new cc.ParticleSnow()"创建节点时，这个构造函数会被自动调用。<br/>
     * 重写该方法扩展行为时，记得在扩展的“ctor”函数里调用“this._super()”。</p>
     */
    ctor:function () {
        cc.ParticleSystem.prototype.ctor.call(this, (cc._renderType === cc._RENDER_TYPE_WEBGL) ? 700 : 250);
    },

    /**
     * 初始化一个包含指定数量粒子的雪粒子系统
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // 持续时间
            this.setDuration(cc.ParticleSystem.DURATION_INFINITY);

            // 设置重力模式
            this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY);

            // 重力模式：重力
            this.setGravity(cc.p(0, -1));

            // 重力模式：粒子速度
            this.setSpeed(5);
            this.setSpeedVar(1);

            // 重力模式：径向加速度
            this.setRadialAccel(0);
            this.setRadialAccelVar(1);

            // 重力模式：切向加速度
            this.setTangentialAccel(0);
            this.setTangentialAccelVar(1);

            // 发射器位置
            var winSize = cc.director.getWinSize();
            this.setPosition(winSize.width / 2, winSize.height + 10);
            this.setPosVar(cc.p(winSize.width / 2, 0));

            // 角度
            this.setAngle(-90);
            this.setAngleVar(5);

            // 粒子生命周期
            this.setLife(45);
            this.setLifeVar(15);

            // 大小，以像素为单位
            this.setStartSize(10.0);
            this.setStartSizeVar(5.0);
            this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE);

            // 每秒发射数
            this.setEmissionRate(10);

            // 粒子颜色
            this.setStartColor(cc.color(255, 255, 255, 255));
            this.setStartColorVar(cc.color(0, 0, 0, 0));
            this.setEndColor(cc.color(255, 255, 255, 0));
            this.setEndColorVar(cc.color(0, 0, 0, 0));

            // 加色式混合
            this.setBlendAdditive(false);
            return true;
        }
        return false;
    }
});

/**
 * 创建雪粒子系统
 * @deprecated since v3.0 please use new cc.ParticleSnow() instead.
 * @return {cc.ParticleSnow}
 */
cc.ParticleSnow.create = function () {
    return new cc.ParticleSnow();
};

//! @brief 雨粒子系统
/**
 * 雨粒子系统
 * @class
 * @extends cc.ParticleSystem
 *
 * @example
 * var emitter = new cc.ParticleRain();
 */
cc.ParticleRain = cc.ParticleSystem.extend(/** @lends cc.ParticleRain# */{

    /**
     * <p>cc.ParticleRain的构造函数。<br/>
     * 当使用new方式"var node = new cc.ParticleRain()"创建节点时，这个构造函数会被自动调用。<br/>
     * 重写该方法扩展行为时，记得在扩展的“ctor”函数里调用“this._super()”。</p>
     */
    ctor:function () {
        cc.ParticleSystem.prototype.ctor.call(this, (cc._renderType === cc._RENDER_TYPE_WEBGL) ? 1000 : 300);
    },

    /**
     * 初始化一个包含指定数量粒子的雨粒子系统
     * @param {Number} numberOfParticles
     * @return {Boolean}
     */
    initWithTotalParticles:function (numberOfParticles) {
        if (cc.ParticleSystem.prototype.initWithTotalParticles.call(this, numberOfParticles)) {
            // 持续时间
            this.setDuration(cc.ParticleSystem.DURATION_INFINITY);

            this.setEmitterMode(cc.ParticleSystem.MODE_GRAVITY);

            // 重力模式：重力
            this.setGravity(cc.p(10, -10));

            // 重力模式：径向加速度
            this.setRadialAccel(0);
            this.setRadialAccelVar(1);

            // 重力模式：切向加速度
            this.setTangentialAccel(0);
            this.setTangentialAccelVar(1);

            // 重力模式：粒子速度
            this.setSpeed(130);
            this.setSpeedVar(30);

            // 角度
            this.setAngle(-90);
            this.setAngleVar(5);


            // 发射器位置
            var winSize = cc.director.getWinSize();
            this.setPosition(winSize.width / 2, winSize.height);
            this.setPosVar(cc.p(winSize.width / 2, 0));

            // 粒子生命周期
            this.setLife(4.5);
            this.setLifeVar(0);

            // 大小，以像素为单位
            this.setStartSize(4.0);
            this.setStartSizeVar(2.0);
            this.setEndSize(cc.ParticleSystem.START_SIZE_EQUAL_TO_END_SIZE);

            // 每秒发射数
            this.setEmissionRate(20);

            // 粒子颜色
            this.setStartColor(cc.color(179, 204, 255, 255));
            this.setStartColorVar(cc.color(0, 0, 0, 0));
            this.setEndColor(cc.color(179, 204, 255, 128));
            this.setEndColorVar(cc.color(0, 0, 0, 0));

            // 加色式混合
            this.setBlendAdditive(false);
            return true;
        }
        return false;
    }
});

/**
 * 创建雨粒子系统
 * @deprecated since v3.0 please use cc.ParticleRain() instead.
 * @return {cc.ParticleRain}
 */
cc.ParticleRain.create = function () {
    return new cc.ParticleRain();
};

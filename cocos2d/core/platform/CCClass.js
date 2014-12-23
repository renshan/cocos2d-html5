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

var cc = cc || {};

/**
 * @namespace
 * @name ClassManager
 */
var ClassManager = {
    id : (0|(Math.random()*998)),

    instanceId : (0|(Math.random()*998)),

    compileSuper : function(func, name, id){
        //将整个函数转化成字符串
        var str = func.toString();
        //找到该函数的传入参数
        var pstart = str.indexOf('('), pend = str.indexOf(')');
        var params = str.substring(pstart+1, pend);
        params = params.trim();

        //找到该函数的主体
        var bstart = str.indexOf('{'), bend = str.lastIndexOf('}');
        var str = str.substring(bstart+1, bend);

        //现在我们拥有了该函数的整个内容，找到this._super并且替换它
        while(str.indexOf('this._super')!= -1)
        {
            var sp = str.indexOf('this._super');
            //从this._super找到第一个'('的位置
            var bp = str.indexOf('(', sp);

            //找到我们想要传递给父类的参数
            var bbp = str.indexOf(')', bp);
            var superParams = str.substring(bp+1, bbp);
            superParams = superParams.trim();
            var coma = superParams? ',':'';

            //替换this_super
            str = str.substring(0, sp)+  'ClassManager['+id+'].'+name+'.call(this'+coma+str.substring(bp+1);
        }
        return Function(params, str);
    },

    getNewID : function(){
        return this.id++;
    },

    getNewInstanceId : function(){
        return this.instanceId++;
    }
};
ClassManager.compileSuper.ClassManager = ClassManager;


/* 管理JavaScript继承框架
 * 基于John Resig的Simple JavaScript Inheritance，参考网址:http://ejohn.org/blog/simple-javascript-inheritance/
 * MIT Licensed.
 */
(function () {
    var fnTest = /\b_super\b/;
    var config = cc.game.config;
    var releaseMode = config[cc.game.CONFIG_KEY.classReleaseMode];
    if(releaseMode) {
        console.log("release Mode");
    }

    /**
     * 基类实现(does nothing)
     * @class
     */
    cc.Class = function () {
    };

    /**
     * 创建新的类继承自该类
     * @static
     * @param {object} props
     * @return {function}
     */
    cc.Class.extend = function (props) {
        var _super = this.prototype;

        // 基类实例化（仅仅实例化，没有运行init初始化）
        var prototype = Object.create(_super);

        var classId = ClassManager.getNewID();
        ClassManager[classId] = _super;

        // 将属性拷贝给新创建的prototype
        // 当用作:1)生成 Class() 2)cc.clone或许更多函数时，我们保证函数属性是不可枚举的，因此我们不需要for...in循环中用typeof === 'function'检测
        // 在Carakan中也需要将这些函数属性做缓存
        var desc = { writable: true, enumerable: false, configurable: true };

	    prototype.__instanceId = null;


        // 虚拟类的构造函数
	    function Class() {
		    this.__instanceId = ClassManager.getNewInstanceId();
            // 所有的构造实际上均在init函数中完成
		    if (this.ctor)
			    this.ctor.apply(this, arguments);
	    }

	    Class.id = classId;
	    // desc = { writable: true, enumerable: false, configurable: true,
	    //          value: XXX }; 我们再一次使它不可枚举.
        // desc = { writable: true, enumerable: false, configurable: true,value: XXX }; 
	    desc.value = classId;
	    Object.defineProperty(prototype, '__pid', desc);

        // 将我们创建好的prototype赋值给Class.prototype
	    Class.prototype = prototype;

        // 执行我们想要的构造函数
	    desc.value = Class;
	    Object.defineProperty(Class.prototype, 'constructor', desc);

	    // Copy getter/setter
	    this.__getters__ && (Class.__getters__ = cc.clone(this.__getters__));
	    this.__setters__ && (Class.__setters__ = cc.clone(this.__setters__));

        for(var idx = 0, li = arguments.length; idx < li; ++idx) {
            var prop = arguments[idx];
            for (var name in prop) {
                var isFunc = (typeof prop[name] === "function");
                var override = (typeof _super[name] === "function");
                var hasSuperCall = fnTest.test(prop[name]);

                if (releaseMode && isFunc && override && hasSuperCall) {
                    desc.value = ClassManager.compileSuper(prop[name], name, classId);
                    Object.defineProperty(prototype, name, desc);
                } else if (isFunc && override && hasSuperCall) {
                    desc.value = (function (name, fn) {
                        return function () {
                            var tmp = this._super;

                            // 增加一个虽然是同名但是在父类中的._super()方法
                            this._super = _super[name];

                            // 该方法只需暂时被绑定，所以当我们执行完成我们就删除它
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;

                            return ret;
                        };
                    })(name, prop[name]);
                    Object.defineProperty(prototype, name, desc);
                } else if (isFunc) {
                    desc.value = prop[name];
                    Object.defineProperty(prototype, name, desc);
                } else {
                    prototype[name] = prop[name];
                }

                if (isFunc) {
                    // Override registered getter/setter
                    var getter, setter, propertyName;
                    if (this.__getters__ && this.__getters__[name]) {
                        propertyName = this.__getters__[name];
                        for (var i in this.__setters__) {
                            if (this.__setters__[i] == propertyName) {
                                setter = i;
                                break;
                            }
                        }
                        cc.defineGetterSetter(prototype, propertyName, prop[name], prop[setter] ? prop[setter] : prototype[setter], name, setter);
                    }
                    if (this.__setters__ && this.__setters__[name]) {
                        propertyName = this.__setters__[name];
                        for (var i in this.__getters__) {
                            if (this.__getters__[i] == propertyName) {
                                getter = i;
                                break;
                            }
                        }
                        cc.defineGetterSetter(prototype, propertyName, prop[getter] ? prop[getter] : prototype[getter], prop[name], getter, name);
                    }
                }
            }
        }

        // 确保这个类可扩展
        Class.extend = cc.Class.extend;

        //添加实现方法
        Class.implement = function (prop) {
            for (var name in prop) {
                prototype[name] = prop[name];
            }
        };
        return Class;
    };
})();

/**
 * 常见的getter setter配置方法
 * @function
 * @param {Object}   proto      将要配置的一个类的prototype或一个对象<br/>
 * @param {String}   prop       属性名
 * @param {function} getter     该属性的Getter方法
 * @param {function} setter     该属性的Setter方法
 * @param {String}   getterName 该属性的getter方法名
 * @param {String}   setterName 该属性的setter方法名
 */
cc.defineGetterSetter = function (proto, prop, getter, setter, getterName, setterName){
    if (proto.__defineGetter__) {
        getter && proto.__defineGetter__(prop, getter);
        setter && proto.__defineSetter__(prop, setter);
    } else if (Object.defineProperty) {
        var desc = { enumerable: false, configurable: true };
        getter && (desc.get = getter);
        setter && (desc.set = setter);
        Object.defineProperty(proto, prop, desc);
    } else {
        throw new Error("browser does not support getters");
    }

    if(!getterName && !setterName) {
        // Lookup getter/setter function
        var hasGetter = (getter != null), hasSetter = (setter != undefined), props = Object.getOwnPropertyNames(proto);
        for (var i = 0; i < props.length; i++) {
            var name = props[i];

            if( (proto.__lookupGetter__ ? proto.__lookupGetter__(name)
                                        : Object.getOwnPropertyDescriptor(proto, name))
                || typeof proto[name] !== "function" )
                continue;

            var func = proto[name];
            if (hasGetter && func === getter) {
                getterName = name;
                if(!hasSetter || setterName) break;
            }
            if (hasSetter && func === setter) {
                setterName = name;
                if(!hasGetter || getterName) break;
            }
        }
    }

    // Found getter/setter
    var ctor = proto.constructor;
    if (getterName) {
        if (!ctor.__getters__) {
            ctor.__getters__ = {};
        }
        ctor.__getters__[getterName] = prop;
    }
    if (setterName) {
        if (!ctor.__setters__) {
            ctor.__setters__ = {};
        }
        ctor.__setters__[setterName] = prop;
    }
};

/**
 * 创建一个新的对象，并拷贝存在对象的所有属性给新对象
 * @function
 * @param {object|Array} obj 传入的对象
 * @return {Array|object} 返回创建好的对象
 */
cc.clone = function (obj) {
    // 如果新的对象与被复制对象拥有一样的原型链(prototype chain)那么克隆会更好（否则克隆对象肯定会有一个不同的隐藏的类).
    // 使用C1 / C2的性能虚拟机测试套件(PerformanceVirtualMachineTests suite)来看看极端条件下的影响。
    //
    // 函数Object.create(Object.getPrototypeOf(obj))不能很好的运行因为缺乏一个链接到构造函数(Carakan, V8)的原型(prototype)，
    // 因此新的对象没有隐藏的类的构造函数关联（反正不管什么原因，在V8中使用Object.create(Object.getPrototypeOf(obj)) + Object.defineProperty都比原生的要慢）
    // 因此，我们可以调用构造函数，但可能会有一个大的警告-比如在构造函数中调用this.init()方法会抛出没有参数的警告。
    // 但它也有可能是一个派生类的原型(prototype)中忘了设置“constructor”而导致的。
    // 我们忽略了这些可能性，最终的解决方案是标准化函数Object.clone(<object>)。
    var newObj = (obj.constructor) ? new obj.constructor : {};


    // 假设以上所有特性在对象初始化构造,因为不是添加新属性而是赋值现有属性(注意附加索引属性是另一个故事)，所以下列key分配不会将newObj转换为字典类型
    // 如果假设不成立，请参考devils的CCClass.js链接
    for (var key in obj) {
        var copy = obj[key];
        // Beware that typeof null == "object" !
        if (((typeof copy) == "object") && copy &&
            !(copy instanceof cc.Node) && !(copy instanceof HTMLElement)) {
            newObj[key] = cc.clone(copy);
        } else {
            newObj[key] = copy;
        }
    }
    return newObj;
};


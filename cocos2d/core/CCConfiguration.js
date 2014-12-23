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
 * cc.configuration 是一个包含一些openGL变量的单例对象
 * @class
 * @name cc.configuration
 * @example
 * var textureSize = cc.configuration.getMaxTextureSize();
 */
cc.configuration = /** @lends cc.configuration# */{
	//常量类型
	/*
	 * ERROR type
	 * @public
	 * @const
	 * @type {Number}
	 */
	ERROR:0,

	/*
	 * 字符串类型
	 * @public
	 * @const
	 * @type {Number}
	 */
	STRING:1,

	/*
	 * int类型
	 * @public
	 * @const
	 * @type {Number}
	 */
	INT:2,

	/*
	 * double类型
	 * @public
	 * @const
	 * @type {Number}
	 */
	DOUBLE:3,

	/*
	 * boolean类型
	 * @public
	 * @const
	 * @type {Number}
	 */
	BOOLEAN:4,

    _maxTextureSize:0,
    _maxModelviewStackDepth:0,
    _supportsPVRTC:false,
    _supportsNPOT:false,
    _supportsBGRA8888:false,
    _supportsDiscardFramebuffer:false,
    _supportsShareableVAO:false,
    _maxSamplesAllowed:0,
    _maxTextureUnits:0,
    _GlExtensions:"",
    _valueDict:{},

	_inited: false,

	_init:function () {
		var locValueDict = this._valueDict;
		locValueDict["cocos2d.x.version"] = cc.ENGINE_VERSION;
		locValueDict["cocos2d.x.compiled_with_profiler"] = false;
		locValueDict["cocos2d.x.compiled_with_gl_state_cache"] = cc.ENABLE_GL_STATE_CACHE;
		this._inited = true;
	},

    /**
     * OpenGL 最大纹理大小
     * @return {Number}
     */
    getMaxTextureSize:function () {
        return this._maxTextureSize;
    },

    /**
     * OpenGL最大Modelview栈深度
     * @return {Number}
     */
    getMaxModelviewStackDepth:function () {
        return this._maxModelviewStackDepth;
    },

    /**
     * 返回纹理最大单元个数
     * @return {Number}
     */
    getMaxTextureUnits:function () {
        return this._maxTextureUnits;
    },

    /**
     * GPU是否支持非2次方大小的纹理
     * OpenGL ES 2.0 已经支持iOS下的NPOT(非2次方大小)的纹理
     * @return {Boolean}
     */
    supportsNPOT:function () {
        return this._supportsNPOT;
    },

    /**
     * 是否支持PVR格式的纹理压缩
     * @return {Boolean}
     */
    supportsPVRTC: function () {
        return this._supportsPVRTC;
    },

	/**
	 * 是否支持ETC格式的纹理压缩
	 * @return {Boolean}
	 */
	supportsETC: function() {
		return false;
	},

	/**
	 * 是否支持S3TC格式的纹理压缩     
	 * @return {Boolean}
	 */
	supportsS3TC: function() {
		return false;
	},

	/**
	 * 是否支持ATITC格式的纹理压缩 
	 * @return {Boolean}
	 */
	supportsATITC: function() {
		return false;
	},

    /**
     * 是否支持BGRA8888格式的纹理压缩 
     * @return {Boolean}
     */
    supportsBGRA8888:function () {
        return this._supportsBGRA8888;
    },

    /**
     * 是否支持glDiscardFramebufferEXT
     * @return {Boolean}
     */
    supportsDiscardFramebuffer:function () {
        return this._supportsDiscardFramebuffer;
    },

    /**
     * 是否支持共享VAO
     * @return {Boolean}
     */
    supportsShareableVAO:function () {
        return this._supportsShareableVAO;
    },

    /**
     * 返回是否支持OpenGL
     * @param {String} searchName
     */
    checkForGLExtension:function (searchName) {
        return this._GlExtensions.indexOf(searchName) > -1;
    },

    /**
     * 返回指定键的值，如果没有找到该键，则返回默认值
     * @param {String} key                                          键
     * @param {String|Bool|Number|Object} [default_value=null]      默认值
     * @returns {String|Bool|Number|Object}                         键对应的值
     */
    getValue: function(key, default_value){
	    if(!this._inited)
		    this._init();
        var locValueDict = this._valueDict;
        if(locValueDict[key])
            return locValueDict[key];
        return default_value;
    },

    /**
     * 设置一个新的键值对到配置(configuration)字典中
     * @param {string} key
     * @param {String|Bool|Number|Object} value
     */
    setValue: function(key, value){
        this._valueDict[key] = value;
    },

    /**
     * 将当前配置(configuration)的内容输出到控制台
     */
    dumpInfo: function(){
         if(cc.ENABLE_GL_STATE_CACHE === 0){
             cc.log("");
             cc.log(cc._LogInfos.configuration_dumpInfo);
             cc.log("")
         }
    },

    /**
     * 收集OpenGL/GPU的信息
     */
    gatherGPUInfo: function(){
        if(cc._renderType === cc._RENDER_TYPE_CANVAS)
            return;

	    if(!this._inited)
		    this._init();
        var gl = cc._renderContext;
        var locValueDict = this._valueDict;
        locValueDict["gl.vendor"] = gl.getParameter(gl.VENDOR);
        locValueDict["gl.renderer"] = gl.getParameter(gl.RENDERER);
        locValueDict["gl.version"] = gl.getParameter(gl.VERSION);

        this._GlExtensions = "";
        var extArr = gl.getSupportedExtensions();
        for (var i = 0; i < extArr.length; i++)
            this._GlExtensions += extArr[i] + " ";

        this._maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        locValueDict["gl.max_texture_size"] = this._maxTextureSize;
        this._maxTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        locValueDict["gl.max_texture_units"] = this._maxTextureUnits;

        this._supportsPVRTC = this.checkForGLExtension("GL_IMG_texture_compression_pvrtc");
        locValueDict["gl.supports_PVRTC"] = this._supportsPVRTC;

        this._supportsNPOT = false; //true;
        locValueDict["gl.supports_NPOT"] = this._supportsNPOT;

        this._supportsBGRA8888 = this.checkForGLExtension("GL_IMG_texture_format_BGRA888");
        locValueDict["gl.supports_BGRA8888"] = this._supportsBGRA8888;

        this._supportsDiscardFramebuffer = this.checkForGLExtension("GL_EXT_discard_framebuffer");
        locValueDict["gl.supports_discard_framebuffer"] = this._supportsDiscardFramebuffer;

        this._supportsShareableVAO = this.checkForGLExtension("vertex_array_object");
        locValueDict["gl.supports_vertex_array_object"] = this._supportsShareableVAO;

        cc.checkGLErrorDebug();
    },

    /**
     * 加载一个配置文件,如果配置里已经包含这些键，
     * 那么新的键值会替换掉老的键值,如果不包含则添加新的键
     * @param {string} url
     */
    loadConfigFile: function( url){
	    if(!this._inited)
		    this._init();
        var dict = cc.loader.getRes(url);
        if(!dict) throw "Please load the resource first : " + url;
        cc.assert(dict, cc._LogInfos.configuration_loadConfigFile_2, url);

        var getDatas = dict["data"];
        if(!getDatas){
            cc.log(cc._LogInfos.configuration_loadConfigFile, url);
            return;
        }

        // 向已存在字典中的添加所有的键
        for(var selKey in getDatas)
            this._valueDict[selKey] = getDatas[selKey];
    }
};

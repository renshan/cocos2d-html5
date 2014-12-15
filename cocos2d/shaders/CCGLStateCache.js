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

cc._currentProjectionMatrix = -1;
cc._vertexAttribPosition = false;
cc._vertexAttribColor = false;
cc._vertexAttribTexCoords = false;

if (cc.ENABLE_GL_STATE_CACHE) {
    cc.MAX_ACTIVETEXTURE = 16;

    cc._currentShaderProgram = -1;
    cc._currentBoundTexture = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
    cc._blendingSource = -1;
    cc._blendingDest = -1;
    cc._GLServerState = 0;
    if(cc.TEXTURE_ATLAS_USE_VAO)
        cc._uVAO = 0;
}

// GL State Cache functions

/**
 * Invalidates the GL state cache.<br/>								- 使GL状态缓存失效
 * If CC_ENABLE_GL_STATE_CACHE it will reset the GL state cache.	- 当CC_ENABLE_GL_STATE_CACHE为真时重置GL状态缓存
 * @function
 */
cc.glInvalidateStateCache = function () {
    cc.kmGLFreeAll();
    cc._currentProjectionMatrix = -1;
    cc._vertexAttribPosition = false;
    cc._vertexAttribColor = false;
    cc._vertexAttribTexCoords = false;
    if (cc.ENABLE_GL_STATE_CACHE) {
        cc._currentShaderProgram = -1;
        for (var i = 0; i < cc.MAX_ACTIVETEXTURE; i++) {
            cc._currentBoundTexture[i] = -1;
        }
        cc._blendingSource = -1;
        cc._blendingDest = -1;
        cc._GLServerState = 0;
    }
};

/**
 * Uses the GL program in case program is different than the current one.<br/>		- 当GL程序跟当前不一致时使用新的GL程序
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glUseProgram() directly.	- 当GL状态缓存失效时立刻调用glUseProgram方法
 * @function
 * @param {WebGLProgram} program
 */
cc.glUseProgram = function (program) {
    if (program !== cc._currentShaderProgram) {
        cc._currentShaderProgram = program;
        cc._renderContext.useProgram(program);
    }
};

if(!cc.ENABLE_GL_STATE_CACHE){
    cc.glUseProgram = function (program) {
        cc._renderContext.useProgram(program);
    }
}

/**
 * Deletes the GL program. If it is the one that is being used, it invalidates it.<br/>		- 删除GL程序，如果正被使用，则使之失效
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glDeleteProgram() directly.			- 当GL状态缓存失效时立刻调用glDeleteProgram方法
 * @function
 * @param {WebGLProgram} program
 */
cc.glDeleteProgram = function (program) {
    if (cc.ENABLE_GL_STATE_CACHE) {
        if (program === cc._currentShaderProgram)
            cc._currentShaderProgram = -1;
    }
    gl.deleteProgram(program);
};

/**
 * Uses a blending function in case it not already used.<br/>								- 在没有使用blending方法时使用
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will the glBlendFunc() directly.     		- 当GL状态缓存失效时立刻调用glBlendFunc方法
 * @function
 * @param {Number} sfactor
 * @param {Number} dfactor
 */
cc.glBlendFunc = function (sfactor, dfactor) {
    if ((sfactor !== cc._blendingSource) || (dfactor !== cc._blendingDest)) {
        cc._blendingSource = sfactor;
        cc._blendingDest = dfactor;
        cc.setBlending(sfactor, dfactor);
    }
};

/**
 * @function
 * @param {Number} sfactor
 * @param {Number} dfactor
 */
cc.setBlending = function (sfactor, dfactor) {
    var ctx = cc._renderContext;
    if ((sfactor === ctx.ONE) && (dfactor === ctx.ZERO)) {
        ctx.disable(ctx.BLEND);
    } else {
        ctx.enable(ctx.BLEND);
        cc._renderContext.blendFunc(sfactor,dfactor);
        //TODO need fix for WebGL
        //ctx.blendFuncSeparate(ctx.SRC_ALPHA, dfactor, sfactor, dfactor);
    }
};

/**
 * @function
 * @param {Number} sfactor
 * @param {Number} dfactor
 */
cc.glBlendFuncForParticle = function(sfactor, dfactor) {
    if ((sfactor !== cc._blendingSource) || (dfactor !== cc._blendingDest)) {
        cc._blendingSource = sfactor;
        cc._blendingDest = dfactor;
        var ctx = cc._renderContext;
        if ((sfactor === ctx.ONE) && (dfactor === ctx.ZERO)) {
            ctx.disable(ctx.BLEND);
        } else {
            ctx.enable(ctx.BLEND);
            //TODO need fix for WebGL
            ctx.blendFuncSeparate(ctx.SRC_ALPHA, dfactor, sfactor, dfactor);
        }
    }
};

if(!cc.ENABLE_GL_STATE_CACHE){
    cc.glBlendFunc = cc.setBlending;
};

/**
 * Resets the blending mode back to the cached state in case you used glBlendFuncSeparate() or glBlendEquation().<br/>	- 当调用glBlendFuncSeparate或者glBlendEquation时重置图层混合模式为缓存的状态
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will just set the default blending mode using GL_FUNC_ADD.				- 在CC_ENABLE_GL_STATE_CACHE失效时,则重置图层混合模式为GL_FUNC_ADD
 * @function
 */
cc.glBlendResetToCache = function () {
    var ctx = cc._renderContext;
    ctx.blendEquation(ctx.FUNC_ADD);
    if (cc.ENABLE_GL_STATE_CACHE)
        cc.setBlending(cc._blendingSource, cc._blendingDest);
    else
        cc.setBlending(ctx.BLEND_SRC, ctx.BLEND_DST);
};

/**
 * sets the projection matrix as dirty	- 设置投影矩阵为dirty
 * @function
 */
cc.setProjectionMatrixDirty = function () {
    cc._currentProjectionMatrix = -1;
};

/**
 * <p>
 *    Will enable the vertex attribs that are passed as flags.  <br/> 
 *    Possible flags:                                           <br/>
 *    cc.VERTEX_ATTRIB_FLAG_POSITION                             <br/>
 *    cc.VERTEX_ATTRIB_FLAG_COLOR                                <br/>
 *    cc.VERTEX_ATTRIB_FLAG_TEX_COORDS                            <br/>
 *                                                              <br/>
 *    These flags can be ORed. The flags that are not present, will be disabled.
 * </p>
 * @function
 * @param {cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR | cc.VERTEX_ATTRIB_FLAG_TEX_OORDS} flags
 */
 
 /**
 * <p>
 *    使顶点属性像变量一样标识.  <br/> 
 *    可能的标识:                                           <br/>
 *    cc.VERTEX_ATTRIB_FLAG_POSITION                             <br/>
 *    cc.VERTEX_ATTRIB_FLAG_COLOR                                <br/>
 *    cc.VERTEX_ATTRIB_FLAG_TEX_COORDS                            <br/>
 *                                                              <br/>
 *    这些标识可能不存在，或者无效
 * </p>
 * @function
 * @param {cc.VERTEX_ATTRIB_FLAG_POSITION | cc.VERTEX_ATTRIB_FLAG_COLOR | cc.VERTEX_ATTRIB_FLAG_TEX_OORDS} flags
 */
 
cc.glEnableVertexAttribs = function (flags) {
    /* Position */
    var ctx = cc._renderContext;
    var enablePosition = ( flags & cc.VERTEX_ATTRIB_FLAG_POSITION );
    if (enablePosition !== cc._vertexAttribPosition) {
        if (enablePosition)
            ctx.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
        else
            ctx.disableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
        cc._vertexAttribPosition = enablePosition;
    }

    /* Color */
    var enableColor = (flags & cc.VERTEX_ATTRIB_FLAG_COLOR);
    if (enableColor !== cc._vertexAttribColor) {
        if (enableColor)
            ctx.enableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR);
        else
            ctx.disableVertexAttribArray(cc.VERTEX_ATTRIB_COLOR);
        cc._vertexAttribColor = enableColor;
    }

    /* Tex Coords */
    var enableTexCoords = (flags & cc.VERTEX_ATTRIB_FLAG_TEX_COORDS);
    if (enableTexCoords !== cc._vertexAttribTexCoords) {
        if (enableTexCoords)
            ctx.enableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS);
        else
            ctx.disableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS);
        cc._vertexAttribTexCoords = enableTexCoords;
    }
};

/**
 * If the texture is not already bound, it binds it.<br/>							- 绑定还没绑定的纹理
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glBindTexture() directly.  - 如果CC_ENABLE_GL_STATE_CACHE无效，则立刻调用glBindTexture
 * @function
 * @param {cc.Texture2D} textureId
 */
cc.glBindTexture2D = function (textureId) {
    cc.glBindTexture2DN(0, textureId);
};

/**
 * If the texture is not already bound to a given unit, it binds it.<br/>			- 绑定还没绑定的纹理到给定的单元
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glBindTexture() directly.  - 如果CC_ENABLE_GL_STATE_CACHE无效，则立刻调用glBindTexture
 * @function
 * @param {Number} textureUnit
 * @param {cc.Texture2D} textureId
 */
cc.glBindTexture2DN = function (textureUnit, textureId) {
    if (cc._currentBoundTexture[textureUnit] == textureId)
        return;
    cc._currentBoundTexture[textureUnit] = textureId;

    var ctx = cc._renderContext;
    ctx.activeTexture(ctx.TEXTURE0 + textureUnit);
    if(textureId)
        ctx.bindTexture(ctx.TEXTURE_2D, textureId._webTextureObj);
    else
        ctx.bindTexture(ctx.TEXTURE_2D, null);
};
if (!cc.ENABLE_GL_STATE_CACHE){
    cc.glBindTexture2DN = function (textureUnit, textureId) {
        var ctx = cc._renderContext;
        ctx.activeTexture(ctx.TEXTURE0 + textureUnit);
        if(textureId)
            ctx.bindTexture(ctx.TEXTURE_2D, textureId._webTextureObj);
        else
            ctx.bindTexture(ctx.TEXTURE_2D, null);
    };
}

/**
 * It will delete a given texture. If the texture was bound, it will invalidate the cached. <br/> - 删除给定纹理, 如果该纹理已绑定，则会从缓存中失效
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glDeleteTextures() directly.             - 如果CC_ENABLE_GL_STATE_CACHE无效，则立刻调用glDeleteTextures方法
 * @function
 * @param {WebGLTexture} textureId
 */
cc.glDeleteTexture = function (textureId) {
    cc.glDeleteTextureN(0, textureId);
};

/**
 * It will delete a given texture. If the texture was bound, it will invalidate the cached for the given texture unit.<br/> - 删除给定纹理, 如果该纹理已绑定，则会从缓存的纹理单元失效
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glDeleteTextures() directly.										- 如果CC_ENABLE_GL_STATE_CACHE无效，则立刻调用glDeleteTextures方法
 * @function
 * @param {Number} textureUnit
 * @param {WebGLTexture} textureId
 */
cc.glDeleteTextureN = function (textureUnit, textureId) {
    if (cc.ENABLE_GL_STATE_CACHE) {
        if (textureId == cc._currentBoundTexture[ textureUnit ])
            cc._currentBoundTexture[ textureUnit ] = -1;
    }
    cc._renderContext.deleteTexture(textureId);
};

/**
 * If the vertex array is not already bound, it binds it.<br/>							- 如果顶点数组还未绑定，则绑定
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glBindVertexArray() directly.	- 如果CC_ENABLE_GL_STATE_CACHE无效，则立刻调用glBindVertexArray方法
 * @function
 * @param {Number} vaoId
 */
cc.glBindVAO = function (vaoId) {
    if (!cc.TEXTURE_ATLAS_USE_VAO)
        return;

    if (cc.ENABLE_GL_STATE_CACHE) {
        if (cc._uVAO != vaoId) {
            cc._uVAO = vaoId;
            //TODO need fixed
            //glBindVertexArray(vaoId);
        }
    } else {
        //glBindVertexArray(vaoId);
    }
};

/**
 * It will enable / disable the server side GL states.<br/>                   - 开启/关闭服务端GL状态
 * If CC_ENABLE_GL_STATE_CACHE is disabled, it will call glEnable() directly. - 如果CC_ENABLE_GL_STATE_CACHE无效，则立刻调用glEnable方法
 * @function
 * @param {Number} flags
 */
cc.glEnable = function (flags) {
    if (cc.ENABLE_GL_STATE_CACHE) {
        /*var enabled;

         */
        /* GL_BLEND */
        /*
         if ((enabled = (flags & cc.GL_BLEND)) != (cc._GLServerState & cc.GL_BLEND)) {
         if (enabled) {
         cc._renderContext.enable(cc._renderContext.BLEND);
         cc._GLServerState |= cc.GL_BLEND;
         } else {
         cc._renderContext.disable(cc._renderContext.BLEND);
         cc._GLServerState &= ~cc.GL_BLEND;
         }
         }*/
    } else {
        /*if ((flags & cc.GL_BLEND))
         cc._renderContext.enable(cc._renderContext.BLEND);
         else
         cc._renderContext.disable(cc._renderContext.BLEND);*/
    }
};


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
 * 使GL状态缓存失效。<br/>
 * 当CC_ENABLE_GL_STATE_CACHE为真时重置GL状态缓存。
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
 * 当GL程序跟当前不一致时使用新的GL程序。 <br/>
 * 当CC_ENABLE_GL_STATE_CACHE禁用时，直接调用glUseProgram方法。
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
 * 删除GL程序，如果正被使用，则使之失效。<br/>
 * 当CC_ENABLE_GL_STATE_CACHE禁用时，直接调用glUseProgram方法。
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
 * 在没有使用blending方法时使用。<br/>
 * 当CC_ENABLE_GL_STATE_CACHE禁用时，直接调用glBlendFunc方法。
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
 * 当调用glBlendFuncSeparate或者glBlendEquation时重置图层混合模式为缓存的状态。<br/>
 * 在CC_ENABLE_GL_STATE_CACHE失效时，则重置图层混合模式为GL_FUNC_ADD
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
 * 设置投影矩阵为dirty
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
 *    启用传递的顶点标识。  <br/> 
 *    可能的标识:                                           <br/>
 *    cc.VERTEX_ATTRIB_FLAG_POSITION                             <br/>
 *    cc.VERTEX_ATTRIB_FLAG_COLOR                                <br/>
 *    cc.VERTEX_ATTRIB_FLAG_TEX_COORDS                            <br/>
 *                                                              <br/>
 *    这些标识可以是ORed。如果标识没有指定，则会被禁用。
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
 * 如果纹理没有被绑定，则绑定到0。<br/>
 * 如果CC_ENABLE_GL_STATE_CACHE无效，则直接调用glBindTexture
 * @function
 * @param {cc.Texture2D} textureId
 */
cc.glBindTexture2D = function (textureId) {
    cc.glBindTexture2DN(0, textureId);
};

/**
 * 如果纹理没有被绑定到传入的单位，则绑定它。<br/>
 * 如果CC_ENABLE_GL_STATE_CACHE无效，则直接调用glBindTexture。
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
 * 删除给定纹理, 如果该纹理已绑定，则会从缓存中失效。<br/>
 * 如果CC_ENABLE_GL_STATE_CACHE无效，则直接调用glDeleteTextures方法
 * @function
 * @param {WebGLTexture} textureId
 */
cc.glDeleteTexture = function (textureId) {
    cc.glDeleteTextureN(0, textureId);
};

/**
 * 删除给定纹理, 如果该纹理已绑定，则会从缓存的纹理单元失效。<br/>
 * 如果CC_ENABLE_GL_STATE_CACHE无效，则直接调用glDeleteTextures方法。
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
 * 如果顶点数组还未绑定，则绑定它。<br/>
 * 如果CC_ENABLE_GL_STATE_CACHE无效，则直接调用glBindVertexArray方法。
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
 * 开启/关闭服务端GL状态。<br/>
 * 如果CC_ENABLE_GL_STATE_CACHE无效，则直接调用glEnable方法。
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


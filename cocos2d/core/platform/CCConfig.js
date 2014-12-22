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
 * 适用该版本Cocos2d-JS.<br/> 
 * 作为bug跟踪的重要标志,请不要删除这个字符串.<br/> 
 * 如果你想发布该bug到论坛，请附上该标志. 
 * @type {String}
 * @name cc.ENGINE_VERSION
 */
window["CocosEngine"] = cc.ENGINE_VERSION = "Cocos2d-JS v3.1";

/**
 * <p>
 *   假如可以，纹理坐标将使用下列公式进行计算： <br/> 
 *      - texCoord.left = (rect.x*2+1) / (texture.wide*2);                  <br/>
 *      - texCoord.right = texCoord.left + (rect.width*2-2)/(texture.wide*2); <br/>
 *                                                                                 <br/>
 *  上、下也是一样.                                                   <br/>
 *                                                                                 <br/>
 *  这个公式可以防止工件(artifacts)通过使用用99％的纹理。                   <br/>
 *  “正确的”方式以防止工件(artifacts)是使用spritesheet-artifact-fixer.py或类似工具.<br/>
 *                                                                                  <br/>
 *  受影响的 nodes:                                                                 <br/>
 *      - cc.Sprite / cc.SpriteBatchNode and subclasses: cc.LabelBMFont, cc.TMXTiledMap <br/>
 *      - cc.LabelAtlas                                                              <br/>
 *      - cc.QuadParticleSystem                                                      <br/>
 *      - cc.TileMap                                                                 <br/>
 *                                                                                  <br/>
 *  要启用设置为1，如果不启用使用默认设置.<br/>
 *  对其进行修改，在Web引擎中请参阅CCConfig.js，在JSB中请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL = 0;

/**
 * FPS的位置(默认: 0,0 (左下角))<br/>
 * 对其进行修改，在Web引擎中请参阅CCConfig.js，在JSB中请参阅CCConfig.h
 * @constant
 * @type {cc.Point}
 */
cc.DIRECTOR_STATS_POSITION = cc.p(0, 0);

/**
 * <p>
 *   FPS更新时间.<br/>
 *   0.5s,意味着FPS值每隔0.5秒更新一次.<br/>
 *   该值越大FPS值越可信<br/>
 *   <br/>
 *   默认值为0.1f<br/>
 *   对其进行修改，在Web引擎中请参阅CCConfig.js，在JSB中请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.DIRECTOR_FPS_INTERVAL = 0.5;

/**
 * <p>
 *    如果设置激活，cc.Node对象（cc.Sprite,cc.Label等等）就可以渲染子像素(subpixels).<br/>
 *    如果未激活，可使用整数像素(integer pixels).<br/>
 *    <br/>
 *    要启用设置为1，如果不启用使用默认设置.<br/>
 *    对其进行修改，在Web引擎中请参阅CCConfig.js，在JSB中请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.COCOSNODE_RENDER_SUBPIXEL = 1;

/**
 * <p>
 *   如果设置激活，与cc.SpriteBatchNode呈现cc.Sprite对象将能够渲染子像素(subpixels)<br/>
 *   如果未激活，可使用整数像素(integer pixels)。<br/>
 *   <br/>
 *   要启用设置为1，如果不启用使用默认设置<br/>
 *   对其进行修改，在Web引擎中请参阅CCConfig.js，在JSB中请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.SPRITEBATCHNODE_RENDER_SUBPIXEL = 1;

/**
 * <p>
 *     如果你的大多数图像都预乘(pre-multiplied)alpha，将其设置为1(如果你打算使用.PNG/.JPG文件图像).<br/>
 *     只有所有的图像绕开苹果的UIImage加载系统时设置为0(譬如你使用libpng或者PVR引擎)<br/>
 *     <br/>
 *     要启用设置为1，如果不启用使用默认设置.<br/>
 *     对其进行修改，在Web引擎中请参阅CCConfig.js，在JSB中请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.OPTIMIZE_BLEND_FUNC_FOR_PREMULTIPLIED_ALPHA = 0;

/**
 * <p>
 *   渲染纹理地图时使用GL_TRIANGLE_STRIP代替GL_TRIANGLES。<br/>
 *   现在看来，这是推荐的方式，但是它很慢，所以，启用与否自行决定.<br/>
 *   <br/>
 *     要启用设置为1，如果不启用使用默认设置.<br/>
 *     对其进行修改，在Web引擎中请参阅CCConfig.js，在JSB中请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.TEXTURE_ATLAS_USE_TRIANGLE_STRIP = 0;

/**
 * <p>
 *    默认情况下，cc.TextureAtlas（被许多的cocos2d类使用）将采用VAO（顶点数组对象）.<br/>
 *    苹果公司建议其使用，但他们可能会消耗大量的内存，特别是如果你使用过多.<br/>
 *    因此，对于某些情况下，你可能需要数以百计的VAO对象，禁用它可能是一个好主意..<br/>
 *    <br/>
 *     要启用设置为1，如果不启用使用默认设置(不支持 WebGL).<br/>
 *     对其进行修改，在Web引擎中请参阅CCConfig.js，在JSB中请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.TEXTURE_ATLAS_USE_VAO = 0;

/**
 * <p>
 *  如果启用，NPOT纹理将用于可用之处。只有第三代（及更高版本）的设备支持NPOT纹理.<br/>
 *  NPOT纹理具有以下限制:.<br/>
 *     -不能有贴图(mipmaps).<br/>
 *     -只能在GL_TEXTURE_WRAP_{S,T}中接受GL_CLAMP_TO_EDGE.<br/>
 *  <br/>
 *  要启用设置为1，如果不启用使用默认设置.<br/>
 *  此值只适用于PNG，GIF，BMP图像.<br/>
 *  此值不适用于PVR（PVR.GZ，PVR.CCZ）文件。如果NPOT PVR加载，那么它会创建一个NPOT纹理忽略此值.<br/>
 *  对其进行修改，在Web引擎中请参阅CCConfig.js，在JSB中请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 * @deprecated  该值将在1.1被删除，NPOT纹理会默认加载如果设备支持它。
 */
cc.TEXTURE_NPOT_SUPPORT = 0;

/**
 * <p>
 *    如果启用，cocos2d支持拥有视网膜屏幕的设备。<br/>
 *    出于性能的考虑，建议在没有视网膜显示支持游戏禁用它，像只支持iPad的游戏。<br/>
 *    <br/>
 *    要启用设置为1，如果不启用使用默认设置
 *    <br/>
 *    此值只适用于PNG，GIF，BMP图像.<br/>
 *    此值不适用于PVR（PVR.GZ，PVR.CCZ）文件。如果NPOT PVR加载，那么它会创建一个NPOT纹理忽略此值.<br/>
 *  对其进行修改，在Web引擎中请参阅CCConfig.js，在JSB中请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 * @deprecated  该值将在1.1被删除，NPOT纹理会默认加载如果设备支持它
 */
cc.RETINA_DISPLAY_SUPPORT = 1;

/**
 * <p>
 *    附加给文件的后缀以便加载“视网膜显示屏”图像.<br/>
 *    <br/>
 *    像iPhone4视网膜显示的设备启用，文件@“sprite-hd.png”将被加载，而不是@“sprite.png”.<br/>
 *    如果该文件不存在，将使用非视网膜显示图像.<br/>
 *    <br/>
 *    平台：仅在视网膜显示设备使用，如iPhone4
 * </p>
 * @constant
 * @type {String}
 */
cc.RETINA_DISPLAY_FILENAME_SUFFIX = "-hd";

/**
 * <p>
 *     如果启用，它将使用LA88（亮度Alpha 16-bit纹理）的CCLabelTTF对象<br/>
 *     如果禁用，它会使用A8（Alpha 8-bit纹理）<br/>
 *     LA88纹理比A8纹理快6％，但它们会消耗2倍内存<br/>
 *                                                                                            <br/>
 *     此功能是默认启用
 * </p>
 * @constant
 * @type {Number}
 */
cc.USE_LA88_LABELS = 1;

/**
 * <p>
 *   如果启用，cc.Sprite的所有子类将绘制边框<br/>
 *   只对调试有用.建议禁用它<br/>
 *   <br/>
 * 要启用将其设置为0以外的值.不同的选缺省情况:<br/>
 *      0 -- 不启用<br/>
 *      1 -- 绘制边框<br/>
 *      2 -- 绘制纹理边框<br/>
  * </p>
 * @constant
 * @type {Number}
 */
cc.SPRITE_DEBUG_DRAW = 0;

/**
 * <p>
 *    如果启用，所有正在使用cc.SpriteBatchNode呈现cc.Sprite的子类将绘制边框<br/>
 *    只对调试有用.建议禁用它<br/>
 *    <br/>
 *    要启用将其设置为0以外的值。默认不启用。
 * </p>
 * @constant
 * @type {Number}
 */
cc.SPRITEBATCHNODE_DEBUG_DRAW = 0;

/**
 * <p>
 *   如果启用，cc.LabelBMFont的所有子类将绘制边框<br/>
 *   只对调试有用.建议禁用它<br/>
 *   <br/>
 *   要启用将其设置为0以外的值。默认不启用。<br/>
 * </p>
 * @constant
 * @type {Number}
 */
cc.LABELBMFONT_DEBUG_DRAW = 0;

/**
 * <p>
 *    如果启用，cc.LabelAtlas的所有子类将绘制边框<br/>
 *    只对调试有用.建议禁用它<br/>
 *    <br/>
 *    要启用将其设置为0以外的值。默认不启用.
 * </p>
 * @constant
 * @type {Number}
 */
cc.LABELATLAS_DEBUG_DRAW = 0;

/**
 * 是否不支持Retina显示屏
 * @constant
 * @type {Number}
 */
cc.IS_RETINA_DISPLAY_SUPPORTED = 1;

/**
 * 默认引擎
 * @constant
 * @type {String}
 */
cc.DEFAULT_ENGINE = cc.ENGINE_VERSION + "-canvas";

/**
 * <p>
 *    如果启用，动作改变position属性（如：CCMoveBy，CCJumpBy，CCBezierBy，等..）将堆叠<br/>
 *    如果你在节点上同时运行2个或以上的'位置'的动作，那么结束位置将是所有位置的总和。<br/>
 *    如果禁用了，只有最后的运行动作才会起效果。
 * </p>
 * @constant
 * @type {number}
 */
cc.ENABLE_STACKABLE_ACTIONS = 1;

/**
 * <p>
 *      如果启用，cocos2d的将保持OpenGL的状态缓存以避免不必要的开关<br/>
 *      为了使用它们，你必须使用以下方法替换GL中的已有方法：
 *          - ccGLUseProgram() 代替glUseProgram()
 *          - ccGLDeleteProgram()代替glDeleteProgram()
 *          - ccGLBlendFunc()代替glBlendFunc()

 *      如果这些功能不可用，那么ccGLUseProgram(), ccGLDeleteProgram(), ccGLBlendFunc()将会调用GL的方法而不使用缓存<br/>
 *      建议启用尽可能提高速度<br/> 
 *      如果你的代码从GL ES1.1迁移过来，请继续禁用它。一旦所有的代码按预期工作，再打开它
 * </p>
 * @constant
 * @type {Number}
 */
cc.ENABLE_GL_STATE_CACHE = 1;
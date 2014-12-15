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
 * The current version of Cocos2d-JS being used.<br/>  适用该版本Cocos2d-JS
 * Please DO NOT remove this String, it is an important flag for bug tracking.<br/> 作为bug跟踪的重要标志,请不要删除这个字符串
 * If you post a bug to forum, please attach this flag. 如果你想发布该bug到论坛，请附上该标志
 * @type {String}
 * @name cc.ENGINE_VERSION
 */
window["CocosEngine"] = cc.ENGINE_VERSION = "Cocos2d-JS v3.1";

/**
 * <p>
 *   If enabled, the texture coordinates will be calculated by using this formula: <br/> 
 *   假如可以，纹理坐标将使用下列公式进行计算：
 *      - texCoord.left = (rect.x*2+1) / (texture.wide*2);                  <br/>
 *      - texCoord.right = texCoord.left + (rect.width*2-2)/(texture.wide*2); <br/>
 *                                                                                 <br/>
 *  The same for bottom and top.                                                   <br/>
 *  上、下也是一样
 *                                                                                 <br/>
 *  This formula prevents artifacts by using 99% of the texture.                   <br/>
 *  这个公式可以防止结构用99％的纹理。
 *  The "correct" way to prevent artifacts is by using the spritesheet-artifact-fixer.py or a similar tool.<br/>
 *  正确的方式以防止文物是使用spritesheet-artifact-fixer.py或类似工具
 *                                                                                  <br/>
 *  Affected nodes:                                                                 <br/>
 *      - cc.Sprite / cc.SpriteBatchNode and subclasses: cc.LabelBMFont, cc.TMXTiledMap <br/>
 *      - cc.LabelAtlas                                                              <br/>
 *      - cc.QuadParticleSystem                                                      <br/>
 *      - cc.TileMap                                                                 <br/>
 *                                                                                  <br/>
 *  To enabled set it to 1. Disabled by default.<br/>
 *  要启用设置为1，如果不启用使用默认设置
 *  To modify it, in Web engine please refer to CCConfig.js, in JSB please refer to CCConfig.h
 *  对其进行修改，在网络引擎请参阅CCConfig.js，在JSB请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.FIX_ARTIFACTS_BY_STRECHING_TEXEL = 0;

/**
 * Position of the FPS (Default: 0,0 (bottom-left corner))<br/>
 * FPS的位置
 * To modify it, in Web engine please refer to CCConfig.js, in JSB please refer to CCConfig.h
 * 对其进行修改，在网络引擎请参阅CCConfig.js，在JSB请参阅CCConfig.h
 * @constant
 * @type {cc.Point}
 */
cc.DIRECTOR_STATS_POSITION = cc.p(0, 0);

/**
 * <p>
 *   Seconds between FPS updates.<br/>
 *   FPS更新时间
 *   0.5 seconds, means that the FPS number will be updated every 0.5 seconds.<br/>
 *   0.5s,意味着FPS值每隔0.5秒更新一次
 *   Having a bigger number means a more reliable FPS<br/>
 *   该值越大FPS值越可信
 *   <br/>
 *   Default value: 0.1f<br/>
 *   默认值为0.1f
 *   To modify it, in Web engine please refer to CCConfig.js, in JSB please refer to CCConfig.h
 *   对其进行修改，在网络引擎请参阅CCConfig.js，在JSB请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.DIRECTOR_FPS_INTERVAL = 0.5;

/**
 * <p>
 *    If enabled, the cc.Node objects (cc.Sprite, cc.Label,etc) will be able to render in subpixels.<br/>
 *    如果设置激活，cc.Node对象（cc.Sprite,cc.Label等等）就可以渲染子像素。
 *    If disabled, integer pixels will be used.<br/>
 *    如果未激活，可使用整数像素。
 *    <br/>
 *    To enable set it to 1. Enabled by default.<br/>
 *    要启用设置为1，如果不启用使用默认设置
 *    To modify it, in Web engine please refer to CCConfig.js, in JSB please refer to CCConfig.h
 *    对其进行修改，在网络引擎请参阅CCConfig.js，在JSB请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.COCOSNODE_RENDER_SUBPIXEL = 1;

/**
 * <p>
 *   If enabled, the cc.Sprite objects rendered with cc.SpriteBatchNode will be able to render in subpixels.<br/>
 *   如果设置激活，与cc.SpriteBatchNode呈现cc.Sprite对象将能够在子像素呈现。
 *   If disabled, integer pixels will be used.<br/>
 *   如果未激活，可使用整数像素。
 *   <br/>
 *   To enable set it to 1. Enabled by default.<br/>
 *   要启用设置为1，如果不启用使用默认设置
 *   To modify it, in Web engine please refer to CCConfig.js, in JSB please refer to CCConfig.h
 *   对其进行修改，在网络引擎请参阅CCConfig.js，在JSB请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.SPRITEBATCHNODE_RENDER_SUBPIXEL = 1;

/**
 * <p>
 *     If most of your images have pre-multiplied alpha, set it to 1 (if you are going to use .PNG/.JPG file images).<br/>
 *     如果你的大多数图像都预乘α，将其设置为1(如果你打算使用.PNG/.JPG文件图像)
 *     Only set to 0 if ALL your images by-pass Apple UIImage loading system (eg: if you use libpng or PVR images)<br/>
 *     只有所有的图像绕开苹果的UIImage加载系统时设置为0(譬如你使用libpng或者PVR引擎)
 *     <br/>
 *     To enable set it to a value different than 0. Enabled by default.<br/>
 *     要启用设置为1，如果不启用使用默认设置
 *     To modify it, in Web engine please refer to CCConfig.js, in JSB please refer to CCConfig.h
 *     对其进行修改，在网络引擎请参阅CCConfig.js，在JSB请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.OPTIMIZE_BLEND_FUNC_FOR_PREMULTIPLIED_ALPHA = 0;

/**
 * <p>
 *   Use GL_TRIANGLE_STRIP instead of GL_TRIANGLES when rendering the texture atlas.<br/>
 *   渲染纹理地图时使用GL_TRIANGLE_STRIP代替GL_TRIANGLES。
 *   It seems it is the recommend way, but it is much slower, so, enable it at your own risk<br/>
 *   现在看来，这是推荐的方式，但它是慢得多，所以，启用与否自行决定.
 *   <br/>
 *   To enable set it to a value different than 0. Disabled by default.<br/>
 *   要启用设置为1，如果不启用使用默认设置
 *   To modify it, in Web engine please refer to CCConfig.js, in JSB please refer to CCConfig.h
 *   对其进行修改，在网络引擎请参阅CCConfig.js，在JSB请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.TEXTURE_ATLAS_USE_TRIANGLE_STRIP = 0;

/**
 * <p>
 *    By default, cc.TextureAtlas (used by many cocos2d classes) will use VAO (Vertex Array Objects).<br/>
 *    默认情况下，cc.TextureAtlas（被许多的cocos2d类）将采用VAO（顶点数组对象）
 *    Apple recommends its usage but they might consume a lot of memory, specially if you use many of them.<br/>
 *    苹果公司建议其使用，但他们可能会消耗大量的内存，特别是如果你使用过多
 *    So for certain cases, where you might need hundreds of VAO objects, it might be a good idea to disable it.<br/>
 *    因此，对于某些情况下，你可能需要数百VAO的对象，禁用它可能是一个好主意.
 *    <br/>
 *    To disable it set it to 0. disable by default.(Not Supported on WebGL)<br/>
 *    要启用设置为1，如果不启用使用默认设置
 *    To modify it, in Web engine please refer to CCConfig.js, in JSB please refer to CCConfig.h
 *    对其进行修改，在网络引擎请参阅CCConfig.js，在JSB请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 */
cc.TEXTURE_ATLAS_USE_VAO = 0;

/**
 * <p>
 *  If enabled, NPOT textures will be used where available. Only 3rd gen (and newer) devices support NPOT textures.<br/>
 *  如果启用，NPOT纹理将用于可用之处。只有第三代（及更高版本）的设备支持NPOT纹理
 *  NPOT textures have the following limitations:<br/>
 *     - They can't have mipmaps<br/>
 *     - They only accept GL_CLAMP_TO_EDGE in GL_TEXTURE_WRAP_{S,T}<br/>
 *  <br/>
 *  NPOT纹理具有以下限制:
 *     -不能有贴图
 *     -只能在GL_TEXTURE_WRAP_{S,T}中接受GL_CLAMP_TO_EDGE
 *  To enable set it to a value different than 0. Disabled by default. <br/>
 *  要启用设置为1，如果不启用使用默认设置
 *  <br/>
 *  This value governs only the PNG, GIF, BMP, images.<br/>
 *  此值只适配与PNG，GIF，BMP图像
 *  This value DOES NOT govern the PVR (PVR.GZ, PVR.CCZ) files. If NPOT PVR is loaded, then it will create an NPOT texture ignoring this value.<br/>
 *  此值不适用与PVR（PVR.GZ，PVR.CCZ）文件。如果NPOT PVR加载，那么它会创建一个NPOT纹理忽略此值
 *  To modify it, in Web engine please refer to CCConfig.js, in JSB please refer to CCConfig.h
 *  对其进行修改，在网络引擎请参阅CCConfig.js，在JSB请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 * @deprecated This value will be removed in 1.1 and NPOT textures will be loaded by default if the device supports it.
 * 该值将在1.1被删除，NPOT纹理会默认加载如果设备支持它。
 */
cc.TEXTURE_NPOT_SUPPORT = 0;

/**
 * <p>
 *    If enabled, cocos2d supports retina display.<br/>
 *    如果启用，cocos2d支持拥有视网膜屏幕的设备。
 *    For performance reasons, it's recommended disable it in games without retina display support, like iPad only games.<br/>
 *    出于性能的考虑，建议在没有视网膜显示支持游戏禁用它，像只支持iPad的游戏。
 *    <br/>
 *    To enable set it to 1. Use 0 to disable it. Enabled by default.<br/>
 *    要启用设置为1，如果不启用使用默认设置
 *    <br/>
 *    This value governs only the PNG, GIF, BMP, images.<br/>
 *    此值只适配与PNG，GIF，BMP图像
 *    This value DOES NOT govern the PVR (PVR.GZ, PVR.CCZ) files. If NPOT PVR is loaded, then it will create an NPOT texture ignoring this value.<br/>
 *    此值不适用与PVR（PVR.GZ，PVR.CCZ）文件。如果NPOT PVR加载，那么它会创建一个NPOT纹理忽略此值
 *    To modify it, in Web engine please refer to CCConfig.js, in JSB please refer to CCConfig.h
 *    对其进行修改，在网络引擎请参阅CCConfig.js，在JSB请参阅CCConfig.h
 * </p>
 * @constant
 * @type {Number}
 * @deprecated This value will be removed in 1.1 and NPOT textures will be loaded by default if the device supports it.
 * 该值将在1.1被删除，NPOT纹理会默认加载如果设备支持它
 */
cc.RETINA_DISPLAY_SUPPORT = 1;

/**
 * <p>
 *    It's the suffix that will be appended to the files in order to load "retina display" images.<br/>
 *    附加给文件的后缀以便加载“视网膜显示屏”图像
 *    <br/>
 *    On an iPhone4 with Retina Display support enabled, the file @"sprite-hd.png" will be loaded instead of @"sprite.png".<br/>
 *    像iPhone4视网膜显示的设备启用，文件@“sprite-hd.png”将被加载，而不是@“sprite.png”
 *    If the file doesn't exist it will use the non-retina display image.<br/>
 *    如果该文件不存在，将使用非视网膜显示图像
 *    <br/>
 *    Platforms: Only used on Retina Display devices like iPhone 4.
 *    平台：仅在视网膜显示设备使用，如iPhone4
 * </p>
 * @constant
 * @type {String}
 */
cc.RETINA_DISPLAY_FILENAME_SUFFIX = "-hd";

/**
 * <p>
 *     If enabled, it will use LA88 (Luminance Alpha 16-bit textures) for CCLabelTTF objects. <br/>
 *     如果启用，它将使用LA88（亮度阿尔法16位纹理）的CCLabelTTF对象
 *     If it is disabled, it will use A8 (Alpha 8-bit textures).                              <br/>
 *     如果禁用，它会使用A8（阿尔法8位纹理）
 *     LA88 textures are 6% faster than A8 textures, but they will consume 2x memory.         <br/>
 *     LA88纹理比A8纹理快6％，但它们会消耗2倍内存
 *                                                                                            <br/>
 *     This feature is enabled by default.
 *     此功能是默认启用
 * </p>
 * @constant
 * @type {Number}
 */
cc.USE_LA88_LABELS = 1;

/**
 * <p>
 *   If enabled, all subclasses of cc.Sprite will draw a bounding box<br/>
 *   如果启用，cc.Sprite的所有子类将绘制边框
 *   Useful for debugging purposes only. It is recommend to leave it disabled.<br/>
 *   只对调试有用.建议禁用它
 *   <br/>
 *   To enable set it to a value different than 0. Disabled by default:<br/>
 *      0 -- disabled<br/>
 *      1 -- draw bounding box<br/>
 *      2 -- draw texture box
 * </p>
 * 要启用将其设置为0以外的值.不同的选缺省情况:
 *      0 -- 不启用
 *      1 -- 绘制边框
 *      2 -- 绘制纹理边框
 * @constant
 * @type {Number}
 */
cc.SPRITE_DEBUG_DRAW = 0;

/**
 * <p>
 *    If enabled, all subclasses of cc.Sprite that are rendered using an cc.SpriteBatchNode draw a bounding box.<br/>
 *    如果启用，所有正在使用cc.SpriteBatchNode呈现cc.Sprite的子类将绘制边框
 *    Useful for debugging purposes only. It is recommend to leave it disabled.<br/>
 *    只对调试有用.建议禁用它
 *    <br/>
 *    To enable set it to a value different than 0. Disabled by default.
 *    要启用将其设置为0以外的值。默认不启用。
 * </p>
 * @constant
 * @type {Number}
 */
cc.SPRITEBATCHNODE_DEBUG_DRAW = 0;

/**
 * <p>
 *   If enabled, all subclasses of cc.LabelBMFont will draw a bounding box <br/>
 *   如果启用，cc.LabelBMFont的所有子类将绘制边框
 *   Useful for debugging purposes only. It is recommend to leave it disabled.<br/>
 *   只对调试有用.建议禁用它
 *   <br/>
 *   To enable set it to a value different than 0. Disabled by default.<br/>
 *   要启用将其设置为0以外的值。默认不启用。
 * </p>
 * @constant
 * @type {Number}
 */
cc.LABELBMFONT_DEBUG_DRAW = 0;

/**
 * <p>
 *    If enabled, all subclasses of cc.LabelAtlas will draw a bounding box<br/>
 *    如果启用，cc.LabelAtlas的所有子类将绘制边框
 *    Useful for debugging purposes only. It is recommend to leave it disabled.<br/>
 *    只对调试有用.建议禁用它
 *    <br/>
 *    To enable set it to a value different than 0. Disabled by default.
 *    要启用将其设置为0以外的值。默认不启用.
 * </p>
 * @constant
 * @type {Number}
 */
cc.LABELATLAS_DEBUG_DRAW = 0;

/**
 * Whether or not support retina display
 * 是否不支持Retina显示屏
 * @constant
 * @type {Number}
 */
cc.IS_RETINA_DISPLAY_SUPPORTED = 1;

/**
 * Default engine
 * 默认引擎
 * @constant
 * @type {String}
 */
cc.DEFAULT_ENGINE = cc.ENGINE_VERSION + "-canvas";

/**
 * <p>
 *    If enabled, actions that alter the position property (eg: CCMoveBy, CCJumpBy, CCBezierBy, etc..) will be stacked.                  <br/>
 *    如果启用，行动改变position属性（如：CCMoveBy，CCJumpBy，CCBezierBy，等..）将堆叠
 *    If you run 2 or more 'position' actions at the same time on a node, then end position will be the sum of all the positions.        <br/>
 *    如果您运行在同一时间节点上2个或更多的'位置'的动作，然后结束位置将成为所有职位的总和。
 *    If disabled, only the last run action will take effect.
 *    如果禁用了，只剩下最后的运行操作将生效。
 * </p>
 * @constant
 * @type {number}
 */
cc.ENABLE_STACKABLE_ACTIONS = 1;

/**
 * <p>
 *      If enabled, cocos2d will maintain an OpenGL state cache internally to avoid unnecessary switches.                                     <br/>
 *      如果启用，cocos2d的将保持OpenGL的状态缓存以避免不必要的开关
 *      In order to use them, you have to use the following functions, instead of the the GL ones:                                             <br/>
 *          - ccGLUseProgram() instead of glUseProgram()                                                                                      <br/>
 *          - ccGLDeleteProgram() instead of glDeleteProgram()                                                                                <br/>
 *          - ccGLBlendFunc() instead of glBlendFunc()                                                                                        <br/>
 *      为了使用它们，你必须使用，而不是在GL那些以下功能;
 *          - ccGLUseProgram() 代替glUseProgram()
 *          - ccGLDeleteProgram()代替glDeleteProgram()
 *          - ccGLBlendFunc()代替glBlendFunc()
 *                                                                                                                                            <br/>
 *      If this functionality is disabled, then ccGLUseProgram(), ccGLDeleteProgram(), ccGLBlendFunc() will call the GL ones, without using the cache.              <br/>
 *      如果这些功能不可用，那么ccGLUseProgram(), ccGLDeleteProgram(), ccGLBlendFunc()将会调用GL的方法而不带缓存
 *      It is recommend to enable whenever possible to improve speed.                                                                        <br/>
 *      它建议启用使尽可能提高速度
 *      If you are migrating your code from GL ES 1.1, then keep it disabled. Once all your code works as expected, turn it on.
 *      如果你的代码从GL ES1.1迁移过来，请继续禁用它。一旦所有的代码按预期工作，打开它
 * </p>
 * @constant
 * @type {Number}
 */
cc.ENABLE_GL_STATE_CACHE = 1;
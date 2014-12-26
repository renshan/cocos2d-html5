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
 * 浏览器的音频支持
 *
 * multichannel : 支持播放多个音频 - 如果不播放多个音频，你可以只播放背景音乐
 * webAudio     : 支持网络音频 - 支持W3C的webAudio标准，所有音频格式都可以播放
 * auto         : 支持自动播放音频 - 如果不想自动播放，可以监听背景音乐的canvas的触摸事件去重新播放
 *
 * 在某些浏览器版本中可能存在限制
 */
(function(){

    var DEBUG = false;

    var sys = cc.sys;

    var supportTable = {
        "common" : {multichannel: true , webAudio: cc.sys._supportWebAudio , auto: true }
    };

    //  ANDROID  //
    supportTable[sys.BROWSER_TYPE_ANDROID] = {multichannel: false, webAudio: false, auto: false};
    supportTable[sys.BROWSER_TYPE_CHROME]  = {multichannel: true , webAudio: true , auto: false};
    supportTable[sys.BROWSER_TYPE_FIREFOX] = {multichannel: true , webAudio: true , auto: true };
    supportTable[sys.BROWSER_TYPE_BAIDU]   = {multichannel: false, webAudio: false, auto: true };
    supportTable[sys.BROWSER_TYPE_UC]      = {multichannel: true , webAudio: false, auto: true };
    supportTable[sys.BROWSER_TYPE_QQ]      = {multichannel: false, webAudio: false, auto: true };
    supportTable[sys.BROWSER_TYPE_OUPENG]  = {multichannel: false, webAudio: false, auto: false};
    supportTable[sys.BROWSER_TYPE_WECHAT]  = {multichannel: false, webAudio: false, auto: false};
    supportTable[sys.BROWSER_TYPE_360]     = {multichannel: false, webAudio: false, auto: true };
    supportTable[sys.BROWSER_TYPE_MIUI]    = {multichannel: false, webAudio: false, auto: true };

    //  APPLE  //
    supportTable[sys.BROWSER_TYPE_SAFARI]  = {multichannel: true , webAudio: true , auto: false};

    /* 判断浏览器的版本号*/      
    var version, tmp;
    try{
        var ua = navigator.userAgent.toLowerCase();
        switch(sys.browserType){
            case sys.BROWSER_TYPE_IE:
                tmp = ua.match(/(msie |rv:)([\d.]+)/);
                break;
            case sys.BROWSER_TYPE_FIREFOX:
                tmp = ua.match(/(firefox\/|rv:)([\d.]+)/);
                break;
            case sys.BROWSER_TYPE_CHROME:
                tmp = ua.match(/chrome\/([\d.]+)/);
                break;
            case sys.BROWSER_TYPE_BAIDU:
                tmp = ua.match(/baidubrowser\/([\d.]+)/);
                break;
            case sys.BROWSER_TYPE_UC:
                tmp = ua.match(/ucbrowser\/([\d.]+)/);
                break;
            case sys.BROWSER_TYPE_QQ:
                tmp = ua.match(/qqbrowser\/([\d.]+)/);
                break;
            case sys.BROWSER_TYPE_OUPENG:
                tmp = ua.match(/oupeng\/([\d.]+)/);
                break;
            case sys.BROWSER_TYPE_WECHAT:
                tmp = ua.match(/micromessenger\/([\d.]+)/);
                break;
            case sys.BROWSER_TYPE_SAFARI:
                tmp = ua.match(/safari\/([\d.]+)/);
                break;
        }
        version = tmp ? tmp[1] : "";
    }catch(e){
        console.log(e);
    }

    ///////////////////////////
    //  Browser compatibility//    
    ///////////////////////////
    if(version){
        switch(sys.browserType){
            case sys.BROWSER_TYPE_CHROME:
                if(parseInt(version) < 30){
                    supportTable[sys.BROWSER_TYPE_CHROME]  = {multichannel: false , webAudio: true , auto: false};
                }
        }
    }

    if(cc.sys.isMobile){
        cc.__audioSupport = supportTable[cc.sys.browserType] || supportTable["common"];
    }else{
        // 支持所有设备
        cc.__audioSupport = supportTable["common"];
    }

    if(DEBUG){
        setTimeout(function(){
            cc.log("browse type: " + sys.browserType);
            cc.log("browse version: " + version);
            cc.log("multichannel: " + cc.__audioSupport.multichannel);
            cc.log("webAudio: " + cc.__audioSupport.webAudio);
            cc.log("auto: " + cc.__audioSupport.auto);
        }, 0);
    }

})();

/**
 * Encapsulate DOM and webAudio（封装成DOM和webAudio）
 */
cc.Audio = cc.Class.extend({
    //TODO Maybe loader shift in will be better（加载时移入会更好）
    volume: 1,
    loop: false,
    src: null,
    _touch: false,

    _playing: false,
    _AUDIO_TYPE: "AUDIO",
    _pause: false,

    //Web Audio
    _buffer: null,
    _currentSource: null,
    _startTime: null,
    _currentTime: null,
    _context: null,
    _volume: null,

    //DOM Audio  
    _element: null,

    ctor: function(context, volume, url){
        context && (this._context = context);
        volume && (this._volume = volume);
        if(context && volume){
            this._AUDIO_TYPE = "WEBAUDIO";
        }
        this.src = url;
    },

    _setBufferCallback: null,
    setBuffer: function(buffer){
        this._AUDIO_TYPE = "WEBAUDIO";
        this._buffer = buffer;
        if(this._playing)
            this.play();

        this._volume["gain"].value = this.volume;
        this._setBufferCallback && this._setBufferCallback(buffer);
    },

    _setElementCallback: null,
    setElement: function(element){
        this._AUDIO_TYPE = "AUDIO";
        this._element = element;
        if(this._playing)
            this.play();

        element.volume = this.volume;
        element.loop = this.loop;
        this._setElementCallback && this._setElementCallback(element);
    },

    play: function(offset, loop){
        this._playing = true;
        this.loop = loop === undefined ? this.loop : (loop || false);
        if(this._AUDIO_TYPE === "AUDIO"){
            this._playOfAudio(offset);
        }else{
            this._playOfWebAudio(offset);
        }
    },

    getPlaying: function(){
        if(!this._playing){
            return this._playing;
        }
        if(this._AUDIO_TYPE === "AUDIO"){
            var audio = this._element;
            if(!audio || this._pause){
                this._playing = false;
                return false;
            }else if(audio.ended){
                this._playing = false;
                return false;
            }else
                return true;
        }else{
            var sourceNode = this._currentSource;
            if(!this._playing && !sourceNode)
                return true;
            if(sourceNode["playbackState"] == null)
                return this._playing;
            else
                return sourceNode["playbackState"] == 3;
        }
    },

    _playOfWebAudio: function(offset){
        var cs = this._currentSource;
        if(!this._buffer){
            return;
        }
        if(!this._pause && cs){
            if(this._currentTime + this._context.currentTime - this._startTime < this._currentSource.buffer.duration)
                return;
            else
                this._stopOfWebAudio();
        }
        var audio = this._context["createBufferSource"]();
        audio.buffer = this._buffer;
        audio["connect"](this._volume);
        audio.loop = this.loop;
        this._startTime = this._context.currentTime;
        this._currentTime = 0;

        /*
         * iOS 6的Safari浏览器只支持noteOn(), noteGrainOn(), and noteOff()等函数
         * 最新版本的chrome浏览器已经支持start() 和 stop()函数
         * 在最新的规范里，指定使用start() & stop() (写于 04/26/2013)  
         *      参考：https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html 
         * 在13版本的初稿里已经指定noteOn(), noteGrainOn(), and noteOff()
         *      参考： http://www.w3.org/2011/audio/drafts/2WD/Overview.html
         */
        if(audio.start){
            audio.start(0, offset || 0);
        }else if(audio["noteGrainOn"]){
            var duration = audio.buffer.duration;
            if (this.loop) {
                /*
                 * 在iOS 6的Safari浏览器里，如果 loop == true，传递的时长参数会是从当前时间开始算起
                 * 换句话说，音乐总是会一直播放知道全部播放完毕
                 * 在最新版本的chrome浏览器，传递的时长参数只是循环播放的时长
                 * 最新版本的谷歌浏览器将会有start()函数，这是为IOS系统准备的
                 */
                audio["noteGrainOn"](0, offset, duration);
            } else {
                audio["noteGrainOn"](0, offset, duration - offset);
            }
        }else {
            // 如果只支持noteOn()，将不能从新播放音乐
            audio["noteOn"](0);
        }
        this._currentSource = audio;
        var self = this;
        audio["onended"] = function(){
            self._playing = false;
        };
    },

    _playOfAudio: function(){
        var audio = this._element;
        if(audio){
            audio.loop = this.loop;
            audio.play();
        }
    },

    stop: function(){
        this._playing = false;
        if(this._AUDIO_TYPE === "AUDIO"){
            this._stopOfAudio();
        }else{
            this._stopOfWebAudio();
        }
    },

    _stopOfWebAudio: function(){
        var audio = this._currentSource;
        if(audio){
            audio.stop(0);
            this._currentSource = null;
        }
    },

    _stopOfAudio: function(){
        var audio = this._element;
        if(audio){
            audio.pause();
            if (audio.duration && audio.duration != Infinity)
                audio.currentTime = audio.duration;
        }
    },

    pause: function(){
        this._playing = false;
        this._pause = true;
        if(this._AUDIO_TYPE === "AUDIO"){
            this._pauseOfAudio();
        }else{
            this._pauseOfWebAudio();
        }
    },

    _pauseOfWebAudio: function(){
        this._currentTime += this._context.currentTime - this._startTime;
        var audio = this._currentSource;
        if(audio){
            audio.stop(0);
        }
    },

    _pauseOfAudio: function(){
        var audio = this._element;
        if(audio){
            audio.pause();
        }
    },

    resume: function(){
        if(this._pause){
            if(this._AUDIO_TYPE === "AUDIO"){
                this._resumeOfAudio();
            }else{
                this._resumeOfWebAudio();
            }
            this._pause = false;
            this._playing = true;
        }
    },

    _resumeOfWebAudio: function(){
        var audio = this._currentSource;
        if(audio){
            this._startTime = this._context.currentTime;
            var offset = this._currentTime % audio.buffer.duration;
            this._playOfWebAudio(offset);
        }
    },

    _resumeOfAudio: function(){
        var audio = this._element;
        if(audio){
            audio.play();
        }
    },

    setVolume: function(volume){
        if(volume > 1) volume = 1;
        if(volume < 0) volume = 0;
        this.volume = volume;
        if(this._AUDIO_TYPE === "AUDIO"){
            if(this._element){
                this._element.volume = volume;
            }
        }else{
            if(this._volume){
                this._volume["gain"].value = volume;
            }
        }
    },

    getVolume: function(){
        return this.volume;
    },

    cloneNode: function(){
        var audio, self;
        if(this._AUDIO_TYPE === "AUDIO"){
            audio = new cc.Audio();

            var elem = document.createElement("audio");
            elem.src = this.src;
            audio.setElement(elem);
        }else{
            var volume = this._context["createGain"]();
            volume["gain"].value = 1;
            volume["connect"](this._context["destination"]);
            audio = new cc.Audio(this._context, volume, this.src);
            if(this._buffer){
                audio.setBuffer(this._buffer);
            }else{
                self = this;
                this._setBufferCallback = function(buffer){
                    audio.setBuffer(buffer);
                    self._setBufferCallback = null;
                };
            }
        }
        audio._AUDIO_TYPE = this._AUDIO_TYPE;
        return audio;
    }

});

(function(polyfill){

    var SWA = polyfill.webAudio,
        SWB = polyfill.multichannel,
        SWC = polyfill.auto;

    var support = [];

    (function(){
        var audio = document.createElement("audio");
        if(audio.canPlayType) {
            var ogg = audio.canPlayType('audio/ogg; codecs="vorbis"');
            if (ogg && ogg !== "") support.push(".ogg");
            var mp3 = audio.canPlayType("audio/mpeg");
            if (mp3 && mp3 !== "") support.push(".mp3");
            var wav = audio.canPlayType('audio/wav; codecs="1"');
            if (wav && wav !== "") support.push(".wav");
            var mp4 = audio.canPlayType("audio/mp4");
            if (mp4 && mp4 !== "") support.push(".mp4");
            var m4a = audio.canPlayType("audio/x-m4a");
            if (m4a && m4a !== "") support.push(".m4a");
        }
    })();

    if(SWA){
        var context = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();
    }

    var loader = {

        cache: {},

        load: function(realUrl, url, res, cb){

            if(support.length === 0)
                return cb("can not support audio!");

            var i;

            var extname = cc.path.extname(realUrl);

            var typeList = [extname];
            for(i=0; i<support.length; i++){
                if(extname !== support[i]){
                    typeList.push(support[i]);
                }
            }

            var audio;
            if(SWA){
                var volume = context["createGain"]();
                volume["gain"].value = 1;
                volume["connect"](context["destination"]);
                audio = new cc.Audio(context, volume, realUrl);
            }else{
                audio = new cc.Audio(null, null, realUrl);
            }

            this.loadAudioFromExtList(realUrl, typeList, audio, cb);

            loader.cache[realUrl] = audio;

        },

        loadAudioFromExtList: function(realUrl, typeList, audio, cb){

            if(typeList.length === 0)
                cb("can not found the resource of audio! Last match url is : " + realUrl);

            realUrl = cc.path.changeExtname(realUrl, typeList.splice(0, 1));

            if(SWA){//Buffer缓冲区

                var request = new XMLHttpRequest();
                request.open("GET", realUrl, true);
                request.responseType = "arraybuffer";

                // Our asynchronous callback （我们的异步调用）
                request.onload = function () {
                    context["decodeAudioData"](request.response, function(buffer){
                        //成功
                        audio.setBuffer(buffer);
                        cb(null, audio);
                    }, function(){
                        //失败
                        loader.loadAudioFromExtList(realUrl, typeList, audio, cb);
                    });
                };
                request.send();
            }else{//DOM

                var element = document.createElement("audio");
                element.src = realUrl;

                var success = function(){
                    audio.setElement(element);
                    cb(null, audio);
                    element.removeEventListener("onload", success, false);
                    element.removeEventListener("error", failure, false);
                    element.removeEventListener("emptied", failure, false);
                };

                var failure = function(){
                    loader.loadAudioFromExtList(realUrl, typeList, audio, cb);
                    element.removeEventListener("onload", success, false);
                    element.removeEventListener("error", failure, false);
                    element.removeEventListener("emptied", failure, false);
                };

                cc._addEventListener(element, "canplaythrough", success, false);
                cc._addEventListener(element, "error", failure, false);
                cc._addEventListener(element, "emptied", failure, false);
            }

        }
    };

    cc.loader.register(["mp3", "ogg", "wav", "mp4", "m4a"], loader);

    /**
     * cc.audioEngine是一个单例对象，它提供了简单的音频接口
     * @namespace
     */
    cc.audioEngine = {
        _currMusic: null,
        _musicVolume: 1,

        /**
         * 标示背景音乐是否可以播放
         * @returns {boolean} <i>true</i> 假如背景音乐正在播放，否则 <i>false</i>
         */
        willPlayMusic: function(){return false;},

        /**
         * 播放音乐
         * @param {String} url 不带文件扩展名的音乐文件的路径。
         * @param {Boolean} loop 是否循环播放音乐.
         * @example
         * // 例子
         * cc.audioEngine.playMusic(path, false);
         */
        playMusic: function(url, loop){
            var bgMusic = this._currMusic;
            if(bgMusic && bgMusic.src !== url){
                bgMusic.stop();
            }
            var audio = loader.cache[url];
            if(!audio){
                cc.loader.load(url);
                audio = loader.cache[url];
            }
            audio.play(0, loop);
            audio.setVolume(this._musicVolume);
            this._currMusic = audio;
        },

        /**
         * 停止播放音乐
         * @param {Boolean} [releaseData] 是否释放音乐数据，默认值是false。
         * @example
         * // 例子
         * cc.audioEngine.stopMusic();
         */
        stopMusic: function(releaseData){
            var audio = this._currMusic;
            if(audio){
                audio.stop();
                if (releaseData)
                    cc.loader.release(audio.src);
            }
        },

        /**
         * 暂停播放音乐
         * @example
         * // 例子
         * cc.audioEngine.pauseMusic();
         */
        pauseMusic: function(){
            var audio = this._currMusic;
            if(audio)
                audio.pause();
        },

        /**
         * 重新播放音乐
         * @example
         * // 例子
         * cc.audioEngine.resumeMusic();
         */
        resumeMusic: function(){
            var audio = this._currMusic;
            if(audio)
                audio.resume();
        },

        /**
         * 回放播放的音乐
         * @example
         * // 例子
         * cc.audioEngine.rewindMusic();
         */
        rewindMusic: function(){
            var audio = this._currMusic;
            if(audio){
                audio.stop();
                audio.play();
            }
        },

        /**
         * 音乐的最大音量是1.0，最小音量是0.0
         * @return {Number}
         * @example
         * // 例子
         * var volume = cc.audioEngine.getMusicVolume();
         */
        getMusicVolume: function(){
            return this._musicVolume;
        },

        /**
         * 设置音乐的音量
         * @param {Number} volume 音量必须在0.0~1.0之间.
         * @example
         * // 例子
         * cc.audioEngine.setMusicVolume(0.5);
         */
        setMusicVolume: function(volume){
            this._musicVolume = volume;
            var audio = this._currMusic;
            if(audio){
                audio.setVolume(volume);
            }
        },

        /**
         * 判断音乐是否在播放
         * @return {Boolean} 如果正在播放则返回true，否则返回false
         * @example
         * // 例子
         *  if (cc.audioEngine.isMusicPlaying()) {
         *      cc.log("music is playing");
         *  }
         *  else {
         *      cc.log("music is not playing");
         *  }
         */
        isMusicPlaying: function(){
            var audio = this._currMusic;
            if(audio){
                return audio.getPlaying();
            }else{
                return false;
            }
        },

        _audioPool: {},
        _maxAudioInstance: 5,
        _effectVolume: 1,
        /**
         * 播放音效
         * @param {String} url 带文件扩展名的音效文件的路径。
         * @param {Boolean} loop 是否循环播放音效，默认下时false
         * @return {Number|null} audio的id
         * @example
         * // 例子
         * var soundId = cc.audioEngine.playEffect(path);
         */
        playEffect: function(url, loop){
            //如果浏览器只自持同时播放一个音频
            if(!SWB){
                //Must be forced to shut down
                //Because playing multichannel audio will be stuck in chrome 28 (android)在安卓chrome 28浏览器上会因为播放多个频道的音频而卡住
                return null;
            }

            var effectList = this._audioPool[url];
            if(!effectList){
                effectList = this._audioPool[url] = [];
            }

            var i;

            for(i=0; i<effectList.length; i++){
                if(!effectList[i].getPlaying()){
                    break;
                }
            }

            if(effectList[i]){
                audio = effectList[i];
                audio.setVolume(this._effectVolume);
                audio.play(0, loop);
            }else if(SWA && i > this._maxAudioInstance){
                cc.log("Error: %s greater than %d", url, this._maxAudioInstance);
            }else{
                var audio = loader.cache[url];
                if(!audio){
                    cc.loader.load(url);
                    audio = loader.cache[url];
                }
                audio = audio.cloneNode();
                audio.setVolume(this._effectVolume);
                audio.loop = loop || false;
                audio.play();
                effectList.push(audio);
            }

            return audio;
        },

        /**
         * 设置音效的音量
         * @param {Number} volume 音量必须在0.0~1.0之间.
         * @example
         * // 例子
         * cc.audioEngine.setEffectsVolume(0.5);
         */
        setEffectsVolume: function(volume){
            this._effectVolume = volume;
        },

        /**
         * 音效音量最大是1.0，最小是0.0
         * @return {Number}
         * @example
         * // 例子
         * var effectVolume = cc.audioEngine.getEffectsVolume();
         */
        getEffectsVolume: function(){
            return this._effectVolume;
        },

        /**
         * 暂停播放音效
         * @param {Number} cc.Audio playEffect函数的返回值.
         * @example
         * // 例子
         * cc.audioEngine.pauseEffect(audioID);
         */
        pauseEffect: function(audio){
            if(audio){
                audio.pause();
            }
        },

        /**
         * 暂停播放所有音效
         * @example
         * //例子
         * cc.audioEngine.pauseAllEffects();
         */
        pauseAllEffects: function(){
            var ap = this._audioPool;
            for(var p in ap){
                var list = ap[p];
                for(var i=0; i<ap[p].length; i++){
                    if(list[i].getPlaying()){
                        list[i].pause();
                    }
                }
            }
        },

        /**
         * 重新播放音效
         * @param {Number} cc.Audio playEffect函数的返回值.
         * @audioID
         * // 例子
         * cc.audioEngine.resumeEffect(audioID);
         */
        resumeEffect: function(audio){
            if(audio)
                audio.resume();
        },

        /**
         * 重新播放所有音效
         * @example
         * // 例子
         * cc.audioEngine.resumeAllEffects();
         */
        resumeAllEffects: function(){
            var ap = this._audioPool;
            for(var p in ap){
                var list = ap[p];
                for(var i=0; i<ap[p].length; i++){
                    list[i].resume();
                }
            }
        },

        /**
         * 停止播放音效
         * @param {Number} cc.Audio playEffect函数的返回值.
         * @example
         * // 例子
         * cc.audioEngine.stopEffect(audioID);
         */
        stopEffect: function(audio){
            if(audio)
                audio.stop();
        },

        /**
         * 停止播放所有音效
         * @example
         * // 例子
         * cc.audioEngine.stopAllEffects();
         */
        stopAllEffects: function(){
            var ap = this._audioPool;
            for(var p in ap){
                var list = ap[p];
                for(var i=0; i<ap[p].length; i++){
                    list[i].stop();
                }
            }
        },

        /**
         * 从内部缓冲区释放预加载的音效
         * @param {String} url
         * @example
         * // 例子
         * cc.audioEngine.unloadEffect(EFFECT_FILE);
         */
        unloadEffect: function(url){
            if(!url){
                return;
            }

            cc.loader.release(url);
            var pool = this._audioPool[url];
            if(pool) pool.length = 0;
            delete this._audioPool[url];
            delete loader.cache[url];
        },

        /**
         * 结束音乐和音效
         */
        end: function(){
            this.stopMusic();
            this.stopAllEffects();
        },

        _pauseCache: [],
        _pausePlaying: function(){
            var bgMusic = this._currMusic;
            if(bgMusic && bgMusic.getPlaying()){
                bgMusic.pause();
                this._pauseCache.push(bgMusic);
            }
            var ap = this._audioPool;
            for(var p in ap){
                var list = ap[p];
                for(var i=0; i<ap[p].length; i++){
                    if(list[i].getPlaying()){
                        list[i].pause();
                        this._pauseCache.push(list[i]);
                    }
                }
            }
        },

        _resumePlaying: function(){
            var list = this._pauseCache;
            for(var i=0; i<list.length; i++){
                list[i].resume();
            }
            list.length = 0;
        }
    };

    /**
     * ome浏览器必须在页面点击
     */
    if(!SWC){

        //TODO Did not complete loading
        var reBGM = function(){
            var bg = cc.audioEngine._currMusic;
            if(
                bg &&
                bg._touch === false &&
                bg._playing
            ){
                bg._touch = true;
                bg.play(0, bg.loop);
            }

        };

        setTimeout(function(){
            if(cc._canvas){
                cc._canvas.addEventListener("touchstart", reBGM, false);
            }
        }, 0);
    }

    cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function () {
        cc.audioEngine._pausePlaying();
    });
    cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function () {
        cc.audioEngine._resumePlaying();
    });


})(cc.__audioSupport);

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
 * @constant
 * @type Number
 */
cc.TGA_OK = 0;

/**
 * @constant
 * @type Number
 */
cc.TGA_ERROR_FILE_OPEN = 1;

/**
 * @constant
 * @type Number
 */
cc.TGA_ERROR_READING_FILE = 2;

/**
 * @constant
 * @type Number
 */
cc.TGA_ERROR_INDEXED_COLOR = 3;

/**
 * @constant
 * @type Number
 */
cc.TGA_ERROR_MEMORY = 4;

/**
 * @constant
 * @type Number
 */
cc.TGA_ERROR_COMPRESSED_FILE = 5;

/**
 * TGA 格式
 * @param {Number} status
 * @param {Number} type
 * @param {Number} pixelDepth
 * @param {Number} width 地图宽度
 * @param {Number} height 地图高度
 * @param {Array} imageData 原始数据
 * @param {Number} flipped
 * @constructor
 */
cc.ImageTGA = function (status, type, pixelDepth, width, height, imageData, flipped) {
    this.status = status || 0;
    this.type = type || 0;
    this.pixelDepth = pixelDepth || 0;
    this.width = width || 0;
    this.height = height || 0;
    this.imageData = imageData || [];
    this.flipped = flipped || 0;
};

/**
 * 从数据流中读取图片的文件头.我们只保留这些
 * @param {Array} buffer
 * @param {Number} bufSize
 * @param {cc.ImageTGA} psInfo
 * @return {Boolean}
 */
cc.tgaLoadHeader = function (buffer, bufSize, psInfo) {
    var step = 2;
    if (step + 1 > bufSize)
        return false;

    var binaryReader = new cc.BinaryStreamReader(buffer);

    binaryReader.setOffset(step);
    psInfo.type = binaryReader.readByte();
    step += 10;       // . step += sizeof(unsigned char) * 2; step += sizeof(signed short) * 4;

    if (step + 4 + 1 > bufSize)
        return false;
    binaryReader.setOffset(step);
    psInfo.width = binaryReader.readUnsignedShort();
    psInfo.height = binaryReader.readUnsignedInteger();
    psInfo.pixelDepth = binaryReader.readByte();

    step += 5;      // .  step += sizeof(unsigned char);  step += sizeof(signed short) * 2;
    if (step + 1 > bufSize)
        return false;

    var garbage = binaryReader.readByte();
    psInfo.flipped = 0;
    if (garbage & 0x20)
        psInfo.flipped = 1;
    return true;
};

/**
 * 加载图片的像素数据, 不能直接去调用这个函数
 * @param {Array} buffer
 * @param {Number} bufSize
 * @param {cc.ImageTGA} psInfo
 * @return {Boolean}
 */
cc.tgaLoadImageData = function (buffer, bufSize, psInfo) {
    var mode, total, i, aux;
    var step = 18;              // .size_t step = (sizeof(unsigned char) + sizeof(signed short)) * 6;

    // mode表示每像素的组件数
    mode = 0 | (psInfo.pixelDepth / 2);
    // total表示已经读取的无符号字符数
    total = psInfo.height * psInfo.width * mode;

    if (step + total > bufSize)
        return false;

    psInfo.imageData = cc.__getSubArray(buffer, step, step + total);

    // mode=3 或 4 表示这个图片是RGB(A), 然而TGA
    // 存储的为BGR(A), 因此我们需要交换R与B的数据
    if (mode >= 3) {
        for (i = 0; i < total; i += mode) {
            aux = psInfo.imageData[i];
            psInfo.imageData[i] = psInfo.imageData[i + 2];
            psInfo.imageData[i + 2] = aux;
        }
    }
    return true;
};

/**
 * 把RGB转换成灰阶
 * @param {cc.ImageTGA} psInfo
 */
cc.tgaRGBtogreyscale = function (psInfo) {
    var i, j;

    // 如果图片已经是灰阶图则不处理
    if (psInfo.pixelDepth === 8)
        return;

    // 计算实际的组件数
    var mode = psInfo.pixelDepth / 8;

    // 分配一个存储图片数据的数组
    var newImageData = new Uint8Array(psInfo.height * psInfo.width);
    if (newImageData === null)
        return;

    // 转换像素: grayscale = o.30 * R + 0.59 * G + 0.11 * B
    for (i = 0, j = 0; j < psInfo.width * psInfo.height; i += mode, j++)
        newImageData[j] = (0.30 * psInfo.imageData[i] + 0.59 * psInfo.imageData[i + 1] + 0.11 * psInfo.imageData[i + 2]);

    // 根据新的图片类型重新分配像素深度和类型
    psInfo.pixelDepth = 8;
    psInfo.type = 3;
    // 重新分配图片数据到一个新的数组
    psInfo.imageData = newImageData;
};

/**
 * 释放图片的内存
 * @param {cc.ImageTGA} psInfo
 */
cc.tgaDestroy = function (psInfo) {
    if (!psInfo)
        return;

    psInfo.imageData = null;
    psInfo = null;
};

/**
 * 加载RLE格式图片数据
 * @param buffer
 * @param bufSize
 * @param psInfo
 * @returns {boolean}
 */
cc.tgaLoadRLEImageData = function (buffer, bufSize, psInfo) {
    var mode, total, i, index = 0 , skip = 0, flag = 0;
    var aux = [], runlength = 0;

    var step = 18;                          // . size_t step = (sizeof(unsigned char) + sizeof(signed short)) * 6;

    // mode表示每像素的组件数
    mode = psInfo.pixelDepth / 8;
    // total表示已经读取的无符号字符数
    total = psInfo.height * psInfo.width;

    for (i = 0; i < total; i++) {
        // 如果我们有一个runlength则使用
        if (runlength != 0) {
            // 更新runlength数
            runlength--;
            skip = (flag != 0);
        } else {
            // 否则读取runlength的token
            if (step + 1 > bufSize)
                break;
            runlength = buffer[step];
            step += 1;

            // 查看是否是一个RLE编码
            flag = runlength & 0x80;
            if (flag)
                runlength -= 128;
            skip = 0;
        }

        // 判断我们是否需要跳过读取这个像素
        if (!skip) {
            // 不是，则读取像素数据
            if (step + mode > bufSize)
                break;
            aux = cc.__getSubArray(buffer, step, step + mode);
            step += mode;

            // mode=3 或 4 表示这个图片是RGB(A), 然而TGA格式存储的
            // 为BGR(A),  我们需要去交换R与B的数据位
            if (mode >= 3) {
                var tmp = aux[0];
                aux[0] = aux[2];
                aux[2] = tmp;
            }
        }

        // 向图片增加像素
        for (var j = 0; j < mode; j++)
            psInfo.imageData[index + j] = aux[j];

        index += mode;
    }

    return true;
};

/**
 * ImageTGA翻转
 * @param {cc.ImageTGA} psInfo
 */
cc.tgaFlipImage = function (psInfo) {
    // mode表示每个像素的组件数
    var mode = psInfo.pixelDepth / 8;
    var rowbytes = psInfo.width * mode;

    for (var y = 0; y < (psInfo.height / 2); y++) {
        var row = cc.__getSubArray(psInfo.imageData, y * rowbytes, y * rowbytes + rowbytes);
        cc.__setDataToArray(cc.__getSubArray(psInfo.imageData, (psInfo.height - (y + 1)) * rowbytes, rowbytes), psInfo.imageData, y * rowbytes);
        cc.__setDataToArray(row, psInfo.imageData, (psInfo.height - (y + 1)) * rowbytes);
    }
    psInfo.flipped = 0;
};

cc.__getSubArray = function (array, start, end) {
    if (array instanceof  Array)
        return array.slice(start, end);
    else
        return array.subarray(start, end);
};

cc.__setDataToArray = function (sourceData, destArray, startIndex) {
    for (var i = 0; i < sourceData.length; i++)
        destArray[startIndex + i] = sourceData[i];
};

/**
 * 二进制流读取器(Reader)
 *
 * @class
 * @param binaryData
 */
cc.BinaryStreamReader = cc.Class.extend({
    _binaryData:null,
    _offset:0,

    /**
     * <p>cc.BinaryStreamReader的构造函数. <br/>
     * 当使用新的构造方式 var node = new cc.BinaryStreamReader() 时,这个函数会被自动调用 <br/>
     * 重写和扩展它的功能, 记得在扩展的ctor函数中调用this._super();</p>
     *
     * @param binaryData
     */
    ctor:function (binaryData) {
        this._binaryData = binaryData;
    },

    /**
     * 设置二进制数据
     * @param binaryData
     */
    setBinaryData:function (binaryData) {
        this._binaryData = binaryData;
        this._offset = 0;
    },

    /**
     * 获取二进制数据
     * @returns {Object}
     */
    getBinaryData:function () {
        return this._binaryData;
    },

    _checkSize:function (neededBits) {
        if (!(this._offset + Math.ceil(neededBits / 8) < this._data.length))
            throw new Error("Index out of bound");
    },

    _decodeFloat:function (precisionBits, exponentBits) {
        var length = precisionBits + exponentBits + 1;
        var size = length >> 3;
        this._checkSize(length);

        var bias = Math.pow(2, exponentBits - 1) - 1;
        var signal = this._readBits(precisionBits + exponentBits, 1, size);
        var exponent = this._readBits(precisionBits, exponentBits, size);
        var significand = 0;
        var divisor = 2;
        var curByte = 0; //length + (-precisionBits >> 3) - 1;
        do {
            var byteValue = this._readByte(++curByte, size);
            var startBit = precisionBits % 8 || 8;
            var mask = 1 << startBit;
            while (mask >>= 1) {
                if (byteValue & mask)
                    significand += 1 / divisor;
                divisor *= 2;
            }
        } while (precisionBits -= startBit);

        this._offset += size;

        return exponent == (bias << 1) + 1 ? significand ? NaN : signal ? -Infinity : +Infinity
            : (1 + signal * -2) * (exponent || significand ? !exponent ? Math.pow(2, -bias + 1) * significand
            : Math.pow(2, exponent - bias) * (1 + significand) : 0);
    },

    _readByte:function (i, size) {
        return this._data[this._offset + size - i - 1];
    },

    _decodeInt:function (bits, signed) {
        var x = this._readBits(0, bits, bits / 8), max = Math.pow(2, bits);
        var result = signed && x >= max / 2 ? x - max : x;

        this._offset += bits / 8;
        return result;
    },

    _shl:function (a, b) {
        for (++b; --b; a = ((a %= 0x7fffffff + 1) & 0x40000000) == 0x40000000 ? a * 2 : (a - 0x40000000) * 2 + 0x7fffffff + 1){};
        return a;
    },

    _readBits:function (start, length, size) {
        var offsetLeft = (start + length) % 8;
        var offsetRight = start % 8;
        var curByte = size - (start >> 3) - 1;
        var lastByte = size + (-(start + length) >> 3);
        var diff = curByte - lastByte;

        var sum = (this._readByte(curByte, size) >> offsetRight) & ((1 << (diff ? 8 - offsetRight : length)) - 1);

        if (diff && offsetLeft)
            sum += (this._readByte(lastByte++, size) & ((1 << offsetLeft) - 1)) << (diff-- << 3) - offsetRight;

        while (diff)
            sum += this._shl(this._readByte(lastByte++, size), (diff-- << 3) - offsetRight);

        return sum;
    },

    readInteger:function () {
        return this._decodeInt(32, true);
    },

    readUnsignedInteger:function () {
        return this._decodeInt(32, false);
    },

    readSingle:function () {
        return this._decodeFloat(23, 8);
    },

    readShort:function () {
        return this._decodeInt(16, true);
    },

    readUnsignedShort:function () {
        return this._decodeInt(16, false);
    },

    readByte:function () {
        var readByte = this._data[this._offset];
        this._offset += 1;
        return readByte;
    },

    readData:function (start, end) {
        if (this._binaryData instanceof Array) {
            return this._binaryData.slice(start, end);
        } else {
            //typed array
            return this._binaryData.subarray(start, end);
        }
    },

    setOffset:function (offset) {
        this._offset = offset;
    },

    getOffset:function () {
        return this._offset;
    }
});

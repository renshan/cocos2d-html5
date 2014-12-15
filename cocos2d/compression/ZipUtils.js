/*--
 Copyright 2009-2010 by Stefan Rusterholz.
 All rights reserved.
 You can choose between MIT and BSD-3-Clause license. License file will be added later.
 --*/

/**
 * mixin cc.Codec
 */
cc.Codec = {name:'Jacob__Codec'};

/**
 * 解压一个压缩的字节型数组
 * @param {Array} 输入字节型数组
 * @returns {String} 解压过的字节型字符串
 */
cc.unzip = function () {
    return cc.Codec.GZip.gunzip.apply(cc.Codec.GZip, arguments);
};

/**
 * 解压base64编码的压缩的字节型字符串
 * @param {String} 输入base64编码的字节型字符串
 * @returns {String} 解压的字节字符串
 */
cc.unzipBase64 = function () {
    var tmpInput = cc.Codec.Base64.decode.apply(cc.Codec.Base64, arguments);
    return   cc.Codec.GZip.gunzip.apply(cc.Codec.GZip, [tmpInput]);
};

/**
 * 解压base64编码的压缩的字节型字符串
 * @param {String} 输入base64编码的字节型字符串
 * @param {Number} 每一数组存储字节的个数
 * @returns {Array} 解压的字节数组
 */
cc.unzipBase64AsArray = function (input, bytes) {
    bytes = bytes || 1;

    var dec = this.unzipBase64(input),
        ar = [], i, j, len;
    for (i = 0, len = dec.length / bytes; i < len; i++) {
        ar[i] = 0;
        for (j = bytes - 1; j >= 0; --j) {
            ar[i] += dec.charCodeAt((i * bytes) + j) << (j * 8);
        }
    }
    return ar;
};

/**
 * 解压一个压缩的字节数组
 * @param {Array} 输入字节数组
 * @param {Number} 每一数组存储字节的个数
 * @returns {Array} 解压的字节数组
 */
cc.unzipAsArray = function (input, bytes) {
    bytes = bytes || 1;

    var dec = this.unzip(input),
        ar = [], i, j, len;
    for (i = 0, len = dec.length / bytes; i < len; i++) {
        ar[i] = 0;
        for (j = bytes - 1; j >= 0; --j) {
            ar[i] += dec.charCodeAt((i * bytes) + j) << (j * 8);
        }
    }
    return ar;
};

/**
 * 字符串转换数组
 * @param {String} input 
 * @returns {Array} array 
 */
cc.StringToArray = function (input) {
    var tmp = input.split(","), ar = [], i;
    for (i = 0; i < tmp.length; i++) {
        ar.push(parseInt(tmp[i]));
    }
    return ar;
};

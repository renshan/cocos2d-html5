/*--
 Copyright 2009-2010 by Stefan Rusterholz.
 All rights reserved.
 You can choose between MIT and BSD-3-Clause license. License file will be added later.
 --*/

/**
 * mixin cc.Codec.Base64
 */
cc.Codec.Base64 = {name:'Jacob__Codec__Base64'};

cc.Codec.Base64._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * <p>
 *    cc.Codec.Base64.decode(input[, unicode=false]) -> String (http://en.wikipedia.org/wiki/Base64).
 * </p>
 * @function
 * @param {String} 输入要解码的base64编码字符串
 * @return {String} 解码后的base64编码的字符串
 * @example
 * //解码字符串
 * cc.Codec.Base64.decode("U29tZSBTdHJpbmc="); // => "Some String"
 */
cc.Codec.Base64.decode = function Jacob__Codec__Base64__decode(input) {
    var output = [],
        chr1, chr2, chr3,
        enc1, enc2, enc3, enc4,
        i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        output.push(String.fromCharCode(chr1));

        if (enc3 != 64) {
            output.push(String.fromCharCode(chr2));
        }
        if (enc4 != 64) {
            output.push(String.fromCharCode(chr3));
        }
    }

    output = output.join('');

    return output;
};

/**
 * <p>
 *    将一个base64编码的输入字符串转换为整型数组，此整型数组的值为字符串解码后的字节字符
 * </p>
 * @function
 * @param {String} 输入要转换为整型数组的字符串
 * @param {Number} bytes
 * @return {Array}
 * @example
 * //将字符串解码为数组
 * var decodeArr = cc.Codec.Base64.decodeAsArray("U29tZSBTdHJpbmc=");
 */
cc.Codec.Base64.decodeAsArray = function Jacob__Codec__Base64___decodeAsArray(input, bytes) {
    var dec = this.decode(input),
        ar = [], i, j, len;
    for (i = 0, len = dec.length / bytes; i < len; i++) {
        ar[i] = 0;
        for (j = bytes - 1; j >= 0; --j) {
            ar[i] += dec.charCodeAt((i * bytes) + j) << (j * 8);
        }
    }

    return ar;
};

cc.uint8ArrayToUint32Array = function(uint8Arr){
    if(uint8Arr.length % 4 != 0)
        return null;

    var arrLen = uint8Arr.length /4;
    var retArr = window.Uint32Array? new Uint32Array(arrLen) : [];
    for(var i = 0; i < arrLen; i++){
        var offset = i * 4;
        retArr[i] = uint8Arr[offset]  + uint8Arr[offset + 1] * (1 << 8) + uint8Arr[offset + 2] * (1 << 16) + uint8Arr[offset + 3] * (1<<24);
    }
    return retArr;
};

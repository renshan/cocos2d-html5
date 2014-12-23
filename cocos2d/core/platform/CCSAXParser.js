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
 * SAX解析器
 * @class
 * @name cc.saxParser
 * @extends cc.Class
 */
cc.SAXParser = cc.Class.extend(/** @lends cc.saxParser# */{
    _parser: null,
    _isSupportDOMParser: null,

    /**
     * cc.SAXParser的构造函数
     */
    ctor: function () {
        if (window.DOMParser) {
            this._isSupportDOMParser = true;
            this._parser = new DOMParser();
        } else {
            this._isSupportDOMParser = false;
        }
    },

    /**
     * @function
     * @param {String} xmlTxt
     * @return {Document}
     */
    parse : function(xmlTxt){
        return this._parseXML(xmlTxt);
    },

    _parseXML: function (textxml) {
        // 获取请求对应xml文件的引用
        var xmlDoc;
        if (this._isSupportDOMParser) {
            xmlDoc = this._parser.parseFromString(textxml, "text/xml");
        } else {
            // IE浏览器（未测试）
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(textxml);
        }
        return xmlDoc;
    }

});

/**
 *
 * cc.plistParser是用来解析plist文件的一个单例对象
 * @class
 * @name cc.plistParser
 * @extends cc.SAXParser
 */
cc.PlistParser = cc.SAXParser.extend(/** @lends cc.plistParser# */{

    /**
     * 将一个xml字符串解析成plist对象
     * @param {String} xmlTxt plist文件的xml内容
     * @return {*} plist对象
     */
    parse : function (xmlTxt) {
        var xmlDoc = this._parseXML(xmlTxt);
        var plist = xmlDoc.documentElement;
        if (plist.tagName != 'plist')
            throw "Not a plist file!";

        // 找到第一个真正的节点(node)
        var node = null;
        for (var i = 0, len = plist.childNodes.length; i < len; i++) {
            node = plist.childNodes[i];
            if (node.nodeType == 1)
                break;
        }
        xmlDoc = null;
        return this._parseNode(node);
    },

    _parseNode: function (node) {
        var data = null, tagName = node.tagName;
        if(tagName == "dict"){
            data = this._parseDict(node);
        }else if(tagName == "array"){
            data = this._parseArray(node);
        }else if(tagName == "string"){
            if (node.childNodes.length == 1)
                data = node.firstChild.nodeValue;
            else {
                //处理Firefox对节点值(nodeValue)的4KB大小限制
                data = "";
                for (var i = 0; i < node.childNodes.length; i++)
                    data += node.childNodes[i].nodeValue;
            }
        }else if(tagName == "false"){
            data = false;
        }else if(tagName == "true"){
            data = true;
        }else if(tagName == "real"){
            data = parseFloat(node.firstChild.nodeValue);
        }else if(tagName == "integer"){
            data = parseInt(node.firstChild.nodeValue, 10);
        }
        return data;
    },

    _parseArray: function (node) {
        var data = [];
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i];
            if (child.nodeType != 1)
                continue;
            data.push(this._parseNode(child));
        }
        return data;
    },

    _parseDict: function (node) {
        var data = {};
        var key = null;
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i];
            if (child.nodeType != 1)
                continue;

            //获取并存储键，下一个节点(node)即为该键对应的值
            if (child.tagName == 'key')
                key = child.firstChild.nodeValue;
            else
                data[key] = this._parseNode(child);                 // 解析值节点(node)
        }
        return data;
    }

});
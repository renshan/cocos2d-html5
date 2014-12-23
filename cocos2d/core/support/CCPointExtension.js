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
 * <p>cc.Point 是Chipmunk引擎中cpVect文件的扩展.<br />
 * cc.Point中也可以使用原本Chipmunk中cpVect的功能</p>
 * <p>"ccp" 前缀的意思是"CoCos2d Point"</p>
 * <p> //例子:<br />  
 * - cc.pAdd( cc.p(1,1), cc.p(2,2) ); // 首选cocos2d的写法 <br /> 
 * - cc.pAdd( cc.cpv(1,1), cc.cpv(2,2) );  //这种复杂的写法也行<br />
 * - cc.pAdd( cc.p(1,1), cc.cpv(2,2) );   //chipmunk和cocos2d的混合写法(尽量避免)</p>
 */

/**
 * 设定最小值为1.0+FLT_EPSILON
 * @constant
 * @type Number
 */
cc.POINT_EPSILON = parseFloat('1.192092896e-07F');

/**
 * 返回以原点为中心对称的点
 * @param {cc.Point} point
 * @return {cc.Point}
 */
cc.pNeg = function (point) {
    return cc.p(-point.x, -point.y);
};

/**
 * 计算两点坐标的和
 * @param {cc.Point} v1
 * @param {cc.Point} v2
 * @return {cc.Point}
 */
cc.pAdd = function (v1, v2) {
    return cc.p(v1.x + v2.x, v1.y + v2.y);
};

/**
 * 计算两向量的差
 * @param {cc.Point} v1
 * @param {cc.Point} v2
 * @return {cc.Point}
 */
cc.pSub = function (v1, v2) {
    return cc.p(v1.x - v2.x, v1.y - v2.y);
};

/**
 * 返回放大n倍之后的点
 * @param {cc.Point} point
 * @param {Number} floatVar
 * @return {cc.Point}
 */
cc.pMult = function (point, floatVar) {
    return cc.p(point.x * floatVar, point.y * floatVar);
};

/**
 * 计算两点的中点
 * @param {cc.Point} v1
 * @param {cc.Point} v2
 * @return {cc.pMult}
 */
cc.pMidpoint = function (v1, v2) {
    return cc.pMult(cc.pAdd(v1, v2), 0.5);
};

/**
 * 计算两向量的点积
 * @param {cc.Point} v1
 * @param {cc.Point} v2
 * @return {Number}
 */
cc.pDot = function (v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
};

/**
 * 计算两向量的叉积
 * @param {cc.Point} v1
 * @param {cc.Point} v2
 * @return {Number}
 */
cc.pCross = function (v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
};

/**
 * 将向量v沿逆时针旋转90度 -- cross(v, perp(v)) >= 0
 * @param {cc.Point} point
 * @return {cc.Point}
 */
cc.pPerp = function (point) {
    return cc.p(-point.y, point.x);
};

/**
 * 将向量v沿顺时针旋转90度 -- cross(v, rperp(v)) <= 0
 * @param {cc.Point} point
 * @return {cc.Point}
 */
cc.pRPerp = function (point) {
    return cc.p(point.y, -point.x);
};

/**
 * 计算向量V1在向量V2上的投影点
 * @param {cc.Point} v1
 * @param {cc.Point} v2
 * @return {cc.pMult}
 */
cc.pProject = function (v1, v2) {
    return cc.pMult(v2, cc.pDot(v1, v2) / cc.pDot(v2, v2));
};

/**
 * 旋转两个点.
 *
 * @param  {cc.Point} v1
 * @param  {cc.Point} v2
 * @return {cc.Point}
 */
cc.pRotate = function (v1, v2) {
    return cc.p(v1.x * v2.x - v1.y * v2.y, v1.x * v2.y + v1.y * v2.x);
};

/**
 * 不旋转两个点.
 *
 * @param  {cc.Point} v1
 * @param  {cc.Point} v2
 * @return {cc.Point}
 */
cc.pUnrotate = function (v1, v2) {
    return cc.p(v1.x * v2.x + v1.y * v2.y, v1.y * v2.x - v1.x * v2.y);
};

/**
 * 计算一个向量的长度平方
 * @param  {cc.Point} v
 *@return {Number}
 */
cc.pLengthSQ = function (v) {
    return cc.pDot(v, v);
};

/**
 * 计算两个点之间的长度平方
 * @param {cc.Point} point1
 * @param {cc.Point} point2
 * @return {Number}
 */
cc.pDistanceSQ = function(point1, point2){
    return cc.pLengthSQ(cc.pSub(point1,point2));
};

/**
 * 计算点和原点的距离
 * @param  {cc.Point} v
 * @return {Number}
 */
cc.pLength = function (v) {
    return Math.sqrt(cc.pLengthSQ(v));
};

/**
 * 计算两点间距离
 * @param {cc.Point} v1
 * @param {cc.Point} v2
 * @return {Number}
 */
cc.pDistance = function (v1, v2) {
    return cc.pLength(cc.pSub(v1, v2));
};

/**
 * 将点的长度单位化为1
 * @param {cc.Point} v
 * @return {cc.Point}
 */
cc.pNormalize = function (v) {
    return cc.pMult(v, 1.0 / cc.pLength(v));
};

/**
 * 将弧度转换为标准化的向量
 * @param {Number} a
 * @return {cc.Point}
 */
cc.pForAngle = function (a) {
    return cc.p(Math.cos(a), Math.sin(a));
};

/**
 * 将向量转换为弧度
 * @param {cc.Point} v
 * @return {Number}
 */
cc.pToAngle = function (v) {
    return Math.atan2(v.y, v.x);
};

/**
 * 在上下界之间截取一个值
 * @param {Number} value
 * @param {Number} min_inclusive
 * @param {Number} max_inclusive
 * @return {Number}
 */
cc.clampf = function (value, min_inclusive, max_inclusive) {
    if (min_inclusive > max_inclusive) {
        var temp = min_inclusive;
        min_inclusive = max_inclusive;
        max_inclusive = temp;
    }
    return value < min_inclusive ? min_inclusive : value < max_inclusive ? value : max_inclusive;
};

/**
 * 在上下界之间截取一个点
 * @param {Point} p
 * @param {Number} min_inclusive
 * @param {Number} max_inclusive
 * @return {cc.Point}
 */
cc.pClamp = function (p, min_inclusive, max_inclusive) {
    return cc.p(cc.clampf(p.x, min_inclusive.x, max_inclusive.x), cc.clampf(p.y, min_inclusive.y, max_inclusive.y));
};

/**
 * 快速将一个cc.Size类型转换为cc.Point类型
 * @param {cc.Size} s
 * @return {cc.Point}
 */
cc.pFromSize = function (s) {
    return cc.p(s.width, s.height);
};

/**
 * 使用一个点进行数学运算 <br />
 * Math.abs, Math.fllor, Math.ceil, Math.round.
 * @param {cc.Point} p
 * @param {Function} opFunc
 * @return {cc.Point}
 * @example
 * //For example: let's try to take the floor of x,y
 * var p = cc.pCompOp(cc.p(10,10),Math.abs);
 */
cc.pCompOp = function (p, opFunc) {
    return cc.p(opFunc(p.x), opFunc(p.y));
};

/**
 * 在a、b两点间进行线性插值
 * alpha == 0 ? a
 * alpha == 1 ? b
 * otherwise a value between a..b
 * @param {cc.Point} a
 * @param {cc.Point} b
 * @param {Number} alpha
 * @return {cc.pAdd}
 */
cc.pLerp = function (a, b, alpha) {
    return cc.pAdd(cc.pMult(a, 1 - alpha), cc.pMult(b, alpha));
};

/**
 * @param {cc.Point} a
 * @param {cc.Point} b
 * @param {Number} variance  方差
 * @return {Boolean} 如果点有fuzzy equality意味着与某种方差是相等的
 */
cc.pFuzzyEqual = function (a, b, variance) {
    if (a.x - variance <= b.x && b.x <= a.x + variance) {
        if (a.y - variance <= b.y && b.y <= a.y + variance)
            return true;
    }
    return false;
};

/**
 * 计算a和b的对应值相乘
 * @param {cc.Point} a
 * @param {cc.Point} b
 * @return {cc.Point}
 */
cc.pCompMult = function (a, b) {
    return cc.p(a.x * b.x, a.y * b.y);
};

/**
 * @param {cc.Point} a
 * @param {cc.Point} b
 * @return {Number} 两向量之间的弧度(有符号)
 */
cc.pAngleSigned = function (a, b) {
    var a2 = cc.pNormalize(a);
    var b2 = cc.pNormalize(b);
    var angle = Math.atan2(a2.x * b2.y - a2.y * b2.x, cc.pDot(a2, b2));
    if (Math.abs(angle) < cc.POINT_EPSILON)
        return 0.0;
    return angle;
};

/**
 * @param {cc.Point} a
 * @param {cc.Point} b
 * @return {Number} 两向量之间的弧度(无符号)
 */
cc.pAngle = function (a, b) {
    var angle = Math.acos(cc.pDot(cc.pNormalize(a), cc.pNormalize(b)));
    if (Math.abs(angle) < cc.POINT_EPSILON) return 0.0;
    return angle;
};

/**
 * 以pivot为轴逆时针旋转angle度（单位为弧度）
 * @param {cc.Point} v v是旋转的点
 * @param {cc.Point} pivot pivot是中心轴
 * @param {Number} angle angle是顺时针旋转的弧度
 * @return {cc.Point} 旋转的点
 */
cc.pRotateByAngle = function (v, pivot, angle) {
    var r = cc.pSub(v, pivot);
    var cosa = Math.cos(angle), sina = Math.sin(angle);
    var t = r.x;
    r.x = t * cosa - r.y * sina + pivot.x;
    r.y = t * sina + r.y * cosa + pivot.y;
    return r;
};

/**
 * 一个普通的线线相交测试
 * 表明有一条线成功相交<br />
 * 注意:真正的相交测试，对于线段segments来说，我们必须确保s & t在[0..1]之间，<br />
 * 对于射线rays来说，必须确保s & t > 0<br />
 * 这个相交点是       p3 + t * (p4 - p3);<br />
 * 也可以是    p1 + s * (p2 - p1);
 * @param {cc.Point} A A是第一条线的开始点 P1 = (p1 - p2).
 * @param {cc.Point} B B是第一条线的结束点 P1 = (p1 - p2).
 * @param {cc.Point} C C是第二条线的开始点 P2 = (p3 - p4).
 * @param {cc.Point} D D是第二条线的结束点 P2 = (p3 - p4).
 * @param {cc.Point} retP retP.x is the range for a hitpoint in P1 (pa = p1 + s*(p2 - p1)), <br />
 * retP.y is the range for a hitpoint in P3 (pa = p2 + t*(p4 - p3)).
 * @return {Boolean}
 */
cc.pLineIntersect = function (A, B, C, D, retP) {
    if ((A.x == B.x && A.y == B.y) || (C.x == D.x && C.y == D.y)) {
        return false;
    }
    var BAx = B.x - A.x;
    var BAy = B.y - A.y;
    var DCx = D.x - C.x;
    var DCy = D.y - C.y;
    var ACx = A.x - C.x;
    var ACy = A.y - C.y;

    var denom = DCy * BAx - DCx * BAy;

    retP.x = DCx * ACy - DCy * ACx;
    retP.y = BAx * ACy - BAy * ACx;

    if (denom == 0) {
        if (retP.x == 0 || retP.y == 0) {
            // Lines incident
            return true;
        }
        // Lines parallel and not incident
        return false;
    }

    retP.x = retP.x / denom;
    retP.y = retP.y / denom;

    return true;
};

/**
 * 如果线段AB与CD相交ccpSegmentIntersect返回true
 * @param {cc.Point} A
 * @param {cc.Point} B
 * @param {cc.Point} C
 * @param {cc.Point} D
 * @return {Boolean}
 */
cc.pSegmentIntersect = function (A, B, C, D) {
    var retP = cc.p(0, 0);
    if (cc.pLineIntersect(A, B, C, D, retP))
        if (retP.x >= 0.0 && retP.x <= 1.0 && retP.y >= 0.0 && retP.y <= 1.0)
            return true;
    return false;
};

/**
 * ccpIntersectPoint返回AB与CD相交的点
 * @param {cc.Point} A
 * @param {cc.Point} B
 * @param {cc.Point} C
 * @param {cc.Point} D
 * @return {cc.Point}
 */
cc.pIntersectPoint = function (A, B, C, D) {
    var retP = cc.p(0, 0);

    if (cc.pLineIntersect(A, B, C, D, retP)) {
        // Point of intersection
        // 交点
        var P = cc.p(0, 0);
        P.x = A.x + retP.x * (B.x - A.x);
        P.y = A.y + retP.x * (B.y - A.y);
        return P;
    }

    return cc.p(0,0);
};

/**
 * 判断两点是否相等
 * @param {cc.Point} A A ccp a
 * @param {cc.Point} B B ccp b to be compared
 * @return {Boolean} the true if both ccp are same
 */
cc.pSameAs = function (A, B) {
    if ((A != null) && (B != null)) {
        return (A.x == B.x && A.y == B.y);
    }
    return false;
};



// High Perfomance In Place Operationrs ---------------------------------------
/**
 * 将点的位置为0
 * @param {cc.Point} v
 */
cc.pZeroIn = function(v) {
    v.x = 0;
    v.y = 0;
};

/**
 * 将v2的坐标复制给v1
 * @param {cc.Point} v1
 * @param {cc.Point} v2
 */
cc.pIn = function(v1, v2) {
    v1.x = v2.x;
    v1.y = v2.y;
};

/**
 * 使用一个因子来缩放点的坐标
 * @param {cc.Point} point
 * @param {Number} floatVar
 */
cc.pMultIn = function(point, floatVar) {
    point.x *= floatVar;
    point.y *= floatVar;
};

/**
 * v1坐标减去v2点坐标
 * @param {cc.Point} v1
 * @param {cc.Point{ v2
 */
cc.pSubIn = function(v1, v2) {
    v1.x -= v2.x;
    v1.y -= v2.y;
};

/**
 * 两向量相加(inplace)
 * @param {cc.Point} v1
 * @param {cc.point} v2
 */
cc.pAddIn = function(v1, v2) {
    v1.x += v2.x;
    v1.y += v2.y;
};

/**
 * 将点坐标规范化(inplace)
 * @param {cc.Point{ v
 */
cc.pNormalizeIn = function(v) {
    cc.pMultIn(v, 1.0 / Math.sqrt(v.x * v.x + v.y * v.y));
};


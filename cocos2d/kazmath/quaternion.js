/**
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2008, Luke Benstead.
 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.
 Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * The Quaternion class
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Number} w
 * @constructor
 */
cc.kmQuaternion = function (x, y, z, w) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = w || 0;
};

///< 将pIn的共轭(conjugate)赋值给pOut，返回pOut
cc.kmQuaternionConjugate = function (pOut, pIn) {
    pOut.x = -pIn.x;
    pOut.y = -pIn.y;
    pOut.z = -pIn.z;
    pOut.w = pIn.w;

    return pOut;
};

///< 返回两个四元数的点积
cc.kmQuaternionDot = function (q1, q2) {
    // A dot B = B dot A = AtBt + AxBx + AyBy + AzBz
    return (q1.w * q2.w +
        q1.x * q2.x +
        q1.y * q2.y +
        q1.z * q2.z);
};

///< 返回四元数的自然幂
cc.kmQuaternionExp = function (pOut, pIn) {
    //TODO 未实现
    //cc.assert(0);
    return pOut;
};

///< 将传入的四元数变为identity四元数
cc.kmQuaternionIdentity = function (pOut) {
    pOut.x = 0.0;
    pOut.y = 0.0;
    pOut.z = 0.0;
    pOut.w = 1.0;

    return pOut;
};

///< 返回传入的四元数的倒数
cc.kmQuaternionInverse = function (pOut, pIn) {
    var l = cc.kmQuaternionLength(pIn);
    var tmp = new cc.kmQuaternion();

    if (Math.abs(l) > cc.kmEpsilon) {
        pOut.x = 0.0;
        pOut.y = 0.0;
        pOut.z = 0.0;
        pOut.w = 0.0;
        return pOut;
    }

    ///获取共轭并除以长度
    cc.kmQuaternionScale(pOut,
        cc.kmQuaternionConjugate(tmp, pIn), 1.0 / l);

    return pOut;
};

///< 如果四元数是一个identity四元数则返回true
cc.kmQuaternionIsIdentity = function (pIn) {
    return (pIn.x == 0.0 && pIn.y == 0.0 && pIn.z == 0.0 &&
        pIn.w == 1.0);
};

///< 返回四元数的长度
cc.kmQuaternionLength = function (pIn) {
    return Math.sqrt(cc.kmQuaternionLengthSq(pIn));
};

///< 返回平方后四元数的长度(预防开方)
cc.kmQuaternionLengthSq = function (pIn) {
    return pIn.x * pIn.x + pIn.y * pIn.y +
        pIn.z * pIn.z + pIn.w * pIn.w;
};

///< 返回自然对数
cc.kmQuaternionLn = function (pOut, pIn) {
    /*
     单位四元数, 定义为:
     Q == (cos(theta), sin(theta) * v) where |v| = 1
     Q的自然对数为, ln(Q) = (0, theta * v)
     */
    //assert(0);
    //TODO 未实现
    return pOut;
};

///< 两个四元数相乘
cc.kmQuaternionMultiply = function (pOut, q1, q2) {
    pOut.w = q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z;
    pOut.x = q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y;
    pOut.y = q1.w * q2.y + q1.y * q2.w + q1.z * q2.x - q1.x * q2.z;
    pOut.z = q1.w * q2.z + q1.z * q2.w + q1.x * q2.y - q1.y * q2.x;

    return pOut;
};

///< 标准化一个四元数
cc.kmQuaternionNormalize = function (pOut, pIn) {
    var length = cc.kmQuaternionLength(pIn);
    if(Math.abs(length) <= cc.kmEpsilon)
        throw "cc.kmQuaternionNormalize(): pIn is an invalid value";
    cc.kmQuaternionScale(pOut, pIn, 1.0 / length);

    return pOut;
};

///< 绕一个轴旋转一个四元数
cc.kmQuaternionRotationAxis = function (pOut, pV, angle) {
    var rad = angle * 0.5;
    var scale = Math.sin(rad);

    pOut.w = Math.cos(rad);
    pOut.x = pV.x * scale;
    pOut.y = pV.y * scale;
    pOut.z = pV.z * scale;

    return pOut;
};

///< 以旋转矩阵为参数创建一个四元数
cc.kmQuaternionRotationMatrix = function (pOut, pIn) {
    /*
     注释: OPENGL矩阵是通过下述方式变换来的
     (摘自Matrix and Quaternion FAQ)

     if ( mat[0] > mat[5] && mat[0] > mat[10] )  {    // Column 0:
     S  = sqrt( 1.0 + mat[0] - mat[5] - mat[10] ) * 2;
     X = 0.25 * S;
     Y = (mat[4] + mat[1] ) / S;
     Z = (mat[2] + mat[8] ) / S;
     W = (mat[9] - mat[6] ) / S;
     } else if ( mat[5] > mat[10] ) {            // Column 1:
     S  = sqrt( 1.0 + mat[5] - mat[0] - mat[10] ) * 2;
     X = (mat[4] + mat[1] ) / S;
     Y = 0.25 * S;
     Z = (mat[9] + mat[6] ) / S;
     W = (mat[2] - mat[8] ) / S;
     } else {                        // Column 2:
     S  = sqrt( 1.0 + mat[10] - mat[0] - mat[5] ) * 2;
     X = (mat[2] + mat[8] ) / S;
     Y = (mat[9] + mat[6] ) / S;
     Z = 0.25 * S;
     W = (mat[4] - mat[1] ) / S;
     }
     */
    var x, y, z, w;
    var m4x4 = [];
    var scale = 0.0;
    var diagonal = 0.0;

    if (!pIn) {
        return null;
    }

    /*    0 3 6
     1 4 7
     2 5 8

     0 1 2 3
     4 5 6 7
     8 9 10 11
     12 13 14 15*/

    m4x4[0] = pIn.mat[0];
    m4x4[1] = pIn.mat[3];
    m4x4[2] = pIn.mat[6];
    m4x4[4] = pIn.mat[1];
    m4x4[5] = pIn.mat[4];
    m4x4[6] = pIn.mat[7];
    m4x4[8] = pIn.mat[2];
    m4x4[9] = pIn.mat[5];
    m4x4[10] = pIn.mat[8];
    m4x4[15] = 1;
    var pMatrix = m4x4[0];

    diagonal = pMatrix[0] + pMatrix[5] + pMatrix[10] + 1;

    if (diagonal > cc.kmEpsilon) {
        // 计算对角线的缩放比例
        scale = Math.sqrt(diagonal) * 2;

        // 通过各自的方程式来计算x, y, x和w
        x = ( pMatrix[9] - pMatrix[6] ) / scale;
        y = ( pMatrix[2] - pMatrix[8] ) / scale;
        z = ( pMatrix[4] - pMatrix[1] ) / scale;
        w = 0.25 * scale;
    } else {
        // if 对角线的第一个元素是最大值
        if (pMatrix[0] > pMatrix[5] && pMatrix[0] > pMatrix[10]) {
            // 根据第一个元素找到比例, 并将该值乘以二
            scale = Math.sqrt(1.0 + pMatrix[0] - pMatrix[5] - pMatrix[10]) * 2.0;

            // 通过各自的方程式来计算四元数的x, y, z和w
            x = 0.25 * scale;
            y = (pMatrix[4] + pMatrix[1] ) / scale;
            z = (pMatrix[2] + pMatrix[8] ) / scale;
            w = (pMatrix[9] - pMatrix[6] ) / scale;
        }
        // else if 第二个元素是最大值
        else if (pMatrix[5] > pMatrix[10]) {
            // 根据第二个元素找到比例, 并将该值乘以二
            scale = Math.sqrt(1.0 + pMatrix[5] - pMatrix[0] - pMatrix[10]) * 2.0;

            // 通过各自的方程式来计算四元数的x, y, z和w
            x = (pMatrix[4] + pMatrix[1] ) / scale;
            y = 0.25 * scale;
            z = (pMatrix[9] + pMatrix[6] ) / scale;
            w = (pMatrix[2] - pMatrix[8] ) / scale;
        } else {
            // else 第三个元素是最大值

            // 根据第三个元素找到比例, 并将该值乘以二
            scale = Math.sqrt(1.0 + pMatrix[10] - pMatrix[0] - pMatrix[5]) * 2.0;

            // 通过各自的方程式来计算四元数的x, y, z和w
            x = (pMatrix[2] + pMatrix[8] ) / scale;
            y = (pMatrix[9] + pMatrix[6] ) / scale;
            z = 0.25 * scale;
            w = (pMatrix[4] - pMatrix[1] ) / scale;
        }
    }

    pOut.x = x;
    pOut.y = y;
    pOut.z = z;
    pOut.w = w;

    return pOut;
};

///< 以yaw, pitch和roll为参数创建一个四元数
cc.kmQuaternionRotationYawPitchRoll = function (pOut, yaw, pitch, roll) {
    var ex, ey, ez;        // 二分之一欧拉角的临时变量   
    var cr, cp, cy, sr, sp, sy, cpcy, spsy;        // roll pitch yaw的临时变量   

    ex = cc.kmDegreesToRadians(pitch) / 2.0;    // 转换成弧度并除以2
    ey = cc.kmDegreesToRadians(yaw) / 2.0;
    ez = cc.kmDegreesToRadians(roll) / 2.0;

    cr = Math.cos(ex);
    cp = Math.cos(ey);
    cy = Math.cos(ez);

    sr = Math.sin(ex);
    sp = Math.sin(ey);
    sy = Math.sin(ez);

    cpcy = cp * cy;
    spsy = sp * sy;

    pOut.w = cr * cpcy + sr * spsy;

    pOut.x = sr * cpcy - cr * spsy;
    pOut.y = cr * sp * cy + sr * cp * sy;
    pOut.z = cr * cp * sy - sr * sp * cy;

    cc.kmQuaternionNormalize(pOut, pOut);

    return pOut;
};

///< 在两个四元数中间插值
cc.kmQuaternionSlerp = function (pOut, q1, q2, t) {
    /*float CosTheta = Q0.DotProd(Q1);
     float Theta = acosf(CosTheta);
     float SinTheta = sqrtf(1.0f-CosTheta*CosTheta);

     float Sin_T_Theta = sinf(T*Theta)/SinTheta;
     float Sin_OneMinusT_Theta = sinf((1.0f-T)*Theta)/SinTheta;

     Quaternion Result = Q0*Sin_OneMinusT_Theta;
     Result += (Q1*Sin_T_Theta);

     return Result;*/

    if (q1.x == q2.x &&
        q1.y == q2.y &&
        q1.z == q2.z &&
        q1.w == q2.w) {

        pOut.x = q1.x;
        pOut.y = q1.y;
        pOut.z = q1.z;
        pOut.w = q1.w;

        return pOut;
    }

    var ct = cc.kmQuaternionDot(q1, q2);
    var theta = Math.acos(ct);
    var st = Math.sqrt(1.0 - cc.kmSQR(ct));

    var stt = Math.sin(t * theta) / st;
    var somt = Math.sin((1.0 - t) * theta) / st;

    var temp = new cc.kmQuaternion(), temp2 = new cc.kmQuaternion();
    cc.kmQuaternionScale(temp, q1, somt);
    cc.kmQuaternionScale(temp2, q2, stt);
    cc.kmQuaternionAdd(pOut, temp, temp2);

    return pOut;
};

///< 从一个四元数中获取旋转的轴和角度
cc.kmQuaternionToAxisAngle = function (pIn, pAxis, pAngle) {
    var tempAngle;        // temp angle
    var scale;            // temp vars

    tempAngle = Math.acos(pIn.w);
    scale = Math.sqrt(cc.kmSQR(pIn.x) + cc.kmSQR(pIn.y) + cc.kmSQR(pIn.z));

    if (((scale > -cc.kmEpsilon) && scale < cc.kmEpsilon)
        || (scale < 2 * cc.kmPI + cc.kmEpsilon && scale > 2 * cc.kmPI - cc.kmEpsilon)) {       // 角度是0或者360 所以只需设轴为0,0,1 角度为0
        pAngle = 0.0;

        pAxis.x = 0.0;
        pAxis.y = 0.0;
        pAxis.z = 1.0;
    } else {
        pAngle = tempAngle * 2.0;        // 以弧度制为单位的角度

        pAxis.x = pIn.x / scale;
        pAxis.y = pIn.y / scale;
        pAxis.z = pIn.z / scale;
        cc.kmVec3Normalize(pAxis, pAxis);
    }
};

///< 缩放一个四元数
cc.kmQuaternionScale = function (pOut, pIn, s) {
    pOut.x = pIn.x * s;
    pOut.y = pIn.y * s;
    pOut.z = pIn.z * s;
    pOut.w = pIn.w * s;

    return pOut;
};

cc.kmQuaternionAssign = function (pOut, pIn) {
    pOut.x = pIn.x;
    pOut.y = pIn.y;
    pOut.z = pIn.z;
    pOut.w = pIn.w;

    return pOut;
};

cc.kmQuaternionAdd = function (pOut, pQ1, pQ2) {
    pOut.x = pQ1.x + pQ2.x;
    pOut.y = pQ1.y + pQ2.y;
    pOut.z = pQ1.z + pQ2.z;
    pOut.w = pQ1.w + pQ2.w;

    return pOut;
};

/** 改编自OGRE引擎！

 获取最短弧四元数以旋转这个向量至目标向量

 @remarks
 如果你调用这个方法传递的目标向量接近这个向量的逆向量,
 我们会绕指定的'fallbackAxis'
 (如果未指定则生成一个)旋转180度,
 这样的话，旋转的任何轴都是有效的.
 */
cc.kmQuaternionRotationBetweenVec3 = function (pOut, vec1, vec2, fallback) {
    var v1 = new cc.kmVec3(), v2 = new cc.kmVec3();
    var a;

    cc.kmVec3Assign(v1, vec1);
    cc.kmVec3Assign(v2, vec2);

    cc.kmVec3Normalize(v1, v1);
    cc.kmVec3Normalize(v2, v2);

    a = cc.kmVec3Dot(v1, v2);

    if (a >= 1.0) {
        cc.kmQuaternionIdentity(pOut);
        return pOut;
    }

    if (a < (1e-6 - 1.0)) {
        if (Math.abs(cc.kmVec3LengthSq(fallback)) < cc.kmEpsilon) {
            cc.kmQuaternionRotationAxis(pOut, fallback, cc.kmPI);
        } else {
            var axis = new cc.kmVec3();
            var X = new cc.kmVec3();
            X.x = 1.0;
            X.y = 0.0;
            X.z = 0.0;

            cc.kmVec3Cross(axis, X, vec1);

            //如果轴是0
            if (Math.abs(cc.kmVec3LengthSq(axis)) < cc.kmEpsilon) {
                var Y = new cc.kmVec3();
                Y.x = 0.0;
                Y.y = 1.0;
                Y.z = 0.0;

                cc.kmVec3Cross(axis, Y, vec1);
            }

            cc.kmVec3Normalize(axis, axis);
            cc.kmQuaternionRotationAxis(pOut, axis, cc.kmPI);
        }
    } else {
        var s = Math.sqrt((1 + a) * 2);
        var invs = 1 / s;

        var c = new cc.kmVec3();
        cc.kmVec3Cross(c, v1, v2);

        pOut.x = c.x * invs;
        pOut.y = c.y * invs;
        pOut.z = c.z * invs;
        pOut.w = s * 0.5;

        cc.kmQuaternionNormalize(pOut, pOut);
    }
    return pOut;
};

cc.kmQuaternionMultiplyVec3 = function (pOut, q, v) {
    var uv = new cc.kmVec3(), uuv = new cc.kmVec3(), qvec = new cc.kmVec3();

    qvec.x = q.x;
    qvec.y = q.y;
    qvec.z = q.z;

    cc.kmVec3Cross(uv, qvec, v);
    cc.kmVec3Cross(uuv, qvec, uv);

    cc.kmVec3Scale(uv, uv, (2.0 * q.w));
    cc.kmVec3Scale(uuv, uuv, 2.0);

    cc.kmVec3Add(pOut, v, uv);
    cc.kmVec3Add(pOut, pOut, uuv);

    return pOut;
};













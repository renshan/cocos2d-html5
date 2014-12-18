/**
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.
 Copyright (c) 2008, Luke Benstead.
 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification,
 are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice,
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
 * <p>
 4x4矩阵                               </br>    
 </br>
 mat =                                 </br>
 | 0   4   8  12 |                     </br>
 | 1   5   9  13 |                     </br>
 | 2   6  10  14 |                     </br>
 | 3   7  11  15 |
 </p>
 */
cc.kmMat4 = function () {
    this.mat = new Float32Array([0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0]);
};

/**
 * 用一个包含16个floats元素的数组的值来填充一个kmMat4结构    
 * @Params pOut - 一个指向目标矩阵的指针    
 * @Params pMat - 一个包含16个floats元素的数组    
 * @Return 返回pOut以便调用能够被嵌套    
 */
cc.kmMat4Fill = function (pOut, pMat) {
    pOut.mat[0] = pOut.mat[1] = pOut.mat[2] =pOut.mat[3] =
        pOut.mat[4] =pOut.mat[5] =pOut.mat[6] =pOut.mat[7] =
            pOut.mat[8] =pOut.mat[9] =pOut.mat[10] =pOut.mat[11] =
                pOut.mat[12] =pOut.mat[13] =pOut.mat[14] =pOut.mat[15] =pMat;
};

/**
 * 将pOut指向一个单位矩阵并返回pOut    
 * @Params pOut - 一个要指向单位矩阵的矩阵指针    
 * @Return 返回pOut以便调用能够被嵌套
 */
cc.kmMat4Identity = function (pOut) {
    pOut.mat[1] = pOut.mat[2] = pOut.mat[3]
        = pOut.mat[4] = pOut.mat[6] = pOut.mat[7]
        = pOut.mat[8] = pOut.mat[9] = pOut.mat[11]
        = pOut.mat[12] = pOut.mat[13] = pOut.mat[14] = 0;
    pOut.mat[0] = pOut.mat[5] = pOut.mat[10] = pOut.mat[15] = 1.0;
    return pOut;
};

cc.kmMat4._get = function (pIn, row, col) {
    return pIn.mat[row + 4 * col];
};

cc.kmMat4._set = function (pIn, row, col, value) {
    pIn.mat[row + 4 * col] = value;
};

cc.kmMat4._swap = function (pIn, r1, c1, r2, c2) {
    var tmp = cc.kmMat4._get(pIn, r1, c1);
    cc.kmMat4._set(pIn, r1, c1, cc.kmMat4._get(pIn, r2, c2));
    cc.kmMat4._set(pIn, r2, c2, tmp);
};

//返回上边的和下边的三角矩阵(分别为高斯算法中的L和R)
cc.kmMat4._gaussj = function (a, b) {
    var i, icol = 0, irow = 0, j, k, l, ll, n = 4, m = 4;
    var big, dum, pivinv;
    var indxc = [0, 0, 0, 0];
    var indxr = [0, 0, 0, 0];
    var ipiv = [0, 0, 0, 0];

    /*    for (j = 0; j < n; j++) {
     ipiv[j] = 0;
     }*/

    for (i = 0; i < n; i++) {
        big = 0.0;
        for (j = 0; j < n; j++) {
            if (ipiv[j] != 1) {
                for (k = 0; k < n; k++) {
                    if (ipiv[k] == 0) {
                        if (Math.abs(cc.kmMat4._get(a, j, k)) >= big) {
                            big = Math.abs(cc.kmMat4._get(a, j, k));
                            irow = j;
                            icol = k;
                        }
                    }
                }
            }
        }
        ++(ipiv[icol]);
        if (irow != icol) {
            for (l = 0; l < n; l++)
                cc.kmMat4._swap(a, irow, l, icol, l);
            for (l = 0; l < m; l++)
                cc.kmMat4._swap(b, irow, l, icol, l);
        }
        indxr[i] = irow;
        indxc[i] = icol;
        if (cc.kmMat4._get(a, icol, icol) == 0.0)
            return cc.KM_FALSE;

        pivinv = 1.0 / cc.kmMat4._get(a, icol, icol);
        cc.kmMat4._set(a, icol, icol, 1.0);
        for (l = 0; l < n; l++)
            cc.kmMat4._set(a, icol, l, cc.kmMat4._get(a, icol, l) * pivinv);

        for (l = 0; l < m; l++)
            cc.kmMat4._set(b, icol, l, cc.kmMat4._get(b, icol, l) * pivinv);

        for (ll = 0; ll < n; ll++) {
            if (ll != icol) {
                dum = cc.kmMat4._get(a, ll, icol);
                cc.kmMat4._set(a, ll, icol, 0.0);
                for (l = 0; l < n; l++)
                    cc.kmMat4._set(a, ll, l, cc.kmMat4._get(a, ll, l) - cc.kmMat4._get(a, icol, l) * dum);

                for (l = 0; l < m; l++)
                    cc.kmMat4._set(b, ll, l, cc.kmMat4._get(a, ll, l) - cc.kmMat4._get(b, icol, l) * dum);
            }
        }
    }
//    这是化简的列主循环的最后了，剩下只需要以交换列的方式来整理结果。 
//    我们以序列创建时顺序的逆序来交换两列。
    for (l = n - 1; l >= 0; l--) {
        if (indxr[l] != indxc[l]) {
            for (k = 0; k < n; k++)
                cc.kmMat4._swap(a, k, indxr[l], k, indxc[l]);
        }
    }
    return cc.KM_TRUE;
};

cc.kmMat4._identity =
    new Float32Array([1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0]);

/**
 * 计算pM的逆矩阵并将结果存储在pOut中
 * @Return 如果没有逆矩阵返回NULL，否则返回pOut
 */
cc.kmMat4Inverse = function (pOut, pM) {
    var inv = new cc.kmMat4();
    var tmp = new cc.kmMat4();

    cc.kmMat4Assign(inv, pM);
    cc.kmMat4Identity(tmp);

    if (cc.kmMat4._gaussj(inv, tmp) == cc.KM_FALSE)
        return null;

    cc.kmMat4Assign(pOut, inv);
    return pOut;
};

/**
 * 如果pIn是一个单位矩阵返回KM_TRUE，否则返回KM_FALSE
 */
cc.kmMat4IsIdentity = function (pIn) {
    for (var i = 0; i < 16; i++) {
        if (cc.kmMat4._identity[i] != pIn.mat[i])
            return false;
    }
    return true;
};

/**
 * 将pOut指向pIn的转置，并返回pOut
 */
cc.kmMat4Transpose = function (pOut, pIn) {
    var x, z, outArr = pOut.mat,inArr = pIn.mat;
    for (z = 0; z < 4; ++z) {
        for (x = 0; x < 4; ++x)
            outArr[(z * 4) + x] = inArr[(x * 4) + z];
    }
    return pOut;
};

/**
 * 将pM1乘以pM2，将结果存储在pOut中，并返回pOut
 */
cc.kmMat4Multiply = function (pOut, pM1, pM2) {
    // 缓存矩阵数据（为了大幅度提高速度！）
    var  outArray = pOut.mat;
    var a00 = pM1.mat[0], a01 = pM1.mat[1], a02 = pM1.mat[2], a03 = pM1.mat[3];
    var a10 = pM1.mat[4], a11 = pM1.mat[5], a12 = pM1.mat[6], a13 = pM1.mat[7];
    var a20 = pM1.mat[8], a21 = pM1.mat[9], a22 = pM1.mat[10], a23 = pM1.mat[11];
    var a30 = pM1.mat[12], a31 = pM1.mat[13], a32 = pM1.mat[14], a33 = pM1.mat[15];

    var b00 = pM2.mat[0], b01 = pM2.mat[1], b02 = pM2.mat[2], b03 = pM2.mat[3];
    var b10 = pM2.mat[4], b11 = pM2.mat[5], b12 = pM2.mat[6], b13 = pM2.mat[7];
    var b20 = pM2.mat[8], b21 = pM2.mat[9], b22 = pM2.mat[10], b23 = pM2.mat[11];
    var b30 = pM2.mat[12], b31 = pM2.mat[13], b32 = pM2.mat[14], b33 = pM2.mat[15];

    outArray[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
    outArray[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
    outArray[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
    outArray[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
    outArray[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
    outArray[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
    outArray[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
    outArray[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
    outArray[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
    outArray[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
    outArray[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
    outArray[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
    outArray[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
    outArray[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
    outArray[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
    outArray[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
    return pOut;
};

cc.getMat4MultiplyValue = function (pM1, pM2) {
    var m1 = pM1.mat, m2 = pM2.mat;
    var mat = new Float32Array(16);

    mat[0] = m1[0] * m2[0] + m1[4] * m2[1] + m1[8] * m2[2] + m1[12] * m2[3];
    mat[1] = m1[1] * m2[0] + m1[5] * m2[1] + m1[9] * m2[2] + m1[13] * m2[3];
    mat[2] = m1[2] * m2[0] + m1[6] * m2[1] + m1[10] * m2[2] + m1[14] * m2[3];
    mat[3] = m1[3] * m2[0] + m1[7] * m2[1] + m1[11] * m2[2] + m1[15] * m2[3];

    mat[4] = m1[0] * m2[4] + m1[4] * m2[5] + m1[8] * m2[6] + m1[12] * m2[7];
    mat[5] = m1[1] * m2[4] + m1[5] * m2[5] + m1[9] * m2[6] + m1[13] * m2[7];
    mat[6] = m1[2] * m2[4] + m1[6] * m2[5] + m1[10] * m2[6] + m1[14] * m2[7];
    mat[7] = m1[3] * m2[4] + m1[7] * m2[5] + m1[11] * m2[6] + m1[15] * m2[7];

    mat[8] = m1[0] * m2[8] + m1[4] * m2[9] + m1[8] * m2[10] + m1[12] * m2[11];
    mat[9] = m1[1] * m2[8] + m1[5] * m2[9] + m1[9] * m2[10] + m1[13] * m2[11];
    mat[10] = m1[2] * m2[8] + m1[6] * m2[9] + m1[10] * m2[10] + m1[14] * m2[11];
    mat[11] = m1[3] * m2[8] + m1[7] * m2[9] + m1[11] * m2[10] + m1[15] * m2[11];

    mat[12] = m1[0] * m2[12] + m1[4] * m2[13] + m1[8] * m2[14] + m1[12] * m2[15];
    mat[13] = m1[1] * m2[12] + m1[5] * m2[13] + m1[9] * m2[14] + m1[13] * m2[15];
    mat[14] = m1[2] * m2[12] + m1[6] * m2[13] + m1[10] * m2[14] + m1[14] * m2[15];
    mat[15] = m1[3] * m2[12] + m1[7] * m2[13] + m1[11] * m2[14] + m1[15] * m2[15];

    return mat;
};

cc.getMat4MultiplyWithMat4 = function (pM1, pM2, swapMat) {
    var m1 = pM1.mat, m2 = pM2.mat;
    var mat = swapMat.mat;

    mat[0] = m1[0] * m2[0] + m1[4] * m2[1] + m1[8] * m2[2] + m1[12] * m2[3];
    mat[1] = m1[1] * m2[0] + m1[5] * m2[1] + m1[9] * m2[2] + m1[13] * m2[3];
    mat[2] = m1[2] * m2[0] + m1[6] * m2[1] + m1[10] * m2[2] + m1[14] * m2[3];
    mat[3] = m1[3] * m2[0] + m1[7] * m2[1] + m1[11] * m2[2] + m1[15] * m2[3];

    mat[4] = m1[0] * m2[4] + m1[4] * m2[5] + m1[8] * m2[6] + m1[12] * m2[7];
    mat[5] = m1[1] * m2[4] + m1[5] * m2[5] + m1[9] * m2[6] + m1[13] * m2[7];
    mat[6] = m1[2] * m2[4] + m1[6] * m2[5] + m1[10] * m2[6] + m1[14] * m2[7];
    mat[7] = m1[3] * m2[4] + m1[7] * m2[5] + m1[11] * m2[6] + m1[15] * m2[7];

    mat[8] = m1[0] * m2[8] + m1[4] * m2[9] + m1[8] * m2[10] + m1[12] * m2[11];
    mat[9] = m1[1] * m2[8] + m1[5] * m2[9] + m1[9] * m2[10] + m1[13] * m2[11];
    mat[10] = m1[2] * m2[8] + m1[6] * m2[9] + m1[10] * m2[10] + m1[14] * m2[11];
    mat[11] = m1[3] * m2[8] + m1[7] * m2[9] + m1[11] * m2[10] + m1[15] * m2[11];

    mat[12] = m1[0] * m2[12] + m1[4] * m2[13] + m1[8] * m2[14] + m1[12] * m2[15];
    mat[13] = m1[1] * m2[12] + m1[5] * m2[13] + m1[9] * m2[14] + m1[13] * m2[15];
    mat[14] = m1[2] * m2[12] + m1[6] * m2[13] + m1[10] * m2[14] + m1[14] * m2[15];
    mat[15] = m1[3] * m2[12] + m1[7] * m2[13] + m1[11] * m2[14] + m1[15] * m2[15];

    return swapMat.mat;
};

/**
 * 将pIn赋值给pOut
 */
cc.kmMat4Assign = function (pOut, pIn) {
    if(pOut == pIn) {
        cc.log("cc.kmMat4Assign(): pOut equals pIn");
        return pOut;
    }

    var outArr = pOut.mat;
    var inArr = pIn.mat;

    outArr[0] = inArr[0];
    outArr[1] = inArr[1];
    outArr[2] = inArr[2];
    outArr[3] = inArr[3];

    outArr[4] = inArr[4];
    outArr[5] = inArr[5];
    outArr[6] = inArr[6];
    outArr[7] = inArr[7];

    outArr[8] = inArr[8];
    outArr[9] = inArr[9];
    outArr[10] = inArr[10];
    outArr[11] = inArr[11];

    outArr[12] = inArr[12];
    outArr[13] = inArr[13];
    outArr[14] = inArr[14];
    outArr[15] = inArr[15];
    return pOut;
};

/**
 * 如果两个矩阵相等返回KM_TRUE（约等于）
 */
cc.kmMat4AreEqual = function (pMat1, pMat2) {
    if(pMat1 == pMat2){
        cc.log("cc.kmMat4AreEqual(): pMat1 and pMat2 are same object.");
        return true;
    }

    for (var i = 0; i < 16; i++) {
        if (!(pMat1.mat[i] + cc.kmEpsilon > pMat2.mat[i] &&
            pMat1.mat[i] - cc.kmEpsilon < pMat2.mat[i])) {
            return false;
        }
    }
    return true;
};

/**
 * 创建一个以x轴旋转的旋转矩阵存储在pOut中，并返回pOut
 */
cc.kmMat4RotationX = function (pOut, radians) {
    /*
     |  1  0       0       0 |
     M = |  0  cos(A) -sin(A)  0 |
     |  0  sin(A)  cos(A)  0 |
     |  0  0       0       1 |

     */

    pOut.mat[0] = 1.0;
    pOut.mat[1] = 0.0;
    pOut.mat[2] = 0.0;
    pOut.mat[3] = 0.0;

    pOut.mat[4] = 0.0;
    pOut.mat[5] = Math.cos(radians);
    pOut.mat[6] = Math.sin(radians);
    pOut.mat[7] = 0.0;

    pOut.mat[8] = 0.0;
    pOut.mat[9] = -Math.sin(radians);
    pOut.mat[10] = Math.cos(radians);
    pOut.mat[11] = 0.0;

    pOut.mat[12] = 0.0;
    pOut.mat[13] = 0.0;
    pOut.mat[14] = 0.0;
    pOut.mat[15] = 1.0;

    return pOut;
};

/**
 * 创建一个以y轴旋转的旋转矩阵存储在pOut中，并返回pOut
 */
cc.kmMat4RotationY = function (pOut, radians) {
    /*
     |  cos(A)  0   sin(A)  0 |
     M = |  0       1   0       0 |
     | -sin(A)  0   cos(A)  0 |
     |  0       0   0       1 |
     */
    pOut.mat[0] = Math.cos(radians);
    pOut.mat[1] = 0.0;
    pOut.mat[2] = -Math.sin(radians);
    pOut.mat[3] = 0.0;

    pOut.mat[4] = 0.0;
    pOut.mat[5] = 1.0;
    pOut.mat[6] = 0.0;
    pOut.mat[7] = 0.0;

    pOut.mat[8] = Math.sin(radians);
    pOut.mat[9] = 0.0;
    pOut.mat[10] = Math.cos(radians);
    pOut.mat[11] = 0.0;

    pOut.mat[12] = 0.0;
    pOut.mat[13] = 0.0;
    pOut.mat[14] = 0.0;
    pOut.mat[15] = 1.0;

    return pOut;
};

/**
 * 创建一个以z轴旋转的旋转矩阵存储在pOut中，并返回pOut
 */
cc.kmMat4RotationZ = function (pOut, radians) {
    /*
     |  cos(A)  -sin(A)   0   0 |
     M = |  sin(A)   cos(A)   0   0 |
     |  0        0        1   0 |
     |  0        0        0   1 |
     */
    pOut.mat[0] = Math.cos(radians);
    pOut.mat[1] = Math.sin(radians);
    pOut.mat[2] = 0.0;
    pOut.mat[3] = 0.0;

    pOut.mat[4] = -Math.sin(radians);
    pOut.mat[5] = Math.cos(radians);
    pOut.mat[6] = 0.0;
    pOut.mat[7] = 0.0;

    pOut.mat[8] = 0.0;
    pOut.mat[9] = 0.0;
    pOut.mat[10] = 1.0;
    pOut.mat[11] = 0.0;

    pOut.mat[12] = 0.0;
    pOut.mat[13] = 0.0;
    pOut.mat[14] = 0.0;
    pOut.mat[15] = 1.0;

    return pOut;
};

/**
 * 通过pitch，yaw和roll建立一个旋转矩阵
 * 将结果存储在pOut中并返回pOut
 */
cc.kmMat4RotationPitchYawRoll = function (pOut, pitch, yaw, roll) {
    var cr = Math.cos(pitch);
    var sr = Math.sin(pitch);
    var cp = Math.cos(yaw);
    var sp = Math.sin(yaw);
    var cy = Math.cos(roll);
    var sy = Math.sin(roll);
    var srsp = sr * sp;
    var crsp = cr * sp;

    pOut.mat[0] = cp * cy;
    pOut.mat[4] = cp * sy;
    pOut.mat[8] = -sp;

    pOut.mat[1] = srsp * cy - cr * sy;
    pOut.mat[5] = srsp * sy + cr * cy;
    pOut.mat[9] = sr * cp;

    pOut.mat[2] = crsp * cy + sr * sy;
    pOut.mat[6] = crsp * sy - sr * cy;
    pOut.mat[10] = cr * cp;

    pOut.mat[3] = pOut.mat[7] = pOut.mat[11] = 0.0;
    pOut.mat[15] = 1.0;

    return pOut;
};

/** 
 * 将一个四元数(quaternion)转换成旋转矩阵
 * 将结果存储在pOut中，并返回pOut
 */
cc.kmMat4RotationQuaternion = function (pOut, pQ) {
    pOut.mat[0] = 1.0 - 2.0 * (pQ.y * pQ.y + pQ.z * pQ.z );
    pOut.mat[1] = 2.0 * (pQ.x * pQ.y + pQ.z * pQ.w);
    pOut.mat[2] = 2.0 * (pQ.x * pQ.z - pQ.y * pQ.w);
    pOut.mat[3] = 0.0;

    // Second row    第二行
    pOut.mat[4] = 2.0 * ( pQ.x * pQ.y - pQ.z * pQ.w );
    pOut.mat[5] = 1.0 - 2.0 * ( pQ.x * pQ.x + pQ.z * pQ.z );
    pOut.mat[6] = 2.0 * (pQ.z * pQ.y + pQ.x * pQ.w );
    pOut.mat[7] = 0.0;

    // Third row    第三行
    pOut.mat[8] = 2.0 * ( pQ.x * pQ.z + pQ.y * pQ.w );
    pOut.mat[9] = 2.0 * ( pQ.y * pQ.z - pQ.x * pQ.w );
    pOut.mat[10] = 1.0 - 2.0 * ( pQ.x * pQ.x + pQ.y * pQ.y );
    pOut.mat[11] = 0.0;

    // Fourth row    第四行
    pOut.mat[12] = 0;
    pOut.mat[13] = 0;
    pOut.mat[14] = 0;
    pOut.mat[15] = 1.0;

    return pOut;
};

/** 
 * 用一个3x3的旋转矩阵和一个表示平移的三维向量来建立一个4x4的OpenGL变换矩阵
 * 将结果赋值给pOut，并返回pOut
 */
cc.kmMat4RotationTranslation = function (pOut, rotation, translation) {
    pOut.mat[0] = rotation.mat[0];
    pOut.mat[1] = rotation.mat[1];
    pOut.mat[2] = rotation.mat[2];
    pOut.mat[3] = 0.0;

    pOut.mat[4] = rotation.mat[3];
    pOut.mat[5] = rotation.mat[4];
    pOut.mat[6] = rotation.mat[5];
    pOut.mat[7] = 0.0;

    pOut.mat[8] = rotation.mat[6];
    pOut.mat[9] = rotation.mat[7];
    pOut.mat[10] = rotation.mat[8];
    pOut.mat[11] = 0.0;

    pOut.mat[12] = translation.x;
    pOut.mat[13] = translation.y;
    pOut.mat[14] = translation.z;
    pOut.mat[15] = 1.0;

    return pOut;
};

/** 创建一个缩放矩阵*/
cc.kmMat4Scaling = function (pOut, x, y, z) {
    pOut.mat[0] = x;
    pOut.mat[5] = y;
    pOut.mat[10] = z;
    pOut.mat[15] = 1.0;
    pOut.mat[1] = pOut.mat[2] = pOut.mat[3] =
        pOut.mat[4] = pOut.mat[6] = pOut.mat[7] =
            pOut.mat[8] = pOut.mat[9] = pOut.mat[11] =
                pOut.mat[12] = pOut.mat[13] = pOut.mat[14] = 0;
    return pOut;
};

/**
 * 创建一个平移矩阵
 * 剩下的元素,对角线位置填1.0,其他都填0
 */
cc.kmMat4Translation = function (pOut, x, y, z) {
    //FIXME：为这玩意写个测试
    pOut.mat[0] = pOut.mat[5] = pOut.mat[10] = pOut.mat[15] = 1.0;
    pOut.mat[1] = pOut.mat[2] = pOut.mat[3] =
        pOut.mat[4] = pOut.mat[6] = pOut.mat[7] =
            pOut.mat[8] = pOut.mat[9] = pOut.mat[11] = 0.0;
    pOut.mat[12] = x;
    pOut.mat[13] = y;
    pOut.mat[14] = z;
    return pOut;
};

/**
 * 从一个矩阵中获取向上的向量
 * pIn是获取向量的矩阵
 * pOut是一个指向包含结果向量的kmVec3结构的指针
 */
cc.kmMat4GetUpVec3 = function (pOut, pIn) {
    pOut.x = pIn.mat[4];
    pOut.y = pIn.mat[5];
    pOut.z = pIn.mat[6];
    cc.kmVec3Normalize(pOut, pOut);
    return pOut;
};

/** 
 * 从4x4矩阵中提取向右的向量，将结果存入pOut，并返回pOut
 */
cc.kmMat4GetRightVec3 = function (pOut, pIn) {
    pOut.x = pIn.mat[0];
    pOut.y = pIn.mat[1];
    pOut.z = pIn.mat[2];
    cc.kmVec3Normalize(pOut, pOut);
    return pOut;
};

/**
 * 从4x4矩阵中提取向前的向量，将结果存入pOut，并返回pOut
 */
cc.kmMat4GetForwardVec3 = function (pOut, pIn) {
    pOut.x = pIn.mat[8];
    pOut.y = pIn.mat[9];
    pOut.z = pIn.mat[10];
    cc.kmVec3Normalize(pOut, pOut);
    return pOut;
};

/**
 * 用与gluPerspective相同的方法来创建一个透视投影矩阵
 */
cc.kmMat4PerspectiveProjection = function (pOut, fovY, aspect, zNear, zFar) {
    var r = cc.kmDegreesToRadians(fovY / 2);
    var deltaZ = zFar - zNear;
    var s = Math.sin(r);

    if (deltaZ == 0 || s == 0 || aspect == 0)
        return null;

    //cos(r) / sin(r) = cot(r)
    var cotangent = Math.cos(r) / s;

    cc.kmMat4Identity(pOut);
    pOut.mat[0] = cotangent / aspect;
    pOut.mat[5] = cotangent;
    pOut.mat[10] = -(zFar + zNear) / deltaZ;
    pOut.mat[11] = -1;
    pOut.mat[14] = -2 * zNear * zFar / deltaZ;
    pOut.mat[15] = 0;

    return pOut;
};

/** 用与glOrtho相同的方法来创建一个正射投影矩阵*/
cc.kmMat4OrthographicProjection = function (pOut, left, right, bottom, top, nearVal, farVal) {
    cc.kmMat4Identity(pOut);
    pOut.mat[0] = 2 / (right - left);
    pOut.mat[5] = 2 / (top - bottom);
    pOut.mat[10] = -2 / (farVal - nearVal);
    pOut.mat[12] = -((right + left) / (right - left));
    pOut.mat[13] = -((top + bottom) / (top - bottom));
    pOut.mat[14] = -((farVal + nearVal) / (farVal - nearVal));
    return pOut;
};

/**
 * 用与gluLookAt()相同的方法来创建一个平移矩阵
 * 将结果存储在pOut中，并返回pOut
 */
cc.kmMat4LookAt = function (pOut, pEye, pCenter, pUp) {
    var f = new cc.kmVec3(), up = new cc.kmVec3(), s = new cc.kmVec3(), u = new cc.kmVec3();
    var translate = new cc.kmMat4();

    cc.kmVec3Subtract(f, pCenter, pEye);
    cc.kmVec3Normalize(f, f);

    cc.kmVec3Assign(up, pUp);
    cc.kmVec3Normalize(up, up);

    cc.kmVec3Cross(s, f, up);
    cc.kmVec3Normalize(s, s);

    cc.kmVec3Cross(u, s, f);
    cc.kmVec3Normalize(s, s);

    cc.kmMat4Identity(pOut);

    pOut.mat[0] = s.x;
    pOut.mat[4] = s.y;
    pOut.mat[8] = s.z;

    pOut.mat[1] = u.x;
    pOut.mat[5] = u.y;
    pOut.mat[9] = u.z;

    pOut.mat[2] = -f.x;
    pOut.mat[6] = -f.y;
    pOut.mat[10] = -f.z;

    cc.kmMat4Translation(translate, -pEye.x, -pEye.y, -pEye.z);
    cc.kmMat4Multiply(pOut, pOut, translate);

    return pOut;
};

/**
 * 以轴和角度为参数创建一个旋转矩阵
 * 将结果存储在pOut中，并返回pOut
 */
cc.kmMat4RotationAxisAngle = function (pOut, axis, radians) {
    var rcos = Math.cos(radians);
    var rsin = Math.sin(radians);

    var normalizedAxis = new cc.kmVec3();
    cc.kmVec3Normalize(normalizedAxis, axis);

    pOut.mat[0] = rcos + normalizedAxis.x * normalizedAxis.x * (1 - rcos);
    pOut.mat[1] = normalizedAxis.z * rsin + normalizedAxis.y * normalizedAxis.x * (1 - rcos);
    pOut.mat[2] = -normalizedAxis.y * rsin + normalizedAxis.z * normalizedAxis.x * (1 - rcos);
    pOut.mat[3] = 0.0;

    pOut.mat[4] = -normalizedAxis.z * rsin + normalizedAxis.x * normalizedAxis.y * (1 - rcos);
    pOut.mat[5] = rcos + normalizedAxis.y * normalizedAxis.y * (1 - rcos);
    pOut.mat[6] = normalizedAxis.x * rsin + normalizedAxis.z * normalizedAxis.y * (1 - rcos);
    pOut.mat[7] = 0.0;

    pOut.mat[8] = normalizedAxis.y * rsin + normalizedAxis.x * normalizedAxis.z * (1 - rcos);
    pOut.mat[9] = -normalizedAxis.x * rsin + normalizedAxis.y * normalizedAxis.z * (1 - rcos);
    pOut.mat[10] = rcos + normalizedAxis.z * normalizedAxis.z * (1 - rcos);
    pOut.mat[11] = 0.0;

    pOut.mat[12] = 0.0;
    pOut.mat[13] = 0.0;
    pOut.mat[14] = 0.0;
    pOut.mat[15] = 1.0;

    return pOut;
};

/**
 * 从输入的4x4变换中提取出一个3x3的旋转矩阵
 * 将结果存储在pOut中，并返回pOut
 */
cc.kmMat4ExtractRotation = function (pOut, pIn) {
    pOut.mat[0] = pIn.mat[0];
    pOut.mat[1] = pIn.mat[1];
    pOut.mat[2] = pIn.mat[2];

    pOut.mat[3] = pIn.mat[4];
    pOut.mat[4] = pIn.mat[5];
    pOut.mat[5] = pIn.mat[6];

    pOut.mat[6] = pIn.mat[8];
    pOut.mat[7] = pIn.mat[9];
    pOut.mat[8] = pIn.mat[10];

    return pOut;
};

cc.kmMat4ExtractPlane = function (pOut, pIn, plane) {
    switch (plane) {
        case cc.KM_PLANE_RIGHT:
            pOut.a = pIn.mat[3] - pIn.mat[0];
            pOut.b = pIn.mat[7] - pIn.mat[4];
            pOut.c = pIn.mat[11] - pIn.mat[8];
            pOut.d = pIn.mat[15] - pIn.mat[12];
            break;
        case cc.KM_PLANE_LEFT:
            pOut.a = pIn.mat[3] + pIn.mat[0];
            pOut.b = pIn.mat[7] + pIn.mat[4];
            pOut.c = pIn.mat[11] + pIn.mat[8];
            pOut.d = pIn.mat[15] + pIn.mat[12];
            break;
        case cc.KM_PLANE_BOTTOM:
            pOut.a = pIn.mat[3] + pIn.mat[1];
            pOut.b = pIn.mat[7] + pIn.mat[5];
            pOut.c = pIn.mat[11] + pIn.mat[9];
            pOut.d = pIn.mat[15] + pIn.mat[13];
            break;
        case cc.KM_PLANE_TOP:
            pOut.a = pIn.mat[3] - pIn.mat[1];
            pOut.b = pIn.mat[7] - pIn.mat[5];
            pOut.c = pIn.mat[11] - pIn.mat[9];
            pOut.d = pIn.mat[15] - pIn.mat[13];
            break;
        case cc.KM_PLANE_FAR:
            pOut.a = pIn.mat[3] - pIn.mat[2];
            pOut.b = pIn.mat[7] - pIn.mat[6];
            pOut.c = pIn.mat[11] - pIn.mat[10];
            pOut.d = pIn.mat[15] - pIn.mat[14];
            break;
        case cc.KM_PLANE_NEAR:
            pOut.a = pIn.mat[3] + pIn.mat[2];
            pOut.b = pIn.mat[7] + pIn.mat[6];
            pOut.c = pIn.mat[11] + pIn.mat[10];
            pOut.d = pIn.mat[15] + pIn.mat[14];
            break;
        default:
            cc.log("cc.kmMat4ExtractPlane(): Invalid plane index");
            break;
    }

    var t = Math.sqrt(pOut.a * pOut.a +
        pOut.b * pOut.b +
        pOut.c * pOut.c);
    pOut.a /= t;
    pOut.b /= t;
    pOut.c /= t;
    pOut.d /= t;

    return pOut;
};

/**
 * 从一个4x4的变换矩阵中获取旋转变换，并以轴和角(弧度表示)的形式返回
 * 返回输出的轴
 */
cc.kmMat4RotationToAxisAngle = function (pAxis, radians, pIn) {
    /*真的没这么简单吗?*/
    var temp = new cc.kmQuaternion();
    var rotation = new cc.kmMat3();
    cc.kmMat4ExtractRotation(rotation, pIn);
    cc.kmQuaternionRotationMatrix(temp, rotation);
    cc.kmQuaternionToAxisAngle(temp, pAxis, radians);
    return pAxis;
};






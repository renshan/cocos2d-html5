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
 * 代表AABB包围盒(Axis Aligned Bounding Box、轴对齐包围盒、矩形包围盒)的结构体
 */
cc.kmAABB = function (min, max) {
    /** AABB的最小顶点*/
    this.min = min || new cc.kmVec3();
    /** AABB的最大顶点*/
    this.max = max || new cc.kmVec3();
};

/**
 * 如果点在指定的AABB内则返回KM_TRUE，否则返回KM_FALSE
 */
cc.kmAABBContainsPoint = function (pPoint, pBox) {
    if (pPoint.x >= pBox.min.x && pPoint.x <= pBox.max.x &&
        pPoint.y >= pBox.min.y && pPoint.y <= pBox.max.y &&
        pPoint.z >= pBox.min.z && pPoint.z <= pBox.max.z) {
        return cc.KM_TRUE;
    }
    return cc.KM_FALSE;
};

/**
 * 将pIn赋值给pOut并返回pOut
 */
cc.kmAABBAssign = function (pOut, pIn) {
    cc.kmVec3Assign(pOut.min, pIn.min);
    cc.kmVec3Assign(pOut.max, pIn.max);
    return pOut;
};

/**
 * 通过s来缩放pIn，将得到的结果AABB存储在pOut中，并返回pOut
 */
cc.kmAABBScale = function (pOut, pIn, s) {
    cc.log("cc.kmAABBScale hasn't been supported.");
};


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

cc.KM_GL_MODELVIEW = 0x1700;

cc.KM_GL_PROJECTION = 0x1701;

cc.KM_GL_TEXTURE = 0x1702;

cc.modelview_matrix_stack = new cc.km_mat4_stack();
cc.projection_matrix_stack = new cc.km_mat4_stack();
cc.texture_matrix_stack = new cc.km_mat4_stack();

cc.current_stack = null;

cc.initialized = false;

cc.lazyInitialize = function () {
    if (!cc.initialized) {
        var identity = new cc.kmMat4(); //Temporary identity matrix    临时恒等矩阵

        //Initialize all 3 stacks    初始化3个堆栈
        cc.km_mat4_stack_initialize(cc.modelview_matrix_stack);
        cc.km_mat4_stack_initialize(cc.projection_matrix_stack);
        cc.km_mat4_stack_initialize(cc.texture_matrix_stack);

        cc.current_stack = cc.modelview_matrix_stack;
        cc.initialized = true;
        cc.kmMat4Identity(identity);

        //Make sure that each stack has the identity matrix    确保每一个堆栈都是很等矩阵
        cc.km_mat4_stack_push(cc.modelview_matrix_stack, identity);
        cc.km_mat4_stack_push(cc.projection_matrix_stack, identity);
        cc.km_mat4_stack_push(cc.texture_matrix_stack, identity);
    }
};

cc.lazyInitialize();

cc.kmGLFreeAll = function () {
    //Clear the matrix stacks   清除矩阵堆栈
    cc.km_mat4_stack_release(cc.modelview_matrix_stack);
    cc.km_mat4_stack_release(cc.projection_matrix_stack);
    cc.km_mat4_stack_release(cc.texture_matrix_stack);

    //Delete the matrices    删除堆栈
    cc.initialized = false; //Set to uninitialized    设置为未初始化
    cc.current_stack = null; //Set the current stack to point nowhere    设置当前堆栈为空
};

cc.kmGLPushMatrix = function () {
    cc.km_mat4_stack_push(cc.current_stack, cc.current_stack.top);
};

cc.kmGLPushMatrixWitMat4 = function (saveMat) {
    cc.current_stack.stack.push(cc.current_stack.top);
    cc.kmMat4Assign(saveMat, cc.current_stack.top);
    cc.current_stack.top = saveMat;
};

cc.kmGLPopMatrix = function () {
    //No need to lazy initialize, you shouldnt be popping first anyway!    不要在初始化的时候偷懒，你无论如果都应该在第一步pop掉
    //cc.km_mat4_stack_pop(cc.current_stack, null);
    cc.current_stack.top = cc.current_stack.stack.pop();
};

cc.kmGLMatrixMode = function (mode) {
    //cc.lazyInitialize();
    switch (mode) {
        case cc.KM_GL_MODELVIEW:
            cc.current_stack = cc.modelview_matrix_stack;
            break;
        case cc.KM_GL_PROJECTION:
            cc.current_stack = cc.projection_matrix_stack;
            break;
        case cc.KM_GL_TEXTURE:
            cc.current_stack = cc.texture_matrix_stack;
            break;
        default:
            throw "Invalid matrix mode specified";   //TODO: Proper error handling    TODO:合理的错误处理
            break;
    }
};

cc.kmGLLoadIdentity = function () {
    //cc.lazyInitialize();
    cc.kmMat4Identity(cc.current_stack.top); //Replace the top matrix with the identity matrix    通过恒等矩阵替换掉顶层的矩阵
};

cc.kmGLLoadMatrix = function (pIn) {
    //cc.lazyInitialize();
    cc.kmMat4Assign(cc.current_stack.top, pIn);
};

cc.kmGLMultMatrix = function (pIn) {
    //cc.lazyInitialize();
    cc.kmMat4Multiply(cc.current_stack.top, cc.current_stack.top, pIn);
};

cc.kmGLTranslatef = function (x, y, z) {
    var translation = new cc.kmMat4();

    //Create a rotation matrix using the axis and the angle    通过坐标轴和角度来创建一个旋转矩阵
    cc.kmMat4Translation(translation, x, y, z);

    //Multiply the rotation matrix by the current matrix    多次旋转当前矩阵
    cc.kmMat4Multiply(cc.current_stack.top, cc.current_stack.top, translation);
};

cc.kmGLRotatef = function (angle, x, y, z) {
    var axis = new cc.kmVec3(x, y, z);
    var rotation = new cc.kmMat4();

    //Create a rotation matrix using the axis and the angle    通过坐标轴和角度来创建一个旋转矩阵
    cc.kmMat4RotationAxisAngle(rotation, axis, cc.kmDegreesToRadians(angle));

    //Multiply the rotation matrix by the current matrix    多次旋转当前矩阵
    cc.kmMat4Multiply(cc.current_stack.top, cc.current_stack.top, rotation);
};

cc.kmGLScalef = function (x, y, z) {
    var scaling = new cc.kmMat4();
    cc.kmMat4Scaling(scaling, x, y, z);
    cc.kmMat4Multiply(cc.current_stack.top, cc.current_stack.top, scaling);
};

cc.kmGLGetMatrix = function (mode, pOut) {
    //cc.lazyInitialize();

    switch (mode) {
        case cc.KM_GL_MODELVIEW:
            cc.kmMat4Assign(pOut, cc.modelview_matrix_stack.top);
            break;
        case cc.KM_GL_PROJECTION:
            cc.kmMat4Assign(pOut, cc.projection_matrix_stack.top);
            break;
        case cc.KM_GL_TEXTURE:
            cc.kmMat4Assign(pOut, cc.texture_matrix_stack.top);
            break;
        default:
            throw "Invalid matrix mode specified"; //TODO: Proper error handling    TODO:合理的错误处理
            break;
    }
};

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
 * 网格(grid)动作的基类
 * @class
 * @extends cc.ActionInterval
 * @param {Number} duration
 * @param {cc.Size} gridSize
 */
cc.GridAction = cc.ActionInterval.extend(/** @lends cc.GridAction# */{
    _gridSize:null,

	/**
	 * 构造函数，重写此函数去继承构造函数的方法，记得在"ctor"函数里调用"this._super()"
	 * @param {Number} duration
	 * @param {cc.Size} gridSize
	 */
    ctor:function(duration, gridSize){
        cc._checkWebGLRenderMode();
        cc.ActionInterval.prototype.ctor.call(this);
        this._gridSize = cc.size(0,0);

		gridSize && this.initWithDuration(duration, gridSize);
    },

    /**
     * 复制对象          
     * 返回action的克隆对象    
     *
     * @return {cc.Action}
     */
    clone:function(){
        var action = new cc.GridAction();
        var locGridSize = this._gridSize;
        action.initWithDuration(this._duration, cc.size(locGridSize.width, locGridSize.height));
        return action;
    },

    /**
     * 方法在action开始前调用, 操作会设置执行Action的目标对象为target.    
     *
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInterval.prototype.startWithTarget.call(this, target);
        cc.renderer.childrenOrderDirty = true;
        var newGrid = this.getGrid();
        var t = this.target;
        var targetGrid = t.grid;
        if (targetGrid && targetGrid.getReuseGrid() > 0) {
            var locGridSize = targetGrid.getGridSize();
            if (targetGrid.isActive() && (locGridSize.width == this._gridSize.width) && (locGridSize.height == this._gridSize.height))
                targetGrid.reuse();
        } else {
            if (targetGrid && targetGrid.isActive())
                targetGrid.setActive(false);
            t.grid = newGrid;
            t.grid.setActive(true);
        }
    },

    /**
     * 返回执行与本Action对象相反操作的新Action对象
     * @return {cc.ReverseTime}
     */
    reverse:function () {
        return new cc.ReverseTime(this);
    },

    /**
     * 用大小和持续时间初始化动作
     * @param {Number} duration
     * @param {cc.Size} gridSize
     * @return {Boolean}
     */
    initWithDuration:function (duration, gridSize) {
        if (cc.ActionInterval.prototype.initWithDuration.call(this, duration)) {
            this._gridSize.width = gridSize.width;
            this._gridSize.height = gridSize.height;
            return true;
        }
        return false;
    },

    /**
     * 返回网格(grid)
     * @return {cc.GridBase}
     */
    getGrid:function () {
        // 虚类需要调用          
        cc.log("cc.GridAction.getGrid(): it should be overridden in subclass.");
    }
});

/**
 * 用大小和持续时间初始化动作         
 * @function
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @return {cc.GridAction}
 */
cc.gridAction = function (duration, gridSize) {
    return new cc.GridAction(duration, gridSize);
};

/**
 * 3.0后的版本用cc.gridAction代替. <br/>              
 * 用大小和持续时间初始化动作. 
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @return {cc.GridAction}
 * @static
 * @deprecated since v3.0 <br /> Please use cc.gridAction instead.              
 */
cc.GridAction.create = cc.gridAction;

/**
 * cc.Grid3D actions的基类            
 * Grid3D actions可以定义一个多维网格.        
 * @class
 * @extends cc.GridAction
 */
cc.Grid3DAction = cc.GridAction.extend(/** @lends cc.Grid3DAction# */{

    /**
     * 返回grid               
     * @return {cc.Grid3D}
     */
    getGrid:function () {
        return new cc.Grid3D(this._gridSize);
    },

    /**
     * 返回绝对坐标系（世界坐标系）的网格顶点                        
     * @param {cc.Point} position
     * @return {cc.Vertex3F}
     */
    vertex:function (position) {
        return this.target.grid.vertex(position);
    },

    /**
     * 返回没转换的绝对坐标系（世界坐标系）网格顶点                
     * @param {cc.Point} position
     * @return {cc.Vertex3F}
     */
    originalVertex:function (position) {
        return this.target.grid.originalVertex(position);
    },

    /**
     * 设置绝对坐标系（世界坐标系）的网格顶点
     * @param {cc.Point} position
     * @param {cc.Vertex3F} vertex
     */
    setVertex:function (position, vertex) {
        this.target.grid.setVertex(position, vertex);
    }
});

/**
 * 用大小和持续时间初始化动作grid3D action
 * @function
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @return {cc.Grid3DAction}
 */
cc.grid3DAction = function (duration, gridSize) {
    return new cc.Grid3DAction(duration, gridSize);
};
/**
 * 3.0后的版本用cc.gridAction代替 <br />           
 * 用大小和持续时间初始化动作. <br />
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @return {cc.Grid3DAction}
 * @static
 * @deprecated 3.0后的版本用cc.gridAction代替  <br /> 
 */
cc.Grid3DAction.create = cc.grid3DAction;

/**
 * cc.TiledGrid3D actions的基类.               
 * @class
 * @extends cc.GridAction
 */
cc.TiledGrid3DAction = cc.GridAction.extend(/** @lends cc.TiledGrid3DAction# */{

    /**
     * 返回绝对坐标系（世界坐标系）的网格瓦片                                
     * @param {cc.Point} position
     * @return {cc.Quad3}
     */
    tile:function (position) {
        return this.target.grid.tile(position);
    },

    /**
     * 返回没转换绝对坐标系（世界坐标系）网格瓦片                 
     * @param {cc.Point} position
     * @return {cc.Quad3}
     */
    originalTile:function (position) {
        return this.target.grid.originalTile(position);
    },

    /**
     * 为绝对坐标系（世界坐标系）的网格设置一个新的瓦片              
     * @param {cc.Point} position
     * @param {cc.Quad3} coords
     */
    setTile:function (position, coords) {
        this.target.grid.setTile(position, coords);
    },

    /**
     * 返回网格                 
     * @return {cc.TiledGrid3D}
     */
    getGrid:function () {
        return new cc.TiledGrid3D(this._gridSize);
    }
});

/**
 * 用大小和持续时间初始化动作tiledGrid3DAction
 * @function
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @return {cc.TiledGrid3DAction}
 */
cc.tiledGrid3DAction = function (duration, gridSize) {
    return new cc.TiledGrid3DAction(duration, gridSize);
};

/**
 * 3.0后的版本用cc.tiledGrid3DAction代替           
 * 用大小和持续时间初始化动作tiledGrid3DAction
 * @param {Number} duration
 * @param {cc.Size} gridSize
 * @return {cc.TiledGrid3DAction}
 * @static
 * @deprecated since v3.0 <br /> Please use cc.tiledGrid3DAction instead.
 */
cc.TiledGrid3DAction.create = cc.tiledGrid3DAction;

/**
 * <p>
 * cc.StopGrid action.                                               <br/>
 * @warning 如果其他网格action还在运行，就不要调用此函数.                 <br/>              
 * 如果你想要移除网格的效果，就调用。例子：<br/>              
 * cc.sequence(Lens.action(...), cc.stopGrid(...), null);              <br/>
 * </p>
 * @class
 * @extends cc.ActionInstant
 */
cc.StopGrid = cc.ActionInstant.extend(/** @lends cc.StopGrid# */{

    /**
     * 方法在action开始前调用, 操作会设置执行Action的目标对象为target.             
     *
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInstant.prototype.startWithTarget.call(this, target);
        cc.renderer.childrenOrderDirty = true;
        var grid = this.target.grid;
        if (grid && grid.isActive())
            grid.setActive(false);
    }
});

/**
 * 分配和初始化action              
 * @function
 * @return {cc.StopGrid}
 */
cc.stopGrid = function () {
    return new cc.StopGrid();
};
/**
 * 3.0后的版本请用cc.stopGrid代替
 * 分配和初始化action          
 * @return {cc.StopGrid}
 * @static
 * @deprecated since v3.0 <br /> Please use cc.stopGrid instead.
 */
cc.StopGrid.create = cc.stopGrid;

/**
 * cc.ReuseGrid action
 * @class
 * @extends cc.ActionInstant
 * @param {Number} times
 */
cc.ReuseGrid = cc.ActionInstant.extend(/** @lends cc.ReuseGrid# */{
    _times:null,

	/**
	 * 构造函数，重写此函数去继承构造函数的方法，记得在"ctor"函数里调用"this._super()"
	 * @param {Number} times
	 */
	ctor: function(times) {
		cc.ActionInstant.prototype.ctor.call(this);
		times !== undefined && this.initWithTimes(times);
	},

    /**
     * 用次数初始化grid action，当前的grid会重新生成      
     * @param {Number} times
     * @return {Boolean}
     */
    initWithTimes:function (times) {
        this._times = times;
        return true;
    },

    /**
     * 方法在action开始前调用, 操作会设置执行Action的目标对象为target.              
     *
     * @param {cc.Node} target
     */
    startWithTarget:function (target) {
        cc.ActionInstant.prototype.startWithTarget.call(this, target);
        cc.renderer.childrenOrderDirty = true;
        if (this.target.grid && this.target.grid.isActive())
            this.target.grid.setReuseGrid(this.target.grid.getReuseGrid() + this._times);
    }
});

/**
 * 用次数创建一个action，当前grid会重新生成            
 * @function
 * @param {Number} times
 * @return {cc.ReuseGrid}
 */
cc.reuseGrid = function (times) {
    return new cc.ReuseGrid(times);
};
/**
 * 3.0后的版本请用cc.reuseGrid代替              
 * 用次数创建一个action，当前grid会重新生成             
 * @param {Number} times
 * @return {cc.ReuseGrid}
 * @static
 * @deprecated since v3.0 <br /> Please use cc.reuseGrid instead.
 */
cc.ReuseGrid.create = cc.reuseGrid;

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
cc.MENU_STATE_WAITING = 0;
/**
 * @constant
 * @type Number
 */
cc.MENU_STATE_TRACKING_TOUCH = 1;
/**
 * @constant
 * @type Number
 */
cc.MENU_HANDLER_PRIORITY = -128;
/**
 * @constant
 * @type Number
 */
cc.DEFAULT_PADDING = 5;

/**
 * <p> 特点和局限：<br/>
 *  -你可以在运行的时候使用addChild来增加MenuItem objects
 *  -但是唯一可以接受的就是MenuItem objects
 *  @class
 *  @extends cc.Layer
 *  @param {...cc.MenuItem|null} menuItems}
 *  @example
 *   var layer = new cc.Menu(menuitem1, menuitem2, menuitem3);
 */

cc.Menu = cc.Layer.extend(/** @lends cc.Menu# */{
    enabled: false,

    _selectedItem: null,
    _state: -1,
    _touchListener: null,
    _className: "Menu",

    /**
     * 重写cc.Menus的构造器来扩充他的功能，但是在使用"ctor"功能时，记得要调用"this._super()"
     *  @param {...cc.MenuItem|null} 菜单项
     */

    ctor: function (menuItems) {
        cc.Layer.prototype.ctor.call(this);
        this._color = cc.color.WHITE;
        this.enabled = false;
        this._opacity = 255;
        this._selectedItem = null;
        this._state = -1;

        this._touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this._onTouchBegan,
            onTouchMoved: this._onTouchMoved,
            onTouchEnded: this._onTouchEnded,
            onTouchCancelled: this._onTouchCancelled
        });

        if ((arguments.length > 0) && (arguments[arguments.length - 1] == null))
            cc.log("parameters should not be ending with null in Javascript");

        var argc = arguments.length, items;
        if (argc == 0) {
            items = [];
        } else if (argc == 1) {
            if (menuItems instanceof Array) {
                items = menuItems;
            }
            else items = [menuItems];
        }
        else if (argc > 1) {
            items = [];
            for (var i = 0; i < argc; i++) {
                if (arguments[i])
                    items.push(arguments[i]);
            }
        }
        this.initWithArray(items);
    },

    /**
     * <p>
     *     每次当CCMenu进入'舞台'时请求的事件回调函数                                   <br/>
     *     如果CCMenu用过渡进入到'舞台'，事件会在过渡开始时调用       <br/>
     *     在onEnter期间不可以接收其他'兄弟姐妹'节点.         <br/>
     *     如果你重载onEnter, 你必须在this._super()里调用父类的onEnter.
     * </p>
     */
    onEnter: function () {
        var locListener = this._touchListener;
        if (!locListener._isRegistered())
            cc.eventManager.addListener(locListener, this);
        cc.Node.prototype.onEnter.call(this);
    },

    /**
     * 返回这个菜单是否会接收事件
     * @return {Boolean}
     */
    isEnabled: function () {
        return this.enabled;
    },

    /**
     * 设置这个菜单是否会接收事件
     * @param {Boolean} enabled
     */
    setEnabled: function (enabled) {
        this.enabled = enabled;
    },

    /**
     * 初始化cc.Menu
     * @param {Array} args
     * @return {Boolean}
     */
    initWithItems: function (args) {
        var pArray = [];
        if (args) {
            for (var i = 0; i < args.length; i++) {
                if (args[i])
                    pArray.push(args[i]);
            }
        }

        return this.initWithArray(pArray);
    },

    /**
     * 初始化cc.Menu并赋一个cc.MenuItem对象的数组
     * @param {Array} cc.MenuItem数组
     * @return {Boolean}
     */
    initWithArray: function (arrayOfItems) {
        if (cc.Layer.prototype.init.call(this)) {
            this.enabled = true;

            // 在屏幕中间的菜单
            var winSize = cc.winSize;
            this.setPosition(winSize.width / 2, winSize.height / 2);
            this.setContentSize(winSize);
            this.setAnchorPoint(0.5, 0.5);
            this.ignoreAnchorPointForPosition(true);

            if (arrayOfItems) {
                for (var i = 0; i < arrayOfItems.length; i++)
                    this.addChild(arrayOfItems[i], i);
            }

            this._selectedItem = null;
            this._state = cc.MENU_STATE_WAITING;

            // 允许在菜单使用渐变颜色和透明度
            this.cascadeColor = true;
            this.cascadeOpacity = true;

            return true;
        }
        return false;
    },

    /**
     * 为cc.Menu添加子节点	  								
     * @param {cc.Node} child
     * @param {Number|Null} [zOrder=] 子节点的zOrder
     * @param {Number|Null} [tag=] 子节点的tag
     */
    addChild: function (child, zOrder, tag) {
        if (!(child instanceof cc.MenuItem))
            throw "cc.Menu.addChild() : Menu only supports MenuItem objects as children";
        cc.Layer.prototype.addChild.call(this, child, zOrder, tag);
    },

    /**
     * 用默认的间距垂直对齐菜单子项
     */
    alignItemsVertically: function () {
        this.alignItemsVerticallyWithPadding(cc.DEFAULT_PADDING);
    },

    /**
     * 用特定的间距垂直对齐菜单子项
     * @param {Number} padding
     */
    alignItemsVerticallyWithPadding: function (padding) {
        var height = -padding, locChildren = this._children, len, i, locScaleY, locHeight, locChild;
        if (locChildren && locChildren.length > 0) {
            for (i = 0, len = locChildren.length; i < len; i++)
                height += locChildren[i].height * locChildren[i].scaleY + padding;

            var y = height / 2.0;

            for (i = 0, len = locChildren.length; i < len; i++) {
                locChild = locChildren[i];
                locHeight = locChild.height;
                locScaleY = locChild.scaleY;
                locChild.setPosition(0, y - locHeight * locScaleY / 2);
                y -= locHeight * locScaleY + padding;
            }
        }
    },

    /**
     * 用默认的间距水平对齐菜单子项
     */
    alignItemsHorizontally: function () {
        this.alignItemsHorizontallyWithPadding(cc.DEFAULT_PADDING);
    },

    /**
     * 用特定的间距水平对齐菜单子项
     * @param {Number} padding
     */
    alignItemsHorizontallyWithPadding: function (padding) {
        var width = -padding, locChildren = this._children, i, len, locScaleX, locWidth, locChild;
        if (locChildren && locChildren.length > 0) {
            for (i = 0, len = locChildren.length; i < len; i++)
                width += locChildren[i].width * locChildren[i].scaleX + padding;

            var x = -width / 2.0;

            for (i = 0, len = locChildren.length; i < len; i++) {
                locChild = locChildren[i];
                locScaleX = locChild.scaleX;
                locWidth = locChildren[i].width;
                locChild.setPosition(x + locWidth * locScaleX / 2, 0);
                x += locWidth * locScaleX + padding;
            }
        }
    },

    /**
     * 菜单子项列对齐
     * @example
     * // 示例
     * menu.alignItemsInColumns(3,2,3)// 添加三列, 第一列和第三列三个子菜单项, 第二列两个子菜单项
     *
     * menu.alignItemsInColumns(3,3)//创建两列，各有三个子菜单项
    alignItemsInColumns: function (/*Multiple Arguments*/) {
        if ((arguments.length > 0) && (arguments[arguments.length - 1] == null))
            cc.log("parameters should not be ending with null in Javascript");

        var rows = [];
        for (var i = 0; i < arguments.length; i++) {
            rows.push(arguments[i]);
        }
        var height = -5;
        var row = 0;
        var rowHeight = 0;
        var columnsOccupied = 0;
        var rowColumns, tmp, len;
        var locChildren = this._children;
        if (locChildren && locChildren.length > 0) {
            for (i = 0, len = locChildren.length; i < len; i++) {
                if (row >= rows.length)
                    continue;

                rowColumns = rows[row];
                // 一行中不能没有列数
                if (!rowColumns)
                    continue;

                tmp = locChildren[i].height;
                rowHeight = ((rowHeight >= tmp || isNaN(tmp)) ? rowHeight : tmp);

                ++columnsOccupied;
                if (columnsOccupied >= rowColumns) {
                    height += rowHeight + 5;

                    columnsOccupied = 0;
                    rowHeight = 0;
                    ++row;
                }
            }
        }
        // 检查是否有过多的行数/列数
        //cc.assert(!columnsOccupied, "");  
        var winSize = cc.director.getWinSize();

        row = 0;
        rowHeight = 0;
        rowColumns = 0;
        var w = 0.0;
        var x = 0.0;
        var y = (height / 2);

        if (locChildren && locChildren.length > 0) {
            for (i = 0, len = locChildren.length; i < len; i++) {
                var child = locChildren[i];
                if (rowColumns == 0) {
                    rowColumns = rows[row];
                    w = winSize.width / (1 + rowColumns);
                    x = w;
                }

                tmp = child._getHeight();
                rowHeight = ((rowHeight >= tmp || isNaN(tmp)) ? rowHeight : tmp);
                child.setPosition(x - winSize.width / 2, y - tmp / 2);

                x += w;
                ++columnsOccupied;

                if (columnsOccupied >= rowColumns) {
                    y -= rowHeight + 5;
                    columnsOccupied = 0;
                    rowColumns = 0;
                    rowHeight = 0;
                    ++row;
                }
            }
        }
    },
    /**
     * 菜单项行对齐
     * @param {Number}
     * @example
     * // 示例
     * menu.alignItemsInRows(5,3)//对其两行菜单项, 第一行有五个菜单项, 第二行有三个
     *
     * menu.alignItemsInRows(4,4,4,4)//创建四行，每行有四个菜单项
     */
    alignItemsInRows: function (/*Multiple arguments*/) {
        if ((arguments.length > 0) && (arguments[arguments.length - 1] == null))
            cc.log("parameters should not be ending with null in Javascript");
        var columns = [], i;
        for (i = 0; i < arguments.length; i++) {
            columns.push(arguments[i]);
        }
        var columnWidths = [];
        var columnHeights = [];

        var width = -10;
        var columnHeight = -5;
        var column = 0;
        var columnWidth = 0;
        var rowsOccupied = 0;
        var columnRows, child, len, tmp;

        var locChildren = this._children;
        if (locChildren && locChildren.length > 0) {
            for (i = 0, len = locChildren.length; i < len; i++) {
                child = locChildren[i];
                // 检查是否有过量的行数/列数
                if (column >= columns.length)
                    continue;

                columnRows = columns[column];
                // 每列不可以没有行数
                if (!columnRows)
                    continue;

                // columnWidth = fmaxf(columnWidth, [item contentSize].width);
                tmp = child.width;
                columnWidth = ((columnWidth >= tmp || isNaN(tmp)) ? columnWidth : tmp);

                columnHeight += (child.height + 5);
                ++rowsOccupied;

                if (rowsOccupied >= columnRows) {
                    columnWidths.push(columnWidth);
                    columnHeights.push(columnHeight);
                    width += columnWidth + 10;

                    rowsOccupied = 0;
                    columnWidth = 0;
                    columnHeight = -5;
                    ++column;
                }
            }
        }
        // 检查是否有超过允许值的行数/列数.
        //cc.assert(!rowsOccupied, "");
        var winSize = cc.director.getWinSize();

        column = 0;
        columnWidth = 0;
        columnRows = 0;
        var x = -width / 2;
        var y = 0.0;

        if (locChildren && locChildren.length > 0) {
            for (i = 0, len = locChildren.length; i < len; i++) {
                child = locChildren[i];
                if (columnRows == 0) {
                    columnRows = columns[column];
                    y = columnHeights[column];
                }

                // columnWidth = fmaxf(columnWidth, [item contentSize].width);
                tmp = child._getWidth();
                columnWidth = ((columnWidth >= tmp || isNaN(tmp)) ? columnWidth : tmp);

                child.setPosition(x + columnWidths[column] / 2, y - winSize.height / 2);

                y -= child.height + 10;
                ++rowsOccupied;

                if (rowsOccupied >= columnRows) {
                    x += columnWidth + 5;
                    rowsOccupied = 0;
                    columnRows = 0;
                    columnWidth = 0;
                    ++column;
                }
            }
        }
    },

    /**
     * 从cc.Menu一出一个子节点
     * @param {cc.Node} child 你想要移除的子节点
     * @param {boolean} cleanup 是否清理内存
     */
    removeChild: function (child, cleanup) {
        if (child == null)
            return;
        if (!(child instanceof cc.MenuItem)) {
            cc.log("cc.Menu.removeChild():Menu only supports MenuItem objects as children");
            return;
        }

        if (this._selectedItem == child)
            this._selectedItem = null;
        cc.Node.prototype.removeChild.call(this, child, cleanup);
    },

    _onTouchBegan: function (touch, event) {
        var target = event.getCurrentTarget();
        if (target._state != cc.MENU_STATE_WAITING || !target._visible || !target.enabled)
            return false;

        for (var c = target.parent; c != null; c = c.parent) {
            if (!c.isVisible())
                return false;
        }

        target._selectedItem = target._itemForTouch(touch);
        if (target._selectedItem) {
            target._state = cc.MENU_STATE_TRACKING_TOUCH;
            target._selectedItem.selected();
            return true;
        }
        return false;
    },

    _onTouchEnded: function (touch, event) {
        var target = event.getCurrentTarget();
        if (target._state !== cc.MENU_STATE_TRACKING_TOUCH) {
            cc.log("cc.Menu.onTouchEnded(): invalid state");
            return;
        }
        if (target._selectedItem) {
            target._selectedItem.unselected();
            target._selectedItem.activate();
        }
        target._state = cc.MENU_STATE_WAITING;
    },

    _onTouchCancelled: function (touch, event) {
        var target = event.getCurrentTarget();
        if (target._state !== cc.MENU_STATE_TRACKING_TOUCH) {
            cc.log("cc.Menu.onTouchCancelled(): invalid state");
            return;
        }
        if (this._selectedItem)
            target._selectedItem.unselected();
        target._state = cc.MENU_STATE_WAITING;
    },

    _onTouchMoved: function (touch, event) {
        var target = event.getCurrentTarget();
        if (target._state !== cc.MENU_STATE_TRACKING_TOUCH) {
            cc.log("cc.Menu.onTouchMoved(): invalid state");
            return;
        }
        var currentItem = target._itemForTouch(touch);
        if (currentItem != target._selectedItem) {
            if (target._selectedItem)
                target._selectedItem.unselected();
            target._selectedItem = currentItem;
            if (target._selectedItem)
                target._selectedItem.selected();
        }
    },

    /**
     * <p>
     * 每次cc.Menu离开'舞台'时调用的回调函数.                                         <br/>
     * 如果cc.Menu用过渡离开'舞台', 会在过渡开始时进行调用. <br/>
     * 在onExit期间， 不可以获取兄弟姐妹节点.                   @return {Boolean}                                          <br/>
     * 如果重载onExit, 你应该在调用this._super()里父类的onExit.
     * </p>
     */
    onExit: function () {
        if (this._state == cc.MENU_STATE_TRACKING_TOUCH) {
            if (this._selectedItem) {
                this._selectedItem.unselected();
                this._selectedItem = null;
            }
            this._state = cc.MENU_STATE_WAITING;
        }
        cc.Node.prototype.onExit.call(this);
    },
    /**
     * 只能在jsbinding使用
     * @param value
     */
    setOpacityModifyRGB: function (value) {
    },
    /**
     * 只能在jsbinding使用
     * @returns {boolean}
     */
    isOpacityModifyRGB: function () {
        return false;
    },

    _itemForTouch: function (touch) {
        var touchLocation = touch.getLocation();
        var itemChildren = this._children, locItemChild;
        if (itemChildren && itemChildren.length > 0) {
            for (var i = itemChildren.length - 1; i >= 0; i--) {
                locItemChild = itemChildren[i];
                if (locItemChild.isVisible() && locItemChild.isEnabled()) {
                    var local = locItemChild.convertToNodeSpace(touchLocation);
                    var r = locItemChild.rect();
                    r.x = 0;
                    r.y = 0;
                    if (cc.rectContainsPoint(r, local))
                        return locItemChild;
                }
            }
        }
        return null;
    }
});

var _p = cc.Menu.prototype;

// @return {cc.Menu}增加的属性
/** @expose */
_p.enabled;

/**
 * 产生一个新的菜单
 * @deprecated 从3.0版本后，请使用新的cc.Menu来产生一个新的菜单
 * @param {...cc.MenuItem|null} menuItems	      todo: 需要使用新的
 * @return {cc.Menu}
 */
cc.Menu.create = function (menuItems) {
    var argc = arguments.length;
    if ((argc > 0) && (arguments[argc - 1] == null))
        cc.log("parameters should not be ending with null in Javascript");

    var ret;
    if (argc == 0)
        ret = new cc.Menu();
    else if (argc == 1)
        ret = new cc.Menu(menuItems);
    else
        ret = new cc.Menu(Array.prototype.slice.call(arguments, 0));
    return ret;
};

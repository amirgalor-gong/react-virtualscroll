"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var style = {
    host: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        overflowY: 'auto',
        position: 'relative',
        WebkitOverflowScrolling: 'touch'
    },
    content: {
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        position: 'absolute'
    }
};
var VirtualScroll = /** @class */ (function (_super) {
    __extends(VirtualScroll, _super);
    function VirtualScroll(props) {
        var _this = _super.call(this, props) || this;
        _this.startupLoop = true;
        _this.state = { scrollHeight: 0 };
        return _this;
    }
    VirtualScroll.prototype.componentDidMount = function () {
        this.onScrollListener = this.el.addEventListener('scroll', this.refresh.bind(this));
        this.refresh();
    };
    VirtualScroll.prototype.componentWillReceiveProps = function (props) {
        if (props.items !== this.props.items) {
            this.previousStart = undefined;
            this.previousEnd = undefined;
        }
        this.refresh();
    };
    VirtualScroll.prototype.componentWillUnmount = function () {
        if (this.onScrollListener !== undefined) {
            this.onScrollListener();
        }
    };
    VirtualScroll.prototype.render = function () {
        var _this = this;
        return React.createElement("div", { ref: function (el) { return _this.el = el; }, style: style.host },
            React.createElement("div", { className: "total-padding", style: { opacity: 0, width: 0, height: this.state.scrollHeight + "px" } }),
            React.createElement("div", { ref: function (el) { return _this.content = el; }, className: this.props.className, style: Object.assign({}, style.content, { transform: "translateY(" + this.state.topPadding + "px)" }) }, (this.state.items || []).map(this.props.renderItem)));
    };
    VirtualScroll.prototype.refresh = function () {
        var _this = this;
        requestAnimationFrame(function () { return _this.calculateItems(); });
    };
    VirtualScroll.prototype.scrollInto = function (item) {
        var index = (this.props.items || []).indexOf(item);
        if (index < 0 || index >= (this.props.items || []).length)
            return;
        var d = this.calculateDimensions();
        this.el.scrollTop = Math.floor(index / d.itemsPerRow) *
            d.childHeight - Math.max(0, (d.itemsPerCol - 1)) * d.childHeight;
        this.refresh();
    };
    VirtualScroll.prototype.countItemsPerRow = function () {
        var offsetTop;
        var itemsPerRow;
        var children = this.content.children;
        for (itemsPerRow = 0; itemsPerRow < children.length; itemsPerRow++) {
            if (offsetTop != undefined && offsetTop !== children[itemsPerRow].offsetTop)
                break;
            offsetTop = children[itemsPerRow].offsetTop;
        }
        return itemsPerRow;
    };
    VirtualScroll.prototype.calculateDimensions = function () {
        var items = this.props.items || [];
        var itemCount = items.length;
        var viewWidth = this.el.clientWidth - (this.props.scrollbarWidth || 0);
        var viewHeight = this.el.clientHeight - (this.props.scrollbarHeight || 0);
        var contentDimensions;
        if (this.props.childWidth == undefined || this.props.childHeight == undefined) {
            contentDimensions = this.content.children[0] ? this.content.children[0].getBoundingClientRect() : {
                width: viewWidth,
                height: viewHeight
            };
        }
        var childWidth = this.props.childWidth || contentDimensions.width;
        var childHeight = this.props.childHeight || contentDimensions.height;
        var itemsPerRow = Math.max(1, this.countItemsPerRow());
        var itemsPerRowByCalc = Math.max(1, Math.floor(viewWidth / childWidth));
        var itemsPerCol = Math.max(1, Math.floor(viewHeight / childHeight));
        var scrollTop = Math.max(0, this.el.scrollTop);
        if (itemsPerCol === 1 && Math.floor(scrollTop / this.state.scrollHeight * itemCount) + itemsPerRowByCalc >= itemCount) {
            itemsPerRow = itemsPerRowByCalc;
        }
        return {
            itemCount: itemCount,
            viewWidth: viewWidth,
            viewHeight: viewHeight,
            childWidth: childWidth,
            childHeight: childHeight,
            itemsPerRow: itemsPerRow,
            itemsPerCol: itemsPerCol,
            itemsPerRowByCalc: itemsPerRowByCalc
        };
    };
    VirtualScroll.prototype.calculateItems = function () {
        var d = this.calculateDimensions();
        var items = this.props.items || [];
        var scrollHeight = d.childHeight * d.itemCount / d.itemsPerRow;
        if (this.el.scrollTop > scrollHeight) {
            this.el.scrollTop = scrollHeight;
        }
        var scrollTop = Math.max(0, this.el.scrollTop);
        var indexByScrollTop = scrollTop / scrollHeight * d.itemCount / d.itemsPerRow;
        var end = Math.min(d.itemCount, Math.ceil(indexByScrollTop) * d.itemsPerRow + d.itemsPerRow * (d.itemsPerCol + 1));
        var maxStartEnd = end;
        var modEnd = end % d.itemsPerRow;
        if (modEnd) {
            maxStartEnd = end + d.itemsPerRow - modEnd;
        }
        var maxStart = Math.max(0, maxStartEnd - d.itemsPerCol * d.itemsPerRow - d.itemsPerRow);
        var start = Math.min(maxStart, Math.floor(indexByScrollTop) * d.itemsPerRow);
        var topPadding = d.childHeight * Math.ceil(start / d.itemsPerRow);
        this.setState({ topPadding: topPadding, scrollHeight: scrollHeight });
        start = !isNaN(start) ? start : 0;
        end = !isNaN(end) ? end : 0;
        if (start !== this.previousStart || end !== this.previousEnd) {
            // update the scroll list
            if (typeof this.props.renderItem === 'function') {
                var scrollItems = items.slice(start, end);
                this.setState({ items: scrollItems });
                if (typeof this.props.onUpdate === 'function') {
                    this.props.onUpdate(scrollItems);
                }
            }
            // emit 'start' event
            if (typeof this.props.onStart === 'function') {
                if (start !== this.previousStart && this.startupLoop === false) {
                    this.props.onStart({ start: start, end: end });
                }
            }
            // emit 'end' event
            if (typeof this.props.onEnd === 'function') {
                if (end !== this.previousEnd && this.startupLoop === false) {
                    this.props.onEnd({ start: start, end: end });
                }
            }
            this.previousStart = start;
            this.previousEnd = end;
            if (this.startupLoop === true) {
                this.refresh();
            }
            else {
                if (typeof this.props.onChange === 'function') {
                    this.props.onChange({ start: start, end: end });
                }
            }
        }
        else if (this.startupLoop === true) {
            this.startupLoop = false;
            if (typeof this.props.onChange === 'function') {
                this.props.onChange({ start: start, end: end });
            }
            this.refresh();
        }
    };
    return VirtualScroll;
}(React.Component));
exports.VirtualScroll = VirtualScroll;
//# sourceMappingURL=virtual-scroll.js.map
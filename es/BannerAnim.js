import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _extends from 'babel-runtime/helpers/extends';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _createClass from 'babel-runtime/helpers/createClass';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { ticker } from 'rc-tween-one';
import Arrow from './Arrow';
import Thumb from './Thumb';
import { toArrayChildren, dataToArray } from './utils';
import animType from './anim';

var BannerAnim = function (_Component) {
  _inherits(BannerAnim, _Component);

  _createClass(BannerAnim, null, [{
    key: 'getDerivedStateFromProps',
    value: function getDerivedStateFromProps(props, _ref) {
      var prevProps = _ref.prevProps,
          $self = _ref.$self;

      var nextState = {
        prevProps: props
      };
      if (prevProps && props !== prevProps) {
        $self.tweenBool = false;
      }
      return nextState; // eslint-disable-line
    }
  }]);

  function BannerAnim(props) {
    _classCallCheck(this, BannerAnim);

    var _this = _possibleConstructorReturn(this, (BannerAnim.__proto__ || Object.getPrototypeOf(BannerAnim)).call(this, props));

    _this.onMouseEnter = function (e) {
      _this.props.onMouseEnter(e);
      if (_this.props.autoPlay && _this.props.autoPlayEffect) {
        ticker.clear(_this.autoPlayId);
        _this.autoPlayId = -1;
      }
    };

    _this.onMouseLeave = function (e) {
      _this.props.onMouseLeave(e);
      if (_this.props.autoPlay && _this.props.autoPlayEffect) {
        _this.autoPlay();
      }
    };

    _this.onTouchStart = function (e) {
      if (e.touches && e.touches.length > 1 || _this.elemWrapper.length <= 1 || _this.getDomIsArrowOrThumb(e) || e.button === 2 || _this.tweenBool) {
        return;
      }
      if (_this.props.autoPlay) {
        ticker.clear(_this.autoPlayId);
        _this.autoPlayId = -1;
      }
      _this.animType = _this.getAnimType(_this.props.type);
      _this.currentShow = _this.state.currentShow;
      // this.mouseMoveType = 'start';
      _this.mouseStartXY = {
        startX: e.touches === undefined ? e.clientX : e.touches[0].clientX,
        startY: e.touches === undefined ? e.clientY : e.touches[0].clientY
      };
    };

    _this.onTouchMove = function (e) {
      if (!_this.mouseStartXY || e.touches && e.touches.length > 1 || _this.tweenBool) {
        return;
      }

      var _this$getDiffer = _this.getDiffer(e, e.touches),
          differ = _this$getDiffer.differ,
          rectName = _this$getDiffer.rectName;

      if (!differ) {
        return;
      }
      var ratio = differ / _this.state.domRect[rectName] * 2;
      var ratioType = ratio < 0 ? '+' : '-';
      var currentShow = _this.currentShow;
      _this.mouseMoveType = 'update';
      if (_this.ratioType !== ratioType) {
        _this.ratioType = ratioType;
        _this.mouseMoveType = 'reChild';
        _this.setState({
          currentShow: currentShow
        });
        return;
      }
      if ((_this.animType === animType.gridBar || _this.animType === animType.grid) && e.touches) {
        return;
      }
      _this.ratio = ratio;
      if (_this.ratio) {
        var type = void 0;
        if (_this.ratio < 0) {
          currentShow += 1;
          type = 'next';
        } else {
          currentShow -= 1;
          type = 'prev';
        }
        _this.ratio = Math.abs(_this.ratio);
        _this.ratio = _this.ratio > 0.99 ? 0.99 : _this.ratio;
        currentShow = currentShow >= _this.elemWrapper.length ? 0 : currentShow;
        currentShow = currentShow < 0 ? _this.elemWrapper.length - 1 : currentShow;
        _this.setState({
          currentShow: currentShow,
          direction: type
        });
      }
    };

    _this.onTouchEnd = function (e) {
      if (!_this.mouseStartXY || e.changedTouches && e.changedTouches.length > 1 || _this.tweenBool) {
        return;
      }
      if (_this.props.autoPlay && _this.autoPlayId === -1) {
        _this.autoPlay();
      }

      var _this$getDiffer2 = _this.getDiffer(e, e.changedTouches),
          differ = _this$getDiffer2.differ,
          rectName = _this$getDiffer2.rectName;

      _this.mouseStartXY = undefined;
      _this.mouseMoveType = 'end';
      if (!differ) {
        _this.mouseMoveType = '';
        return;
      }
      if ((_this.animType === animType.gridBar || _this.animType === animType.grid) && e.changedTouches) {
        var currentShow = _this.currentShow;
        var ratio = differ / _this.state.domRect[rectName] * 2;
        if (ratio < 0) {
          currentShow += 1;
        } else {
          currentShow -= 1;
        }
        currentShow = currentShow >= _this.elemWrapper.length ? 0 : currentShow;
        currentShow = currentShow < 0 ? _this.elemWrapper.length - 1 : currentShow;
        _this.ratio = 0;
        _this.mouseMoveType = '';
        _this.slickGoTo(currentShow, true);
        _this.tweenBool = true;
        return;
      }

      if (_this.ratio > 0.3) {
        _this.forceUpdate(function () {
          _this.ratio = 0;
          _this.mouseMoveType = '';
        });
      } else {
        _this.setState({
          currentShow: _this.currentShow,
          direction: _this.ratioType === '+' ? 'prev' : 'next'
        }, function () {
          _this.ratio = 0;
          _this.mouseMoveType = '';
        });
      }
    };

    _this.getDiffer = function (e, touches) {
      var currentX = touches === undefined ? e.clientX : touches[0].clientX;
      var currentY = touches === undefined ? e.clientY : touches[0].clientY;
      var differX = currentX - _this.mouseStartXY.startX;
      var differY = currentY - _this.mouseStartXY.startY;
      var differ = Math.max(Math.abs(differX), Math.abs(differY));
      differ = differ === Math.abs(differX) ? differX : differY;
      return {
        differ: differ,
        rectName: differ === differX ? 'width' : 'height'
      };
    };

    _this.getDomIsArrowOrThumb = function (e) {
      var arrowClassName = e.target.className;
      var thumbClassName = e.target.parentNode.className;
      if (arrowClassName.indexOf('banner-anim-arrow') >= 0 || thumbClassName.indexOf('banner-anim-thumb') >= 0) {
        return true;
      }
      return false;
    };

    _this.getRenderChildren = function (children) {
      var elem = [];
      var arrow = [];
      var thumb = void 0;
      var elementKeyNum = 0;
      var thumbKeyNum = 0;

      toArrayChildren(children).forEach(function (item, i) {
        if (!item) {
          return;
        }
        var itemProps = _extends({}, item.props);
        if (item.type.isBannerAnimElement) {
          itemProps.key = item.key || 'element-' + elementKeyNum;
          elementKeyNum += 1;
          itemProps.callBack = _this.animEnd;
          itemProps.show = _this.state.currentShow === i;
          itemProps.animType = _this.animType;
          itemProps.duration = _this.props.duration;
          itemProps.delay = _this.props.delay;
          itemProps.ease = _this.props.ease;
          itemProps.sync = _this.props.sync || itemProps.sync;
          itemProps.elemOffset = {
            top: _this.state.domRect.top,
            width: _this.state.domRect.width,
            height: _this.state.domRect.height
          };
          itemProps.direction = _this.state.direction;
          itemProps.ratio = _this.ratio;
          itemProps.mouseMoveType = _this.mouseMoveType;
          elem.push(React.cloneElement(item, itemProps));
        } else if (item.type.isBannerAnimArrow) {
          itemProps.next = _this.next;
          itemProps.prev = _this.prev;
          itemProps.key = item.key || itemProps.arrowType;
          arrow.push(React.cloneElement(item, itemProps));
        } else if (item.type.isBannerAnimThumb) {
          itemProps.key = item.key || 'thumb-' + thumbKeyNum;
          thumbKeyNum += 1;
          itemProps.thumbClick = _this.slickGoTo;
          itemProps.active = _this.state.currentShow;
          thumb = React.cloneElement(item, itemProps);
        }
      });
      if (elem.length > 1) {
        if (!arrow.length && _this.props.arrow) {
          arrow.push(React.createElement(Arrow, { arrowType: 'prev', key: 'arrowPrev', next: _this.next, prev: _this.prev, defaultBool: true }), React.createElement(Arrow, { arrowType: 'next', key: 'arrowNext', next: _this.next, prev: _this.prev, defaultBool: true }));
        }
        if (!thumb && _this.props.thumb) {
          thumb = React.createElement(Thumb, { length: elem.length, key: 'thumb',
            thumbClick: _this.slickGoTo,
            active: _this.state.currentShow,
            defaultBool: true
          });
        }
      }
      _this.elemWrapper = elem;
      return elem.concat(arrow, thumb);
    };

    _this.getDomDataSetToState = function () {
      _this.dom = ReactDOM.findDOMNode(_this);
      var domRect = _this.dom.getBoundingClientRect();
      _this.setState({
        domRect: domRect
      });
      _this.tweenBool = false;
    };

    _this.getAnimType = function (type) {
      var typeArray = type ? dataToArray(type) : Object.keys(animType);
      var random = Math.round(Math.random() * (typeArray.length - 1));
      return animType[typeArray[random]];
    };

    _this.autoPlay = function () {
      _this.autoPlayId = ticker.interval(_this.next, _this.props.autoPlaySpeed);
    };

    _this.animTweenStart = function (show, type, noGetAnimType) {
      if (!noGetAnimType) {
        _this.animType = _this.getAnimType(_this.props.type);
      }
      _this.props.onChange('before', show);
      _this.setState({
        currentShow: show,
        direction: type
      });
    };

    _this.animEnd = function (type) {
      if (type === 'enter') {
        _this.tweenBool = false;
        _this.props.onChange('after', _this.state.currentShow);
      }
    };

    _this.next = function () {
      if (!_this.tweenBool) {
        _this.tweenBool = true;
        var newShow = _this.state.currentShow;
        newShow++;
        if (newShow >= _this.elemWrapper.length) {
          newShow = 0;
        }
        _this.animTweenStart(newShow, 'next');
      }
    };

    _this.prev = function () {
      if (!_this.tweenBool) {
        _this.tweenBool = true;
        var newShow = _this.state.currentShow;
        newShow--;
        if (newShow < 0) {
          newShow = _this.elemWrapper.length - 1;
        }
        _this.animTweenStart(newShow, 'prev');
      }
    };

    _this.slickGoTo = function (i, noGetAnimType) {
      if (!_this.tweenBool && i !== _this.state.currentShow) {
        _this.tweenBool = true;
        var type = i > _this.state.currentShow ? 'next' : 'prev';
        _this.animTweenStart(i, type, noGetAnimType);
      }
    };

    _this.state = {
      currentShow: _this.props.initShow,
      direction: null,
      domRect: {},
      $self: _this // eslint-disable-line
    };
    _this.tweenBool = false;
    return _this;
  }

  _createClass(BannerAnim, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.getDomDataSetToState();
      if (window.addEventListener) {
        window.addEventListener('resize', this.getDomDataSetToState);
      } else {
        window.attachEvent('onresize', this.getDomDataSetToState);
      }
      if (this.props.autoPlay) {
        this.autoPlay();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.autoPlayId) {
        ticker.clear(this.autoPlayId);
        this.autoPlayId = 0;
      }
      if (window.addEventListener) {
        window.removeEventListener('touchend', this.onTouchEnd);
        window.removeEventListener('mouseup', this.onTouchEnd);
        window.removeEventListener('resize', this.getDomDataSetToState);
      } else {
        window.detachEvent('ontouchend', this.onTouchEnd);
        window.attachEvent('onmouseup', this.onTouchEnd);
        window.detachEvent('onresize', this.getDomDataSetToState);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          type = _props.type,
          prefixCls = _props.prefixCls,
          component = _props.component,
          initShow = _props.initShow,
          duration = _props.duration,
          delay = _props.delay,
          ease = _props.ease,
          arrow = _props.arrow,
          thumb = _props.thumb,
          autoPlaySpeed = _props.autoPlaySpeed,
          autoPlay = _props.autoPlay,
          sync = _props.sync,
          dragPlay = _props.dragPlay,
          autoPlayEffect = _props.autoPlayEffect,
          props = _objectWithoutProperties(_props, ['type', 'prefixCls', 'component', 'initShow', 'duration', 'delay', 'ease', 'arrow', 'thumb', 'autoPlaySpeed', 'autoPlay', 'sync', 'dragPlay', 'autoPlayEffect']);

      var childrenToRender = this.getRenderChildren(props.children);
      props.className = (props.className + ' ' + (prefixCls || '')).trim();
      props.style = _extends({}, props.style);
      props.onMouseEnter = this.onMouseEnter;
      props.onMouseLeave = this.onMouseLeave;
      if (childrenToRender.length > 1 && this.props.dragPlay) {
        props.onTouchStart = this.onTouchStart;
        props.onMouseDown = this.onTouchStart;
        props.onTouchMove = this.onTouchMove;
        props.onMouseMove = this.onTouchMove;
        props.onTouchEnd = this.onTouchEnd;
        props.onMouseUp = this.onTouchEnd;
      }
      return React.createElement(this.props.component, props, childrenToRender);
    }
  }]);

  return BannerAnim;
}(Component);

BannerAnim.propTypes = {
  children: PropTypes.any,
  style: PropTypes.object,
  className: PropTypes.string,
  prefixCls: PropTypes.string,
  component: PropTypes.any,
  arrow: PropTypes.bool,
  thumb: PropTypes.bool,
  initShow: PropTypes.number,
  type: PropTypes.any,
  duration: PropTypes.number,
  delay: PropTypes.number,
  ease: PropTypes.string,
  autoPlay: PropTypes.bool,
  autoPlaySpeed: PropTypes.number,
  autoPlayEffect: PropTypes.bool,
  onChange: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  sync: PropTypes.bool,
  dragPlay: PropTypes.bool
};
BannerAnim.defaultProps = {
  component: 'div',
  className: 'banner-anim',
  initShow: 0,
  duration: 450,
  delay: 0,
  ease: 'easeInOutQuad',
  arrow: true,
  thumb: true,
  autoPlaySpeed: 5000,
  autoPlayEffect: true,
  dragPlay: true,
  onChange: function onChange() {},
  onMouseEnter: function onMouseEnter() {},
  onMouseLeave: function onMouseLeave() {}
};
BannerAnim.isBannerAnim = true;
export default BannerAnim;
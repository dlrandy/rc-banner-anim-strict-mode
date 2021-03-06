import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _extends from 'babel-runtime/helpers/extends';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _createClass from 'babel-runtime/helpers/createClass';
import _inherits from 'babel-runtime/helpers/inherits';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Tween } from 'rc-tween-one';
import { stylesToCss } from 'style-utils';
import { currentScrollTop, toArrayChildren, windowHeight } from './utils';
import animType from './anim';

var BgElement = function (_React$Component) {
  _inherits(BgElement, _React$Component);

  _createClass(BgElement, null, [{
    key: 'getDerivedStateFromProps',
    value: function getDerivedStateFromProps(props, _ref) {
      var prevProps = _ref.prevProps,
          $self = _ref.$self;

      var nextState = {
        prevProps: props
      };
      if (prevProps && props !== prevProps) {
        if (props.show) {
          // 取 dom 在 render 之后；
          setTimeout(function () {
            if ($self.video && prevProps.videoResize && $self.videoLoad) {
              $self.onResize();
            }
            if (prevProps.scrollParallax) {
              $self.onScroll();
            }
          });
        }
      }
      return nextState;
    }
  }]);

  function BgElement(props) {
    _classCallCheck(this, BgElement);

    var _this = _possibleConstructorReturn(this, (BgElement.__proto__ || Object.getPrototypeOf(BgElement)).call(this, props));

    _this.onScroll = function () {
      var scrollTop = currentScrollTop();
      var domRect = _this.dom.parentNode.getBoundingClientRect();
      var offsetTop = domRect.top + scrollTop;
      var height = Math.max(domRect.height, windowHeight());
      var elementShowHeight = scrollTop - offsetTop + height;
      var scale = elementShowHeight / (height + domRect.height);
      scale = scale || 0;
      scale = scale >= 1 ? 1 : scale;
      _this.tween.frame(scale * _this.scrollParallaxDuration);
    };

    _this.onResize = function () {
      if (!_this.props.show) {
        return;
      }
      var domRect = _this.dom.getBoundingClientRect();
      var videoDomRect = _this.video.getBoundingClientRect();
      _this.videoLoad = true;
      var scale = void 0;
      var videoRect = {
        display: 'block',
        position: 'relative',
        top: 0,
        left: 0
      };
      if (domRect.width / domRect.height > videoDomRect.width / videoDomRect.height) {
        scale = domRect.width / videoDomRect.width;
        videoRect.width = domRect.width;
        videoRect.height = videoDomRect.height * scale;
        videoRect.top = -(videoRect.height - domRect.height) / 2;
      } else {
        scale = domRect.height / videoDomRect.height;
        videoRect.height = domRect.height;
        videoRect.width = videoDomRect.width * scale;
        videoRect.left = -(videoRect.width - domRect.width) / 2;
      }

      Object.keys(videoRect).forEach(function (key) {
        _this.video.style[key] = stylesToCss(key, videoRect[key]);
      });
    };

    _this.videoLoadedData = function () {
      _this.onResize();
      if (window.addEventListener) {
        window.addEventListener('resize', _this.onResize);
      } else {
        window.attachEvent('onresize', _this.onResize);
      }
    };

    _this.isVideo = toArrayChildren(props.children).some(function (item) {
      return item.type === 'video';
    });
    if (_this.isVideo) {
      // 如果是 video，删除 grid 系列，位置发生变化，重加载了 video;
      animType.grid = undefined;
      animType.gridBar = undefined;
    }
    if (props.scrollParallax) {
      _this.scrollParallaxDuration = props.scrollParallax.duration || 450;
    }
    _this.video = null;
    _this.videoLoad = false;
    _this.state = {
      $self: _this
    };
    return _this;
  }

  _createClass(BgElement, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.dom = ReactDOM.findDOMNode(this);
      if (!this.videoLoad) {
        if (this.video && this.props.videoResize) {
          this.video.onloadeddata = this.videoLoadedData;
        }
      }
      if (this.props.scrollParallax) {
        this.tween = new Tween(this.dom, [_extends({
          ease: 'linear' }, this.props.scrollParallax)]);
        this.tween.init();
        this.onScroll();
        if (window.addEventListener) {
          window.addEventListener('scroll', this.onScroll);
        } else {
          window.attachEvent('onscroll', this.onScroll);
        }
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (window.addEventListener) {
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('scroll', this.onScroll);
      } else {
        window.detachEvent('onresize', this.onResize);
        window.detachEvent('onscroll', this.onScroll);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          videoResize = _props.videoResize,
          scrollParallax = _props.scrollParallax,
          show = _props.show,
          component = _props.component,
          componentProps = _props.componentProps,
          props = _objectWithoutProperties(_props, ['videoResize', 'scrollParallax', 'show', 'component', 'componentProps']);

      if (this.isVideo && videoResize) {
        var children = toArrayChildren(props.children).map(function (item, i) {
          return React.cloneElement(item, _extends({}, item.props, { key: item.key || 'bg-video-' + i, ref: function ref(c) {
              _this2.video = c;
              if (typeof item.ref === 'function') {
                item.ref(c);
              }
            }
          }));
        });
        props.children = children.length === 1 ? children[0] : children;
      }
      return React.createElement(this.props.component, _extends({}, props, componentProps));
    }
  }]);

  return BgElement;
}(React.Component);

export default BgElement;


BgElement.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.any,
  component: PropTypes.any,
  videoResize: PropTypes.bool,
  scrollParallax: PropTypes.object,
  show: PropTypes.bool,
  componentProps: PropTypes.object
};

BgElement.defaultProps = {
  component: 'div',
  videoResize: true,
  componentProps: {}
};

BgElement.isBannerAnimBgElement = true;
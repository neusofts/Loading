/**
 * 区域/全局 loading 效果<layui组件，依赖jQuery>
 * @version v1.3 最新版
 * @author jlx (neusofts#neusofts.com)
 * @extends {jQuery.fn.loading}
 * @param {String|Object=} arg1 调用方法名<均为空参则默认show，其他方法：toggle,hide,hideAll,destroy,destroyAll>，若为一个Object参数则更新全局配置&show<返回loading>
 * @param {Object=} arg2 若arg1为{String}，arg2为{Object}，则优先私有配置
 * @property {String=''} overlayClassName 自定义遮罩层className，可多个，默认空String
 * @property {String=''} imgClassName 自定义image的className，可多个，默认空String
 * @property {String='#fff'} background 自定义遮罩层背景色，默认#fff
 * @property {Number=0.6} opacity 自定义遮罩层的透明度，默认0.6 <为0时无遮罩层>
 * @property {String=''} text 自定义loading文本，默认空String<非空时参考offsetTop设置>
 * @property {String=''} textCss 自定义loading文本样式，默认空String<高优先级>
 * @property {String=''} textClassName 自定义文本的className，可多个，默认空String
 * @property {String=''} title 自定义div、img、text的title，默认空String
 * @property {Number=0} offsetTop 自定义图片+文本模式的top偏移量<text为空建议不设置offsetTop>
 * @property {Number=0|String=''|null} imgSrc 自定义loading图片路径，默认为图片序列的0索引<0-10>，可配索引或图片url路径<为null时无图片>
 * @property {Function=} beforeShow 自定义loading显示前的回调，默认空Function，参数1=this，参数2=jQuery
 * @property {Function=} afterShow 自定义loading显示后的回调，默认空Function，参数1=this，参数2=jQuery，参数3=$loading
 * @property {Number=19999999+1} imgZIndex 自定义图片的z-index值，默认19999999+1
 * @property {Number=19999999} overlayZIndex 自定义遮罩层的z-index值，默认19999999
 * @property {Function=} afterHide 自定义loading隐藏/销毁后的回调，默认空Function，参数1=this，参数2=jQuery，参数3=$loading(销毁时无参数3)
 * @property {Function=} afterHideAll 自定义全部loading隐藏/销毁后的回调，默认空Function，参数1=this，参数2=jQuery，参数3=$loading(销毁时无参数3)
 * @property {Number=600} animateTime 自定义loading显示/隐藏的动画时长 <为0时无动画>，默认600
 * @property {Boolean=false} clickHide 自定义单击loading遮罩层/图片/文字是否隐藏loading，默认false
 * @property {Boolean=false} inheritRadius 自定义遮罩层是否继承父节点的边框效果，默认false
 * @event hide,hideAll,destroy,destroyAll 均监听$(obj)的lay-loading(.hide | .hideAll | .destroy | .destroyAll)事件，参数event, loadingObj
 * @return {Object|jQuery|Object<Array>} 返回<loading | loadingArr | jQuery | Error>对象
 * @example
 * $('body').loading(str?: string = 'show'); // 创建/显示loading <body,html,window,document均处理为body>
 * $('body|other').loading({...}); // 注：更新全局配置 + show
 * $('body|other').loading('show', {...}); // 创建/显示 + 局部配置优先
 * var loadingObj = $('body|other').loading('hide').show(); // 隐藏 -> 显示
 * var loadingObj = $('body|other').loading('show', {afterHide: function (loadingObj, jQueryObj, $loading) {...}});
 */

+(function (global, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node/CommonJS
		module.exports = function (jQuery) {
			if (typeof jQuery === 'undefined') {
				// require('jQuery')
				if (typeof window !== 'undefined') {
					jQuery = require('jquery');
				} else {
					jQuery = require('jquery')(global);
				}
			}
			
			return factory(jQuery);
		};
	} else if (global.layui && layui.define) {
		// layui
		layui.define(['jquery'], function (exports) {
			exports('loading', factory(layui.$));
		});
	} else {
		// Browser globals
		factory(jQuery);
	}
} (this, function ($) {
	'use strict';

	var _ = $.extend
	, W = window // BOM/DOM
	, fnName = {}
	, lang = {Illegal_operation: '非法操作'} // 外部语言包模块
	, _toString = Object.prototype.toString
	, ds = { // 外部工具模块
		getTime: function (arg) {
            return arg ? (+ new Date(arg)) : (+ new Date());
		},
		
		is: {
			string: function (str) {
				return _toString.call(str) == '[object String]';
			},
			number: function (num) {
				return _toString.call(num) == '[object Number]';
			},
			plainObject: function (obj) {
				if (obj === undefined) {
					return false;
				} else {
					return _toString.call(obj) === '[object Object]';
				}
			},
			'undefined': function (v) {
				return v === undefined || v === null;
			},
			'function': function (fun) {
				return _toString.call(fun) === '[object Function]';
			}
		},
		
		loadImage: function (url, callback, error) {
			if (!url) {
				return callback({src: url});
			}
			
			var imgObj;

			imgObj = new Image();
			imgObj.src = url;

			if (imgObj.complete && callback) {
				return callback(imgObj);
			}

			imgObj.onload = function () {
				imgObj.onload = null;
				callback && callback(imgObj);
			};

			imgObj.onerror = function (e) {
				imgObj.onerror = null;
				error && error(e);
			};

			return imgObj;
		}
	};

	_($.fn, {
		loading: function () {
			var nodeNames = 'BODY,HTML,#document,undefined'
			, $that = nodeNames.indexOf(this[0].nodeName) > -1 ? $('body') : this // 多集合仅保留body对象
			, isBODY = $that[0].nodeName == 'BODY'
			, arg1 = arguments[0], arg2 = arguments[1]
			, loadingClassName = 'lay-loading' // 注：hideAll等操作的索引，若冲突请自行改之
			, eventNameResize = 'resize.' + loadingClassName
			, eventNameClick = 'click.'+ loadingClassName +'.clickHide'
			, zIndex = 19999999
			, errorFn = function () {
				throw new Error(lang.Illegal_operation);
			}
			, imgUrl = '../images/loading/loading'
			, imgSrcArr = [
				imgUrl + '.gif',
				imgUrl + '-bars.gif'
			].concat(function () { for (var arr = [], i = 0; i <= 8; i++) { arr.push(imgUrl + '-' + i + '.gif'); }; return arr; }())
			, pteMethods = {
				resize: function () {
					if (!this || !this instanceof $) return;
					
					var offsetTop = this.settings && (this.settings.offsetTop || 0);
					var $objs = this.$this.children('.' + loadingClassName + ':visible');
                    var hasImgSrc = !ds.is['undefined'](this.settings.imgSrc);
					var imageH = 0, $parent = {}, parentW = 0, parentH = 0, isFixed, offsetP, safariBug, parentPosition;
					var isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent); // !document.documentMode;
	
					$objs.each(function (key, divAndimg) {
						$parent = $(divAndimg).parent();
						parentPosition = ('fixed,relative').indexOf($parent.css('position'));
						isFixed = parentPosition > -1 || $parent[0] === $(this)[0].offsetParent;
						safariBug = parentPosition < 0 && $parent[0].offsetParent !== $('body')[0] && isSafari;
                        // console.log(parentPosition);    // -1 -1
                        // console.log($parent[0]);        // YS-in YS-in
                        // console.log($(this)[0].offsetParent);   // body YS-in
						// console.log($parent[0].offsetParent);   // body YS-out
                        offsetP = isFixed || safariBug ? { top: 0, left: 0 } : { top: $parent[0].offsetTop, left: $parent[0].offsetLeft };
						parentW = $parent.outerWidth();
						parentH = $parent.outerHeight();
						
						if ($parent[0].nodeName == 'BODY') {
							if ($(divAndimg).is('div')) {
								$(divAndimg).css({
									width: '100%',
									height: '100%',
									position: 'fixed'
								});
							} else if ($(divAndimg).is('img')) {
								imageH = $(divAndimg).height();
								$(divAndimg).css({
									position: 'fixed',
									top: $(W).height() / 2 - $(divAndimg).height() / 2 - offsetTop,
									left: $(W).width() / 2 - $(divAndimg).width() / 2
								});
							} else {
								$(divAndimg).css({
									position: 'fixed',
									top: $(W).height() / 2 + (imageH ? 6 : ( - $(divAndimg).height() / 2)) + imageH / 2 - offsetTop,
									left: $(W).width() / 2 - $(divAndimg).width() / 2
								});
							}
						} else {
							if ($(divAndimg).is('div')) {
								$(divAndimg).css({
									width: parentW,
									height: parentH,
									top: offsetP.top,
									left: offsetP.left
								});
							} else if ($(divAndimg).is('img')) {
								imageH = $(divAndimg).height();
								$(divAndimg).css({
									top: parentH / 2 - $(divAndimg).height() / 2 + offsetP.top - offsetTop,
									left: parentW / 2 - $(divAndimg).width() / 2 + offsetP.left
								});
							} else {
								imageH = hasImgSrc ? imageH : 0;
								$(divAndimg).css({
									top: parentH / 2 + imageH / 2 + (imageH ? 6 : ( - $(divAndimg).height() / 2)) + offsetP.top - offsetTop,
									left: parentW / 2 - $(divAndimg).width() / 2 + offsetP.left
								});
							}
						}
					});
	
					return this;
				},
				
				subsequent: function () {
					var $loading = arguments[0];
					var that = $loading.parent().data('loading') || this;
					var time = that.settings.animateTime;
					var $this = that.$this;
					var fn = that.settings[arguments[1]]
					var operate = arguments[2];
					var method = arguments[3];
					var isAuto = arguments[4];

					if (arguments[1] === 'afterHideAll') {
						fn = fnName.settings.afterHideAll;
					}
	
					$loading.fadeOut(time, function () {
						$(this)[operate]();
					});
	
					W.setTimeout(function () {
						!isAuto && fn && fn(that, $this, operate == 'hide' ? $loading : undefined);
						!isAuto && $this.trigger(loadingClassName + '.' + method, that);
					}, time);
	
					return that;
				}
			};
	
			fnName.settings = fnName.settings || {
				'overlayClassName': '',
				'imgClassName': '',
				'background': '#fff',
				'opacity': 0.6,
				'text': '',
				'textCss': '', // {}
				'textClassName': '',
				'title': '',
				'offsetTop': 0, // img&text的top偏移量
				'imgSrc': imgSrcArr[0],	// 注：默认以图片居中为主，若img&text同时微调可设置offsetTop
				'beforeShow': function () {},
				'afterShow': function () {},
				'imgZIndex': zIndex + 1, // text共用
				'overlayZIndex': zIndex,
				'afterHide': function () {},
				'afterHideAll': function () {},
				'animateTime': 600,
				'clickHide': !1, //可配置afterHide为reload需求
				'inheritRadius': false
			}

			var initialCss = {
				'top': -zIndex,
				'left': -zIndex,
				'z-index': 0,
				'position': 'absolute',
				'padding': 'initial',
				'margin': 'initial',
				'border': 'initial',
				'width': 'initial',
				'min-width': 'initial',
				'max-width': 'initial',
				'height': 'initial',
				'min-height': 'initial',
				'max-height': 'initial',
				'opacity': 'initial'
			}
			, overlayStyle = {
				'background': '#fff',
				'height': 0, // resize value
				'width': 0,  // resize value
				'top': 0,    // resize value <html除外, 子标签在body内>
				'left': 0,   // resize value <html除外, 子标签在body内>
				'z-index': 0,
				'opacity': 0,
				'position': 'absolute',
				'border-radius': 0,
				'padding': 'initial',
				'margin': 'initial',
				'border': 'initial'
			}
			, imageStyle = _({}, initialCss)
			, textStyle = _({}, initialCss, {
				'background': 'initial',
				'overflow': 'initial',
				'white-space': 'nowrap',
				'line-height': '120%',
				'text-align': 'center',
				'vertical-align': 'middle'
			});
	
			function Class(options) {
				if (options && options.imgSrc !== null && ds.is.number(options.imgSrc)) {
					options.imgSrc = imgSrcArr[options.imgSrc]; // undefined时$.extend不覆盖默认配置
				}
	
				this.hasNewSetting = ds.is.plainObject(options);
				this.$this = options.$this;
				this.settings = _({}, fnName.settings, this.hasNewSetting ? options : {});
				this.settings.overlayStyle = overlayStyle;
				this.settings.imageStyle = imageStyle;
				this.settings.textStyle = textStyle;
			}
	
			_(Class.prototype, {
				show: function () {
					var _this = this;
					var $this = this.$this;
					var settings = this.settings;
					var beforeShow = settings.beforeShow;
					var overlayStyle = settings.overlayStyle;
					var imageStyle = settings.imageStyle;
					var textStyle = settings.textStyle;
					var textCss = settings.textCss || {};
					var $loadingObjSingle = $this.children('.' + loadingClassName);
					var hasImgSrc = !ds.is['undefined'](settings.imgSrc);
	
					beforeShow && beforeShow(this, $this);
	
					if (!this.hasNewSetting && $loadingObjSingle.size() > 0) {
						pteMethods.subsequent.apply(this, [
							$loadingObjSingle,
							'afterShow',
							'show',
							'show'
						]);
	
						$(W).trigger(eventNameResize);
					} else {
						this.destroy('auto'), ds.loadImage(hasImgSrc ? settings.imgSrc : null, function (imgObj) {
							// create时不考虑动画
							var $overlay = $('<div></div>');
							var $image = $('<img />');
							var $text = $('<span></span>');
							var text = $.trim(settings.text);
							var overlayW = isBODY ? window.screen.availWidth : $this.outerWidth();
							var overlayH = isBODY ? window.screen.availHeight : $this.outerHeight();
	
							overlayStyle['background'] = settings['background'];
							overlayStyle['z-index'] = settings['overlayZIndex'];
							overlayStyle['opacity'] = settings['opacity'];
							overlayStyle['height'] = overlayH;
							overlayStyle['width'] = overlayW;
							if (settings.inheritRadius) {
								// For IE
								overlayStyle['border-top-left-radius'] = $this.css('border-top-left-radius');
								overlayStyle['border-top-right-radius'] = $this.css('border-top-right-radius');
								overlayStyle['border-bottom-left-radius'] = $this.css('border-bottom-left-radius');
								overlayStyle['border-bottom-right-radius'] = $this.css('border-bottom-right-radius');
							}
							imageStyle['z-index'] = settings['imgZIndex'];
							textStyle['z-index'] = settings['imgZIndex'];
	
							$overlay
							.addClass(loadingClassName)
							.addClass(settings.overlayClassName)
							.css(overlayStyle)
							.attr('title', settings.title)
							.appendTo($this).hide();
	
							imgObj.src && $image
							.addClass(loadingClassName)
							.addClass(settings.imgClassName)
							.css(imageStyle)
							.attr('src', imgObj.src)
							.attr('title', settings.title)
							.appendTo($this).hide();
	
							$text
							.addClass(loadingClassName)
							.addClass(settings.textClassName)
							.css(_({}, textStyle, textCss))
							.html(text)
							.attr('title', settings.title)
							.appendTo($this).hide();
	
							setTimeout(function () {
								$overlay[!settings['opacity'] ? 'remove' : 'show']();
								$image[!hasImgSrc ? 'remove' : 'show']();
								$text[!text.length ? 'remove' : 'show']();
								$(W).trigger(eventNameResize);
								settings.afterShow && settings.afterShow(_this, $this);
								$this.trigger(loadingClassName + '.' + 'show', _this);
							}, 0.1e3);
						}, function (e) {
							throw new Error(e);
						});
					}
	
					return {
						hide: errorFn,
						hideAll: errorFn,
						destroy: errorFn,
						destroyAll: errorFn
					};
				},
	
				toggle: function () {
					if (this.$this.children('.' + loadingClassName + ':visible').size() > 0) {
						return this.hide();
					} else {
						return this.show();
					}
				},
	
				hide: function () {
					return pteMethods.subsequent.apply(this, [
						this.$this.children('.' + loadingClassName),
						'afterHide',
						'hide',
						'hide'
					]);
				},
	
				hideAll: function () {
					return pteMethods.subsequent.apply(this, [
						$('.' + loadingClassName),
						'afterHideAll',
						'hide',
						'hideAll'
					]);
				},
	
				// <传入新配置/销毁后> 新建将启用最新全局配置
				destroy: function (isAuto) {
					return pteMethods.subsequent.apply(this, [
						this.$this.children('.' + loadingClassName),
						'afterHide',
						'remove',
						'destroy',
						isAuto
					]);
				},
	
				destroyAll: function () {
					return pteMethods.subsequent.apply(this, [
						$('.' + loadingClassName),
						'afterHideAll',
						'remove',
						'destroyAll'
					]);
				}
			});
	
			// 一个{}参数：更新全局配置&show <兼容IE8>
			if (ds.is.plainObject(arg1)) {
				if (arg1.imgSrc) {
					arg1.imgSrc = imgSrcArr[arg1.imgSrc];
				}
	
				return $that.loading('show', _(fnName.settings, arg1));
			}
	
			// arg1为string默认调用方法 & arg2默认为局部配置
			if (ds.is.string(arg1) || !arg1) {
				var loading = {}, loadingArr = [], rdm;
	
				arg1 = arg1 ? arg1 : 'show';
	
				$that.each(function (index, obj) {
					if (arg2) {
						arg2.$this = $(obj);

						if (arg2.afterHideAll) {
							fnName.settings.afterHideAll = arg2.afterHideAll;
						}
					} else {
						arg2 = {$this: $(obj)};
					}
	
					rdm = '.rdm' + ds.getTime() + index;
					loading = new Class(arg2);
					$(obj).data('loading', loading);
					ds.is['function'](loading[arg1]) && loading[arg1]();
					loadingArr.push(loading);
	
					// 单击div/img/text是否隐藏
					$(obj).off(eventNameClick).on(eventNameClick, '.' + loadingClassName, function (e) {
						loading.settings.clickHide && $(obj).data('loading').hide();
						e.stopPropagation();
						return false;
					});

					// resize监听
                    $(W).off(eventNameResize + rdm).on(eventNameResize + rdm, function () {
                        pteMethods.resize.call($(obj).data('loading') || null);
                    });
				});
			}
	
			return loadingArr.length > 1 ? loadingArr : loadingArr[0];
		}
	});

	return $;
}));
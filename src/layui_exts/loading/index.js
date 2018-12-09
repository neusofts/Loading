layui.config({
	version: 'v2.4.3-v1.3',
	debug: true,
	base: '../js/'
}).extend({
	loading: '../loading'
}).use(['jquery', 'colorpicker', 'form', 'element', 'laytpl', 'layedit', 'laydate', 'loading'], function () {
	var form = layui.form
		, $ = layui.jquery
		, layer = layui.layer
		, element = layui.element
		, laytpl = layui.laytpl
		, layedit = layui.layedit
		, laydate = layui.laydate
		, colorpicker = layui.colorpicker;

	var tplLogin
	, baseSetting = {
		'overlayClassName': '',
		'imgClassName': '',
		'background': '#fff',
		'opacity': 0.6,
		'text': '',
		'textCss': '',
		'textClassName': '',
		'title': '',
		'offsetTop': 0,
		'imgSrc': 0,
		'beforeShow': function () { layer.msg('这是 “显示之前” 的回调'); },
		'afterShow': function () { setTimeout(function () { layer.msg('这是 “显示之后” 的回调（为避免重叠此处已设置延迟1s）'); }, 1e3); },
		'imgZIndex': 19999999 + 1,
		'overlayZIndex': 19999999,
		'afterHide': function () { layer.msg('这是 “隐藏之后” 的回调'); },
		'afterHideAll': function () { layer.msg('这是 “全部隐藏之后” 的回调'); },
		'animateTime': 600,
		'clickHide': 0,
		'inheritRadius': 0
	}
	, onloadLoading = $(window).loading('show', {
		"opacity": 0.7,
		"imgSrc": 9,
		"text": "正在加载第三方高亮组件...",
		"textCss": {
			"color": "#666"
		},
		'afterShow': function () {
			// 测试：无高亮组件
			// window.onload = new function () {
			// 	onloadLoading.destroy();
			// };
		},
		"afterHide": function () { layer.msg('页面加载完成，请开始吧！'); },
		"offsetTop": 16
	});

	/* 
	(index):352 0 {name: "opacityDiv", value: "on"}                             // opacityDiv
	(index):352 1 {name: "background", value: "#c55353"}
	(index):352 2 {name: "overlayClassName", value: "divclass1 divclass2"}
	(index):352 3 {name: "opacity", value: "0.5"}
	(index):352 4 {name: "imgClassName", value: "imgclass1 imgclass2"}
	(index):352 5 {name: "imgSrc", value: ""}
	(index):352 6 {name: "imgSrcUrl", value: "../../loading.gif"}               // imgSrcUrl
	(index):352 7 {name: "text", value: "正在处理"}
	(index):352 8 {name: "textCss", value: "{color: '#fff'}"}
	(index):352 9 {name: "textClassName", value: "textclass1 textclass2"}
	(index):352 9 {name: "title", value: ""}
	(index):352 9 {name: "inheritRadius", value: false}
	(index):352 10 {name: "cb", value: "beforeShow"}
	(index):352 11 {name: "cb", value: "afterShow"}
	(index):352 12 {name: "cb", value: "afterHide"}
	(index):352 13 {name: "cb", value: "afterHideAll"}
	(index):352 14 {name: "clickHide", value: "1"}
	(index):352 15 {name: "offsetTop", value: "22"}
	(index):352 16 {name: "animateTime", value: "800"}
	(index):352 17 {name: "overlayZIndex", value: "199999991"}
	(index):352 18 {name: "setting", value: "正在生成配置..."}
	 */

	function getSetting($obj, doFormat) {
		var arrNew = {};
		var imgSrcUrl = false;
		var arr = $obj.serializeArray();
		var format = function (options) {
			var optionsStr = (JSON.stringify(options, function (k, v) {
				if (typeof v === 'function') {
					return Function.prototype.toString.call(v);
				}

				return v;
			}, 2));

			return optionsStr.replace(/"function/g, 'function').replace(/ }"/g, ' }');
		}

		$.each(arr, function (k, obj) {
			if (obj.name === 'imgSrcUrl') {
				imgSrcUrl = obj.value;
			} else {
				if (!parseInt(obj.value) && parseInt(obj.value) !== 0) {
					if (obj.name === 'cb') {
						arrNew[obj.value] = baseSetting[obj.value];
					} else {
						arrNew[obj.name] = $.trim(obj.value);
					}
				} else {
					arrNew[obj.name] = parseFloat(obj.value);
				}
			}
		});

		if (imgSrcUrl !== false) {
			arrNew.imgSrc = imgSrcUrl;
		} else if (arrNew.imgSrc === 'null') {
			arrNew.imgSrc = null;
		}

		if (arrNew.opacity === undefined) {
			arrNew.opacity = 0;
		}

		if (arrNew.opacity === 0 && arrNew.imgSrc === null && arrNew.text === '') {
			arrNew.text = '遮罩层、图片、文本至少得存在一项（单击关闭）';
			arrNew.textCss = { color: 'red' };
			arrNew.clickHide = 1;
		}

		if (arrNew.textCss) {
			arrNew.textCss = new Function("return" + arrNew.textCss)();
		}

		arrNew.imgZIndex = arrNew.overlayZIndex + 1;

		$.each(arrNew, function (key, value) {
			if (baseSetting[key] === undefined || (baseSetting[key] === value && typeof baseSetting[key] !== 'function')) {
				delete arrNew[key];
			}
		});

		// delete arrNew.opacityDiv;
		// delete arrNew.imgSrcUrl;
		// delete arrNew.setting;
		// delete arrNew.user;
		// delete arrNew.pw;

		return doFormat ? format(arrNew) : arrNew;
	}

	function codePrint(obj) {
		CodeMirror.fromTextArea(obj, {
			mode:'javascript',						// 编辑器语言
			theme:'eclipse', 						// 编辑器主题
			extraKeys: {"Tab": "autocomplete"},		// ctrl可以弹出选择项 
			// lineNumbers: true,					// 是否使用行号
			styleActiveLine: true,
			smartIndent: true,						// 自动缩进是否开启
			matchBrackets: true,
			readOnly: true
		});
	}

	function setScrollTop(obj, text) {
		$(document).scrollTop($(obj).offset().top - 30);
		text && layer.tips(text, obj, {
			tips: [3, '#c95050'], time: 5e3
		});
		return text;
	}

	function getTpl(url, paramsObj) {
		if (!url) {
			return;
		} else {
			return $.ajax({
				url: url,
				data: paramsObj || {},
				async: false
				// jsonp: '$callback',
				// dataType: 'jsonp'
			}).responseText;
		}
	}

	//表单初始赋值<表单设置>
	// form.val('my-loading', {
	//     "opacityDiv": "有遮罩层"
	//     , "background": "#fff"
	//     , "opacity": 0.6
	//     , "imgSrc": 0
	//     // , "like[write]": true
	//     , "clickHide": '0'
	//     , "offsetTop": 0
	//     , "animateTime": 600
	//     , "overlayZIndex": 19999999
	//     , "setting": "正在生成配置..." // 默认配置信息，计算赋值
	// });

	// 监听表单提交
	form.on('submit(my-submit)', function (data) {
		setScrollTop($('#my-show-1')[0]);

		// layer.alert(JSON.stringify(data.field), {
		//     title: '最终的提交信息'
		// });

		var options = getSetting($('form'));
		$('#my-show-1').loading('show', options);

		return false;
	});

	// 颜色选择器
	colorpicker.render({
		elem: '#bg-btn'
		, color: '#fff'
		, done: function (color) {
			$('#bg-input').val(color);
		}
	});

	// 日期控件
	$('#my-date').on('click.date', function () {
		laydate.render({
			elem: '#my-date',
			show: true,
			value: new Date(),
			isInitValue: false,
			format: '今天是：yyyy年MM月dd日',
			ready: function () {
				$('div.layui-laydate').loading('show', {
					background: '#000',
					imgSrc: null,
					opacity: 0.5,
					text: '示例：暂停选择日期',
					textCss: {color: '#fff'}
				});
			}
		});
	});

	// 创建一个编辑器
	var editIndex = layedit.build('LAY_demo_editor');

	// 配置表单验证规则
	form.verify({
		opacity: function (value, obj) {
			if (!value && !obj.disabled) {
				return setScrollTop(obj.nextSibling, '有遮罩层时请设置“遮罩透明度”');
			}
		}
		, imgSrcUrl: function (value, obj) {
			if (!$.trim(value) && !obj.disabled) {
				obj.value = '';
				return setScrollTop(obj, '备选图片未选时请设置“图片路径”');
			}
		}
		, test2: [/(.+){6,12}$/, '密码必须6到12位']
		, test3: function (value) {
			layedit.sync(editIndex);
		}
	});

	// 备选图片编码选择
	form.on('select(imgSrc)', function (data) {
		var imgSrcUrlObj = $('input[name="imgSrcUrl"]')[0];

		if (!data.value) {
			imgSrcUrlObj.disabled = false;
			layer.tips('可以自定义URL了', imgSrcUrlObj, {
				tips: [3, 'green'], time: 3e3, end: function () {
					$(imgSrcUrlObj).focus();
				}
			});
		} else {
			imgSrcUrlObj.disabled = true;
			layer.tips('此时不可配置URL', imgSrcUrlObj, {
				tips: [3, '#c95050'], time: 3e3
			});
		}
	});

	// 有无遮罩层
	form.on('switch(switch)', function (data) {
		var selectObj = $('select[name="opacity"]')[0];
		var overlayClassNameObj = $('input[name="overlayClassName"]')[0];
		var bgColorObj = $('#bg-input')[0];
		var text = data.othis[0].innerText;
		
		// layer.msg('：' + (this.checked ? 'true' : 'false'), {
		//     offset: '6px'
		// });

		overlayClassNameObj.disabled = bgColorObj.disabled = selectObj.disabled = text === '有遮罩层' ? false : true;

		layer.tips(text, data.othis, {
			tips: [1, '#000']
		});

		form.render('select');
	});

	// 上传按钮 <独立>
	// var uploadLoading = function () {
		$('#my-upload').on('click.upload', function () {
			$(this).loading('show', {
				title: '文件上传中，请稍候...（单击退出）',
				clickHide: true
			});
		});
	// }; uploadLoading();

	// 圆形loading
	$('#my-radius').on('click.radius', function () {
		$(this).loading('show', {
			imgSrc: null,
			background: '#000',
			text: '继承了父节点边框哦<br>支持br换行哦<br>2秒后跳转...',
			textCss: {color: '#fff', 'font-size': '12px'},
			inheritRadius: true,
			opacity: 0.7,
			clickHide: true
		});

		setTimeout(function () {
			setScrollTop($('#my-doc')[0]);
		}, 2e3);
	});

	// loading in loading
	$('#my-in-loading').on('click.in.loading', function () {
		var $obj = $('#in-loading');
		var claName = 'div.lay-loading';
		
		setScrollTop($obj[0]);

		$obj.loading('show', {
			imgSrc: null,
			background: 'green',
			text: '这是第一层loading...',
			textCss: {color: '#fff'},
			inheritRadius: true,
			clickHide: true
		});

		setTimeout(function () {
			$obj.children(claName).loading('show', {
				background: 'orange',
				inheritRadius: true,
				clickHide: true,
				imgSrc: null,
				offsetTop: -30,
				textCss: {color: '#fff'},
				text: '这是第二层loading，我已偏移30px哦'
			});
		}, 1e3);

		setTimeout(function () {
			$obj.children(claName).children(claName).loading('show', {
				background: 'blue',
				inheritRadius: true,
				clickHide: true,
				imgSrc: null,
				offsetTop: -60,
				textCss: {color: '#fff'},
				text: '这是第三层loading，我已偏移60px哦，连续单击关闭'
			});
		}, 2e3);
	});

	// 监听window的hideAll事件
	// $(window).on('lay-loading.hideAll', function () {
	// 	uploadLoading();
	// });

	// 关闭所有loading
	$('#my-close-all').on('click.closeAll', function () {
		$(window).loading('hideAll');
	});

	// 打开全屏loading <按配置>
	$('#my-body').on('click.body', function () {
		var loading = $(window).loading('show', getSetting($('form')));
		setTimeout(function () {
			loading.hide();
		}, 3e3);
	});

	// 固定效果 <独立>
	$('#my-demo').on('click.demo', function () {
		setScrollTop($('#my-show-1')[0]);
		$('#my-show-1').loading('show', {
			background: 'green',
			imgSrc: null,
			textCss: { color: '#fff' },
			text: '数据处理中...'
		});
	});

	// 重置表单
	$('#my-reset').on('click.reset', function () {
		layer.msg('确定重置您的配置吗？', {
			time: 0
			, shade: 0.5
			, anim: 6
			, btn: ['确定', '取消']
			, yes: function (index) {
				layer.close(index);
				$('[disabled]').attr('disabled', false);
				$('input[name="imgSrcUrl"]')[0].disabled = true;
				setTimeout(function () {
					$('form')[0].reset();
				}, 50);
			}
		});
	});

	// 多区域loading <按配置>
	$('#my-more').on('click.more', function () {
		$('div.my-show-ot').loading('show', getSetting($('form')));
		setTimeout(function () {
			$(document).scrollTop($('div.my-show-ot').offset().top);
			layer.tips('多区域显示效果', $('div.my-show-ot')[0], {
				tips: [1, 'orange'], time: 4e3, tipsMore: true
			});
			layer.tips('多区域显示效果', $('div.my-show-ot')[1], {
				tips: [1, 'orange'], time: 4e3, tipsMore: true
			});
		}, 0.2e3);
	});

	// layer显示loading <按配置>
	$('#my-layer').on('click.layer', function () {
		var obj = {
			title: '身份验证',
			user: {
				value: 'admin',
				title: '帐号',
				placeholder: '请输入用户名'
			},
			pw: {
				value: '123456',
				title: '密码',
				placeholder: '请输入密码',
				info: '密码长度6～18位'
			},
			btn: {
				submit: '提交',
				reset: '取消'
			}
		};

		if (!tplLogin) tplLogin = getTpl('form.tpl');
		laytpl(tplLogin).render(obj, function (html) {
			var index = layer.open({
				type: 1
				, title: obj.title
				, shade: 0.6
				, anim: 1
				, btn: [obj.btn.submit, obj.btn.reset]
				, content: html
				, yes: function (index, obj) {
					var loading = $('#layer-form').closest('div.layui-layer').loading('show', getSetting($('form')));
					setTimeout(function () {
						loading.hide();
					}, 3e3);
				}
			});

			layer.style(index, {
				width: '470px'
			});

			setTimeout(function () {
				layer.tips('点此试试', $('a.layui-layer-btn0')[0], {
					tips: [1, 'orange'], time: 2e3
				});
			}, 0.5e3);
		});
	});

	// 监听tab切换
	element.on('tab(code-tab)', function (elem) {
		var $cont = $(elem.elem[0]).find('.layui-tab-item:eq('+ elem.index +')');
		var obj = $cont.find('.code')[0];
		var $edit = $cont.find('.CodeMirror');
		
		!$edit.size() && codePrint(obj);
	});

	$(function () {
		// 代码高亮默认执行
		$('textarea.auto-code').each(function (i, obj) {
			codePrint(obj);
		});

		// 定时生成配置信息
		var oldOptionsStr = '';
		setInterval(function () {
			if (oldOptionsStr != getSetting($('form'), 'format')) {
				$('#textarea').val(getSetting($('form'), 'format'));
				$('#my-show-1').find('.CodeMirror').remove();
				codePrint($('#textarea')[0]);
				oldOptionsStr = getSetting($('form'), 'format');
			}
		}, 1.5e3);

		// 加载高亮组件loading
		window.onload = new function () {
			onloadLoading.destroy();
		};

		// btns animate
		$('button[data-anim]').on('click.anim', function (e) {
			var animPre = 'layui-anim-';
			var $obj = $(this);
			var animClass = animPre + $obj.data('anim');
			$obj.addClass(animClass);
			setTimeout(function () {
				$obj.removeClass(animClass);
			}, 2e3);
		});
	});
});
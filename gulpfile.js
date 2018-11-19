var gulp = require('gulp');
var minJs = require('gulp-uglify');
var minCss = require('gulp-minify-css');
var minHtml = require('gulp-htmlmin');
var cache = require('gulp-cache');
var minImage = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var clean = require('gulp-clean');
var runSequence  = require('gulp-sequence');

function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
    return currentdate;
}

var optPath = {
    devPath: 'src/**/*',
    distToPath: 'dist',
    distAllSubPath: 'dist/**/*',
    htmlTypes: '{php,html,tpl}',
    imageTypes: '{png,jpg,gif}'
};

var filesNum = {
    js: '共约23个',
    css: '共约5个',
    html: '共约n个',
    image: '共约n个'
};

var jsSrc = [
    optPath.distAllSubPath +'.js'
];

var jsWatch = optPath.distAllSubPath +'.js';

var cssSrc = [
    optPath.distAllSubPath +'.css'
];

var cssWatch = optPath.distAllSubPath +'.css';

var htmlSrc = [
    optPath.distAllSubPath +'.' + optPath.htmlTypes
];

var htmlWatch = optPath.distAllSubPath +'.' + optPath.htmlTypes;

var imageSrc = [
    optPath.distAllSubPath +'.' + optPath.imageTypes
];

var imageWatch = optPath.distAllSubPath +'.' + optPath.imageTypes;

gulp.task('copy', function() {
    console.log('**********************************************************************************');
    console.log('************************ 拷贝 src 至 dist *****************************************');
    console.log('***********************************************************************************');
    return gulp.src([optPath.devPath])
        .pipe(gulp.dest(optPath.distToPath));
});

gulp.task('minJs', function() {
    console.log('**********************************************************************************');
    console.log('************************ 准备执行压缩dist下的JS ************************************');
    console.log('**********************************************************************************');
    var j = 0;

    gulp.watch(jsWatch, function (file) {
        var ty;
        j++;
        switch (file.type) {
            case 'added': ty = '新增文件'; break;
            case 'deleted': ty = '删除文件'; break;
            case 'changed': ty = '修改文件'; break;
        }
        console.log('\n');
        console.log('[Js队列号：'+ j +'/'+ filesNum.js +' - gulpfile.js]');
        console.log('[处理类型：'+ ty +' - '+ getNowFormatDate() +']');
        console.log('[文件路径：'+ file.path +']');
    });

    return gulp.src(jsSrc)
        .pipe(cache(minJs({
            // unicode: false,
            mangle:true,
            compress:true,
            preserveComments: false,
            output: {
                ascii_only: true
            }
        }).on('error', function (err) {
            console.log('××××××××××××××××××××××××××××××××××××××××××××××××××××××××××××');
            console.log('××××××××××××××××××××××× 压缩Js出错了 ×××××××××××××××××××××××');
            console.log('××××××××××××××××××××××××××××××××××××××××××××××××××××××××××××');
            console.log(err);
        })))
        .pipe(gulp.dest(optPath.distToPath));
});

gulp.task('minCss', function () {
    console.log('**********************************************************************************');
    console.log('************************ 准备执行压缩dist下的CSS ***********************************');
    console.log('**********************************************************************************');
    var c = 0;
    var options = {
        format: 'beautify',
        level: {
            1: {
                specialComments: 'all'
            }
        },
        compatibility: {
            properties: {
                ieBangHack: true,
                ieFilters: true,
                iePrefixHack: true,
                ieSuffixHack: true
            },
            selectors: {
                ie7Hack: false
            }
        }
    };

    gulp.watch(cssWatch, function (file) {
        var ty;
        c++;
        switch (file.type) {
            case 'added': ty = '新增文件'; break;
            case 'deleted': ty = '删除文件'; break;
            case 'changed': ty = '修改文件'; break;
        }
        console.log('\n');
        console.log('[Css队列号：'+ c +'/'+ filesNum.css +' - gulpfile.js]');
        console.log('[处理类型：'+ ty +' - '+ getNowFormatDate() +']');
        console.log('[文件路径：'+ file.path +']');
    });

    return gulp.src(cssSrc)
        .pipe(cache(minCss(options).on('error', function (err) {
            console.log('××××××××××××××××××××××××××××××××××××××××××××××××××××××××××××');
            console.log('×××××××××××××××××××××××× 压缩Css出错了 ×××××××××××××××××××××');
            console.log('××××××××××××××××××××××××××××××××××××××××××××××××××××××××××××');
            console.log(err);
        })))
        .pipe(gulp.dest(optPath.distToPath));
});

gulp.task('minHtml', function () {
    console.log('**********************************************************************************');
    console.log('*********************** 准备执行压缩dist下的Html ***********************************');
    console.log('**********************************************************************************');
    var h = 0;

    var options = {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: false,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: false,
        removeStyleLinkTypeAttributes: false,
        minifyJS: false,
        minifyCSS: true
    };

    gulp.watch(htmlWatch, function (file) {
        var ty;
        h++;
        switch (file.type) {
            case 'added': ty = '新增文件'; break;
            case 'deleted': ty = '删除文件'; break;
            case 'changed': ty = '修改文件'; break;
        }
        console.log('\n');
        console.log('[Html队列号：'+ h +'/'+ filesNum.html +' - gulpfile.js]');
        console.log('[处理类型：'+ ty +' - '+ getNowFormatDate() +']');
        console.log('[文件路径：'+ file.path +']');
    });

    return gulp.src(htmlSrc)
        .pipe(cache(minHtml(options).on('error', function (err) {
            console.log('××××××××××××××××××××××××××××××××××××××××××××××××××××××××××××');
            console.log('××××××××××××××××××××××× 压缩Html出错了 ×××××××××××××××××××××');
            console.log('××××××××××××××××××××××××××××××××××××××××××××××××××××××××××××');
            console.log(err);
        })))
        .pipe(gulp.dest(optPath.distToPath));
});

gulp.task('minImage', function () {
    console.log('**********************************************************************************');
    console.log('********************** 准备执行压缩dist下的Image ***********************************');
    console.log('**********************************************************************************');
    var i = 0;

    gulp.watch(imageWatch, function (file) {
        var ty;
        i++;
        switch (file.type) {
            case 'added': ty = '新增文件'; break;
            case 'deleted': ty = '删除文件'; break;
            case 'changed': ty = '修改文件'; break;
        }
        console.log('\n');
        console.log('[Image队列号：'+ i +'/'+ filesNum.image +' - gulpfile.js]');
        console.log('[处理类型：'+ ty +' - '+ getNowFormatDate() +']');
        console.log('[文件路径：'+ file.path +']');
    });

    return gulp.src(imageSrc)
        .pipe(cache(minImage({
            progressive: true,
            verbose: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }).on('error', function (err) {
            console.log('\n');
            console.log('××××××××××××××××××××××××××××××××××××××××××××××××××××××××××××');
            console.log('××××××××××××××××××××××× 压缩Image出错了 ××××××××××××××××××××');
            console.log('××××××××××××××××××××××××××××××××××××××××××××××××××××××××××××');
            console.log(err);
            console.log('\n');
        })))
        .pipe(gulp.dest(optPath.distToPath));
});

gulp.task('clean:all', function(){
    return gulp.src(optPath.distToPath + '/*', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('watch', function () {
    var c = 0;

    gulp.watch(optPath.devPath, ['copy']).on('change', function (file) {
        var ty;
        c++;
        switch (file.type) {
            case 'added': ty = '新增文件'; break;
            case 'deleted': ty = '删除文件'; break;
            case 'changed': ty = '修改文件'; break;
        }
        console.log('\n～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～');
        console.log('[监听的Copy队列号：'+ c +' - gulpfile.js]');
        console.log('[监听的处理类型：'+ ty +' - '+ getNowFormatDate() +']');
        console.log('[监听的文件路径：'+ file.path +']');
        console.log('～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～～\n');
    });
});

gulp.task('default', function(cb) {
    runSequence(['clean:all'], 'copy', 'minJs', 'minCss'/* , 'minHtml', 'minImage' */)(cb);
});
'use strict';

var gulp = require('gulp'),
	notify = require("gulp-notify"),
	plumber = require('gulp-plumber'),
	gulpif = require('gulp-if'),
	browserSync = require('browser-sync').create(),
	del = require('del'),
	cache = require('gulp-cache'),
	watch = require('gulp-watch'),

	sass = require('gulp-sass'),
	pug = require('gulp-pug'),
	rigger = require("gulp-rigger"),
	emitty = require('emitty').setup('src/pug', 'pug'),
	imagemin = require('gulp-imagemin'),
	sourcemaps = require('gulp-sourcemaps'),

	postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	mqpacker = require("css-mqpacker"),
	sorting = require('postcss-sorting'),
	csscomb = require('gulp-csscomb'),
	combineSelectors = require('postcss-combine-duplicated-selectors');



// Обработка pug-файлов
gulp.task('html', function () {
	return new Promise((resolve, reject) => {
		emitty.scan(global.emittyChangedFile).then(() => {
			gulp.src('src/pug/*.pug')
				.pipe(gulpif(global.watch, emitty.filter(global.emittyChangedFile)))
				.pipe(pug({ pretty: true }))
				.pipe(gulp.dest('dist'))
				.on('end', resolve)
				.pipe(browserSync.stream());
		});
	})
});

// Обработка scss-файлов
gulp.task('css', function () {
var plugins = [
    	autoprefixer()
    ];
return gulp.src('src/scss/**/*.scss')
	.pipe(plumber())
	.pipe(sass()).on("error", notify.onError())
	.pipe(postcss(plugins))
	.pipe(gulp.dest('dist/css'))
	.pipe(browserSync.stream()); 
});

// Обработка js-файлов
gulp.task('js', function () {
return gulp.src('src/js/main.js')
	.pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(rigger().on("error", notify.onError()))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('dist/js'))
	.pipe(browserSync.stream());
});

// Обработка изображений
gulp.task('img', function () {
return gulp.src('src/img/**/*.*')
	.pipe(cache(imagemin()))
	.pipe(gulp.dest('dist/img/'));
});

// Обработка шрифтов
gulp.task('fonts', function() {
return gulp.src('src/fonts/**/*.*')
	.pipe(gulp.dest('dist/fonts/'));
});

// Сервер
gulp.task('serve', function(){
browserSync.init({
	server: 'dist',
	notify: false
});
browserSync.watch('dist/**/*.*').on('change', browserSync.reload);
});

// Слежка
gulp.task('watch', function(){
	global.watch = true;
	gulp.watch('src/pug/**/*.pug', gulp.series('html'))
		.on('all', (event, filepath) => {
			global.emittyChangedFile = filepath;
		});
	gulp.watch('src/scss/**/*.scss', gulp.series('css'));
	gulp.watch('src/js/**/*.js', gulp.series('js'));
	gulp.watch('src/img/**/*.*', gulp.series('img'));
	gulp.watch('src/fonts/**/*.*', gulp.series('fonts'));
});

// Чистка
gulp.task('clean', function(){
return del('dist');
});

// Главное действие
gulp.task('default', gulp.series('clean', 'css', 'js', 'img', 'fonts', 'html', gulp.parallel('watch', 'serve')));
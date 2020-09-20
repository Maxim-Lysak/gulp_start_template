/*

	gulp									Запуск шаблона.
	gulp imageWebp 				Конвертация изображений из "jpeg, jpg, png" в "webp".
	gulp imageCompress  	Сжатие изображений из "jpeg, jpg, png".
	gulp webFonts 				Конвертация шрифтов из "otf, ttf" в "woff, woff2".
	gulp svgSprite 				Собирает спрайт из svg иконок.

*/ 

const {src, dest, parallel, series, watch} = require('gulp');
//webpHtml = require("gulp-webp-html"), // плагин по умолчанию отключен(находится в функции html)
	
			// Препроцессоры.
const	scss 					= require('gulp-sass'),
			
			// Изображения.
			webp 					= require("gulp-webp"),
			imagemin 			= require('gulp-imagemin'),
			SvgSprite 		= require('gulp-svg-sprite'),

			// Шрифты.
			fonter 				= require("gulp-fonter"),
			ttf2woff 			= require("gulp-ttf2woff"),
			ttf2woff2 		= require("gulp-ttf2woff2"),

			// CSS.
			cleanCss 			= require("gulp-clean-css"),
			autoprefixer 	= require('gulp-autoprefixer'),
			groupMedia 		= require('gulp-group-css-media-queries'),

			// JavaScript.
			babel					= require('gulp-babel'),
			concat				= require('gulp-concat'),
			uglify 				= require('gulp-uglify-es').default,

			// Удаление, переименование, обновление в браузере.
			del 					= require('del'),
			rename 				= require("gulp-rename"),
			browsersync 	= require('browser-sync').create();

const sourceFolder = "src";
const projectFolder = "dist";
	
const path = {
	build: {
		html: projectFolder + "/",
		js: projectFolder + "/js/",
		css: projectFolder + "/css/",
		img: projectFolder + "/img/",
		fonts: projectFolder + "/fonts/",
	},
	src: {
		js: sourceFolder + "/js/script.js",
		fontFolder: sourceFolder + "/fonts/",
		css: sourceFolder + "/scss/style.scss",
		fonts: sourceFolder + "/fonts/**/*.{woff,woff2}",
		img: sourceFolder + "/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
		html: [sourceFolder + "/*.html", "!"+sourceFolder + "/_*html"],
	},
	original: {
		fontFolder: sourceFolder + "/_originalFonts/",
		fontOtf: sourceFolder + "/_originalFonts/**/*.otf",
		fontTtf: sourceFolder + "/_originalFonts/**/*.ttf",
		svgIconSprite: sourceFolder + "/_iconsprite/**/*.svg",
		originalImages: sourceFolder + "/_originalImages/**/*.{jpg,jpeg,png}",
	},
	watch: {
		js: sourceFolder + "/js/**/*.js",
		html: sourceFolder + "/**/*.html",
		css: sourceFolder + "/scss/**/*.scss",
		img: sourceFolder + "/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}",
		fonts: sourceFolder + "/fonts/**/*.{woff,woff2}",
	},
	clean: "./" + projectFolder + "/"
};	

function browserSync() {
	browsersync.init({
		server: {
			baseDir: "./" + projectFolder + "/"
		},
		port: 3000,
		notify: false,
		online: true,
	})
};

function html() {
	return src(path.src.html)
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
};

function css() {
	return src(path.src.css)
		.pipe(scss({
			outputStyle: "expanded"
			})
			)
		.pipe(groupMedia())
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 5 version"],
				cascade: true
			}))
		.pipe(dest(path.build.css))
		.pipe(cleanCss())
		.pipe(
			rename({
				extname: ".min.css"
			})
			)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
};

function js() {
	return src(path.src.js)
		.pipe(dest(path.build.js))
		.pipe(babel({
      presets: ["@babel/preset-env"]
		}))
		.pipe(uglify())
		.pipe(concat("script.min.js"))
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
};

function images() {
	return src(path.src.img)
		.pipe(dest(path.build.img))
};

function fonts() {
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts))
};

function clean() {
	return del(path.clean);
};

function watchFiles() {
	watch([path.watch.js], js);
	watch([path.watch.css], css);
	watch([path.watch.html], html);
	watch([path.watch.img], images);
	watch([path.watch.fonts], fonts);
};

function imageWebp(){
	return src(path.original.originalImages)
		.pipe(
				webp({
					quality: 60,
			})
		)
		.pipe(dest(sourceFolder + '/img/'));
};

function imageCompress() {
	return src(path.original.originalImages)
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3,
			})
		)
		.pipe(dest(sourceFolder + '/img/'))
};

function webFonts() {
		src(path.original.fontOtf)
		.pipe(fonter({
			formats: ["ttf"]
		}))
		.pipe(dest(path.original.fontFolder))
	src(path.original.fontTtf)
		.pipe(ttf2woff())
		.pipe(dest(path.src.fontFolder))
	return src(path.original.fontTtf)
		.pipe(ttf2woff2())
		.pipe(dest(path.src.fontFolder))
};

function svgSprite() {
	return src(path.original.svgIconSprite)
	.pipe(SvgSprite({
		mode: {
			stack: {
				sprite: "../icons/icons.svg",
				// example: true
			}
		}
	})
	)
	.pipe(dest(sourceFolder + '/img/'))
};

let build = series(clean, parallel(images, js, css, html, fonts));

exports.webFonts 			= webFonts;						
exports.svgSprite 		= svgSprite;					
exports.imageWebp 		= imageWebp;					
exports.imageCompress = imageCompress;
exports.default 			= parallel(build, watchFiles, browserSync);

'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const mincss = require('gulp-csso');
const server = require('browser-sync').create();
const run = require('run-sequence');
const imagemin = require('gulp-imagemin');
const svgstore = require('gulp-svgstore');
const svgmin = require("gulp-svgmin");
const minjs = require('gulp-uglify');
const pump = require('pump');
const rename = require('gulp-rename');
const postcss = require("gulp-postcss");
const mqpacker = require("css-mqpacker");
const pug = require("gulp-pug");
const browserSync = require("browser-sync")

const reload = browserSync.reload;

// gulp.task('fonts', function (fn) {
//   pump([
//       gulp.src('fonts/**/*.{eot,ttf,woff}'),
//       gulp.dest('build/fonts')
//     ],
//     fn
//   );
// });


gulp.task('fonts', function(){
  return gulp.src('fonts/**/*.{eot,ttf,woff}')
    .pipe(gulp.dest('build/fonts'));
});

gulp.task('style', () =>
    gulp.src('sass/style.scss')
        .pipe(sass())
        .pipe(mincss())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(postcss([
          mqpacker({
            sort: true
          })
        ]))
        .pipe(gulp.dest("build/styles"))
        .pipe(server.stream())
        .pipe(reload({stream: true}))
);

gulp.task('minjs', function (fn) {
  pump([
      gulp.src('scripts/*.js'),
      minjs(),
      rename("js.min.js"),
      gulp.dest('build/scripts')
    ],
    fn
  );
});


gulp.task('images', function(){
  return gulp.src('img/**/*.{png,jpg,gif}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task("symbols",function() {
  return gulp.src("img/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/img/icons"));
});

gulp.task('pug', function buildHTML() {
  return gulp.src('*.pug')
  .pipe(pug({
    pretty: true
  }))
  .pipe(gulp.dest('build'))
  .pipe(browserSync.stream());
});


gulp.task('serve', ['style'], function() {
  server.init({
    server: './build',
    notify: false,
    open: false,
    cors: false,
    ui: false,
    logPrefix: "клякса-котейка"
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.pug", ["pug"]).on("change", server.reload);
  gulp.watch("*.html").on("change", server.reload);
});


gulp.task('build', function(fn) {
  run(
    'pug',
    'style',
    'minjs',
    'images',
    'symbols',
    'fonts',
    'serve',
    fn);
});

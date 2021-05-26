"use strict";

const gulp = require("gulp");
const webpack = require("webpack-stream");
const browsersync = require("browser-sync");
const sass        = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const rename = require("gulp-rename");
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');

const dist = "./dist/";

gulp.task('server', function() {

  browsersync({
      server: {
          baseDir: "dist"
      }
  });

  gulp.watch("src/*.html").on('change', browsersync.reload);
});

// gulp.task("copy-html", () => {
//     return gulp.src("./src/index.html")
//                 .pipe(gulp.dest(dist))
//                 .pipe(browsersync.stream());
// });

gulp.task("build-js", () => {
    return gulp.src("./src/js/main.js")
                .pipe(webpack({
                    mode: 'development',
                    output: {
                        filename: 'script.js'
                    },
                    watch: false,
                    devtool: "source-map",
                    module: {
                        rules: [
                          {
                            test: /\.m?js$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                              loader: 'babel-loader',
                              options: {
                                presets: [['@babel/preset-env', {
                                    debug: true,
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                              }
                            }
                          }
                        ]
                      }
                }))
                .pipe(gulp.dest(dist + "/js"))
                .on("end", browsersync.reload);
});

gulp.task('styles', function() {
  return gulp.src("src/sass/**/*.+(scss|sass)")
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
      .pipe(rename({suffix: '.min', prefix: ''}))
      .pipe(autoprefixer())
      .pipe(cleanCSS({compatibility: 'ie8'}))
      .pipe(gulp.dest("dist/css"))
      .pipe(browsersync.stream());
});

gulp.task("copy-css", () => {
    return gulp.src("./src/css/**/*.*")
                .pipe(gulp.dest(dist + "/css"))
                .on("end", browsersync.reload);
});
gulp.task("copy-icons", () => {
  return gulp.src("./src/icons/**/*.*")
              .pipe(gulp.dest(dist + "/icons"))
              .on("end", browsersync.reload);
});
gulp.task("copy-img", () => {
  return gulp.src("./src/img/**/*.*")
              .pipe(gulp.dest(dist + "/img"))
              .on("end", browsersync.reload);
});

gulp.task("watch", () => {
    browsersync.init({
		server: "./dist/",
		port: 4000,
		notify: true
    });
    
    // gulp.watch("./src/index.html", gulp.parallel("copy-html"));
    gulp.watch("src/*.html").on('change', gulp.parallel('html'));
    // gulp.watch("./src/css/**/*.*", gulp.parallel("copy-css"));
    gulp.watch("src/sass/**/*.+(scss|sass|css)", gulp.parallel('styles'));
    gulp.watch("./src/icons/**/*.*", gulp.parallel("copy-icons"));
    gulp.watch("./src/img/**/*.*", gulp.parallel("copy-img"));
    gulp.watch("./src/js/**/*.js", gulp.parallel("build-js"));
});

gulp.task("build", gulp.parallel("copy-css", "copy-icons", "copy-img", "build-js"));

gulp.task("build-prod-js", () => {
    return gulp.src("./src/js/main.js")
                .pipe(webpack({
                    mode: 'production',
                    output: {
                        filename: 'script.js'
                    },
                    module: {
                        rules: [
                          {
                            test: /\.m?js$/,
                            exclude: /(node_modules|bower_components)/,
                            use: {
                              loader: 'babel-loader',
                              options: {
                                presets: [['@babel/preset-env', {
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }]]
                              }
                            }
                          }
                        ]
                      }
                }))
                .pipe(gulp.dest(dist + "/js"));
});

gulp.task('html', function() {
  return gulp.src("src/*.html")
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest('dist/'));
});

// gulp.task('scripts', function() {
//   return gulp.src("src/js/**/*.js")
//       .pipe(gulp.dest('dist/js'));
// });

gulp.task('fonts', function() {
  return gulp.src("src/fonts/**/*")
      .pipe(gulp.dest('dist/fonts'));
});

gulp.task('icons', function() {
  return gulp.src("src/icons/**/*")
      .pipe(gulp.dest('dist/icons'));
});

gulp.task('mailer', function() {
  return gulp.src("src/mailer/**/*")
      .pipe(gulp.dest('dist/mailer'));
});

gulp.task('img', function() {
  return gulp.src("src/img/**/*")
      .pipe(imagemin())
      .pipe(gulp.dest('dist/img'));
});

gulp.task("default", gulp.parallel("watch", "build", "server", "styles", "fonts", "icons", "mailer", "img", "html"));
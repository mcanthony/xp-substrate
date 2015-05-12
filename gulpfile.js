"use strict";

var gulp = require("gulp");
var watchify = require("watchify");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var gutil = require("gulp-util");
var sourcemaps = require("gulp-sourcemaps");
var babelify = require("babelify");
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task("scripts", function () {
  console.log(require.resolve("babelify/polyfill"));
  var options = {
    cache: watchify.args.cache,
    packageCache: watchify.args.packageCache,
    entries: [
      require.resolve("babelify/polyfill"),
      "src/scripts/main.js"
    ],
    debug: true
  };

  var bundler = watchify(browserify(options));
  bundler.transform(babelify);

  function bundle() {
    return bundler.bundle()
      .on("error", gutil.log.bind(gutil, "Browserify Error"))
      .pipe(source("main.js"))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest(".tmp/src/scripts/"))
      .pipe(reload({stream: true}));
  }

  bundler.on("update", bundle);
  bundler.on("log", gutil.log);

  return bundle();
});

gulp.task("serve", ["scripts"], function () {
  browserSync({
    notify: false,
    server: {
      baseDir: [".tmp/", "./"]
    }
  });
});

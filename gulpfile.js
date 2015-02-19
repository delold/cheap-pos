var gulp = require("gulp");
var less = require("gulp-less");
var livereload = require("gulp-livereload");
var plumber = require('gulp-plumber');
var notify = require("gulp-notify");
var mocha = require("gulp-mocha");
var react = require("gulp-react");

var _ = require("underscore");

var source = require("vinyl-source-stream");
var watchify = require("watchify");
var browserify = require("browserify");

var bundler = watchify(browserify("./assets/scripts/app.js", _.extend(watchify.args, {ignoreMissing: "nw.gui", debug: true})));

bundler.on('update', bundle);

function bundle() {
	return plumber(notify.onError("Error: <%= error.message %>"))
		.pipe(bundler.bundle())
		.pipe(source("bundle.js"))
		.pipe(gulp.dest("./assets"))
		.pipe(livereload());
}

gulp.task("js", bundle);


gulp.task("styles", function() {
	return gulp.src("./assets/styles/*.less")
		.pipe(plumber(notify.onError("Error: <%= error.message %>")))
		.pipe(less())
		.pipe(gulp.dest("./assets/styles"))
		.pipe(livereload());
});

gulp.task("react", function() {
	return gulp.src("./assets/scripts/**/*.jsx")
		.pipe(plumber(notify.onError("Error: <%= error.message %>")))
		.pipe(react())
		.pipe(gulp.dest("./assets/scripts"))
});

gulp.task("html", function() { 
	return gulp.src("./*.html")
		.pipe(plumber(notify.onError("Error: <%= error.message %>")))
		.pipe(livereload());
});



gulp.task("watch", function() {
	livereload.listen();
	bundle();
	gulp.watch("./assets/styles/*.less", ["styles"]);
	gulp.watch("./assets/scripts/**/*.jsx", ["react"]);
	gulp.watch("./*.html", ["html"]);
});

gulp.task("run", function() {
	var path = require("nodewebkit").findpath();
	var spawn = require('child_process').spawn;

	spawn(path, [__dirname]);
});


gulp.task("test", function() {
	return gulp.src("test/*.js").pipe(mocha());
});

gulp.task("dev", ["run", "watch"]);

gulp.task("default", ["dev"]);
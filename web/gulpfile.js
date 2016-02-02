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

var nodemon = require("gulp-nodemon");

var runNw = function() {
	var path = require("nw").findpath();
	var spawn = require('child_process').spawn;

	spawn(path, [__dirname]).on("exit", function() {
		process.exit();
	});
};

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

gulp.task("watchify", function(cb) {
	var args = _.extend(watchify.args, {debug: true});
	var bundler = watchify(browserify("./assets/scripts/app.js", args));

	function rebundle(cb) {
		cb = typeof cb === "function" ? cb : function() { return false; };
		return plumber(notify.onError("Error: <%= error.message %>"))
			.pipe(bundler.bundle())
			.pipe(source("bundle.js"))
			.pipe(gulp.dest("./assets"))
			.on("finish", cb)
			.pipe(livereload());
	}

	bundler.on('update', rebundle);
	rebundle(cb);
	// return rebundle(cb);
});

gulp.task("watch", ["watchify"], function() {
	livereload.listen();
	gulp.watch("./assets/styles/*.less", ["styles"]);
	gulp.watch("./assets/scripts/**/*.jsx", ["react"]);
	gulp.watch("./*.html", ["html"]);
});

gulp.task("run", runNw);

gulp.task("test", function() {
	return gulp.src("test/*.js").pipe(mocha());
});

gulp.task("dev", ["watch"], function() {
	runNw();
});

gulp.task("default", ["dev"]);
var gulp = require("gulp");
var less = require("gulp-less");
var livereload = require("gulp-livereload");
var plumber = require('gulp-plumber');
var notify = require("gulp-notify");


gulp.task("styles", function() {
	return gulp.src("./assets/styles/*.less").pipe(plumber(notify.onError("Error: <%= error.message %>"))).pipe(less()).pipe(gulp.dest("./assets/styles")).pipe(livereload());

});

gulp.task("scripts", function() {
	return gulp.src("./assets/scripts/**").pipe(plumber(notify.onError("Error: <%= error.message %>"))).pipe(livereload());
});

gulp.task("html", function() {
	return gulp.src("./*.html").pipe(plumber(notify.onError("Error: <%= error.message %>"))).pipe(livereload());
});

gulp.task("watch", function() {
	livereload.listen();
	gulp.watch("./assets/styles/*.less", ["styles"]);
	gulp.watch("./assets/scripts/**", ["scripts"]);
	gulp.watch("./*.html", ["html"]);
});

gulp.task("run", function() {
	var path = require("nodewebkit").findpath();
	var spawn = require('child_process').spawn;

	spawn(path, [__dirname]);
});

gulp.task("dev", ["run", "watch"]);

gulp.task("default", ["dev"]);
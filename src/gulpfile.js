var gulp = require("gulp");
var less = require("gulp-less");
var livereload = require("gulp-livereload");

gulp.task("styles", function() {
	return gulp.src("./assets/styles/*.less").pipe(less()).pipe(gulp.dest("./assets/styles")).pipe(livereload());
});

gulp.task("scripts", function() {
	return gulp.src("./assets/scripts/**").pipe(livereload());
});

gulp.task("html", function() {
	return gulp.src("./*.html").pipe(livereload());
});

gulp.task("default", function() {
	console.log("test");
});

gulp.task("watch", function() {
	livereload.listen();
	gulp.watch("./assets/styles/**", ["styles"]);
	gulp.watch("./assets/scripts/**", ["scripts"]);
	gulp.watch("./*.html", ["html"]);
})
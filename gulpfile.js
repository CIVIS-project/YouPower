'use strict';

var gulp = require('gulp');
var apidoc = require('gulp-apidoc');
var spawn = require('child_process').spawn,
    node;

gulp.task('apidoc', function() {
  apidoc.exec({
    src: "backend/routes/",
    dest: "backend/apidoc/"
  });
});


/**
 * $ gulp server
 * description: launch the server. If there's a server already running, kill it.
 */
gulp.task('server', function() {
  if (node) node.kill()
  node = spawn('node', ['--debug','backend/app.js'], {stdio: 'inherit'})
  node.on('close', function (code) {
    if (code === 8) {
      gulp.log('Error detected, waiting for changes...');
    }
  });
})

gulp.task('watch', function(){
  gulp.watch(['backend/**/*.js'], ['server']);
})

/**
 * $ gulp
 * description: start the development environment
 */
gulp.task('default', ['server','watch']);

// clean up if an error goes unhandled.
process.on('exit', function() {
    if (node) node.kill()
})

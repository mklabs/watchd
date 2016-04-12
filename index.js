#!/usr/bin/env node

var fs = require('fs');
var debug = require('debug')('watchd');
var spawn = require('child_process').spawn;

var alias = { c: 'cmd', h: 'help', v: 'version' };

var opts = require('minimist')(process.argv.slice(2), { alias: alias });
var files = opts._;

if (opts.version) return console.log(require('./package').version);

if (opts.help) {
  return fs.createReadStream('./readme.md').pipe(process.stdout);
}

if (!files.length) return console.error('Missing files argument');
if (!opts.cmd) return console.error('Missing command option');

require('gaze')(files, function(err, watcher) {
  this.on('all', function(event, filepath) {
    if (!opts.cmd) return;
    var command = opts.cmd.split(' ')[0];
    var args = opts.cmd.split(' ').slice(1);
    debug(filepath + ' was ' + event);
    spawn(command, args, { stdio: 'inherit' });
  });
});

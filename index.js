#!/usr/bin/env node

if (!process.env.DEBUG) process.env.DEBUG = 'watchd*';

var fs = require('fs');
var debug = require('debug')('watchd');
var spawn = require('child_process').spawn;

var alias = { c: 'cmd', h: 'help', v: 'version' };

var opts = require('minimist')(process.argv.slice(2), { alias: alias });
opts.cmd = Array.isArray(opts.cmd) ? opts.cmd : [opts.cmd];

var files = opts._;

if (opts.version) return console.log(require('./package').version);

if (opts.help) {
  return fs.createReadStream('./readme.md').pipe(process.stdout);
}

if (!files.length) return console.error('Missing files argument');
if (!opts.cmd) return console.error('Missing command option');

require('gaze')(files, function(err, watcher) {

  debug('Registering commands: %s', opts.cmd.join(', '));
  debug('Watching files', files.join(' '));

  this.on('all', function(event, filepath) {
    if (!opts.cmd) return;

    debug(filepath + ' was ' + event);

    var cmds = opts.cmd.concat();
    (function next(cmd) {
      if (!cmd) return;

      var command = cmd.split(' ')[0];
      var args = cmd.split(' ').slice(1);

      debug('`' + command + ' ' + args.join(' ') + '`');
      spawn(command, args, { stdio: 'inherit' })
        .on('error', function(err) {
          console.error(err.stack);
        })
        .on('close', function() {
          next(cmds.shift());
        });
    })(cmds.shift());
  });
});

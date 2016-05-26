const fs             = require('fs');
const path           = require('path');
const debug          = require('debug')('watchd');
const spawn          = require('child_process').spawn;
const mdeps          = require('module-deps');
const JSONStream     = require('JSONStream');
const builtinModules = require('builtin-modules');

module.exports = run;
run.lookup = lookup;

function run(opts) {
  opts = opts || {};
  opts.cmd = Array.isArray(opts.cmd) ? opts.cmd : [opts.cmd];

  var files = opts._;
  if (opts.version) return console.log(require('./package.json').version);

  if (opts.help) {
    return fs.createReadStream(path.join(__dirname, 'usage.txt')).pipe(process.stdout);
  }

  if (!opts.cmd) return console.error('Missing command option');
  if (files.length) return gaze(files, opts);

  lookup(path.resolve(), function(err, files) {
    if (err) throw err;
    gaze(files, opts);
  });
}

function gaze(files, opts) {
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
}


function lookup(dir, done) {
  debug('Lookup files in %s', dir);
  var filepath = require.resolve(dir);
  debug('Resolved to %s', filepath);

  let postFilter = (id, file, pkg) => {
    let notCore = builtinModules.indexOf(id) === -1;
    let notNodeModules = !/node_modules/.test(file);
    // debug('filter', id, file, notCore, notNodeModules);
    return notCore && notNodeModules;
  };

  let transform = ['babelify'];

  var md = mdeps({ postFilter, transform  });
  var files = [];
  md.on('file', function(file) {
    debug('module-deps found %s file', file);
    files.push(file);
  });

  md.on('error', debug.bind(null, 'err'));
  var to = setTimeout(() => {
    debug('Timout error... module-deps never fired an end event');
    done(null, files);
  }, 5000);

  md.pipe(JSONStream.stringify()).on('end', () => {
    clearTimeout(to);
    return done(null, files);
  });

  md.write(filepath);
  md.end();
}

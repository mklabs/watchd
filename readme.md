watchd
------

Tiny wrapper around gaze / module-deps combo to re-run command(s) on file
changes. That's it.

## Install

    $ npm install watchd -g

## Usage

    $ watchd [files...] [options]

      -h, --help          Show this help output
      -v, --version       Show this help output
      -c, --cmd           One or more commands to run on file changes

    Examples:

      $ watchd -c "npm test"
      $ watchd -c "eslint ." -c "npm test"
      $ watchd lib/*.js *.{js,json} -c "echo Hello" -c "echo World"

## Uses

- [gaze](https://github.com/shama/gaze) The input files are passed to gaze,
  which emits back update events. The list of `--cmd` scripts it then executed
  in sequence.

- [module-deps](https://github.com/substack/module-deps) If no files is
  provided, module-deps is used to traverse the require tree for the current
  package (relative to `cwd`)

These two make it really easy to quickly setup a file watcher, with almost no configuration.

watchd
------

Tiny utilitty to watch a list of files and relaunch a command on update. That's
it.

## Usage

    # for js projects, will watch any files in the require tree
    $ watch -c 'npm test'

    $ watchd [files...] -c 'echo Hello' -c 'echo World'

## Install

    $ npm install mklabs/watchd -g

## Module deps

If no files is provided, [module-deps](https://github.com/substack/module-deps)
is used to traverse the require tree for the current package (relative to
`cwd`)

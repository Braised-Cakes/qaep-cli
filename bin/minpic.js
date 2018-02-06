#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const download = require('download-git-repo')
const home = require('user-home')
const inquirer = require('inquirer')
const rm = require('rimraf').sync
const ora = require('ora')
const chalk = require('chalk');
const exec = require('child_process').execSync
const getUser = require('../lib/get-user')
const cwd = process.cwd()
const fileName = '.minpic.json'
program.usage('<project-name>').parse(process.argv)

/**
 * Padding.
 */
console.log()
process.on('exit', function () {
    console.log()
})


const tmp = path.resolve(home, '.qaep-templates', 'minpic')

if (fs.existsSync(path.resolve(home, fileName))) {
    inquirer.prompt([{
        type: 'confirm',
        message: 'File exists, whether to cover?',
        name: 'rs',
    }]).then(({
        rs
    }) => {
        if (rs) go()
    })
} else {
    go()
}

function go() {
    if (fs.existsSync(tmp)) {
        rm(tmp)
    }
    const spinner = ora('downloading template')
    spinner.start()
    download('BraisedCakes666/key', tmp, function (err) {
        spinner.stop()
        var str = fs.readFileSync(path.resolve(tmp, fileName), 'utf-8')
        fs.writeFileSync(path.resolve(home, fileName), str)
        rm(tmp)
        console.log()
        console.log(chalk.green('download finished!'))
        console.log()
        console.log('Documentation can be found at https://github.com/BraisedCakes666/minpic')
    })
}

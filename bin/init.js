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
const exec = require('child_process').execSync
const getUser = require('../lib/get-user')
const cwd = process.cwd()

program.usage('<project-name>').parse(process.argv)

// 根据输入，获取项目名称
const projectName = program.args[0]

/**
 * Padding.
 */
console.log()
process.on('exit', function () {
    console.log()
})

const tmp = path.resolve(home, '.qaep-templates', projectName || path.parse(process.cwd()).base)

if (!projectName) {
    inquirer.prompt([{
        type: 'confirm',
        message: 'Generate project in current directory?',
        name: 'rs',
    }]).then(({
        rs
    }) => {
        if (rs) go()
    })
} else {
    if (fs.existsSync(path.resolve(process.cwd(), projectName))) {
        inquirer.prompt([{
            type: 'confirm',
            message: 'Target directory exists. Continue?',
            name: 'rs',
        }]).then(({
            rs
        }) => {
            if (rs) go()
        })
    } else {

        go()
    }
}

function go() {
    if (fs.existsSync(tmp)) {
        rm(tmp)
    }
    const spinner = ora('downloading template')
    spinner.start()
    download('BaiduQA-SETI/qaep-template', tmp, function (err) {
        spinner.stop()
        askQuestion()
    })
}

function ask(item, data) {
    return new Promise((resolve, reject) => {
        inquirer.prompt([{
            type: 'input',
            message: item.message,
            default: item.default,
            name: item.name,
        }]).then((answers) => {
            data[item.name] = answers[item.name]
            resolve()
        })
    })
}

async function askQuestion() {
    var json = [{
        message: 'Project name',
        default: projectName || path.parse(process.cwd()).base,
        name: 'name'
    }, {
        message: 'Author',
        default: getUser(),
        name: 'author'
    }]
    let data = {}
    for (let i = 0; i < json.length; i++) {
        await ask(json[i], data);
    }
    let file = JSON.parse(fs.readFileSync(path.resolve(tmp, 'package.json'), 'utf-8'))
    file.name = data.name
    file.author = data.author
    file.version = '1.0.0'
    fs.writeFileSync(path.resolve(tmp, 'package.json'), JSON.stringify(file, null, 4))
    exec(`cp -r ${tmp}/ ${projectName ? path.resolve(cwd, projectName) : '.'}`)
    rm(tmp)
}

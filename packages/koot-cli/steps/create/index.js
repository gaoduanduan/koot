const path = require('path')
const chalk = require('chalk')

const vars = require('../../lib/vars')
const getLocales = require('../../lib/get-locales')
const _ = require('../../lib/translate')

/**
 * 创建 Koot.js 项目
 * @async
 * @param {Object} [options] 
 * @param {Boolean} [options.showWelcome=true] 显示欢迎信息
 */
module.exports = async (options = {}) => {

    const {
        showWelcome = true
    } = options

    vars.locales = await getLocales()

    if (showWelcome) {
        console.log('')
        console.log(chalk.cyanBright(_('welcome')))
        console.log(_('required_info'))
        console.log('')
    }

    const project = await require('./inquiry-project')()
    const dest = await require('./get-project-folder')(project)
    await require('./download-boilerplate')(project, dest)

    console.log('')
    // console.log(project)
    // console.log(process.cwd(), dest)
    // console.log(path.relative(process.cwd(), dest))

    console.log(chalk.cyanBright(_('whats_next')))
    logNext('goto_dir', `cd ${path.relative(process.cwd(), dest)}`)
    logNext('install_dependencies', `npm i`)
    logNext('run_dev', `npm run dev`)
    logNext('visit')

    console.log('')
}

let nextStep = 1
const logNext = (step, command) => {
    console.log(chalk.cyanBright(`${nextStep}. `) + _(`step_${step}`))
    if (command)
        console.log(`   ` + chalk.gray(`> ${command}`))
    nextStep++
}

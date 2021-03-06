// 此文件可或者 koa 中间件，所有 app 都会用到
// 扩展时候需考虑普适性

const getDistPath = require('../utils/get-dist-path')
const getDirDistPublic = require('../libs/get-dir-dist-public')

module.exports = (server) => {
    
    /* 静态目录,用于外界访问打包好的静态文件js、css等 */

    const koaStatic = require('koa-static')
    const convert = require('koa-convert')
    const rootPath = getDirDistPublic(getDistPath())
    const option = {
        maxage: 0,
        hidden: true,
        index: 'index.html',
        defer: false,
        gzip: true,
        extensions: false
    }
    server.app.use(convert(koaStatic(rootPath, option)))
}

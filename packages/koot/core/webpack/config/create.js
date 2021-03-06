const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

// Libs & Utilities
const getAppType = require('../../../utils/get-app-type')
// const getPort = require('../../../utils/get-port')
const getChunkmapPathname = require('../../../utils/get-chunkmap-path')
const initNodeEnv = require('../../../utils/init-node-env')

// Transformers
const transformDist = require('./transform-dist')
const transformI18n = require('./transform-i18n')
const transformPWA = require('./transform-pwa')
const transformTemplate = require('./transform-template')
const transformConfigClient = require('./transform-config-client')
const transformConfigServer = require('./transform-config-server')

// Defaults & Data
const defaults = require('../../../defaults/build-config')

/**
 * 根据当前环境和配置，生成 Webpack 配置对象
 * @async
 * @param {Object} kootConfig Koot.js 打包配置对象 (koot.build.js)。具体内容详见模板项目的 koot.build.js 文件内注释。
 * @returns {Object} 生成的完整 Webpack 配置对象
 */
module.exports = async (kootConfig = {}) => {
    initNodeEnv()

    // 确定环境变量
    const {
        WEBPACK_BUILD_TYPE: TYPE,
        WEBPACK_BUILD_ENV: ENV,
        WEBPACK_BUILD_STAGE: STAGE,
        // WEBPACK_ANALYZE,
        // SERVER_DOMAIN,
        // SERVER_PORT,
    } = process.env

    const defaultPublicDirName = 'includes'
    const defaultPublicPathname = (() => {
        if (TYPE === 'spa' && ENV === 'dev')
            return `/`
        if (TYPE === 'spa' && /^browser/.test(process.env.KOOT_HISTORY_TYPE))
            return `/${defaultPublicDirName}/`
        if (TYPE === 'spa')
            return `${defaultPublicDirName}/`
        return `/${defaultPublicDirName}/`
    })()

    // 抽取配置
    const kootBuildConfig = Object.assign({}, defaults, kootConfig, {
        appType: await getAppType(),
        defaultPublicDirName,
        defaultPublicPathname,
    })
    const {
        analyze = false
    } = kootBuildConfig

    // kootBuildConfig.portServer = getPort(kootBuildConfig.port)
    if (process.env.WEBPACK_BUILD_ENV === 'dev' && kootBuildConfig.devPort) {
        process.env.SERVER_PORT = kootBuildConfig.devPort
    } else if (process.env.WEBPACK_BUILD_ENV !== 'dev' && kootBuildConfig.port) {
        process.env.SERVER_PORT = kootBuildConfig.port
    }
    // process.env.SERVER_PORT = kootBuildConfig.portServer

    // ========================================================================
    //
    // 处理配置 - 公共
    //
    // ========================================================================

    kootBuildConfig.dist = await transformDist(kootBuildConfig.dist)
    kootBuildConfig.i18n = await transformI18n(kootBuildConfig.i18n)
    kootBuildConfig.pwa = await transformPWA(kootBuildConfig.pwa)
    kootBuildConfig.template = await transformTemplate(kootBuildConfig.template)
    kootBuildConfig.pathnameChunkmap = await getChunkmapPathname()

    if (typeof kootBuildConfig.webpackConfig === 'function')
        kootBuildConfig.webpackConfig = await kootBuildConfig.webpackConfig()
    if (typeof kootBuildConfig.webpackConfig !== 'object')
        kootBuildConfig.webpackConfig = {}

    // ========================================================================
    //
    // 处理配置 - 客户端 / 开发 (CLIENT / DEV)
    //
    // ========================================================================

    const webpackConfig = await (async () => {
        let config
        if (STAGE === 'client')
            config = await transformConfigClient(kootBuildConfig)
        if (STAGE === 'server')
            config = await transformConfigServer(kootBuildConfig)

        // ========================================================================
        //
        // 模式: analyze
        //
        // ========================================================================

        if (analyze) {
            if (Array.isArray(config))
                config = config[0]
            config.plugins.push(
                new BundleAnalyzerPlugin({
                    analyzerPort: process.env.SERVER_PORT,
                    defaultSizes: 'gzip'
                })
            )
        }

        return config
    })()
    kootBuildConfig.webpackConfig = webpackConfig

    // ========================================================================
    //
    // 返回结果
    //
    // ========================================================================

    return kootBuildConfig
}

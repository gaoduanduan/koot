import React from 'react'
import { renderToString } from 'react-dom/server'

import validateI18n from '../validate/i18n'

/**
 * KOA 中间件: 同构
 */
const middlewareIsomorphic = (options = {}) => {

    const {
        template,
        reduxConfig = {},
        routerConfig,
    } = options

    console.log(options)

    return async (ctx, next) => {
        try {

            await validateI18n()

            let routeMatched = true

            if (!routeMatched)
                return await next()

            const html = renderToString(
                <div>123</div>
            )

            ctx.body = html

        } catch (err) {
            require('debug')('SYSTEM:isomorphic:error')('Server-Render Error Occures: %O', err.stack)
            ctx.status = 500
            ctx.body = err.message
            ctx.app.emit('error', err, ctx)
        }
    }
}

export default middlewareIsomorphic

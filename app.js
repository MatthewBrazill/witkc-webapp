'use strict'

// Import the extensions
const AWS = require('aws-sdk')
const ssm = new AWS.SSM()
const express = require('express')
const cookie = require('cookie-parser')
const session = require('express-session')
const sessionStore = require('connect-dynamodb')({ session: session })
const handlebars = require('express-handlebars')
const logger = require('./log.js')
const helper = require('./controllers/helper.js')
const datadogRum = require('@datadog/browser-rum').datadogRum

async function start() {
    // Create the app
    const app = express()
    logger.debug('Express Started')

    // Create API route for health check and home re-route
    app.route('/api/healthy').get((req, res) => res.sendStatus(200))
    app.route('/').get((req, res) => res.redirect('/home'))

    // Get Parameters from AWS
    const sessionKey = ssm.getParameter({
        Name: 'witkc-session-key',
        WithDecryption: true
    }).promise().then((data) => {
        logger.debug('Received session key from AWS')
        return data.Parameter.Value
    }).catch((err) => {
        logger.error({
            error: err,
            stack: err.stack,
            message: `Failed to get session key from AWS`
        })
        console.log(`Failed to get session key from AWS: ${err.stack}`)
        process.exit(1)
    })

    // Set up session storage middleware
    const sessionHandler = session({
        secret: await sessionKey,
        saveUninitialized: false,
        store: new sessionStore({
            table: 'witkc-sessions',
            hashKey: 'sessionId',
            AWSConfigJSON: {
                region: 'eu-west-1'
            },
        }),
        cookie: { maxAge: 1000 * 60 * 60 * 24 * 28 },
        resave: false
    })

    // Set up sessions
    app.use((req, res, next) => {
        if (req.url == '/healthy') next()
        else return sessionHandler(req, res, next)
    })
    logger.debug('Session Key Loaded')

    // Set up middleware logging
    app.use((req, res, next) => {
        logger.info({
            sessionId: req.sessionID,
            loggedIn: typeof req.session.memberId !== "undefined" ? true : false,
            memberId: typeof req.session.memberId !== "undefined" ? req.session.memberId : null,
            method: req.method,
            urlPath: req.url,
            message: `${req.method} ${req.url}`
        })
        next()
    })
    logger.debug('Logging Loaded')

    // Set up the handlebars view-engine
    app.engine('.hbs', handlebars({
        extname: '.hbs',
        defaultLayout: 'main'
    }))
    app.set('view engine', '.hbs')
    app.set('views', 'views')
    logger.debug('Handlebars Loaded')

    // Remaining WebApp settings
    app.set(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(express.static("./public"))
    app.use(cookie())
    app.use('/', require('./routes.js'))
    logger.debug('Routes Loaded')

    // Add 404 Page
    app.use((req, res) => {
        res.status(404)
        // Respond with HTML page
        if (req.accepts('html')) helper.viewData(req, '404 - Page not found').then((data) => res.render('404', data))
        // Respond with json
        else if (req.accepts('json')) res.json({ err: 'Not found' })
        // Default: Plain-Text
        else res.type('text').send('404 - Page Not Found')
    })
    logger.debug('"Not Found" Handeling Loaded')

    app.listen(8000, () => {
        logger.info(`Started! => https://witkc.brazill.net`)
        console.log(`Listening on port 8000  ->  https://witkc.brazill.net`)
    })
}

logger.info('WITKC Web App Starting... ~~ Created by Matthew Brazill (https://github.com/MatthewBrazill)')
console.log(`
__        __ ___  _____  _  __ ____  __        __     _          _                  
\\ \\      / /|_ _||_   _|| |/ // ___| \\ \\      / /___ | |__      / \\    _ __   _ __  
 \\ \\ /\\ / /  | |   | |  | ' /| |      \\ \\ /\\ / // _ \\| '_ \\    / _ \\  | '_ \\ | '_ \\ 
  \\ V  V /   | |   | |  | . \\| |___    \\ V  V /|  __/| |_) |  / ___ \\ | |_) || |_) |
   \\_/\\_/   |___|  |_|  |_|\\_\\\\____|    \\_/\\_/  \\___||_.__/  /_/   \\_\\| .__/ | .__/ 
                                                                      |_|    |_|    
  -- by Matthew Brazill (https://github.com/MatthewBrazill)


`)

// Initialize Datadog RUM
datadogRum.init({
    applicationId: 'd8892f0f-d31f-4804-b21e-c630a433a383',
    clientToken: 'pub86493d96655e179161fb37ff340b7255',
    site: 'datadoghq.com',
    service: 'witkc',
    sampleRate: 100,
    premiumSampleRate: 100,
    trackInteractions: true,
    defaultPrivacyLevel: 'mask-user-input'
});
datadogRum.startSessionReplayRecording();
logger.debug('Datadog Initialized')

// Create Server
start().catch((err) => {
    logger.error({
        error: err,
        stack: err.stack,
        message: `Fatal error when starting server`
    })
    console.log(`Fatal error when starting server: ${err.stack}`)
})
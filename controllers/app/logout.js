'use strict'

// Imports
const logger = require('../../log.js')

const logout = {
    async get(req, res) {
        req.session.destroy()

        logger.info(`Session '${req.sessionID}': Logging Out`)
        res.redirect('/')
    }
}

module.exports = logout
'use strict'

// Imports
const logger = require('../log.js')
const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB()

const sessions = {
    async create(sessionId, userId) {
        return dynamo.putItem({
            Item: {
                'session-id': { S: sessionId },
                'user-id': { S: userId }
            },
            TableName: 'witkc-sessions'
        }).promise().then(() => {
            logger.info(`Session '${sessionId}': Created`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to create session '${sessionId}'! ${err}`)
            return false
        })
    },

    async create(sessionId) {
        return dynamo.putItem({
            Item: { 'session-id': { S: sessionId } },
            TableName: 'witkc-sessions'
        }).promise().then(() => {
            logger.info(`Session '${sessionId}': Created`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to create session '${sessionId}'! ${err}`)
            return false
        })
    },

    async includes(sessionId) {
        return dynamo.getItem({
            Key: { 'session-id': { S: sessionId } },
            TableName: 'witkc-sessions'
        }).promise().then((data) => {
            if (data.Item != undefined) return true
            else return false
        }).catch((err) => {
            logger.warn(`Error when querying session '${sessionId}'! ${err}`)
            return false
        })
    },

    async destroy(sessionId) {
        return dynamo.deleteItem({
            Key: { 'session-id': { S: sessionId } },
            TableName: 'witkc-sessions'
        }).promise().then(() => {
            logger.info(`Session '${sessionId}': Destroyed`)
            return true
        }).catch((err) => {
            logger.warn(`Failed to destroy session '${sessionId}'! ${err}`)
            return false
        })
    }
}

module.exports = sessions
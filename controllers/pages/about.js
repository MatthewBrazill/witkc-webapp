'use strict'

// Imports
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const helper = require('../helper.js')
const committeeData = require('../../data_managers/committee.js')

const about = {
    async historyPage(req, res) {
        var data = await helper.viewData(req, 'About Us')
        res.render(`${req.device.type}/about`, data)
    },

    async committeePage(req, res) {
        var data = await helper.viewData(req, 'Committee')
        data.committee = await committeeData.getAll()

        // Since the images come from the committee call and not view data, the images still need to be resolved
        for (var role of data.committee) role.member.img = await s3.getSignedUrlPromise('getObject', { Bucket: 'setukc-private', Key: role.member.img })
        res.render(`${req.device.type}/committee`, data)
    },

    async constitutionPage(req, res) {
        var data = await helper.viewData(req, 'Constitution')
        res.render(`${req.device.type}/constitution`, data)
    }
}

module.exports = about
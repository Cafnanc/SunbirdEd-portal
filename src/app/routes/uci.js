const proxyUtils = require('../proxy/proxyUtils.js');
const BASE_REPORT_URL = "/admin";
const proxy = require('express-http-proxy');
const { discussions_middleware } = require('../helpers/environmentVariablesHelper.js');
const jwt = require('jsonwebtoken');
const _ = require('lodash')
const bodyParser = require('body-parser');
const dateFormat = require('dateformat')
const { logger } = require('@project-sunbird/logger');
const isAPIWhitelisted  = require('../helpers/apiWhiteList');


module.exports = function (app) {
    app.get(`${BASE_REPORT_URL}/v1/bot/get`, proxyUtils.verifyToken(), proxyObject());
    app.get(`${BASE_REPORT_URL}/v1/bot/search'`, proxyUtils.verifyToken(), proxyObject());
    app.get(`${BASE_REPORT_URL}/v1/bot/pause/:botId`, proxyUtils.verifyToken(), proxyObject());
    app.get(`${BASE_REPORT_URL}/v1/bot/start/:botId`, proxyUtils.verifyToken(), proxyObject());
    app.get(`${BASE_REPORT_URL}/v1/bot/delete/:botId`, proxyUtils.verifyToken(), proxyObject());
    app.get(`${BASE_REPORT_URL}/v1/bot/get/:id`, proxyUtils.verifyToken(), proxyObject());
    app.get(`${BASE_REPORT_URL}/v1/bot/getByParam`, proxyUtils.verifyToken(), proxyObject());
    app.post(`${BASE_REPORT_URL}/v1/bot/create`, proxyUtils.verifyToken(), proxyObject());
    app.post(`${BASE_REPORT_URL}/v1/bot/update/:id`, proxyUtils.verifyToken(), proxyObject());

    app.get(`${BASE_REPORT_URL}/v1/userSegment/get`, proxyUtils.verifyToken(), proxyObject());
    app.get(`${BASE_REPORT_URL}/v1/userSegment/search`, proxyUtils.verifyToken(), proxyObject());
    app.post(`${BASE_REPORT_URL}/v1/userSegment/create`, proxyUtils.verifyToken(), proxyObject());
    app.post(`${BASE_REPORT_URL}/v1/userSegment/queryBuilder`, proxyUtils.verifyToken(), proxyObject());

    app.post(`${BASE_REPORT_URL}/v1/conversationLogic/create`, proxyUtils.verifyToken(), proxyObject());
    app.post(`${BASE_REPORT_URL}/v1/conversationLogic/update/:id`, proxyUtils.verifyToken(), proxyObject());
    app.get(`${BASE_REPORT_URL}/v1/conversationLogic/delete/:id`, proxyUtils.verifyToken(), proxyObject());

    app.post(`${BASE_REPORT_URL}/v1/forms/upload`, proxyUtils.verifyToken(), proxyObject());

    app.post(`/v1/graphql`, proxyUtils.verifyToken(), proxyObject());
};

function addHeaders() {
    return function (proxyReqOpts, srcReq) {
    //    let decoratedHeaders =  proxyUtils.decorateRequestHeaders(discussions_middleware)()
        proxyReqOpts.headers['Authorization'] = 'Bearer ' + srcReq.session['nodebb_authorization_token'];
        return proxyReqOpts;
    }
}

function proxyObject() {
    return proxy(discussions_middleware, {
        proxyReqOptDecorator: addHeaders(),
        proxyReqPathResolver: function (req) {
            let urlParam = req.originalUrl;
            console.log("Request comming from :", urlParam)
            let query = require('url').parse(req.url).query;
            if (query) {
                return require('url').parse(discussions_middleware + urlParam + '?' + query).path
            } else {
                return require('url').parse(discussions_middleware + urlParam).path
            }
        },
        userResDecorator: (proxyRes, proxyResData, req, res) => {
            try {
                const data = JSON.parse(proxyResData.toString('utf8'));
                if (req.method === 'GET' && proxyRes.statusCode === 404 && (typeof data.message === 'string' && data.message.toLowerCase() === 'API not found with these values'.toLowerCase())) res.redirect('/')
                else return proxyUtils.handleSessionExpiry(proxyRes, proxyResData, req, res, data);
            } catch (err) {
                logger.error({message: err});
                return proxyUtils.handleSessionExpiry(proxyRes, proxyResData, req, res);
            }
        }
    })
}

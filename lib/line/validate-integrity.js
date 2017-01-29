'use strict';

const crypto = require('crypto');
const tsscmp = require('tsscmp');
const envUtils = require('../utils/env-utils');

module.exports = function validateLineRequestIntegrity(request) {
  const xLineSignature = request.headers['X-Line-Signature'] || request.headers['x-line-signature'];
  const serverSignature = crypto
    .createHmac('sha256', envUtils.decode(request.env.lineChannelSecret))
    .update(request.rawBody, 'utf8')
    .digest('base64');
  return tsscmp(xLineSignature, serverSignature);
};

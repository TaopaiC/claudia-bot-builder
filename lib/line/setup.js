'use strict';

const prompt = require('souffleur');
const lineParse = require('./parse');
const lineReply = require('./reply');
const validateLineRequestIntegrity = require('./validate-integrity');
const color = require('../console-colors');
const envUtils = require('../utils/env-utils');

module.exports = function lineSetup(api, bot, logError, optionalParser, optionalResponder) {
  let parser = optionalParser || lineParse;
  let responder = optionalResponder || lineReply;

  api.post('/line', request => {
    if (request.env.lineChannelSecret && !validateLineRequestIntegrity(request))
      return Promise.reject('X-Line-Signature does not match');

    let arr = [].concat.apply([], request.body.events);
    let lineHandle = parsedMessage => {
      if (parsedMessage) {
        var replyToken = parsedMessage.replyToken;

        return Promise.resolve(parsedMessage).then(parsedMessage => bot(parsedMessage, request))
          .then(botResponse => responder(replyToken, botResponse, envUtils.decode(request.env.lineChannelAccessToken)))
          .catch(logError);
      }
    };

    return Promise.all(arr.map(message => lineHandle(parser(message))))
      .then(() => 'ok');
  });

  api.addPostDeployStep('line', (options, lambdaDetails, utils) => {
    return Promise.resolve().then(() => {
      if (options['configure-line']) {
        console.log(`\n\n${color.green}Line command setup${color.reset}\n`);
        console.log(`\nConfigure your Line endpoint to HTTPS and set this URL:.\n`);
        console.log(`\n${color.cyan}${lambdaDetails.apiUrl}/line${color.reset}\n`);

        return prompt(['Line Channel Secret', 'Line Channel Access Token'])
          .then(results => {
            const deployment = {
              restApiId: lambdaDetails.apiId,
              stageName: lambdaDetails.alias,
              variables: {
                lineChannelSecret: envUtils.encode(results['Line Channel Secret']),
                lineChannelAccessToken: envUtils.encode(results['Line Channel Access Token'])
              }
            };

            console.log(`\n`);

            return utils.apiGatewayPromise.createDeploymentPromise(deployment);
          });
      }
    })
      .then(() => `${lambdaDetails.apiUrl}/line`);
  });
};

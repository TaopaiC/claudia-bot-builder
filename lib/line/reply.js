'use strict';

const rp = require('minimal-request-promise'),
  breakText = require('../breaktext');

const MAX_AMOUNT_OF_ACTIONS = 5;

function breakTextAndReturnFormatted(message) {
  return breakText(message, 320).map(m => ({ type: 'text', text: m }));
}

function send(replyToken, messages, lineAccessToken) {
  // there is no replyToken for unfollow and leave event
  if (!replyToken)
    return Promise.resolve();

  if (!messages.length)
    return Promise.resolve();

  const messageBody = {
    replyToken: replyToken
  };

  messageBody.messages = messages;

  const options = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${lineAccessToken}`
    },
    body: JSON.stringify(messageBody)
  };
  return rp.post('https://api.line.me/v2/bot/message/reply', options);
}

module.exports = function lineReply(replyToken, message, lineAccessToken) {
  var messages = [];

  if (typeof message === 'string') {
    messages = breakTextAndReturnFormatted(message).slice(0, MAX_AMOUNT_OF_ACTIONS);
  } else if (Array.isArray(message)) {
    message.forEach(msg => {
      if (typeof msg === 'string') {
        const available = Math.max(1, MAX_AMOUNT_OF_ACTIONS - message.length + 1);
        messages = messages.concat(breakTextAndReturnFormatted(msg).slice(0, available));
      } else {
        messages.push(msg);
      }
    });
  } else if (!message) {
    return Promise.resolve();
  } else {
    messages = [message];
  }

  return send(replyToken, messages, lineAccessToken);
};


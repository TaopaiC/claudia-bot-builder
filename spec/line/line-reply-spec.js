/*global describe, it, expect, require, jasmine */
'use strict';
const reply = require('../../lib/line/reply'),
  https = require('https');

describe('Line Reply', () => {

  it('includes the Line Authorization and Content type application/json in the header', done => {
    https.request.pipe(callOptions => {
      let lineChannelAccessToken = 'LineRandomAccessToken';
      let data = {replyToken: 'randomLineToken', messages: [{type: 'message', text: 'hello Line'}]};
      expect(callOptions).toEqual(jasmine.objectContaining({
        method: 'POST',
        hostname: 'api.line.me',
        path: '/v2/bot/message/reply',
        headers: {
          'Authorization': `Bearer ${lineChannelAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }));
      done();
    });
    reply('randomLineToken', {type: 'message', text: 'hello Line'}, 'LineRandomAccessToken');
  });

  it('sends messages as a string', done => {
    https.request.pipe(callOptions => {
      expect(callOptions.body).toEqual(JSON.stringify({
        replyToken: 'randomLineToken',
        messages: [
          {
            type: 'message',
            text: 'hello Line'
          }
        ]}));
      done();
    });
    reply('randomLineToken', {type: 'message', text: 'hello Line'}, 'LineRandomAccessToken');
  });

  it('does not resolve before the https endpoint responds', done => {
    https.request.pipe(done);
    reply('randomLineToken', {type: 'message', text: 'hello Line'}, 'LineRandomAccessToken')
      .then(done.fail, done.fail);
  });

  it('resolves when the https endpoint responds with 200', done => {
    https.request.pipe(() => {
      setTimeout(() => {
        https.request.calls[0].respond('200', 'OK', 'hello Line');
      }, 10);
    });
    reply('randomLineToken', {type: 'message', text: 'hello Line'}, 'LineRandomAccessToken').then(done, done.fail);
  });

  it('sends large text messages split into several', done => {
    var fiveHundred = new Array(101).join('blok ');

    https.request.pipe(function () {
      this.respond('200', 'OK', 'Hi there');
    });

    reply('user123', fiveHundred, 'ACCESS123').then(() => {
      expect(https.request.calls.length).toEqual(1);
      expect(JSON.parse(https.request.calls[0].args[0].body)).toEqual({
        replyToken: 'user123',
        messages: [{
          type: 'text',
          text: new Array(320/5).join('blok ') + 'blok'
        }, {
          type: 'text',
          text: new Array((500 - 320)/5).join('blok ') + 'blok'
        }]
      });
    }).then(done, done.fail);
  });
  it('sends requests in sequence', done => {
    var fiveHundred = new Array(101).join('blok ');

    https.request.pipe(() => {
      Promise.resolve().then(() => {
        expect(https.request.calls.length).toEqual(1);
      }).then(done);
    });

    reply('user123', fiveHundred, 'ACCESS123');
  });
  describe('when an array is passed', () => {
    it('does not send the second request until the first one completes', done => {
      let answers = ['foo', 'bar'];
      https.request.pipe(() => {
        Promise.resolve().then(() => {
          expect(https.request.calls.length).toEqual(1);
        }).then(done);
      });
      reply('user123', answers, 'ACCESS123');
    });
    it('sends the request', done => {
      let answers = ['foo', 'bar'];
      https.request.pipe(function () {
        this.respond('200', 'OK');
        Promise.resolve().then(() => {
          expect(https.request.calls.length).toEqual(1);
          expect(JSON.parse(https.request.calls[0].body[0])).toEqual({replyToken:'user123',messages:[{type:'text',text:'foo'},{type:'text',text:'bar'}]});
        }).then(done);
      });
      reply('user123', answers, 'ACCESS123');

    });

  });
  it('sends complex messages without transforming into a text object', done => {
    https.request.pipe(callOptions => {
      expect(JSON.parse(callOptions.body)).toEqual({
        replyToken: 'user123',
        messages: [
          {
            type: 'text',
            text: 'red'
          }
        ]
      });
      done();
    });
    reply('user123', { type: 'text', text: 'red' }, 'ACCESS123');
  });
  it('does not send a message if message is not provided', () => {
    reply('user123', null, 'ACCESS123')
      .then(() => {
        expect(https.request.calls.length).toBe(0);
      });
    reply('user123', false, 'ACCESS123')
      .then(() => {
        expect(https.request.calls.length).toBe(0);
      });
    reply('user123', undefined, 'ACCESS123')
      .then(() => {
        expect(https.request.calls.length).toBe(0);
      });
  });
});

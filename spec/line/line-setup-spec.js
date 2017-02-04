/*global require, describe, it, expect, beforeEach, jasmine, xit */
'use strict';
var underTest = require('../../lib/line/setup');
describe('line setup', () => {
  var api, bot, logError, parser, responder, botPromise, botResolve, botReject;
  beforeEach(() => {
    api = jasmine.createSpyObj('api', ['get', 'post', 'addPostDeployStep']);
    botPromise = new Promise((resolve, reject) => {
      botResolve = resolve;
      botReject = reject;
    });
    bot = jasmine.createSpy().and.returnValue(botPromise);
    parser = jasmine.createSpy();
    logError = jasmine.createSpy();
    responder = jasmine.createSpy();
    underTest(api, bot, logError, parser, responder);
  });
  describe('message processor', () => {
    const singleMessageTemplate = {
      'events': [
        {
          'object':'message',
          'replyToken': 'a98h',
          'source': {
            'userId': 'biho98yh',
            'type': 'user'
          },
          'timestamp': 1485969178383,
          'message': {
            'type': 'text',
            'id': '9fh9u9',
            'text': 'hello'
          }
        }
      ]
    };
    it('wires the POST request for line to the message processor', () => {
      expect(api.post.calls.count()).toEqual(1);
      expect(api.post).toHaveBeenCalledWith('/line', jasmine.any(Function));
    });
    describe('processing a single message', () => {
      var handler;
      beforeEach(() => {
        handler = api.post.calls.argsFor(0)[1];
      });
      it('should fail if x line signature does not match', done => {
        handler({
          body: singleMessageTemplate,
          rawBody: '{"events":[{"object":"message","replyToken":"a98h","source":{"userId":"biho98yh","type":"user"},"timestamp":1485969178383,"message":{"type":"text","id":"9fh9u9","text":"hello"}}]}',
          headers: {'X-Line-Signature': 'dsd'},
          env: {lineChannelAccessToken: 'QUJD', lineChannelSecret: '54321'}
        })
        .catch(err => {
          expect(err).toBe('X-Line-Signature does not match');
          return;
        })
        .then(done, done.fail);
      });
      it('breaks down the message and puts it into the parser', () => {
        handler({body: singleMessageTemplate, env: {lineChannelAccessToken: 'QUJD'}});
        expect(parser.calls.argsFor(0)[0]).toEqual({
          'object':'message',
          'replyToken': 'a98h',
          'source': {
            'userId': 'biho98yh',
            'type': 'user'
          },
          'timestamp': 1485969178383,
          'message': {
            'type': 'text',
            'id': '9fh9u9',
            'text': 'hello'
          }
        });
      });
      it('passes the parsed value to the bot if a message can be parsed', (done) => {
        parser.and.returnValue('MSG1');
        handler({body: singleMessageTemplate, env: {}});
        Promise.resolve().then(() => {
          expect(bot).toHaveBeenCalledWith('MSG1', { body: singleMessageTemplate, env: {} });
        }).then(done, done.fail);
      });
      it('does not invoke the bot if the message cannot be parsed', (done) => {
        parser.and.returnValue(false);
        handler({body: singleMessageTemplate, env: {}}).then((message) => {
          expect(message).toBe('ok');
          expect(bot).not.toHaveBeenCalled();
        }).then(done, done.fail);
      });
      it('responds when the bot resolves', (done) => {
        parser.and.returnValue({replyToken: 'user1', text: 'MSG1'});
        botResolve('Yes Yes');
        handler({body: singleMessageTemplate, env: {lineChannelAccessToken: 'QUJD'}}).then((message) => {
          expect(message).toBe('ok');
          expect(responder).toHaveBeenCalledWith('user1', 'Yes Yes', 'ABC');
        }).then(done, done.fail);
      });
      it('can work with bot responses as strings', (done) => {
        bot.and.returnValue('Yes!');
        parser.and.returnValue({replyToken: 'user1', text: 'MSG1'});
        handler({body: singleMessageTemplate, env: {lineChannelAccessToken: 'QUJD'}}).then((message) => {
          expect(message).toBe('ok');
          expect(responder).toHaveBeenCalledWith('user1', 'Yes!', 'ABC');
        }).then(done, done.fail);

      });
      it('logs error when the bot rejects without responding', (done) => {
        parser.and.returnValue('MSG1');

        handler({body: singleMessageTemplate, env: {}}).then((message) => {
          expect(message).toBe('ok');
          expect(responder).not.toHaveBeenCalled();
          expect(logError).toHaveBeenCalledWith('No No');
        }).then(done, done.fail);

        botReject('No No');
      });
      it('logs the error when the responder throws an error', (done) => {
        parser.and.returnValue('MSG1');
        responder.and.throwError('XXX');
        botResolve('Yes');
        handler({body: singleMessageTemplate, env: {lineChannelAccessToken: 'QUJD'}}).then((message) => {
          expect(message).toBe('ok');
          expect(logError).toHaveBeenCalledWith(jasmine.any(Error));
        }).then(done, done.fail);
      });
      describe('working with promises in responders', () => {
        var responderResolve, responderReject, responderPromise, hasResolved;
        beforeEach(() => {
          responderPromise = new Promise((resolve, reject) => {
            responderResolve = resolve;
            responderReject = reject;
          });
          responder.and.returnValue(responderPromise);

          parser.and.returnValue('MSG1');
        });
        it('waits for the responders to resolve before completing the request', (done) => {
          handler({body: singleMessageTemplate, env: {lineChannelAccessToken: 'QBJD'}}).then(() => {
            hasResolved = true;
          });

          botPromise.then(() => {
            expect(hasResolved).toBeFalsy();
          }).then(done, done.fail);

          botResolve('YES');
        });
        it('resolves when the responder resolves', (done) => {
          handler({body: singleMessageTemplate, env: {lineChannelAccessToken: 'QBJD'}}).then((message) => {
            expect(message).toEqual('ok');
          }).then(done, done.fail);

          botPromise.then(() => {
            responderResolve('As Promised!');
          });
          botResolve('YES');
        });
        it('logs error when the responder rejects', (done) => {
          handler({body: singleMessageTemplate, env: {lineChannelAccessToken: 'QBJD'}}).then((message) => {
            expect(message).toEqual('ok');
            expect(logError).toHaveBeenCalledWith('Bomb!');
          }).then(done, done.fail);

          botPromise.then(() => {
            responderReject('Bomb!');
          });
          botResolve('YES');
        });
      });
    });
    describe('multiple messages', () => {
      const multiMessageTemplate = {
        'events': [
          {
            'object':'message',
            'replyToken': 'bowe',
            'source': {
              'userId': 'biho98yh',
              'type': 'user'
            },
            'timestamp': 1485969178383,
            'message': {
              'type': 'text',
              'id': '9fh9u9',
              'text': 'hello'
            }
          },
          {
            'object':'message',
            'replyToken': 'a98h',
            'source': {
              'userId': 'biho98yh',
              'type': 'user'
            },
            'timestamp': 1485969178383,
            'message': {
              'type': 'text',
              'id': 'wfnmp23',
              'text': 'ping'
            }
          },
          {
            'object':'message',
            'replyToken': 'codj0',
            'source': {
              'userId': 'cff9e9j',
              'type': 'user'
            },
            'timestamp': 1485969178383,
            'message': {
              'type': 'text',
              'id': '9f9uj',
              'text': 'pong'
            }
          },
          {
            'object':'message',
            'replyToken': 'd9ujo',
            'source': {
              'userId': 'dujve098',
              'type': 'user'
            },
            'timestamp': 1485969178383,
            'message': {
              'type': 'text',
              'id': '89hnvp',
              'text': 'got'
            }
          }
        ]
      };
      var botPromises,
        responderPromises,
        handler,
        buildPromiseFor = (array) => {
          var pResolve, pReject, promise;
          promise = new Promise((resolve, reject) => {
            pResolve = resolve;
            pReject = reject;
          });
          promise.resolve = pResolve;
          promise.reject = pReject;
          array.push(promise);
          return promise;
        };

      beforeEach(() => {
        var index = 0;
        botPromises = [];
        responderPromises = [];
        bot.and.callFake(() => {
          return buildPromiseFor(botPromises);
        });
        responder.and.callFake(() => {
          return buildPromiseFor(responderPromises);
        });
        handler = api.post.calls.argsFor(0)[1];
        parser.and.callFake(() => {
          index += 1;
          return {
            replyToken: 'replyToken' + index,
            sender: 'sender' + index,
            text: 'text' + index
          };
        });
      });
      it('parses messages in sequence', () => {
        handler({body: multiMessageTemplate, env: {lineChannelAccessToken: 'QBJD'}});
        expect(parser.calls.count()).toBe(4);
        expect(parser.calls.argsFor(0)[0]).toEqual({
          'object':'message',
          'replyToken': 'bowe',
          'source': {
            'userId': 'biho98yh',
            'type': 'user'
          },
          'timestamp': 1485969178383,
          'message': {
            'type': 'text',
            'id': '9fh9u9',
            'text': 'hello'
          }
        });
        expect(parser.calls.argsFor(1)[0]).toEqual({
          'object':'message',
          'replyToken': 'a98h',
          'source': {
            'userId': 'biho98yh',
            'type': 'user'
          },
          'timestamp': 1485969178383,
          'message': {
            'type': 'text',
            'id': 'wfnmp23',
            'text': 'ping'
          }
        });
        expect(parser.calls.argsFor(2)[0]).toEqual({
          'object':'message',
          'replyToken': 'codj0',
          'source': {
            'userId': 'cff9e9j',
            'type': 'user'
          },
          'timestamp': 1485969178383,
          'message': {
            'type': 'text',
            'id': '9f9uj',
            'text': 'pong'
          }
        });
        expect(parser.calls.argsFor(3)[0]).toEqual({
          'object':'message',
          'replyToken': 'd9ujo',
          'source': {
            'userId': 'dujve098',
            'type': 'user'
          },
          'timestamp': 1485969178383,
          'message': {
            'type': 'text',
            'id': '89hnvp',
            'text': 'got'
          }
        });
      });
      it('calls the bot for each message individually', (done) => {
        handler({body: multiMessageTemplate, env: {lineChannelAccessToken: 'QBJD'}});
        Promise.resolve().then(() => {
          expect(bot.calls.count()).toEqual(4);
          expect(bot).toHaveBeenCalledWith({replyToken: 'replyToken1', sender: 'sender1', text: 'text1'}, {body: multiMessageTemplate, env: {lineChannelAccessToken: 'QBJD'}});
          expect(bot).toHaveBeenCalledWith({replyToken: 'replyToken2', sender: 'sender2', text: 'text2'}, {body: multiMessageTemplate, env: {lineChannelAccessToken: 'QBJD'}});
          expect(bot).toHaveBeenCalledWith({replyToken: 'replyToken3', sender: 'sender3', text: 'text3'}, {body: multiMessageTemplate, env: {lineChannelAccessToken: 'QBJD'}});
          expect(bot).toHaveBeenCalledWith({replyToken: 'replyToken4', sender: 'sender4', text: 'text4'}, {body: multiMessageTemplate, env: {lineChannelAccessToken: 'QBJD'}});
        }).then(done, done.fail);
      });
      xit('calls the responders for each bot response individually', (done) => {
        handler({body: multiMessageTemplate, env: {lineChannelAccessToken: 'QBJD'}});
        Promise.resolve().then(() => {
          botPromises[0].resolve('From first');
          botPromises[1].resolve('From second');
          botPromises[2].resolve('From 3');
          botPromises[3].resolve('From 4');
          return botPromises[3];
        }).then(() => {
          expect(responder).toHaveBeenCalledWith('sender1', 'From first', 'ABC');
          expect(responder).toHaveBeenCalledWith('sender2', 'From second', 'ABC');
        }).then(done, done.fail);
      });
      it('does not resolve until all the responders resolve', (done) => {
        var hasResolved;
        handler({body: multiMessageTemplate, env: {lineChannelAccessToken: 'QBJD'}}).then(() => {
          hasResolved = true;
        }).then(done.fail, done.fail);
        Promise.resolve().then(() => {
          botPromises.forEach((p) => p.resolve('group'));
          return botPromises.pop();
        }).then(() => {
          responderPromises.slice(1).forEach((p) => p.resolve('result'));
          return responderPromises.pop();
        }).then(() => {
          expect(hasResolved).toBeFalsy();
        }).then(done, done.fail);
      });
      xit('resolves when all the responders resolve', (done) => {
        handler({body: multiMessageTemplate, env: {lineChannelAccessToken: 'QBJD'}}).then((message) => {
          expect(message).toEqual('ok');
        }).then(done, done.fail);
        Promise.resolve().then(() => {
          botPromises.forEach((p) => p.resolve('group'));
          return botPromises.pop();
        }).then(() => {
          responderPromises.forEach((p) => p.resolve('result'));
          return responderPromises.pop();
        });
      });
    });

  });
});

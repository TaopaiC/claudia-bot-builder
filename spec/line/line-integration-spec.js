/*global describe, it, jasmine, expect, beforeEach*/
var botBuilder = require('../../lib/bot-builder'),
  https = require('https');
describe('Line Bot integration test', () => {
  var messageHandler,
    underTest,
    lambdaContextSpy,
    singleMessageTemplate = '{"events":[{"object":"message","replyToken":"a98h","source":{"userId":"biho98yh","type":"user"},"timestamp":1485969178383,"message":{"type":"text","id":"9fh9u9","text":"hello"}}]}';

  beforeEach(() => {
    messageHandler = jasmine.createSpy('messageHandler');
    lambdaContextSpy = jasmine.createSpyObj('lambdaContext', ['done']);
    underTest = botBuilder(messageHandler, {}, () => {});
  });

  describe('API integration wiring', () => {
    describe('message handling', () => {
      it('sends the response using https to line', done => {
        messageHandler.and.returnValue(Promise.resolve('YES'));

        underTest.proxyRouter({
          requestContext: {
            resourcePath: '/line',
            httpMethod: 'POST'
          },
          body: singleMessageTemplate,
          headers: {
            'X-Line-Signature': 'BYFRpP6w8/KWYMKjL90uFK/pJsAdnL5/B8TY8i0GD5w=',
            'Content-Type': 'application/json'
          },
          stageVariables: {
            lineChannelAccessToken: 'MTIzNDU=',
            lineChannelSecret: 'QUJD'
          }
        }, lambdaContextSpy);

        https.request.pipe(callOptions => {
          expect(callOptions).toEqual(jasmine.objectContaining({
            method: 'POST',
            hostname: 'api.line.me',
            path: '/v2/bot/message/reply',
            protocol: 'https:',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer 12345' },
            body: '{"replyToken":"a98h","messages":[{"type":"text","text":"YES"}]}'
          }));
          done();
        });
      });
    });
  });
});

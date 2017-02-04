/*global describe, it, expect, require */
var parse = require('../../lib/line/parse');
describe('Line parse', () => {
  it('returns nothing if the format is invalid', () => {
    expect(parse('string')).toBeUndefined();
    expect(parse()).toBeUndefined();
    expect(parse(false)).toBeUndefined();
    expect(parse(123)).toBeUndefined();
    expect(parse({})).toBeUndefined();
    expect(parse([1, 2, 3])).toBeUndefined();
  });
  it('returns false if the source is missing', () => {
    expect(parse({message: 'pete'})).toBeUndefined();
  });
  it('returns a parsed object when there message and source are present', () => {
    var msg = {replyToken: '123as', source: {userId: '1234', type: 'user'}, message: { text: 'Hello' }};
    expect(parse(msg, {})).toEqual({ replyToken: '123as', sender: '1234', text: 'Hello', originalRequest: msg, type: 'line'});
  });
  it('returns a parsed object for postback messages', () => {
    var msg = {
      replyToken: '123qw',
      source: { userId: '12345', type: 'user' },
      type: 'message',
      timestamp: 1465558466933,
      postback: { data: 'POSTBACK' }
    };
    expect(parse(msg)).toEqual({
      replyToken: '123qw',
      sender: '12345',
      text: 'POSTBACK',
      originalRequest: msg,
      postback: true,
      type: 'line'
    });
  });
  it('returns a parsed object for image message', () => {
    var msg = {
      type: 'message',
      replyToken: '3452',
      source: { userId: '12345', type: 'user' },
      timestamp: 1465558466933,
      message: {
        type: 'image',
        id: 'random-image-id'
      }
    };
    expect(parse(msg)).toEqual({
      sender: '12345',
      replyToken: '3452',
      originalRequest: msg,
      type: 'line',
      text: ''
    });
  });
  it('returns a parsed object for video message', () => {
    var msg = {
      type: 'message',
      replyToken: '3452',
      source: { userId: '12345', type: 'user' },
      timestamp: 1465558466933,
      message: {
        type: 'video',
        id: 'random-video-id'
      }
    };
    expect(parse(msg)).toEqual({
      sender: '12345',
      replyToken: '3452',
      originalRequest: msg,
      type: 'line',
      text: ''
    });
  });
  it('returns a parsed object for audio message', () => {
    var msg = {
      type: 'message',
      replyToken: '3452',
      source: { userId: '12345', type: 'user' },
      timestamp: 1465558466933,
      message: {
        type: 'audio',
        id: 'random-audio-id'
      }
    };
    expect(parse(msg)).toEqual({
      sender: '12345',
      replyToken: '3452',
      originalRequest: msg,
      type: 'line',
      text: ''
    });
  });
  it('returns a parsed object for location message', () => {
    var msg = {
      type: 'message',
      replyToken: '3452',
      source: { userId: '12345', type: 'user' },
      timestamp: 1465558466933,
      message: {
        type: 'audio',
        id: 'random-audio-id'
      }
    };
    expect(parse(msg)).toEqual({
      sender: '12345',
      replyToken: '3452',
      originalRequest: msg,
      type: 'line',
      text: ''
    });
  });
  it('returns a parsed object for sticker message', () => {
    var msg = {
      replyToken: '3452',
      source: { userId: '12345', type: 'user' },
      type: 'message',
      timestamp: 1465558466933,
      message: {
        type: 'location',
        id: 'random-location-id',
        title: '位置訊息',
        address: 'somewhere on earth',
        latitude: 20,
        longitude: 44
      }
    };
    expect(parse(msg)).toEqual({
      sender: '12345',
      replyToken: '3452',
      originalRequest: msg,
      type: 'line',
      text: ''
    });
  });
  it('returns a parsed object for unfollow message', () => {
    var msg = {
      source: { userId: '12345', type: 'user' },
      type: 'unfollow',
      timestamp: 1465558466933
    };
    expect(parse(msg)).toEqual({
      sender: '12345',
      originalRequest: msg,
      type: 'line',
      text: ''
    });
  });
  it('returns a parsed object for follow message', () => {
    var msg = {
      source: { userId: '12345', type: 'user' },
      type: 'unfollow',
      timestamp: 1465558466933
    };
    expect(parse(msg)).toEqual({
      sender: '12345',
      originalRequest: msg,
      type: 'line',
      text: ''
    });
  });
  it('returns a parsed object for join room message', () => {
    var msg = {
      replyToken: '3452',
      source: { roomId: '12345', type: 'room' },
      type: 'join',
      timestamp: 1465558466933
    };
    expect(parse(msg)).toEqual({
      sender: '12345',
      replyToken: '3452',
      originalRequest: msg,
      type: 'line',
      text: ''
    });
  });
  it('returns a parsed object for join group message', () => {
    var msg = {
      replyToken: '3452',
      source: { groupId: '12345', type: 'group' },
      type: 'join',
      timestamp: 1465558466933
    };
    expect(parse(msg)).toEqual({
      sender: '12345',
      replyToken: '3452',
      originalRequest: msg,
      type: 'line',
      text: ''
    });
  });
  it('returns a parsed object for leave group message', () => {
    var msg = {
      source: { groupId: '12345', type: 'group' },
      type: 'leave',
      timestamp: 1465558466933
    };
    expect(parse(msg)).toEqual({
      sender: '12345',
      originalRequest: msg,
      type: 'line',
      text: ''
    });
  });
  it('returns a parsed object for beacon message', () => {
    var msg = {
      replyToken: '3452',
      source: { userId: '12345', type: 'user' },
      type: 'beacon',
      timestamp: 1465558466933,
      beacon: {
        hwid: 'd41d8cd98f',
        type: 'enter'
      }
    };
    expect(parse(msg)).toEqual({
      sender: '12345',
      replyToken: '3452',
      originalRequest: msg,
      type: 'line',
      text: ''
    });
  });
});

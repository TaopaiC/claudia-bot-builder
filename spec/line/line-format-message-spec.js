/*global describe, it, expect, require */
'use strict';

const formatLineMessage = require('../../lib/line/format-message');

describe('Line format message', () => {
  it('should export an object', () => {
    expect(typeof formatLineMessage).toBe('object');
  });

  describe('Text', () => {
    it('should be a class', () => {
      const message = new formatLineMessage.Text('text');
      expect(typeof formatLineMessage.Text).toBe('function');
      expect(message instanceof formatLineMessage.Text).toBeTruthy();
    });

    it('should throw an error if text is not provided', () => {
      expect(() => new formatLineMessage.Text()).toThrowError('Text is required for text message');
    });

    it('should add a text', () => {
      const message = new formatLineMessage.Text('Some text').get();
      expect(message.text).toBe('Some text');
    });

    it('should return a simple text object', () => {
      const message = new formatLineMessage.Text('Some text');
      expect(message.get()).toEqual({
        type: 'text',
        text: 'Some text'
      });
    });

    it('should throw an error if text is too long', () => {
      const text = new Array(201).join('0123456789') + '0';
      expect(() => new formatLineMessage.Text(text)).toThrowError('Text can not be more than 2000 characters');
    });
  });
});

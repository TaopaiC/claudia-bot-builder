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

  describe('Image', () => {
    it('should be a class', () => {
      const message = new formatLineMessage.Image('https://example.com/imageurl', 'https://example.com/previewurl');
      expect(typeof formatLineMessage.Image).toBe('function');
      expect(message instanceof formatLineMessage.Image).toBeTruthy();
    });
    it('should throw an error if url is not provided', () => {
      expect(() => new formatLineMessage.Image()).toThrowError('Image message required a valid URL as a first parameter');
    });
    it('should throw an error if url is not a valid url', () => {
      expect(() => new formatLineMessage.Image('imageurl')).toThrowError('Image message required a valid URL as a first parameter');
      expect(() => new formatLineMessage.Image('https://example.com/imageurl', 'previewurl')).toThrowError('Image message required a valid URL as a second parameter');
    });
    it('should throw an error if url is too long', () => {
      const longurl = new Array(99).join('0123456789');
      expect(() => new formatLineMessage.Image(`https://example.com/${longurl}/`)).toThrowError('originalContentUrl can not be more than 1000 characters');
      expect(() => new formatLineMessage.Image('https://example.com/imageurl', `https://example.com/${longurl}/`)).toThrowError('previewImageUrl can not be more than 1000 characters');
    });
    it('should return a simple message object', () => {
      const message = new formatLineMessage.Image('https://example.com/imageurl', 'https://example.com/previewurl');
      expect(message.get()).toEqual({
        type: 'image',
        originalContentUrl: 'https://example.com/imageurl',
        previewImageUrl: 'https://example.com/previewurl'
      });
    });
  });

  describe('Video', () => {
    it('should be a class', () => {
      const message = new formatLineMessage.Video('https://example.com/videourl', 'https://example.com/previewurl');
      expect(typeof formatLineMessage.Video).toBe('function');
      expect(message instanceof formatLineMessage.Video).toBeTruthy();
    });
    it('should throw an error if url is not provided', () => {
      expect(() => new formatLineMessage.Video()).toThrowError('Video message required a valid URL as a first parameter');
    });
    it('should throw an error if url is not a valid url', () => {
      expect(() => new formatLineMessage.Video('videourl')).toThrowError('Video message required a valid URL as a first parameter');
      expect(() => new formatLineMessage.Video('https://example.com/videourl', 'previewurl')).toThrowError('Video message required a valid URL as a second parameter');
    });
    it('should throw an error if url is too long', () => {
      const longurl = new Array(99).join('0123456789');
      expect(() => new formatLineMessage.Video(`https://example.com/${longurl}/`)).toThrowError('originalContentUrl can not be more than 1000 characters');
      expect(() => new formatLineMessage.Video('https://example.com/videourl', `https://example.com/${longurl}/`)).toThrowError('previewImageUrl can not be more than 1000 characters');
    });
    it('should return a simple message object', () => {
      const message = new formatLineMessage.Video('https://example.com/videourl', 'https://example.com/previewurl');
      expect(message.get()).toEqual({
        type: 'video',
        originalContentUrl: 'https://example.com/videourl',
        previewImageUrl: 'https://example.com/previewurl'
      });
    });
  });

  describe('Audio', () => {
    it('should be a class', () => {
      const message = new formatLineMessage.Audio('https://example.com/audiourl', 20);
      expect(typeof formatLineMessage.Audio).toBe('function');
      expect(message instanceof formatLineMessage.Audio).toBeTruthy();
    });
    it('should throw an error if url is not provided', () => {
      expect(() => new formatLineMessage.Audio()).toThrowError('Audio message required a valid URL as a first parameter');
    });
    it('should throw an error if url is not a valid url', () => {
      expect(() => new formatLineMessage.Audio('audiourl')).toThrowError('Audio message required a valid URL as a first parameter');
    });
    it('should throw an error if duration is not a valid number', () => {
      expect(() => new formatLineMessage.Audio('https://example.com/audiourl')).toThrowError('Audio message required a valid duration as a second parameter');
      expect(() => new formatLineMessage.Audio('https://example.com/audiourl', 't')).toThrowError('Audio message required a valid duration as a second parameter');
    });
    it('should throw an error if url is too long', () => {
      const longurl = new Array(99).join('0123456789');
      expect(() => new formatLineMessage.Audio(`https://example.com/${longurl}/`, 20)).toThrowError('originalContentUrl can not be more than 1000 characters');
    });
    it('should return a simple message object', () => {
      const message = new formatLineMessage.Audio('https://example.com/audiourl', 20);
      expect(message.get()).toEqual({
        type: 'audio',
        originalContentUrl: 'https://example.com/audiourl',
        duration: 20
      });
    });
  });

  describe('Location', () => {
    it('should be a class', () => {
      const message = new formatLineMessage.Location('Location title', 'Somewhere on earth', 20, 44);
      expect(typeof formatLineMessage.Location).toBe('function');
      expect(message instanceof formatLineMessage.Location).toBeTruthy();
    });
    it('should throw an error if title, address, latitude or longitude is not provided', () => {
      expect(() => new formatLineMessage.Location(undefined, 'Earth', 20, 44)).toThrowError('Location message required a title as a first parameter');
      expect(() => new formatLineMessage.Location('Location title', undefined, 20, 44)).toThrowError('Location message required an address as a second parameter');
      expect(() => new formatLineMessage.Location('Location title', 'Earth', undefined, 44)).toThrowError('Location message required a latitude as a third parameter');
      expect(() => new formatLineMessage.Location('Location title', 'Earth', 20)).toThrowError('Location message required a longitude as a fourth parameter');
    });
    it('should throw an error if latitude or longitude is not a valid number', () => {
      expect(() => new formatLineMessage.Location('Location title', 'Earth', 't', 44)).toThrowError('Location message required a latitude as a third parameter');
      expect(() => new formatLineMessage.Location('Location title', 'Earth', 20, 't')).toThrowError('Location message required a longitude as a fourth parameter');
    });
    it('should throw an error if title or address is too long', () => {
      const longtext = new Array(11).join('0123456789') + '1';
      expect(() => new formatLineMessage.Location(longtext, 'Earth', 20, 44)).toThrowError('title can not be more than 100 characters');
      expect(() => new formatLineMessage.Location('Location title', longtext, 20, 44)).toThrowError('address can not be more than 100 characters');
    });
    it('should return a simple message object', () => {
      const message = new formatLineMessage.Location('Location title', 'Earth', 20, 44);
      expect(message.get()).toEqual({
        type: 'location',
        title: 'Location title',
        address: 'Earth',
        latitude: 20,
        longitude: 44
      });
    });
  });
  describe('Sticker', () => {
    it('should be a class', () => {
      const message = new formatLineMessage.Sticker('123', '456');
      expect(typeof formatLineMessage.Sticker).toBe('function');
      expect(message instanceof formatLineMessage.Sticker).toBeTruthy();
    });
    it('should throw an error if packageId or stickerId is not provided', () => {
      expect(() => new formatLineMessage.Sticker()).toThrowError('Sticker message required a packageId as a first parameter');
      expect(() => new formatLineMessage.Sticker('123')).toThrowError('Sticker message required a stickerId as a second parameter');
      expect(() => new formatLineMessage.Sticker(undefined, '456')).toThrowError('Sticker message required a packageId as a first parameter');
    });
    it('should return a simple message object', () => {
      const message = new formatLineMessage.Sticker('123', '456');
      expect(message.get()).toEqual({
        type: 'sticker',
        packageId: '123',
        stickerId: '456'
      });
    });
  });
  describe('ImageMap', () => {
  });
  describe('Button', () => {
  });
  describe('Confirm', () => {
  });
  describe('Carousel', () => {
  });
});













/*global describe, it, expect, require, beforeEach */
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
      const longtext = new Array(99).join('0123456789');
      const longurl = `https://example.com/${longtext}/`;

      expect(() => new formatLineMessage.Video(longurl)).toThrowError('originalContentUrl can not be more than 1000 characters');
      expect(() => new formatLineMessage.Video('https://example.com/videourl', longurl)).toThrowError('previewImageUrl can not be more than 1000 characters');
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
    it('should be a class', () => {
      const message = new formatLineMessage.ImageMap('https://example.com/image/1/', 400, 300, 'alt text');
      expect(typeof formatLineMessage.ImageMap).toBe('function');
      expect(message instanceof formatLineMessage.ImageMap).toBeTruthy();
    });
    it('should throw an error if no action are added', () => {
      const message = new formatLineMessage.ImageMap('https://example.com/image/1/', 400, 300, 'alt text');
      expect(() => message.get()).toThrowError('Add at least one action first!');
    });
    it('should throw an error if more than 50 actions are added', () => {
      const message = new formatLineMessage.ImageMap('https://example.com/image/1/', 400, 300, 'alt text');
      for(let i = 0; i < 50; i++) {
        message.addMessageAction('text', {x: 20, y: 20, width: 20, height: 20});
      }
      expect(() => {
        message.addMessageAction('text', {x: 20, y: 20, width: 20, height: 20});
      }).toThrowError('There can not be more than 50 actions');
    });
    it('should throw an error if url is not valid for addUriAction', () => {
      const message = new formatLineMessage.ImageMap('https://example.com/image/1/', 400, 300, 'alt text');
      expect(() => {
        message.addUriAction('text', {x: 20, y: 20, width: 20, height: 20});
      }).toThrowError('linkUri has a bad url');
    });
    it('should throw an error if url is too long for addUriAction', () => {
      const message = new formatLineMessage.ImageMap('https://example.com/image/1/', 400, 300, 'alt text');
      expect(() => {
        const longtext = new Array(99).join('0123456789');
        const longurl = `https://example.com/${longtext}/`;
        message.addUriAction(longurl, {x: 20, y: 20, width: 20, height: 20});
      }).toThrowError('linkUri can not be more than 1000 characters');
    });
    it('should throw an error if text is too long for addMessageAction', () => {
      const message = new formatLineMessage.ImageMap('https://example.com/image/1/', 400, 300, 'alt text');
      expect(() => {
        const longtext = new Array(41).join('0123456789');
        const longurl = `${longtext}` + '1';
        message.addMessageAction(longurl, {x: 20, y: 20, width: 20, height: 20});
      }).toThrowError('text can not be more than 400 characters');
    });
    it('should return a simple message object', () => {
      const message = new formatLineMessage.ImageMap('https://example.com/image/1/', 400, 300, 'alt text')
        .addUriAction('https://example.com/a', {x: 10, y: 10, width: 10, height: 10})
        .addMessageAction('text', {x: 20, y: 20, width: 20, height: 20});
      expect(message.get()).toEqual({
        type: 'imagemap',
        baseUrl: 'https://example.com/image/1/',
        altText: 'alt text',
        baseSize: {
          height: 300,
          width: 400
        },
        actions: [
          {
            type: 'uri',
            linkUri: 'https://example.com/a',
            area: {x: 10, y: 10, width: 10, height: 10}
          },
          {
            type: 'message',
            text: 'text',
            area: {x: 20, y: 20, width: 20, height: 20}
          }
        ]
      });
    });
  });

  describe('Button', () => {
    it('should be a class', () => {
      const message = new formatLineMessage.Button('Button text', 'Button alt text');

      expect(typeof formatLineMessage.Button).toBe('function');
      expect(message instanceof formatLineMessage.Button).toBeTruthy();
    });

    it('should throw an error if no action are added', () => {
      const message = new formatLineMessage.Button('Button text', 'Button alt text');

      expect(() => message.get()).toThrowError('Add at least one action first!');
    });

    it('should throw an error if more than 4 actions are added', () => {
      const message = new formatLineMessage.Button('Button text', 'Button alt text');

      message
        .addMessageButton('label', 'text')
        .addMessageButton('label', 'text')
        .addMessageButton('label', 'text')
        .addMessageButton('label', 'text');

      expect(() => {
        message.addMessageButton('label', 'text');
      }).toThrowError('There can not be more than 4 actions');
    });

    describe('.addUriButton', () => {
      let message;

      beforeEach(() => {
        message = new formatLineMessage.Button('Button text', 'Button alt text');
      });

      it('should throw an error if label or url is not valid', () => {
        expect(() => { message.addUriButton('label', 'text'); }).toThrowError('button required a uri as a second parameter');
        expect(() => { message.addUriButton('label'); }).toThrowError('button required a uri as a second parameter');
        expect(() => { message.addUriButton(undefined, 'https://example.com/'); }).toThrowError('button required a label as a first parameter');
        expect(() => { message.addUriButton(); }).toThrowError('button required a label as a first parameter');
      });

      it('should throw an error if url is too long', () => {
        const longtext = new Array(99).join('0123456789');
        const longurl = `https://example.com/${longtext}/`;

        expect(longurl.length).toEqual(1001);
        expect(() => { message.addUriButton('label', longurl); }).toThrowError('uri can not be more than 1000 characters');
      });

      it('should throw an error if label is too long', () => {
        const longtext = new Array(3).join('0123456789') + '1';

        expect(longtext.length).toEqual(21);
        expect(() => { message.addUriButton(longtext, 'https://example.com/'); }).toThrowError('label can not be more than 20 characters');
      });

      it('should add a UriButton', () => {
        message
          .addUriButton('label A', 'https://example.com/A');

        expect(message.get()).toEqual({
          type: 'template',
          altText: 'Button alt text',
          template: {
            type: 'buttons',
            text: 'Button text',
            actions: [
              { type: 'uri', label: 'label A', uri: 'https://example.com/A' }
            ]
          }
        });
      });

      it('should add two UriButtons', () => {
        message
          .addUriButton('label A', 'https://example.com/A')
          .addUriButton('label B', 'https://example.com/B');

        expect(message.get()).toEqual({
          type: 'template',
          altText: 'Button alt text',
          template: {
            type: 'buttons',
            text: 'Button text',
            actions: [
              { type: 'uri', label: 'label A', uri: 'https://example.com/A' },
              { type: 'uri', label: 'label B', uri: 'https://example.com/B' }
            ]
          }
        });
      });
    });

    describe('.addMessageButton', () => {
      let message;

      beforeEach(() => {
        message = new formatLineMessage.Button('Button text', 'Button alt text');
      });

      it('should throw an error if label or message is not valid', () => {
        expect(() => { message.addMessageButton('label'); }).toThrowError('button required a text as a second parameter');
        expect(() => { message.addMessageButton(undefined, 'text'); }).toThrowError('button required a label as a first parameter');
        expect(() => { message.addMessageButton(); }).toThrowError('button required a label as a first parameter');
      });

      it('should throw an error if message is too long', () => {
        const longtext = new Array(31).join('0123456789') + '1';

        expect(longtext.length).toEqual(301);
        expect(() => { message.addMessageButton('label', longtext); }).toThrowError('text can not be more than 300 characters');
      });

      it('should throw an error if label is too long', () => {
        const longtext = new Array(3).join('0123456789') + '1';

        expect(longtext.length).toEqual(21);
        expect(() => { message.addMessageButton(longtext, 'text'); }).toThrowError('label can not be more than 20 characters');
      });

      it('should add a message button', () => {
        message
          .addMessageButton('label A', 'text A');

        expect(message.get()).toEqual({
          type: 'template',
          altText: 'Button alt text',
          template: {
            type: 'buttons',
            text: 'Button text',
            actions: [
              { type: 'message', label: 'label A', text: 'text A' }
            ]
          }
        });
      });

      it('should add two message buttons', () => {
        message
          .addMessageButton('label A', 'text A')
          .addMessageButton('label B', 'text B');

        expect(message.get()).toEqual({
          type: 'template',
          altText: 'Button alt text',
          template: {
            type: 'buttons',
            text: 'Button text',
            actions: [
              { type: 'message', label: 'label A', text: 'text A' },
              { type: 'message', label: 'label B', text: 'text B' }
            ]
          }
        });
      });
    });

    describe('.addPostbackButton', () => {
      let message;

      beforeEach(() => {
        message = new formatLineMessage.Button('Button text', 'Button alt text');
      });

      it('should throw an error if label, data, or message is not valid', () => {
        expect(() => { message.addPostbackButton(); }).toThrowError('postback button required a label as a first parameter');
        expect(() => { message.addPostbackButton('label'); }).toThrowError('postback button required a data as a second parameter');
        expect(() => { message.addPostbackButton(undefined, 'data'); }).toThrowError('postback button required a label as a first parameter');
        expect(() => { message.addPostbackButton('label', 'data', 12); }).toThrowError('text needs to be a string');
      });

      it('should throw an error if message is too long', () => {
        const longtext = new Array(31).join('0123456789') + '1';

        expect(longtext.length).toEqual(301);
        expect(() => { message.addPostbackButton('label', 'data', longtext); }).toThrowError('text can not be more than 300 characters');
      });

      it('should throw an error if data is too long', () => {
        const longtext = new Array(31).join('0123456789') + '1';

        expect(longtext.length).toEqual(301);
        expect(() => { message.addPostbackButton('label', longtext); }).toThrowError('data can not be more than 300 characters');
      });

      it('should throw an error if label is too long', () => {
        const longtext = new Array(3).join('0123456789') + '1';

        expect(longtext.length).toEqual(21);
        expect(() => { message.addPostbackButton(longtext, 'text'); }).toThrowError('label can not be more than 20 characters');
      });

      it('should add a postback button', () => {
        message
          .addPostbackButton('label A', 'data A', 'text A');

        expect(message.get()).toEqual({
          type: 'template',
          altText: 'Button alt text',
          template: {
            type: 'buttons',
            text: 'Button text',
            actions: [
              { type: 'postback', label: 'label A', data: 'data A', text: 'text A' }
            ]
          }
        });
      });

      it('should add two postback buttons', () => {
        message
          .addPostbackButton('label A', 'data A', 'text A')
          .addPostbackButton('label B', 'data B');

        expect(message.get()).toEqual({
          type: 'template',
          altText: 'Button alt text',
          template: {
            type: 'buttons',
            text: 'Button text',
            actions: [
              { type: 'postback', label: 'label A', data: 'data A', text: 'text A' },
              { type: 'postback', label: 'label B', data: 'data B' }
            ]
          }
        });
      });
    });

    it('should throw an error if added more than 4 actions', () => {
      const message = new formatLineMessage.Button('Button text', 'Button alt text');
      message
        .addUriButton('label A', 'https://example.com/a')
        .addUriButton('label A', 'https://example.com/a')
        .addUriButton('label A', 'https://example.com/a')
        .addUriButton('label A', 'https://example.com/a');

      expect(() => {
        message
          .addUriButton('label A', 'https://example.com/a');
      }).toThrowError('There can not be more than 4 actions');
    });

    it('should return a simple message object', () => {
      const message = new formatLineMessage.Button('Button text', 'Button alt text')
        .addUriButton('label A', 'https://example.com/a')
        .addMessageButton('label B', 'text B')
        .addPostbackButton('label C', 'data C')
        .addPostbackButton('label D', 'data D', 'text D');

      expect(message.get()).toEqual({
        type: 'template',
        altText: 'Button alt text',
        template: {
          type: 'buttons',
          text: 'Button text',
          actions: [
            { type: 'uri', label: 'label A', uri: 'https://example.com/a' },
            { type: 'message', label: 'label B', text: 'text B' },
            { type: 'postback', label: 'label C', data: 'data C' },
            { type: 'postback', label: 'label D', data: 'data D', text: 'text D' }
          ]
        }
      });
    });
  });

  describe('Confirm', () => {
  });

  describe('Carousel', () => {
  });
});













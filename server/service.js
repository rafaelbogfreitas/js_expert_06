import fs from 'fs';
import path, { join, extname } from 'path';
import { once } from "events";
import { randomUUID } from "crypto";
import { PassThrough, Writable } from "stream";
import streamPromise from 'stream/promises';
import fsPromises from 'fs/promises';
import childProcess from 'child_process';
import Throttle from 'throttle';
import config from './config.js';
import { logger } from './util.js';

export class Service {
  constructor() {
    this.clientStreams = new Map();
    this.currentSong = config.constants.ENGLISH_CONVERSATION;
    this.currentBitRate = 0;
    this.throttleTransform = {};
    this.currentReadable = {};
  }

  getClientStream() {
    const id = randomUUID();
    const clientStream = new PassThrough();
    this.clientStreams.set(id, clientStream);

    return {
      id,
      clientStream,
    }
  }

  removeClientStream(id) {
    this.clientStreams.delete(id);
  }

  _executeSoxCommand(args) {
    return childProcess.spawn('sox', args);
  }

  broadcast() {
    return new Writable({
      write: (chunk, enc, cb) => {
        for(const [id, stream] of this.clientStreams) {
          // We shouldn't send more data if the client disconnected
          if(stream.writableEnded) {
            this.clientStreams.delete(id);
            continue;
          }
          stream.write(chunk);
        }

        cb();
      }
    })
  }

  async startStream() {
    logger.info(`Starting stream with: ${this.currentSong}`);
    const bitRate = this.currentBitRate = (await this.getBitRate(this.currentSong)) / config.constants.BIT_RATE_DIVISOR;

    this.throttleTransform = new Throttle(bitRate);
    const songReadable = this.currentReadable = this.createFileStream(this.currentSong);

    streamPromise.pipeline(
      songReadable,
      this.throttleTransform,
      this.broadcast(),
    )
  }
 
  async stopStream() {
    this.throttleTransform?.end?.();
  }

  async getBitRate(song) {
    try {
      const args = [
        '--i',
        '-B',
        song,
      ]

      const {
        stderr,
        stdout,
        // stdin
      } = this._executeSoxCommand(args);

      await Promise.all([
        once(stderr, 'readable'),
        once(stdout, 'readable'),
      ]);

      const [ success, error ] = [stdout, stderr].map(stream => stream.read());
      
      if(error) {
        return await Promise.reject(error);
      }

      return success
        .toString()
        .trim()
        .replace(/k/, '000')

    } catch (error) {
      logger.error(`Error in bit rate: ${error}`);
      return config.constants.FALLBACK_BIT_RATE;
    }
  }

  createFileStream(filename) {
    return fs.createReadStream(filename);
  }

  async getFileInfo(file) {
    const filePath = join(config.dir.publicDir, file);
    await fsPromises.access(filePath);

    const fileType = extname(filePath);

    return {
      type: fileType,
      name: filePath,
    }
  }

  async getFileStream(file) {
    const { name, type } = await this.getFileInfo(file);

    return {
      stream: this.createFileStream(name),
      type,
    }
  }

  async readFxByName(fxName) {
    const { fxDir } = config.dir;
    const songs = await fsPromises.readdir(fxDir);
    const chosenSong = songs.find(filename => filename.toLowerCase().includes(fxName));

    if(!chosenSong) {
      return Promise.reject(`The song ${fxName} wasn't found!`);
    }

    return path.join(fxDir, chosenSong);
  }

  appendFxToStream(fx) {
    const throttleTransformable = new Throttle(this.currentBitRate);
    
    streamPromise.pipeline(
      throttleTransformable,
      this.broadcast()
    );

    const unpipe = () => {
      const transformStream = this.mergeAudioStreams(fx, this.currentReadable);

      this.throttleTransform = throttleTransformable;
      this.currentReadable = transformStream;
      this.currentReadable.removeListener('unpipe', unpipe);

      streamPromise.pipeline(
        transformStream,
        throttleTransformable
      );
    }

    this.throttleTransform.on("unpipe", unpipe);
    this.throttleTransform.pause();
    this.currentReadable.unpipe(this.throttleTransform)
  }

  mergeAudioStreams(song, readable) {
    const {
      AUDIO_MEDIA_TYPE,
      SONG_VOLUME,
      FX_VOLUME,
    } = config.constants;
    
    const transformStream = new PassThrough();

    const args = [
      "-t", AUDIO_MEDIA_TYPE,
      "-v", SONG_VOLUME,
      "-m", "-",
      "-t", AUDIO_MEDIA_TYPE,
      "-v", FX_VOLUME,
      song,
      "-t", AUDIO_MEDIA_TYPE,
      "-"
    ]

    const {
      stdout,
      stdin,
    } = this._executeSoxCommand(args);

    streamPromise.pipeline(
      readable,
      stdin
    )
    .catch(error => `Error on sending stream to sox: ${error}`);
    
    streamPromise.pipeline(
      stdout,
      transformStream
    )
    .catch(error => `Error on receiving stream from sox: ${error}`);
      
    return transformStream;
  }
}
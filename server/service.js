import fs from 'fs';
import { join, extname } from 'path';
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
          }
          stream.write(chunk);
        }

        cb();
      }
    })
  }

  async startStream() {
    logger.info(`Starting stream with: ${this.currentSong}`);
    const bitRate = (await this.getBitRate(this.currentSong)) / config.constants.BIT_RATE_DIVISOR;

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
}
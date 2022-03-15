import fs from 'fs';
import { join, extname } from 'path';
import fsPromises from 'fs/promises';
import config from './config.js';

export class Service {
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
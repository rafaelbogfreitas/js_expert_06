import { Service } from "./service.js";
import { logger } from "./util.js";

export class Controller {
  constructor() {
    this.service = new Service();
  }

  async getFileStream(filename) {
    return this.service.getFileStream(filename);
  }

  async handleCommand({ command }) {
    logger.info(`Command received: ${command}`);
    const cmd = command.toLowerCase();
    const result = { result: 'ok' };

    if(cmd.includes('start')) {
      this.service.startStream();
      return result;
    }
    
    if(cmd.includes('stop')) {
      this.service.stopStream();
      return result;
    }

    return result;
  }
  
  getClientStream() {
    const { clientStream, id } = this.service.getClientStream();

    const onClose = () => {
      logger.info(`Closing stream: ${id}`);
      this.service.removeClientStream(id);
    }

    return {
      stream: clientStream,
      onClose,
    };
  }
}
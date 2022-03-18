import { once } from "events";
import config from "./config.js";
import { Controller } from "./controller.js";
import { logger } from "./util.js";


const controller = new Controller();

async function routes(request, response) {
  const { method, url } = request;

  if(method === "GET" && url === "/") {
    response.writeHead(302, {
      "Location": config.location.home,
    });

    return response.end();
  }
  
  if(method === "GET" && url === "/home") {
    const { stream } = await controller.getFileStream(config.pages.home);

    return stream.pipe(response);
  }
  
  if(method === "GET" && url === "/controller") {
    const { stream } = await controller.getFileStream(config.pages.controller);
    
    return stream.pipe(response);
  }

  if(method === "GET" && url.includes("/stream")) {
    const { stream, onClose } = controller.getClientStream();

    request.once("close", onClose);
    response.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Accept-Ranges": "bytes"
    });

    return stream.pipe(response);
  }

  if(method === "POST" && url === "/controller") {
    const data = await once(request, 'data');
    const item = JSON.parse(data);
    const result = await controller.handleCommand(item);

    return response.end(JSON.stringify(result));
  }
  
  if(method === "GET" ) {
    const { stream, type } = await controller.getFileStream(url);

    const contentType = config.constants.CONTENT_TYPE[type];

    if(contentType) {
      response.writeHead(200, {
        "Content-type": contentType,
      });
    }

    return stream.pipe(response);
  }

  response.writeHead(404);
  return response.end();
}

function handleError(err, response) {
  if(err.message.includes("ENOENT")) {
    logger.warn(`Asset not found: ${err.stack}`);

    response.writeHead(404);
    return response.end();
  }

  logger.error(`Caught error on API: ${err.stack}`);
  response.writeHead(500);
  return response.end();
}

export function handler(request, response) {
  return routes(request, response)
  .catch(err => handleError(err, response));
}
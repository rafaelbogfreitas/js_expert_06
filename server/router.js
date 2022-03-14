import { logger } from "./util.js";

async function routes(request, response) {
  return response.end("Working");
}

export function handler(request, response) {
  return routes(request, response)
  .catch(logger.info);
}
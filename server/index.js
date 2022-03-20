import config from "./config.js";
import server from "./server.js";
import { logger } from "./util.js";

server.listen(config.port).on('listening', () => logger.info(`Server running at port: ${config.port}`));

process.on("uncaughtException", (error) => logger.error(`uncaughtException: ${error.stack || error}`))
process.on("unhandledRejection", (error) => logger.error(`unHandledRejection: ${error.stack || error}`));
import fs from 'fs';
import path from 'path';
import winston from 'winston';
import ConfigurationService from '../services/configuration/configuration-service';
import {ApplicationConfiguration} from '../services/configuration/types';

const config = <ApplicationConfiguration>ConfigurationService.getConfiguration('application.json');

const logger = winston.createLogger({
    level: config.logLevel,
    transports: [
        new winston.transports.File({
            filename: config.logFile,
        }),
    ],
});

if(config.logConsole) {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

export default logger;
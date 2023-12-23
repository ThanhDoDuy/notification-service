import express, { Express } from 'express';
import { Logger } from 'winston';

import { winstonLogger } from './logger';
import { config } from './config';
import { start } from './server';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationElasticSearchServer', 'debug');

function initialize(): void {
    const app: Express = express();
    start(app);
    log.info('Notification Server initialized');
};

initialize();
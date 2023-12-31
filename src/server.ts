import 'express-async-errors';
import http from 'http';

import { Logger } from 'winston';
import { config } from '@notifications/config';
import { Application } from 'express';
import { Channel } from 'amqplib';

import { winstonLogger } from './logger';
import { healthRoutes } from './routes';
import { checkConnectionELS } from './elasticsearch';
import { createConnection } from './queues/connection';
import { consumeAuthEmailMessage, consumeOrderEmailMessage } from './queues/email.consumer';

const SERVER_PORT = 4001;
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`,
    'notifications', 'debug');

function start(app: Application): void {
    startServer(app);
    app.use('', healthRoutes);
    startQueues();
    startElasticSearch();
}

async function startQueues(): Promise<void> {
    const emailChannel: Channel = await createConnection() as Channel;
    await consumeAuthEmailMessage(emailChannel);
    await consumeOrderEmailMessage(emailChannel);
    // const message: string = JSON.stringify({
    //     name: 'ddthanh',
    //     service: 'notification service',
    // });
    const verificationLink = `${config.CLIENT_URL}/confirm_email?v_token=123456hahahaha`;
    const messageDetails: string = JSON.stringify({
        receiverEmail: `${config.SENDER_EMAIL}`,
        verifyLink: verificationLink,
        template: 'verifyEmail'
    });
    emailChannel.publish('email-notification', 'auth-email', Buffer.from(messageDetails));
}

function startElasticSearch(): void {
    checkConnectionELS();
}

function startServer(app: Application): void {
    try {
        const httpServer: http.Server = http.createServer(app);
        log.info(`worker with process id of ${process.pid} on notification server started`);
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Notification server running on port ${SERVER_PORT}`);
        });
    } catch (error) {
        log.log('error', 'notificationService startServer() method: ', error);
    }
}

export {
    start,
    startServer
};
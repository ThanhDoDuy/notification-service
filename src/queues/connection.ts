import client, { Channel, Connection } from 'amqplib';
import { Logger } from 'winston';
import { config } from '@notifications/config';

import { winstonLogger } from '../logger';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notifications', 'debug');

async function createConnection(): Promise<Channel | undefined> {
    try {
        const connection: Connection = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
        const channel: Channel = await connection.createChannel();
        log.info('Notification Server connected to queue succesfully...');
        closeConnection(channel, connection);
        return channel;
    } catch (error) {
        log.log('error', 'NotificationServer createConnection() method: ', error);
    }
}

function closeConnection(channel: Channel, connection: Connection): void {
    process.once('SIGINT', async () => {
        await channel.close();
        await connection.close();
    });
}

export {
    createConnection,
    closeConnection
};
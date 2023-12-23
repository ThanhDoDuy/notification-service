import { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'winston';
import { config } from '@notifications/config';

import { winstonLogger } from '../logger';

import { createConnection } from './connection';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notifications', 'debug');

async function consumeAuthEmailMessage(channel: Channel): Promise<void> {
    try {
        if(!channel) {
            channel = await createConnection() as Channel;
        }
        // Setup exchange mechanism
        const exchangeName = 'email-notification';
        const routingKey = 'auth-email';
        // Setup queue
        const queueName = 'auth-email-queue';
        // Exchanges receive messages from producers and then route them to queues based on certain rules defined by the exchange type and routing key.
        await channel.assertExchange(exchangeName, 'direct');
        const serviceQueue = await channel.assertQueue(queueName, { durable: true });
        await channel.bindQueue(serviceQueue.queue, exchangeName, routingKey);
        channel.consume(serviceQueue.queue, async (_msg: ConsumeMessage | null) => {
            // The message should be a string format
            // console.log(JSON.parse(msg!.content.toString()));
            // // send emails to user for confirmation
            // // acknowledge
            // channel.ack(msg!);
        });
    } catch (error) {
        log.log('error', 'NotificationServer consumeAuthEmailMessage() method error: ', error);
    }
}

export {
    consumeAuthEmailMessage
};
import { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'winston';
import { config } from '@notifications/config';

import { winstonLogger } from '../logger';

import { createConnection } from './connection';
import { IEmailLocals } from '@notifications/interfaces/email.interface';
import { sendEmail } from './mail.transport';

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
        channel.consume(serviceQueue.queue, async (msg: ConsumeMessage | null) => {
            // The message should be a string format
            console.log(JSON.parse(msg!.content.toString()))
            const { receiverEmail, username, verifyLink, resetLink, template } =
                JSON.parse(msg!.content.toString());
            // send emails to user for confirmation
            const locals: IEmailLocals = {
                appLink: `${config.CLIENT_URL}`,
                appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
                username,
                verifyLink,
                resetLink
            };
            await sendEmail(template, receiverEmail, locals);
            // acknowledge
            channel.ack(msg!);
        });
    } catch (error) {
        log.log('error', 'NotificationServer consumeAuthEmailMessage() method error: ', error);
    }
}

async function consumeOrderEmailMessage(channel: Channel): Promise<void> {
    try {
        if(!channel) {
            channel = await createConnection() as Channel;
        }
        // Setup exchange mechanism
        const exchangeName = 'order-notification';
        const routingKey = 'order-email';
        // Setup queue
        const queueName = 'order-email-queue';
        // Exchanges receive messages from producers and then route them to queues based on certain rules defined by the exchange type and routing key.
        await channel.assertExchange(exchangeName, 'direct');
        const serviceQueue = await channel.assertQueue(queueName, { durable: true });
        await channel.bindQueue(serviceQueue.queue, exchangeName, routingKey);
        channel.consume(serviceQueue.queue, async (msg: ConsumeMessage | null) => {
            const {
                receiverEmail,
                username,
                template,
                sender,
                offerLink,
                amount,
                buyerUsername,
                sellerUsername,
                title,
                description,
                deliveryDays,
                orderId,
                orderDue,
                requirements,
                orderUrl,
                originalDate,
                newDate,
                reason,
                subject,
                header,
                type,
                message,
                serviceFee,
                total
            } = JSON.parse(msg!.content.toString());
            const locals: IEmailLocals = {
                appLink: `${config.CLIENT_URL}`,
                appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
                username,
                sender,
                offerLink,
                amount,
                buyerUsername,
                sellerUsername,
                title,
                description,
                deliveryDays,
                orderId,
                orderDue,
                requirements,
                orderUrl,
                originalDate,
                newDate,
                reason,
                subject,
                header,
                type,
                message,
                serviceFee,
                total
            };
            if (template === 'orderPlaced') {
                await sendEmail('orderPlaced', receiverEmail, locals);
                await sendEmail('orderReceipt', receiverEmail, locals);
            } else {
                await sendEmail(template, receiverEmail, locals);
            }
            channel.ack(msg!);
        });
    } catch (error) {
        log.log('error', 'NotificationServer consumeOrderEmailMessage() method error: ', error);
    }
}

export {
    consumeAuthEmailMessage,
    consumeOrderEmailMessage
};
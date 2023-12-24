import * as connection from '@notifications/queues/connection';
import { consumeAuthEmailMessage, consumeOrderEmailMessage } from '@notifications/queues/email.consumer';
import amqp from 'amqplib';

jest.mock('@notifications/queues/connection');
jest.mock('amqplib');

describe('Email comsumer', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    describe('consumeAuthEmailMessage method', () => {
        it('should be called', async() => {
            const channel = {
                assertExchange: jest.fn(),
                publish: jest.fn(),
                assertQueue: jest.fn(),
                bindQueue: jest.fn(),
                consume: jest.fn()
            }
            jest.spyOn(channel, 'assertExchange');
            jest.spyOn(channel, 'assertQueue').mockReturnValue({
                queue: 'mock-email-queue',
                messageCount: 0,
                consumerCount: 0
            });
            jest.spyOn(connection, 'createConnection').mockReturnValue(channel as never);
            const connectionChannel: amqp.Channel | undefined = await connection.createConnection();
            await consumeAuthEmailMessage(connectionChannel!);
            expect(connectionChannel!.assertExchange).toHaveBeenCalledWith('email-notification', 'direct');
            expect(connectionChannel!.assertQueue).toHaveBeenCalledTimes(1);
            expect(connectionChannel!.consume).toHaveBeenCalledTimes(1);
            expect(connectionChannel!.bindQueue).toHaveBeenCalledWith('mock-email-queue', 'email-notification', 'auth-email');
        })
    });

    describe('consumeOrderEmailMessages method', () => {
        it('should be called', async () => {
          const channel = {
            assertExchange: jest.fn(),
            publish: jest.fn(),
            assertQueue: jest.fn(),
            bindQueue: jest.fn(),
            consume: jest.fn(),
          };
          jest.spyOn(channel, 'assertExchange');
          jest.spyOn(channel, 'assertQueue').mockReturnValue({ queue: 'order-email-queue', messageCount: 0, consumerCount: 0});
          jest.spyOn(connection, 'createConnection').mockReturnValue(channel as never);
          const connectionChannel: amqp.Channel | undefined = await connection.createConnection();
          await consumeOrderEmailMessage(connectionChannel!);
          expect(connectionChannel!.assertExchange).toHaveBeenCalledWith('order-notification', 'direct');
          expect(connectionChannel!.assertQueue).toHaveBeenCalledTimes(1);
          expect(connectionChannel!.consume).toHaveBeenCalledTimes(1);
          expect(connectionChannel!.bindQueue).toHaveBeenCalledWith('order-email-queue', 'order-notification', 'order-email');
        });
      });
})
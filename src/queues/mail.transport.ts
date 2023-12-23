import { Logger } from 'winston';
import { config } from '@notifications/config';

import { winstonLogger } from '../logger';
import { IEmailLocals } from '@notifications/interfaces/email.interface';
import { emailTemplates } from '@notifications/helper';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransport', 'debug');

async function sendEmail(template: string, receiverEmail: string, locals: IEmailLocals): Promise<void>{
    try {
        // email templates
        emailTemplates(template, receiverEmail, locals);
        log.info('Email is sent succesfully...');
    } catch (error) {
        log.log('error', 'NotificationServer sendEmail() method error: ', error);
    }
}

export {
    sendEmail
}
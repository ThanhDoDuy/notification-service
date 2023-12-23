import { Logger } from 'winston';
import { winstonLogger } from './logger';
import { config } from './config';
import nodemailer, { Transporter } from 'nodemailer';
import { IEmailLocals } from './interfaces/email.interface';
import Email from 'email-templates';
import path from 'path';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransportHelper', 'debug');

async function emailTemplates(template: string, receiver: string, locals: IEmailLocals): Promise<void>{
    try {
        const smtpTransporter: Transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: config.SENDER_EMAIL,
                pass: config.SENDER_EMAIL_PASSWORD
            }
        });
        const email: Email = new Email({
            message: {
              from: `ddthanh App <${config.SENDER_EMAIL}>`,
            },
            send: true,
            preview: false,
            transport: smtpTransporter,
            views: {
                options: {
                    extension: 'ejs'
                }
            },
            juice: true, // allow using CSS inline
            juiceResources: {
                preserveImportant: true,
                webResources: {
                    relativeTo: path.join(__dirname, '../build')
                }
            }
          });
        
        await email.send({
            template: path.join(__dirname, '..', 'src/emails', template),
            message: {
                to: receiver
            },
            locals
        })
    } catch (error) {
        log.log('error', 'NotificationServer emailTemplates() method error: ', error);
    }
}

export {
    emailTemplates
}
import winston, { Logger } from 'winston';
import {
    ElasticsearchTransport,
    ElasticsearchTransformer,
    LogData,
    TransformedData
} from 'winston-elasticsearch';

const esTransformer = (logData: LogData): TransformedData => {
    return ElasticsearchTransformer(logData);
};

const winstonLogger = (
        elsasticSearchNode: string,
        name: string,
        level: string): Logger => {
    const options = {
        console: {
            level: level,
            handleExceptions: true,
            json: false,
            colorize: true
        },
        elasticsearch: {
            level: level,
            transformer: esTransformer,
            clientOpts: {
                node: elsasticSearchNode,
                log: level,
                maxRetries: 2,
                requestTimeout: 10000,
                sniffOnStart: true
            }
        }
    };
    const esTransport: ElasticsearchTransport =
        new ElasticsearchTransport(options.elasticsearch);
    const logger: Logger = winston.createLogger({
        exitOnError: false,
        defaultMeta: {
            service: name
        },
        transports: [
            new winston.transports.Console(options.console),
            esTransport
        ]
    });
    return logger;
};

export {
    winstonLogger
};

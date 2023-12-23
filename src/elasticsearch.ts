import { Client } from '@elastic/elasticsearch';
import { Logger } from 'winston';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';

import { winstonLogger } from './logger';
import { config } from './config';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationElasticSearchServer', 'debug');

const elasticSearchClient = new Client({
    node: `${config.ELASTIC_SEARCH_URL}`
});

export async function checkConnectionELS(): Promise<void> {
    let isConnected = false;
    let attempts = 0;
    const maxAttempts = 1;

    while (!isConnected && attempts < maxAttempts) {
        try {
            const health: ClusterHealthResponse =
                await elasticSearchClient.cluster.health({});
            log.info(`NotificationServer Elasticsearch health status: ${health.status}`);
            isConnected = true;
        } catch (error) {
            attempts++;
            log.error('Connection to elasticsearch failed. Retrying...');
            log.log('error', 'NotificationServer checkConnectionELS method: ', error);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
        if (!isConnected) {
            log.error(`Failed to connect to Elasticsearch after ${maxAttempts} attempts.`);
        }
    }
}
import config from 'config';
const version = require('../../../package.json').version;

export const healthCheckResponse = () => {
    return {
        service: config.get('name') || 'no-name-app',
        version,
        timestamp: +new Date(),
    }
}

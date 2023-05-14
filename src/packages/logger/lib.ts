import pino from 'pino';
import pretty from 'pino-pretty';

const _logger = pino(pretty());

export const logger = {
    info: (msg: string, obj?: any ) => {
        if (obj) {
            _logger.info({
                msg,
                ...obj,
            })
        } else {
            _logger.info(msg);
        }
    }
}
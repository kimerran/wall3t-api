require('dotenv').config();
import assert from 'assert';
import config from 'config';
import { initServer } from './server';
import { initDatabase, initModels } from './data-access';
import { logger } from './packages/logger/lib';

async function main() {
    // env variables
    const {
        PG_DATABASE,
        PG_USERNAME,
        PG_PASSWORD,
        PG_HOST,
        PG_PORT
    } = process.env;

    assert(PG_DATABASE, 'PG_DATABASE is missing in env config');
    assert(PG_USERNAME, 'PG_USERNAME is missing in env config');
    assert(PG_PASSWORD, 'PG_PASSWORD is missing in env config');
    assert(PG_HOST, 'PG_HOST is missing in env config');
    assert(PG_PORT, 'PG_PORT is missing in env config');

    const sequelize = initDatabase({
        database: PG_DATABASE,
        username: PG_USERNAME,
        password: PG_PASSWORD,
        host: PG_HOST,
        port: Number(PG_PORT),
    });

    const dataAccess = await initModels(sequelize);
    const server = initServer(dataAccess);

    server.listen(config.get('port'), () => {
        logger.info(`server listening at http://localhost:${config.get('port')}`)
    });
}

main()
    .catch(logger.info);
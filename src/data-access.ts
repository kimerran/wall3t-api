import { Model, ModelCtor, Sequelize } from 'sequelize';
import { AccountModel } from './models';
import { logger } from './packages/logger/lib';

export type pgDbConfig = {
    database: string
    username: string
    password: string
    host: string
    port: number
}

export type DataAccess = {
    sequelize: Sequelize,
    models: { Account: ModelCtor<Model<any, any>> }, 
}

const initDatabase = (dbConfig: pgDbConfig): Sequelize => {
    const { host, port, database, username, password } = dbConfig;
    logger.info('connecting to db', {
        host,
        port,
        database,
        username,
    });
    const sequelize = new Sequelize(database, username, password, {
        dialect: 'postgres',
        host: host,
        port: port,
        logging: false,
    });

    return sequelize;
}

const initModels = (sequelize: Sequelize): DataAccess => {

    const Account = sequelize.define<Model>('Account', AccountModel);

    sequelize.sync()
    return {
        sequelize,
        models: {
            Account: Account,
        }
    }
}

export {
    initDatabase,
    initModels
}

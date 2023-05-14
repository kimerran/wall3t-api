import express, { Request, Response } from 'express';
import config from 'config';
import cors from 'cors';
import bodyParser from 'body-parser';
import { DataAccess } from './data-access';
import { sayHealthy } from './controller/healthcheck.controller';
import { bearerTokenVerify } from './middleware/verify-auth.middleware';
import { createUser, verifyAccount } from './controller/account.controller';
const version = require('../package.json').version;

const healthcheck = (req: Request, res: Response) => {
    res.json({
        service: config.get('name'),
        version,
        timestamp: +new Date(),
    })
}
const initServer = (dataAccess: DataAccess) => {
    const app = express();
    // app.use(cors({ origin: '*' }));
    // app.options('*', cors()) // include before other routes
    app.disable('x-powered-by')
    app.use(bodyParser.json())

    app.get('/', sayHealthy());
    app.get('/.well-known/health', sayHealthy());
    app.get('/.well-known/auth', bearerTokenVerify, sayHealthy());

    app.post('/account', createUser(dataAccess));
    app.get('/account/verify', verifyAccount(dataAccess));

    return app;
}

export {
    initServer,
}
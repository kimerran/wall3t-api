import config from 'config';
import argon2 from 'argon2';
import { DataAccess } from '../data-access';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../packages/logger/lib';
import { createWallet } from '../packages/email-wallets/lib';

export type ArgonAuthConfig = {
    secret: string
}

const argonConfig = config.get<ArgonAuthConfig>('auth.argon');

const createUser = (dataAccess: DataAccess) => async (req: Request, res: Response) => {
    const { Account } = dataAccess.models;
    try {
        const {
            email,
            username,
            password
        } = req.body;

        logger.info(argonConfig.secret)

        const pwHash = await argon2.hash(password, { secret: Buffer.from(argonConfig.secret) });

        const verifyHash = uuidv4();
        logger.info(`Creating with verify hash ${verifyHash}`);
        const newUser = {
            email,
            username,
            password: pwHash,
            verified: false,
            verifyHash,
        };

        Account.create(newUser)
            .then((result: any) => {
                console.log('result', result)
                if (result) {
                    result.password = "**REDACTED**"
                    res.json('User has been created');
                } else {
                    res.status(500).send('Creation ont success')
                }

            })
            .catch((err: any) => {
                const errDetails = {
                    errorName: err?.name,
                    errors: err?.errors.map((e: any) => {
                        return { message: e.message, value: e.value }
                    })
                }
                res.status(500).send(errDetails)
            })
    } catch (error) {
        console.log('error', error);
        throw error;
    }
}

export type VerifyQueryParams = {
    id: string
}
type VerifyAccountRequest = Request<any, any, any, VerifyQueryParams, any>;

const verifyAccount = (dataAccess: DataAccess) => async (req: VerifyAccountRequest, res: Response) => {
    const { Account } = dataAccess.models;
    const { id } = req.query;

    try {
        const match = await Account.findOne({
            where: {
                verifyHash: id,
                verified: false,
            }
        });
        // TODO: perform further validation, use other fields aside from verifyHash
        if (match?.dataValues) {
            // update and create a wallet as well
            const newWallet = await createWallet();
            Account.update({
                verified: true,
                walletPhrase: newWallet.phrase,
                walletAddress: newWallet.address,
            }, { where: { verifyHash: id, id: match.get('id') } })
            res.json({
                msg: 'Account verified',
                payload: {
                    walletPhrase: newWallet.phrase,
                    walletAddress: newWallet.address,
                    userWord: newWallet.userWord,
                    index: newWallet.index,
                }
            });
        } else {
            logger.info(`Unable to verify hash ${id}`);
            res.status(400).send('Unable to verify');
        }
    } catch (error) {
        console.log('error', error);
        res.status(500).send('Error');
    }
}

export {
    createUser,
    verifyAccount,
}

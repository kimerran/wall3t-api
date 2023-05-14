import config from 'config';
import argon2 from 'argon2';
import { DataAccess } from '../data-access';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../packages/logger/lib';
import { composeWallet, createWallet } from '../packages/email-wallets/lib';
import { createToken } from '../packages/bearer-token/lib';

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

const createAccountToken = (dataAccess: DataAccess) => async (req: Request, res: Response) => {
    const { Account } = dataAccess.models;
    try {
        const {
            email,
            password,
            userword,
        } = req.body;
        if (!userword) return res.status(400).send('UserWord is required');

        const match = await Account.findOne({ where: { email: email }});
        if (match) {
            const isValid = await argon2.verify(match?.get<any>('password'), password, { secret: Buffer.from(argonConfig.secret) })
            if (isValid) {
                // email and password combination is good
                // now, let's rebuild the wallet
                const walletPhrase = match.get('walletPhrase') as string;
                const walletAddress = match.get('walletAddress') as string;
                const wallet = composeWallet(walletPhrase, userword, 0);

                if (wallet.address === walletAddress) {
                    const authPayload = {
                        uid: match.get('id'),
                        eml: email,
                        uwd: userword,
                        evw: wallet.address,
                    }
                    const token = createToken(authPayload);
                    return res.json({ token });
                } else {
                    res.status(401).json('Wallet mismatch');
                }
            } else {
                res.status(401).send('Unauthorized');
            }
        } else {
            res.status(401).send('Unauthorized');
        }
    } catch (err: any) {
        logger.info(err);
        res.status(401).send('Unauthorized');
    }
}

export {
    createUser,
    verifyAccount,
    createAccountToken,
}

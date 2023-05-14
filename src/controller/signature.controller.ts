import { DataAccess } from "../data-access";
import { composeWallet } from "../packages/email-wallets/lib";
import { Request, Response } from 'express';
import { logger } from "../packages/logger/lib";
import { ethers } from "ethers";

const signPayload = (dataAccess: DataAccess) => async (req: Request, res: Response) => {
    const { Account } = dataAccess.models;
    const { message } = req.body;

    // TODO: validate message to be string, present
    const { uid, eml, uwd, evw } = res.locals.tokenPayload;

    const match = await Account.findOne({
        where: {
            email: eml,
            id: uid,
            walletAddress: evw,
        }
    });

    if (match) {
        const mnemonic = match?.get('walletPhrase') as string;
        const userWord = Buffer.from(uwd, 'base64').toString();
        const w = composeWallet(mnemonic, userWord, 0);

        if (w.address === match?.get('walletAddress') as string) {
            // proceed signing
            const signed = await w.signMessage(message);
            res.json({
                message,
                signature: signed,
                signer: w.address,
            });
        } else {
            res.status(401).json('Wallet mismatch');
        }
    } else {
        res.status(404).json('Not found')
    }
}

const recoverSigner = () => async (req: Request, res: Response) => {
    const { message, signature } = req.body;
    try {
        const recovered = ethers.verifyMessage(message, signature);
        logger.info(`recovered ${recovered}`)
        res.json({
            message,
            signature,
            signer: recovered,
        })
    } catch (error) {
        res.status(400).json({ msg: 'failed recovery' })
    }

}

export {
    signPayload,
    recoverSigner,
}
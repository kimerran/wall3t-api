import { NextFunction, Request, Response } from "express"
import { verifyToken } from "../packages/bearer-token/lib";

const bearerTokenVerify = (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    const token = authorization ? authorization.split('Bearer ')[1] : null;

    try {
        if (token) {
            const result = verifyToken(token);
            if (result) {
                return next()
            }
            res.status(401).send('Unauthorized')

        } else {
            res.status(401).send('Unauthorized')
        }
    } catch (error) {
        res.status(401).send('Unauthorized')
    }
}

export {
    bearerTokenVerify,
}

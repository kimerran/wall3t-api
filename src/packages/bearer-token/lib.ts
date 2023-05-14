import assert from 'assert';
import jwt from 'jsonwebtoken';
import config from 'config';

const jwtKey = config.get<string>('jwt.secretKey');
const expiryInSeconds = config.get<string>('jwt.expiryInSeconds');

const createToken = (payload: any) => {
    assert(jwtKey, '');
    return jwt.sign({
        ...payload,
    }, jwtKey, {
        expiresIn: expiryInSeconds
    })
}

const verifyToken = (token: string) => {
    console.log('token')
    return jwt.verify(token, jwtKey);
}

export {
    createToken,
    verifyToken,
}
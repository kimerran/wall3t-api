# wall3t-api

The goal of this API is to provide a **semi-custodial** wallet to the user.

This API only holds 91.667% of the phrase (11/12), one word is taken out and provided to the user.

## features
- Create a JWT that can be verified or integrated with wall3t services
- Sign a message/payload using the custom JWT
- Perform EVM transactions without creating a EVM wallet/account
- Destroy account and transfer to a non-custodial wallet

## endpoints
```
POST /account - Create an account
GET /account/verify - Activate account
POST /account/login - Create JWT
POST /validate - Validate JWT
POST /sign - Sign a message/payload
```

### contact me
- author: [kimerran](https://github.com/kimerran)
- email: [mh.neri@gmail.com](mailto:mh.neri@gmail.com)
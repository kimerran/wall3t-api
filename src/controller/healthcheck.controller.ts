import { Request, Response } from "express"
import { healthCheckResponse } from "../packages/healthchecker/lib"


const sayHealthy = () => (req: Request, res: Response) => {
    try {
        res.json(healthCheckResponse());
    } catch (error) {
        console.error(error);
        res.status(500).send('Service Unhealthy');
    }
}

export {
    sayHealthy,
}
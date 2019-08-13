import { Request, Response } from 'express';

export interface ServerApiMethodInformation {
    type: ('GET' | 'POST');
    route: string;
    method: ((req: Request, res: Response) => void);
}

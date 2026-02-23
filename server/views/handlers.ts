import {Response, Request} from 'express';

export function index(req: Request, res: Response) {
    res.send('<h1>hello</h1>')
}
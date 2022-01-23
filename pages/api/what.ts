import { NextApiRequest, NextApiResponse } from "next";
// import { PORT } from '../../../electron/dist/app';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('eeey');
    console.log(global?.['omg']);
    res.send('whaaaaat')
}


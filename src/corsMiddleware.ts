import { NextApiRequest, NextApiResponse } from "next";

export default function corsMiddleware(req: NextApiRequest, res: NextApiResponse, next: () => void) {
    res.setHeader('Access-Control-Allow-Origin', 'https://sakapdf.vercel.app'); // Set your domain name here
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Set the allowed HTTP methods here
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Set the allowed headers here
    next(); // Call next() to continue processing the request
  }
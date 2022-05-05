import {Request, Response, NextFunction} from 'express'
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()


export let tokenVarify = async (req:any, res:Response, next:NextFunction) => {
    try {

      let secretKey:any = process.env.SECRET_KEY
      let token:any = req.headers.authorization;
      if (!token) {
        return res.status(400).json({
          message: "A token is required for authentication",
          status: 400,
          success: false,
        });
      } else {

        const authHeader:any = req.headers.authorization;
        const bearerToken:any = authHeader.split(" ");
        let myToken:any = bearerToken[1];
        jwt.verify(myToken, secretKey, async (error:any, payload:any) => {
          if (payload) {
            req.id = payload._id;
            next();
          } else {
            return res.status(400).json({
              success: false,
              message: "Invalid token",
              data: error.message,
            });
          }
        });
      }
    } catch (e:any) {
      return res.json({
        success: false,
        statusCode: 400,
        message: e.message,
      });
    }
  };
  

export let cheackRoute = async (req:Request, res:Response, next:NextFunction)=>{
try{
  res.status(404).json({
  statusCode:404,
  message:"page not found"
})
next()
}catch(e:any){
return res.json({
  statusCode:400,
  message:e.message
})
}
  }
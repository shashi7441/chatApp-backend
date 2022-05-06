
import { user } from "../models";
import {Express, Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config()

export let  userSignup = async (req:Request, res:Response)=>{
try{
let {fullName,email, password}:{fullName:string, email:string, password:string} = req.body 
let full_Name:string = fullName.trim()
const emailTrim:string = email.trim()
let passwordTrim:string = password.trim()
const salt:any = await bcrypt.genSalt(10);
const hash:string = await bcrypt.hash(passwordTrim, salt)

const userData:any = await user.findOne({
    where:{
        email:emailTrim
    }
})
if(userData){
    const value:any = userData.dataValues

    if(value.email === emailTrim)
    {
        return res.json({
            statusCode:400,
            message:"email already exist"
        })
    }
}

const createDocument:any = await user.create({fullName:full_Name, email:emailTrim, password:hash})

return res.json({
    statusCode:201,
    message:"user signup successfully"
})

    
}catch(e:any){
    return res.json({
        statusCode:400,
        message:e.message
    })
    
    
}
}
export let login = async (req:Request, res:Response)=>{
    try{
   let secretKey:any = process.env.SECRET_KEY

      const { email, password }:{email:string, password:string} = req.body;
      const emailTrim:string = email.trim();
      const passwordTrim:string  = password.trim()
      const userData:any = await user.findOne({
        where:{
            email:emailTrim
        }
    })

    if(!userData){
        return res.json({
            statusCode:404,
            message:"user not found"
        })
    }
    
    const databasePassword:string = userData.dataValues.password; 
    const databaseId:any = userData.dataValues.userId; 
    const bcryptPasswordMatch:boolean = await bcrypt.compare(
        passwordTrim,
        databasePassword
        )
        if (bcryptPasswordMatch == false) {
                          return res.json({
                            statusCode: 400,
                            message: "invalid credential",
                          });
                        } 
                        
else{
    const jwtToken = await jwt.sign(
                          { _id: databaseId },
                          secretKey,
                          { expiresIn: "24h" }
                        );
                        return res.json({
                          statusCode: 200,
                          message: "login successfully",
                          data: jwtToken,
                        });

}

    }catch(e:any){
        console.log(e);
        
        return res.json({
            statusCode:400,
            message:e.message
        })
    }
}



export let showAllUser = async (req:Request, res:Response)=>{
try{

const userData:any = await user.findAll()

return res.json({
    statusCode:200,
    message:userData
})

}catch(e:any){
return res.json({
    statusCode:400,
    message:e.message
})
}


}


export let updatePassword = async (req:any, res:Response)=>{
try{

    let { password}:{password:string} = req.body 

    let passwordTrim:string = password.trim()

    const salt:any = await bcrypt.genSalt(10);
    const hash:string = await bcrypt.hash(passwordTrim, salt)
    const updatePassword = await user.update({ password:hash},{where:{
        userId:req.id

    }})
return res.json({
    statusCode:400,
    message:"password update"
})

}catch(e:any){
    return res.json({
        statusCode:400,
        message:e.message
    })
}


}
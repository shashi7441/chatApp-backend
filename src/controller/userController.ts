import {Request, Response} from 'express'
import { client } from '../config/db';
import dotenv from 'dotenv';
import  bcrypt from 'bcrypt'

dotenv.config()
import * as jwt from 'jsonwebtoken';
export async function userSignup(req:Request, res:Response ){
try{
let{email, password, fullname}:{email:string,password:string, fullname:string } = req.body
const userRole:string = "user"
const emailTrim:string = email.trim()
const passwordTrim:string = password.trim()
const fullNameTrim:string = fullname.trim()
const salt:any = await bcrypt.genSalt(10);
const hash:string = await bcrypt.hash(passwordTrim, salt)

console.log(hash);

const findUser:any = await client.query(`SELECT * FROM userlist WHERE email = '${emailTrim}'`) 
const emailExist:any = findUser.rows
  for(let element of emailExist){
if(emailTrim === element.email){
    return res.json({
        statusCode:400,
        messsage:"email already exist"
    })
} 
}
  const createUser:any = await client.query(`INSERT INTO userlist(role, fullname, password, email) VALUES('${userRole}', '${fullNameTrim}', '${hash}' , '${emailTrim}') RETURNING *`);
    return res.json({
        statusCode:200,
        data:createUser.rows
    })
}
catch(e:any){
    res.json({
        statusCode:400,
        message:e.message
    })
}
}
export let login = async (req:Request, res:Response) => {
    try {
let secretKey:any = process.env.SECRET_KEY

      const { email, password }:{email:string, password:string} = req.body;
      const emailTrim:string = email.trim();
      const findQuery = `SELECT * FROM userlist WHERE email ='${emailTrim}' `;
      await client
        .query(findQuery)
        .then(async (result:any) => {
          if (result.rows.length === 0) {
            return res.json({
              statusCode: 404,
              message: "data not found",
            });
          }
          const databasePassword = result.rows;
          for (let passwords of databasePassword) {
            const bcryptPasswordMatch:boolean = await bcrypt.compare(
              password,
              passwords.password
            )
            if (bcryptPasswordMatch == false) {
              return res.json({
                statusCode: 400,
                message: "invalid credential",
              });
            } 
            
            else {
              let ids = result.rows;    
              for (let id of ids) {
                const jwtToken = await jwt.sign(
                  { _id: id.userid },
                  secretKey,
                  { expiresIn: "24h" }
                );
                return res.json({
                  statusCode: 200,
                  message: "login successfully",
                  data: jwtToken,
                });
              }
            }
          }
        })
        .catch((e:any) => {
          return res.json({
            statusCode: 400,
            message: e.message,
          });
        });
    } catch (e:any) {
      return res.json({
        statusCode: 400,
        message: e.message,
      });
    }
  };
  
  export let showAllUser = async (req:Request, res:Response) => {
    try {
      const query = `SELECT * FROM userlist`;
      const result = await client.query(query);
  
      if (result.rows.length == 0) {
        return res.json({
          statusCode: 404,
          message: "data not found",
        });
      } else {
        return res.json({
          statusCode: 200,
          data: result.rows,
        });
      }
    } catch (e:any) {
      return res.json({
        statusCode: 400,
        message: e.message,
      });
    }
  };
  

// const Joi = require("joi");
import joi from 'joi'

import{Request, Response, NextFunction} from 'express'


 export const userLoginValidation = (req:Request, res:Response, next:NextFunction) => {
  const validateUser = (user:any) => {
    const JoiSchema = joi.object({
      email: joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ["com", "net"] },
        })
        .required(),
      password: joi.string().min(6).max(50).required(),
    });
    return JoiSchema.validate(user);
  };
  const response = validateUser(req.body);
  if (response.error) {
    const msg = response.error.details[0].message;
    return res
      .status(422)
      .json({ status: 422, message: msg.replace(/[^a-zA-Z ]/g, "") });
  } else {
    next();
  }
};

export const userSignupValidation = (req:Request, res:Response, next:NextFunction)  => {
    const validateUser = (user:object) => {
      const JoiSchema = joi.object({
        email: joi.string()
          .email({
            minDomainSegments: 2,
            tlds: { allow: ["com", "net"] },
          })
          .trim()
          .required(),
        password: joi.string().min(6).max(50).required().trim(),
        fullname: joi.string().min(3).max(25),
      });
      return JoiSchema.validate(user);
    };
   
    
    const response = validateUser(req.body);
    
    
    if (response.error) {
    
      
      const msg = response.error.details[0].message;
      return res
        .status(422)
        .json({ status: 422, message: msg.replace(/[^a-zA-Z ]/g, "") });
    } else {
         next()
    }
  };
  
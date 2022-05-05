import Joi from 'joi'
import {NextFunction, Request , Response} from 'express'

export let todoValidation = (req:Request, res:Response, next:NextFunction) => {
  const validateTodo = (user:any) => {
    const JoiSchema = Joi.object({
      description: Joi.string()
        .trim()
        .required()
        .min(5)
        .max(150)
        .message("min 5 character and maximum 150 character are allowed"),
    });
    return JoiSchema.validate(user);
  };
  const response = validateTodo(req.body);
  if (response.error) {
    const msg = response.error.details[0].message;
    return res
      .status(422)
      .json({ status: 422, message: msg.replace(/[^a-zA-Z ]/g, "") });
  } else {
    next();
  }
};
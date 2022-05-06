
import express from 'express'
import {userSignup, login, showAllUser , updatePassword} from '../controller/userController'
import {userLoginValidation, userSignupValidation, userUpdatePasswordValidation} from '../middleware/userValidation'
import { tokenVarify } from '../service/userService';
  export  let userRoutes = express.Router();

userRoutes.post('/signup',userSignupValidation, userSignup)
userRoutes.post('/login', userLoginValidation,login)
userRoutes.get('/showUser',showAllUser )
userRoutes.put('/updatePassword',tokenVarify ,userUpdatePasswordValidation , updatePassword )



import express from 'express'
import {userSignup, login, showAllUser} from '../controller/userController'
import {userLoginValidation, userSignupValidation} from '../middleware/userValidation'
  export  let userRoutes = express.Router();

userRoutes.post('/signup', userSignupValidation, userSignup)
userRoutes.post('/login', userLoginValidation, login)
userRoutes.get('/showUser',showAllUser )

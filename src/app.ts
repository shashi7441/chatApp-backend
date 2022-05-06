import express from "express";

const app:any = express();
const port:number = 5000
require('./config/db')

import {userRoutes} from './router/userRoutes'
import{todoRoutes} from './router/todoRoutes'
app.use(express.json())
app.use('/api/auth/user',userRoutes)
app.use('/api/user/todo', todoRoutes)


app.listen(port, ()=>{
    console.log(`server listening on port ${5000}`);
    
})
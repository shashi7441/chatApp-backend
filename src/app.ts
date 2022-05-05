export {}

import  express from "express";
import dotenv from 'dotenv';
import {userRoutes}  from './routes/userRoutes'
import {todoRoutes} from './routes/todoRoutes'
import {cheackRoute} from './services/user'

dotenv.config();
require('./config/db')
const port:any = process.env.PORT;

const app = express()


app.use(express.json())
app.use('/api/auth/user', userRoutes)
app.use('/api/user/todo', todoRoutes)
app.use('/*', cheackRoute)

 app.listen(port, () => {
    console.log(`Server is running at: ${port}`);
  });

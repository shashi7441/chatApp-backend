
const { Client } = require("pg");
// import Client from 'pg'
import dotenv from 'dotenv';
dotenv.config()

let password:any = process.env.PASSWORD 
let user:any  = process.env.MY_USER
export const client = new Client({
  user: user,
  host: "localhost",
  database: "chatusers",
  password: password,
  port: 5432,
});
client
  .connect()
  .then(() => {
    console.log("database connected successfully");
  })
  .catch((e:any) => {
    console.log(e);
  });


  // let createTodos = `CREATE TABLE IF NOT EXIST "userlist"(
  //   userid serial PRIMARY KEY NOT NULL,
	// fullName VARCHAR(60) UNIQUE NOT NULL,
	// password VARCHAR(80) NOT NULL,
	// email VARCHAR(255) UNIQUE NOT NULL,
  //   isActive BOOL DEFAUL TRUE,
  //   created_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	// created_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`;


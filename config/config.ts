import dotenv from 'dotenv'
dotenv.config()
module.exports = {
    development: {
        username: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        host: process.env.HOST,
        dialect: process.env.MY_DATABAS
      }

}





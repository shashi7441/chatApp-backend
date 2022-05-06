
import { Sequelize} from 'sequelize'
import dotenv from 'dotenv';
dotenv.config()


export let sequelize = new Sequelize('userlist_seq', 'postgres','1234',{
 host:'localhost',
 dialect:"postgres",
 logging:false
})

sequelize.authenticate().then(()=>{
    console.log('conected successfully');
    
}).catch((e:any)=>{
    console.log(e);
})


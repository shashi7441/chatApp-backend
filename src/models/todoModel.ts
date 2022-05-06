

import {DataTypes} from 'sequelize'
import { sequelize } from "../config/db";

export let Todolist = sequelize.define("todo-list",{
      id:{
       type:DataTypes.INTEGER,
       autoIncrement:true,
       primaryKey:true
      },
      userId:{
     type:DataTypes.INTEGER
      },
      description:DataTypes.STRING,
      ischeacked:{
          type:DataTypes.BOOLEAN,
          defaultValue:false
      }

  }, {timestamps:true},)
Todolist.sync({force:false}).then(()=>{
console.log("todo table created");
   
    
}).catch((e:any)=>{
console.log(e);

})


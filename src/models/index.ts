

import {DataTypes, QueryInterface} from 'sequelize'
import { sequelize } from "../config/db";

export let user = sequelize.define("users",{
      userId:{
       type:DataTypes.INTEGER,
       primaryKey:true,
       autoIncrement:true
      },
      fullName:DataTypes.STRING,
      email:{
          type:DataTypes.STRING
      },
      password:DataTypes.STRING,
      title:DataTypes.STRING,
      isActive:{
          type:DataTypes.BOOLEAN,
          defaultValue:true
      }

  }, {timestamps:true},)
user.sync({force:false}).then(()=>{
    console.log("new table created");
    
}).catch((e:any)=>{
console.log(">>>>>>>>>>>>>>>",e);

})



import {Response} from 'express'
import { Todolist } from '../models/todoModel';

export let addTodo = async (req:any , res:Response) => {
  try {

    const { description }:{description:string} = req.body;
    const originalDescription:string = description.trim();
    const todoData:any = await Todolist.findOne({
        where:{
            description:originalDescription
        }
    })
    if(todoData){
        const todoValue:string = todoData.dataValues.description
       return res.json({
           statusCode:400,
           message:"already added "
       }) 
    }

    else{

const createTodo:any = await Todolist.create({userId:req.id, description:originalDescription })  
    return res.json({
      statusCode: 201,
      message: "added successfully",
      data: createTodo.dataValues,
    });

    }

  } catch (e:any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};


export let editTodo = async (req:any, res:Response) => {
  try {
    const id = req.params.id;
    const numberId:any = id.replace(/[' "]+/g, "");

    if (Number.isNaN(parseInt(numberId)) === true) {
      return res.json({
        statusCode: 400,
        message: "id type is string",
      });
    }

     
    const { description }:{description:string} = req.body;
    const originalDescription:string = description.trim();

    const todoData:any = await Todolist.findOne({
        where:{
            id:numberId
        }
    })

    if(!todoData){
        return res.json({
            statusCode:404,
            message:"data not found"
        })
    }
   
    const updateTodo = await Todolist.update({description:originalDescription, userid:req.id},{where:{
        id:numberId
    }})

    return res.json({
      statusCode: 200,
      message: "updated successfully",
    });


  } catch (e:any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export let deleteTodo = async (req:any, res:Response) => {
  try {
    const id = req.params.id;
    const numberId:any = id.replace(/[' "]+/g, "");

    if (Number.isNaN(parseInt(numberId)) === true) {
      return res.json({
        statusCode: 400,
        message: "id type is string",
      });
    }
    const todoData:any = await Todolist.findOne({
        where:{
            id:numberId
        }
    })
       if(!todoData){
           return res.json({
               statusCode:404,
               message:"data not found"
           })
       }
        
    const deleteData:any = await Todolist.destroy({
        where:{
            id:numberId
        }
    })   

    return res.json({
      statusCode: 200,
      message: "deleted successfully",
    });
  } catch (e:any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export let showAllTodoForOneUser = async (req:any, res:Response) => {
  try {
    const id = req.params.id;
    const numberId = id.replace(/[' "]+/g, "");

    if (Number.isNaN(parseInt(numberId)) === true) {
      return res.json({
        statusCode: 400,
        message: "id type is string",
      });
    }    

    const todoData:any = await Todolist.findOne({
        where:{
            userId:numberId
        }
    })
       if(!todoData){
           return res.json({
               statusCode:404,
               message:"data not found"
           })
       }

else{
    return res.json({
        statusCode:200,
        data:todoData
    })

}
  } catch (e:any) {
    console.log(e);
    return res.json({
      statusCode: 200,
      message: e.message,
    });
  }
};




export let cheacked = async (req:any, res:Response) => {
  try {
    const id = req.params.id;
    const numberId = id.replace(/[' "]+/g, "");
    if (Number.isNaN(parseInt(numberId)) === true) {
      return res.json({
        statusCode: 400,
        message: "id type is string",
      });
    }

    const todoData:any = await Todolist.findOne({
        where:{
            id:numberId
        }
    })

    if(!todoData){
        return res.json({
            statusCode:404,
            message:"data not found"
        })
    }

  const value:boolean = todoData.dataValues.ischeacked

if(value === false){
 
    const updateTodo = await Todolist.update({ ischeacked:true},{where:{
        id:numberId
    }})


return res.json({
    statusCode:200,
    message:"cheacked successfully"
})    
}
else{
     
    const updateTodo = await Todolist.update({ ischeacked:false},{where:{
        id:numberId
    }})


return res.json({
    statusCode:200,
    message:"unCheacked successfully"
})    
}

} catch (e:any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};


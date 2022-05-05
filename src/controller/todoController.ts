import { client } from '../config/db';


import {Response} from 'express'

export let addTodo = async (req:any , res:Response) => {
  try {

    const { description }:{description:string} = req.body;
    const originalDescription:string = description.trim();

    const createUser = await client.query(
      `INSERT INTO todolist(userid, description) VALUES('${req.id}','${originalDescription}') RETURNING *`
    );

    return res.json({
      statusCode: 201,
      message: "added successfully",
      data: createUser.rows,
    });
  } catch (e:any) {
    console.log(e);
    
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};

export let editTodo = async (req:any, res:Response) => {
  try {
    const id = req.params.id;
    const number:any = id.replace(/[' "]+/g, "");

    if (Number.isNaN(parseInt(number)) === true) {
      return res.json({
        statusCode: 400,
        message: "id type is string",
      });
    }

     
    const { description }:{description:string} = req.body;

    const originalDescription:string = description.trim();

    const findDescription = await client.query(
      `SELECT * FROM todolist WHERE id = '${number}'`
    );
    if (findDescription.rows.length == 0) {
      return res.json({
        statusCode: 400,
        message: "invalid id ",
      });
    }

    const updateTodo = await client.query(
      `UPDATE todolist SET description = '${originalDescription}', userid = ${req.id} WHERE id = ${number}`
    );

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
    const number:any = id.replace(/[' "]+/g, "");

    if (Number.isNaN(parseInt(number)) === true) {
      return res.json({
        statusCode: 400,
        message: "id type is string",
      });
    }

    console.log(number);
    const findData = await client.query(
      `SELECT * FROM todolist WHERE id=${number}`
    );
    if (findData.rows.length == 0) {
      return res.json({
        statusCode: 400,
        message: "invalid credential",
      });
    }


    const deleteData = await client.query(
      `DELETE FROM todolist WHERE id = ${number}`
    );

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
    const number = id.replace(/[' "]+/g, "");

    if (Number.isNaN(parseInt(number)) === true) {
      return res.json({
        statusCode: 400,
        message: "id type is string",
      });
    }
    // const findData = await client.query(
    //   `SELECT email FROM userdata LEFT OUTER JOIN todo_user ON todo_user.id=${id}`
    // );
    
    const findData = await client.query(
      `SELECT * FROM todolist WHERE userid= ${number} `
    );

    if (findData.rows.length == 0) {
      return res.json({
        statusCode: 404,
        message: "data not found",
      });
    }

    // Select columns from table_name1 LEFT OUTER JOIN table_name2 on table_name1.column = table_name2.column;
    return res.json({
      statusCode: 200,
      data: findData.rows,
    });
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
    const number = id.replace(/[' "]+/g, "");
    if (Number.isNaN(parseInt(number)) === true) {
      return res.json({
        statusCode: 400,
        message: "id type is string",
      });
    }

    const findData:any = await client.query(
      `SELECT * FROM todolist WHERE id=${number}`
    );
    if (findData.rows.length == 0) {
      return res.json({
        statusCode: 400,
        message: "invalid credential",
      });
    }
    for (let element of findData.rows) {
      if (element.ischeacked === false) {
        const updateTodo = await client.query(
          `UPDATE todolist SET ischeacked = '${true}', userid = ${
            req.id
          } WHERE id = ${number}`
        );
        return res.json({
          statusCode: 200,
          message: "cheacked successfully",
        });
      } else {
        const updateTodo = await client.query(
          `UPDATE todolist SET ischeacked = '${false}', userid = ${
            req.id
          } WHERE id = ${number}`
        );
        return res.json({
          statusCode: 200,
          message: "uncheacked successfully",
        });
      }
    }
  } catch (e:any) {
    return res.json({
      statusCode: 400,
      message: e.message,
    });
  }
};
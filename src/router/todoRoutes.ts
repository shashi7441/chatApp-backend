import express from 'express'
export  let todoRoutes = express.Router();
import { tokenVarify } from '../service/userService';
import { todoValidation } from "../middleware/todoValidation";
import{addTodo, editTodo, deleteTodo, cheacked, showAllTodoForOneUser} from '../controller/todoController'

todoRoutes.post("/", tokenVarify, todoValidation, addTodo);
todoRoutes.put("/:id", tokenVarify, todoValidation, editTodo);
todoRoutes.delete("/:id", deleteTodo);
todoRoutes.get("/:id", showAllTodoForOneUser);
todoRoutes.patch("/:id", tokenVarify, cheacked);


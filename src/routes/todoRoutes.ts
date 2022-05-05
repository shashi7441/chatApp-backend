import express from 'express'
export  let todoRoutes = express.Router();
import { tokenVarify } from '../services/user';
import { todoValidation } from "../middleware/todoMiddleware";
import{addTodo, editTodo, deleteTodo, showAllTodoForOneUser, cheacked} from '../controller/todoController'

todoRoutes.post("/", tokenVarify, todoValidation, addTodo);
todoRoutes.put("/:id", tokenVarify, todoValidation, editTodo);
todoRoutes.delete("/:id", deleteTodo);
todoRoutes.get("/:id", showAllTodoForOneUser);
todoRoutes.patch("/:id", tokenVarify, cheacked);

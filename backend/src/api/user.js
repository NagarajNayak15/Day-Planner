import express from "express"
const user=express()
import {addTodo, addDay} from "../routers/user.js"
import auth from "../middlewares/auth.js"
user.post('/addday',auth,addDay);
user.post('/addtodo',auth,addTodo);

export default user;

import express from 'express'
import {Signup,Login,me} from '../routers/auth.js'
import authme from '../middlewares/auth.js'
const auth=express();

auth.post('/signup',Signup)
auth.post('/login',Login)
auth.get('/me',authme,me)

export default auth
import express from 'express'
import cors from 'cors'
import auth from './api/auth.js';
import user from './api/user.js';
const app=express();

const current= new Date();
console.log(current);
current.setDate(current.getDate()+10)
console.log(current)


app.use(cors())
app.use(express.json())

app.use('/auth',auth)
app.use('/user',user)

app.get('/',(req,res)=>{
    
    
    res.json({msg:"gello"})
    
})

app.listen(3000,()=>{
    console.log("server started")
})
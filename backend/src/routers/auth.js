import db from '../db/db.js'
import z from 'zod'
import jwt from 'jsonwebtoken'

const schema1= z.object({
    name:z.string().min(3),
    email:z.email(),
    password:z.string().min(3)
})

const Signup=async(req,res)=>{
    const body=req.body;
    const user=await db.findOne({email:body.email})
    if(user)
        return res.json({msg:"user already exists"})
    const parse= schema1.safeParse(body)
    if(parse.success)
    db.insertOne({
        name:body.name,
        email:body.email,
        password:body.password,
        steak:0,
        daily:[],
        todos:[]
    }).then((val)=>{
        const token=  jwt.sign({email:val.email},process.env.JWT_SECRET)
        return res.json({msg:"created successfully", token:token})}
    )
    .catch((e)=>{
        
        return res.json({msg:"db error"})
    })
    else
        return res.json({msg:"invalid input"})
}

const Login=async(req,res)=>{
    const body=req.body
    const user=await db.findOne({email:body.email})
    if(user){
        const token=jwt.sign({email:user.email},process.env.JWT_SECRET)
        return res.json({msg:"successfully logged in",token:token})
    }
    return res.json({msg:"invalid credentials"})
}


const me=(req,res)=>{
    res.json({msg:req.email})
}
export  {Signup,Login,me}
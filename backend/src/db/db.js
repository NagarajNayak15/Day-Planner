import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()


await mongoose.connect(process.env.DB_URL)

const schema1=new mongoose.Schema({
    title:String,
    iscompleted:Boolean,
    day:Number,
    date:Date,
    type:String

})

const schema2= new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    streak: Number,
    todos:[schema1],
    daily:[String]
})

const db= mongoose.model('todos',schema2)

export default db;
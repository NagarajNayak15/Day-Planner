import db from "../db/db.js";

async function addDay(req,res){
    const user_email=req.email;
    try{
        const search=await db.find({"email":user_email}).select('daily todos');
        const daily=search[0].daily;
        const existing_todos=search[0].todos
        var todo_date=new Date()
        
        var max_day=1;
        if(existing_todos.length){
            existing_todos.forEach((item,index)=>{
                if(item.day>max_day){
                    max_day=item.day
                    todo_date=item.date
                }
            })
            
            todo_date.setDate(todo_date.getDate()+1)
            
        }

        daily.forEach(async (item,index)=>{
            await db.updateOne({email:user_email},{
                $push:{todos:{
                        title:item,
                        iscompleted:false,
                        day:max_day+1,
                        date:todo_date,
                        type:"daily"
                }}
            })
        })
        res.json({msg:"sucess"})

    }
    catch(e){
        
        res.json({msg:"error"})
    }
}
async function addTodo(req,res){
    const user_email=req.email;
    const body= req.body;

    try{
        const user_todos=await db.findOne({email:user_email})
      
        var todo_date=new Date()
        for(const item of user_todos.todos){
            if(item.day==body.day){
                todo_date=item.date
                break;
            }    
        }
        const result= await db.updateOne({email:user_email},{
            $push:{todos:{
                    title:body.title,
                    iscompleted:false,
                    day:body.day,
                    date:todo_date,
                    type:"task"
            }}
        })
        if(result)
            return res.json({msg:"todo added successfully"})
        return res.json({msg:"user not found"})
        
    }
    catch(e){
      
        res.json({msg:"invalid request"})
    }
    
}
export  {addTodo, addDay};
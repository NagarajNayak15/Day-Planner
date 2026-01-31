import jwt from 'jsonwebtoken'
export default async function(req,res,next){
    const autherizations=req.headers.authorization
    
    const token=autherizations.split(" ")[1]
  
    try{
        const verify=jwt.verify(token,process.env.JWT_SECRET)
        req.email=verify.email
        next()
    }    
    catch(e){
        res.status(403)
    }
    
}
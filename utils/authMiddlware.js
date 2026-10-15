import jwt from 'jsonwebtoken'
import secretKey from '../jwtConfig.js'

function authantication(req, res, next){
    const authHeader = req.header('Authorization')
    if(!authHeader){
        res.status(401).json({"message":"Authorization is missing"})
    }

    const [bearer, token] = authHeader.split(" ")
    if(bearer != "Bearer" || !token){
        res.status(401).json({"message":"Invalid token formate"})
    }

    jwt.verify(token,secretKey,(error,user) =>{
        if(error){
            res.status(403).json({"message":"Invalid token"})
        }
        req.user = user
        next()
    })
}
export default authantication
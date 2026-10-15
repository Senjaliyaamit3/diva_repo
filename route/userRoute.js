import express from "express"
import {addUser,getUser,getSingleUser,deleteUSer,updateUser,login} from "../controller/userDataController.js"
import authantication from "../utils/authMiddlware.js"
import uploadMiddleware from "../utils/uploadMiddleware.js"

const router = express.Router()

router.post('/api/add-user',uploadMiddleware.single("image"),addUser)
router.get('/api/get-user',authantication,getUser)
router.get('/api/get-singleuser/:uid',authantication,getSingleUser)
router.delete('/api/delete-user/:uid',authantication,deleteUSer)
router.put('/api/update-user/:uid',uploadMiddleware.single("image"),updateUser)
router.post('/api/login',login)


export default router
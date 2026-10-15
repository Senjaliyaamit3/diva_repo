import userData from '../model/user.js'
import bcrypt from "bcrypt"
import generateToken from '../utils/jwtutils.js'
import cloudinary, { proxyAgent } from '../config/cloudinary.js'

const uploadToCloudinary = (buffer)=>{
    return new Promise((resolve,reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder:'image',agent: proxyAgent
            },
            (error,result) => {
                if(error) return reject(error)
                resolve(result)
            })
            stream.end(buffer)
    })
}


export const addUser = async (req,res) => {
    try {
        const password = await bcrypt.hash(req.body.password,10)
        let image = ""
        if(req.file){
            const result = await uploadToCloudinary(req.file.buffer)
            image = result.secure_url
        }
        const userDataval = {
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            address:req.body.address,
            password:password,
            image:image
       }
       const saveUSerData = await userData.create(userDataval)
       try{
        const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email",{
            headers: {
                "api-key" : process.env.BREVO_API_KEY,
                "content-type" : "application/json",
            },
            body:JSON.stringify({
                sender:{name:"MY App",email:"amitsenjaliya043@gmail.com"},
                to: [{email:req.body.email}],
                subject : "Test email",
                htmlContent:"<p>Welcome To Our website!</p>"
            })
        })
        if(!brevoRes.ok){
            console.error("Brevo email failed:",brevoRes.status,await brevoRes.text())
        }
       }catch(emailError){
        console.error("Brevo email error:",emailError.message)
       }
        res.status(200).json({message:"user added successflly",data:saveUSerData})
    }catch(error) {
        res.status(500).json({errorMessage:error.message})
    }
}

export const getUser = async (req,res) => {
    try {
        const getuserData = await userData.find()
        res.status(200).json({message:"user get successfulyy",data:getuserData})
    } catch(error) {
        res.status(500).json({errorMessage:error.message})
    }

}

export const getSingleUser = async (req,res) =>{
    try{
        const id = req.params.uid
        const getsingleUserdata = await userData.findById(id)
        res.status(200).json({message:"user get successfully",data:getsingleUserdata})

    }catch(error) {
        res.status(500).json({errorMessage:error.message})
    }
}

export const deleteUSer = async (req,res) => {
    try{
        const id = req.params.uid
        const deleteuserData = await userData.findByIdAndDelete(id)
        res.status(200).json({message:"user deleted successfully",data:deleteuserData})

    }catch(error) {
        res.status(500).json({errorMessage:error.message})
    }
}

export const updateUser = async (req,res) => {
    try{
        const id = req.params.uid
        const saveUserdata = {
            name : req.body.name,
            email : req.body.email,
            phone : req.body.phone,
            address : req.body.address,
            password : req.body.password
        }
        const deleteuserData = await userData.findByIdAndUpdate(id,saveUserdata,{
            new : true,
            runValidators : true 
        })
        res.status(200).json({message:"user updated successfully",data:deleteuserData})

    }catch(error) {
        res.status(500).json({errorMessage:error.message})
    }
}

export const login = async (req,res) => {
    try{
        const Udata = await userData.findOne({email:req.body.email})

        if(!Udata){
            res.status(200).json({message:"Email id InCorrect",status:0})
        }
        const comparePassword = bcrypt.compare(Udata.password,req.body.password)
        if(!comparePassword){
            res.status(200).json({message:"Incorrect Password",status:0})
        }
        const token = await generateToken(Udata)
        res.status(200).json({message:"Login Successfully",status:1,data:Udata,token:token})
    } catch(error) {
        res.status(500).json({errorMessage:error.message})
    }
}
const express = require('express');
const cors = require("cors");
const app = express();
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {DBConnection} = require("./Database/db");
const User = require("./models/User");

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({extended : true}));

app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  });
  

DBConnection();



app.get("/", (req, res) =>{
    res.status(200).json({
        message : 'CrackCode Auth Server is running!',
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

app.post("/register", async (req,res) => {


    const{ username, email, password, role } = req.body;

  
    if(!(username && email && password && role)){
        return res.status(400).json({
            success: false,
            message : "Please enter all the information"});
        }


    const existingUser = await User.findOne({email });
    if(existingUser)
        return res.status(409).json({
         success: false,
        message : "User already exists with the same email"
});


    const hashedPassword  = await bcrypt.hash(password, 10);

    const user = await User.create({
        username: username.trim(),
        email : email.toLowerCase().trim(),
        password : hashedPassword,
        role : role.trim()
    });


    const token =  jwt.sign({
        id: user._id,
        email
    },process.env.SECRET_KEY,
    {
        expiresIn: "24h",
    });

    const userResponse = {
        _id : user._id,
        username : user.username,
        email : user.email,
        role : user.role,
        createdAt : user.createdAt
    }
    res.status(201).json({
        success : true,
        message : "User registered successfully",
        user : userResponse,
        token : token
    });

}
);

const PORT = process.env.PORT || 5001;

app.listen(process.env.PORT, () =>{
    console.log(`Server is listening on port ${process.env.PORT}!`);

    }
);

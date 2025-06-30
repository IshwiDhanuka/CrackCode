const express = require('express');
const app = express();
const {DBConnection} = require("./Database/db");

DBConnection();

app.get("/", (req, res) =>{
    res.status(200).json({
        message : 'CrackCode Auth Server is running!',
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

app.listen(5000, () =>{
    console.log("Server is listening on port 5000!");

    }
);

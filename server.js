const express=require("express");
const bodyParser = require("body-parser");
const http = require("http");
const cors = require("cors");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
require("dotenv").config();
var MetaData = require("./logModel");

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended : false }));
app.use(bodyParser.json());
const server = http.createServer(app);

var mysql = require('mysql2/promise');
var connection = mysql.createPool({
  host: 'sql12.freesqldatabase.com',
  user: 'sql12663091',
  password: 'nrLVkDuEZL',
  database:'sql12663091',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const client = mongoose.connect("mongodb+srv://ajay:ajstyles89@cluster0.zvrc2.mongodb.net/dyte-assignment?retryWrites=true&w=majority",{useNewUrlParser: true, useUnifiedTopology: true},(req,res)=>{
	console.log("Connected to database");
});


app.post("/ingestlogs",async (req,res)=>{
    
          const newMetaData= new MetaData();
          newMetaData.resourceId=req.body.resourceId;
          newMetaData.parentResourceId=req.body.parentResourceId;
          newMetaData
            .save()
            .then((doc)=>{
	
                if (doc.length)
                  res.status(200).json({
                    message: "NoSQL data saved successfully",
                    results: doc,
                  });
            })
            .catch(err=>res.status(404).json({message:"Error while creating new object for NoSQL",results:err}))
    await connection.execute(`INSERT INTO logs (level,message,resourceId,timestamp,traceId,spanId,commit) VALUES (?,?,?,?,?,?,?)`,[req.body.level,req.body.message,req.body.resourceId,req.body.timestamp,req.body.traceId,req.body.spanId,req.body.commit]);
    res.status(200).json({success: true, message: "Data added successfully"});
});


app.get('/api/items',async (req,res)=>{
    try{
	const {level,message,resourceId,startTimestamp,endTimestamp,traceId,spanId,commit} = req.query;
	const query = `
		SELECT * 
		FROM logs
		WHERE
		    (level = ? OR ? IS NULL)
		    AND
		    (message = ? OR ? IS NULL)
		    AND
		    (resourceId = ? OR ? IS NULL)
		    AND
		    (timestamp >= ? OR ? IS NULL)
		    AND
		    (timestamp <= ? OR ? IS NULL)
		    AND
		    (traceId = ? OR ? IS NULL)
		    AND
		    (spanId = ? OR ? IS NULL)
		    AND
		    (commit = ? OR ? IS NULL)
	    `;

	    const values = [level,level,message,message,resourceId,resourceId,startTimestamp,startTimestamp,endTimestamp,endTimestamp,traceId,traceId,spanId,spanId,commit,commit];
	    const [rows] = await connection.query(query,values);
	    res.json(rows);
    }
    catch(error){
	console.log('Error:',error);
	res.status(500).json({error: 'Internal server error'});
    }
});

server.listen(port,"0.0.0.0",()=>{
	console.log(`server is running on port ${port}`);
});

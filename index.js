const express=require("express");
const dotenv=require("dotenv");
dotenv.config();
const app=express();
app.use(express.json());
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const cors=require("cors");
app.use(cors({
    origin:["https://leafy-tiramisu-d395e5.netlify.app","http://localhost:3004"]
}))
const mongodb=require("mongodb");
const mongoClient=mongodb.MongoClient;
const URL="mongodb+srv://ram:ram123@cluster0.fqwyo.mongodb.net/?retryWrites=true&w=majority";

// Authentication
function authenticate(req,res,next){
    if(req.headers.authorization){
        let decoded = jwt.verify(req.headers.authorization, 'thisissecretkey');
        if(decoded){
          next();
        }
        else{
          res.status(401).json({message:"unauthorized"});
        }
      }
      else{
        res.status(401).json({message:"unauthorized"});
      }
}

// Signup
app.post("/signup",async (req,res) => {
try {
    // Open the connection
    let connection=await mongoClient.connect(URL);
    // Select the database
    let db=connection.db("pinterest");
    // hash mechanism f(x) + Secret key = hash value or Random number
    let salt=bcrypt.genSaltSync(10);
    let hash=bcrypt.hashSync(req.body.password,salt);
    req.body.password=hash;
    // Select the collection and Do operation for the method
    await db.collection("users").insertOne(req.body);
    // Close the connection
    await connection.close();
    res.json({message:"user registered successfully"});
} catch (error) {
    res.status(500).json({message:"something went wrong"});
}
});

// Login
app.post("/login",async (req,res) => {
    try {
        // Open the connection
        let connection=await mongoClient.connect(URL);
        // Select the database
        let db=connection.db("pinterest");
        // Select the collection and Do operation for the method
        let user=await db.collection("users").findOne({email:req.body.email});
        if(user){
            let compare=bcrypt.compareSync(req.body.password,user.password);
            if(compare){
                // Generate JWT token
                 let jwtToken=jwt.sign({name:user.name,id:user._id},"thisissecretkey");
                 res.json({token:jwtToken});
            }
            else{
                res.status(401).json({message:"Credential not found"});
            }
        }
        else{
            res.status(401).json({message:"Credential not found"});
        }
        // Close the connection
        await connection.close();
    } catch (error) {
        res.status(500).json({message:"something went wrong"});
    }
})

// Create Pin
app.post("/createpin",authenticate,async (req,res) => {
    try {
        // Open the connection
        let connection=await mongoClient.connect(URL);
        // Select the database
        let db=connection.db("pinterest");
        // Select the collection and Do operation for the method
        await db.collection("pin").insertOne(req.body);
        // Close the connection
        await connection.close();
        res.json({message:"pin created successfully"})
    } catch (error) {
        res.status(500).json({message:"something went wrong"});
    }
})

// Get Pin
app.get("/home",authenticate,async (req,res) => {
    try {  
        let connection=await mongoClient.connect(URL);  
        let db=connection.db("pinterest");
        let pins=await db.collection("pin").find().toArray();
        await connection.close();
        res.json(pins);
    } catch (error) {
        res.status(500).json({message:"something went wrong"});
    }
})

// View pin
app.get("/viewpin/:id",async (req,res) => {
try {
    let connection=await mongoClient.connect(URL);
    let db=connection.db("pinterest");
    let pin=await db.collection("pin").findOne({ _id: mongodb.ObjectId(req.params.id) });
    await connection.close();
    res.json(pin);
} catch (error) {
    res.status(500).json({message:"Something went wrong"});
}
})

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Web server on at ${port}`);
});
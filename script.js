const express=require("express");
const app=express();
app.use(express.json());
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const cors=require("cors");
app.use(cors({
    origin:"http://localhost:3004"
}))
const mongodb=require("mongodb");
const mongoClient=mongodb.MongoClient;
const URL="mongodb+srv://ram:ram123@cluster0.fqwyo.mongodb.net/?retryWrites=true&w=majority";

app.post("/signup",async (req,res) => {
try {
    // Open the connection
    let connection=await mongoClient.connect(URL);
    // Select the database
    let db=connection.db("pinterest");
    // hash mechanism
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


app.listen(3008, () => {
  console.log("Web server on");
});
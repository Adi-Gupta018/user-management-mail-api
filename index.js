const express = require('express');
const connectDB = require ('./db/connect');
require('dotenv').config();
const userRouter = require('./Routes/userRoutes');


const app = express();
const port = 3000;

app.use(express.json());
app.use('',userRouter);

try {
    connectDB();
    app.listen(port , ()=> {
        console.log(`server is running on ${port}`);
    })
} catch (error) {
    throw new console.error(error);
}

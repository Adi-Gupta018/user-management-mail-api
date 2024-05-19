const express = require('express');
const {listInsertion} = require('../Controllers/listController');
const {fetchList} = require('../Controllers/listController');
const uploadCSV = require('../Controllers/userController');

userRouter = express.Router();

// userRouter.post('/list',listInsertion);  
userRouter.post('/list',listInsertion);  
userRouter.get('/list',fetchList);
userRouter.get('/list/:list_id',fetchList);
userRouter.post('/upload/:list_id',uploadCSV);
userRouter.get('/test',()=>{console.log("receives");})


module.exports = userRouter;
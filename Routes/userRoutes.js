const express = require('express');
const {listInsertion} = require('../Controllers/listController');
const {fetchList} = require('../Controllers/listController');
const {uploadCSV} = require('../Controllers/userController');
const {fetchUser} = require('../Controllers/userController');
const {fetchListUsers} = require('../Controllers/userController');
const sendEmailToList = require('../Controllers/mailContoller');

userRouter = express.Router();

//post methods
userRouter.post('/list',listInsertion);  
userRouter.post('/upload/:list_id',uploadCSV);
userRouter.post('/mail/:list_id',sendEmailToList);

//get methods
userRouter.get('/list',fetchList);
userRouter.get('/list/:list_id',fetchList);

userRouter.get('/userlist/:list_id',fetchListUsers);    
userRouter.get('/user',fetchUser);
userRouter.get('/user/:user_id',fetchUser);

userRouter.get('/test',()=>{console.log("receives");})


module.exports = userRouter;
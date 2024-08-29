const express = require('express');
const cors=require('cors');
const mongoose= require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const User = require('./models/User.js');
require('dotenv').config()
const app = express();



const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';



app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));
app.use(cors({
    credentials: true,
    origin: 'http://192.168.29.23:5173',
  }));
  
mongoose.connect(process.env.MONGO_URL);


app.get('/api/test', (req,res) => {
    res.json('test ok');
  });




app.post('/api/register', async (req,res) => {
    const {name,email,password} = req.body;
    
    try {
        const userDoc = await User.create({
          name,
          email,
          password:bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
      } catch (e) {
        res.status(422).json(e);
      }
  
});

app.post('/api/login', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {email,password} = req.body;
    const userDoc = await User.findOne({email});
    if (userDoc) {
      const passOk = bcrypt.compareSync(password, userDoc.password);
      if (passOk) {
        jwt.sign({
          email:userDoc.email,
          id:userDoc._id
        }, jwtSecret, {}, (err,token) => {
          if (err) throw err;
          res.cookie('token', token).json(userDoc);
        });
      } else {
        res.status(422).json('pass not ok');
      }
    } else {
      res.json('not found');
    }
  });

  app.get('/api/profile', async (req, res) => {
    const { token } = req.cookies;
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        const user = await User.findById(userData.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { name, email, _id } = user;
        res.json({ name, email, _id });
      });
    } else {
      res.status(401).json({ message: 'No token provided' });
    }
  });

  app.post('/api/logout', (req,res) => {
    res.cookie('token', '').json(true);
  });


  app.post('/api/upload-by-link', async (req,res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
      url: link,
      dest: '/tmp/' +newName,
    });
    const url = await uploadToS3('/tmp/' +newName, newName, mime.lookup('/tmp/' +newName));
    res.json(url);
  });


  const photosMiddleware = multer({dest:'/tmp'});
  app.post('/api/upload', photosMiddleware.array('photos', 100), async (req,res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const {path,originalname,mimetype} = req.files[i];
        const url = await uploadToS3(path, originalname, mimetype);
        uploadedFiles.push(url);
    }
    res.json(uploadedFiles);
    });

  app.listen(4000, '192.168.29.23', () => {
    console.log('Server is running on port 4000');
    });
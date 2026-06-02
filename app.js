const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require("fs");

mongoose.connect('mongodb://127.0.0.1:27017/shiftClasses');
const routineModel = require('./model/routine')

app.set('view engine', 'ejs')
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'));
app.use(cookieParser())

const SLOTS = [
  {id: 1, time: "8:00am - 8:50am"},
  {id: 2, time: "9:00am - 9:50am"},
  {id: 3, time: "10:00am - 10:50am"},
  {id: 4, time: "11:30am - 12:20pm"},
  {id: 5, time: "12:30pm - 1:20pm"},
  {id: 6, time: "1:30pm - 2:20pm"},
  {id: 7, time: "2:30pm - 3:20pm"},
  {id: 8, time: "3:30pm - 4:20pm"},
  {id: 9, time: "4:30pm - 5:20pm"},
];
const ROOMS = [308];

const redirectIfLogin = (req, res, next)=>{
    if(req.cookies.token){
        return res.redirect('/admin')
    }
    next();
};
app.get('/', async (req, res) => {
    const selectedDay = req.query.day || "SAT";
    const routines = await routineModel.find({
        day: selectedDay,
    });
    const booked = new Set(
        routines.map(r => `${r.room}-${r.slot}`)
    );
    const available = [];
    for (let room of ROOMS) {
        for (let slot of SLOTS) {
            if (!booked.has(`${room}-${slot.id}`)) {
                available.push({
                    room,
                    slotId: slot.id, 
                    slot: slot.time
                });
            }
        }
    }
    res.render('index', { selectedDay, available, SLOTS, ROOMS });
});
app.get('/adminLogin', redirectIfLogin, (req, res)=>{
    res.render('adminLogin')
})
app.post('/adminLogin', async (req, res)=>{
    if("e@gmail.com" == req.body.email && "1111" == req.body.password){
        let token = jwt.sign({email: "e@gmail.com"}, '1234')
        res.cookie('token', token)
        res.redirect('/admin');
    }else{
        res.redirect('/adminLogin');
    }
})
app.get('/admin', async (req, res) => {
    const requests = await routineModel.find({ status: 'pending' });
    res.render('admin', { requests });
});
app.post('/routineInput', async (req, res)=>{
    const rouine = await routineModel.create({
        day: req.body.day,
        slot: Number(req.body.slot),
        room: req.body.room,
        course_code: req.body.course_code,
        course_title: req.body.course_title
    })
    res.redirect('/admin');
})
app.post('/makeRequest', async (req, res) => {
    await routineModel.create({
        day: req.body.day,
        slot: Number(req.body.slot),
        room: req.body.room,
        status: 'pending'
    });
    res.redirect('/');
});
app.post('/approveRequest', async (req, res) => {
    await routineModel.findByIdAndUpdate(req.body.id, {
        status: 'approved'
    });
    res.redirect('/admin');
});
app.post('/rejectRequest', async (req, res) => {
    await routineModel.findByIdAndDelete(req.body.id);
    res.redirect('/admin');
});

app.get('/logout', (req, res)=>{
    res.clearCookie('token');
    res.redirect('/adminLogin');
})
app.listen(3000);
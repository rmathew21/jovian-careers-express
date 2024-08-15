require('dotenv').config();
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const JOBS = require('./jobs');
const mustacheExpress = require('mustache-express');

const app = express(); 

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'mustache');
app.engine('mustache', mustacheExpress());

app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, 'pages/index.html'));
    res.render('index', { jobs: JOBS, companyName: "Jovian"});
});


app.get('/jobs:id', (req, res) => {
    // console.log('req.params', req.params);
    const id = req.params.id;
    const matchedJob = JOBS.find(job => job.id.toString() === id);
    // console.log('matchedJob', matchedJob);
    res.render('job', { job: matchedJob});
})

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASSWORD
    }
});

app.post('/jobs/:id/apply', (req, res) => {
    console.log(req.body);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
});
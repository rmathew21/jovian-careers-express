require('dotenv').config();
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const JOBS = require('./jobs');
const mustacheExpress = require('mustache-express');
const axios = require('axios');

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
    host: 'mail.gmx.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
    
});

// console.log(process.env.EMAIL_USERNAME); 
// console.log(process.env.EMAIL_PASSWORD); 

app.post('/jobs/:id/apply', (req, res) => {
    const { name, email, phone, dob, coverletter } = req.body;
    
    const id = req.params.id;
    const matchedJob = JOBS.find(job => job.id.toString() === id);

    console.log('req.body', req.body);
    console.log('matchedJob', matchedJob)

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: process.env.EMAIL_USERNAME,
        subject: `New Application for ${matchedJob.title}`,
        html: `
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Date of Birth:</strong> ${dob}</p>
            <p><strong>Cover Letter:</strong> ${coverletter}</p>
            `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error sending email');
        } else {
            console.log('Email sent:', info.response);
            res.status(200).render('applied');
        }
    });
});

const hcaptchaSecretKey = 'ES_bf7ee2c215734204921dfb4710b4ec4f';

app.post('/submit', async (req, res) => {
    const token = req.body['h-captcha-response'];

    if (!token) {
        return res.status(400).send('hCaptcha token is missing.');
    }

    // Verify the hCaptcha token
    const verifyURL = `https://hcaptcha.com/siteverify`;
    try {
        const response = await axios.post(verifyURL, null, {
            params: {
                secret: hcaptchaSecretKey,
                response: token
            }
        });

        const data = response.data;

        if (data.success) {
            // hCaptcha passed
            res.send('hCaptcha verification passed. Form submitted successfully!');
        } else {
            // hCaptcha failed
            res.status(400).send('hCaptcha verification failed.');        }
        }
     catch (error) {
        console.error('Error verifying hCaptcha:', error);
        res.status(500).send('Server error.');
    }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
});
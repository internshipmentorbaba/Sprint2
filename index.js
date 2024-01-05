#!/usr/bin/env node

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        throw err;
    }
    console.log('Connected to the database!');
});

// Middleware for handling errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Login endpoint
app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const sql = `SELECT * FROM users WHERE email = ?`;
    connection.query(sql, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length > 0) {
            const storedHashedPassword = results[0].password;

            bcrypt.compare(password, storedHashedPassword, (bcryptErr, bcryptRes) => {
                if (bcryptErr) {
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                if (bcryptRes) {
                    // Redirect to the Node.js app on another EC2 instance
                    const nodeAppUrl = 'http://ec2-15-206-173-243.ap-south-1.compute.amazonaws.com/:8000/todo';
                    res.redirect(nodeAppUrl);
                } else {
                    res.status(401).json({ message: 'Invalid password' });
                }
            });
        } else {
            res.status(401).json({ message: 'User not found' });
        }
    });
});

// Registration endpoint
app.post('/register', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        const insertSQL = `INSERT INTO users (email, password) VALUES (?, ?)`;
        connection.query(insertSQL, [email, hashedPassword], (insertErr, insertResults) => {
            if (insertErr) {
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            // Redirect to your S3-hosted login page
            const loginPageUrl = 'http://bucketfors3deployment.s3-website-us-east-1.amazonaws.com';
            res.redirect(loginPageUrl);
        });
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

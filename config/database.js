const { Sequelize } = require("sequelize");

const db = new Sequelize('auth_db','root', '123456',{
    host : "34.128.116.170",
    dialect:"mysql"
});

// const express = require('express');
// const mysql = require('mysql2');
// const app = express();

// // Konfigurasi database
// const dbConfig = {
//   host: '34.128.116.170',  // Ganti dengan nilai host Cloud SQL (biasanya localhost untuk pengembangan lokal)
//   user: 'root',  // Ganti dengan nama pengguna MySQL Anda
//   password: '123456',  // Ganti dengan kata sandi MySQL Anda
//   database: 'auth_db',  // Ganti dengan nama database Anda
//   port: 3306,  // Port default MySQL
// };

module.exports = db;
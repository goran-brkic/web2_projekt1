const Pool = require('pg').Pool;
var dotenv = require('dotenv');

dotenv.config();


const pool = new Pool({
    user: process.env.RENDER_EXTERNAL_URL ? process.env.DB_USER : 'postgres',
    password: process.env.RENDER_EXTERNAL_URL ? process.env.DB_PASSWORD : 'bazepodataka',
    host: process.env.RENDER_EXTERNAL_URL ? process.env.DB_HOST : 'localhost',
    port: 5432,
    database: process.env.RENDER_EXTERNAL_URL ? "sahliga" : 'SahLiga',
    ssl: true
});

module.exports = pool;
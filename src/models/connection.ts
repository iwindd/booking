import mysql from 'mysql2';
import * as dotenv from 'dotenv'

const env : any = dotenv.config().parsed

const connection = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE
}).promise();

export default connection
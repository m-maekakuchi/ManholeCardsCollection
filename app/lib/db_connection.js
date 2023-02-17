const db_cnf = require('../config/db_cnf')

const mysql = require("mysql2/promise");
let pool;
module.exports = function getPool() {
  if (pool === undefined) {
    pool = mysql.createPool(db_cnf.op);
    return pool;
  } else {
    return pool;
  }
};
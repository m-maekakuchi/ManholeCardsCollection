module.exports.op = {
  port: process.env.DB_PORT || 3306,
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'manhole',
  password: process.env.DB_PASS || 'manhole',
  database: process.env.DB_NAME || 'manhole',
  waitForConnections: true,
  multipleStatements: true
}
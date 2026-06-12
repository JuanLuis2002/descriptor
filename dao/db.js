const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'SGUEES',
  pool: {
    max: Number(process.env.DB_CONNECTION_LIMIT || 10),
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: String(process.env.DB_ENCRYPT || 'false').toLowerCase() === 'true',
    trustServerCertificate: String(process.env.DB_TRUST_SERVER_CERTIFICATE || 'true').toLowerCase() === 'true'
  }
};

const poolPromise = sql.connect(config);

function normalizePlaceholders(sqlText) {
  return sqlText.replace(/:(\w+)/g, '@$1');
}

async function execute(sqlText, params) {
  const pool = await poolPromise;
  const request = pool.request();
  Object.keys(params || {}).forEach((key) => {
    request.input(key, params[key]);
  });
  const result = await request.query(normalizePlaceholders(sqlText));
  return [result.recordset || []];
}

module.exports = { execute };

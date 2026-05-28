const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db.json');

/**
 * Synchronously reads the JSON database file and returns the parsed JS Object.
 * If the database file does not exist, it creates it with an empty schema structure.
 * 
 * @returns {Object} The complete database object containing users, tasks, and logs.
 */
const readDB = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      const defaultDB = { users: [], tasks: [], logs: [] };
      fs.writeFileSync(dbPath, JSON.stringify(defaultDB, null, 2), 'utf-8');
      return defaultDB;
    }
    const rawData = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Database read error: ${error.message}`);
    return { users: [], tasks: [], logs: [] };
  }
};

/**
 * Synchronously serializes and writes a JS Object back to the local db.json file.
 * 
 * @param {Object} data - The updated database object.
 */
const writeDB = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Database write error: ${error.message}`);
  }
};

module.exports = {
  readDB,
  writeDB
};

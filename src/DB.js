import Sequelize from 'sequelize';
import sqlite from 'sqlite';

const DB_PATH = './database.sqlite';

const OPTIONS = { timestamps: false };

export const sequelize = new Sequelize('database', null, null, {
  dialect: 'sqlite',
  storage: './database.sqlite',
  operatorsAliases: false,
});

export const Feature = sequelize.define('feature', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  geometry: Sequelize.JSON,
  properties: Sequelize.JSON,
}, OPTIONS);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  }, (err) => {
    console.log('Unable to connect to the database:', err);
  });

sequelize
  .sync({ force: true })
  .then(() => {
    console.log('DB Sync OK.');
  }, (err) => {
    console.log('An error occurred while creating the table:', err);
  });

const dbPromise = sqlite.open(DB_PATH, { Promise });

export default dbPromise;

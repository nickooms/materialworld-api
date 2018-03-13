import Sequelize from 'sequelize';
// import sqlite from 'sqlite';

const DB_PATH = './database.sqlite';

export const OPTIONS = { timestamps: false };

export const sequelize = new Sequelize('database', null, null, {
  dialect: 'sqlite',
  storage: DB_PATH,
  operatorsAliases: false,
});

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

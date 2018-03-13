import Sequelize from 'sequelize';
import { OPTIONS, sequelize } from './sqlite';
import Road from './Road';

export const City = sequelize.define('city', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  name: Sequelize.STRING,
}, OPTIONS);

City.hasMany(Road, { as: 'Roads' });

export default City;

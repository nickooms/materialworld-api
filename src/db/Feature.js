import Sequelize from 'sequelize';
import { OPTIONS, sequelize } from './sqlite';

const Feature = sequelize.define('feature', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  geometry: Sequelize.JSON,
  properties: Sequelize.JSON,
}, OPTIONS);

export default Feature;

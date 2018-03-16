import { STRING, JSON } from 'sequelize';
import { OPTIONS, sequelize } from './sqlite';

const Feature = sequelize.define('feature', {
  id: {
    type: STRING,
    primaryKey: true,
  },
  geometry: JSON,
  properties: JSON,
}, OPTIONS);

export default Feature;

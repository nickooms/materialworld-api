import { INTEGER, STRING, JSON } from 'sequelize';
import { OPTIONS, sequelize } from './sqlite';

const Feature = sequelize.define('feature', {
  id: {
    type: INTEGER,
    primaryKey: true,
  },
  layer: STRING,
  geometry: JSON,
  properties: JSON,
}, OPTIONS);

export default Feature;

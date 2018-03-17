import { STRING, JSON } from 'sequelize';
import { OPTIONS, sequelize } from './sqlite';

const Feature = sequelize.define('feature', {
  id: {
    type: STRING,
    primaryKey: true,
  },
  geometry: JSON,
  properties: JSON,
}, {
  getterMethods: {
    layer() {
      return this.id.split('.')[0];
    },
  },
  ...OPTIONS,
});

export default Feature;

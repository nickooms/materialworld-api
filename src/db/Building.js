import { INTEGER, ENUM } from 'sequelize';
import { OPTIONS, sequelize } from './sqlite';

export const Building = sequelize.define('building', {
  id: {
    type: INTEGER,
    primaryKey: true,
  },
  type: ENUM('main', 'additional'),
}, OPTIONS);

export default Building;

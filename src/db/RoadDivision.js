import Sequelize from 'sequelize';
import { OPTIONS, sequelize } from './sqlite';

const RoadDivision = sequelize.define('roadDivision', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  geometry: Sequelize.JSON,
  bbox: Sequelize.JSON,
  uidn: Sequelize.INTEGER,
  oidn: Sequelize.INTEGER,
  typeId: Sequelize.INTEGER,
  typeLabel: Sequelize.STRING,
}, OPTIONS);

export default RoadDivision;

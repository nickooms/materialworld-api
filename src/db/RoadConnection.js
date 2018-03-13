import Sequelize from 'sequelize';
import { OPTIONS, sequelize } from './sqlite';

const RoadConnection = sequelize.define('road_connection', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  uidn: Sequelize.INTEGER,
  oidn: Sequelize.INTEGER,
  leftRoadId: {
    type: Sequelize.INTEGER,
  },
  rightRoadId: {
    type: Sequelize.INTEGER,
  },
  geometry: Sequelize.JSON,
}, OPTIONS);

export default RoadConnection;

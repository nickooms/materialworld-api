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
    /* references: {
      model: Road,
      key: 'id',
    }, */
  },
  rightRoadId: {
    type: Sequelize.INTEGER,
    /* references: {
      model: Road,
      key: 'id',
    }, */
  },
  geometry: Sequelize.JSON,
}, OPTIONS);

export default RoadConnection;

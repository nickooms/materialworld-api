import Sequelize from 'sequelize';
import { OPTIONS, sequelize } from './sqlite';

const Road = sequelize.define('road', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  name: Sequelize.STRING,
}, OPTIONS);

export default Road;

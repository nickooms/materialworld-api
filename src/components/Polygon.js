import React from 'react';
import PropTypes from 'prop-types';

const Polygon = ({ points, fill }) => (
  <polygon points={points} fill={fill} />
);

Polygon.propTypes = {
  points: PropTypes.string.isRequired,
  fill: PropTypes.string.isRequired,
};

export default Polygon;

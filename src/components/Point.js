import React from 'react';
import PropTypes from 'prop-types';

const Point = ({ x, y }) => (
  <circle cx={x} cy={y} r={1} fill="red" stroke="black" strokeWidth={1} />
);

Point.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
};

export default Point;

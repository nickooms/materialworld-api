import React from 'react';
import PropTypes from 'prop-types';

const Polyline = ({ points, stroke }) => (
  <polyline points={points} stroke={stroke} fill="none" />
);

Polyline.propTypes = {
  points: PropTypes.string.isRequired,
  stroke: PropTypes.string.isRequired,
};

export default Polyline;

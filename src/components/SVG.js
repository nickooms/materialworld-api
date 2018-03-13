import React from 'react';
import PropTypes from 'prop-types';

const SVG = ({ width, height, viewBox, children }) => (
  <svg width={width} height={height} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
    {children}
  </svg>
);

SVG.defaultProps = {
  width: 1000,
  height: 1000,
};

SVG.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  children: PropTypes.node.isRequired,
  viewBox: PropTypes.string.isRequired,
};

export default SVG;

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

const Street = props => (
  <Fragment>
    <h1>{props.name}</h1>
    <div>{props.id}</div>
  </Fragment>
);

Street.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
};

export default Street;

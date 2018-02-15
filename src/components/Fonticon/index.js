import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function Fonticon({ icon, className }) {
  return (
    <i
      className={classNames('fas', `fa-${icon}`, className)}
      role="presentation"
    />
  );
}

Fonticon.propTypes = {
  icon: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default Fonticon;

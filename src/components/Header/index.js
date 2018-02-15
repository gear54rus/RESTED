import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isDarkTheme } from 'store/options/selectors';

import { StyledHeader, BlackLink } from './StyledComponents';

export function Header({ darkMode }) {
  return (
    <StyledHeader darkMode={darkMode}>
      <h1>
        <BlackLink
          href="https://github.com/odin-public/RESTED-APS"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            alt="RESTED APS"
            className="logo"
            height="40"
            src="img/rested-aps-logo.png"
          />
          <span>RESTED APS</span>
        </BlackLink>
      </h1>
    </StyledHeader>
  );
}

Header.propTypes = {
  darkMode: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  darkMode: isDarkTheme(state),
});

export default connect(mapStateToProps)(Header);

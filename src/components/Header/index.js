import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { isDarkTheme } from 'store/options/selectors';

import { StyledHeader, BlackLink } from './StyledComponents';

export function Header({ darkMode }) {
  return (
    <StyledHeader darkMode={darkMode}>
      <h1>
        <BlackLink
          href="https://github.com/gear54rus/RESTED-APS"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="logo"
            role="presentation"
            height="40"
            src="img/rested-aps-logo.png"
          />
          <span>RESTED APS</span>
        </BlackLink>
      </h1>
      <a
        href="https://chrome.google.com/webstore/detail/rested-aps/omkndfeccmeplaimlpaefimnimmniccl"
        target="_blank"
        rel="noopener noreferrer"
      >
        Also available for Google Chrome{' '}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Chrome_icon_%28September_2014%29.svg"
          style={{
            height: '2em',
          }}
          alt="Chrome icon"
        />
      </a>
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

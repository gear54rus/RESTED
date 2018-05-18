import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, MenuItem } from 'react-bootstrap';

import * as actions from 'store/auth/apsToken/actions';
import { getAutoRefresh, getTokenExpired, isLoading } from 'store/auth/apsToken/selectors';

import { ButtonGroupNB, LoadingSpinner, DropdownButtonLeft } from './StyledComponents';

function TokenRefreshButton({ loading, autoRefresh, tokenExpired, refreshToken, copyCurl }) {
  const btnStyle = (tokenExpired && autoRefresh) ? 'warning' : 'primary';

  return (
    <ButtonGroupNB>
      <Button
        onClick={refreshToken}
        bsStyle={btnStyle}
      >
        Refresh token
        {loading && (
          <span>
            {' '}
            <LoadingSpinner
              icon="circle-notch"
              className="fa-spin"
            />
          </span>
        )}
      </Button>
      <DropdownButtonLeft
        bsStyle={btnStyle}
        title=""
        id="aps-token-copy-curl"
        onClick={copyCurl}
      >
        <MenuItem eventKey="1">Copy cURL</MenuItem>
      </DropdownButtonLeft>
    </ButtonGroupNB>
  );
}

TokenRefreshButton.propTypes = {
  loading: PropTypes.bool.isRequired,
  autoRefresh: PropTypes.bool.isRequired,
  tokenExpired: PropTypes.bool.isRequired,
  refreshToken: PropTypes.func.isRequired,
  copyCurl: PropTypes.func.isRequired,
};

export default connect(state => ({
  loading: isLoading(state),
  autoRefresh: getAutoRefresh(state),
  tokenExpired: getTokenExpired(state),
}), { refreshToken: actions.refreshToken, copyCurl: actions.copyCurl })(TokenRefreshButton);

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';

import * as actions from 'store/auth/apsToken/actions';
import { getAutoRefresh, getTokenExpired, isLoading } from 'store/auth/apsToken/selectors';

import { LoadingSpinner } from './StyledComponents';

function TokenRefreshButton({ loading, autoRefresh, tokenExpired, refreshToken }) {
  return (
    <Button
      onClick={refreshToken}
      bsStyle={(tokenExpired && autoRefresh) ? 'warning' : 'primary'}
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
  );
}

TokenRefreshButton.propTypes = {
  loading: PropTypes.bool.isRequired,
  autoRefresh: PropTypes.bool.isRequired,
  tokenExpired: PropTypes.bool.isRequired,
  refreshToken: PropTypes.func.isRequired,
};

export default connect(state => ({
  loading: isLoading(state),
  autoRefresh: getAutoRefresh(state),
  tokenExpired: getTokenExpired(state),
}), { refreshToken: actions.refreshToken })(TokenRefreshButton);

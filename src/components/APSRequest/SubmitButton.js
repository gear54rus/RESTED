import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';

import { isLoading } from 'store/aps/selectors';

import { LoadingSpinner } from './StyledComponents';

function SubmitButton({ loading }) {
  return (
    <Button type="submit" bsStyle="primary">
      Refresh token
      {loading && (
        <span> <LoadingSpinner
          icon="gear"
          className="fa-spin"
        /></span>
      )}
    </Button>
  );
}

SubmitButton.propTypes = {
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  loading: isLoading(state),
});

export default connect(mapStateToProps)(SubmitButton);

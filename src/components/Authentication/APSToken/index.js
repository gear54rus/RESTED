import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, FormSection } from 'redux-form';
import { Col, FormGroup, Checkbox, Alert } from 'react-bootstrap';

import BasicAuthFields from 'components/Authentication/Basic';
import {
  getAutoRefresh,
  getError,
} from 'store/auth/apsToken/selectors';
import * as actions from 'store/auth/apsToken/actions';

import OAAPIURLField from './OAAPIURLField';
import TokenValueField from './TokenValueField';
import TokenMetaFields from './TokenMetaFields';
import TokenRefreshButton from './TokenRefreshButton';

function renderAPIFields() {
  return (
    <FormGroup>
      <Col xs={5}>
        <Field
          name="url"
          component={OAAPIURLField}
        />
      </Col>
      <Col xs={7}>
        <BasicAuthFields small />
      </Col>
    </FormGroup>
  );
}

function APSTokenFields({ error, autoRefresh, setAutoRefresh }) {
  return (
    <div>
      <Field
        name="token.value"
        component={TokenValueField}
      />
      <FormSection
        name="api"
        component={renderAPIFields}
      />
      <FormGroup>
        <Col xs={7}>
          <FormSection
            name="token"
            component={TokenMetaFields}
          />
        </Col>
        <Col xs={2}>
          <Checkbox
            checked={autoRefresh}
            onChange={e => setAutoRefresh(e.target.checked)}
          >
            Refresh automatically
          </Checkbox>
        </Col>
        <Col xs={3}>
          <TokenRefreshButton />
        </Col>
      </FormGroup>
      {error && (
        <Alert bsStyle="danger">
          {`An error occurred while refreshing the token: ${error}`}
        </Alert>
      )}
    </div>
  );
}

APSTokenFields.propTypes = {
  error: PropTypes.string,
  autoRefresh: PropTypes.bool.isRequired,
  setAutoRefresh: PropTypes.func.isRequired,
};

export default connect(state => ({
  error: getError(state),
  autoRefresh: getAutoRefresh(state),
}), { setAutoRefresh: actions.setAutoRefresh })(APSTokenFields);

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormSection, Field } from 'redux-form';
import { FormGroup, FormControl, Col, ControlLabel } from 'react-bootstrap';

import { fieldShape } from 'propTypes/field';
import Collapsible from 'components/Collapsible';
import { authTypes } from 'store/auth/sagas';
import { getAuthType } from 'store/request/selectors';

import BasicFields from './Basic';
import APSTokenFields from './APSToken';
import OAuth1Fields from './OAuth1';

export const authCollapsibleID = 'auth';

function AuthTypeField({ input }) {
  return (
    <FormGroup controlId="auth">
      <Col
        componentClass={ControlLabel}
        xs={2}
      >
        Type
      </Col>
      <Col xs={8}>
        <FormControl
          componentClass="select"
          placeholder="Authentication type"
          {...input}
        >
          {Object.entries(authTypes).map(([type, { caption }]) => (
            <option
              key={type}
              value={type}
            >
              {caption}
            </option>
          ))}
        </FormControl>
      </Col>
    </FormGroup>
  );
}

AuthTypeField.propTypes = fieldShape;

function Authentication({ authType }) {
  let authFields;

  switch (authType) {
    case 'basic':
      authFields = BasicFields;
      break;
    case 'apsToken':
      authFields = APSTokenFields;
      break;
    case 'oauth1':
      authFields = OAuth1Fields;
      break;
    default:
      authFields = null;
  }

  return (
    <Collapsible
      title="Authentication"
      id={authCollapsibleID}
    >
      <Field
        name="type"
        component={AuthTypeField}
      />
      {authFields && (
        <FormSection
          name={authType}
          component={authFields}
        />
      )}
    </Collapsible>
  );
}

Authentication.propTypes = {
  authType: PropTypes.oneOf(Object.keys(authTypes)),
};

const mapStateToProps = state => ({
  authType: getAuthType(state),
});

export default connect(mapStateToProps)(Authentication);

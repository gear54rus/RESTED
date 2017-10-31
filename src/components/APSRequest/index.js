import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field, Fields, formPropTypes } from 'redux-form';
import { Panel, Form, Col, FormGroup, Checkbox, Alert } from 'react-bootstrap';
import flow from 'lodash.flow';

import BasicAuthSection from 'components/Request/BasicAuthSection';
import * as apsActions from 'store/aps/actions';
import { getError } from 'store/aps/selectors';
import { DEFAULT_APS_REQUEST } from 'constants/constants';

import Titlebar from './Titlebar';
import URLField from './URLField';
import TokenParamsField from './TokenParamsField';
import SubmitButton from './SubmitButton';

export const apsRequestForm = 'apsRequest';

function APSRequest({ tokenFetchError, handleSubmit, sendRequest }) {
  return (
    <Panel header={<Titlebar />}>
      <Form
        horizontal
        onSubmit={handleSubmit(sendRequest)}
      >
        <FormGroup>
          <Col
            xs={5}
          >
            <Field
              name="url"
              component={URLField}
            />
          </Col>

          <Col
            xs={7}
          >
            <Fields
              names={['username', 'password']}
              component={BasicAuthSection}
              small
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col
            xs={7}
          >
            <Field
              name="type"
              component={TokenParamsField}
            />
          </Col>

          <Col
            xs={2}
          >
            <Checkbox
              disabled // to be implemented
            >
              Refresh automatically?
            </Checkbox>
          </Col>

          <Col
            xs={3}
          >
            <SubmitButton />
          </Col>
        </FormGroup>
        {tokenFetchError && (
          <Alert bsStyle="danger">
            <strong>Failed to fetch token!</strong> {tokenFetchError.message}
          </Alert>
        )}
      </Form>
    </Panel>
  );
}

APSRequest.propTypes = {
  ...formPropTypes,
  tokenFetchError: PropTypes.instanceOf(Error),
};

const formOptions = {
  form: apsRequestForm,
};

const mapStateToProps = state => ({
  initialValues: DEFAULT_APS_REQUEST,
  tokenFetchError: getError(state),
});

export default flow(
  reduxForm(formOptions),
  connect(mapStateToProps, {
    ...apsActions,
  }),
)(APSRequest);

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Fields, FieldArray, FormSection, getFormValues } from 'redux-form';
import { Panel, Form } from 'react-bootstrap';
import flow from 'lodash.flow';

import * as requestActions from 'store/request/actions';
import * as collectionsActions from 'store/collections/actions';
import { isEditMode } from 'store/config/selectors';
import { DEFAULT_REQUEST } from 'constants/constants';
import AuthField from 'components/Authentication';

import Titlebar from './Titlebar';
import LineFields from './LineFields';
import HeadersField from './HeadersField';
import BodyField from './BodyField';

export const requestForm = 'request';

function Request(props) {
  const {
    formValues = {},
    handleSubmit,
    editMode,
    sendRequest,
    updateRequest,
  } = props;

  return (
    <Panel>
      <Panel.Heading>
        <Panel.Title componentClass={Titlebar} />
      </Panel.Heading>
      <Panel.Body>
        <Form
          horizontal
          onSubmit={handleSubmit(editMode ? updateRequest : sendRequest)}
        >
          <Fields
            names={['method', 'url']}
            component={LineFields}
          />
          <FieldArray
            name="headers"
            component={HeadersField}
          />
          <FormSection
            name="auth"
            component={AuthField}
          />
          {!['GET', 'HEAD'].includes(formValues.method) && (
            <BodyField />
          )}
        </Form>
      </Panel.Body>
    </Panel>
  );
}

Request.propTypes = {
  formValues: PropTypes.shape({}),
  handleSubmit: PropTypes.func.isRequired,
  editMode: PropTypes.bool.isRequired,
  sendRequest: PropTypes.func.isRequired,
  updateRequest: PropTypes.func.isRequired,
};

const formOptions = {
  form: requestForm,
};

const mapStateToProps = state => ({
  useFormData: state.request.useFormData,
  initialValues: DEFAULT_REQUEST,
  formValues: getFormValues(requestForm)(state),
  editMode: isEditMode(state),
});

export { Request };
export default flow(
  reduxForm(formOptions),
  connect(mapStateToProps, {
    ...requestActions,
    ...collectionsActions,
  }),
)(Request);

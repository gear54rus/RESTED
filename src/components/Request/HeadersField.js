import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { FormGroup, FormControl, Row, Col } from 'react-bootstrap';

import Fonticon from 'components/Fonticon';
import Collapsible from 'components/Collapsible';

import HeaderNameAutosuggest from './HeaderNameAutosuggest';
import { UnstyledButton, TrashButton } from './StyledComponents';

function renderValueField({ input, placeholder }) {
  return (
    <FormControl
      type="text"
      placeholder={placeholder}
      {...input}
    />
  );
}

renderValueField.propTypes = {
  input: PropTypes.shape({}).isRequired,
  placeholder: PropTypes.string.isRequired,
};

function HeadersField({ meta, fields }) {
  return (
    <Collapsible
      title="Headers"
      id="headers"
    >
      {fields.map((field, key) => (
        <FormGroup
          key={key}
          controlId={`header.${field}`}
          validationState={meta.invalid ? 'error' : null}
        >
          <Col xs={5}>
            <Field
              name={`${field}.name`}
              component={HeaderNameAutosuggest}
              placeholder="Name"
            />
          </Col>
          <Col xs={5}>
            <Field
              name={`${field}.value`}
              component={renderValueField}
              placeholder="Value"
            />
          </Col>
          <Col xs={2}>
            <TrashButton
              id={`removeHeaderButton${key}`}
              tooltip="Remove header"
              icon="trash"
              onClick={e => {
                e.preventDefault();
                fields.remove(key);
              }}
            />
          </Col>
        </FormGroup>
      ))}

      <Row>
        <Col xs={12}>
          <UnstyledButton
            id="addHeaderButton"
            bsStyle="link"
            onClick={() => fields.push({})}
          >
            <Fonticon icon="plus" />
            Add header
          </UnstyledButton>
        </Col>
      </Row>
    </Collapsible>
  );
}

// ESLint is not smart enough to see that these are used
/* eslint-disable react/no-unused-prop-types */
HeadersField.propTypes = {
  fields: PropTypes.shape({
    map: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    invalid: PropTypes.bool.isRequired,
  }).isRequired,
};
/* eslint-enable react/no-unused-prop-types */

export default HeadersField;


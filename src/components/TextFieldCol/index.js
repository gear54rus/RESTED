import React, { PropTypes } from 'react';
import { Field } from 'redux-form';
import { Col, FormControl } from 'react-bootstrap';

import { textFieldShape } from 'propTypes/field';

/* eslint-disable no-unused-vars */
function renderFormControl({ input, meta, type, placeholder, ...other }) {
/* eslint-enable no-unused-vars */
  return (
    <FormControl
      type={type || 'text'}
      placeholder={placeholder}
      {...other}
      {...input}
    />
  );
}

renderFormControl.propTypes = {
  ...textFieldShape,
  placeholder: PropTypes.string,
};

function TextFieldCol({ width, name, ...other }) {
  return (
    <Col xs={width}>
      <Field
        name={name}
        component={renderFormControl}
        {...other}
      />
    </Col>
  );
}

TextFieldCol.propTypes = {
  width: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
};

export default TextFieldCol;

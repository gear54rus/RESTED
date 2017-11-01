import React from 'react';
import { FormControl } from 'react-bootstrap';
import { fieldPropTypes } from 'redux-form';

function URLField({ input }) {
  return (
    <FormControl
      type="text"
      placeholder="OA API URL"
      {...input}
    />
  );
}

URLField.propTypes = fieldPropTypes;

export default URLField;

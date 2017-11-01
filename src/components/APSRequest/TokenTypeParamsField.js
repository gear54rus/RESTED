import React, { PropTypes } from 'react';
import { Field, fieldPropTypes } from 'redux-form';
import { Col, Row, FormControl } from 'react-bootstrap';


function renderTokenParamField({ input, placeholder }) {
  return (
    <FormControl
      type="text"
      placeholder={placeholder}
      {...input}
    />
  );
}

renderTokenParamField.propTypes = {
  ...fieldPropTypes,
  placeholder: PropTypes.string.isRequired,
};

function TokenTypeParamsField({ fieldsConfig }) {
  return (
    <Row>
      {fieldsConfig.map((placeholder, index) => (
        <Col
          key={index}
          xs={Math.floor(12 / fieldsConfig.length)}
        >
          <Field
            name={`params[${index}]`}
            component={renderTokenParamField}
            placeholder={placeholder}
          />
        </Col>
      ))}
    </Row>
  );
}

TokenTypeParamsField.propTypes = {
  fieldsConfig: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default TokenTypeParamsField;

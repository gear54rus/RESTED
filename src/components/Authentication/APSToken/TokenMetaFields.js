import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { FormControl, Row, Col } from 'react-bootstrap';

import TextFieldCol from 'components/TextFieldCol';
import { tokenTypes } from 'utils/aps';
import { getAPSTokenType } from 'store/request/selectors';
import { fieldNoDragShape } from 'propTypes/field';

const tokenTypeKeys = Object.keys(tokenTypes);

function renderTokenTypeField({ input }) {
  return (
    <FormControl
      componentClass="select"
      placeholder="APS token type"
      {...input}
    >
      {Object.entries(tokenTypes).map(([type, { caption }]) => (
        <option
          key={type}
          value={type}
        >
          {caption}
        </option>
      ))}
    </FormControl>
  );
}

renderTokenTypeField.propTypes = fieldNoDragShape;

function TokenMetaFields({ tokenType }) {
  const tokenTypeData = tokenTypes[tokenType || tokenTypeKeys[0]];

  return (
    <Row>
      <Col xs={5}>
        <Field
          name="type"
          component={renderTokenTypeField}
        />
      </Col>
      <Col xs={7}>
        <Row>
          {tokenTypeData.placeholders.map((placeholder, index, placeholders) => (
            <TextFieldCol
              key={index}
              width={Math.floor(12 / placeholders.length)}
              name={`params[${index}]`}
              placeholder={placeholder}
            />
          ))}
        </Row>
      </Col>
    </Row>
  );
}

TokenMetaFields.propTypes = {
  tokenType: PropTypes.oneOf(tokenTypeKeys),
};

export default connect(state => ({
  tokenType: getAPSTokenType(state),
}))(TokenMetaFields);

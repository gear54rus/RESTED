import React from 'react';
import { Field, FormSection } from 'redux-form';
import { Row, Col, FormControl, FormGroup } from 'react-bootstrap';

import { signatureMethods } from 'utils/oauth1';
import { selectFieldShape } from 'propTypes/field';

import TextFieldCol from './TextFieldCol';

function renderSignatureMethod({ input }) {
  return (
    <FormControl
      componentClass="select"
      placeholder="Signature method"
      {...input}
    >
      {Object.entries(signatureMethods).map(([value, { caption }]) => (
        <option
          key={value}
          value={value}
        >
          {caption}
        </option>
      ))}
    </FormControl>
  );
}

renderSignatureMethod.propTypes = selectFieldShape;

function renderConsumerFields() {
  return (
    <FormGroup>
      <TextFieldCol
        width={4}
        name="key"
        placeholder="Consumer key"
      />
      <TextFieldCol
        width={8}
        name="secret"
        placeholder="Consumer secret"
      />
    </FormGroup>
  );
}

function renderTokenFields() {
  return (
    <Row>
      <TextFieldCol
        width={6}
        name="key"
        placeholder="Token key"
        disabled
        title="Not yet implemented"
      />
      <TextFieldCol
        width={6}
        name="secret"
        placeholder="Token secret"
        disabled
        title="Not yet implemented"
      />
    </Row>
  );
}

function OAuth1Fields() {
  return (
    <div>
      <FormSection
        name="consumer"
        component={renderConsumerFields}
      />
      <FormGroup>
        <Col xs={8}>
          <FormSection
            name="token"
            component={renderTokenFields}
          />
        </Col>
        <Col xs={4}>
          <Field
            name="signatureMethod"
            component={renderSignatureMethod}
          />
        </Col>
      </FormGroup>
    </div>
  );
}

export default OAuth1Fields;

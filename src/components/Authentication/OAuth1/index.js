import React from 'react';
import { Field, FormSection } from 'redux-form';
import { Row, Col, FormControl, FormGroup } from 'react-bootstrap';

import TextFieldCol from 'components/TextFieldCol';
import { signatureMethods } from 'utils/oauth1';
import { fieldNoDragShape } from 'propTypes/field';

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

renderSignatureMethod.propTypes = fieldNoDragShape;

function renderConsumerFields() {
  return (
    <FormGroup>
      <TextFieldCol
        width={5}
        name="key"
        placeholder="Consumer key"
      />
      <TextFieldCol
        width={7}
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
      />
      <TextFieldCol
        width={6}
        name="secret"
        placeholder="Token secret"
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
        <Col xs={9}>
          <FormSection
            name="token"
            component={renderTokenFields}
          />
        </Col>
        <Col xs={3}>
          <Field
            name="signatureMethod"
            component={renderSignatureMethod}
          />
        </Col>
      </FormGroup>
      <FormGroup>
        <TextFieldCol
          width={3}
          name="timestamp"
          placeholder="Timestamp (auto)"
        />
        <TextFieldCol
          width={3}
          name="nonce"
          placeholder="Nonce (auto)"
        />
        <TextFieldCol
          width={2}
          name="version"
          placeholder="Version (1.0)"
        />
        <TextFieldCol
          width={4}
          name="realm"
          placeholder="Realm (optional)"
        />
      </FormGroup>
    </div>
  );
}

export default OAuth1Fields;

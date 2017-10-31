import React from 'react';
import { Field, fieldPropTypes } from 'redux-form';
import { Col, Row, FormControl } from 'react-bootstrap';

import { apsTokenTypes } from 'utils/aps';

import TokenTypeParamsField from './TokenTypeParamsField';

const apsTokenTypesArray = Object.entries(apsTokenTypes);

class TokenParamsField extends React.Component {
  static propTypes = fieldPropTypes;

  state = {
    tokenType: this.props.meta.initial,
  };

  changeTokenType(e) {
    this.setState({
      tokenType: e.target.value,
    });
  }

  render() {
    const {
      input,
    } = this.props;

    const {
      tokenType,
    } = this.state;

    return (
      <Row>
        <Col xs={5}>
          <FormControl
            componentClass="select"
            placeholder="APS token type"
            {...input}
            onChange={e => {
              this.changeTokenType(e);
              return input.onChange(e);
            }}
          >
            {apsTokenTypesArray.map(([id, { caption }]) => (
              <option
                key={id}
                value={id}
              >
                {caption}
              </option>
            ))}
          </FormControl>
        </Col>

        <Col
          xs={7}
        >
          <Field
            name="params"
            component={TokenTypeParamsField}
            fieldsConfig={apsTokenTypes[tokenType].payload.placeholders}
          />
        </Col>
      </Row>
    );
  }
}

export default TokenParamsField;

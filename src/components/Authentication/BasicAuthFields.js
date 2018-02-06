import React, { PropTypes } from 'react';
import { Col, Row, FormGroup, Checkbox } from 'react-bootstrap';

import TextFieldCol from './TextFieldCol';

function RowOrFormGroup({ useRow, children }) {
  return useRow ? (
    <Row>
      {children}
    </Row>
  ) : (
    <FormGroup>
      {children}
    </FormGroup>
  );
}

RowOrFormGroup.propTypes = {
  useRow: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

class BasicAuthFields extends React.Component {
  static propTypes = {
    small: PropTypes.bool,
  };

  state = {
    showPassword: false,
  };

  render() {
    const {
      small,
    } = this.props;

    return (
      <RowOrFormGroup
        useRow={small}
      >
        <TextFieldCol
          width={small ? 4 : 5}
          name="username"
          placeholder="Username"
        />
        <TextFieldCol
          width={5}
          type={this.state.showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Password"
        />
        <Col
          xs={small ? 3 : 2}
        >
          <Checkbox
            checked={this.state.showPassword}
            onChange={e => this.setState({ showPassword: e.target.checked })}
          >
            Show password
          </Checkbox>
        </Col>
      </RowOrFormGroup>
    );
  }
}

export default BasicAuthFields;

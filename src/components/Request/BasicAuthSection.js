import React, { PropTypes } from 'react';
import { Col, Row, FormControl, Checkbox } from 'react-bootstrap';
// import { fieldPropTypes } from 'redux-form'; for inputs

class BasicAuthSection extends React.Component {
  static propTypes = {
    username: PropTypes.shape({}).isRequired, // onDragStart is not passed, causes error
    password: PropTypes.shape({}).isRequired, // onDragStart is not passed, causes error
    small: PropTypes.bool,
  };

  state = {
    showPassword: false,
  };

  toggleShowPassword(e) {
    this.setState({
      showPassword: e.target.checked,
    });
  }

  render() {
    const {
      username,
      password,
      small,
    } = this.props;

    return (
      <Row>
        <Col
          xs={small ? 4 : 5}
        >
          <FormControl
            type="text"
            placeholder="Username"
            {...username.input}
          />
        </Col>

        <Col
          xs={5}
        >
          <FormControl
            type={this.state.showPassword ? 'text' : 'password'}
            placeholder="Password"
            {...password.input}
          />
        </Col>

        <Col
          xs={small ? 3 : 2}
        >
          <Checkbox
            checked={this.state.showPassword}
            onChange={e => this.toggleShowPassword(e)}
          >
            Show password?
          </Checkbox>
        </Col>
      </Row>
    );
  }
}

export default BasicAuthSection;

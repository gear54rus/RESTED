import React, { PropTypes } from 'react';
import { Col, FormGroup, FormControl, Checkbox } from 'react-bootstrap';

import Collapsable from 'components/Collapsable';

export class APSTokenField extends React.Component {
  static propTypes = {
    apsToken: PropTypes.shape({
      value: PropTypes.shape({
        input: PropTypes.shape({}).isRequired,
      }).isRequired,
      send: PropTypes.shape({
        input: PropTypes.shape({}).isRequired,
      }).isRequired,
    }).isRequired,
  };

  state = {};

  render() {
    const { apsToken } = this.props;

    return (
      <Collapsable
        title="APS Token"
        id="apsToken"
      >
        <FormGroup controlId="apsGroup1">
          <Col xs={10}>
            <FormControl
              type="text"
              placeholder="APS Token in base64 format"
              {...apsToken.value.input}
            />
          </Col>
          <Col xs={2}>
            <Checkbox
              defaultChecked="true"
              {...apsToken.send.input}
            >
              Send APS Token?
            </Checkbox>
          </Col>
        </FormGroup>
      </Collapsable>
    );
  }
}

export default APSTokenField;

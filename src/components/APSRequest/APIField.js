import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormSection } from 'redux-form';
import { Col, Row, FormGroup, FormControl, ControlLabel, Button } from 'react-bootstrap';

import BasicAuthSection from 'components/Request/BasicAuthSection';

export class APIField extends React.Component {
  render() {
    const {
      api,
    } = this.props;

    return (
      <FormGroup>
        <Col
          xs={6}
        >
          <FormControl
            type="text"
            placeholder="OA API URL"
            {...api.url.input}
          />
        </Col>

        <Col
          xs={7}
        >
        <FormSection
          name="api"
          username={api.username}
          password={api.password}
          component={BasicAuthSection}
        />
        </Col>
      </FormGroup>
    );
  }
}

export default APIField;

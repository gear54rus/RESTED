import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
// import { fieldPropTypes } from 'redux-form'; for input proptypes
import { Col, FormGroup, FormControl, Checkbox } from 'react-bootstrap';

import Collapsible from 'components/Collapsible';
import { getTokenDescription, getLastTokenChangeTime } from 'store/aps/selectors';

import { SmallHelpBlock } from './StyledComponents';

function APSTokenField({ apsToken, description, lastFetchTime }) {
  return (
    <Collapsible
      title="APS Token"
      id="apsToken"
    >
      <FormGroup>
        <Col xs={10}>
          <FormControl
            type="text"
            placeholder="APS Token in base64 format"
            {...apsToken.value.input}
          />
          {description && (
            <SmallHelpBlock>
              {description} fetched at {`${lastFetchTime.getHours()}:${lastFetchTime.getMinutes()}`}
            </SmallHelpBlock>
          )}
        </Col>

        <Col xs={2}>
          <Checkbox
            {...apsToken.send.input}
            checked={apsToken.send.input.value}
          >
            Send APS Token?
          </Checkbox>
        </Col>
      </FormGroup>
    </Collapsible>
  );
}

APSTokenField.propTypes = {
  apsToken: PropTypes.shape({
    value: PropTypes.shape({}).isRequired, // onDragStart is not passed, causes error
    send: PropTypes.shape({}).isRequired, // onDragStart is not passed, causes error
  }).isRequired,
  description: PropTypes.string,
  lastFetchTime: PropTypes.instanceOf(Date),
};

const mapStateToProps = state => ({
  description: getTokenDescription(state),
  lastFetchTime: getLastTokenChangeTime(state),
});

export default connect(mapStateToProps)(APSTokenField);

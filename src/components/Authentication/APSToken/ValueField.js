import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormGroup, Col, FormControl } from 'react-bootstrap';

import { getFetchedToken, getTokenChangedTime } from 'store/auth/apsToken/selectors';
import * as actions from 'store/auth/apsToken/actions';
import { timeHMS } from 'utils/dateTime';
import { textFieldShape } from 'propTypes/field';
import { fetchedTokenShape } from 'propTypes/auth/apsToken';
import { tokenTypes } from 'utils/aps';

import { SmallHelpBlock } from './StyledComponents';
import TokenTTL from './TokenTTL';

class ValueField extends React.Component {
  static propTypes = {
    ...textFieldShape,
    fetchedToken: PropTypes.shape(fetchedTokenShape),
    tokenChangedTime: PropTypes.number,
    tokenChanged: PropTypes.func.isRequired,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.fetchedToken !== this.props.fetchedToken) {
      this.animateInput = true;
    }
  }

  animateInput = false;
  inputAnimation = null;

  flashInput(input) {
    const {
      animateInput,
      inputAnimation,
    } = this;

    if (!animateInput) return;

    if (inputAnimation) {
      inputAnimation.cancel();
    }

    const style = window.getComputedStyle(input);

    this.animateInput = false;
    this.inputAnimation = input.animate({
      borderColor: ['#66afe9', style.borderColor],
      outline: ['0', style.outline],
      boxShadow: [`${style.boxShadow}, #66afe999 0px 0px 15px 10px, #66afe999 0px 0px 8px 4px inset`, style.boxShadow],
    }, 1500);
  }

  render() {
    const {
      input,
      fetchedToken,
      tokenChangedTime,
      tokenChanged,
    } = this.props;

    let description;
    let changedTime = null;

    if (!input.value) {
      description = 'No token';
    } else if (!fetchedToken || (fetchedToken.value !== input.value)) {
      changedTime = tokenChangedTime;
      description = `Unknown manually entered token, changed at ${timeHMS(new Date(changedTime))}`;
    } else {
      const tokenType = tokenTypes[fetchedToken.type];
      const params = tokenType.placeholders
        .map((placeholder, index) => {
          const param = fetchedToken.params[index];

          return param && `${placeholder}: ${param}`;
        })
        .filter(value => value) // remove falsy values
        .join(', ');

      changedTime = fetchedToken.time;
      const tokenURL = (new URL(fetchedToken.url)).origin;
      const origin = (fetchedToken.origin === 'api') ? 'XML API' : 'browser tab';
      const fetchedAt = timeHMS(new Date(changedTime));

      description = `${tokenType.caption} token ${params.length ? `(${params})` : ''}` +
        ` from ${origin} at '${tokenURL}' (${fetchedAt})`;
    }

    return (
      <FormGroup>
        <Col xs={12}>
          <FormControl
            type="text"
            placeholder="APS token"
            {...input}
            onChange={event => {
              tokenChanged(event.target.value);
              input.onChange(event);
            }}
            inputRef={ref => ref && this.flashInput(ref)}
          />
          <SmallHelpBlock>{description}</SmallHelpBlock>
          <TokenTTL changedTime={changedTime} />
        </Col>
      </FormGroup>
    );
  }
}

export default connect(state => ({
  fetchedToken: getFetchedToken(state),
  tokenChangedTime: getTokenChangedTime(state),
}), { tokenChanged: actions.tokenChanged })(ValueField);

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormControl } from 'react-bootstrap';

import { oaAPIURL } from 'utils/aps';
import { fieldShape } from 'propTypes/field';
import { getURL } from 'store/request/selectors';

class OAAPIURLField extends React.Component { // eslint-disable-line react/no-multi-comp
  static propTypes = {
    ...fieldShape,
    requestURL: PropTypes.string,
  };

  componentWillMount() {
    this.updateURL();
  }

  componentWillReceiveProps(newProps) {
    this.updateURL(newProps);
  }

  updateURL(nextProps) {
    const { input } = this.props;
    let apiURL;
    let requestURL;

    if (nextProps && (nextProps.requestURL === this.props.requestURL)) {
      return; // update should not happen while user is typing
    }

    try {
      requestURL = new URL((nextProps || this.props).requestURL);
      apiURL = new URL(input.value);
    } catch (e) {
      if (!requestURL) {
        return;
      }
    }

    if (!apiURL || (requestURL.hostname !== apiURL.hostname)) {
      const newAPIURL = oaAPIURL(requestURL);

      input.onChange(newAPIURL);
      input.value = newAPIURL;
    }
  }

  render() {
    return (
      <FormControl
        type="text"
        placeholder="OA API URL"
        {...this.props.input}
      />
    );
  }
}

export default connect(state => ({
  requestURL: getURL(state),
}))(OAAPIURLField);

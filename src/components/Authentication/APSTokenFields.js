import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field, FormSection } from 'redux-form';
import { Col, Row, FormGroup, FormControl, Button, Checkbox, Alert } from 'react-bootstrap';

import { textFieldShape, selectFieldShape } from 'propTypes/field';
import { apsFetchedTokenShape as fetchedTokenShape } from 'propTypes/auth';
import { getURL, getAPSTokenType } from 'store/request/selectors';
import { getAPSTokenTTL as getTokenTTL } from 'store/options/selectors';

import {
  apsGetAutoRefresh as getAutoRefresh,
  apsIsLoading as isLoading,
  apsGetError as getError,
  apsGetFetchedToken as getFetchedToken,
  apsGetTokenChangedTime as getTokenChangedTime,
  apsGetTokenExpired as getTokenExpired,
} from 'store/auth/selectors';

import * as authActions from 'store/auth/actions';
import { secondsToHM, timeHMS } from 'utils/dateTime';
import { tokenTypes, oaAPIURL } from 'utils/aps';

import { LoadingSpinner, SmallProgressWithOffsetText, SmallHelpBlock } from './StyledComponents';
import TextFieldCol from './TextFieldCol';
import BasicAuthFields from './BasicAuthFields';

const tokenTypeKeys = Object.keys(tokenTypes);

/* eslint-disable react/sort-comp */
class TokenTTL extends React.Component {
  static propTypes = {
    changedTime: PropTypes.number,
    tokenTTL: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    setTokenExpired: PropTypes.func.isRequired,
  };

  state = {
    now: 0,
    label: '',
    offset: 0,
  };

  timer = null;
  animateBackground = false;
  backgroundAnimation = null;

  updateBar(changedTime, firstUpdate) {
    const {
      tokenTTL,
      setTokenExpired,
    } = this.props;

    if (!changedTime) {
      setTokenExpired(true);

      this.setState({
        now: 0,
        label: '',
      });

      return;
    }

    const ttlSeconds = parseFloat(tokenTTL) * 60;
    const tokenAgeSeconds = Math.round(((new Date()).getTime() - changedTime) / 1000);
    const secondsLeft = ttlSeconds - tokenAgeSeconds;

    if (secondsLeft > 0) {
      this.setState({
        now: (secondsLeft / ttlSeconds) * 100,
        label: secondsToHM(secondsLeft),
      });
    } else {
      clearInterval(this.timer);
      setTokenExpired(true);

      if (!firstUpdate) {
        this.animateBackground = true;
      }

      this.setState({
        now: 0,
        label: 'TOKEN EXPIRED',
      });
    }
  }

  setUpdating(newTime) {
    clearInterval(this.timer);

    if (newTime) {
      this.props.setTokenExpired(false);
      this.animateBackground = false;
      this.timer = setInterval(() => this.updateBar(newTime), 1000);
    }

    this.updateBar(newTime, true);
  }

  manageUpdating(nextProps) {
    const {
      changedTime,
    } = this.props;

    if (nextProps) {
      if (nextProps.changedTime !== changedTime) {
        this.setUpdating(nextProps.changedTime);
      }
    } else {
      this.setUpdating(changedTime);
    }
  }

  flashBackground(background) {
    const {
      animateBackground,
      backgroundAnimation,
    } = this;

    if (!animateBackground) return;

    if (backgroundAnimation) {
      backgroundAnimation.cancel();
    }

    this.animateBackground = false;
    this.backgroundAnimation = background.animate({
      backgroundColor: ['#d9534f', window.getComputedStyle(background).backgroundColor],
      color: ['#fff', window.getComputedStyle(background).color],
    }, 1500);
  }

  componentWillMount() {
    this.manageUpdating();
  }

  componentWillReceiveProps(nextProps) {
    this.manageUpdating(nextProps);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const { now, offset, label } = this.state;

    return (
      <SmallProgressWithOffsetText
        bsStyle="info"
        now={now}
        className={offset < 0 ? 'label-right' : ''}
        label={(
          <div
            className="offset-label"
            style={{ right: offset }}
            ref={ref => { // calculate the placement of label
              if (!ref) return;

              const background = ref.parentElement.parentElement;

              this.flashBackground(background);

              function getWidth(element) {
                return parseFloat(window.getComputedStyle(element).width);
              }

              const ADDITIONAL_MARGIN = 5;
              const width = {
                label: getWidth(ref),
                background: getWidth(background),
              };

              width.bar = width.background * (now / 100);
              // bar width sometimes returned incorrectly
              // so we calculate it manually

              const margin = (ADDITIONAL_MARGIN * 2) + width.label;
              const newOffset = (width.background - width.bar) > margin
                ? -(width.label + ADDITIONAL_MARGIN)
                : ADDITIONAL_MARGIN;

              if (offset !== newOffset) {
                this.setState({ offset: newOffset });
              }
            }}
          >
            {label}
          </div>
        )}
      />
    );
  }
}
/* eslint-enable react/sort-comp */

TokenTTL = connect(state => ({ // eslint-disable-line no-class-assign
  tokenTTL: getTokenTTL(state),
}), { setTokenExpired: authActions.apsSetTokenExpired })(TokenTTL);

class ValueField extends React.Component { // eslint-disable-line react/no-multi-comp
  static propTypes = {
    ...textFieldShape,
    fetchedToken: PropTypes.shape(fetchedTokenShape),
    tokenChangedTime: PropTypes.number,
    tokenChanged: PropTypes.func.isRequired,
  };

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

    this.animateInput = false;
    this.inputAnimation = input.animate({
      backgroundColor: ['#5cb85c', window.getComputedStyle(input).backgroundColor],
      color: ['#fff', window.getComputedStyle(input).color],
    }, 1500);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.fetchedToken !== this.props.fetchedToken) {
      this.animateInput = true;
    }
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
      const params = fetchedToken.params
        .map((param, index) => param && `${tokenType.placeholders[index]}: ${param}`)
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

ValueField = connect(state => ({ // eslint-disable-line no-class-assign
  fetchedToken: getFetchedToken(state),
  tokenChangedTime: getTokenChangedTime(state),
}), { tokenChanged: authActions.apsTokenChanged })(ValueField);

class OAAPIURL extends React.Component { // eslint-disable-line react/no-multi-comp
  static propTypes = {
    ...textFieldShape,
    requestURL: PropTypes.string,
  };

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

  componentWillMount() {
    this.updateURL();
  }

  componentWillReceiveProps(newProps) {
    this.updateURL(newProps);
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

OAAPIURL = connect(state => ({ // eslint-disable-line no-class-assign
  requestURL: getURL(state),
}))(OAAPIURL);

function renderAPIFields() {
  return (
    <FormGroup>
      <Col xs={5}>
        <Field
          name="url"
          component={OAAPIURL}
        />
      </Col>
      <Col xs={7}>
        <BasicAuthFields small />
      </Col>
    </FormGroup>
  );
}

function renderTokenTypeField({ input }) {
  return (
    <FormControl
      componentClass="select"
      placeholder="APS token type"
      {...input}
    >
      {Object.entries(tokenTypes).map(([type, { caption }]) => (
        <option
          key={type}
          value={type}
        >
          {caption}
        </option>
      ))}
    </FormControl>
  );
}

renderTokenTypeField.propTypes = selectFieldShape;

function renderTokenMetaFields({ tokenType }) {
  const tokenTypeData = tokenTypes[tokenType || tokenTypeKeys[0]];

  return (
    <Row>
      <Col xs={5}>
        <Field
          name="type"
          component={renderTokenTypeField}
        />
      </Col>
      <Col xs={7}>
        <Row>
          {tokenTypeData.placeholders.map((placeholder, index, placeholders) => (
            <TextFieldCol
              key={index}
              width={Math.floor(12 / placeholders.length)}
              name={`params[${index}]`}
              placeholder={placeholder}
            />
          ))}
        </Row>
      </Col>
    </Row>
  );
}

renderTokenMetaFields.propTypes = {
  tokenType: PropTypes.oneOf(tokenTypeKeys),
};

renderTokenMetaFields = connect(state => ({ // eslint-disable-line no-func-assign
  tokenType: getAPSTokenType(state),
}))(renderTokenMetaFields);

function TokenRefreshButton({ loading, autoRefresh, tokenExpired, refreshToken }) {
  return (
    <Button
      onClick={refreshToken}
      bsStyle={(tokenExpired && autoRefresh) ? 'warning' : 'primary'}
    >
      Refresh token
      {loading && (
        <span>
          {' '}
          <LoadingSpinner
            icon="gear"
            className="fa-spin"
          />
        </span>
      )}
    </Button>
  );
}

TokenRefreshButton.propTypes = {
  loading: PropTypes.bool.isRequired,
  autoRefresh: PropTypes.bool.isRequired,
  tokenExpired: PropTypes.bool.isRequired,
  refreshToken: PropTypes.func.isRequired,
};

TokenRefreshButton = connect(state => ({ // eslint-disable-line no-func-assign
  loading: isLoading(state),
  autoRefresh: getAutoRefresh(state),
  tokenExpired: getTokenExpired(state),
}), { refreshToken: authActions.apsRefreshToken })(TokenRefreshButton);

function APSTokenFields({ error, autoRefresh, setAutoRefresh }) {
  return (
    <div>
      <Field
        name="token.value"
        component={ValueField}
      />
      <FormSection
        name="api"
        component={renderAPIFields}
      />
      <FormGroup>
        <Col xs={7}>
          <FormSection
            name="token"
            component={renderTokenMetaFields}
          />
        </Col>
        <Col xs={2}>
          <Checkbox
            checked={autoRefresh}
            onChange={e => setAutoRefresh(e.target.checked)}
          >
            Refresh automatically
          </Checkbox>
        </Col>
        <Col xs={3}>
          <TokenRefreshButton />
        </Col>
      </FormGroup>
      {error && (
        <Alert bsStyle="danger">
          {`An error occurred while refreshing the token: ${error}`}
        </Alert>
      )}
    </div>
  );
}

APSTokenFields.propTypes = {
  error: PropTypes.string,
  autoRefresh: PropTypes.bool.isRequired,
  setAutoRefresh: PropTypes.func.isRequired,
};

export default connect(state => ({
  error: getError(state),
  autoRefresh: getAutoRefresh(state),
}), { setAutoRefresh: authActions.apsSetAutoRefresh })(APSTokenFields);

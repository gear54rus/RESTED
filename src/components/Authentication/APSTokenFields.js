import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field, FormSection } from 'redux-form';
import { Col, Row, FormGroup, FormControl, Button, Checkbox, Alert, Label } from 'react-bootstrap';

import { textFieldShape } from 'propTypes/field';
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

import {
  apsRefreshToken as refreshToken,
  apsTokenChanged as tokenChanged,
  apsSetTokenExpired as setTokenExpired,
  apsSetAutoRefresh as setAutoRefresh,
} from 'store/auth/actions';
import { secondsToHM, timeHMS } from 'utils/dateTime';
import { tokenTypes, oaAPIURL } from 'utils/aps';

import { LoadingSpinner, SmallProgressWithOffsetText, SmallHelpBlock } from './StyledComponents';
import TextFieldCol from './TextFieldCol';
import BasicAuthFields from './BasicAuthFields';

const tokenTypeKeys = Object.keys(tokenTypes);

class TokenTTL extends React.Component {
  static propTypes = {
    changedTime: PropTypes.number,
    tokenTTL: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    setTokenExpired: PropTypes.func.isRequired,
  };

  state = {
    now: 0,
    text: '',
    offset: 0,
  };

  timer = null;

  updateBar(changedTime) {
    const {
      tokenTTL,
      setTokenExpired,
    } = this.props;

    if (!changedTime) {
      setTokenExpired(true);

      this.setState({
        now: 0,
        text: 'NO TOKEN',
      });

      return;
    }

    const ttlSeconds = parseFloat(tokenTTL) * 60;
    const tokenAgeSeconds = Math.round(((new Date()).getTime() - changedTime) / 1000);
    const secondsLeft = ttlSeconds - tokenAgeSeconds;

    if (secondsLeft > 0) {
      this.setState({
        now: (secondsLeft / ttlSeconds) * 100,
        text: secondsToHM(secondsLeft),
      });
    } else {
      clearInterval(this.timer);
      setTokenExpired(true);

      this.setState({
        now: 0,
        text: 'TOKEN EXPIRED!',
      });
    }
  }

  setUpdating(newTime) {
    clearInterval(this.timer);
    this.updateBar(newTime);

    if (newTime) {
      this.props.setTokenExpired(false);
      this.timer = setInterval(() => this.updateBar(newTime), 1000);
    }
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
    const { now, offset, text } = this.state;

    return (
      <SmallProgressWithOffsetText
        now={now}
        label={(
          <div
            className="text"
            style={{
              right: offset,
              color: offset > 0 ? 'white' : 'black',
            }}
            ref={textDiv => { // calculate the placement of text
              if (!textDiv) return;

              function getWidth(element) {
                return parseFloat(window.getComputedStyle(element).width);
              }

              const ADDITIONAL_MARGIN = 5;
              const width = {
                text: getWidth(textDiv),
                top: getWidth(textDiv.parentElement.parentElement),
              };

              width.bar = width.top * (now / 100);
              // bar width sometimes returned incorrectly
              // so we calculate it manually

              const margin = ADDITIONAL_MARGIN * 2 + width.text;
              const newOffset = (width.top - width.bar) > margin
                ? -(width.text + ADDITIONAL_MARGIN)
                : ADDITIONAL_MARGIN;

              if (offset !== newOffset) {
                this.setState({ offset: newOffset });
              }
            }}
          >
            {text}
          </div>
        )}
      />
    );
  }
}

TokenTTL = connect(state => ({
  tokenTTL: getTokenTTL(state),
}), { setTokenExpired })(TokenTTL);

function renderValueField({ input, fetchedToken, tokenChangedTime, tokenChanged, a }) {
  let description;
  let changedTime = null;

  if (!input.value) {
    description = 'No token';
  } else if (!fetchedToken || (fetchedToken.value !== input.value)) {
    changedTime = tokenChangedTime;
    description = `Unknown manually entered token, changed at ${timeHMS(new Date(tokenChangedTime))}`
  } else {
    const tokenType = tokenTypes[fetchedToken.type];
    const params = fetchedToken.params
      .map((param, index) => param && `${tokenType.placeholders[index]}: ${param}`)
      .join(', ');
    changedTime = fetchedToken.time;
    const fetchedAt = timeHMS(new Date(changedTime));

    description = `${tokenType.caption} token (${params}) from '${fetchedToken.url}' fetched at ${fetchedAt}`;
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
        />
        <SmallHelpBlock>{description}</SmallHelpBlock>
        <TokenTTL changedTime={changedTime} />
      </Col>
    </FormGroup>
  );
}

renderValueField.propTypes = {
  ...textFieldShape,
  fetchedToken: PropTypes.shape(fetchedTokenShape),
  tokenChangedTime: PropTypes.number,
  tokenChanged: PropTypes.func.isRequired,
};

renderValueField = connect(state => ({
  fetchedToken: getFetchedToken(state),
  tokenChangedTime: getTokenChangedTime(state),
}), { tokenChanged })(renderValueField);

class OAAPIURL extends React.Component {
  updateURL(newProps) {
    const { input } = this.props;
    let apiURL;
    let requestURL;

    try {
      requestURL = new URL((newProps || this.props).requestURL);
      apiURL = new URL(input.value);
    } catch(e) {
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

OAAPIURL = connect(state => ({
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
      {Object.entries(tokenTypes).map(([ type, { caption }]) => (
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

function renderTokenMetaFields({ tokenType }) {
  const tokenTypeData = tokenTypes[tokenTypeKeys.includes(tokenType) ? tokenType : tokenTypeKeys[0]];

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

renderTokenMetaFields = connect(state => ({
  tokenType: getAPSTokenType(state),
}))(renderTokenMetaFields);

function TokenRefreshButton({ loading, autoRefresh, tokenExpired, refreshToken }) {
  return (
    <Button
      onClick={refreshToken}
      bsStyle={(tokenExpired && autoRefresh) ? 'success' : 'primary'}
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

TokenRefreshButton = connect(state => ({
  loading: isLoading(state),
  autoRefresh: getAutoRefresh(state),
  tokenExpired: getTokenExpired(state),
}), { refreshToken })(TokenRefreshButton);

function APSTokenFields({ error, autoRefresh, setAutoRefresh }) {
  return (
    <div>
      <Field
        name="token.value"
        component={renderValueField}
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

export default connect(state => ({
  error: getError(state),
  autoRefresh: getAutoRefresh(state),
}), { setAutoRefresh })(APSTokenFields);

import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import responsePropTypes, { redirectShape } from 'propTypes/redirect';

import { StyledResponse, StyledHeader, Status } from './StyledComponents';
import Headers from './Headers';

function Titlebar({ url, time, onClick }) {
  return ( // if we don't pass onClick, collapse won't work
    <StyledHeader expandable onClick={onClick}>
      <h3>
        Redirect ({(time / 1000).toFixed(3)}s) -{' '}
        <a
          className="text-muted"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </a>
      </h3>
    </StyledHeader>
  );
}

Titlebar.propTypes = {
  url: redirectShape.url,
  time: redirectShape.time,
  onClick: PropTypes.func.isRequired,
};

function Redirect(props) {
  const {
    response,
    headers,
    eventKey,
  } = props;

  if (!response || !headers) return null;

  const { method, url, time } = response;

  return (
    <StyledResponse
      eventKey={eventKey}
    >
      <Panel.Heading>
        <Panel.Toggle // can't use title, collapse won't work
          componentClass={Titlebar}
          method={method}
          url={url}
          time={time}
        />
      </Panel.Heading>
      <Panel.Body collapsible>
        <h3>
          <Status
            green={response.statusCode >= 200 && response.statusCode < 300}
            red={response.statusCode >= 400 && response.statusCode < 600}
          >
            {response.statusCode}
          </Status>
          <small> {response.statusLine && response.statusLine.replace(/.*\d{3} /, '')}</small>
        </h3>

        <Headers expanded headers={headers} />
      </Panel.Body>
    </StyledResponse>
  );
}

Redirect.propTypes = {
  response: responsePropTypes,
  headers: redirectShape.responseHeaders,
  eventKey: PropTypes.number.isRequired,
};

export default Redirect;


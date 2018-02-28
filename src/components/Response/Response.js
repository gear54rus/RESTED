import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert, Panel } from 'react-bootstrap';
import Highlight from 'react-highlight';
import formatXml from 'xml-formatter';

import * as Actions from 'store/request/actions';
import { isDisabledHighlighting, isWrapResponse } from 'store/options/selectors';
import responsePropTypes, { responseShape } from 'propTypes/response';
import getContentType from 'utils/contentType';
import approximateSizeFromLength from 'utils/approximateSizeFromLength';

import { StyledResponse, StyledHeader, Status } from './StyledComponents';
import Headers from './Headers';
import RenderedResponse from './RenderedResponse';

function Titlebar({ url, time }) {
  return (
    <StyledHeader>
      <h3>
        Response ({time}) -{' '}
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
  url: responseShape.url, // eslint-disable-line react/no-typos
  time: PropTypes.node.isRequired,
};

export function Response(props) {
  const {
    response,
    highlightingDisabled,
    wrapResponse,
    redirectChain,
    interceptedResponse,
  } = props;

  if (!response || !interceptedResponse) return null;

  const { method, url, totalTime } = response;
  let { body } = response;

  let time;
  if (redirectChain.length > 0) {
    time = `${(interceptedResponse.time / 1000).toFixed(3)}s, total time ${totalTime / 1000}s`;
  } else {
    time = `${totalTime / 1000}s`;
  }

  const contentLength = interceptedResponse.responseHeaders.find(header => (
    header.name.toLowerCase() === 'content-length'
  ));
  const contentType = interceptedResponse.responseHeaders.find(header => (
    header.name.toLowerCase() === 'content-type'
  ));

  const contentSize = contentLength
    ? Number(contentLength.value)
    : approximateSizeFromLength(body);
  const type = getContentType(contentType && contentType.value);

  try {
    if (type.json) {
      body = JSON.stringify(JSON.parse(body), null, 2);
    } else if (type.xml) {
      body = formatXml(body);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Encountered an error while formatting response as ' +
      `${contentType && contentType.value}. Falling back to plain text`, e);
  }

  return (
    <StyledResponse
      wrapResponse={wrapResponse}
    >
      <Panel.Heading>
        <Panel.Title
          componentClass={Titlebar}
          method={method}
          url={url}
          time={time}
        />
      </Panel.Heading>
      <Panel.Body>
        <h3>
          <Status
            green={response.status >= 200 && response.status < 300}
            red={response.status >= 400 && response.status < 600}
          >
            {response.status}
          </Status>
          <small> {response.statusText}</small>
        </h3>

        <Headers headers={interceptedResponse.responseHeaders} />
        {type.html && <RenderedResponse html={body} />}

        {!highlightingDisabled && contentSize < 20000
          ? (
            <Highlight>
              {body}
            </Highlight>
          ) : (
            <span>
              {contentSize >= 20000 && (
                <Alert bsStyle="warning">
                  The size of the response is greater than 20KB, syntax
                  highlighting has been disabled for performance reasons.
                </Alert>
              )}

              <code>
                <pre>
                  {body}
                </pre>
              </code>
            </span>
          )
        }
      </Panel.Body>
    </StyledResponse>
  );
}

Response.propTypes = {
  response: responsePropTypes,
  highlightingDisabled: PropTypes.bool.isRequired,
  wrapResponse: PropTypes.bool.isRequired,
  redirectChain: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  interceptedResponse: PropTypes.shape({}),
};

const mapStateToProps = state => ({
  highlightingDisabled: isDisabledHighlighting(state),
  wrapResponse: isWrapResponse(state),
});

export default connect(mapStateToProps, Actions)(Response);


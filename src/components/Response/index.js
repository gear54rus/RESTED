import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PanelGroup, Panel, Alert } from 'react-bootstrap';

import { getResponse, getInterceptedResponse, getRedirectChain, getLoading } from 'store/request/selectors';
import responsePropTypes from 'propTypes/response';

import Loading from './Loading';
import Redirect from './Redirect';
import Response from './Response';

function ResponseAccordion({ response, error, loading, redirectChain, interceptedResponse }) {
  if (error) {
    return (
      <Alert bsStyle="danger">
        {`An error occurred while fetching the resource: ${error}`}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Panel>
        <Panel.Body>
          <Loading />
        </Panel.Body>
      </Panel>
    );
  }

  if (!response) return null;

  return (
    <PanelGroup accordion id="response-accordion">
      {redirectChain.map((redirectResponse, i) => (
        <Redirect
          response={redirectResponse}
          headers={redirectResponse.responseHeaders}
          key={i}
          eventKey={i}
        />
      ))}
      <Response
        response={response}
        redirectChain={redirectChain}
        interceptedResponse={interceptedResponse}
      />
    </PanelGroup>
  );
}

ResponseAccordion.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Error),
  ]),
  response: responsePropTypes,
  redirectChain: PropTypes.arrayOf(PropTypes.shape({})),
  interceptedResponse: PropTypes.shape({}),
};

const mapStateToProps = state => ({
  response: getResponse(state),
  interceptedResponse: getInterceptedResponse(state),
  redirectChain: getRedirectChain(state),
  error: state.request.error,
  loading: getLoading(state),
});

export default connect(mapStateToProps)(ResponseAccordion);

import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { connect } from 'react-redux';

import IconButton from 'components/IconButton';
import * as Actions from 'store/history/actions';

import { StyledPanel } from './StyledComponents';
import HistoryList from './HistoryList';

function Titlebar({ clearHistory }) {
  return (
    <span className="clearfix">
      <IconButton
        onClick={clearHistory}
        tooltip="Clear history"
        icon="trash"
        className="pull-right"
      />
    </span>
  );
}

Titlebar.propTypes = {
  clearHistory: PropTypes.func.isRequired,
};

function History({ clearHistory }) {
  return (
    <StyledPanel>
      <Panel.Heading>
        <Panel.Title
          componentClass={Titlebar}
          clearHistory={clearHistory}
        />
      </Panel.Heading>
      <Panel.Body>
        <HistoryList />
      </Panel.Body>
    </StyledPanel>
  );
}

History.propTypes = {
  clearHistory: PropTypes.func.isRequired,
};

export default connect(null, Actions)(History);


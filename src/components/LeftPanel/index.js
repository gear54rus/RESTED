import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Panel, NavItem } from 'react-bootstrap';

import Collections from 'components/Collections';
import History from 'components/History';
import { updateOption } from 'store/options/actions';
import { getActiveTab } from 'store/options/selectors';

import { StyledPanel, StyledTitlebar } from './StyledComponents';

function Titlebar(props) {
  return (
    <StyledTitlebar {...props} bsStyle="pills">
      <NavItem eventKey="collections">Collections</NavItem>
      <NavItem eventKey="history">History</NavItem>
    </StyledTitlebar>
  );
}

function LeftPanel({ activeTab, setActiveTab }) {
  return (
    <StyledPanel>
      <Panel.Heading>
        <Panel.Title
          componentClass={Titlebar}
          activeKey={activeTab}
          onSelect={setActiveTab}
        />
      </Panel.Heading>
      <Panel.Body>
        {activeTab === 'collections' && <Collections />}
        {activeTab === 'history' && <History />}
      </Panel.Body>
    </StyledPanel>
  );
}

LeftPanel.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  activeTab: getActiveTab(state),
});

export default connect(mapStateToProps, {
  setActiveTab: value => updateOption('activeTab', value),
})(LeftPanel);

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Panel } from 'react-bootstrap';

import IconButton from 'components/IconButton';
import * as Actions from 'store/collections/actions';

import CollectionList from './CollectionList';

function Titlebar({ addCollection }) {
  return (
    <span className="clearfix">
      <IconButton
        onClick={() => addCollection()}
        tooltip="Add new collection"
        icon="plus"
        className="pull-right"
      />
    </span>
  );
}

Titlebar.propTypes = {
  addCollection: PropTypes.func.isRequired,
};

function Collections({ addCollection }) {
  return (
    <Panel>
      <Panel.Heading>
        <Panel.Title
          componentClass={Titlebar}
          addCollection={addCollection}
        />
      </Panel.Heading>
      <Panel.Body>
        <CollectionList />
      </Panel.Body>
    </Panel>
  );
}

Collections.propTypes = {
  addCollection: PropTypes.func.isRequired,
};

export default connect(null, Actions)(Collections);


import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { immutableCollectionShape } from 'propTypes/collection';
import IconButton from 'components/IconButton';
import { showChooseCollectionModal, showOptionsModal } from 'utils/modal';
import { getCollections } from 'store/collections/selectors';
import { getCollectionsMinimized } from 'store/options/selectors';
import { getEditingRequest, isEditMode } from 'store/config/selectors';
import { getSelected } from 'store/request/selectors';
import * as collectionsActions from 'store/collections/actions';
import * as modalActions from 'store/modal/actions';
import * as optionsActions from 'store/options/actions';

import { StyledHeader } from './StyledComponents';

function handleSubmit(props, collectionIndex = 0) {
  props.addRequest(props.request, collectionIndex);
  props.removeModal();
}

function toggleCollectionsExpanded({ collectionsMinimized, updateOption }) {
  updateOption('collectionsMinimized', !collectionsMinimized);
}

function Titlebar(props) {
  const {
    collections,
    removeModal,
    collectionsMinimized,
    isEditing,
    editingRequest,
    selected,
  } = props;

  return (
    <StyledHeader>
      <h2 className="pull-left">
        {isEditing
          ? `Editing request ${editingRequest.name
              ? `- ${editingRequest.name}` : ''}`
          : 'Request'
        }
        {' '}
        <Badge>{selected}</Badge>
      </h2>
      <IconButton
        onClick={() => {
          switch (collections.size) {
            case 0:
              props.addCollection();
            case 1: // eslint-disable-line no-fallthrough
              handleSubmit(props);
              break;
            default:
              showChooseCollectionModal(props).then(
                index => handleSubmit(props, index),
                removeModal,
              );
          }
          // TODO if (requestExists)
          // Modal (do you want to replace?)
        }}
        tooltip="Add to collection"
        icon="plus"
        className="pull-right hidden-xs"
      />
      <IconButton
        onClick={() => showOptionsModal(props)}
        tooltip="Options"
        icon="cogs"
        className="pull-right"
      />
      <IconButton
        onClick={() => toggleCollectionsExpanded(props)}
        tooltip={`${collectionsMinimized ? 'Show' : 'Hide'} collections`}
        icon={collectionsMinimized ? 'compress' : 'expand'}
        className="pull-right hidden-xs"
      />
    </StyledHeader>
  );
}

Titlebar.propTypes = {
  collections: ImmutablePropTypes.listOf(immutableCollectionShape),
  removeModal: PropTypes.func.isRequired,
  collectionsMinimized: PropTypes.bool,
  isEditing: PropTypes.bool.isRequired,
  editingRequest: PropTypes.shape({
    name: PropTypes.string,
  }),
  selected: PropTypes.string,
  addCollection: PropTypes.func.isRequired,
  /* eslint-disable react/no-unused-prop-types */
  request: PropTypes.shape({
    url: PropTypes.string,
  }).isRequired,
  addRequest: PropTypes.func.isRequired,
  setModalData: PropTypes.func.isRequired,
  /* eslint-enable react/no-unused-prop-types */
};

const mapStateToProps = state => ({
  request: getFormValues('request')(state),
  collections: getCollections(state),
  collectionsMinimized: getCollectionsMinimized(state),
  isEditing: isEditMode(state),
  editingRequest: getEditingRequest(state),
  selected: getSelected(state),
});

export default connect(mapStateToProps, {
  ...collectionsActions,
  ...modalActions,
  ...optionsActions,
})(Titlebar);


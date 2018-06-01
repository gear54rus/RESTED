import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Badge, Tooltip, OverlayTrigger, ListGroup } from 'react-bootstrap';

import { immutableRequestShape } from 'propTypes/request';
import IconButton from 'components/IconButton';
import { getHistory } from 'store/history/selectors';
import { getSelected } from 'store/request/selectors';
import * as Actions from 'store/history/actions';
import { selectRequest as selectRequestAction } from 'store/request/actions';

import { List, ListGroupItem } from './StyledComponents';

function ListGroupHeader({ index, request, removeFromHistory }) {
  return (
    <h4 className="list-group-item-heading">
      {request.get('method')}
      <div
        className="pull-right"
      >
        <OverlayTrigger
          placement="bottom"
          overlay={(
            <Tooltip id="history-request-id-why">
              Selecting this history item will set URL hash to this ID.
              That means you can create bookmarks and use browser history
              to access any request in history quickly.
            </Tooltip>
          )}
        >
          <Badge>
            {request.get('id')}
          </Badge>
        </OverlayTrigger>
        <IconButton
          tooltip="Remove from history"
          icon="trash"
          onClick={e => {
            e.stopPropagation();
            removeFromHistory(index);
          }}
        />
      </div>
    </h4>
  );
}

ListGroupHeader.propTypes = {
  index: PropTypes.number.isRequired,
  request: immutableRequestShape.isRequired,
  removeFromHistory: PropTypes.func.isRequired,
};

class HistoryList extends React.Component {
  componentDidMount() {
    this.props.fetchHistory();
  }

  render() {
    const {
      history,
      removeFromHistory,
      selectRequest,
      selected,
    } = this.props;

    return (
      <List>
        {history.map((request, index) => (
          <li key={index}>
            <ListGroup componentClass="ul">
              <ListGroupItem
                className={
                  `list-group-item ${(request.get('id') === selected) ? 'active' : ''}`
                }
                onClick={() => selectRequest(request.get('id'))}
              >
                <ListGroupHeader
                  request={request}
                  index={index}
                  removeFromHistory={removeFromHistory}
                />
                {request.get('url')}
              </ListGroupItem>
            </ListGroup>
          </li>
        ))}
        {!history.size && (
          <h5>
            You have no recorded history. Send some requests and start making your legacy!
          </h5>
        )}
      </List>
    );
  }
}

HistoryList.propTypes = {
  history: ImmutablePropTypes.listOf(immutableRequestShape).isRequired,
  selectRequest: PropTypes.func.isRequired,
  selected: PropTypes.string,
  fetchHistory: PropTypes.func.isRequired,
  removeFromHistory: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  history: getHistory(state),
  selected: getSelected(state),
});

export default connect(mapStateToProps, {
  ...Actions,
  selectRequest: selectRequestAction,
})(HistoryList);


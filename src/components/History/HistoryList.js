import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Label, ListGroup } from 'react-bootstrap';

import { immutableRequestShape } from 'propTypes/request';
import IconButton from 'components/IconButton';
import { getHistory } from 'store/history/selectors';
import * as Actions from 'store/history/actions';
import { selectRequest as selectRequestAction } from 'store/request/actions';

import { List, ListGroupItem } from './StyledComponents';

function ListGroupHeader({ index, request, removeFromHistory }) {
  return (
    <h4 className="list-group-item-heading">
      {request.get('method')}
      <div
        className="pull-right"
        id="removeRequest"
      >
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
    const { history, removeFromHistory, selectRequest } = this.props;
    return (
      <List>
        {history.map((request, index) => (
          <li key={index}>
            <ListGroup componentClass="ul">
              <ListGroupItem
                className="list-group-item"
                onClick={() => selectRequest(request.toJS())}
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
  fetchHistory: PropTypes.func.isRequired,
  removeFromHistory: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  history: getHistory(state),
});

export default connect(mapStateToProps, {
  ...Actions,
  selectRequest: selectRequestAction,
})(HistoryList);


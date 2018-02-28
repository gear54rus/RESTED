import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Table, Clearfix, Row, Col, Button, ButtonGroup, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import classNames from 'classnames';

import { fromPostman, fromHAR } from 'utils/import';
import { getCollections } from 'store/collections/selectors';
import * as ModalActions from 'store/modal/actions';
import * as CollectionsActions from 'store/collections/actions';
import { immutableCollectionShape } from 'propTypes/collection';

// Place selection state here because ImportPane unmounts,
// so we can't use component state
let selectedCollection = 0;

function SelectCollectionForm({ collections, onChange }) {
  return (
    <Row>
      <Col xs={12}>
        Would you like to add the following to an existing collection
        or add as a new collection?
        <Table striped>
          <tbody>
            <tr>
              <td>
                <FormGroup>
                  <ControlLabel>
                    Collection
                  </ControlLabel>
                  <FormControl
                    componentClass="select"
                    onChange={onChange}
                  >
                    {collections.map((collection, index) => (
                      <option key={collection.get('id')} value={index}>
                        {collection.get('name')}
                      </option>
                    ))}
                  </FormControl>
                </FormGroup>
              </td>
            </tr>
          </tbody>
        </Table>
      </Col>
    </Row>
  );
}

SelectCollectionForm.propTypes = {
  collections: ImmutablePropTypes.listOf(immutableCollectionShape),
  onChange: PropTypes.func.isRequired,
};

class ImportPane extends React.Component {
  static propTypes = {
    collections: ImmutablePropTypes.listOf(immutableCollectionShape),
    addRequest: PropTypes.func.isRequired,
    addCollection: PropTypes.func.isRequired,
    setModalData: PropTypes.func.isRequired,
    removeModal: PropTypes.func.isRequired,
  };

  state = {
    importMethod: 'HAR',
  };

  setMethod(importMethod) {
    this.setState({ importMethod });
  }

  setText(text) {
    this.setState({ text });
  }

  setSelectedCollection = event => {
    selectedCollection = event.target.value;
  }

  submit = () => {
    const { importMethod, text } = this.state;
    const {
      collections,
      addRequest,
      addCollection,
      setModalData,
      removeModal,
    } = this.props;
    this.setState({ importFeedback: null });

    try {
      let requests;
      if (importMethod === 'HAR') {
        requests = fromHAR(JSON.parse(text));
      } else {
        requests = fromPostman(JSON.parse(text));
      }

      setModalData({
        title: 'Successfully parsed imports',
        body: (
          <SelectCollectionForm
            onChange={this.setSelectedCollection}
            collections={collections}
          />
        ),
        actions: [{
          text: 'Add to collection',
          click: () => {
            requests.forEach(request => (
              addRequest(Immutable.fromJS(request), selectedCollection)
            ));
            removeModal(); // Self destruct
          },
        }, {
          text: 'New collection',
          click: () => {
            addCollection(Immutable.fromJS(requests));
            removeModal(); // Self destruct
          },
        }],
      });
    } catch (e) {
      this.setState({
        importFeedback: 'Error while parsing. Is your text formatted correctly?',
      });
    }
  }

  render() {
    const { importMethod, importFeedback } = this.state;
    return (
      <Clearfix>
        <br />
        <Col xs={12}>
          <p>
            Here you can import data from other sources.
            Two formats are currently supported, HTTP Archive
            (HAR) and Postman json.
          </p>
          <p>
            HAR is a format that can be exported directly
            from your favourite browser&apos;s network tools.
            This means you can do a request you would like
            to recreate or alter at a later date, and import
            it to your collected requests. See
            {' '}
            <a
              href="https://developer.mozilla.org/en-US/docs/Tools/Network_Monitor#CopySave_All_As_HAR"
              target="_blank"
              rel="noopener noreferrer"
            >
              this link
            </a>
            {' '}
            for details.
          </p>
          <p>
            An option to import data from Postman (Chrome extension)
            is also provided. In order to fetch a collection from
            postman, click the three dots next to a postman collection,
            click <code>download</code>, and copy the file&apos;s contents into
            the field below.
          </p>
          <section>
            <Col xs={12} className="text-center">
              <ButtonGroup>
                <Button
                  className={classNames({ active: importMethod === 'HAR' })}
                  onClick={() => this.setMethod('HAR')}
                >
                  HAR
                </Button>
                <Button
                  className={classNames({ active: importMethod === 'Postman' })}
                  onClick={() => this.setMethod('Postman')}
                >
                  Postman
                </Button>
              </ButtonGroup>
              <h4 className="text-danger">
                {importFeedback}
              </h4>
            </Col>
            <Row>
              <Col xs={12}>
                <FormGroup>
                  <FormControl
                    componentClass="textarea"
                    rows="20"
                    onChange={e => this.setText(e.target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Button
                  bsStyle="primary"
                  className="pull-right"
                  onClick={this.submit}
                >
                  Import
                </Button>
              </Col>
            </Row>
          </section>
        </Col>
      </Clearfix>
    );
  }
}

const mapStateToProps = state => ({
  collections: getCollections(state),
});

export default connect(mapStateToProps, {
  ...ModalActions,
  ...CollectionsActions,
})(ImportPane);


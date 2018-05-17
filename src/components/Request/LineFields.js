import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Col, FormGroup, Button, FormControl, InputGroup } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';

import { REQUEST_METHODS } from 'constants/constants';
import { fieldNoDragShape } from 'propTypes/field';
import { isEditMode } from 'store/config/selectors';

function LineFields({ method, url, placeholderUrl, editMode }) {
  return (
    <FormGroup>
      <Col sm={2}>
        <Typeahead
          options={REQUEST_METHODS}
          filterBy={() => true}
          {...method.input}
          onChange={selected => method.input.onChange(selected[0])}
          onInputChange={value => method.input.onChange(value)}
          selected={[method.input.value]}
        />
      </Col>
      <Col sm={10}>
        <InputGroup>
          <FormControl
            type="text"
            placeholder={placeholderUrl}
            autoFocus
            {...url.input}
          />
          <InputGroup.Button>
            {editMode ?
              (
                <Button type="submit" bsStyle="success">
                  Update request
                </Button>
              ) : (
                <Button type="submit" bsStyle="primary">
                  Send request
                </Button>
              )
            }
          </InputGroup.Button>
        </InputGroup>
      </Col>
    </FormGroup>
  );
}

LineFields.propTypes = {
  method: PropTypes.shape(fieldNoDragShape).isRequired,
  url: PropTypes.shape(fieldNoDragShape).isRequired,
  placeholderUrl: PropTypes.string.isRequired,
  editMode: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  placeholderUrl: state.request.placeholderUrl,
  editMode: isEditMode(state),
});

export { LineFields };
export default connect(mapStateToProps)(LineFields);

import PropTypes from 'prop-types';
import { fieldPropTypes, fieldInputPropTypes, fieldMetaPropTypes } from 'redux-form';

const { shape } = PropTypes;

export const textFieldShape = fieldPropTypes;
export const selectFieldShape = {
  input: shape({
    checked: fieldInputPropTypes.checked,
    name: fieldInputPropTypes.name,
    onBlur: fieldInputPropTypes.onBlur,
    onChange: fieldInputPropTypes.onChange,
    onFocus: fieldInputPropTypes.onFocus,
    value: fieldInputPropTypes.value,
  }).isRequired,
  meta: shape(fieldMetaPropTypes).isRequired,
};

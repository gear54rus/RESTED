import ImmutablePropTypes from 'react-immutable-proptypes';
import PropTypes from 'prop-types';

const { string, shape, arrayOf, bool } = PropTypes;

export const requestShape = {
  id: string.isRequired,
  url: string.isRequired,
  method: string.isRequired,
  data: string,
  useFormData: bool,
  formData: arrayOf(
    shape({
      name: string.isRequired,
      value: string.isRequired,
    }),
  ),
  headers: arrayOf(
    shape({
      name: string.isRequired,
      value: string.isRequired,
    }).isRequired,
  ).isRequired,
};

export const immutableRequestShape = ImmutablePropTypes.contains({
  ...requestShape,
  formData: ImmutablePropTypes.listOf(
    ImmutablePropTypes.contains({
      name: string.isRequired,
      value: string.isRequired,
    }),
  ),
  headers: ImmutablePropTypes.listOf(
    ImmutablePropTypes.contains({
      name: string.isRequired,
      value: string.isRequired,
    }).isRequired,
  ).isRequired,
});

export default shape(requestShape);


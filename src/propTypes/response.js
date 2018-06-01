import PropTypes from 'prop-types';

const { string, shape, arrayOf, number } = PropTypes;

export const responseShape = {
  url: string.isRequired,
  body: string.isRequired,
  status: number.isRequired,
  statusText: string.isRequired,
  totalTime: number.isRequired,
  method: string.isRequired,
  headers: arrayOf(
    shape({
      name: string.isRequired,
      value: string.isRequired,
    }).isRequired,
  ).isRequired,
};

export default shape(responseShape);


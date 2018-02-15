import PropTypes from 'prop-types';

const { string, node, bool, shape, arrayOf, func } = PropTypes;

export const modalShape = {
  title: string.isRequired,
  body: node.isRequired,
  errorData: string,
  visible: bool.isRequired,
  cancelClick: func,
  actions: arrayOf(shape({
    text: string.isRequired,
    click: func.isRequired,
  })),
};

export default shape(modalShape);


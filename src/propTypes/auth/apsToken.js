import PropTypes from 'prop-types';

import { tokenTypes } from 'utils/aps';

const apsTokenTypeKeys = Object.keys(tokenTypes);

export const fetchedTokenShape = { // eslint-disable-line import/prefer-default-export
  time: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
  type: PropTypes.oneOf(apsTokenTypeKeys).isRequired,
  params: PropTypes.arrayOf(PropTypes.string).isRequired,
  url: PropTypes.string.isRequired,
};

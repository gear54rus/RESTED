import { PropTypes } from 'react';

import { tokenTypes as apsTokenTypes } from 'utils/aps';

const apsTokenTypeKeys = Object.keys(apsTokenTypes);

// eslint-disable-next-line import/prefer-default-export
export const apsFetchedTokenShape = {
  time: PropTypes.number.isRequired,
  value: PropTypes.string.isRequired,
  type: PropTypes.oneOf(apsTokenTypeKeys).isRequired,
  params: PropTypes.arrayOf(PropTypes.string).isRequired,
  url: PropTypes.string.isRequired,
};

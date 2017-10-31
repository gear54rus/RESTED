import styled from 'styled-components';
import { Clearfix } from 'react-bootstrap';

import Fonticon from 'components/Fonticon';

/* eslint-disable import/prefer-default-export */
export const StyledHeader = styled(Clearfix)`
  h2 {
    font-size: 15px;
    margin: 4px 0;

    overflow: hidden;
    max-width: 75%;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const LoadingSpinner = styled(Fonticon)`
  opacity: 0.9;
`;

import styled from 'styled-components';
import { Button } from 'react-bootstrap';

import Fonticon from 'components/Fonticon';

export const CollapsibleHeader = styled.h4`
  margin: 0;
`;

export const AnimatedIcon = styled(Fonticon)`
  margin-left: 5px;
  transition: .25s ease-in-out;
`;

export const CollapsibleButton = styled(Button)`
  padding-left: 0;
  padding-right: 0;

  &:hover,
  &:active {
    text-decoration: none;
  }
`;

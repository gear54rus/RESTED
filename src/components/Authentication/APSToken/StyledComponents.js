import styled from 'styled-components';
import { ProgressBar, HelpBlock, ButtonGroup, DropdownButton } from 'react-bootstrap';

import Fonticon from 'components/Fonticon';

export const LoadingSpinner = styled(Fonticon)`
  opacity: 0.9;
`;

export const SmallProgressWithOffsetText = styled(ProgressBar)`
  margin-bottom: 0;

  div.progress-bar {
    position: relative;
  }

  div.offset-label {
    position: absolute;
    font-weight: bold;
  }
`;

export const SmallHelpBlock = styled(HelpBlock)`
  margin-bottom: 5px;
`;

// Non-breaking
export const ButtonGroupNB = styled(ButtonGroup)`
   display: flex;
`;

export const DropdownButtonLeft = styled(DropdownButton)`
   & + ul {
     right: 0;
     left: auto;
   }
`;

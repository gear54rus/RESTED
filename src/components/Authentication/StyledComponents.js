import styled from 'styled-components';
import { ProgressBar, HelpBlock } from 'react-bootstrap';

import Fonticon from 'components/Fonticon';

export const LoadingSpinner = styled(Fonticon)`
  opacity: 0.9;
`;

export const SmallProgressWithOffsetText = styled(ProgressBar)`
  margin-bottom: 0;
  color: #fff;
  
  &.label-right {
    color: #555;
  }

  div.progress-bar {
    color: inherit;
    position: relative;
  }

  div.offset-label {
    position: absolute;
    font-size: 14px;
    font-weight: bold;
  }
`;

export const SmallHelpBlock = styled(HelpBlock)`
  margin-bottom: 5px;
`;

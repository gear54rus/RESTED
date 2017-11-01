import React from 'react';

import { StyledHeader } from './StyledComponents';

function Titlebar() {
  return (
    <StyledHeader>
      <h2 className="pull-left">
        APS request
      </h2>
    </StyledHeader>
  );
}

export default Titlebar;

import React from 'react';

import { StyledFooter } from './StyledComponents';

export default function Footer() {
  return (
    <StyledFooter>
      <small>
        <a
          href="https://github.com/odin-public/RESTED-APS"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </small>
      ·
      <small>
        <a
          href="https://github.com/odin-public/RESTED-APS/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          Report a bug
        </a>
      </small>
      ·
      <small>
        <a
          href="https://gitter.im/RESTEDclient"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chat (RESTED)
        </a>
      </small>
      ·
      <small>
        <a
          href="https://gist.github.com/esphen/f50cc049c8ed1256a11763826dac97db"
          target="_blank"
          rel="noopener noreferrer"
        >
          Licenses (RESTED)
        </a>
      </small>
    </StyledFooter>
  );
}

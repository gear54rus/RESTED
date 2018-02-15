import React from 'react';
import { Col } from 'react-bootstrap';

import { LoadingSpinner } from './StyledComponents';

export default function Loading() {
  return (
    <Col xs={12} className="text-center">
      <LoadingSpinner
        icon="circle-notch"
        className="fa-spin fa-9x"
      />
    </Col>
  );
}

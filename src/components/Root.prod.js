import React from 'react';
import { Grid } from 'react-bootstrap';

import App from './App';

export default function Root({ store }) {
  return (
    <Grid fluid>
      <App />
    </Grid>
  );
}

import React from 'react';
import { mount } from 'enzyme';

import { LineFields } from 'components/Request/LineFields';

describe('LineFields', () => {
  let initialProps;

  beforeEach(() => {
    initialProps = {
      method: {
        input: {
          value: 'GET',
          onChange() {},
        },
      },
      url: {
        input: {},
      },
      placeholderUrl: 'https://example.com',
      editMode: false,
    };
  });

  it('should render a placeholder into the field', () => {
    const tree = mount(
      <LineFields {...initialProps} />,
    );

    expect(tree.find('span.input-group input[type="text"]').prop('placeholder')).toBe('https://example.com');
  });
});

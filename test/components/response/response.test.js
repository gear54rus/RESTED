import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

/* eslint-disable import/no-unresolved */
import { Response } from 'components/Response/Response';
import makeStore from '../../makeStore';

jest.mock('react-highlight');

describe('response component', () => {
  const response = {
    url: 'http://example.com',
    method: 'GET',
    status: 200,
    statusText: 'OK',
    body: 'Some long body',
    totalTime: 123,
    headers: [{
      name: 'Content-Type',
      value: 'application/awesome',
    }],
  };

  const interceptedResponse = {
    ...response,
    responseHeaders: response.headers,
  };

  const store = makeStore({
    request: { response },
  });

  it('renders nothing given no props', () => {
    const tree = renderer.create(
      <Response loading={false} />,
    );

    expect(tree).toMatchSnapshot();
  });

  const props = {
    response,
    interceptedResponse,
    redirectChain: [],
  };

  // TODO move to test super component
  xit('renders a loading gif when requets is in flight', () => {
    const tree = mount(
      <Provider store={store}>
        <Response {...props} loading />
      </Provider>,
    );

    expect(!tree.find('Loading').isEmpty()).toBe(true);
  });

  it('renders a result when given one', () => {
    const tree = renderer.create(
      <Provider store={store}>
        <Response {...props} loading={false} />
      </Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  it('displays the status and statusText', () => {
    const tree = mount(
      <Provider store={store}>
        <Response {...props} loading={false} />
      </Provider>,
    );

    const h3 = tree.find('.panel-body h3');
    expect(h3.text()).toEqual('200 OK');

    const small = h3.find('small');
    expect(small.prop('children')).toContain('OK');
  });

  it('displays the URL and method in the titlebar', () => {
    const tree = mount(
      <Provider store={store}>
        <Response {...props} loading={false} />
      </Provider>,
    );

    const expectedLink = (
      <a
        href="http://example.com"
        className="text-muted"
        target="_blank"
        rel="noopener noreferrer"
      >
        http://example.com
      </a>
    );

    const heading = tree.find('.panel-heading');
    expect(heading.contains(expectedLink)).toEqual(true);
  });
});


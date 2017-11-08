import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

/* eslint-disable import/no-unresolved */
import { Collapsible } from 'components/Collapsible';

it('should render correctly', () => {
  const tree = renderer.create(
    <Collapsible
      id="test"
      title="Test"
      toggleCollapse={() => {}}
    >
      <h3>test</h3>
    </Collapsible>,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('should call the toggleCollapse function when activated', () => {
  const toggleCollapse = jest.fn();

  let wrapper = mount(
    <Collapsible
      open={false}
      id="test"
      title="Test"
      toggleCollapse={toggleCollapse}
    >
      <h3>test</h3>
    </Collapsible>,
  );

  expect(toggleCollapse).not.toHaveBeenCalled();

  wrapper.find('button').simulate('click');
  expect(toggleCollapse).toHaveBeenCalled();
  expect(toggleCollapse).toHaveBeenCalledWith('test', false);

  toggleCollapse.mockClear();
  wrapper = mount(
    <Collapsible
      open
      id="test2"
      title="Test"
      toggleCollapse={toggleCollapse}
    >
      <h3>test</h3>
    </Collapsible>,
  );

  expect(toggleCollapse).not.toHaveBeenCalled();

  wrapper.find('button').simulate('click');
  expect(toggleCollapse).toHaveBeenCalled();
  expect(toggleCollapse).toHaveBeenCalledWith('test2', true);
});


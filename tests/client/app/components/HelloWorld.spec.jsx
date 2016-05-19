
import React from 'react';
import {mount} from 'enzyme';
import HelloWorld from 'CLIENT_PATH/app/components/HelloWorld.jsx';

describe('<HelloWorld />', () => {
  it('component contains "Hello, world!" string', () => {
    const wrapper = mount(<HelloWorld />);
    expect(wrapper.html()).to.contain('Hello, world!');
  });
});

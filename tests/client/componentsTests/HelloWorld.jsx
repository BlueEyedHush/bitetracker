
import React from 'react';
import {shallow} from 'enzyme';
import HelloWorld from 'CLIENT_PATH/app/components/HelloWorld.jsx';

describe('<HelloWorld />', () => {
  it('component contains "Hello, world!" string', () => {
    const wrapper = shallow(<HelloWorld />);
    expect(wrapper.text()).to.contain('Hello, world!');
  });
});

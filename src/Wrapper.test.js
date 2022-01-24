const React = require('react');
const { useState } = require('react');
const ShallowRenderer = require('react-test-renderer/shallow');

const Wrapper = require('./Wrapper');

const render = require('./render');

const mockChild1 = React.createElement(
	'span',
	{
		className: 'Child Child1',
		'data-test-id': 'text-child-1',
	},
	'child 1'
);

const mockChild2 = React.createElement(
	'span',
	{
		className: 'Child Child2',
		'data-test-id': 'text-child-2',
	},
	'child 2'
);

const TestComponent = () =>
	React.createElement(
		'span',
		{
			className: 'Parent',
		},
		undefined,
		null,
		mockChild1,
		mockChild2
	);

const Container =
	({ children, text }) =>
	() =>
		React.crateElement('div', null, children({ text }));
const MemoedComponent = () => React.createElement('div', { className: 'ThisShouldNotGetRendered' }, 'too deep');

const mockContainer = React.createElement(Container, null, ({ text }) => React.createElement('div', null, text));
const mockMemoedComponent = React.createElement(React.memo(MemoedComponent));

const TestComponentWithFuncChildren = () =>
	React.createElement(React.Fragment, null, mockContainer, mockMemoedComponent);

const Count = ({ count, inc }) => React.createElement('div', null, count);

const Counter = () => {
	const [count, setCount] = useState(0);

	return React.createElement(
		Count,
		{
			count,
			inc: (step = 1) => {
				setCount(count + step);
			},
		},
		count
	);
};

describe('Wrapper', () => {
	it('can be constructed with an instance of shallow renderer and its output', () => {
		const renderer = new ShallowRenderer();
		renderer.render(React.createElement(TestComponent));
		const output = renderer.getRenderOutput();
		const wrapper = new Wrapper(renderer, output);

		expect(wrapper.renderer).to.equal(renderer);
		expect(wrapper.root).to.equal(output);
		expect(wrapper.proband).to.be.undefined;
	});

	it('can be constructed with an instance of shallow renderer only', () => {
		const renderer = new ShallowRenderer();
		renderer.render(React.createElement(TestComponent));
		const output = renderer.getRenderOutput();
		const wrapper = new Wrapper(renderer);

		expect(wrapper.renderer).to.equal(renderer);
		expect(wrapper.root).to.equal(output);
		expect(wrapper.proband).to.be.undefined;
	});

	it('can be constructed with shallow rendering output and a proband (think of the children)', () => {
		const renderer = new ShallowRenderer();
		renderer.render(React.createElement(TestComponent));
		const output = renderer.getRenderOutput();
		const proband = new Wrapper(null, output);
		const wrapper = new Wrapper(null, output, proband);

		expect(wrapper.renderer).to.be.null;
		expect(wrapper.root).to.equal(output);
		expect(wrapper.proband).to.equal(proband);
	});

	it('throws if renderer passed to constructor is invalid', () => {
		expect(() => new Wrapper('MyComponent')).to.throw();
	});

	it('throws if output passed to constructor is invalid', () => {
		expect(() => new Wrapper(null, 'MyComponent')).to.throw();
	});

	it('throws if constructor arguments are falsy', () => {
		expect(() => new Wrapper()).to.throw();
	});

	it('can find children by HTML tag name', () => {
		const wrapper = render(React.createElement(TestComponent));
		const spans = wrapper.findByName('span');

		expect(spans).to.have.lengthOf(3);
		expect(spans.at(0).proband).to.be.undefined;
		expect(spans.at(1).proband).to.equal(wrapper);
		expect(spans.at(2).proband).to.equal(wrapper);
	});

	it('throws if trying to find by tag name that is not a string', () => {
		const wrapper = render(React.createElement(TestComponent));

		expect(() => wrapper.findByName()).to.throw();
	});

	it('returns an empty array if no elements are found by tag name', () => {
		const wrapper = render(React.createElement(TestComponent));

		expect(wrapper.findByName('div')).to.have.lengthOf(0);
	});

	it('can find children by class', () => {
		const wrapper = render(React.createElement(TestComponent));
		const children = wrapper.findByClass('Child');

		expect(children).to.have.lengthOf(2);
		expect(children.at(0).proband).to.equal(wrapper);
	});

	it('throws if trying to find by class that is not a string', () => {
		const wrapper = render(React.createElement(TestComponent));

		expect(() => wrapper.findByClass()).to.throw();
	});

	it('returns an empty array if no elements are found by class', () => {
		const wrapper = render(React.createElement(TestComponent));

		expect(wrapper.findByName('Grandparent')).to.have.lengthOf(0);
	});

	it('can find children by a prop', () => {
		const wrapper = render(React.createElement(TestComponent));
		const child = wrapper.findByProp('data-test-id', 'text-child-1');

		expect(child).to.have.lengthOf(1);
		expect(child.at(0).proband).to.equal(wrapper);
	});

	it('throws if trying to find by a prop and prop name is not a string', () => {
		const wrapper = render(React.createElement(TestComponent));

		expect(() => wrapper.findByProp(2, 3)).to.throw();
	});

	it('throws if trying to find by a prop and prop value is missing', () => {
		const wrapper = render(React.createElement(TestComponent));

		expect(() => wrapper.findByProp('data-test-id')).to.throw();
	});

	it('returns an empty array if no elements are found by prop value', () => {
		const wrapper = render(React.createElement(TestComponent));

		expect(wrapper.findByProp('data-test-id', 'text-child-3')).to.have.lengthOf(0);
	});

	it('can return props of the wrapper element', () => {
		const wrapper = render(React.createElement(TestComponent));

		expect(wrapper.props).to.equal(wrapper.root.props);
	});

	it('can return plain text node of the wrapper element', () => {
		const wrapper = render(React.createElement(TestComponent));

		expect(wrapper.findByProp('data-test-id', 'text-child-1').at(0).text).to.equal('child 1');
	});

	it('returns null if the element does not have plain text children', () => {
		const wrapper = render(React.createElement(TestComponent));

		expect(wrapper.text).to.equal(null);
	});

	it('can return array of element classes', () => {
		const wrapper = render(React.createElement(TestComponent));

		expect(wrapper.findByProp('data-test-id', 'text-child-1').at(0).classes).to.eql(['Child', 'Child1']);
	});

	it('can find children by React component display name', () => {
		const wrapper = render(React.createElement(TestComponentWithFuncChildren));

		expect(wrapper.findByName('Container')).to.have.lengthOf(1);
	});

	it('can find React.Fragment by name', () => {
		const wrapper = render(React.createElement(TestComponentWithFuncChildren));

		expect(wrapper.findByName('React.Fragment')).to.have.lengthOf(1);
	});

	it('can render a render prop', () => {
		const wrapper = render(React.createElement(TestComponentWithFuncChildren));

		const children = wrapper.findByName('Container').at(0).renderRenderProp('children', { text: 'test' });

		const theDiv = children.findByName('div');
		expect(theDiv).to.have.lengthOf(1);
		expect(theDiv.at(0).props.children).to.equal('test');
	});

	it('throws if the render prop is not found', () => {
		const wrapper = render(React.createElement(TestComponentWithFuncChildren));

		expect(() =>
			wrapper.findByName('Container').at(0).renderRenderProp('propThatDoesNotExist', { text: 'test' })
		).to.throw();
	});

	it('throws if the render prop is not a function', () => {
		const wrapper = render(React.createElement(TestComponentWithFuncChildren));

		expect(() => wrapper.findByClass('SoloChild').at(0).renderProp('className')).to.throw();
	});

	it('throws if render prop name is not a string', () => {
		const wrapper = render(React.createElement(TestComponentWithFuncChildren));

		expect(() => wrapper.findByName('Container').at(0).renderRenderProp({}, { text: 'test' })).to.throw();
	});

	it('throws if render prop props are not an object', () => {
		const wrapper = render(React.createElement(TestComponentWithFuncChildren));

		expect(() => wrapper.findByName('Container').at(0).renderRenderProp({}, 2)).to.throw();
	});

	it('can find a memoed component by name', () => {
		const wrapper = render(React.createElement(TestComponentWithFuncChildren));

		expect(wrapper.findByName('MemoedComponent')).to.have.lengthOf(1);
	});

	it('can update after state change', () => {
		const wrapper = render(React.createElement(Counter));

		const count = wrapper.findByName('Count').at(0);

		expect(count.props.count).to.equal(0);

		count.props.inc();

		expect(count.props.count).to.equal(0);

		wrapper.update();

		expect(wrapper.findByName('Count').at(0).props.count).to.equal(1);
	});

	it('throws if update() is called on non-root Wrapper', () => {
		const wrapper = render(React.createElement(TestComponent));

		const child = wrapper.findByClass('Child1').at(0);

		expect(() => child.update()).to.throw();
	});

	it('can call a function prop and update the proband', () => {
		const wrapper = render(React.createElement(Counter));

		const count = wrapper.findByName('Count').at(0);

		expect(count.props.count).to.equal(0);

		count.callProp('inc');

		expect(wrapper.findByName('Count').at(0).props.count).to.equal(1);
	});

	it('can call a function prop with arguments', () => {
		const wrapper = render(React.createElement(Counter));

		const count = wrapper.findByName('Count').at(0);

		expect(count.props.count).to.equal(0);

		count.callProp('inc', 5);

		expect(wrapper.findByName('Count').at(0).props.count).to.equal(5);
	});
});

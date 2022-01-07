const React = require('react');

const Wrapper = require('./Wrapper');

const mockChild1 = 					{
	type: 'span',
	props: {
		className: 'Child Child1',
		children: 'child 1',
		'data-test-id': 'text-child-1',
	},
};
const mockChild2 = 					{
	type: 'span',
	props: {
		className: 'Child Child2',
		children: 'child 2',
		'data-test-id': 'text-child-2',
	},
};
const mockRenderOutput = {
	type: 'span',
	props: {
		className: 'Parent',
		children: [
			undefined,
			null,
			mockChild1,
			mockChild2,
		],
	},
};

const mockContainer = function Container() {};
mockContainer.Section = function () {};
const mockMemoedComponent = function MemoedComponent() {};

const mockRenderOutputWithFuncChildren = {
	type: Symbol('react.fragment'),
	props: {
		children: [
			{
				type: mockContainer,
				props: {
					children: ({text}) => ({
						type: 'div',
						props: {
							children: text,
						},
					}),
				},
			},
			{
				type: {
					type: mockMemoedComponent,
				},
				props: {
					children: {
						type: 'div',
						props: {
							className: 'SoloChild',
							children: 'solo child',
						},
					},
				},
			}
		],
	}
}

describe('Wrapper', () => {
	it('can be constructed with a shallow rendering result', () => {
		const wrapper = new Wrapper(mockRenderOutput);

		expect(wrapper.root).to.equal(mockRenderOutput);
	});

	it('throws if constructor argument is invalid', () => {
		expect(() => new Wrapper('MyComponent')).to.throw();
	});

	it('can find children by HTML tag name', () => {
		const wrapper = new Wrapper(mockRenderOutput);
		const spans = wrapper.findByName('span');

		expect(spans).to.have.lengthOf(3);
		expect(spans.some(span => span.root === mockRenderOutput)).to.be.true;
		expect(spans.some(span => span.root === mockChild1)).to.be.true;
		expect(spans.some(span => span.root === mockChild2)).to.be.true;
	});

	it('throws if trying to find by tag name that is not a string', () => {
		const wrapper = new Wrapper(mockRenderOutput);

		expect(() => wrapper.findByName()).to.throw();
	});

	it('returns an empty array if no elements are found by tag name', () => {
		const wrapper = new Wrapper(mockRenderOutput);

		expect(wrapper.findByName('div')).to.have.lengthOf(0);
	});

	it('can find children by class', () => {
		const wrapper = new Wrapper(mockRenderOutput);
		const children = wrapper.findByClass('Child');

		expect(children).to.have.lengthOf(2);
		expect(children.some(span => span.root === mockRenderOutput)).to.be.false;
		expect(children.some(span => span.root === mockChild1)).to.be.true;
		expect(children.some(span => span.root === mockChild2)).to.be.true;
	});

	it('throws if trying to find by class that is not a string', () => {
		const wrapper = new Wrapper(mockRenderOutput);

		expect(() => wrapper.findByClass()).to.throw();
	});

	it('returns an empty array if no elements are found by class', () => {
		const wrapper = new Wrapper(mockRenderOutput);

		expect(wrapper.findByName('Grandparent')).to.have.lengthOf(0);
	});

	it('can find children by a prop', () => {
		const wrapper = new Wrapper(mockRenderOutput);
		const child = wrapper.findByProp('data-test-id', 'text-child-1');

		expect(child).to.have.lengthOf(1);
	});

	it('throws if trying to find by a prop and prop name is not a string', () => {
		const wrapper = new Wrapper(mockRenderOutput);

		expect(() => wrapper.findByProp(2, 3)).to.throw();
	});

	it('throws if trying to find by a prop and prop value is missing', () => {
		const wrapper = new Wrapper(mockRenderOutput);

		expect(() => wrapper.findByProp('data-test-id')).to.throw();
	});

	it('returns an empty array if no elements are found by prop value', () => {
		const wrapper = new Wrapper(mockRenderOutput);

		expect(wrapper.findByProp('data-test-id', 'text-child-3')).to.have.lengthOf(0);
	});

	it('can return props of the wrapper element', () => {
		const wrapper = new Wrapper(mockRenderOutput);

		expect(wrapper.props).to.equal(mockRenderOutput.props);
	});

	it('can return plain text node of the wrapper element', () => {
		const wrapper = new Wrapper(mockRenderOutput);

		expect(wrapper.findByProp('data-test-id', 'text-child-1').at(0).text).to.equal('child 1');
	});

	it('returns null if the element does not have plain text children', () => {
		const wrapper = new Wrapper(mockRenderOutput);

		expect(wrapper.text).to.equal(null);
	});

	it('can return array of element classes', () => {
		const wrapper = new Wrapper(mockRenderOutput);

		expect(wrapper.findByProp('data-test-id', 'text-child-1').at(0).classes).to.eql(['Child', 'Child1']);
	});

	it('can find children by React component display name', () => {
		const wrapper = new Wrapper(mockRenderOutputWithFuncChildren);

		expect(wrapper.findByName('Container')).to.have.lengthOf(1);
	});

	it('can find React.Fragment by name', () => {
		const wrapper = new Wrapper(mockRenderOutputWithFuncChildren);

		expect(wrapper.findByName('React.Fragment')).to.have.lengthOf(1);
	});

	it('can render a render prop', () => {
		const wrapper = new Wrapper(mockRenderOutputWithFuncChildren);

		const children = wrapper.findByName('Container').at(0).renderRenderProp('children', {text: 'test'});

		const theDiv = children.findByName('div');
		expect(theDiv).to.have.lengthOf(1);
		expect(theDiv.at(0).props.children).to.equal('test');
	});

	it('throws if the render prop is not found', () => {
		const wrapper = new Wrapper(mockRenderOutputWithFuncChildren);

		expect(() => wrapper.findByName('Container').at(0).renderRenderProp('propThatDoesNotExist', {text: 'test'})).to.throw();
	});

	it('throws if the render prop is not a function', () => {
		const wrapper = new Wrapper(mockRenderOutputWithFuncChildren);

		expect(() => wrapper.findByClass('SoloChild').at(0).renderProp('className')).to.throw();
	});

	it('throws if render prop name is not a string', () => {
		const wrapper = new Wrapper(mockRenderOutputWithFuncChildren);

		expect(() => wrapper.findByName('Container').at(0).renderRenderProp({}, {text: 'test'})).to.throw();
	});

	it('throws if render prop props are not an object', () => {
		const wrapper = new Wrapper(mockRenderOutputWithFuncChildren);

		expect(() => wrapper.findByName('Container').at(0).renderRenderProp({}, 2)).to.throw();
	});

	it('can find a memoed component by name', () => {
		const wrapper = new Wrapper(mockRenderOutputWithFuncChildren);

		expect(wrapper.findByName('MemoedComponent')).to.have.lengthOf(1);
	});

	it('can search a single child not in an array (what causes this?)', () => {
		const wrapper = new Wrapper(mockRenderOutputWithFuncChildren);

		expect(wrapper.findByClass('SoloChild')).to.have.lengthOf(1);
	});
});

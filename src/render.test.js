const wrapper = require('./Wrapper');

const mockRender = sinon.fake();
const mockRenderOutput = {};
const render = proxyquire('./render', {
	'react-test-renderer/shallow': function () {
		return {
			render: mockRender,
			getRenderOutput: () => mockRenderOutput,
		};
	},
});

describe('render', () => {
	it('passes the argument through React Shallow Renderer and returns the wrapped output', () => {
		const mockComponent = {};
		const wrapper = render(mockComponent);

		expect(wrapper.root).to.equal(mockRenderOutput);
		expect(mockRender).to.have.been.calledOnceWith(mockComponent);
	});
});

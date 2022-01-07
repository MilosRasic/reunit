const ShallowRenderer = require('react-test-renderer/shallow');

const Wrapper = require('./Wrapper');

function render(element) {
	const renderer = new ShallowRenderer();
	renderer.render(element);

	return new Wrapper(renderer);
}

module.exports = render;
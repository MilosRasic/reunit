const { mockUseEffect, cleanupEffects } = require('./mockUseEffect');

const config = {
	testId: 'data-test-id',
};

function configure({ mocker, testId }) {
	if (mocker) {
		const mockerCount = Object.keys(mocker).length;
		if (mockerCount !== 1) {
			throw new Error(
				`reunit can be configured with only a single mocker, but ${mockerCount} were found in config object`
			);
		}

		if (mocker.jest) {
			mocker.jest.mock('react', () => ({
				...mocker.jest.requireActual('react'),
				useEffect: (effect, deps) => mockUseEffect(effect, deps),
			}));
		}
	}

	if (testId) {
		if (typeof testId !== 'string') {
			throw new Error(`test ID should be a string, but got ${typeof testId}`);
		}

		config.testId = testId;
	}

	afterEach(() => {
		cleanupEffects();
	});
}

function getTestId() {
	return config.testId;
}

module.exports = {
	configure,
	getTestId,
};

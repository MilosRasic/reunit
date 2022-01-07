const {mockUseEffect, cleanupEffects} = require('./mockUseEffect');

function configure({mocker}) {
	if (mocker) {
		const mockerCount = Object.keys(mocker).length;
		if (mockerCount !== 1) {
			throw new Error(`reunit can be configured with only a single mocker, but ${mockerCount} were found in config object`);
		}

		if (mocker.jest) {
			mocker.jest.mock('react', () => ({
				...mocker.jest.requireActual('react'),
				useEffect: (effect, deps) => mockUseEffect(effect, deps),
			}));
		}
	}

	afterEach(() => {
		cleanupEffects();
	});
}

module.exports = configure; 

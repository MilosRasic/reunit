const { mockUseEffect, cleanupEffects } = require('./mockUseEffect');

describe('mockUseEffect', () => {
	afterEach(() => {
		cleanupEffects();
	});

	it('calls the effect body when it is called the first time', () => {
		const mockEffect = sinon.fake();

		mockUseEffect(mockEffect, []);

		expect(mockEffect).to.have.been.calledOnce;
	});

	it('does not call the effect again if it is called with the same deps', () => {
		const mockEffect = sinon.fake();

		mockUseEffect(mockEffect, [1, 2]);

		expect(mockEffect).to.have.been.calledOnce;

		mockUseEffect(mockEffect, [1, 2]);

		expect(mockEffect).to.have.been.calledOnce;
	});

	it('calls the effect again if it is called with different deps', () => {
		const mockEffect = sinon.fake();

		mockUseEffect(mockEffect, [1, 2]);

		expect(mockEffect).to.have.been.calledOnce;

		mockUseEffect(mockEffect, [5, 6]);

		expect(mockEffect).to.have.been.calledTwice;
	});

	it('calls the cleanup callback when cleanup() is called', () => {
		const mockCleanup = sinon.fake();
		const mockEffect = sinon.fake.returns(mockCleanup);

		mockUseEffect(mockEffect, []);

		cleanupEffects();

		expect(mockEffect).to.have.been.calledOnce;
		expect(mockCleanup).to.have.been.calledOnce;
	});

	it('calls the effect every time if there is no deps array', () => {
		const mockEffect = sinon.fake();

		mockUseEffect(mockEffect);

		expect(mockEffect).to.have.been.calledOnce;

		mockUseEffect(mockEffect);

		expect(mockEffect).to.have.been.calledTwice;
	});
});

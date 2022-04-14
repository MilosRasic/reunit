const mockMockUseEffect = sinon.fake();
const { configure, getTestId } = proxyquire('./configure', {
	'./mockUseEffect': {
		mockUseEffect: mockMockUseEffect,
	},
});

describe('configure', () => {
	it('mocks useEffect if given a jest instance', () => {
		const mockJest = {
			mock: sinon.fake(),
			requireActual: () => ({}),
		};
		const mockEffect = () => {};
		const mockDeps = [];

		configure({
			mocker: {
				jest: mockJest,
			},
		});

		expect(mockJest.mock).to.have.been.calledOnceWith(
			'react',
			sinon.match(mock => !!mock().useEffect)
		);

		mockJest.mock.args[0][1]().useEffect(mockEffect, mockDeps);

		expect(mockMockUseEffect).to.have.been.calledOnceWith(mockEffect, mockDeps);
	});

	it('throws when given more than one mocker', () => {
		expect(() =>
			configure({
				mocker: {
					jest: {},
					otherMocker: {},
				},
			})
		).to.throw();
	});

	it('throws when mocker object is empty', () => {
		expect(() =>
			configure({
				mocker: {},
			})
		).to.throw();
	});

	it('returns data-test-id as default test ID', () => {
		expect(getTestId()).to.equal('data-test-id');
	});

	it('can be configured with explicitly set test ID', () => {
		const MOCK_TEST_ID = 'my-special-test-id';

		configure({ testId: MOCK_TEST_ID });

		expect(getTestId()).to.equal(MOCK_TEST_ID);
	});

	it('throws if given a testId that is not a string', () => {
		const MOCK_BAD_TEST_ID = 23456;

		expect(() =>
			configure({
				testId: MOCK_BAD_TEST_ID,
			})
		).to.throw();
	});
});

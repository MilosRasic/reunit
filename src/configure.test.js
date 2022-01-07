const mockMockUseEffect = sinon.fake();
const configure = proxyquire('./configure', {
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
});

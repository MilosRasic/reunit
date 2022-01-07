const singleResult = require('./singleResult');

describe('singleResult', () => {
	it('returns the only element from an array with only one element', () => {
		const element = {};
		const array = [element];

		expect(singleResult(array)).to.equal(element);
	});

	it('throws if the array does not have exactly one result', () => {
		const array = [{}, {}];

		expect(() => singleResult(array)).to.throw();
	});

	it('throws if results is not an array', () => {
		const notAnArray = {};

		expect(() => singleResult(notAnArray)).to.throw();
	});
}); 

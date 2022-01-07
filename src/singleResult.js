function singleResult(results) {
	if (!(typeof results === 'object') && results.length) {
		throw new Error(`singleResult() expects an array but got ${typeof results}`);
	}

	if (results.length !== 1) {
		throw new Error(`Expected exactly one result. Found ${results.length}`);
	}

	return results[0];
}

module.exports = singleResult;

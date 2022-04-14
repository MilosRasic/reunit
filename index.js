const render = require('./src/render');
const { mockUseEffect, cleanupEffects } = require('./src/mockUseEffect');
const { configure } = require('./src/configure');
const singleResult = require('./src/singleResult');

module.exports = {
	render,
	mockUseEffect,
	cleanupEffects,
	configure,
	singleResult,
};

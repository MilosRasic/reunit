let effects = {};

function mockUseEffect(effect, deps) {
	const effectCode = effect.toString();
	const registeredEffect = effects[effect.toString()];

	const firstRun = !registeredEffect;
	const depsMissingOrChanged = !deps || registeredEffect && registeredEffect.lastDeps.some((dep, i) => dep !== deps[i]);

	if (firstRun || depsMissingOrChanged) {
		const cleanup = effect();

		effects[effectCode] = {
			lastDeps: deps,
			cleanup,
		};
	}
}

function cleanupEffects() {
	for (const effectCode in effects) {
		const effect = effects[effectCode];

		if (effect.cleanup) {
			effect.cleanup();
		}
	}

	effects = {};
}

module.exports = {
	mockUseEffect,
	cleanupEffects,
};
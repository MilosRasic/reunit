const ShallowRenderer = require('react-test-renderer/shallow');

class Wrapper {
	constructor(renderer) {
		if (typeof renderer !== 'object' || !renderer.getRenderOutput) {
			throw new Error('Wrapper constructor expects an instance of React Shallow Renderer as argument');
		}

		this.root = renderer.getRenderOutput();
		this.renderer = renderer;
	}

	_checkClassNames() {
		if (!this.classNames) {
			if (this.root.props && this.root.props.className) {
				this.classNames = this.root.props.className.split(' ');
			}
			else {
				this.classNames = [];
			}
		}
	}

	_searchChildren(check, preCheck) {
		const result = [];

		if (preCheck) {
			preCheck(this);
		}

		if (check(this)) {
			result.push(this);
		}

		if (this.root.props && this.root.props.children) {
			// array of children
			if (this.root.props.children.forEach) {
				this.root.props.children.forEach(child => {
					if (child && typeof child === 'object') {
						const childWrapper = new Wrapper(child);
						result.push(...childWrapper._searchChildren(check, preCheck));
					}
				});
			}
			// single child not in an array
			else if (this.root.props.children.type) {
				const childWrapper = new Wrapper(this.root.props.children);
				result.push(...childWrapper._searchChildren(check, preCheck));
			}
		}

		return result;
	}

	_composeComponentName(type) {
		const names = [type.name];

		const subname = Object.keys(type).find(key => typeof type[key] === 'function');

		if (subname) {
			names.push(subname);
		}

		return names.join('.');
	}

	get props() {
		return this.root.props;
	}

	get text() {
		return this.root.props && typeof this.root.props.children === 'string' ? this.root.props.children : null;
	}

	get classes() {
		this._checkClassNames();

		return this.classNames;
	}

	get name() {
		const type = this.root.type;

		const typeOfType = typeof type;

		// HTML tag
		if (typeOfType === 'string')
			return type;
		// React.Fragment
		else if (typeOfType === 'symbol') {
			const symbolNameSplit = type.description.split('.');

			return symbolNameSplit.map(nameFrag => nameFrag[0].toUpperCase() + nameFrag.substring(1)).join('.');
		}
		// React Component
		else if (typeOfType === 'function') {
			// return this._composeComponentName(type);
			return type.name;
		}
		// React Component wrapped in React.Memo
		else if (typeOfType === 'object' && type.type) {
			return type.type.name;
		}
		else {
			console.warn(`reunit encountered a React element type of unsupported format (${typeOfType}) while searching by name. Please report the issue on github, preferably with an example of the component you are trying to test.`);
		}
	}

	findByName(name) {
		if (typeof name !== 'string') {
			throw new Error('findByName expects a React Component or HTML tag name as an argument')
		}

		return this._searchChildren(wrapper => wrapper.name === name);
	}

	findByClass(className) {
		if (typeof className !== 'string') {
			throw new Error('findByClass expects a class name as an argument');
		}

		return this._searchChildren(wrapper => wrapper.classNames.includes(className), wrapper => wrapper._checkClassNames());
	}

	findByProp(prop, value) {
		if (typeof prop !== 'string') {
			throw new Error('findByProps expects prop name to be a string');
		}

		if (typeof value === 'undefined') {
			throw new Error('findByProps expects second argument to be the prop value');
		}

		return this._searchChildren(wrapper => wrapper.root.props ? wrapper.root.props[prop] === value : false);
	}

	renderRenderProp(prop, props) {
		if (typeof prop !== 'string') {
			throw new Error('renderRenderProp expect a string as the first argument');
		}

		if (props && typeof props !== 'object') {
			throw new Error('renderRenderProp expect an object as the optional second argument');
		}

		const renderProp = this.props && this.props[prop];

		if (!renderProp) {
			throw new Error(`Render prop ${prop} not found.`);
		}

		if (typeof renderProp !== 'function') {
			throw new Error(`Render prop ${prop} found but is not a function`);
		}

		return new Wrapper(renderProp(props));
	}
}

module.exports = Wrapper;

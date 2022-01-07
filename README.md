# reunit

reunit is a WIP lightweight, opinionated library for React component unit testing. It is intended as an alternative for Enzyme's shallow rendering, but not as an alternative for React Testing Libray or tests based on Ezyme's `mount()`.

reunit makes sure your unit tests remain pure unit tests by not offering APIs that allow you to reach for component internals like directly mounting a full component tree, simulating events, setting state or calling a method on an instance of your classy component. Instead, you can only shallow render your component and examin the rendering output.

## Testing Philosophy

Unit tests are not a bad, obsolete alternative to integration and end-to-end tests. They are a basic building block of a Continuous Delivery pipeline intended to give fast feedback and ensure the basic units of our code (functions, classes, objects, etc - and React Component is a function) are well-designed and working as intended.

Unit tests are also the best way to do Test Driven Development (TDD), a development technique that probably has the most univerally beneficial effect on our engineering skills, regardless of our seniority level, programming languages we use or the type of software we are working on.

reunit works on the assumption that only the following is considered a unit test:
- Only the component under test is tested. All non-trivial direct dependencies are mocked out in a minimal fashion, so that mocks provide only the functionality needed by the component under test.
- Our test cases should shallow render the component under test with different combinations of props and assert the output. The output is what the function component returns or the return of `render()` method of a classy component.
- Additionally, test cases should call the callbacks the component under test provides to its children as props and assert the effects of those calls.

## What's done and supported
- functional components
- `useEffect()`
- manually upading a shallow render after a state change
- finding children by tag or component name, class or a prop value
- `React.Fragment`
- `React.memo()`
- manually rendering a render prop

## To be done
- better docs
- `useLayoutEffect()`
- `useRef()`
- classy components
- Context?
- classy components
- dumping output as JSX for easier debugging
- example tests
- finding children by component? So far looks like it's not needed
- finding children by a configurable test ID
- TS typings

## Won't do
- real DOM rendering in `jsdom`
- directly setting state
- automatic render prop rendering (we don't know which prop is a render prop or what arguments to pass)
- selectors
- finding children by text or role
- support for older versions of React
- rewrite in TS, WASM or whatever
- 
## Installing

`yarn add --dev reunit`

or

`npm install --save-dev reunit`

## Basic Usage

**Note:** all examples use Jest assertions

### Render a component

```
import { render } from 'reunit';

const wrapper = render(<BuyButton price="24.99"/>);
```

`render()` returns instance of a `Wrapper`. Unlike Enzyme, reunit `Wrapper` always wraps the output of only one component, so you always know what you're working with.

### Traverse the output

To perform assetions on the output of our shallow render, we have to somehow reach for specific elements rendered by the component.

Finding by HTML tag name or React component name:
```
const spans = wrapper.findByName('span');
```

Finding by class:
```
const price = wrapper.findByClass('Price');
```

Finding by prop value:
```
const price = wrapper.findByProp('data-test-id', 'buy-button-price-text');
```

All find methods return an array of Wrappers, even if there's only one or no results. In case of no results, the array will be empty. We can assert the existence of exactly one element like this:
```
expect(price).toHaveLength(1);
```

If we want to assert the presence of exactly one element and get a reference to it for further assertions, reunit offers a `singleResult()` helper.
```
import { render, singleResult } from 'reunit';

const price = singleResult(wrapper.findByProp('data-test-id', 'buy-button-price-text'));

expect(price).text.toBe('24.99');
```

The equivalent to above code without `singleResult()` would look like this:

```
import { render, singleResult } from 'reunit';

const price = wrapper.findByProp('data-test-id', 'buy-button-price-text');

expect(price).toHaveLength(1);
expect(price.at(0)).text.toBe('24.99');
```

`singleResult()` returns the first element of the array but throws if the array does not have exactly 1 element.

Note: `Array.at()` is the more elegant alternative to square brackets, expecially in cases like this when we want to immediately get an element of an array returned by a function call. However, it's only available since Node 16.6.0. Older versions can use the polyfill provided by core-js.

### `useEffect()` support

`useEffect()` is stubbed out by React Shallow Renderer which reunit relies on for shallow rendering, but it's still very important for functionality of our components. reunit works around this by offering a way to mock useEffect() so that our effects are executed. The mock does not copmletely implement the behavior of React, but it's faithful enough for testing a single component in isolation.

A way to automatically mock `useEffect()` is provided for Jest and might be provided for other test runners or mocking libraries in the future. To automatically enable `useEffect()` in all tests, simply add this to your test helper module:
```
import {configure} from 'reunit';

configure({
	mocker: {
		jest,
	}
});
```

**Known limitation:** Mocking `useEffect()` like this affects all tests. If you want to run a mix of reunit tests with tests that rely on other libraries, automatic mocking will break `useEffect()` for other libraries. In that case, mock `useEffect()` manually in your reunit tests. If you want to run both unit and integration tests, it might be a good idea to run them as different commands, with different test helper modules.

For all other situations, the mocks are available as named exports for manual mocking:
```
import { mockUseEffect, cleanupEffects } from 'reunit';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: (effect, deps) => mockUseEffect(effect, deps),
}));

afterEach(() => {
  cleanupEffects();
});
```

### Shorthand properties

`Wrapper` stores the output of React Shallow Renderer in `Wrapper.root`. While this output can be used to get all the data about the rendered elements, it can get verbose.

`Wrapper` provides a few shorthand that can be used to more ergonomically access the most important properties of the rendered elements:

**props** - `Wrapper.props` - An object containing props of the wrapped elemenet. Shorthand for `Wrapper.root.props`.

**text** - `Wrapper.text` - Plain text `children` prop of the wrapped element. Will be null if the element doesn't have plain text children.

**classes** - `Wrapper.classes` - Array of classes of the wrapped element.

**name** - `Wrapper.name` - HTLM tag or React Component name

### Render props

Render props are a bit out of fashion these days, but they may still be a good solution in some cases or a frequent part of older codebases written when they were the latest hype.

reunit is not able to recognize which prop is a render prop, and even if it could, render props could have parameters that you'd want to pass manually anyway.

`Wrapper.renderRenderProp(propName, props)` offers a way to call the render prop function and get a `Wrapper` wrapping the rendered elements as a result.

For example, for a copmonent written like this...
```
const Details => (
  <ScrollContainer>
    ({ onFocused }) => <div className="Details">...</div>
  </ScrollContainer>
);
```

...we could render the `children` prop like this:
```
const mockOnFocused = jest.fn();

const wrapper = render(<Details />);

wrapper.findByName('ScrollContainer').at(0).renderRenderProp('children', { onFocused: mockOnFocused });
```

### Updating after state change

State changes are an important part of our components that should be unit tested as well. After we call a function that caues a state change, reunit offers a `Wrapper.update()` method that updates the shallow render output to the latest state.

For example, this test would fail:
```
const wrapper = render(<Counter />);

const count = singleResult(wrapper.findByName('Count'));

expect(count.props.count).toBe(0);

count.props.increment();

expect(count.props.count).toBe(1);
```

Because after we call `increment()` which we can guess increments the `Counter` state by 1, the wrappers stil hold output of the initial render. To get a test case that works as expected, we have to update the root wrapper, and find the `Count` element again. 

```
const wrapper = render(<Counter />);

const count = singleResult(wrapper.findByName('Count'));

expect(count.props.count).toBe(1);

count.props.increment();

wrapper.update();

expect(wrapper.findByName('Count').at(0).props.count).toBe(1);
```

## Contributing

reunit is still in early phase of initial development. Please post your idea as an issue so that we can sync on whether and how to best implement it. 

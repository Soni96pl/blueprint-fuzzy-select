var React = require('react');
var ReactTestUtils = require('react-addons-test-utils')
var ReactDOM = require('react-dom');

var expect = require("chai").expect;

var FuzzySelect = require('../dist/index').default;

describe('FuzzySelect component', function() {
  before('render element', function() {
    this.renderedComponent = ReactTestUtils.renderIntoDocument(
      <FuzzySelect
        haystack={['Kuba', 'Jiewen']}
        sort={true}
        onSelect={(name) => console.log(name)}
      >
        <input />
      </FuzzySelect>
    );

    this.outsideComponent = ReactTestUtils.renderIntoDocument(
      <div></div>
    );

    this.inputComponent = ReactTestUtils.findRenderedDOMComponentWithTag(
      this.renderedComponent,
      'input'
    );
    this.inputElement = ReactDOM.findDOMNode(this.inputComponent);
  });

  it('should change state.focused to be true when I focus', function() {
    ReactTestUtils.Simulate.focus(this.inputElement);
    expect(this.renderedComponent.state.focused).to.be.true;
  });

  it('should change state.input to equal Jen when I input Jen', function() {
    this.inputElement.value = 'Jen'
    ReactTestUtils.Simulate.change(this.inputElement);
    expect(this.renderedComponent.state.input).to.equal('Jen');
  });

  it('should have 1 suggestion after input', function() {
    expect(this.renderedComponent.state.suggestions).to.have.lengthOf(1);
  });

  it('should render a menu after input', function() {
    var menuComponent = ReactTestUtils.findRenderedDOMComponentWithClass(
      this.renderedComponent,
      'pt-menu'
    );
    expect(menuComponent).to.be.ok;
  });

  it('should include "Jiewen" in suggestions after input', function() {
    expect(this.renderedComponent.state.suggestions).to.include('Jiewen');
  });

  it('should render "Jiewen" menu item after input', function() {
    var menuItemComponent = ReactTestUtils.findRenderedDOMComponentWithClass(
      this.renderedComponent,
      'pt-menu-item'
    );
    var menuItemElement = ReactDOM.findDOMNode(menuItemComponent)
    expect(menuItemElement.text).to.equal('Jiewen');
  });

  it('should change state.focused to not to be true on blur', function() {
    this.renderedComponent.handleBlur({ target: ReactDOM.findDOMNode(this.outsideComponent) });
    expect(this.renderedComponent.state.focused).to.not.be.true
  });

  it('should change state.input to be empty after blur', function() {
    expect(this.renderedComponent.state.input).to.be.empty;
  });
});

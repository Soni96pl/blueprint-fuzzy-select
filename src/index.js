import React, { Component, PropTypes } from 'react';
import { Menu, MenuItem } from '@blueprintjs/core';
import FuzzySearch from 'fuzzy-search';

export default class FuzzySelect extends Component {
  static propTypes = {
    haystack: PropTypes.arrayOf(
      React.PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.string
      ])
    ).isRequired,
    field: PropTypes.string,
    caseSensitive: PropTypes.bool,
    sort: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    onInput: PropTypes.func,
    onSuggestions: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    children: PropTypes.element
  }

  constructor(props, context) {
    super(props, context);

    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  state = {
    input: '',
    selected: null,
    suggestions: [],
    focused: false
  }

  componentDidMount() {
    window.addEventListener('click', this.handleBlur, false);

    const { haystack, field, caseSensitive, sort } = this.props;
    const keys = field ? [field] : [];
    this.searcher = new FuzzySearch(haystack, keys, { caseSensitive, sort });
  }

  componentDidUpdate() {
    const { haystack, field, caseSensitive, sort } = this.props;
    const keys = field ? [field] : [];
    this.searcher = new FuzzySearch(haystack, keys, { caseSensitive, sort });
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleBlur, false);
  }

  handleFocus() {
    const { onFocus } = this.props;
    if (onFocus) onFocus();

    this.setState({ input: '', focused: true });
  }

  handleBlur(event) {
    const { field, onBlur } = this.props;
    const { selected } = this.state;
    const isParent = (reference, target) => (
      target === reference || (target.parentNode && isParent(reference, target.parentNode))
    );

    if (!isParent(this.inputWrapper, event.target)) {
      if (onBlur) onBlur();

      const input = selected ? selected[field] : '';
      this.setState({ input, focused: false });
    }
  }

  handleInput(event) {
    const { onInput, onSuggestions } = this.props;
    const input = event.target.value;
    const suggestions = this.searcher.search(input);
    if (onInput) onInput(input);
    if (onSuggestions) onSuggestions(suggestions);

    this.setState({ input, suggestions });
  }

  chooseOption(selected) {
    const { field, onSelect } = this.props;
    if (onSelect) onSelect(selected);

    this.setState({
      selected,
      input: selected[field],
      suggestions: [],
      focused: false
    });
  }

  render() {
    const { field } = this.props;
    const { input, suggestions, focused } = this.state;

    const inputElement = React.cloneElement(
      this.props.children,
      {
        onChange: this.handleInput,
        onFocus: this.handleFocus,
        value: input
      }
    );

    let suggestionsCount = 0;

    return (
      <div className="input-suggest" ref={(div) => this.inputWrapper = div}>
        {inputElement}
        {focused && suggestions.length > 0 &&
          <Menu className="pt-elevation-1">
            {suggestions.map(suggestion =>
              <MenuItem
                key={`suggestion-${suggestionsCount += 1}`}
                text={field ? suggestion[field] : suggestion}
                onClick={() => this.chooseOption(suggestion)}
              />
            )}
          </Menu>
        }
      </div>
    );
  }
}

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
    onAdd: PropTypes.func,
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
    const suggestions = this.search(input);
    if (onInput) onInput(input);
    if (onSuggestions) onSuggestions(suggestions);

    this.setState({ input, suggestions });
  }

  search(input) {
    const { haystack, field, caseSensitive, sort } = this.props;
    const keys = field ? [field] : [];
    if (haystack.length > 0) {
      this.searcher = new FuzzySearch(haystack, keys, { caseSensitive, sort });
      return this.searcher.search(input);
    }
    return [];
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

  addOption(input) {
    const { onAdd } = this.props;
    const selected = onAdd(input);
    const state = {
      suggestions: [],
      focused: false
    };

    if (selected) {
      this.setState({ ...{ input, selected }, ...state });
    } else {
      this.setState({
        ...{
          input: '',
          selected: null,
        },
        ...state
      });
    }
  }

  render() {
    const { field, onAdd } = this.props;
    const { input, suggestions, focused } = this.state;

    const inputElement = React.cloneElement(
      this.props.children,
      {
        onChange: this.handleInput,
        onFocus: this.handleFocus,
        value: input
      }
    );

    const showNew = onAdd && input;
    const showSuggestions = suggestions.length > 0;

    let suggestionsCount = 0;

    return (
      <div className="input-suggest" ref={(div) => this.inputWrapper = div}>
        {inputElement}
        {focused && (showNew || showSuggestions) &&
          <Menu className="pt-elevation-1">
            {suggestions.map(suggestion =>
              <MenuItem
                key={`suggestion-${suggestionsCount += 1}`}
                text={field ? suggestion[field] : suggestion}
                onClick={() => this.chooseOption(suggestion)}
              />
            )}
            {showNew &&
              <MenuItem
                key="suggestion-add-new"
                text={input}
                iconName="add"
                onClick={() => this.addOption(input)}
              />
            }
          </Menu>
        }
      </div>
    );
  }
}

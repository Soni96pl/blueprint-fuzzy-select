import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
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
    selected: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ]),
    field: PropTypes.string,
    caseSensitive: PropTypes.bool,
    sort: PropTypes.bool,
    selectOnBlur: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.string
    ]),
    selectOnEnter: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    onAdd: PropTypes.func,
    onInput: PropTypes.func,
    onSuggestions: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    className: PropTypes.string,
    style: PropTypes.objectOf(PropTypes.string),
    children: PropTypes.element
  }

  constructor(props, context) {
    super(props, context);

    this.handleFocus = this.handleFocus.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.handleWindowClick = this.handleWindowClick.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  state = {
    input: '',
    selected: null,
    suggestions: [],
    focused: false
  }

  componentWillMount() {
    const { selected } = this.props;
    if (selected !== undefined) {
      this.setState({ selected });
      this.resetInput(selected);
    }
  }

  componentDidMount() {
    window.addEventListener('click', this.handleWindowClick, false);
    window.addEventListener('keydown', this.handleKeydown, false);
  }

  componentWillReceiveProps(nextProps) {
    const { selected } = nextProps;
    if (selected !== undefined) this.setState({ selected });
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.selected !== nextState.selected) {
      this.resetInput(nextState.selected);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleWindowClick, false);
    window.removeEventListener('keydown', this.handleKeydown, false);
  }

  resetInput(selected = this.state.selected) {
    const { field } = this.props;
    const input = selected ? selected[field] : '';
    this.setState({ input });
  }

  handleFocus() {
    const { onFocus } = this.props;
    if (onFocus) onFocus();

    this.setState({ input: '', focused: true });
  }

  handleWindowClick(event) {
    const isParent = (reference, target) => (
      target === reference || (target.parentNode && isParent(reference, target.parentNode))
    );

    if (!isParent(this.inputWrapper, event.target)) {
      this.handleBlur('Click', event);
    }
  }

  handleKeydown(event) {
    switch (event.key) {
      case 'Tab':
        this.handleBlur('Tab', event);
        break;
      case 'Enter':
        this.handleEnter(event);
        break;
      default: // pass
    }
  }

  handleBlur(action) {
    const { selectOnBlur, onBlur } = this.props;
    const { focused } = this.state;

    if (focused) {
      if (onBlur) onBlur();

      if (selectOnBlur === true || selectOnBlur === action) {
        this.selectFirst();
      } else {
        this.resetInput();
        this.setState({ focused: false });
      }
    }
  }

  handleEnter(event) {
    const { selectOnEnter } = this.props;
    const { focused } = this.state;

    if (focused && selectOnEnter) {
      event.preventDefault();
      this.selectFirst();
      this.blurInput();
    }
  }

  blurInput() {
    let inputDOM = this.inputDOM;
    if (this.inputDOM.tagName === 'input') {
      inputDOM = this.inputDOM;
    } else {
      inputDOM = this.inputDOM.querySelector('input');
    }
    inputDOM.blur();
  }

  selectFirst() {
    const { onAdd } = this.props;
    const { input, focused, suggestions } = this.state;

    if (focused && input) {
      if (suggestions.length > 0) {
        this.chooseOption(suggestions[0]);
        return true;
      } else if (onAdd) {
        this.addOption(input);
        return true;
      }
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

    if (this.props.selected === undefined) {
      this.setState({
        selected,
        input: selected[field],
        suggestions: [],
        focused: false
      });
    } else {
      this.setState({
        suggestions: [],
        focused: false
      });
      this.resetInput();
    }
  }

  addOption(input) {
    const { onAdd } = this.props;
    const selected = onAdd(input);

    if (selected) {
      this.setState({
        input,
        selected,
        suggestions: [],
        focused: false
      });
    } else {
      this.setState({
        input: '',
        selected: null,
        suggestions: [],
        focused: false
      });
    }
  }

  render() {
    const { field, onAdd } = this.props;
    let { className, style } = this.props;

    const { input, suggestions, focused } = this.state;

    const inputElement = React.cloneElement(
      this.props.children,
      {
        onChange: this.handleInput,
        onFocus: this.handleFocus,
        value: input,
        ref: ((inputDOM) => this.inputDOM = ReactDOM.findDOMNode(inputDOM))
      }
    );

    className = className ? `${className} input-suggest` : 'input-suggest';
    style = {
      ...{ position: 'relative' },
      ...style
    };

    const showNew = onAdd && input;
    const showSuggestions = suggestions.length > 0;

    let suggestionsCount = 0;

    return (
      <div
        className={className}
        style={style}
        ref={(div) => this.inputWrapper = div}
      >
        {inputElement}
        {focused && (showNew || showSuggestions) &&
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: '1px',
              left: '1px'
            }}
          >
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
          </div>
        }
      </div>
    );
  }
}

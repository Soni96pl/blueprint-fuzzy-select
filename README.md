Blueprint Fuzzy Select
======================

Blueprint Fuzzy Select is React component intended to extend  [Blueprint's](https://github.com/palantir/blueprint) Input with fuzzy search suggestions dropdown à la Atom's command palette. 🖥

It supports any input as its child but suggestions dropdown uses [Blueprint's](https://github.com/palantir/blueprint) Menu and MenuItem components. 💙

### Usage
#### Example
Inside your react component.
```
<FuzzySelect
	haystack={['Kuba', 'Jen']}
	sort={true}
	onSelect={(name) => alert(name)}
>
	<input />
</FuzzySelect>
```

#### Properties

---
**haystack** *(type: `Array`)*

Array of objects or strings containing the search list.

---
**field** *(type: `string`)*

A name of the property to use for searching in `haystack` objects.  
Required if `haystack` is an array of objects, useless otherwise.

---
**caseSensitive** *(type: `bool`, default: `false`)*

Indicates whether comparisons should be case sensitive.

---
**sort** *(type: `bool`, default: `false`)*

Indicates whether results will sort by best match.

---
**onSelect(needle)** *(type: `function`, required)*

A function to perform when user selects an option.  
`needle` is a selected option out of `haystack`.

---
**onInput(input)** *(type: `function`)*

A function to perform when user inputs a text.

---
**onSuggestions(suggestions)** *(type: `function`)*

A function to perform when user inputs a text.

---
**onFocus()** *(type: `function`)*

A function to perform when user focuses an input.

---
**onBlur()** *(type: `function`)*

A function to perform when user clicks outside the input.

---
**children** (type: `element`)
An element to use as input.

### Build
`npm run build`

### Test
`npm run test`

### License
[MIT](LICENSE)

### Issues
Use [GitHub](https://github.com/Kuba77/blueprint-fuzzy-select/issues) to report all issues.

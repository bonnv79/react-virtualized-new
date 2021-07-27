## VirtualizedSelect

`VirtualizedSelect` extend from `ReactSelect`.

### Prop Types

References [react-select](https://github.com/JedWatson/react-select/)

### Examples

```jsx
import 'react-virtualized-new/styles.css';
import {VirtualizedSelect} from 'react-virtualized-new';

const options = [{
  {
    value: '1',
    label: 'Name 1'
  },
  {
    value: '2',
    label: 'Name 2'
  }
}];

const [value, setValue] = React.useState('');

const onChange = (val) => setValue(val);

function render() {
  return (
    <VirtualizedSelect
      options={options}
      value={value}
      onChange={onChange}
      valueKey="value"
      labelKey="label"
      isClearable
      isSearchable
    />
  );
}
```

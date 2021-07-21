## MultiGridTable

`MultiGridTable` extend from `MultiGrid`.

### Prop Types

| Property                    | Type                    | Required? | Description                                                                                                                                                                   |
| :-------------------------- | :---------------------- | :-------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| rows                        | array                   |   true    | data of `Grid`                                                                                                                                                                |
| columns                     | array                   |   true    | columns of `Grid`. `column item`: `{width: number, label: string, dataKey: string, sort: boolean, align: enum<left/right/center>, render: (value, rowData, rowIndex) => {} }` |
| rowKey                      | string                  |           | key of `Grid`. rowKey used to get value by column key. Default is `id`                                                                                                        |
| value                       | string, number or array |           | value of `Grid`. value is string/number when multiple is true and value is array when multiple is false. Default is ''                                                        |
| multiple                    | boolean                 |           | mode of `Grid`. Default is false.                                                                                                                                             |
| classes                     | object                  |           | classes of `Grid`. Please pass all the classes in the MultiGridTable.module.css file into the component                                                                       |
| classNameCell               | string or Function      |           | className off cell `Grid`. If className is function `(id, rowData, rowIndex) => {}`                                                                                           |
| onHeaderRowClick            | Function                |           | Handle onClick `Grid` header: `({ sortBy, sortDirection }) => {}`                                                                                                             |
| onScroll                    | Function                |           | Handle onScroll `Grid`: `({ clientHeight, clientWidth, scrollHeight, scrollLeft, scrollTop, scrollWidth }) => {}`                                                             |
| onRowClick                  | Function                |           | Handle onClick a cell. `Grid`.: `(value: string/number/array, rowData: object, rowIndex: number, columnKey: string, event: object): void`                                     |
| classNameBottomLeftGrid     | string                  |           | Optional custom className to attach to bottom-left `Grid` element.                                                                                                            |
| classNameBottomRightGrid    | string                  |           | Optional custom className to attach to bottom-right `Grid` element.                                                                                                           |
| classNameTopLeftGrid        | string                  |           | Optional custom className to attach to top-left `Grid` element.                                                                                                               |
| classNameTopRightGrid       | string                  |           | Optional custom className to attach to top-right `Grid` element.                                                                                                              |
| enableFixedColumnScroll     | boolean                 |           | Fixed column can be actively scrolled; disabled by default                                                                                                                    |
| enableFixedRowScroll        | boolean                 |           | Fixed row can be actively scrolled; disabled by default                                                                                                                       |
| fixedColumnCount            | number                  |           | Number of fixed columns; defaults to `0`                                                                                                                                      |
| fixedRowCount               | number                  |           | Number of fixed rows; defaults to `0`                                                                                                                                         |
| onScrollbarPresenceChange   | Function                |           | Called whenever a horizontal or vertical scrollbar is added or removed from the bottom, right `Grid`.: `({ horizontal: boolean, size: number, vertical: boolean }): void`     |
| style                       | object                  |           | Optional custom inline style to attach to root `MultiGrid` element.                                                                                                           |
| styleBottomLeftGrid         | object                  |           | Optional custom inline style to attach to bottom-left `Grid` element.                                                                                                         |
| styleBottomRightGrid        | object                  |           | Optional custom inline style to attach to bottom-right `Grid` element.                                                                                                        |
| styleTopLeftGrid            | object                  |           | Optional custom inline style to attach to top-left `Grid` element.                                                                                                            |
| styleTopRightGrid           | object                  |           | Optional custom inline style to attach to top-right `Grid` element.                                                                                                           |
| hideTopRightGridScrollbar   | boolean                 |           | Optional hides top-right `Grid` scrollbar by adding an additional wrapper. Only useful if `enableFixedRowScroll` is set to `true`                                             |
| hideBottomLeftGridScrollbar | boolean                 |           | Optional hides bottom-left `Grid` scrollbar by adding an additional wrapper. Only useful if `enableFixedColumnScroll` is set to `true`                                        |

### Examples

```jsx
import 'react-virtualized-new/styles.css';
import {MultiGridTable} from 'react-virtualized-new';

const rows = [{
  {
    id: '1',
    name: 'Name 1'
  },
  {
    id: '2',
    name: 'Name 2'
  }
}];

const columns = [
  {
    width: 50,
    label: '#',
    dataKey: 'index',
    align: 'center',
    render: (value, rowData, rowIndex) => rowIndex + 1,
  },
  {
    width: 50,
    label: 'Id',
    dataKey: 'id',
    sort: true,
    align: 'center',
  },
  {
    width: 50,
    label: 'Name',
    dataKey: 'name',
    sort: true,
    align: 'left',
  }
];

const value = '';

const onRowClick = (value, rowData, rowIndex, columnKey, event) => {};

const classNameCell = (id, rowData, rowIndex) => {};

const onHeaderRowClick = ({sortBy, sortDirection}) => {};

const onScroll = ({clientHeight, clientWidth, scrollHeight, scrollLeft, scrollTop, scrollWidth}) => {};

function render() {
  return (
    <MultiGridTable
      rows={rows}
      columns={columns}
      value={value}
      multiple={false}
      classNameCell={classNameCell}
      onRowClick={onRowClick}
      onHeaderRowClick={onHeaderRowClick}
      onScroll={onScroll}
    />
  );
}
```

/** @flow */
import React from 'react';
import PropTypes from 'prop-types';
import AutoSizer from '../AutoSizer';
import _orderBy from 'lodash/orderBy';
import _keyBy from 'lodash/keyBy';
import _isEmpty from 'lodash/isEmpty';
import _slice from 'lodash/slice';
import _map from 'lodash/map';
import RefMultiGrid from './RefMultiGrid';
import clsx from 'clsx';
import {
  STYLE,
  STYLE_BOTTOM_LEFT_GRID,
  STYLE_TOP_LEFT_GRID,
  STYLE_TOP_RIGHT_GRID,
  SORT_DIRECTIONS,
  DEFAULT_COLUMN_WIDTH,
  SCROLLBAR_WIDTH,
  STYLE_BOTTOM_RIGHT_GRID,
  MULTIPLE_SHIFT_MODE,
} from './constants';

const getMapColumns = columns => {
  const newColumns = [];
  let totalWidth = 0;

  columns.forEach((col, index) => {
    let {width} = col;
    width = Number(width) || DEFAULT_COLUMN_WIDTH;
    newColumns[index] = {
      ...col,
      width,
    };
    totalWidth += width;
  });

  newColumns.forEach((col, index) => {
    const {width} = col;
    newColumns[index].percent = width / totalWidth;
  });

  return newColumns;
};

const getRows = (rows, sortBy, sortDirection, sorter) => {
  if (!sortBy || typeof sorter !== 'function') {
    return rows;
  }
  return sorter(rows, sortBy, sortDirection);
};

const getValue = (multiple, value) => {
  return multiple ? _keyBy(value) : value;
};

class MultiGridTable extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    const {
      columns,
      rows,
      sortBy,
      sortDirection,
      sorter,
      multiple,
      value,
      fixedColumnCount,
    } = props;
    this.state = {
      originalColumns: columns,
      columns: getMapColumns(columns),
      originalRows: rows,
      rows: getRows(rows, sortBy, sortDirection, sorter),
      originalValue: value,
      value: getValue(multiple, value),
      prevSortBy: sortBy,
      sortBy,
      prevSortDirection: sortDirection,
      sortDirection,
      hover: '',
      prevWidth: 0,
      prevFixedColumnCount: fixedColumnCount,
      prevColumns: columns,
      alignClassName: {
        right: this.getClassName('ReactVirtualized__MultiGridTable__Right'),
        center: this.getClassName('ReactVirtualized__MultiGridTable__Center'),
      },
      shiftIndex: null,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const newState = {};
    let {sortBy, sortDirection} = state;

    if (props.sortBy !== state.prevSortBy) {
      newState.sortBy = props.sortBy;
      newState.prevSortBy = props.sortBy;
      sortBy = props.sortBy;
      newState.shiftIndex = null;
    }

    if (props.sortDirection !== state.prevSortDirection) {
      newState.sortDirection = props.sortDirection;
      newState.prevSortDirection = props.sortDirection;
      sortDirection = props.sortDirection;
      newState.shiftIndex = null;
    }

    if (props.columns !== state.originalColumns) {
      newState.columns = getMapColumns(props.columns);
      newState.originalColumns = props.columns;
    }

    if (props.rows !== state.originalRows) {
      newState.rows = getRows(props.rows, sortBy, sortDirection, props.sorter);
      newState.originalRows = props.rows;
      newState.shiftIndex = null;
    }

    if (props.value !== state.originalValue) {
      newState.value = getValue(props.multiple, props.value);
      newState.originalValue = props.value;
    }

    return newState;
  }

  getClassName = className => {
    const {classes} = this.props;
    return clsx([className, classes[className]]);
  };

  setShiftIndex = shiftIndex => {
    this.setState({
      shiftIndex,
    });
  };

  changeSort = sortBy => () => {
    const {onHeaderRowClick, sorter} = this.props;
    const {
      sortBy: prevSortBy,
      sortDirection: prevSortDirection,
      originalRows,
      shiftIndex,
    } = this.state;
    let sortDirection = SORT_DIRECTIONS.ASC;
    let reset = false;

    if (sortBy === prevSortBy) {
      if (prevSortDirection === SORT_DIRECTIONS.ASC) {
        sortDirection = SORT_DIRECTIONS.DESC;
      } else {
        reset = true;
      }
    }
    let currentSortBy = sortBy;
    let currentSortDirection = sortDirection;

    if (reset) {
      currentSortBy = '';
      currentSortDirection = '';
    }

    this.setState({
      sortBy: currentSortBy,
      sortDirection: currentSortDirection,
      rows: getRows(originalRows, currentSortBy, currentSortDirection, sorter),
    });

    onHeaderRowClick({
      sortBy: currentSortBy,
      sortDirection: currentSortDirection,
    });

    if (shiftIndex !== null) {
      this.setShiftIndex(null);
    }
  };

  handleMultiple = (value, id) => {
    let newValue = {...value};
    if (newValue[id]) {
      delete newValue[id];
    } else {
      newValue[id] = id;
    }
    return newValue;
  };

  handleMultipleShift = (value, index, rowKey, id, event) => {
    let newValue = {...value};
    const {shiftIndex} = this.state;
    if (event.shiftKey && shiftIndex !== null) {
      const {rows} = this.state;
      const min = Math.min(shiftIndex, index);
      const max = Math.max(shiftIndex, index) + 1;
      newValue = _map(_slice(rows, min, max), rowKey);
    } else if (event.ctrlKey) {
      this.setShiftIndex(index);
      newValue = this.handleMultiple(newValue, id);
    } else {
      this.setShiftIndex(index);
      newValue = {[id]: id};
    }

    return newValue;
  };

  onRowClick = (rowData, dataKey, index) => event => {
    const {onRowClick, rowKey, multiple} = this.props;
    const id = rowData[rowKey];
    let newValue = id;

    if (multiple) {
      const {value} = this.state;
      newValue = typeof value === 'object' ? value : {};

      if (multiple === MULTIPLE_SHIFT_MODE) {
        newValue = this.handleMultipleShift(newValue, index, rowKey, id, event);
      } else {
        newValue = this.handleMultiple(newValue, id);
      }

      newValue = Array.isArray(newValue) ? newValue : _map(newValue);
    }

    onRowClick(newValue, rowData, index, dataKey, event); // event={ shiftKey: bool, ctrlKey: bool }
  };

  onHoverCell = rowIndex => () => {
    this.setState({
      hover: rowIndex,
    });
  };

  headerCellRenderer = ({key, columnIndex, style}) => {
    const {columns, sortBy, sortDirection, alignClassName} = this.state;
    const {dataKey, label, sort, align} = columns[columnIndex];
    const isSort = sortBy === dataKey;
    const ascSort = sortDirection === SORT_DIRECTIONS.ASC;

    const sortByClass = this.getClassName(
      'ReactVirtualized__MultiGridTable__SortBy',
    );
    const ascSortClass = this.getClassName(
      'ReactVirtualized__MultiGridTable__AscSort',
    );
    const descSortClass = this.getClassName(
      'ReactVirtualized__MultiGridTable__DescSort',
    );
    const className = {};

    if (align && align !== 'left') {
      className[alignClassName[align]] = true;
    }

    const classNameLabel = {
      [sortByClass]: sort,
      [ascSortClass]: isSort && ascSort,
      [descSortClass]: isSort && !ascSort,
    };

    return (
      <div
        key={key}
        className={clsx(
          this.getClassName('ReactVirtualized__MultiGridTable__Cell'),
          this.getClassName('ReactVirtualized__MultiGridTable__HeaderCell'),
          className,
        )}
        style={style}>
        <span
          tabIndex="0"
          role="button"
          aria-pressed="false"
          title={label}
          className={clsx(
            this.getClassName(
              'ReactVirtualized__MultiGridTable__NonePointerEvents',
            ),
            classNameLabel,
          )}
          onClick={this.changeSort(dataKey)}>
          {label}
        </span>
      </div>
    );
  };

  cellRenderer = ({key, columnIndex, rowIndex, style}) => {
    if (rowIndex === 0) {
      return this.headerCellRenderer({key, columnIndex, style, rowIndex});
    }
    const {rowKey, multiple, classNameCell} = this.props;
    const {rows, columns, hover, value, alignClassName} = this.state;
    if (_isEmpty(rows)) {
      return null;
    }
    const index = rowIndex - 1;
    const {dataKey, align, render} = columns[columnIndex];
    const rowData = rows[index];
    const label = rowData[dataKey] || '';
    const id = rowData[rowKey];
    const selected = value && multiple ? value[id] : value === id;

    const cellHoverClass = this.getClassName(
      'ReactVirtualized__MultiGridTable__CellHover',
    );
    const cellSelectedClass = this.getClassName(
      'ReactVirtualized__MultiGridTable__CellSelected',
    );

    const className = {
      [cellHoverClass]: hover === rowIndex,
      [cellSelectedClass]: selected,
    };

    if (align && align !== 'left') {
      className[alignClassName[align]] = true;
    }

    let classCell = classNameCell;
    if (classCell) {
      if (typeof classCell === 'function') {
        classCell = classCell(id, rowData, rowIndex);
      }
      className[classCell] = true;
    }

    let component = <span title={label}>{label}</span>;

    if (render) {
      component = render(label, rowData, index);
      if (typeof component !== 'object') {
        component = <span title={component}>{component}</span>;
      }
    }

    return (
      <div
        tabIndex="0"
        role="button"
        aria-pressed="false"
        key={key}
        className={clsx(
          this.getClassName('ReactVirtualized__MultiGridTable__Cell'),
          className,
        )}
        style={style}
        onClick={this.onRowClick(rowData, dataKey, index)}
        onMouseEnter={this.onHoverCell(rowIndex)}
        onMouseLeave={this.onHoverCell(null)}>
        {component}
      </div>
    );
  };

  getColumnWidth = gridWidth => ({index}) => {
    const {columns} = this.state;
    const {width, percent} = columns[index];

    return Math.max((gridWidth - SCROLLBAR_WIDTH) * percent, width);
  };

  setPrevWidth = width => {
    this.setState({
      prevWidth: width,
    });
  };

  setPrevFixedColumnCount = count => {
    this.setState({
      prevFixedColumnCount: count,
    });
  };

  setPrevColumns = columns => {
    this.setState({
      prevColumns: columns,
    });
  };

  render() {
    const {fixedRowCount, ...props} = this.props;
    const {
      rows,
      columns,
      prevWidth,
      prevFixedColumnCount,
      prevColumns,
    } = this.state;

    return (
      <AutoSizer>
        {({width, height}) => (
          <RefMultiGrid
            height={height}
            width={width}
            fixedRowCount={fixedRowCount + 1}
            columnCount={columns.length}
            columnWidth={this.getColumnWidth(width)}
            rowCount={rows.length + 1}
            cellRenderer={this.cellRenderer}
            prevWidth={prevWidth}
            setPrevWidth={this.setPrevWidth}
            prevFixedColumnCount={prevFixedColumnCount}
            setPrevFixedColumnCount={this.setPrevFixedColumnCount}
            prevColumns={prevColumns}
            setPrevColumns={this.setPrevColumns}
            {...props}
          />
        )}
      </AutoSizer>
    );
  }
}

MultiGridTable.defaultProps = {
  enableFixedColumnScroll: true,
  enableFixedRowScroll: true,
  hideTopRightGridScrollbar: true,
  hideBottomLeftGridScrollbar: true,
  style: STYLE,
  styleBottomLeftGrid: STYLE_BOTTOM_LEFT_GRID,
  styleTopLeftGrid: STYLE_TOP_LEFT_GRID,
  styleTopRightGrid: STYLE_TOP_RIGHT_GRID,
  styleBottomRightGrid: STYLE_BOTTOM_RIGHT_GRID,
  classes: {},
  fixedColumnCount: 0,
  fixedRowCount: 0,
  scrollToColumn: 0,
  scrollToRow: 0,
  rowHeight: 40,
  rowKey: 'id',
  value: '',
  multiple: false,
  classNameCell: '',
  onRowClick: () => {},
  onHeaderRowClick: () => {},
  onScroll: () => {},
  sorter: (rows, sortBy, sortDirection) => {
    return _orderBy(rows, [sortBy], [sortDirection]);
  },
  sortBy: '',
  sortDirection: '',
};

MultiGridTable.propTypes = {
  enableFixedColumnScroll: PropTypes.bool,
  enableFixedRowScroll: PropTypes.bool,
  hideTopRightGridScrollbar: PropTypes.bool,
  hideBottomLeftGridScrollbar: PropTypes.bool,
  style: PropTypes.instanceOf(Object),
  styleBottomLeftGrid: PropTypes.instanceOf(Object),
  styleTopLeftGrid: PropTypes.instanceOf(Object),
  styleTopRightGrid: PropTypes.instanceOf(Object),
  styleBottomRightGrid: PropTypes.instanceOf(Object),
  classes: PropTypes.instanceOf(Object),
  rows: PropTypes.arrayOf(Object).isRequired,
  columns: PropTypes.arrayOf(Object).isRequired,
  fixedColumnCount: PropTypes.number,
  fixedRowCount: PropTypes.number,
  scrollToColumn: PropTypes.number,
  scrollToRow: PropTypes.number,
  rowHeight: PropTypes.number,
  rowKey: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Array),
  ]),
  multiple: PropTypes.oneOf([true, false, MULTIPLE_SHIFT_MODE]),
  classNameCell: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  onRowClick: PropTypes.func,
  onHeaderRowClick: PropTypes.func,
  onScroll: PropTypes.func,
  sorter: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
  sortBy: PropTypes.string,
  sortDirection: PropTypes.oneOf([
    ...Object.values(SORT_DIRECTIONS),
    '',
    null,
    false,
  ]),
};

export default MultiGridTable;

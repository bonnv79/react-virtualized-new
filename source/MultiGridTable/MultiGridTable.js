/** @flow */
import React from 'react';
import PropTypes from 'prop-types';
import AutoSizer from '../AutoSizer';
import _orderBy from 'lodash/orderBy';
import _keyBy from 'lodash/keyBy';
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

const getRows = (rows, sortBy, sortDirection) => {
  if (!sortBy) {
    return rows;
  }
  return _orderBy(rows, [sortBy], [sortDirection]);
};

class MultiGridTable extends React.Component {
  state = {
    originalColumns: [],
    columns: [],
    originalRows: [],
    rows: [],
    originalValue: '',
    value: '',
    sortBy: '',
    sortDirection: '',
    hover: '',
    prevWidth: 0,
    prevFixedColumnCount: 0,
    prevColumns: [],
  };

  static getDerivedStateFromProps(props, state) {
    const newState = {};

    if (props.columns !== state.originalColumns) {
      newState.columns = getMapColumns(props.columns);
      newState.originalColumns = props.columns;
    }

    if (props.rows !== state.originalRows) {
      newState.rows = getRows(props.rows, state.sortBy, state.sortDirection);
      newState.originalRows = props.rows;
    }

    if (props.value !== state.originalValue) {
      newState.value = props.multiple ? _keyBy(props.value) : props.value;
      newState.originalValue = props.value;
    }

    return newState;
  }

  changeSort = sortBy => () => {
    const {
      sortBy: prevSortBy,
      sortDirection: prevSortDirection,
      rows,
      originalRows,
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
    let currentRows = getRows(rows, sortBy, sortDirection);

    if (reset) {
      currentSortBy = '';
      currentSortDirection = '';
      currentRows = originalRows;
    }

    this.setState({
      sortBy: currentSortBy,
      sortDirection: currentSortDirection,
      rows: currentRows,
    });
  };

  onRowClick = (rowData, dataKey, index) => event => {
    const {onRowClick, rowKey, multiple} = this.props;
    const id = rowData[rowKey];
    let newValue = id;

    if (multiple) {
      const {value} = this.state;
      newValue = typeof value === 'object' ? value : {};

      if (newValue[id]) {
        delete newValue[id];
      } else {
        newValue[id] = id;
      }

      newValue = Object.values(newValue);
    }

    onRowClick(newValue, rowData, index, dataKey, event); // event={ shiftKey: bool, ctrlKey: bool }
  };

  onHoverCell = rowIndex => () => {
    this.setState({
      hover: rowIndex,
    });
  };

  headerCellRenderer = ({key, columnIndex, style}) => {
    const {classes} = this.props;
    const {columns, sortBy, sortDirection} = this.state;
    const {dataKey, label, sort} = columns[columnIndex];
    const isSort = sortBy === dataKey;
    const ascSort = sortDirection === SORT_DIRECTIONS.ASC;
    const sortByClass = clsx(
      'ReactVirtualized__MultiGridTable__SortBy',
      classes.ReactVirtualized__MultiGridTable__SortBy,
    );

    const ascSortClass = clsx(
      'ReactVirtualized__MultiGridTable__AscSort',
      classes.ReactVirtualized__MultiGridTable__AscSort,
    );

    const descSortClass = clsx(
      'ReactVirtualized__MultiGridTable__DescSort',
      classes.ReactVirtualized__MultiGridTable__DescSort,
    );

    const className = {
      [sortByClass]: sort,
      [ascSortClass]: isSort && ascSort,
      [descSortClass]: isSort && !ascSort,
    };

    return (
      <div
        key={key}
        className={clsx(
          'ReactVirtualized__MultiGridTable__Cell',
          classes.ReactVirtualized__MultiGridTable__Cell,
        )}
        style={style}>
        <span
          tabIndex="0"
          role="button"
          aria-pressed="false"
          title={label}
          className={clsx(
            'ReactVirtualized__MultiGridTable__NonePointerEvents',
            classes.ReactVirtualized__MultiGridTable__NonePointerEvents,
            className,
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

    const {rowKey, multiple, classes} = this.props;
    const {rows, columns, hover, value} = this.state;
    const {dataKey, align} = columns[columnIndex];
    const rowData = rows[rowIndex - 1];
    const label = rowData[dataKey];
    const id = rowData[rowKey];
    const selected = value && multiple ? value[id] : value === id;

    const alignClassName = {
      right: clsx(
        'ReactVirtualized__MultiGridTable__Right',
        classes.ReactVirtualized__MultiGridTable__Right,
      ),
      center: clsx(
        'ReactVirtualized__MultiGridTable__Center',
        classes.ReactVirtualized__MultiGridTable__Center,
      ),
    };

    const cellHoverClass = clsx(
      'ReactVirtualized__MultiGridTable__CellHover',
      classes.ReactVirtualized__MultiGridTable__CellHover,
    );

    const cellSelectedClass = clsx(
      'ReactVirtualized__MultiGridTable__CellSelected',
      classes.ReactVirtualized__MultiGridTable__CellSelected,
    );

    const className = {
      [cellHoverClass]: hover === rowIndex,
      [cellSelectedClass]: selected,
      [alignClassName[align]]: !!align,
    };

    return (
      <div
        tabIndex="0"
        role="button"
        aria-pressed="false"
        key={key}
        className={clsx(
          'ReactVirtualized__MultiGridTable__Cell',
          classes.ReactVirtualized__MultiGridTable__Cell,
          className,
        )}
        style={style}
        onClick={this.onRowClick(rowData, dataKey, rowIndex)}
        onMouseEnter={this.onHoverCell(rowIndex)}>
        <span title={label}>{label}</span>
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
            columns={columns}
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
  classes: {},
  fixedColumnCount: 0,
  fixedRowCount: 0,
  scrollToColumn: 0,
  scrollToRow: 0,
  rowHeight: 40,
  onRowClick: () => {},
  rowKey: 'id',
  value: '',
  multiple: false,
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
  classes: PropTypes.instanceOf(Object),
  rows: PropTypes.arrayOf(Object).isRequired,
  columns: PropTypes.arrayOf(Object).isRequired,
  fixedColumnCount: PropTypes.number,
  fixedRowCount: PropTypes.number,
  scrollToColumn: PropTypes.number,
  scrollToRow: PropTypes.number,
  onRowClick: PropTypes.func,
  rowKey: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Array),
  ]),
  multiple: PropTypes.bool,
};

export default MultiGridTable;

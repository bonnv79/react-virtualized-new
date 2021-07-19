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
  OPPOSITION_SORT_DIRECTIONS,
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
    prevColumns: [],
    columns: [],
    prevRows: [],
    rows: [],
    prevValue: '',
    value: '',
    sortBy: '',
    sortDirection: '',
    hover: '',
    prevWidth: 0,
    prevFixedColumnCount: 0,
    prevColumnsBk: [],
  };

  static getDerivedStateFromProps(props, state) {
    const newState = {};

    if (props.columns !== state.prevColumns) {
      newState.columns = getMapColumns(props.columns);
      newState.prevColumns = props.columns;
    }

    if (props.rows !== state.prevRows) {
      newState.rows = getRows(props.rows, state.sortBy, state.sortDirection);
      newState.prevRows = props.rows;
    }

    if (props.value !== state.prevValue) {
      newState.value = props.multiple ? _keyBy(props.value) : props.value;
      newState.prevValue = props.value;
    }

    return newState;
  }

  changeSort = sortBy => () => {
    const {
      sortBy: prevSortBy,
      sortDirection: prevSortDirection,
      rows,
    } = this.state;
    let sortDirection = SORT_DIRECTIONS.ASC;

    if (sortBy === prevSortBy) {
      sortDirection = OPPOSITION_SORT_DIRECTIONS[prevSortDirection];
    }

    this.setState({
      sortBy,
      sortDirection,
      rows: getRows(rows, sortBy, sortDirection),
    });
  };

  onRowClick = (rowData, dataKey, index) => () => {
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

    onRowClick(newValue, rowData, index, dataKey);
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

  setPrevColumnsBk = columns => {
    this.setState({
      prevColumnsBk: columns,
    });
  };

  render() {
    const {fixedRowCount, ...props} = this.props;
    const {
      rows,
      columns,
      prevWidth,
      prevFixedColumnCount,
      prevColumnsBk,
    } = this.state;

    return (
      <AutoSizer>
        {({width, height}) => (
          <RefMultiGrid
            height={height}
            width={width}
            enableFixedColumnScroll
            enableFixedRowScroll
            hideTopRightGridScrollbar
            hideBottomLeftGridScrollbar
            style={STYLE}
            styleBottomLeftGrid={STYLE_BOTTOM_LEFT_GRID}
            styleTopLeftGrid={STYLE_TOP_LEFT_GRID}
            styleTopRightGrid={STYLE_TOP_RIGHT_GRID}
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
            prevColumnsBk={prevColumnsBk}
            setPrevColumnsBk={this.setPrevColumnsBk}
            {...props}
          />
        )}
      </AutoSizer>
    );
  }
}

MultiGridTable.defaultProps = {
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

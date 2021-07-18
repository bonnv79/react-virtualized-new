/** @flow */
import React from 'react';
import PropTypes from 'prop-types';
import AutoSizer from '../AutoSizer';
import _orderBy from 'lodash/orderBy';
import RefMultiGrid from './RefMultiGrid';
import styles from './styles.css';
import clsx from 'clsx';
import {
  STYLE,
  STYLE_BOTTOM_LEFT_GRID,
  STYLE_TOP_LEFT_GRID,
  STYLE_TOP_RIGHT_GRID,
  OPPOSITION_ORDER_BY,
  ORDER_BY,
  DEFAULT_COLUMN_WIDTH,
} from './constants';

const getMapColumns = columns => {
  let totalWidth = 0;

  columns.forEach((col, index) => {
    let {width} = col;
    width = Number(width) || DEFAULT_COLUMN_WIDTH;
    columns[index].width = width;
    totalWidth += width;
  });

  columns.forEach((col, index) => {
    const {width} = col;
    columns[index].percent = Math.round((width / totalWidth) * 100) / 100;
  });

  return columns;
};

class MultiGridTable extends React.Component {
  state = {
    columns: [],
    prevRows: [],
    rows: [],
    sortBy: '',
    orderBy: '',
    hover: '',
    prevWidth: 0,
    prevFixedColumnCount: 0,
  };

  static getDerivedStateFromProps(props, state) {
    if (props.columns !== state.columns || props.rows !== state.prevRows) {
      return {
        columns: getMapColumns(props.columns),
        prevRows: props.rows,
        rows: props.rows,
      };
    }
    return null;
  }

  changeSort = sortBy => () => {
    const {sortBy: prevSortBy, orderBy: prevOrderBy, rows} = this.state;
    let orderBy = ORDER_BY.ASC;

    if (sortBy === prevSortBy) {
      orderBy = OPPOSITION_ORDER_BY[prevOrderBy];
    }

    this.setState({
      sortBy,
      orderBy,
      rows: _orderBy(rows, [sortBy], [orderBy]),
    });
  };

  onRowClick = (rowData, dataKey, index) => () => {
    const {onRowClick, rowKey} = this.props;
    const value = rowData[rowKey];
    onRowClick(value, rowData, index, dataKey);
  };

  onHoverCell = rowIndex => () => {
    this.setState({
      hover: rowIndex,
    });
  };

  headerCellRenderer = ({key, columnIndex, style}) => {
    const {columns, sortBy, orderBy} = this.state;
    const {dataKey, label, sort} = columns[columnIndex];
    const isSort = sortBy === dataKey;
    const ascSort = orderBy === ORDER_BY.ASC;
    const className = {
      [styles.sortBy]: sort,
      [styles.ascSort]: isSort && ascSort,
      [styles.descSort]: isSort && !ascSort,
    };

    return (
      <div key={key} className={styles.cell} style={style}>
        <span
          tabIndex="0"
          role="button"
          aria-pressed="false"
          title={label}
          className={clsx(styles.nonePointerEvents, className)}
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

    const {value, rowKey} = this.props;
    const {rows, columns, hover} = this.state;
    const {dataKey, align} = columns[columnIndex];
    const rowData = rows[rowIndex - 1];
    const label = rowData[dataKey];
    const id = rowData[rowKey];
    const className = {
      [styles.cellHover]: hover === rowIndex,
      [styles.cellSelected]: value === id,
      [styles[align]]: !!align,
    };

    return (
      <div
        tabIndex="0"
        role="button"
        aria-pressed="false"
        key={key}
        className={clsx(styles.cell, className)}
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

    return Math.max(gridWidth * percent, width);
  };

  setPrevWidth = width => {
    this.setState({
      prevWidth: width,
    });
  };

  setPrevFixedColumnCount = value => {
    this.setState({
      prevFixedColumnCount: value,
    });
  };

  render() {
    const {fixedRowCount, ...props} = this.props;
    const {rows, columns, prevWidth, prevFixedColumnCount} = this.state;

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
            {...props}
          />
        )}
      </AutoSizer>
    );
  }
}

MultiGridTable.defaultProps = {
  fixedColumnCount: 0,
  fixedRowCount: 0,
  scrollToColumn: 0,
  scrollToRow: 0,
  rowHeight: 40,
  onRowClick: () => {},
  rowKey: 'id',
  value: '',
};

MultiGridTable.propTypes = {
  rows: PropTypes.arrayOf(Object).isRequired,
  columns: PropTypes.arrayOf(Object).isRequired,
  fixedColumnCount: PropTypes.number,
  fixedRowCount: PropTypes.number,
  scrollToColumn: PropTypes.number,
  scrollToRow: PropTypes.number,
  onRowClick: PropTypes.func,
  rowKey: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default MultiGridTable;

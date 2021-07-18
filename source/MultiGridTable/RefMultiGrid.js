import React from 'react';
import PropTypes from 'prop-types';
import MultiGrid from '../MultiGrid';

class RefMultiGrid extends React.Component {
  constructor(props) {
    super(props);
    this.gridRef = React.createRef();
  }

  componentDidUpdate() {
    const {
      prevWidth,
      width,
      setPrevWidth,
      prevFixedColumnCount,
      fixedColumnCount,
      setPrevFixedColumnCount,
      prevColumnsBk,
      columns,
      setPrevColumnsBk,
    } = this.props;
    let isResize = false;

    if (prevWidth !== width) {
      setPrevWidth(width);
      isResize = true;
    }

    if (prevFixedColumnCount !== fixedColumnCount) {
      setPrevFixedColumnCount(fixedColumnCount);
      isResize = true;
    }

    if (prevColumnsBk !== columns) {
      setPrevColumnsBk(columns);
      isResize = true;
    }

    if (isResize) {
      this.resizeWidth();
    }
  }

  resizeWidth = () => {
    if (this.gridRef) {
      this.gridRef.recomputeGridSize();
    }
  };

  render() {
    return (
      <MultiGrid
        ref={ref => {
          this.gridRef = ref;
        }}
        {...this.props}
      />
    );
  }
}

RefMultiGrid.propTypes = {
  prevWidth: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  setPrevWidth: PropTypes.func.isRequired,
  prevFixedColumnCount: PropTypes.number.isRequired,
  fixedColumnCount: PropTypes.number.isRequired,
  setPrevFixedColumnCount: PropTypes.func.isRequired,
  prevColumnsBk: PropTypes.arrayOf(Object).isRequired,
  columns: PropTypes.arrayOf(Object).isRequired,
  setPrevColumnsBk: PropTypes.func.isRequired,
};

export default RefMultiGrid;

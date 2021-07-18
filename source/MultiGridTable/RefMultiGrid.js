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
    } = this.props;
    if (prevWidth !== width) {
      this.resizeWidth();
      setPrevWidth(width);
    }
    if (prevFixedColumnCount !== fixedColumnCount) {
      this.resizeWidth();
      setPrevFixedColumnCount(fixedColumnCount);
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
};

export default RefMultiGrid;

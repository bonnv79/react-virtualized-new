/* eslint-disable no-unused-vars */
/** @flow */
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import _toString from 'lodash/toString';
import _indexOf from 'lodash/indexOf';
import _keyBy from 'lodash/keyBy';
import AutoSizer from '../AutoSizer';
import List from '../List';
import clsx from 'clsx';

const makeDelaySearch = (delay = 200) => {
  let timeout = null;

  return callback => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(function() {
      callback();
    }, delay);
  };
};

let delaySearch = makeDelaySearch();

const search = (value, searchKey) => {
  const source = _toString(value).toLowerCase();
  const dif = _toString(searchKey).toLowerCase();
  return source.indexOf(dif) !== -1;
};

class VirtualizedSelect extends React.Component {
  constructor(props) {
    super(props);

    const {value, valueKey, isMulti} = props;

    this.state = {
      inputValue: '',
      searchKey: '',
      originalValue: value,
      objectValue: isMulti ? _keyBy(value, valueKey) : null,
    };

    this._renderMenu = this._renderMenu.bind(this);
    this._optionRenderer = this._optionRenderer.bind(this);
    this._setListRef = this._setListRef.bind(this);
    this._setSelectRef = this._setSelectRef.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.isMulti && props.value !== state.originalValue) {
      return {
        originalValue: props.value,
        objectValue: _keyBy(props.value, props.valueKey),
      };
    }
    return null;
  }

  onInputChange = value => {
    this.setState({
      inputValue: value,
    });
    delaySearch(() => {
      this.setState({
        searchKey: value,
      });
    });
  };

  getClassName = className => {
    const {classes} = this.props;
    return clsx(className, classes[className]);
  };

  _renderMenu(props) {
    const {selectOption, maxHeight, isMulti} = props;
    const {
      listProps,
      labelKey,
      valueKey,
      options: opts,
      value,
      optionRenderer,
      noOptionsMessage,
    } = this.props;
    const {searchKey, objectValue} = this.state;
    let options = opts;
    let focusedOptionIndex = 0;

    if (searchKey) {
      options = React.useMemo(() => {
        return options.filter(opt => search(opt[labelKey], searchKey));
      }, [options, searchKey]);
    }
    if (!isMulti && value) {
      focusedOptionIndex = _indexOf(options, value);
    }
    let _optionRenderer = this._optionRenderer;
    if (typeof optionRenderer === 'function') {
      _optionRenderer = optionRenderer;
    }

    function rowRenderer({key, index, style}) {
      const option = options[index];
      let selected = false;
      if (value) {
        const id = option[valueKey];
        selected = isMulti ? objectValue[id] : value === option;
      }
      return _optionRenderer({
        key,
        style,
        index,
        option,
        selectOption,
        valueKey,
        labelKey,
        value,
        selected,
      });
    }

    return options.length > 0 ? (
      <AutoSizer disableHeight>
        {({width}) => (
          <List
            className={this.getClassName('VirtualizedSelect__Grid')}
            height={maxHeight}
            ref={this._setListRef}
            rowCount={options.length}
            rowHeight={({index}) => {
              return this._getOptionHeight({
                option: options[index],
                index,
              });
            }}
            rowRenderer={rowRenderer}
            scrollToIndex={focusedOptionIndex}
            width={width}
            {...listProps}
          />
        )}
      </AutoSizer>
    ) : (
      <div className={this.getClassName('VirtualizedSelect__NoDataFound')}>
        {noOptionsMessage()}
      </div>
    );
  }

  _getOptionHeight({option, index}) {
    let {optionHeight} = this.props;
    if (optionHeight instanceof Function) {
      optionHeight = optionHeight({option, index});
    }
    return optionHeight;
  }

  /**
   *
   * @param {key, style, index, option, selectOption, valueKey, labelKey, value, selected} param
   * @returns
   */
  _optionRenderer({key, style, option, selectOption, labelKey, selected}) {
    const className = [this.getClassName('VirtualizedSelect__Option')];
    let events = {};
    const label = option[labelKey];

    if (selected) {
      className.push(this.getClassName('VirtualizedSelect__SelectedOption'));
    }

    if (option.disabled) {
      className.push(this.getClassName('VirtualizedSelect__DisabledOption'));
    }

    if (option.className) {
      className.push(option.className);
    }

    if (!option.disabled) {
      events = {
        onClick: () => selectOption(option),
      };
    }

    return (
      <div
        className={className.join(' ')}
        key={key}
        style={style}
        title={label}
        {...events}>
        {label}
      </div>
    );
  }

  _setListRef(ref) {
    this._listRef = ref;
  }

  _setSelectRef(ref) {
    this._selectRef = ref;
  }

  _getStyles() {
    const {styles, isSearchable} = this.props;
    return {
      singleValue: (provided, state) => {
        const opacity = state.isDisabled || isSearchable ? 0.5 : 1;
        const transition = 'opacity 300ms';
        return {
          ...provided,
          opacity,
          transition,
        };
      },
      valueContainer: (provided, state) => {
        return {
          ...provided,
          maxHeight: '70px',
          overflow: 'auto',
        };
      },
      ...styles,
    };
  }

  render() {
    const {
      options, // remove from props
      classes, // remove from props
      styles, // remove from props
      noOptionsMessage, // remove from props
      valueKey, // remove from props
      labelKey,
      isMulti,
      value,
      onChange,
      ...props
    } = this.props;
    const {inputValue} = this.state;

    return (
      <Select
        {...props}
        ref={this._setSelectRef}
        styles={this._getStyles()}
        components={{
          MenuList: this._renderMenu,
        }}
        value={value}
        onChange={onChange}
        isMulti={isMulti}
        closeMenuOnSelect={!isMulti}
        formatOptionLabel={option => option[labelKey]}
        onInputChange={this.onInputChange}
        inputValue={inputValue}
      />
    );
  }
}

VirtualizedSelect.defaultProps = {
  styles: {},
  classes: {},
  listProps: {},
  maxHeight: 50,
  optionHeight: 35,
  optionRenderer: null,
  options: [],
  valueKey: 'value',
  labelKey: 'label',
  value: '',
  onChange: () => {},
  isMulti: false,
  isClearable: false,
  isDisabled: false,
  isSearchable: false,
  menuIsOpen: undefined,
  noOptionsMessage: () => 'No Data Found',
};

VirtualizedSelect.propTypes = {
  styles: PropTypes.instanceOf(Object),
  classes: PropTypes.instanceOf(Object),
  listProps: PropTypes.object,
  maxHeight: PropTypes.number,
  optionHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  optionRenderer: PropTypes.func,
  options: PropTypes.arrayOf(Object),
  valueKey: PropTypes.string,
  labelKey: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.arrayOf(Object),
    PropTypes.instanceOf(Object),
  ]),
  onChange: PropTypes.func,
  isMulti: PropTypes.bool,
  isClearable: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isSearchable: PropTypes.bool,
  menuIsOpen: PropTypes.bool,
  noOptionsMessage: PropTypes.func,
};

export default VirtualizedSelect;

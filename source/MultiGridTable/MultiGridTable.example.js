/** @flow */
import * as React from 'react';
import clsx from 'clsx';
import {ContentBox} from '../demo/ContentBox';
import {LabeledInput, InputRow} from '../demo/LabeledInput';
import MultiGridTable from './MultiGridTable';
import styles from './MultiGridTable.example.css';

// Render mockup data
const sample = [
  ['Frozen yoghurt', 159, 6.0, 24, 4.0],
  ['Ice cream sandwich', 237, 9.0, 37, 4.3],
  ['Eclair', 262, 16.0, 24, 6.0],
  ['Cupcake', 305, 3.7, 67, 4.3],
  ['Gingerbread long long long long long long', 356, 16.0, 49, 3.9],
];

function createData(id, dessert, calories, fat, carbs, protein) {
  return {id, dessert, calories, fat, carbs, protein};
}

const rows = [];

for (let i = 1; i <= 1000; i += 1) {
  const randomSelection = sample[Math.floor(Math.random() * sample.length)];
  rows.push(createData(i, ...randomSelection));
}

// columns data
const columns = [
  {
    width: 50,
    label: 'Id',
    dataKey: 'id',
    sort: true,
    align: 'center', // left-right-center default left
  },
  {
    width: 300,
    label: 'Dessert',
    dataKey: 'dessert',
    sort: true,
    align: 'left',
  },
  {
    width: 120,
    label: 'Calories\u00A0(g)',
    dataKey: 'calories',
    sort: true,
    align: 'right',
  },
  {
    width: 120,
    label: 'Fat\u00A0(g)',
    dataKey: 'fat',
    sort: true,
    align: 'right',
  },
  {
    width: 120,
    label: 'Carbs\u00A0(g)',
    dataKey: 'carbs',
    sort: true,
    align: 'right',
  },
  {
    width: 120,
    label: 'Protein\u00A0(g)',
    dataKey: 'protein',
    sort: false,
    align: 'right',
  },
];

const Container = ({style, children, inline}) => {
  const className = {[styles.containerInline]: inline};
  return (
    <div style={style} className={clsx(styles.container, className)}>
      {children}
    </div>
  );
};

const FormLabel = ({style, label, children, inline}) => {
  const className = {[styles.formInline]: inline};
  return (
    <div className={clsx(styles.form, className)} style={style}>
      <div className={styles.label}>{label}</div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};

export default class MultiGridTableExample extends React.PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      fixedColumnCount: 0,
      fixedRowCount: 0,
      scrollToColumn: 0,
      scrollToRow: 0,
      value: '',
      rowData: {},
      index: '',
      dataKey: '',
    };

    this._onScrollToColumnChange = this._createEventHandler('scrollToColumn');
    this._onScrollToRowChange = this._createEventHandler('scrollToRow');
  }

  _createEventHandler(property, func) {
    return event => {
      let value = parseInt(event.target.value, 10) || 0;

      if (func) {
        value = func(value);
      }

      this.setState({
        [property]: value,
      });
    };
  }

  _createLabeledInput(property, eventHandler) {
    const value = this.state[property];

    return (
      <LabeledInput
        label={property}
        name={property}
        onChange={eventHandler}
        value={value}
      />
    );
  }

  _onRowClick = (value, rowData, index, dataKey) => {
    this.setState({
      value,
      rowData,
      index,
      dataKey,
    });
  };

  render() {
    const {
      fixedColumnCount,
      fixedRowCount,
      scrollToColumn,
      scrollToRow,
      value,
      rowData,
      index,
      dataKey,
    } = this.state;

    const checkFixedColumnCount = val => {
      return val > columns.length - 1 ? columns.length - 1 : val;
    };

    const checkFixedRowCount = val => {
      return val > rows.length - 1 ? rows.length - 1 : val;
    };

    return (
      <ContentBox>
        <InputRow>
          {this._createLabeledInput(
            'fixedColumnCount',
            this._createEventHandler('fixedColumnCount', checkFixedColumnCount),
          )}
          {this._createLabeledInput(
            'fixedRowCount',
            this._createEventHandler('fixedRowCount', checkFixedRowCount),
          )}
          {this._createLabeledInput(
            'scrollToColumn',
            this._onScrollToColumnChange,
          )}
          {this._createLabeledInput('scrollToRow', this._onScrollToRowChange)}
        </InputRow>

        <Container style={{marginTop: 5}}>
          <FormLabel label="value:" inline>
            {value}
          </FormLabel>
          <FormLabel label="rowData:" inline>
            <code>{JSON.stringify(rowData)}</code>
          </FormLabel>
          <FormLabel label="index:" inline>
            {index}
          </FormLabel>
          <FormLabel label="rowData:" inline>
            {dataKey}
          </FormLabel>
        </Container>

        <div style={{width: '100%', height: 360}}>
          <MultiGridTable
            rows={rows}
            columns={columns}
            fixedColumnCount={fixedColumnCount}
            fixedRowCount={fixedRowCount}
            scrollToColumn={scrollToColumn}
            scrollToRow={scrollToRow}
            onRowClick={this._onRowClick}
            value={value}
          />
        </div>
      </ContentBox>
    );
  }
}

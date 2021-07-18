export const STYLE = {
  border: '1px solid #ddd',
};

export const STYLE_BOTTOM_LEFT_GRID = {
  borderRight: '2px solid #aaa',
  backgroundColor: '#f7f7f7',
};

export const STYLE_TOP_LEFT_GRID = {
  borderBottom: '2px solid #aaa',
  borderRight: '2px solid #aaa',
  fontWeight: 'bold',
};

export const STYLE_TOP_RIGHT_GRID = {
  borderBottom: '2px solid #aaa',
  fontWeight: 'bold',
};

export const ORDER_BY = {
  ASC: 'asc',
  DESC: 'desc',
};

export const OPPOSITION_ORDER_BY = {
  [ORDER_BY.ASC]: ORDER_BY.DESC,
  [ORDER_BY.DESC]: ORDER_BY.ASC,
};

export const DEFAULT_COLUMN_WIDTH = 100;

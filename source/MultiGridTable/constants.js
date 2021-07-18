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

export const SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
};

export const OPPOSITION_SORT_DIRECTIONS = {
  [SORT_DIRECTIONS.ASC]: SORT_DIRECTIONS.DESC,
  [SORT_DIRECTIONS.DESC]: SORT_DIRECTIONS.ASC,
};

export const DEFAULT_COLUMN_WIDTH = 100;

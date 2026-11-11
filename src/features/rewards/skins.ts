/** Board themes. Each one sets the board colours in tokens.css (`:root[data-skin='…']`). */
export const SKINS = [
  { id: 'classic', price: 0, colors: { board: '#17573d', trace: '#a8652a', on: '#f5b417' } },
  { id: 'night', price: 150, colors: { board: '#142a4f', trace: '#5f7fae', on: '#4dd8ff' } },
  { id: 'candy', price: 200, colors: { board: '#4b2a6e', trace: '#c28ad6', on: '#ff7ac6' } },
  { id: 'gold', price: 300, colors: { board: '#1e1e1e', trace: '#8a6d2b', on: '#ffd84d' } },
] as const;

export type SkinId = (typeof SKINS)[number]['id'];

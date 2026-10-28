import { ColorPalette } from '../types';

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'luxora-core',
    name: 'LUXORA Midnight (Official)',
    bg: '#030407',
    surface: '#0A0D14',
    accent: '#D4FF24', // Acid Lime
    text: '#F5F7FF',
    secondaryText: '#9299AB',
    isDefault: true,
  },
  {
    id: 'cobalt-electric',
    name: 'Cobalt Studio',
    bg: '#050811',
    surface: '#0B1124',
    accent: '#1558C9', // Electric Cobalt
    text: '#F5F8FF',
    secondaryText: '#8FA1C7',
  },
  {
    id: 'monochrome-titanium',
    name: 'Titanium Slate',
    bg: '#090A0D',
    surface: '#12151C',
    accent: '#FFFFFF',
    text: '#F4F5F7',
    secondaryText: '#7E8594',
  },
  {
    id: 'emerald-carbon',
    name: 'Alpine Carbon',
    bg: '#030805',
    surface: '#07140B',
    accent: '#10B981',
    text: '#F0FDF4',
    secondaryText: '#86A391',
  },
  {
    id: 'obsidian-amber',
    name: 'Obsidian Bronze',
    bg: '#070503',
    surface: '#120D08',
    accent: '#F59E0B',
    text: '#FFFBEB',
    secondaryText: '#9E9283',
  },
];

export const DEFAULT_PALETTE = COLOR_PALETTES[0];

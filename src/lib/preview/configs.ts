import type { PreviewConfig } from './types'

/**
 * Product handle → PreviewConfig map
 *
 * To add a new product preview:
 * 1. Add the font file to /public/fonts/preview/
 * 2. Add a config entry here keyed by the product handle
 * 3. If the preview type is new, create a scene component for it
 */
const previewConfigs: Record<string, PreviewConfig> = {
  'attack-on-titan-custom-sign': {
    type: 'text-extrusion',
    font: '/fonts/preview/attack-on-titan.ttf',
    layers: [
      {
        color: '#111111',
        depth: 12,
        metalness: 0.1,
        roughness: 0.8,
        bevelEnabled: false,
        strokeWidth: 0.2,
      },
      {
        color: '#f5f5f5',
        depth: 1,
        metalness: 0.0,
        roughness: 0.5,
        offsetZ: 12,
        bevelEnabled: false,
      },
    ],
    camera: {
      position: [0, 3, 20],
      fov: 45,
      autoRotate: true,
      autoRotateSpeed: 1,
    },
    maxChars: 15,
    scale: 1,
    background: '#0a0a12',
  },

  'jujutsu-kaisen-custom-sign': {
    type: 'text-extrusion',
    font: '/fonts/preview/qetod.ttf',
    layers: [
      {
        color: '#111111',
        depth: 12,
        metalness: 0.1,
        roughness: 0.8,
        bevelEnabled: false,
        strokeWidth: 0.2,
      },
      {
        color: '#ffffff',
        depth: 1,
        metalness: 0.0,
        roughness: 0.5,
        offsetZ: 12,
        bevelEnabled: false,
      },
    ],
    camera: {
      position: [0, 3, 20],
      fov: 45,
      autoRotate: true,
      autoRotateSpeed: 1,
    },
    maxChars: 15,
    textSpacingMode: 'advance',
    textLetterSpacing: -0.01,
    scale: 1,
    background: '#0a0a12',
  },

  'one-piece-custom-sign': {
    type: 'composite-sign',
    font: '/fonts/preview/ONEPIECE_IL_FINAL.ttf',
    forceUppercase: true,
    variantSvgs: {
      'Luffy': '/svgs/preview/luffy-jollyroger.svg',
      'Zoro': '/svgs/preview/zoro-jollyroger.svg',
      'Ace': '/svgs/preview/ace-jollyroger.svg',
      'Chopper': '/svgs/preview/chopper-jollyroger.svg',
      'Law': '/svgs/preview/law-jollyroger.svg',
      'Shanks': '/svgs/preview/shanks-jollyroger.svg',
      'Nami': '/svgs/preview/nami-jollyroger.svg',
      'Franky': '/svgs/preview/franky-jollyroger.svg',
      'Robin': '/svgs/preview/robin-jollyroger.svg',
      'Brook': '/svgs/preview/brook-jollyroger.svg',
      'Sanji': '/svgs/preview/sanji-jollyroger.svg',
      'Ussop': '/svgs/preview/ussop-jollyroger.svg',
      'Boa': '/svgs/preview/boa-jollyroger.svg',
      'Jinbe': '/svgs/preview/jinbe-jollyroger.svg',
      'Kaidou': '/svgs/preview/kaidou-jollyroger.svg',
      'Whitebeard': '/svgs/preview/whitebeard-jollyroger.svg',
      'Buggy': '/svgs/preview/buggy-jollyroger.svg',
      'Blackbeard': '/svgs/preview/blackbeard-jollyroger.svg',
      'Black Bear': '/svgs/preview/blackbeard-jollyroger.svg',
      'Eustass Kid': '/svgs/preview/eustass-jollyroger.svg',
      'Kid': '/svgs/preview/eustass-jollyroger.svg',
      'Corazon': '/svgs/preview/corazon-jollyroger.svg',
      'Carrot': '/svgs/preview/carrot-jollyroger.svg',
      'Arlong Pirates': '/svgs/preview/arlong-jollyroger.svg',
      'Arlong': '/svgs/preview/arlong-jollyroger.svg',
      'Doflamingo': '/svgs/preview/doflamingo-jollyroger.svg',
      'Donquixote': '/svgs/preview/donquixote-jollyroger.svg',
      'Don Quixote': '/svgs/preview/donquixote-jollyroger.svg',
      'Donquixote Pirates': '/svgs/preview/donquixote-jollyroger.svg',
      'Roger': '/svgs/preview/roger-jollyroger.svg',
    },
    variantImages: {
      'Luffy': '/images/characters/style_1.png',
      'Zoro': '/images/characters/style_2.png',
      'Ace': '/images/characters/style_3.png',
      'Chopper': '/images/characters/style_4.png',
      'Law': '/images/characters/style_5.png',
      'Shanks': '/images/characters/style_6.png',
      'Nami': '/images/characters/style_7.png',
      'Franky': '/images/characters/style_8.png',
      'Robin': '/images/characters/style_9.png',
      'Sanji': '/images/characters/style_10.png',
      'Brook': '/images/characters/style_11.png',
      'Ussop': '/images/characters/style_12.png',
      'Boa': '/images/characters/style_13.png',
      'Jinbe': '/images/characters/style_14.png',
      'Kaidou': '/images/characters/style_15.png',
      'Whitebeard': '/images/characters/style_16.png',
      'Roger': '/images/characters/style_17.png',
      'Buggy': '/images/characters/style_18.png',
      'Blackbeard': '/images/characters/style_19.png',
      'Black Bear': '/images/characters/style_19.png',
      'Eustass Kid': '/images/characters/style_20.png',
      'Kid': '/images/characters/style_20.png',
      'Corazon': '/images/characters/style_21.png',
      'Doflamingo': '/images/characters/style_22.png',
      'Donquixote': '/images/characters/style_23.png',
      'Don Quixote': '/images/characters/style_23.png',
      'Donquixote Pirates': '/images/characters/style_23.png',
      'Carrot': '/images/characters/style_24.png',
      'Arlong Pirates': '/images/characters/style_25.png',
      'Arlong': '/images/characters/style_25.png',
    },
    textLayers: [
      {
        color: '#111111',
        depth: 11,
        metalness: 0.1,
        roughness: 0.8,
        strokeWidth: 8,
      },
      {
        color: '#f5f5f5',
        depth: 1,
        offsetZ: 11.05,
        metalness: 0.0,
        roughness: 0.5,
      },
    ],
    textFontSize: 405,
    barParts: {
      start: '/svgs/preview/box_start.svg',
      middle: '/svgs/preview/box_middle.svg',
      final: '/svgs/preview/box_final.svg',
      top: '/svgs/preview/box_top.svg',
    },
    tileCount: 3,
    layers: [
      {
        svgColor: '#000000',
        color: '#111111',
        depth: 12,
        metalness: 0.1,
        roughness: 0.8,
        strokeWidth: 3,
      },
      {
        svgColor: '#ffffff',
        color: '#f5f5f5',
        depth: 1,
        offsetZ: 12,
        metalness: 0.0,
        roughness: 0.5,
      },
      {
        svgColor: '#ffd400',
        color: '#ffd400',
        depth: 1,
        offsetZ: 12,
        metalness: 0.3,
        roughness: 0.4,
      },
      {
        svgColor: '#d33738',
        color: '#d33738',
        depth: 1,
        offsetZ: 12,
        metalness: 0.2,
        roughness: 0.5,
      },
      {
        svgColor: '#0cff00',
        color: '#0cff00',
        depth: 1,
        mode: 'cut',
      },
    ],
    variantLayers: {
      'Law': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // Yellow 1mm extrude (to be cut by blue)
        {
          svgColor: '#fee100',
          color: '#fee100',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
          cutGroup: 'yellow',
        },
        // Blue cut 1mm (cuts yellow only)
        {
          svgColor: '#0600ff',
          color: '#0600ff',
          depth: 1,
          mode: 'cut',
          cutGroup: 'yellow',
        },
        // Pink 1mm extrude (to be cut by green)
        {
          svgColor: '#ff00f0',
          color: '#fee100',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          cutGroup: 'pink',
        },
        // Green cut 1mm (cuts pink only)
        {
          svgColor: '#0cff00',
          color: '#0cff00',
          depth: 1,
          mode: 'cut',
          cutGroup: 'pink',
        },
      ],
      'Shanks': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // All non-green detail colors: 1mm overlays
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#cd1414',
          color: '#cd1414',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#868686',
          color: '#868686',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#7a463c',
          color: '#7a463c',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#c3c3c3',
          color: '#c3c3c3',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#bda39e',
          color: '#bda39e',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#806661',
          color: '#806661',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        // Final cut: green 1mm
        {
          svgColor: '#0cff00',
          color: '#0cff00',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Nami': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // All non-green detail colors: 1mm overlays
        {
          svgColor: '#ffffff',
          color: '#f5f5f5',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#ffa91f',
          color: '#ffa91f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#026bbe',
          color: '#026bbe',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#f485b4',
          color: '#f485b4',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        // Final cut: green 1mm
        {
          svgColor: '#0cff00',
          color: '#0cff00',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Franky': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // All non-cut detail colors: 1mm overlays
        {
          svgColor: '#ffffff',
          color: '#f5f5f5',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#bf2222',
          color: '#bf2222',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#ffd400',
          color: '#ffd400',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#005aff',
          color: '#339af0',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#c1c1c1',
          color: '#c1c1c1',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#c0c0c0',
          color: '#c0c0c0',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#8e6042',
          color: '#8e6042',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#e0e0e0',
          color: '#e0e0e0',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#c7b0a1',
          color: '#c7b0a1',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#a79081',
          color: '#a79081',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        // Green cut: 1mm
        {
          svgColor: '#0cff00',
          color: '#0cff00',
          depth: 1,
          mode: 'cut',
        },
        // Pink cut-through: 1mm
        {
          svgColor: '#00d4fa',
          color: '#00d4fa',
          depth: 13,
          offsetZ: 13,
          mode: 'cut',
          cutThroughAll: true,
        },
      ],
      'Robin': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // All non-green detail colors: 1mm overlays
        {
          svgColor: '#ffffff',
          color: '#f5f5f5',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#6803ff',
          color: '#6803ff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#340280',
          color: '#340280',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#b43d4b',
          color: '#b43d4b',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#7a7a7a',
          color: '#7a7a7a',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#bdbdbd',
          color: '#bdbdbd',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#d3fd67',
          color: '#d3fd67',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#e9feb3',
          color: '#e9feb3',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        // Final cut: green 1mm
        {
          svgColor: '#0cfe00',
          color: '#0cfe00',
          depth: 1,
          mode: 'cut',
        },
        // Red extrude after green cut
        {
          svgColor: '#ed001c',
          color: '#ed001c',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          noCut: true,
        },
      ],
      'Brook': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // 1mm extrudes for all colors except pink, red, green, and teal marker
        {
          svgColor: '#ffffff',
          color: '#f5f5f5',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
          cutGroup: 'phase-1',
        },
        {
          svgColor: '#003cff',
          color: '#2dc653',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          cutGroup: 'phase-1',
        },
        {
          svgColor: '#fee100',
          color: '#fee100',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
          cutGroup: 'phase-1',
        },
        // Green cut 1mm
        {
          svgColor: '#0bfe00',
          color: '#0bfe00',
          depth: 1,
          mode: 'cut',
          cutGroup: 'phase-1',
        },
        // Teal 1mm extrude after green cut
        {
          svgColor: '#01fead',
          color: '#fee100',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
          cutGroup: 'phase-2',
        },
        // Red cut 1mm (final): cuts both phase-1 and phase-2 layers
        {
          svgColor: '#ff0000',
          color: '#ff0000',
          depth: 1,
          mode: 'cut',
          cutGroup: 'phase-1',
        },
        {
          svgColor: '#ff0000',
          color: '#ff0000',
          depth: 1,
          mode: 'cut',
          cutGroup: 'phase-2',
        },
        // Pink 1mm extrudes at the end
        {
          svgColor: '#ff7da9',
          color: '#ff7da9',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          cutGroup: 'phase-3',
        },
        {
          svgColor: '#ffbed4',
          color: '#ffbed4',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          cutGroup: 'phase-3',
        },
      ],
      'Sanji': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // Grey overlays 1mm
        {
          svgColor: '#a2a2a2',
          color: '#bdbdbd',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#d1d1d1',
          color: '#bdbdbd',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        // Red overlay 1mm
        {
          svgColor: '#ff0000',
          color: '#bdbdbd',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        // Final green cut 1mm
        {
          svgColor: '#12ff00',
          color: '#12ff00',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Ussop': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // 1mm extrudes for all colors except blue and red
        {
          svgColor: '#ffffff',
          color: '#f5f5f5',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#7a6601',
          color: '#7c943a',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#2ab100',
          color: '#2ab100',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#936b63',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        // Blue cut 1mm
        {
          svgColor: '#001efe',
          color: '#001efe',
          depth: 1,
          mode: 'cut',
        },
        // Final red extrude 1mm
        {
          svgColor: '#ff0000',
          color: '#2ab100',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          noCut: true,
        },
      ],
      'Jinbe': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // 1mm overlays for all non-green colors
        {
          svgColor: '#ffffff',
          color: '#f5f5f5',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#fa0000',
          color: '#fa0000',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        // Final green cut 1mm
        {
          svgColor: '#1eff00',
          color: '#1eff00',
          depth: 1,
          mode: 'cut',
        },
        // Pink cut 1mm (before final blue extrude)
        {
          svgColor: '#de00ff',
          color: '#de00ff',
          depth: 1,
          mode: 'cut',
        },
        // Final blue extrude 1mm (after cuts)
        {
          svgColor: '#1e00ff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          noCut: true,
        },
      ],
      'Kaidou': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // White overlay 1mm
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        // Final green cut 1mm
        {
          svgColor: '#42ff00',
          color: '#42ff00',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Whitebeard': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // Remaining detail colors: 1mm overlays
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#6803ff',
          color: '#6803ff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        // Final green cut 1mm
        {
          svgColor: '#42ff00',
          color: '#42ff00',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Buggy': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // White overlay 1mm
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        // Green cut 1mm
        {
          svgColor: '#42ff00',
          color: '#42ff00',
          depth: 1,
          mode: 'cut',
        },
        // Final red extrude 1mm
        {
          svgColor: '#ff0000',
          color: '#ff0000',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          noCut: true,
        },
      ],
      'Blackbeard': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // White overlay 1mm
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        // Final green cut 1mm
        {
          svgColor: '#42ff00',
          color: '#42ff00',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Black Bear': [
        // Alias of Blackbeard for variant naming differences.
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#42ff00',
          color: '#42ff00',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Eustass Kid': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // Remaining colors: 1mm overlays
        {
          svgColor: '#f8f8f8',
          color: '#f8f8f8',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#ef3121',
          color: '#ef3121',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#ffee05',
          color: '#ffee05',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        // Final green cut 1mm
        {
          svgColor: '#00ff2a',
          color: '#00ff2a',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Kid': [
        // Alias of Eustass Kid for variant naming differences.
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        {
          svgColor: '#f8f8f8',
          color: '#f8f8f8',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#ef3121',
          color: '#ef3121',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#ffee05',
          color: '#ffee05',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#00ff2a',
          color: '#00ff2a',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Corazon': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // Red 1mm (phase 1)
        {
          svgColor: '#933d3a',
          color: '#933d3a',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          cutGroup: 'phase-red',
        },
        // Green cut 1mm (cuts only red phase)
        {
          svgColor: '#18ff00',
          color: '#18ff00',
          depth: 1,
          mode: 'cut',
          cutGroup: 'phase-red',
        },
        // Yellow + white + blue 1mm (phase 2)
        {
          svgColor: '#fbff00',
          color: '#fbff00',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
          cutGroup: 'phase-main',
        },
        {
          svgColor: '#fdff80',
          color: '#fdff80',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
          cutGroup: 'phase-main',
        },
        {
          svgColor: '#7e8000',
          color: '#7e8000',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          cutGroup: 'phase-main',
        },
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
          cutGroup: 'phase-main',
        },
        {
          svgColor: '#0024ff',
          color: '#0024ff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          cutGroup: 'phase-main',
        },
        {
          svgColor: '#001280',
          color: '#001280',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          cutGroup: 'phase-main',
        },
        // Final pink cut 1mm (applies to red and main phases)
        {
          svgColor: '#ea00ff',
          color: '#ea00ff',
          depth: 1,
          mode: 'cut',
          cutGroup: 'phase-red',
        },
        {
          svgColor: '#ea00ff',
          color: '#ea00ff',
          depth: 1,
          mode: 'cut',
          cutGroup: 'phase-main',
        },
      ],
      'Carrot': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // All non-green colors: 1mm overlays
        {
          svgColor: '#f3f3f3',
          color: '#f3f3f3',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#f2d63c',
          color: '#f2d63c',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#e7b0e7',
          color: '#e7b0e7',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        // Final green cut 1mm
        {
          svgColor: '#00ff18',
          color: '#00ff18',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Arlong Pirates': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // 1mm overlays for all non-green / non-blue colors
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#eb1515',
          color: '#eb1515',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        // Green cut 1mm
        {
          svgColor: '#00fc29',
          color: '#00fc29',
          depth: 1,
          mode: 'cut',
        },
        // Final blue extrude 1mm
        {
          svgColor: '#007e15',
          color: '#0077f1',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
          noCut: true,
        },
      ],
      'Arlong': [
        // Alias of Arlong Pirates for variant naming differences.
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#eb1515',
          color: '#eb1515',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#00fc29',
          color: '#00fc29',
          depth: 1,
          mode: 'cut',
        },
        {
          svgColor: '#007e15',
          color: '#0077f1',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
          noCut: true,
        },
      ],
      'Doflamingo': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // 1mm overlays for non-red/non-green/non-blue colors
        {
          svgColor: '#fbfbfb',
          color: '#fbfbfb',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
          cutGroup: 'phase-main',
        },
        {
          svgColor: '#f391b0',
          color: '#f391b0',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          cutGroup: 'phase-main',
        },
        {
          svgColor: '#f3dd6e',
          color: '#f3dd6e',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
          cutGroup: 'phase-main',
        },
        {
          svgColor: '#7a6f37',
          color: '#7a6f37',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          cutGroup: 'phase-main',
        },
        // Green cut 1mm
        {
          svgColor: '#00ff18',
          color: '#00ff18',
          depth: 1,
          mode: 'cut',
          cutGroup: 'phase-main',
        },
        // Blue cut 1mm
        {
          svgColor: '#002aff',
          color: '#002aff',
          depth: 1,
          mode: 'cut',
          cutGroup: 'phase-main',
        },
        // Final red 1mm extrude
        {
          svgColor: '#f90017',
          color: '#f90017',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          noCut: true,
        },
      ],
      'Donquixote': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // White overlay 1mm
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        // Final green cut 1mm
        {
          svgColor: '#00ff18',
          color: '#00ff18',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Don Quixote': [
        // Alias of Donquixote for variant naming differences.
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#00ff18',
          color: '#00ff18',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Donquixote Pirates': [
        // Alias of Donquixote for variant naming differences.
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#00ff18',
          color: '#00ff18',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Roger': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // White overlay 1mm
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        // Final green cut 1mm
        {
          svgColor: '#1eff00',
          color: '#1eff00',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Boa': [
        // Base: white 12mm
        {
          svgColor: '#ffffff',
          color: '#ffffff',
          depth: 12,
          metalness: 0.0,
          roughness: 0.6,
          strokeWidth: 3,
        },
        // Black 1mm on top
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 1,
          offsetZ: 12,
          metalness: 0.1,
          roughness: 0.7,
          cutGroup: 'phase-1',
        },
        // Red cut 1mm
        {
          svgColor: '#ff0000',
          color: '#ff0000',
          depth: 1,
          mode: 'cut',
          cutGroup: 'phase-1',
        },
        // Blue extrude 1mm (after red cut)
        {
          svgColor: '#0006ff',
          color: '#111111',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          cutGroup: 'phase-2',
        },
        // Final green cut 1mm (applies after blue step)
        {
          svgColor: '#18ff00',
          color: '#18ff00',
          depth: 1,
          mode: 'cut',
          cutGroup: 'phase-1',
        },
        {
          svgColor: '#18ff00',
          color: '#18ff00',
          depth: 1,
          mode: 'cut',
          cutGroup: 'phase-2',
        },
      ],
      'Chopper': [
        // Base: black 12mm
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // Extrude all colors except marker-green and marker-orange at 1mm
        {
          svgColor: '#ffffff',
          color: '#f5f5f5',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#b0bb7c',
          color: '#b0bb7c',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#45e87c',
          color: '#45e87c',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#b0e8f6',
          color: '#b0e8f6',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#60d0ec',
          color: '#60d0ec',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#158006',
          color: '#158006',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#afb4f5',
          color: '#afb4f5',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#ffccfe',
          color: '#ffccfe',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#fe98fd',
          color: '#fe98fd',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        // Marker-green cuts 1mm overlays
        {
          svgColor: '#29ff0c',
          color: '#29ff0c',
          depth: 1,
          mode: 'cut',
        },
        // Marker-orange extrudes last at 1mm (excluded from cuts)
        {
          svgColor: '#ffa60c',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12.6,
          metalness: 0.3,
          roughness: 0.4,
          noCut: true,
        },
      ],
      'Zoro': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        {
          svgColor: '#ffffff',
          color: '#f5f5f5',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#5cb6ee',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#7c297f',
          color: '#7c297f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#ffd400',
          color: '#ffd400',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c32322',
          color: '#c32322',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#6e6e6e',
          color: '#6e6e6e',
          depth: 1,
          offsetZ: 12.3,
          metalness: 0.4,
          roughness: 0.3,
        },
        {
          svgColor: '#fdefd2',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#18ff00',
          color: '#18ff00',
          depth: 1,
          mode: 'cut',
        },
      ],
      'Ace': [
        // Base
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
          strokeWidth: 3,
        },
        // Overlays — cut by green (default cut group)
        {
          svgColor: '#ffffff',
          color: '#f5f5f5',
          depth: 1,
          offsetZ: 12,
          metalness: 0.0,
          roughness: 0.5,
        },
        {
          svgColor: '#f3ea00',
          color: '#f3ea00',
          depth: 1,
          offsetZ: 12.1,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c80000',
          color: '#c80000',
          depth: 1,
          offsetZ: 12.4,
          metalness: 0.2,
          roughness: 0.5,
        },
        {
          svgColor: '#f38400',
          color: '#f38400',
          depth: 1,
          offsetZ: 12.6,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#a7a7a7',
          color: '#a7a7a7',
          depth: 1,
          offsetZ: 12,
          metalness: 0.1,
          roughness: 0.5,
        },
        // Green — cuts default group overlays
        {
          svgColor: '#00fd12',
          color: '#00fd12',
          depth: 1,
          mode: 'cut',
        },
        // Purple — extruded 1mm on top, not cut
        {
          svgColor: '#840cff',
          color: '#a7a7a7',
          depth: 1,
          offsetZ: 12,
          metalness: 0.1,
          roughness: 0.5,
          noCut: true,
        },
        // Blue — extruded 1mm on top, cut by pink
        {
          svgColor: '#0084f0',
          color: '#0084f0',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
          cutGroup: 'eyes',
        },
        // Pink — cuts only blue (eyes group)
        {
          svgColor: '#fd00aa',
          color: '#fd00aa',
          depth: 1,
          mode: 'cut',
          cutGroup: 'eyes',
        },
      ],
    },
    variantBarLayers: {
      'Law': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#fee100',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Shanks': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#cd1414',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#7a463c',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Nami': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#14b8a6',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Franky': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#339af0',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Robin': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#6803ff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Brook': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#bdbdbd',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Sanji': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#fee100',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Ussop': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#7c943a',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Jinbe': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#60d0ec',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Kaidou': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#6803ff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Whitebeard': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#6803ff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Buggy': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#ff0000',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Blackbeard': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#ff0000',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Black Bear': [
        // Alias of Blackbeard for variant naming differences.
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#ff0000',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Eustass Kid': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#ef3121',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Kid': [
        // Alias of Eustass Kid for variant naming differences.
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#ef3121',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Corazon': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#933d3a',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Doflamingo': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#f391b0',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Donquixote': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Don Quixote': [
        // Alias of Donquixote for variant naming differences.
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Donquixote Pirates': [
        // Alias of Donquixote for variant naming differences.
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#ffffff',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Carrot': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#00ff18',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Arlong Pirates': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#eb1515',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Arlong': [
        // Alias of Arlong Pirates for variant naming differences.
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#eb1515',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Roger': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#cd1414',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Boa': [
        {
          svgColor: '#000000',
          color: '#ffffff',
          depth: 12,
          metalness: 0.0,
          roughness: 0.6,
        },
        {
          svgColor: '#0077f1',
          color: '#111111',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.6,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Chopper': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#fe98fd',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Zoro': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#2dc653',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
      'Ace': [
        {
          svgColor: '#000000',
          color: '#111111',
          depth: 12,
          metalness: 0.1,
          roughness: 0.8,
        },
        {
          svgColor: '#0077f1',
          color: '#f38400',
          depth: 1,
          offsetZ: 12,
          metalness: 0.3,
          roughness: 0.4,
        },
        {
          svgColor: '#c1530f',
          color: '#c1530f',
          depth: 1,
          offsetZ: 12,
          metalness: 0.2,
          roughness: 0.5,
        },
      ],
    },
    variantTextColors: {
      'Law': { text: '#fee100', special: '#ffffff' },
      'Shanks': { text: '#cd1414', special: '#ffffff' },
      'Nami': { text: '#14b8a6', special: '#ffa91f' },
      'Franky': { text: '#339af0', special: '#cc0000' },
      'Robin': { text: '#6803ff', special: '#ed001c' },
      'Brook': { text: '#bdbdbd', special: '#fee100' },
      'Sanji': { text: '#fee100', special: '#bdbdbd' },
      'Ussop': { text: '#7c943a', special: '#ffffff' },
      'Jinbe': { text: '#60d0ec', special: '#cc0000' },
      'Kaidou': { text: '#6803ff', special: '#ffffff' },
      'Whitebeard': { text: '#6803ff', special: '#ffffff' },
      'Buggy': { text: '#ff0000', special: '#ffffff' },
      'Blackbeard': { text: '#ff0000', special: '#ffffff' },
      'Black Bear': { text: '#ff0000', special: '#ffffff' },
      'Eustass Kid': { text: '#ef3121', special: '#ffee05' },
      'Kid': { text: '#ef3121', special: '#ffee05' },
      'Corazon': { text: '#933d3a', special: '#fbff00' },
      'Carrot': { text: '#00ff18', special: '#e7b0e7' },
      'Arlong Pirates': { text: '#eb1515', special: '#ffffff' },
      'Arlong': { text: '#eb1515', special: '#ffffff' },
      'Doflamingo': { text: '#f391b0', special: '#f90017' },
      'Donquixote': { text: '#ffffff', special: '#ff0000' },
      'Don Quixote': { text: '#ffffff', special: '#ff0000' },
      'Donquixote Pirates': { text: '#ffffff', special: '#ff0000' },
      'Roger': { text: '#cd1414', special: '#ffffff' },
      'Boa': { text: '#111111', special: '#ff0000', stroke: '#ffffff' },
      'Chopper': { text: '#fe98fd', special: '#ffffff' },
      'Zoro': { text: '#2dc653', special: '#ffd400' },
      'Ace': { text: '#f38400', special: '#c80000' },
    },
    variantJollyScale: {
      // law.svg uses a 1773x1773 viewBox while other jolly rogers are 500x500.
      // Scale to match visual size with existing variants.
      'Law': 0.27,
      // Slightly increase Shanks to better match visual footprint.
      'Shanks': 1.05,
      // Slightly reduce Robin to match composition balance.
      'Robin': 0.96,
      // Slightly increase Blackbeard size.
      'Blackbeard': 1.05,
      'Black Bear': 1.05,
      // Slightly reduce Eustass Kid.
      'Eustass Kid': 0.96,
      'Kid': 0.96,
      // corazon.svg is 1773x1773; scale to match 500x500 variants.
      'Corazon': 0.282,
      // carrot.svg is 1684x1866; normalize size to match other jolly rogers.
      'Carrot': 0.285,
      // Slightly reduce Boa size.
      'Boa': 0.96,
      // doflamingo.svg is 1773x1773; scale to match 500x500 variants.
      'Doflamingo': 0.282,
      // donquixote.svg is 1773x1773; slightly reduced to better match neighbors.
      'Donquixote': 0.265,
      'Don Quixote': 0.265,
      'Donquixote Pirates': 0.265,
    },
    variantJollyOffsetX: {
      // Move Shanks slightly left.
      'Shanks': -10,
    },
    variantJollyOffsetY: {
      // Move Blackbeard slightly down.
      'Blackbeard': 12,
      'Black Bear': 12,
      // Move Franky slightly up.
      'Franky': -6,
      // Move Carrot slightly up.
      'Carrot': -40,
    },
    variantTextOffsetX: {
      // Roger jolly roger is wider; push text right and let bars grow accordingly.
      'Roger': 130,
      // Match Roger spacing treatment for Kaidou.
      'Kaidou': 130,
      // Wider skull treatment, same spacing rule as Roger/Kaidou.
      'Blackbeard': 130,
      'Black Bear': 130,
      // Increase gap for Eustass Kid composition.
      'Eustass Kid': 130,
      'Kid': 130,
    },
    barLayers: [
      {
        svgColor: '#000000',
        color: '#111111',
        depth: 12,
        metalness: 0.1,
        roughness: 0.8,
      },
      {
        svgColor: '#0077f1',
        color: '#339af0',
        depth: 1,
        offsetZ: 12,
        metalness: 0.3,
        roughness: 0.4,
      },
      {
        svgColor: '#c1530f',
        color: '#c1530f',
        depth: 1,
        offsetZ: 12,
        metalness: 0.2,
        roughness: 0.5,
      },
    ],
    camera: {
      position: [0, 0, 40],
      fov: 45,
      autoRotate: false,
      autoRotateSpeed: 1,
    },
    scale: 0.02,
    barScale: 0.6,
    background: '#0a1022',
  },

  'demon-slayer-custom-sign': {
    type: 'svg-extrusion',
    svg: '/svgs/preview/demonslayer-logo.svg',
    font: '/fonts/preview/bloodcrow.ttf',
    capitalizeFirst: true,
    forceUppercase: false,
    maxChars: 15,
    textFontSize: 300,
    layers: [
      // White: base extrude 12mm
      {
        svgColor: '#ffffff',
        color: '#ffffff',
        depth: 12,
        metalness: 0.0,
        roughness: 0.6,
      },
      // Red + near-black: extrude 1mm at offset 12mm
      {
        svgColor: '#e30613',
        color: '#e30613',
        depth: 1,
        offsetZ: 12,
        metalness: 0.2,
        roughness: 0.5,
      },
      {
        svgColor: '#100c08',
        color: '#111111',
        depth: 1,
        offsetZ: 12,
        metalness: 0.1,
        roughness: 0.8,
      },
      // Red only: extrude 1mm at offset 13mm
      {
        svgColor: '#e30613',
        color: '#e30613',
        depth: 1,
        offsetZ: 13,
        metalness: 0.2,
        roughness: 0.5,
      },
    ],
    textLayers: [
      // White stroke/background: 12mm
      {
        color: '#f5f5f5',
        depth: 12,
        metalness: 0.0,
        roughness: 0.5,
        strokeWidth: 12,
      },
      // Black letters: 2mm on top
      {
        color: '#111111',
        depth: 2,
        offsetZ: 12,
        metalness: 0.1,
        roughness: 0.8,
      },
    ],
    camera: {
      position: [0, 3, 35],
      fov: 45,
      autoRotate: false,
      autoRotateSpeed: 1,
    },
    scale: 0.02,
    background: '#0a0a12',
  },
}

/**
 * Standalone variant images for products that need icon tiles
 * in the variant selector but NO 3D preview.
 */
/**
 * One Piece Custom LED Lightbox Sign — a thick (~20mm) acrylic lightbox.
 * Uses the svg-extrusion scene: the black silhouette is extruded at full
 * depth, the UV-painted details sit flush on the front face, and the
 * personalised name renders inside a nameplate rectangle at the bottom
 * of the art. Painted layers are mildly emissive so the product reads as
 * LED-lit.
 *
 * Character coverage currently starts with Luffy; additional characters
 * are added by dropping matching SVGs under /public/svgs/preview/ and
 * extending the `variantSvgs` map below.
 */
previewConfigs['one-piece-custom-led-lightbox-sign'] = {
  type: 'svg-extrusion',
  font: '/fonts/preview/ONEPIECE_IL_FINAL.ttf',
  forceUppercase: true,
  svg: '/svgs/preview/one-piece-lightbox-luffy.svg',
  variantSvgs: {
    Luffy: '/svgs/preview/one-piece-lightbox-luffy.svg',
    Zoro: '/svgs/preview/one-piece-lightbox-zoro.svg',
    Ace: '/svgs/preview/one-piece-lightbox-ace.svg',
    Chopper: '/svgs/preview/one-piece-lightbox-chopper.svg',
    Law: '/svgs/preview/one-piece-lightbox-law.svg',
    Nami: '/svgs/preview/one-piece-lightbox-nami.svg',
    Shanks: '/svgs/preview/one-piece-lightbox-shanks.svg',
  },
  layers: [
    // Black silhouette — the whole lightbox body at 20mm depth.
    // Different variants are exported with slightly different black
    // swatches; each layer below is a no-op for variants that don't
    // use that particular hex.
    {
      svgColor: '#171714',
      color: '#141414',
      depth: 12,
      metalness: 0.1,
      roughness: 0.85,
    },
    {
      svgColor: '#171713',
      color: '#141414',
      depth: 12,
      metalness: 0.1,
      roughness: 0.85,
    },
    {
      svgColor: '#000000',
      color: '#141414',
      depth: 12,
      metalness: 0.1,
      roughness: 0.85,
    },
    // White UV paint (skull, bones, nameplate text outline area).
    {
      svgColor: '#ffffff',
      color: '#ffffff',
      depth: 0.005,
      offsetZ: 12,
      metalness: 0.0,
      roughness: 0.45,
      emissive: '#ffffff',
      emissiveIntensity: 1.3,
    },
    // Yellow (hat + nameplate border). Stagger offsetZ so coincident
    // surfaces don't z-fight when the camera rotates.
    {
      svgColor: '#ffd400',
      color: '#ffd400',
      depth: 0.005,
      offsetZ: 12.15,
      metalness: 0.0,
      roughness: 0.4,
      emissive: '#ffd400',
      emissiveIntensity: 1.3,
    },
    // Second yellow `#fde200` — the ornate frame drawn around the blue
    // nameplate interior. Treated as another yellow paint layer so the
    // border renders yellow rather than leaving the underlying white
    // paint showing through.
    {
      svgColor: '#fde200',
      color: '#fde200',
      depth: 0.005,
      offsetZ: 12.2,
      metalness: 0.0,
      roughness: 0.4,
      emissive: '#fde200',
      emissiveIntensity: 1.3,
    },
    // Red (hat band). Less glow — it's a thin paint strip, not a light
    // emitter.
    {
      svgColor: '#dc2526',
      color: '#dc2526',
      depth: 0.005,
      offsetZ: 12.3,
      metalness: 0.0,
      roughness: 0.5,
      emissive: '#dc2526',
      emissiveIntensity: 0.7,
    },
    // Pink `#ed1eec` paths mark the hat's pill-shaped shine details on
    // Luffy — UV-painted black on top of the yellow hat. Rendered as a
    // thin black paint layer above yellow.
    {
      svgColor: '#ed1eec',
      color: '#141414',
      depth: 0.005,
      offsetZ: 12.45,
      metalness: 0.1,
      roughness: 0.85,
    },
    // ----- Character-specific paint layers -----
    // Each variant only uses a subset; the rest are no-ops on that SVG.
    // All share the same "UV-painted front face" treatment — thin
    // emissive layer above the silhouette.
    // Zoro purple / grey
    {
      svgColor: '#56037c',
      color: '#56037c',
      depth: 0.005, offsetZ: 12.25, metalness: 0.0, roughness: 0.5,
      emissive: '#56037c', emissiveIntensity: 0.9,
    },
    {
      svgColor: '#b7b7b7',
      color: '#b7b7b7',
      depth: 0.005, offsetZ: 12.35, metalness: 0.1, roughness: 0.4,
      emissive: '#b7b7b7', emissiveIntensity: 1.6,
    },
    // Chopper — light blue + pink
    {
      svgColor: '#60d0ec',
      color: '#60d0ec',
      depth: 0.005, offsetZ: 12.18, metalness: 0.0, roughness: 0.45,
      emissive: '#60d0ec', emissiveIntensity: 1.1,
    },
    {
      svgColor: '#fe98fd',
      color: '#fe98fd',
      depth: 0.005, offsetZ: 12.28, metalness: 0.0, roughness: 0.45,
      emissive: '#fe98fd', emissiveIntensity: 1.0,
    },
    // Law — yellow swatch
    {
      svgColor: '#fddc00',
      color: '#fddc00',
      depth: 0.005, offsetZ: 12.17, metalness: 0.0, roughness: 0.4,
      emissive: '#fddc00', emissiveIntensity: 1.3,
    },
    // Nami — blue / pink / orange
    {
      svgColor: '#026bbe',
      color: '#026bbe',
      depth: 0.005, offsetZ: 12.22, metalness: 0.0, roughness: 0.5,
      emissive: '#026bbe', emissiveIntensity: 0.9,
    },
    {
      svgColor: '#f485b4',
      color: '#f485b4',
      depth: 0.005, offsetZ: 12.28, metalness: 0.0, roughness: 0.45,
      emissive: '#f485b4', emissiveIntensity: 0.9,
    },
    {
      svgColor: '#ffa91f',
      color: '#ffa91f',
      depth: 0.005, offsetZ: 12.24, metalness: 0.0, roughness: 0.4,
      emissive: '#ffa91f', emissiveIntensity: 1.1,
    },
    // Shanks — brown / grey / dark red
    {
      svgColor: '#7a463c',
      color: '#7a463c',
      depth: 0.005, offsetZ: 12.23, metalness: 0.0, roughness: 0.6,
      emissive: '#7a463c', emissiveIntensity: 0.7,
    },
    {
      svgColor: '#868686',
      color: '#868686',
      depth: 0.005, offsetZ: 12.37, metalness: 0.1, roughness: 0.4,
      emissive: '#868686', emissiveIntensity: 0.7,
    },
    {
      svgColor: '#cd1414',
      color: '#cd1414',
      depth: 0.005, offsetZ: 12.32, metalness: 0.0, roughness: 0.5,
      emissive: '#cd1414', emissiveIntensity: 1.6,
    },
    // Ace — multiple accents
    {
      svgColor: '#0d83e3',
      color: '#0d83e3',
      depth: 0.005, offsetZ: 12.22, metalness: 0.0, roughness: 0.5,
      emissive: '#0d83e3', emissiveIntensity: 1.0,
    },
    {
      svgColor: '#bababa',
      color: '#bababa',
      depth: 0.005, offsetZ: 12.36, metalness: 0.1, roughness: 0.4,
      emissive: '#bababa', emissiveIntensity: 1.6,
    },
    {
      svgColor: '#e60000',
      color: '#e60000',
      depth: 0.005, offsetZ: 12.31, metalness: 0.0, roughness: 0.5,
      emissive: '#e60000', emissiveIntensity: 0.9,
    },
    {
      svgColor: '#f38400',
      color: '#f38400',
      depth: 0.005, offsetZ: 12.19, metalness: 0.0, roughness: 0.4,
      emissive: '#f38400', emissiveIntensity: 1.1,
    },
    {
      svgColor: '#f3ea00',
      color: '#f3ea00',
      depth: 0.005, offsetZ: 12.16, metalness: 0.0, roughness: 0.4,
      emissive: '#f3ea00', emissiveIntensity: 1.3,
    },
    // Solid black fill under the green-marker shapes (eye sockets, nose)
    // and the blue-marker shape (nameplate interior). The original
    // silhouette was drawn *around* the painted regions so it has holes
    // where the white used to sit; these layers plug those holes so a
    // cut in the paint above reveals solid black instead of punching
    // clean through the sign.
    {
      svgColor: '#1eed1e',
      color: '#141414',
      depth: 12,
      metalness: 0.1,
      roughness: 0.85,
    },
    {
      svgColor: '#0000ff',
      color: '#141414',
      depth: 12,
      metalness: 0.1,
      roughness: 0.85,
    },
    // Green and blue shapes also act as CSG cuts against paint layers
    // (offsetZ > 0) so the eyes / nose / nameplate interior stay
    // unpainted and the black fill above shows through.
    {
      svgColor: '#1eed1e',
      color: '#1eed1e',
      depth: 1,
      mode: 'cut',
    },
    {
      svgColor: '#0000ff',
      color: '#0000ff',
      depth: 1,
      mode: 'cut',
    },
  ],
  textLayers: [
    {
      color: '#ffffff',
      depth: 0.005,
      offsetZ: 12.45,
      metalness: 0.0,
      roughness: 0.4,
      emissive: '#ffffff',
      emissiveIntensity: 1.6,
    },
  ],
  textFontSize: 460,
  // Short names scale up until they fill ~96% of the nameplate width.
  // The height ratio is intentionally >1 so the width-derived font size
  // isn't capped prematurely — the ONEPIECE font's cap height is ~0.7×
  // fontSize, so a ratio of 1.1 still fits visually inside the plate
  // while letting 4-6 char names reach full width edge-to-edge.
  textMaxWidthRatio: 0.96,
  textMaxHeightRatio: 1.1,
  // Wider letter spacing so the nameplate reads like an engraved
  // inscription and short names stretch across the widened text box.
  // Long names auto-reduce this spacing down to a natural-touch floor
  // so they still fit between the yellow frame edges.
  textLetterSpacing: 0.25,
  // Nameplate tuning for the shared 1860×1691 canvas all variants now
  // use. Blue plate is ~970×270 SVG units; the box below is sized a
  // bit larger so text can spill onto the yellow frame interior on
  // each side. The `autoCenterNameplateOnBlueMarker` flag below
  // re-centres the box on each variant's own blue marker — small X
  // shifts between characters' artwork (~35 units span) are handled
  // automatically, so one tuning works for every character.
  nameplateBox: {
    x: 370,
    y: 1288,
    width: 1100,
    height: 260,
  },
  nameplateBoxExpanded: {
    x: 370,
    y: 1288,
    width: 1100,
    height: 260,
  },
  nameplateBoxExpandAfter: 7,
  autoCenterNameplateOnBlueMarker: true,
  // Bloom post-processing so the bright emissive layers actually glow
  // like an LED sign instead of just reading as a painted colour.
  postprocessingBloom: {
    intensity: 0.35,
    luminanceThreshold: 0.6,
    luminanceSmoothing: 0.85,
  },
  // Names longer than 9 characters are allowed to shrink below the base
  // font size (down to 80% of it) so the adaptive spacing doesn't have
  // to squash letters into each other to fit.
  textShrinkAfter: 9,
  textShrinkFloorRatio: 0.45,
  // Per-length overrides — only 9 and 12 need special handling; all
  // other lengths use the default floor (or no shrink for ≤9).
  textShrinkFloorByLength: {
    9: 0.55,
    12: 0.35,
  },
  // Don't let the adaptive spacing ever pull letters into each other —
  // once the configured gap would need to go below 0.05 to fit, the
  // scene instead falls back to shrinking the font (see textShrinkAfter).
  textMinLetterSpacing: 0.05,
  // The One Piece font's Q has an oversized descender tail that
  // dragged the bbox-centred text block upward whenever a name
  // contained it. Fix: exclude Q from the centering reference (the
  // rest of the name lands exactly where a Q-less name would) and
  // scale it down so its descender stays inside the plate.
  textCharScale: {
    Q: 0.95,
  },
  textCharCenterExclude: ['Q'],
  textCharOffsetY: {
    Q: -0.05,
  },
  // Q's tail swirl pushes its bbox right edge well past the visible
  // body, so the default advance leaves a dead zone after it. Shrink
  // the advance symmetrically so Q sits tight against its neighbours.
  textCharAdvanceScale: {
    Q: 0.7,
  },
  // Font's O renders shorter than the other caps; stretch it vertically
  // around its own centre so the height lines up without affecting width.
  textCharScaleY: {
    O: 1.15,
  },
  camera: {
    position: [0, 0, 22],
    fov: 45,
    autoRotate: false,
  },
  // Lightbox SVG is ~1638×1919 — three-ish times the character-sheet size,
  // so the scale is correspondingly smaller to fit the viewport.
  scale: 0.006,
  background: '#0a0a12',
  variantImages: {
    Luffy: '/images/characters/style_1.png',
    Zoro: '/images/characters/style_2.png',
    Ace: '/images/characters/style_3.png',
    Chopper: '/images/characters/style_4.png',
    Law: '/images/characters/style_5.png',
    Shanks: '/images/characters/style_6.png',
    Nami: '/images/characters/style_7.png',
  },
}

const variantImagesOnly: Record<string, Record<string, string>> = {
  // 'one-piece-custom-led-lightbox-sign' — now a full preview config above
  // (previewConfigs[]); the entry here is retained only for documentation.
  'one-piece-custom-keychain': {
    'Luffy': '/images/characters/style_1.png',
    'Zoro': '/images/characters/style_2.png',
    'Ace': '/images/characters/style_3.png',
    'Chopper': '/images/characters/style_4.png',
    'Law': '/images/characters/style_5.png',
    'Shanks': '/images/characters/style_6.png',
    'Nami': '/images/characters/style_7.png',
    'Franky': '/images/characters/style_8.png',
    'Robin': '/images/characters/style_9.png',
    'Sanji': '/images/characters/style_10.png',
    'Brook': '/images/characters/style_11.png',
    'Ussop': '/images/characters/style_12.png',
    'Boa': '/images/characters/style_13.png',
    'Jinbe': '/images/characters/style_14.png',
    'Kaidou': '/images/characters/style_15.png',
    'Whitebeard': '/images/characters/style_16.png',
    'Roger': '/images/characters/style_17.png',
    'Buggy': '/images/characters/style_18.png',
    'Blackbeard': '/images/characters/style_19.png',
    'Black Bear': '/images/characters/style_19.png',
    'Eustass Kid': '/images/characters/style_20.png',
    'Kid': '/images/characters/style_20.png',
    'Corazon': '/images/characters/style_21.png',
    'Doflamingo': '/images/characters/style_22.png',
    'Donquixote': '/images/characters/style_23.png',
    'Don Quixote': '/images/characters/style_23.png',
    'Donquixote Pirates': '/images/characters/style_23.png',
    'Carrot': '/images/characters/style_24.png',
    'Arlong Pirates': '/images/characters/style_25.png',
    'Arlong': '/images/characters/style_25.png',
  },
}

const previewHandleAliases: Record<string, string> = {
  'attack-on-titan-custom-logo': 'attack-on-titan-custom-sign',
  'jujutsu-kaisen-custom-logo': 'jujutsu-kaisen-custom-sign',
  'anime-custom-logo-display-sign': 'demon-slayer-custom-sign',
  // Reuse the One Piece sign's composite-sign preview (and its full
  // character mapping) for the keychain. Current keychain Shopify
  // variants cover fewer characters than the sign, but the preview
  // mapping is kept complete so newly-added variants auto-resolve.
  'one-piece-custom-keychain': 'one-piece-custom-sign',
}

function resolvePreviewHandle(handle: string): string {
  return previewHandleAliases[handle] || handle
}

export function getPreviewConfig(handle: string): PreviewConfig | null {
  return previewConfigs[resolvePreviewHandle(handle)] || null
}

export function hasPreviewConfig(handle: string): boolean {
  return resolvePreviewHandle(handle) in previewConfigs
}

/** Get variant selector images — from preview config or standalone map */
export function getVariantImages(handle: string): Record<string, string> | undefined {
  const resolvedHandle = resolvePreviewHandle(handle)
  return previewConfigs[resolvedHandle]?.variantImages || variantImagesOnly[resolvedHandle]
}

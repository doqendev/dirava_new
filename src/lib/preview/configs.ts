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
  'attack-on-titan-custom-logo': {
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
      position: [0, 3, 35],
      fov: 45,
      autoRotate: true,
      autoRotateSpeed: 1,
    },
    maxChars: 15,
    scale: 1,
    background: '#0a0a12',
  },

  'anime-custom-sign': {
    type: 'composite-sign',
    font: '/fonts/preview/ONEPIECE_IL_FINAL.ttf',
    variantSvgs: {
      'Luffy': '/svgs/preview/luffy-jollyroger.svg',
      'Zoro': '/svgs/preview/zoro-jollyroger.svg',
      'Ace': '/svgs/preview/ace-jollyroger.svg',
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
      'Zoro': { text: '#2dc653', special: '#ffd400' },
      'Ace': { text: '#f38400', special: '#c80000' },
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
    background: '#1e1e2e',
  },
}

export function getPreviewConfig(handle: string): PreviewConfig | null {
  return previewConfigs[handle] || null
}

export function hasPreviewConfig(handle: string): boolean {
  return handle in previewConfigs
}

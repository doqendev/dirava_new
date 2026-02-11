declare module 'opentype.js' {
  export function parse(buffer: ArrayBuffer): any
  export function load(url: string, callback: (err: any, font: any) => void): void
}

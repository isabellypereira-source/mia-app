declare module '@jscad/io' {
  export function serialize(options: { format: string; unit?: string }, geometry: unknown[]): string
}

declare module '@jscad/modeling/src/primitives' {
  export function cuboid(options: { size: [number, number, number]; center?: [number, number, number] }): unknown
  export function cylinder(options: { radius: number; height: number; center?: [number, number, number] }): unknown
  export function sphere(options: { radius: number; center?: [number, number, number] }): unknown
}

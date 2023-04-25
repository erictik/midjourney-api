import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    outDir: 'libs',
    target: 'node16',
    platform: 'node',
    format: ['esm'],
    splitting: true,
    sourcemap: true,
    minify: false,
    shims: true,
    dts: true
  }
])
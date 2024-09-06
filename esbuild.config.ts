
import { build } from 'esbuild';

build ({
  entryPoints: ['src/app.ts'],
  bundle: true,
  platform: 'node',
  target: ['node14'],
  outfile: 'dist/bundle.js',
  minify: true,
  sourcemap: false,
}).catch(() => process.exit(1));
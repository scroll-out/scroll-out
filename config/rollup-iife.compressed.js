import size from 'rollup-plugin-filesize';
import typescript2 from 'rollup-plugin-typescript2'
import { uglify } from 'rollup-plugin-uglify';
import { minify } from 'uglify-js';
import uglifyOptions from './compress.json';

export default {
  input: 'src/main.ts',
  output: [
    { file: 'dist/scroll-out.min.js', name: 'ScrollOut', format: 'iife' },
  ],
  plugins: [
    size(),
    uglify(uglifyOptions, minify),
    typescript2({
      typescript: require('typescript')
    })
  ]
}

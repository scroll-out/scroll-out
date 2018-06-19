import size from 'rollup-plugin-filesize';
import { uglify } from 'rollup-plugin-uglify';
import { minify } from 'uglify-js';
import uglifyOptions from './compress.json';

export default {
  entry: 'src/main.js', 
  output: [ 
    { file: 'dist/scroll-out.min.js', name: 'ScrollOut', format: 'iife' },
  ],
  plugins: [
    size(),
    uglify(uglifyOptions, minify)
  ]
}
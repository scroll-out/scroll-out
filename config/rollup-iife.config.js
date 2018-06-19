import size from 'rollup-plugin-filesize';
import babelMinify from 'rollup-plugin-babel-minify';

export default {
  entry: 'src/main.js', 
  output: [
    { file: 'dist/scroll-out.js', name: 'ScrollOut', format: 'iife' }
  ]
}
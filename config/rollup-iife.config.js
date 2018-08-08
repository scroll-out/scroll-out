import typescript2 from 'rollup-plugin-typescript2'

export default {
  entry: 'src/main.ts', 
  output: [
    { file: 'dist/scroll-out.js', name: 'ScrollOut', format: 'iife' }
  ],
  plugins: [
    typescript2({
      typescript: require('typescript')
    })
  ]
}
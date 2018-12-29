import typescript2 from 'rollup-plugin-typescript2'

export default {
  input: 'src/main.ts',
  output: [
    { file: 'dist/scroll-out.js', name: 'ScrollOut', format: 'iife' }
  ],
  plugins: [
    typescript2({
      typescript: require('typescript')
    })
  ]
}

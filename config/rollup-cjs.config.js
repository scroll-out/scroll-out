
import typescript2 from 'rollup-plugin-typescript2'

export default {
  entry: 'src/main.ts',
  dest: 'lib/index.js',
  format: 'cjs',
  plugins: [
    typescript2({
      typescript: require('typescript')
    })
  ]
};

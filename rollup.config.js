import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

export default [{
  input: 'src/index.ts',
  output: {
    format: 'es',
    file: 'build/three-strip.js',
  },
  plugins: [
    typescript({
      useTsconfigDeclarationDir: true
    }),
    terser({
      format: {
        comments: false
      }
    }),
  ]
}, {
  input: 'typings/index.d.ts',
  output: [
    { file: 'build/three-strip.d.ts', format: 'es' }
  ],
  plugins: [
    dts()
  ]
}];
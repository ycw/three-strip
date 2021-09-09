import typescript from 'rollup-plugin-typescript2';

export default [{
  input: 'src/three-strip.ts',
  output: {
    format: 'es',
    file: 'build/three-strip.js',
  },
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: { declaration: false }
      }
    })
  ]
}];
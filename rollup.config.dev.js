import typescript from 'rollup-plugin-typescript2';

export default [{
  input: 'src/index.ts',
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
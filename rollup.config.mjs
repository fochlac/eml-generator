import typescript from '@rollup/plugin-typescript';

export default [
  // Library build
  {
    input: 'src/eml.ts',
    output: [
      {
        file: 'dist/eml.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/eml.mjs',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true,
        declaration: true,
        outDir: 'dist'
      })
    ]
  },
  // CLI build
  {
    input: 'src/cli.ts',
    output: {
      file: 'dist/cli.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        sourceMap: true,
        module: 'commonjs'
      })
    ],
    external: ['fs', 'path']
  }
];
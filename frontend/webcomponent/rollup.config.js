// rollup.config.js
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import fs from 'fs'

export default {
  input: 'src/index.ts',
  output: {
    file: './dist/openvidu-meet.bundle.min.js',
    format: 'iife',
    name: 'OpenViduMeet',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    terser(),
    {
      name: 'copy-bundle',
      writeBundle () {
        fs.copyFileSync('./dist/openvidu-meet.bundle.min.js', './tests/app/openvidu-meet.bundle.min.js')
        console.log('✅ Bundle copied to tests/app/openvidu-meet.bundle.min.js')
      }
    }
  ]
}

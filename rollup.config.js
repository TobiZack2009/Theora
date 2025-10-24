import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/js/main.js',
  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: !production,
    name: 'Theora'
  },
  plugins: [
    json(),
    
    replace({
      preventAssignment: true,
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY || ''),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.VITE_FIREBASE_APP_ID || ''),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID || ''),
    }),
    
    postcss({
      extensions: ['.css'],
      extract: 'bundle.css',
      minimize: production,
      config: {
        path: './postcss.config.cjs'
      }
    }),

    resolve({
      browser: true,
      preferBuiltins: false
    }),

    commonjs(),

    copy({
      targets: [
        { src: 'src/index.html', dest: 'dist' },
        { src: 'src/sw.js', dest: 'dist' },
        { src: 'public/assets/*', dest: 'dist/assets' }
      ],
      hook: 'writeBundle'
    }),

    !production && serve({
      open: false,
      contentBase: 'dist',
      host: '0.0.0.0',
      port: 5000,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }),

    !production && livereload('dist'),

    production && terser()
  ]
};

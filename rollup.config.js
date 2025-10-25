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
    file: 'site/bundle.js',
    format: 'iife',
    sourcemap: !production,
    name: 'Theora'
  },
  plugins: [
    json(),
     
    replace({
      preventAssignment: true,
      // --- AI Provider Configuration ---
      // Set the primary AI provider: 'bedrock' or 'edenai'
      'import.meta.env.AI_PROVIDER': JSON.stringify('bedrock'), 

      // --- AWS Bedrock Configuration (from environment variables) ---
      'import.meta.env.AWS_ACCESS_KEY_ID': JSON.stringify(process.env.AWS_ACCESS_KEY_ID || "AKIAZYCS7YLHHIAYLLR3"),

      'import.meta.env.AWS_SECRET_ACCESS_KEY': JSON.stringify(process.env.AWS_SECRET_ACCESS_KEY || "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"),
      'import.meta.env.AWS_REGION': JSON.stringify(process.env.AWS_REGION || 'us-east-1'),

      // --- Eden AI Configuration (as constants) ---
      'import.meta.env.EDEN_AI_API_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDBjOWRhZWUtNmY4Ni00YWIzLWFmYmUtOGVhMzFlNDM2NzUwIiwidHlwZSI6ImFwaV90b2tlbiIsIm5hbWUiOiJ0ZXN0MiIsImlzX2N1c3RvbSI6dHJ1ZX0.NJjYrUzIywdV5EZJoErUd3WMNz4bbNA1m-DlCCH87Ac'), // Replace with your actual key
      'import.meta.env.EDEN_AI_MODEL': JSON.stringify('deepseek'), // Specify desired Eden AI model

      // --- Firebase Configuration ---
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY || "AIzaSyBb8iSt9rC0yCc-oyAJU2P7b6AHZlrCQ-E"),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.VITE_FIREBASE_APP_ID || '1:748096526135:web:8fd5e9e8bae9f9b34bacb2'),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID || 'theora-2d2b7'),
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
        { src: 'src/index.html', dest: 'site' },
        { src: 'src/sw.js', dest: 'site' },
        { src: 'public/assets/*', dest: 'site/assets' }
      ],
      hook: 'writeBundle'
    }),

    !production && serve({
      open: false,
      contentBase: 'site',
      host: '0.0.0.0',
      port: 5005,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }),

    !production && livereload('site'),

    production && terser()
  ]
};

import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import flowEntry from 'rollup-plugin-flow-entry';
import clear from 'rollup-plugin-clear';
import flow from 'rollup-plugin-flow';

import packageJson from './package.json';

const configuredFlow = flow({ all: true, pretty: true });

const { dependencies } = packageJson;

const deps = dependencies && Object.keys(dependencies).join('|');
const reg = deps && new RegExp(`^(${deps})($|/)`);
const baseDistPath = './lib/';

const banner = `
/**
 * ${packageJson.name} v${packageJson.version}
 * ${packageJson.description}
 */
`;

export default [
  {
    input: './src/index.js',
    output: {
      file: `${baseDistPath}index.js`,
      format: 'cjs',
      banner,
    },
    plugins: [
      clear({
        targets: ['lib'],
      }),
      flowEntry(),
      configuredFlow,
      babel(),
      commonjs(),
    ],
    external: id => !!reg && reg.test(id),
  },
];

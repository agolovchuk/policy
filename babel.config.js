module.exports = function config(api) {
  return {
    plugins: [
      '@babel/plugin-proposal-class-properties',
      'transform-es2015-classes',
    ],
    presets: [
      '@babel/flow',
      [
        '@babel/env',
        {
          targets: {
            node: 6,
            browsers: ['last 4 version', '> 1%', 'not dead'],
          },
          forceAllTransforms: api.env('production'),
        },
      ],
    ],
    env: {
      test: {
        presets: [
          '@babel/preset-env',
        ],
        plugins: [
          '@babel/plugin-proposal-class-properties',
          'transform-es2015-classes',
        ],
      },
    },
  };
};

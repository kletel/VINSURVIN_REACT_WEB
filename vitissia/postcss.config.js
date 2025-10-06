module.exports = {
  plugins: {
    //tailwindcss: {},
    '@tailwindcss/postcss7-compat': {},
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': true
      }
    },
    autoprefixer: {},
  },
}

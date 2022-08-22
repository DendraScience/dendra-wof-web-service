// SEE: http://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  env: {
    mocha: true,
    node: true
  },
  extends: ['standard', 'prettier'],
  plugins: ['import', 'prettier', 'standard'],
  parserOptions: {
    sourceType: 'module'
  },
  rules: {
    'prettier/prettier': 'error'
  },
  globals: {
    chai: true,
    assert: true,
    expect: true,
    should: true
  }
}

/**
 * Serializers variable tests
 */

import {
  variableStart,
  variableEnd
} from '../../../src/soap/serializers/variable.js'

describe('Serializers', function () {
  describe('variable', function () {
    it('should serialize variableStart', function () {
      expect(variableStart()).to.equal('<variable>')
    })

    it('should serialize variableEnd', function () {
      expect(variableEnd()).to.equal('</variable>')
    })
  })
})

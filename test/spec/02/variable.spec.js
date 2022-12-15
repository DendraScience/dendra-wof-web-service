/**
 * Serializers variable tests
 */

import {
  variableStart,
  variableEnd,
  variablesResultStart,
  variablesResultEnd,
  variablesResponseStart,
  variablesResponseEnd,
  variablesStart,
  variablesEnd
} from '../../../src/soap/serializers/variable.js'

describe('Serializers', function () {
  describe('variable', function () {
    it('should serialize variableStart', function () {
      expect(variableStart()).to.equal('<variable>')
    })

    it('should serialize variableEnd', function () {
      expect(variableEnd()).to.equal('</variable>')
    })

    it('should serialize variablesResultStart', function () {
      expect(variablesResultStart()).to.equal('<GetVariablesResult>')
    })

    it('should serialize variablesResultEnd', function () {
      expect(variablesResultEnd()).to.equal('</GetVariablesResult>')
    })

    it('should serialize variablesResponseStart flavor 1', function () {
      expect(variablesResponseStart({ isObject: false })).to.equal(
        '<variablesResponse xmlns="http://www.cuahsi.org/waterML/1.1/"' +
          ' xmlns:gml="http://www.opengis.net/gml"' +
          ' xmlns:wtr="http://www.cuahsi.org/waterML/"' +
          ' xmlns:xlink="http://www.w3.org/1999/xlink">'
      )
    })

    it('should serialize variablesResponseStart flavor 2', function () {
      expect(variablesResponseStart({ isObject: true })).to.equal(
        '<variablesResponse xmlns="http://www.cuahsi.org/waterML/1.1/">'
      )
    })

    it('should serialize variablesResponseStart flavor 3', function () {
      expect(variablesResponseStart({ hasAttribute: false })).to.equal(
        '<variablesResponse xmlns:gml="http://www.opengis.net/gml"' +
          ' xmlns:wtr="http://www.cuahsi.org/waterML/"' +
          ' xmlns:xlink="http://www.w3.org/1999/xlink">'
      )
    })

    it('should serialize variablesResponseStart flavor 4', function () {
      expect(
        variablesResponseStart({ hasAttribute: false, isObject: true })
      ).to.equal('<variablesResponse>')
    })

    it('should serialize variablesResponseStart flavor 5', function () {
      expect(
        variablesResponseStart({
          hasAttribute: true,
          isObject: false,
          hasXMLSchema: true
        })
      ).to.equal(
        '<variablesResponse xmlns="http://www.cuahsi.org/waterML/1.1/"' +
          ' xmlns:gml="http://www.opengis.net/gml"' +
          ' xmlns:wtr="http://www.cuahsi.org/waterML/"' +
          ' xmlns:xlink="http://www.w3.org/1999/xlink"' +
          ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
          ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
      )
    })

    it('should serialize variablesResponseEnd', function () {
      expect(variablesResponseEnd()).to.equal('</variablesResponse>')
    })

    it('should serialize variablesStart', function () {
      expect(variablesStart()).to.equal('<variables>')
    })

    it('should serialize variablesEnd', function () {
      expect(variablesEnd()).to.equal('</variables>')
    })
  })
})

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
  variablesEnd,
  variableInfoType
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

    it('should serialize variableInfoType', function () {
      const datastream = {
        terms_info: {
          unit_tag: 'dt_Unit_MilligramPerLiter'
        }
      }
      const organizationRefsMap = new Map([
        ['his.odm.service.Vocabulary', 'WOF_TEST']
      ])
      const refsMap = new Map([
        ['his.odm.variables.VariableCode', 'VariableCode-full'],
        ['his.odm.variables.VariableID', '21'],
        ['his.odm.variables.NoDataValue', '-9999'],
        ['his.odm.variables.TimeSupport', '0'],
        ['his.odm.variables.Speciation', 'Not Applicable'],
        ['his.odm.variables.IsRegular', 'true'],
        ['time_unit_tag', 'MilligramPerLiter'],
        ['his.odm.variables.VariableName', 'Phosphorus, organic'],
        ['his.odm.variables.ValueType', 'Field Observation'],
        ['his.odm.variables.DataType', 'Regular Sampling'],
        ['his.odm.variables.GeneralCategory', 'Water Quality'],
        ['his.odm.variables.SampleMedium', 'Surface water']
      ])
      const unitCV = {
        dt_Unit_MilligramPerLiter: {
          UnitsID: '199',
          UnitsName: 'milligrams per liter',
          UnitsType: 'Concentration',
          UnitsAbbreviation: 'mg/L'
        }
      }
      expect(
        variableInfoType({ datastream, organizationRefsMap, refsMap, unitCV })
      ).to.equal(
        '<variableCode vocabulary="WOF_TEST" default="true" variableID="21">VariableCode-full</variableCode> ' +
          '<variableName>Phosphorus, organic</variableName>' +
          '<valueType>Field Observation</valueType>' +
          '<dataType>Regular Sampling</dataType>' +
          '<generalCategory>Water Quality</generalCategory>' +
          '<sampleMedium>Surface water</sampleMedium>' +
          '<unit><unitName>milligrams per liter</unitName><unitType>Concentration</unitType><unitAbbreviation>mg/L</unitAbbreviation><unitCode>199</unitCode></unit>' +
          '<noDataValue>-9999</noDataValue>' +
          '<timeScale isRegular="true">' +
          '<unit><unitName>milligrams per liter</unitName><unitType>Concentration</unitType><unitAbbreviation>mg/L</unitAbbreviation><unitCode>199</unitCode></unit>' +
          '<timeSupport>0</timeSupport>' +
          '</timeScale>' +
          '<speciation>Not Applicable</speciation>'
      )
    })
  })
})

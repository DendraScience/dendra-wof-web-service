/**
 * Serializers tests
 */

import {
  responseStart,
  soapBodyStart
} from '../../../src/soap/serializers/common.js'
// import { siteInfoType } from '../../../src/soap/serializers/site.js'

describe('Serializers', function () {
  describe('common', function () {
    it('should serialize responseStart', function () {
      expect(responseStart('elementName')).to.equal(
        '<elementName xmlns="http://www.cuahsi.org/his/1.1/ws/">'
      )
    })

    it('should serialize soapBodyStart', function () {
      expect(soapBodyStart()).to.equal('<soap:Body>')
    })
  })

  describe('query', function () {})

  // describe('site', function () {
  //   it('should serialize siteInfoType flavor 1', function () {
  //     expect(
  //       siteInfoType({
  //         station: {
  //           _id: 'i98573457347593479537495388',
  //           name: 'My Station'
  //         }
  //       })
  //     ).to.equal('<siteName>My Station</siteName>')
  //   })
  // })
})

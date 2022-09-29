/**
 * Serializers query tests
 */
import {
  queryInfoStart,
  queryInfoEnd,
  queryInfoType,
  queryInfoNote
} from '../../../src/soap/serializers/query.js'
describe('Serializers', function () {
  describe('query', function () {
    it('should serialize queryInfoStart', function () {
      expect(queryInfoStart()).to.equal('<queryInfo>')
    })

    it('should serialize queryInfoEnd', function () {
      expect(queryInfoEnd()).to.equal('</queryInfo>')
    })

    it('should serialize queryInfoType', function () {
      const method = 'GetSiteObject'

      expect(
        queryInfoType({
          method,
          parameters: [
            ['site', 'woftest:sitecode-min'],
            ['site', 'woftest:sitecode-full']
          ],
          date: new Date(1661964219333)
        })
      ).to.equal(
        `<creationTime>${new Date(
          1661964219333
        ).toISOString()}</creationTime>` +
          '<criteria MethodCalled="GetSiteObject">' +
          '<parameter name="site" value="woftest:sitecode-min"/>' +
          '<parameter name="site" value="woftest:sitecode-full"/>' +
          '</criteria>'
      )
    })

    it('should serialize queryInfoNote', function () {
      expect(queryInfoNote({ note: 'OD Web Service' })).to.equal(
        '<note>OD Web Service</note>'
      )
    })
  })
})

/**
 * Serializers query tests
 */
import {
  queryInfoStart,
  queryInfoEnd,
  queryInfoType
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
            ['authToken', ''],
            ['site', 'string'],
            ['site', 'string']
          ],
          date: new Date(1661964219333)
        })
      ).to.equal(
        `<creationTime>${new Date(
          1661964219333
        ).toISOString()}</creationTime>` +
          '<criteria MethodCalled="GetSiteObject">' +
          '<parameter name="site" value="string"/>' +
          '<parameter name="site" value="string"/>' +
          '</criteria>'
      )
    })
  })
})

/**
 * Serializers query tests
 */
import {
  queryInfoStart,
  queryInfoEnd
  // queryInfoType
} from '../../../src/soap/serializers/query.js'
describe('Serializers', function () {
  describe('query', function () {
    it('should serialize queryInfoStart', function () {
      expect(queryInfoStart()).to.equal('<queryInfo>')
    })

    it('should serialize queryInfoEnd', function () {
      expect(queryInfoEnd()).to.equal('</queryInfo>')
    })

    // it('should serialize queryInfoType', function () {
    //   expect(
    //     queryInfoType({
    //       method: 'geySiteInfo()',
    //       parameters: ['authToken', 'refreshToken']
    //     })
    //   ).to.equal(
    //     `<creationTime>${new Date().toISOString()}</creationTime>` +
    //       '<criteria MethodCalled="geySiteInfo()">' +
    //       '<parameter name="a" value="u"/>' +
    //       '<parameter name="r" value="e"/>' +
    //       '</criteria>'
    //   )
    // })
  })
})

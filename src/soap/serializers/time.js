/**
 *
 * @param {number} n
 * @returns -6 => -06:00 | -5.5 => -5.30 | 5.75 => 05.45
 */
export function timeOffset(offset) {
  // Check sign of given offset
  let sign = offset >= 0 ? 1 : -1

  // Set positive value of number of sign negative
  offset = offset * sign

  // Separate the int from the decimal part
  const hour = Math.floor(offset)
  let decpart = offset - hour

  const min = 1 / 60
  // Round to nearest minute
  decpart = min * Math.round(decpart / min)

  let minute = Math.floor(decpart * 60) + ''

  // Add padding if need
  if (minute.length < 2) {
    minute = '0' + minute
  }

  // Add Sign in final result
  sign = sign === 1 ? '' : '-'

  const value = sign + hour + '.' + minute

  const result = twoDigitNumber(value).replace('.', ':')
  return result
}

/**
 *
 * @param {string} n
 * @returns -6 => -06 || 6 => 06 || 10 => 10 || 0 => 00
 */
export function twoDigitNumber(n) {
  if (n <= 10 && n >= 0) {
    return '0' + n
  } else if (n < 0 && n > -10) {
    return [n.slice(0, 1), '0', n.slice(1)].join('')
  } else {
    return n
  }
}

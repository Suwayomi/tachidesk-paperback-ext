(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":2,"ieee754":3}],3:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],4:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    /**
     * @deprecated use {@link Source.getSearchResults getSearchResults} instead
     */
    searchRequest(query, metadata) {
        return this.getSearchResults(query, metadata);
    }
    /**
     * @deprecated use {@link Source.getSearchTags} instead
     */
    async getTags() {
        // @ts-ignore
        return this.getSearchTags?.();
    }
}
exports.Source = Source;
// Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
function convertTime(timeAgo) {
    let time;
    let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
    trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
    if (timeAgo.includes('minutes')) {
        time = new Date(Date.now() - trimmed * 60000);
    }
    else if (timeAgo.includes('hours')) {
        time = new Date(Date.now() - trimmed * 3600000);
    }
    else if (timeAgo.includes('days')) {
        time = new Date(Date.now() - trimmed * 86400000);
    }
    else if (timeAgo.includes('year') || timeAgo.includes('years')) {
        time = new Date(Date.now() - trimmed * 31556952000);
    }
    else {
        time = new Date(Date.now());
    }
    return time;
}
exports.convertTime = convertTime;
/**
 * When a function requires a POST body, it always should be defined as a JsonObject
 * and then passed through this function to ensure that it's encoded properly.
 * @param obj
 */
function urlEncodeObject(obj) {
    let ret = {};
    for (const entry of Object.entries(obj)) {
        ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
    }
    return ret;
}
exports.urlEncodeObject = urlEncodeObject;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracker = void 0;
class Tracker {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
}
exports.Tracker = Tracker;

},{}],6:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./Tracker"), exports);

},{"./Source":4,"./Tracker":5}],7:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./base"), exports);
__exportStar(require("./models"), exports);

},{"./base":6,"./models":50}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],9:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],10:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],11:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],12:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],13:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],14:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],15:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],16:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],17:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],18:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],19:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],20:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],21:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],22:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],23:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],24:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],25:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],26:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Button"), exports);
__exportStar(require("./Form"), exports);
__exportStar(require("./Header"), exports);
__exportStar(require("./InputField"), exports);
__exportStar(require("./Label"), exports);
__exportStar(require("./Link"), exports);
__exportStar(require("./MultilineLabel"), exports);
__exportStar(require("./NavigationButton"), exports);
__exportStar(require("./OAuthButton"), exports);
__exportStar(require("./Section"), exports);
__exportStar(require("./Select"), exports);
__exportStar(require("./Switch"), exports);
__exportStar(require("./WebViewButton"), exports);
__exportStar(require("./FormRow"), exports);
__exportStar(require("./Stepper"), exports);

},{"./Button":11,"./Form":12,"./FormRow":13,"./Header":14,"./InputField":15,"./Label":16,"./Link":17,"./MultilineLabel":18,"./NavigationButton":19,"./OAuthButton":20,"./Section":21,"./Select":22,"./Stepper":23,"./Switch":24,"./WebViewButton":25}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSectionType = void 0;
var HomeSectionType;
(function (HomeSectionType) {
    HomeSectionType["singleRowNormal"] = "singleRowNormal";
    HomeSectionType["singleRowLarge"] = "singleRowLarge";
    HomeSectionType["doubleRow"] = "doubleRow";
    HomeSectionType["featured"] = "featured";
})(HomeSectionType = exports.HomeSectionType || (exports.HomeSectionType = {}));

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageCode = void 0;
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["UNKNOWN"] = "_unknown";
    LanguageCode["BENGALI"] = "bd";
    LanguageCode["BULGARIAN"] = "bg";
    LanguageCode["BRAZILIAN"] = "br";
    LanguageCode["CHINEESE"] = "cn";
    LanguageCode["CZECH"] = "cz";
    LanguageCode["GERMAN"] = "de";
    LanguageCode["DANISH"] = "dk";
    LanguageCode["ENGLISH"] = "gb";
    LanguageCode["SPANISH"] = "es";
    LanguageCode["FINNISH"] = "fi";
    LanguageCode["FRENCH"] = "fr";
    LanguageCode["WELSH"] = "gb";
    LanguageCode["GREEK"] = "gr";
    LanguageCode["CHINEESE_HONGKONG"] = "hk";
    LanguageCode["HUNGARIAN"] = "hu";
    LanguageCode["INDONESIAN"] = "id";
    LanguageCode["ISRELI"] = "il";
    LanguageCode["INDIAN"] = "in";
    LanguageCode["IRAN"] = "ir";
    LanguageCode["ITALIAN"] = "it";
    LanguageCode["JAPANESE"] = "jp";
    LanguageCode["KOREAN"] = "kr";
    LanguageCode["LITHUANIAN"] = "lt";
    LanguageCode["MONGOLIAN"] = "mn";
    LanguageCode["MEXIAN"] = "mx";
    LanguageCode["MALAY"] = "my";
    LanguageCode["DUTCH"] = "nl";
    LanguageCode["NORWEGIAN"] = "no";
    LanguageCode["PHILIPPINE"] = "ph";
    LanguageCode["POLISH"] = "pl";
    LanguageCode["PORTUGUESE"] = "pt";
    LanguageCode["ROMANIAN"] = "ro";
    LanguageCode["RUSSIAN"] = "ru";
    LanguageCode["SANSKRIT"] = "sa";
    LanguageCode["SAMI"] = "si";
    LanguageCode["THAI"] = "th";
    LanguageCode["TURKISH"] = "tr";
    LanguageCode["UKRAINIAN"] = "ua";
    LanguageCode["VIETNAMESE"] = "vn";
})(LanguageCode = exports.LanguageCode || (exports.LanguageCode = {}));

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaStatus = void 0;
var MangaStatus;
(function (MangaStatus) {
    MangaStatus[MangaStatus["ONGOING"] = 1] = "ONGOING";
    MangaStatus[MangaStatus["COMPLETED"] = 0] = "COMPLETED";
    MangaStatus[MangaStatus["UNKNOWN"] = 2] = "UNKNOWN";
    MangaStatus[MangaStatus["ABANDONED"] = 3] = "ABANDONED";
    MangaStatus[MangaStatus["HIATUS"] = 4] = "HIATUS";
})(MangaStatus = exports.MangaStatus || (exports.MangaStatus = {}));

},{}],30:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],31:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],32:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],33:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],34:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],35:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],36:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],37:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],38:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],39:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],40:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchOperator = void 0;
var SearchOperator;
(function (SearchOperator) {
    SearchOperator["AND"] = "AND";
    SearchOperator["OR"] = "OR";
})(SearchOperator = exports.SearchOperator || (exports.SearchOperator = {}));

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = void 0;
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],43:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],44:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagType = void 0;
/**
 * An enumerator which {@link SourceTags} uses to define the color of the tag rendered on the website.
 * Five types are available: blue, green, grey, yellow and red, the default one is blue.
 * Common colors are red for (Broken), yellow for (+18), grey for (Country-Proof)
 */
var TagType;
(function (TagType) {
    TagType["BLUE"] = "default";
    TagType["GREEN"] = "success";
    TagType["GREY"] = "info";
    TagType["YELLOW"] = "warning";
    TagType["RED"] = "danger";
})(TagType = exports.TagType || (exports.TagType = {}));

},{}],46:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],47:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],48:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],49:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"dup":8}],50:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Chapter"), exports);
__exportStar(require("./HomeSection"), exports);
__exportStar(require("./DynamicUI"), exports);
__exportStar(require("./ChapterDetails"), exports);
__exportStar(require("./Manga"), exports);
__exportStar(require("./MangaTile"), exports);
__exportStar(require("./RequestObject"), exports);
__exportStar(require("./SearchRequest"), exports);
__exportStar(require("./TagSection"), exports);
__exportStar(require("./SourceTag"), exports);
__exportStar(require("./Languages"), exports);
__exportStar(require("./Constants"), exports);
__exportStar(require("./MangaUpdate"), exports);
__exportStar(require("./PagedResults"), exports);
__exportStar(require("./ResponseObject"), exports);
__exportStar(require("./RequestManager"), exports);
__exportStar(require("./RequestHeaders"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./SourceStateManager"), exports);
__exportStar(require("./RequestInterceptor"), exports);
__exportStar(require("./TrackedManga"), exports);
__exportStar(require("./SourceManga"), exports);
__exportStar(require("./TrackedMangaChapterReadAction"), exports);
__exportStar(require("./TrackerActionQueue"), exports);
__exportStar(require("./SearchField"), exports);
__exportStar(require("./RawData"), exports);
__exportStar(require("./SearchFilter"), exports);

},{"./Chapter":8,"./ChapterDetails":9,"./Constants":10,"./DynamicUI":26,"./HomeSection":27,"./Languages":28,"./Manga":29,"./MangaTile":30,"./MangaUpdate":31,"./PagedResults":32,"./RawData":33,"./RequestHeaders":34,"./RequestInterceptor":35,"./RequestManager":36,"./RequestObject":37,"./ResponseObject":38,"./SearchField":39,"./SearchFilter":40,"./SearchRequest":41,"./SourceInfo":42,"./SourceManga":43,"./SourceStateManager":44,"./SourceTag":45,"./TagSection":46,"./TrackedManga":47,"./TrackedMangaChapterReadAction":48,"./TrackerActionQueue":49}],51:[function(require,module,exports){
(function (Buffer){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStateData = exports.retrieveStateData = exports.getOptions = exports.getTachiAPI = exports.getAuthorizationString = exports.getServerUnavailableMangaTiles = void 0;
function getServerUnavailableMangaTiles() {
    // This tile is used as a placeholder when the server is unavailable
    return [
        createMangaTile({
            id: "Tachidesk",
            title: createIconText({ text: "Tachidesk" }),
            image: "",
            subtitleText: createIconText({ text: "unavailable" }),
        }),
    ];
}
exports.getServerUnavailableMangaTiles = getServerUnavailableMangaTiles;
// 
// TACHI API STATE METHODS
//
const DEFAULT_TACHI_SERVER_ADDRESS = 'http://10.0.0.127:4567';
const DEFAULT_TACHI_API = DEFAULT_TACHI_SERVER_ADDRESS + '/api/v1';
const DEFAULT_TACHI_USERNAME = '';
const DEFAULT_TACHI_PASSWORD = '';
const DEFAULT_SHOW_ON_DECK = false;
const DEFAULT_SORT_RESULTS_ALPHABETICALLY = true;
const DEFAULT_SHOW_CONTINUE_READING = false;
async function getAuthorizationString(stateManager) {
    return await stateManager.keychain.retrieve('authorization') ?? '';
}
exports.getAuthorizationString = getAuthorizationString;
async function getTachiAPI(stateManager) {
    return await stateManager.retrieve('tachiAPI') ?? DEFAULT_TACHI_API;
}
exports.getTachiAPI = getTachiAPI;
async function getOptions(stateManager) {
    const showOnDeck = await stateManager.retrieve('showOnDeck') ?? DEFAULT_SHOW_ON_DECK;
    const orderResultsAlphabetically = await stateManager.retrieve('orderResultsAlphabetically') ?? DEFAULT_SORT_RESULTS_ALPHABETICALLY;
    const showContinueReading = await stateManager.retrieve('showContinueReading') ?? DEFAULT_SHOW_CONTINUE_READING;
    return { showOnDeck, orderResultsAlphabetically, showContinueReading };
}
exports.getOptions = getOptions;
async function retrieveStateData(stateManager) {
    // Return serverURL, serverUsername and serverPassword saved in the source.
    // Used to show already saved data in settings
    const serverURL = await stateManager.retrieve('serverAddress') ?? DEFAULT_TACHI_SERVER_ADDRESS;
    const serverUsername = await stateManager.keychain.retrieve('serverUsername') ?? DEFAULT_TACHI_USERNAME;
    const serverPassword = await stateManager.keychain.retrieve('serverPassword') ?? DEFAULT_TACHI_PASSWORD;
    const showOnDeck = await stateManager.retrieve('showOnDeck') ?? DEFAULT_SHOW_ON_DECK;
    const orderResultsAlphabetically = await stateManager.retrieve('orderResultsAlphabetically') ?? DEFAULT_SORT_RESULTS_ALPHABETICALLY;
    const showContinueReading = await stateManager.retrieve('showContinueReading') ?? DEFAULT_SHOW_CONTINUE_READING;
    return { serverURL, serverUsername, serverPassword, showOnDeck, orderResultsAlphabetically, showContinueReading };
}
exports.retrieveStateData = retrieveStateData;
async function setStateData(stateManager, data) {
    await setTachiServerAddress(stateManager, data['serverAddress'] ?? DEFAULT_TACHI_SERVER_ADDRESS);
    await setCredentials(stateManager, data['serverUsername'] ?? DEFAULT_TACHI_USERNAME, data['serverPassword'] ?? DEFAULT_TACHI_PASSWORD);
    await setOptions(stateManager, data['showOnDeck'] ?? DEFAULT_SHOW_ON_DECK, data['orderResultsAlphabetically'] ?? DEFAULT_SORT_RESULTS_ALPHABETICALLY, data['showContinueReading'] ?? DEFAULT_SHOW_CONTINUE_READING);
}
exports.setStateData = setStateData;
async function setTachiServerAddress(stateManager, apiUri) {
    await stateManager.store('serverAddress', apiUri);
    await stateManager.store('tachiAPI', createtachiAPI(apiUri));
}
async function setCredentials(stateManager, username, password) {
    await stateManager.keychain.store('serverUsername', username);
    await stateManager.keychain.store('serverPassword', password);
    await stateManager.keychain.store('authorization', createAuthorizationString(username, password));
}
async function setOptions(stateManager, showOnDeck, orderResultsAlphabetically, showContinueReading) {
    await stateManager.store('showOnDeck', showOnDeck);
    await stateManager.store('orderResultsAlphabetically', orderResultsAlphabetically);
    await stateManager.store('showContinueReading', showContinueReading);
}
function createAuthorizationString(username, password) {
    return 'Basic ' + Buffer.from(username + ':' + password, 'binary').toString('base64');
}
function createtachiAPI(serverAddress) {
    return serverAddress + (serverAddress.slice(-1) === '/' ? 'api/v1' : '/api/v1');
}

}).call(this)}).call(this,require("buffer").Buffer)
},{"buffer":2}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLangCode = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const reverseLangCode = {
    _unknown: paperback_extensions_common_1.LanguageCode.UNKNOWN,
    bn: paperback_extensions_common_1.LanguageCode.BENGALI,
    bg: paperback_extensions_common_1.LanguageCode.BULGARIAN,
    // 'br': LanguageCode.BRAZILIAN,         // use pt: Portuguese
    zs: paperback_extensions_common_1.LanguageCode.CHINEESE,
    cs: paperback_extensions_common_1.LanguageCode.CZECH,
    de: paperback_extensions_common_1.LanguageCode.GERMAN,
    da: paperback_extensions_common_1.LanguageCode.DANISH,
    en: paperback_extensions_common_1.LanguageCode.ENGLISH,
    es: paperback_extensions_common_1.LanguageCode.SPANISH,
    fi: paperback_extensions_common_1.LanguageCode.FINNISH,
    fr: paperback_extensions_common_1.LanguageCode.FRENCH,
    el: paperback_extensions_common_1.LanguageCode.GREEK,
    // 'hk': LanguageCode.CHINEESE_HONGKONG,
    hu: paperback_extensions_common_1.LanguageCode.HUNGARIAN,
    id: paperback_extensions_common_1.LanguageCode.INDONESIAN,
    he: paperback_extensions_common_1.LanguageCode.ISRELI,
    hi: paperback_extensions_common_1.LanguageCode.INDIAN,
    fa: paperback_extensions_common_1.LanguageCode.IRAN,
    it: paperback_extensions_common_1.LanguageCode.ITALIAN,
    ja: paperback_extensions_common_1.LanguageCode.JAPANESE,
    ko: paperback_extensions_common_1.LanguageCode.KOREAN,
    lt: paperback_extensions_common_1.LanguageCode.LITHUANIAN,
    mn: paperback_extensions_common_1.LanguageCode.MONGOLIAN,
    // 'mx': LanguageCode.MEXIAN,        // use es: Spanish
    // 'my': LanguageCode.MALAY,
    nl: paperback_extensions_common_1.LanguageCode.DUTCH,
    no: paperback_extensions_common_1.LanguageCode.NORWEGIAN,
    fil: paperback_extensions_common_1.LanguageCode.PHILIPPINE,
    pl: paperback_extensions_common_1.LanguageCode.POLISH,
    pt: paperback_extensions_common_1.LanguageCode.PORTUGUESE,
    ro: paperback_extensions_common_1.LanguageCode.ROMANIAN,
    ru: paperback_extensions_common_1.LanguageCode.RUSSIAN,
    sa: paperback_extensions_common_1.LanguageCode.SANSKRIT,
    // 'si': LanguageCode.SAMI,
    th: paperback_extensions_common_1.LanguageCode.THAI,
    tr: paperback_extensions_common_1.LanguageCode.TURKISH,
    uk: paperback_extensions_common_1.LanguageCode.UKRAINIAN,
    vi: paperback_extensions_common_1.LanguageCode.VIETNAMESE,
};
const parseLangCode = (code) => {
    // The code can have the format 'en' or 'en-gb'.
    // We only use the first 2 or 3 letters.
    // There is 1 three letters code
    if (code.substr(0, 3) === "fil") {
        return paperback_extensions_common_1.LanguageCode.PHILIPPINE;
    }
    // Other are two letters codes
    return reverseLangCode[code.substr(0, 2)] ?? paperback_extensions_common_1.LanguageCode.UNKNOWN;
};
exports.parseLangCode = parseLangCode;

},{"paperback-extensions-common":7}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSettingsButton = exports.TDSettings = exports.getSources = exports.getSourcesList = exports.TDSources = exports.testServerSettingsMenu = exports.serverSettingsMenu = exports.testServerSettings = void 0;
const Common_1 = require("./Common");
/* Helper functions */
const testServerSettings = async (stateManager, requestManager) => {
    // Try to establish a connection with the server. Return an human readable string containing the test result
    const tachiAPI = await (0, Common_1.getTachiAPI)(stateManager);
    const authorization = await (0, Common_1.getAuthorizationString)(stateManager);
    // We check credentials are set in server settings
    if (tachiAPI === null || authorization === null) {
        return "Impossible: Unset credentials in server settings";
    }
    // To test these information, we try to make a connection to the server
    // We could use a better endpoint to test the connection
    const request = createRequestObject({
        url: `${tachiAPI}/settings/about`,
        method: "GET",
        incognito: true,
        headers: { authorization: authorization },
    });
    let responseStatus = undefined;
    try {
        const response = await requestManager.schedule(request, 1);
        responseStatus = response.status;
        JSON.parse(response.data); // throws error if an non json is found
    }
    catch (error) {
        // If the server is unavailable error.message will be 'AsyncOperationTimedOutError'
        return `Failed: Could not connect to server - ${error.message}`;
    }
    switch (responseStatus) {
        case 200: {
            return "Successful connection!";
        }
        case 401: {
            return "Error 401 Unauthorized: Invalid credentials";
        }
        default: {
            return `Error ${responseStatus}`;
        }
    }
};
exports.testServerSettings = testServerSettings;
/* UI definition */
// NOTE: Submitted data won't be tested
const serverSettingsMenu = (stateManager) => {
    return createNavigationButton({
        id: "server_settings",
        value: "",
        label: "Server Settings",
        form: createForm({
            onSubmit: async (values) => (0, Common_1.setStateData)(stateManager, values),
            validate: async () => true,
            sections: async () => [
                createSection({
                    id: "serverSettings",
                    header: "Server Settings",
                    footer: "Tested on Tachidesk Server version: v0.6.5 r1125",
                    rows: async () => (0, Common_1.retrieveStateData)(stateManager).then((values) => [
                        createInputField({
                            id: "serverAddress",
                            label: "Server URL",
                            placeholder: "http://127.0.0.1:8080",
                            value: values.serverURL,
                            maskInput: false,
                        }),
                        // createInputField({
                        //     id: "serverUsername",
                        //     label: "Email",
                        //     placeholder: "demo@komga.org",
                        //     value: values.serverUsername,
                        //     maskInput: false,
                        // }),
                        // TS-Ignoring because this isnt documented yet
                        // Fallback to default input field if the app version doesnt support
                        // SecureInputField
                        // @ts-ignore
                        // (typeof createSecureInputField == 'undefined' ? createInputField : createSecureInputField)({
                        //     id: "serverPassword",
                        //     label: "Password",
                        //     placeholder: "Some Super Secret Password",
                        //     value: values.serverPassword
                        // }),
                    ]),
                }),
                createSection({
                    id: "sourceOptions",
                    header: "Source Options",
                    footer: "",
                    rows: async () => (0, Common_1.retrieveStateData)(stateManager).then((values) => [
                        createSwitch({
                            id: 'showOnDeck',
                            label: 'Show On Deck',
                            value: values.showOnDeck,
                        }),
                        createSwitch({
                            id: 'showContinueReading',
                            label: 'Show Continue Reading',
                            value: values.showContinueReading,
                        }),
                        createSwitch({
                            id: 'orderResultsAlphabetically',
                            label: 'Sort results alphabetically',
                            value: values.orderResultsAlphabetically,
                        }),
                    ]),
                }),
            ],
        }),
    });
};
exports.serverSettingsMenu = serverSettingsMenu;
const testServerSettingsMenu = (stateManager, requestManager) => {
    return createNavigationButton({
        id: "test_settings",
        value: "",
        label: "Try settings",
        form: createForm({
            onSubmit: async () => { },
            validate: async () => true,
            sections: async () => [
                createSection({
                    id: "information",
                    header: "Connection to Tachidesk server:",
                    rows: () => (0, exports.testServerSettings)(stateManager, requestManager).then(async (value) => [
                        createLabel({
                            label: value,
                            value: "",
                            id: "description",
                        }),
                    ]),
                }),
            ],
        }),
    });
};
exports.testServerSettingsMenu = testServerSettingsMenu;
class SourceClass {
    constructor() {
        this.Sources = [];
        this.Sources = this.Sources.sort((a, b) => a.displayName > b.displayName ? 1 : -1);
    }
    getIDList() {
        return this.Sources.map(Sources => Sources.id);
    }
    getSelectedSources(sources) {
        const FilteredSources = [];
        for (const source of sources) {
            const fSources = this.Sources.filter(MSources => MSources.id === source);
            if (fSources && fSources[0]) {
                FilteredSources.push(fSources[0]);
            }
        }
        const SortedSources = FilteredSources.sort((a, b) => a.displayName > b.displayName ? 1 : -1);
        return SortedSources;
    }
    getNameFromID(id) {
        return this.Sources.filter(Sources => Sources.id == id)[0]?.displayName ?? 'Unknown';
    }
    getDefault() {
        return this.Sources.filter(Sources => Sources.default).map(Sources => Sources.id);
    }
}
exports.TDSources = new SourceClass;
const getSourcesList = async (stateManager) => {
    return await stateManager.retrieve('tdsources') ?? [
        {
            id: "0",
            name: "Local source",
            displayName: "Local source"
        },
    ];
};
exports.getSourcesList = getSourcesList;
const getSources = async (stateManager) => {
    const tachiAPI = await (0, Common_1.getTachiAPI)(stateManager);
    const requestManager = createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 20000,
    });
    const request = createRequestObject({
        url: `${tachiAPI}/source/list`,
        method: "GET",
    });
    const response = await requestManager.schedule(request, 1);
    let data;
    try {
        data = JSON.parse(response.data);
    }
    catch (e) {
        throw new Error(`${e}`);
    }
    if (data.length === 0)
        throw Error('Could not Find any sources avaliable in the api');
    exports.TDSources.Sources = data;
};
exports.getSources = getSources;
const TDSettings = (stateManager) => {
    return createNavigationButton({
        id: 'tdsource_settings',
        value: '',
        label: 'TachiDesk Source Settings',
        form: createForm({
            onSubmit: (values) => {
                return Promise.all([
                    stateManager.store('tdsources', values.tdsources),
                ]).then();
            },
            validate: () => {
                return Promise.resolve(true);
            },
            sections: () => {
                return Promise.resolve([
                    createSection({
                        id: 'tachidesk_sources',
                        footer: '',
                        rows: () => {
                            return Promise.all([
                                (0, exports.getSourcesList)(stateManager),
                            ]).then(async (values) => {
                                return [
                                    createSelect({
                                        id: 'tdsources',
                                        label: 'Sources',
                                        options: exports.TDSources.getIDList(),
                                        displayLabel: option => exports.TDSources.getNameFromID(option),
                                        value: values[0],
                                        allowsMultiselect: true,
                                        minimumOptionCount: 1,
                                    })
                                ];
                            });
                        }
                    })
                ]);
            }
        })
    });
};
exports.TDSettings = TDSettings;
const resetSettingsButton = (stateManager) => {
    return createButton({
        id: "reset",
        label: "Reset to Default",
        value: "",
        onTap: () => (0, Common_1.setStateData)(stateManager, {}),
    });
};
exports.resetSettingsButton = resetSettingsButton;

},{"./Common":51}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TachiDesk = exports.capitalize = exports.parseMangaStatus = exports.TachiDeskInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const Languages_1 = require("./Languages");
const Settings_1 = require("./Settings");
const Common_1 = require("./Common");
// This source use Tachi REST API
// https://tachiurl/api/swagger-u
// Manga are represented by `series`
// Chapters are represented by `books`
// The Basic Authentication is handled by the interceptor
// Code and method used by both the source and the tracker are defined in the duplicated `TachiCommon.ts` file
// Due to the self hosted nature of Tachi, this source requires the user to enter its server credentials in the source settings menu
// Some methods are known to throw errors without specific actions from the user. They try to prevent this behavior when server settings are not set.
// This include:
//  - homepage sections
//  - getTags() which is called on the homepage
//  - search method which is called even if the user search in an other source
exports.TachiDeskInfo = {
    version: "0.0.1",
    name: "Tachidesk",
    icon: "icon.png",
    author: "Alles",
    authorWebsite: "https://github.com/AlexZorzi",
    description: "Tachidesk extension",
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: "https://github.com/Suwayomi/Tachidesk-Server",
    sourceTags: [
        {
            text: "Tachiyomi Magic",
            type: paperback_extensions_common_1.TagType.RED,
        },
    ],
};
const parseMangaStatus = (tachiStatus) => {
    switch (tachiStatus) {
        case "ENDED":
            return paperback_extensions_common_1.MangaStatus.COMPLETED;
        case "ONGOING":
            return paperback_extensions_common_1.MangaStatus.ONGOING;
        case "ABANDONED":
            return paperback_extensions_common_1.MangaStatus.ONGOING;
        case "HIATUS":
            return paperback_extensions_common_1.MangaStatus.ONGOING;
    }
    return paperback_extensions_common_1.MangaStatus.ONGOING;
};
exports.parseMangaStatus = parseMangaStatus;
const capitalize = (tag) => {
    return tag.replace(/^\w/, (c) => c.toUpperCase());
};
exports.capitalize = capitalize;
class TachiDesk extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.stateManager = createSourceStateManager({});
        this.requestManager = createRequestManager({
            requestsPerSecond: 4,
            requestTimeout: 20000,
        });
        /*override async filterUpdatedManga(
            mangaUpdatesFoundCallback: (updates: MangaUpdates) => void,
            time: Date,
            ids: string[]
        ): Promise<void> {
            const tachiAPI = await getTachiAPI(this.stateManager);
    
            // We make requests of PAGE_SIZE titles to `series/updated/` until we got every titles
            // or we got a title which `lastModified` metadata is older than `time`
            let page = 0;
            const foundIds: string[] = [];
            let loadMore = true;
    
            while (loadMore) {
                const request = createRequestObject({
                    url: `${tachiAPI}/series/updated/`,
                    param: `?page=${page}&size=${PAGE_SIZE}&deleted=false`,
                    method: "GET",
                });
    
                const data = await this.requestManager.schedule(request, 1);
                const result =
                    typeof data.data === "string" ? JSON.parse(data.data) : data.data;
    
                for (const serie of result.content) {
                    const serieUpdated = new Date(serie.metadata.lastModified);
    
                    if (serieUpdated >= time) {
                        if (ids.includes(serie)) {
                            foundIds.push(serie);
                        }
                    } else {
                        loadMore = false;
                        break;
                    }
                }
    
                // If no series were returned we are on the last page
                if (result.content.length === 0) {
                    loadMore = false;
                }
    
                page = page + 1;
    
                if (foundIds.length > 0) {
                    mangaUpdatesFoundCallback(
                        createMangaUpdates({
                            ids: foundIds,
                        })
                    );
                }
            }
        }*/
    }
    async getSourceMenu() {
        return createSection({
            id: "main",
            header: "Source Settings",
            rows: async () => [
                (0, Settings_1.serverSettingsMenu)(this.stateManager),
                (0, Settings_1.testServerSettingsMenu)(this.stateManager, this.requestManager),
                (0, Settings_1.resetSettingsButton)(this.stateManager),
                (0, Settings_1.TDSettings)(this.stateManager)
            ],
        });
    }
    async getMangaDetails(mangaId) {
        const tachiAPI = await (0, Common_1.getTachiAPI)(this.stateManager);
        const request = createRequestObject({
            url: `${tachiAPI}/manga/${mangaId}/`,
            method: "GET",
        });
        const response = await this.requestManager.schedule(request, 1);
        const result = typeof response.data === "string"
            ? JSON.parse(response.data)
            : response.data;
        const tagSections = [
            createTagSection({ id: "0", label: "genres", tags: [] }),
        ];
        // For each tag, we append a type identifier to its id and capitalize its label
        tagSections[0].tags = result.genre.map((elem) => createTag({ id: "genre-" + elem, label: (0, exports.capitalize)(elem) }));
        const authors = [result.author];
        const artists = [result.artist];
        return createManga({
            id: mangaId,
            titles: [result.title],
            image: `${tachiAPI}/manga/${mangaId}/thumbnail`,
            status: (0, exports.parseMangaStatus)(result.status),
            // langFlag: metadata.language,
            langFlag: "Todo",
            // Unused: langName
            artist: artists.join(", "),
            author: authors.join(", "),
            desc: result.description ? result.description : "No summary",
            tags: tagSections,
            // lastUpdate: result.lastModified,
            lastUpdate: new Date(),
        });
    }
    async getChapters(mangaId) {
        const tachiAPI = await (0, Common_1.getTachiAPI)(this.stateManager);
        const chapterRequest = createRequestObject({
            url: `${tachiAPI}/manga/${mangaId}/chapters`,
            param: "",
            method: "GET",
        });
        const chaptersResponse = await this.requestManager.schedule(chapterRequest, 2);
        const chaptersResult = typeof chaptersResponse.data === "string"
            ? JSON.parse(chaptersResponse.data)
            : chaptersResponse.data;
        const chapters = [];
        const languageCode = (0, Languages_1.parseLangCode)("Todo");
        for (const chapter of chaptersResult) {
            chapters.push(createChapter({
                id: String(chapter.index),
                mangaId: mangaId,
                chapNum: parseFloat(chapter.chapterNumber),
                //langCode: languageCode,
                name: `${chapter.name}`,
                time: new Date(chapter.uploadDate),
                // @ts-ignore
                sortingIndex: chapter.index
            }));
        }
        return chapters;
    }
    async getChapterDetails(mangaId, chapterId) {
        const tachiAPI = await (0, Common_1.getTachiAPI)(this.stateManager);
        const request = createRequestObject({
            url: `${tachiAPI}/manga/${mangaId}/chapter/${chapterId}`,
            method: "GET",
        });
        const data = await this.requestManager.schedule(request, 1);
        const result = typeof data.data === "string" ? JSON.parse(data.data) : data.data;
        const pages = [];
        for (const pageindex of Array(result.pageCount - 1).keys()) {
            pages.push(`${tachiAPI}/manga/${mangaId}/chapter/${chapterId}/page/${pageindex}`);
        }
        return createChapterDetails({
            id: chapterId,
            longStrip: true,
            mangaId: mangaId,
            pages: pages,
        });
    }
    async getSearchResults(searchQuery, metadata) {
        const tachiAPI = await (0, Common_1.getTachiAPI)(this.stateManager);
        const SourcesList = await (0, Settings_1.getSourcesList)(this.stateManager);
        const SelectedSources = Settings_1.TDSources.getSelectedSources(SourcesList);
        if (tachiAPI === null) {
            console.log("searchRequest failed because server settings are unset");
            return createPagedResults({
                results: (0, Common_1.getServerUnavailableMangaTiles)(),
            });
        }
        const page = metadata?.page ?? 1;
        const meta_sources = metadata?.sources ?? {};
        const paramsList = [`pageNum=${page}`];
        if (searchQuery.title !== undefined && searchQuery.title !== "") {
            paramsList.push("searchTerm=" + encodeURIComponent(searchQuery.title));
        }
        let paramsString = "";
        if (paramsList.length > 0) {
            paramsString = "?" + paramsList.join("&");
        }
        const tiles = [];
        for (const source of SelectedSources) {
            if (page !== 1) {
                if (!meta_sources[source.id])
                    continue;
            }
            const request = createRequestObject({
                url: `${tachiAPI}/source/${source.id}/search${paramsString}`,
                method: "GET",
            });
            let response;
            try {
                response = await this.requestManager.schedule(request, 1);
                if (response.status != 200) {
                    continue;
                }
            }
            catch (error) {
                console.log(`searchRequest failed with error: ${error}`);
                return createPagedResults({
                    results: (0, Common_1.getServerUnavailableMangaTiles)(),
                });
            }
            let data;
            try {
                data = JSON.parse(response.data);
            }
            catch (e) {
                throw new Error(`${e}`);
            }
            for (const serie of data.mangaList) {
                tiles.push(createMangaTile({
                    id: String(serie.id),
                    title: createIconText({ text: serie.title }),
                    subtitleText: createIconText({ text: source.displayName }),
                    image: `${tachiAPI}/manga/${serie.id}/thumbnail`,
                }));
            }
            meta_sources[source.id] = data.hasNextPage;
        }
        metadata = tiles.length !== 0 ? { page: page + 1, sources: meta_sources } : undefined;
        return createPagedResults({
            results: tiles,
            metadata,
        });
    }
    async getHomePageSections(sectionCallback) {
        (0, Settings_1.getSources)(this.stateManager);
        const tachiAPI = await (0, Common_1.getTachiAPI)(this.stateManager);
        const SourcesList = await (0, Settings_1.getSourcesList)(this.stateManager);
        const SelectedSources = Settings_1.TDSources.getSelectedSources(SourcesList);
        if (tachiAPI === null) {
            console.log("searchRequest failed because server settings are unset");
            const section = createHomeSection({
                id: "unset",
                title: "Go to source settings to set your Tachi server credentials.",
                view_more: false,
                items: (0, Common_1.getServerUnavailableMangaTiles)(),
            });
            sectionCallback(section);
            return;
        }
        const sections = [];
        for (const source of SelectedSources) {
            sections.push({
                section: createHomeSection({
                    id: `popular-${source.id}`,
                    title: `${source.displayName} Popular`,
                    view_more: true,
                }),
                request: createRequestObject({
                    url: encodeURI(`${tachiAPI}/source/${source.id}/popular/1`),
                    method: 'GET',
                }),
                subtitle: source.displayName
            });
            if (source.supportsLatest) {
                sections.push({
                    section: createHomeSection({
                        id: `latest-${source.id}`,
                        title: `${source.displayName} Latest`,
                        view_more: true,
                    }),
                    request: createRequestObject({
                        url: encodeURI(`${tachiAPI}/source/${source.id}/latest/1`),
                        method: 'GET',
                    }),
                    subtitle: source.displayName
                });
            }
        }
        const promises = [];
        for (const section of sections) {
            sectionCallback(section.section);
            promises.push(this.requestManager.schedule(section.request, 1).then(response => {
                let data;
                try {
                    data = JSON.parse(response.data);
                }
                catch (e) {
                    throw new Error(`${e}`);
                }
                const tiles = [];
                for (const serie of data.mangaList) {
                    tiles.push(createMangaTile({
                        id: serie.id.toString(),
                        title: createIconText({ text: serie.title }),
                        image: `${tachiAPI}/manga/${serie.id}/thumbnail`,
                        subtitleText: createIconText({ text: section.subtitle })
                    }));
                }
                section.section.items = tiles;
                sectionCallback(section.section);
            }));
        }
        // Make sure the function completes
        await Promise.all(promises);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const tachiAPI = await (0, Common_1.getTachiAPI)(this.stateManager);
        const page = metadata?.page ?? 1;
        const sourceId = homepageSectionId.split('-')?.pop() ?? '';
        const SelectedSources = Settings_1.TDSources.getSelectedSources([sourceId]) ?? [];
        const request = createRequestObject({
            url: `${tachiAPI}/source/${sourceId}/${homepageSectionId.includes('latest-') ? 'latest' : 'popular'}/${page}`,
            method: "GET",
        });
        const response = await this.requestManager.schedule(request, 1);
        let data;
        try {
            data = JSON.parse(response.data);
        }
        catch (e) {
            throw new Error(`${e}`);
        }
        const tiles = [];
        for (const serie of data.mangaList) {
            tiles.push(createMangaTile({
                id: serie.id.toString(),
                title: createIconText({ text: serie.title }),
                image: `${tachiAPI}/manga/${serie.id}/thumbnail`,
                subtitleText: createIconText({ text: SelectedSources.map(x => x.displayName)[0] ?? '' })
            }));
        }
        metadata = data.hasNextPage ? { page: page + 1 } : undefined;
        return createPagedResults({
            results: tiles,
            metadata: metadata,
        });
    }
}
exports.TachiDesk = TachiDesk;

},{"./Common":51,"./Languages":52,"./Settings":53,"paperback-extensions-common":7}]},{},[54])(54)
});

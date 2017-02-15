/**
 * `WunderlistAPIError` error.
 *
 * References:
 *   - https://developer.wunderlist.com/documentation/concepts/formats
 *
 * @constructor
 * @param {string} [message]
 * @param {string} [type]
 * @param {string} [translation_key]
 * @access public
 */
function WunderlistAPIError(message, type, translation_key) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'WunderlistAPIError';
  this.message = message;
  this.type = type;
  this.translation_key = translation_key;
  this.status = 500;
}

// Inherit from `Error`.
WunderlistAPIError.prototype.__proto__ = Error.prototype;


// Expose constructor.
module.exports = WunderlistAPIError;

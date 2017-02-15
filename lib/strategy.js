// Load modules.
var OAuth2Strategy = require('passport-oauth2')
  , util = require('util')
  , uri = require('url')
  , WunderlistProfile = require('./profile')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError
  , WunderlistAPIError = require('./errors/apierror');

/**
 * `Strategy` constructor.
 *
 * The Wunderlist authentication strategy authenticates requests by delegating to
 * Wunderlist using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Google application's client id
 *   - `clientSecret`  your Google application's client secret
 *   - `callbackURL`   URL to which Google will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new WunderlistStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/wunderlist/callback'
 *       },
 *       function(accessToken, profile, cb) {
 *         User.findOrCreate(..., function (err, user) {
 *           cb(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://www.wunderlist.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://www.wunderlist.com/oauth/access_token';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'wunderlist';
  this._userProfileURL = options.userProfileURL || 'http://a.wunderlist.com/api/v1/user';
}

// Inherit from `OAuth2Strategy`.
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Wunderlist.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `wunderlist`
 *   - `id`
 *   - `displayName`
 *   - `emails`
 *
 * @param {string} accessToken
 * @param {function} done
 * @access protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
  var self = this;

  var headers = {
    "X-Client-ID": this._oauth2._clientId,
    "X-Access-Token": accessToken
  };

  this._oauth2._request("GET", this._userProfileURL, headers, "", accessToken, function (err, body, res) {

    var json;

    if (err) {
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
      }

      if (json && json.error && typeof json.error == 'object') {
        return done(new WunderlistAPIError(json.error.message, json.error.type, json.error.translation_key));
      }
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }

    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }

    var profile = WunderlistProfile.parse(json);

    profile.provider = 'wunderlist';
    profile._raw = body;
    profile._json = json;

    done(null, profile);
  });
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;

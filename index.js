var util              = require('util');
var events            = require('events');
var querystring       = require('querystring');
var OAuth             = require('oauth').OAuth;
var OAuth2            = require('oauth').OAuth2;
var ipUtil            = require('ip-util');
var supported_modules = require('./modules.json');

var setOAuthAccessToken = function(params, callback) {
  var oauth_verifier = params.oauth_verifier;

  if (oauth_verifier == null) {
    callback(new Error('no valid oauth verifier'));
    return;
  }
  this.oauth.getOAuthAccessToken(
    this.oauth_token,
    this.oauth_token_secret,
    oauth_verifier, function(error, oauth_access_token, oauth_access_token_secret, results) {
      //FIXME: there is a random double callback issue here
      if (error) {
        callback(new Error('cannot get oauth access token: ' + error.data));
      } else {
        this.oauth_access_token        = oauth_access_token;
        this.oauth_access_token_secret = oauth_access_token_secret;
        this.results                   = results;
        callback(null);
      }
    }.bind(this));
}

var connect = function(user, pass, callback) {
  if (this.oauth_version === '1.0') {
    this.oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
      if (error) {
        return callback(new Error('connect failed, reason: ' + error.message));
      }

      this.oauth_token        = oauth_token;
      this.oauth_token_secret = oauth_token_secret;

      var redirectUrl = this.authorize_redirect_url + oauth_token;
      this.emit('authorizeredirect', redirectUrl, this.deviceID);
    }.bind(this));
  } else {
    callback(new Error('only oauth 1.0 is supported'));
  }
};

var disconnect = function(callback) {
  // below fields are generated during oauth flow
  this.oauth_token               = '';
  this.oauth_token_secret        = '';
  this.oauth_access_token        = '';
  this.oauth_access_token_secret = '';
  this.results                   = null;

  // this.oauth2_access_token  = '';
  // this.oauth2_refresh_token = '';
  // this.oauth2_results       = {};
  callback(null);
};

// getHWAddress should be device specific

function OAuthManager() {
  this.discoverState = 'stopped';
}

util.inherits(OAuthManager, events.EventEmitter);

OAuthManager.prototype.discoverDevices = function() {
  if (this.discoverState === 'discovering') {
    return;
  }

  for (var i in supported_modules) {
    var mod = require(supported_modules[i]);
    //FIXME: a new device instance should be created for each different user's connection
    device = new mod();
    if (device !== null) {
      if (device.oauth_version !== '1.0' && device.oauth_version !== '2.0') {
        return;
      }

      device.authorize_redirect_url    = device.authorize_redirect_url || '';

      if (device.oauth_version === '1.0') {
        device.oauth = new OAuth(device.oauth_requestUrl || null,
                              device.oauth_accessUrl || null,
                              device.apiKey || '',
                              device.apiSecret || '',
                              device.oauth_version,
                              null,
                              device.oauth_signatureMethod || 'HMAC-SHA1',
                              device.oauth_nonceSize || null,
                              device.oauth_customHeaders || null);

        // below fields would be filled by oauth flow
        device.oauth_token               = '';
        device.oauth_token_secret        = '';
        device.oauth_access_token        = '';
        device.oauth_access_token_secret = '';
      } else {
        // device.oauth2_baseSite          = null;
        // device.oauth2_authorizePath     = null;
        // device.oauth2_accessTokenPath   = null;
        // device.oauth2_customHeaders     = null;
        // device.oauth2_access_token    = '';
        // device.oauth2_refresh_token   = '';
        // device.oauth2_results         = {};
      }

      device._connect             = connect.bind(device);
      device._disconnect          = disconnect.bind(device);
      device._setOAuthAccessToken = setOAuthAccessToken.bind(device);
      this.emit('deviceonline', device, this);
    }
  }

  this.discoverState = 'discovering';
};

OAuthManager.prototype.stopDiscoverDevices = function() {
  this.discoverState = 'stopped';
};


module.exports = OAuthManager;

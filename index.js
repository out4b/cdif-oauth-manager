var util              = require('util');
var events            = require('events');
var OAuth2            = require('oauth').OAuth2;
var supported_modules = require('./modules.json');

var connect = function(clientID, clientSecret, callback) {
  this.oauth2 = new OAuth2(clientID, clientSecret, this.baseSite, this.authorizePath, this.accessTokenPath, this.customHeaders);
  // redirect urls etc could be wrapped in params which is assigned by specific modules
  this.oauth2.getOAuthAccessToken(this.code, this.params, function(err, access_token, refresh_token, results) {
    if (access_token === '' || access_token === null) {
      callback(new Error('cannot get access token'));
    }

    if (!err) {
      this.oauth2_access_token  = access_token;
      this.oauth2_refresh_token = refresh_token;
      this.oauth2_results       = results;
      callback(null);
    } else {
      callback(err);
    }
  }.bind(this));
};

var disconnect = function(callback) {
  this.oauth2_access_token  = '';
  this.oauth2_refresh_token = '';
  this.oauth2_results       = {};
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
    device = new mod();
    if (device !== null) {
      device.baseSite        = '';
      device.authorizePath   = '';
      device.accessTokenPath = '';
      device.customHeaders   = '';

      device.oauth2_access_token  = '';
      device.oauth2_refresh_token = '';
      device.oauth2_results       = {};

      device._connect = connect.bind(device);
      this.emit('deviceonline', device, this);
    }
  }

  this.discoverState = 'discovering';
};

OAuthManager.prototype.stopDiscoverDevices = function() {
  this.discoverState = 'stopped';
};


module.exports = OAuthManager;

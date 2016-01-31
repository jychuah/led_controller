define([], function(require) {
  // requires a firebase reference with a child called ParticleBase
  ParticleBase = function(firebaseRef) {
    if (firebaseRef == null) {
      throw "Firebase reference must not be null.";
    }
    this.accessToken = null;
    this.accessTokenCallback = null;
    this.firebase = firebaseRef;
    this.firebase.onAuth(function(auth) {
      if (auth) {
        var ref = this;
        var tokenChild = this.firebase.child('ParticleBase').child('users').child('tokens').child(auth.uid);
        tokenChild.on('value', function(dataSnapshot) {
          if (dataSnapshot.exists()) {
            ref.accessToken = dataSnapshot.val();
            if (ref.accessTokenCallback) {
              ref.testToken(function(status) {
                switch(status) {
                  case ParticleBase.SUCCESS_PARTICLEBASE_ACCESS_TOKEN : ref.accessTokenCallback(status); break;
                  case ParticleBase.ERROR_PARTICLE_INVALID_CREDENTIALS : ref.accessTokenCallback(ParticleBase.ERROR_PARTICLEBASE_INVALID_ACCESS_TOKEN); break;
                  default : ref.accessTokenCallback(status); break;
                };
              });
            }
          } else {
            if (ref.accessTokenCallback) {
              ref.accessTokenCallback(ParticleBase.ERROR_PARTICLEBASE_NO_ACCESS_TOKEN);
            }
          }
        });
      }
    }, this);
  };

  ParticleBase.ApiUrl = "https://api.particle.io";

  ParticleBase.ERROR_PARTICLE_UNREACHABLE = "Particle.io was unreachable.";
  ParticleBase.ERROR_PARTICLE_INVALID_CREDENTIALS = "The supplied username/password for Particle.io was invalid.";
  ParticleBase.ERROR_PARTICLE_SERVER_ERROR = "Particle.io had some type of server error. Please try again later.";
  ParticleBase.ERROR_PARTICLE_UNKNOWN_ERROR = "There was an unknown error while contacting Particle.io.";
  ParticleBase.ERROR_PARTICLE_BAD_RESPONSE = "Particle.io was successfully contacted, but didn't return an Authorization token.";
  ParticleBase.SUCCESS_PARTICLE_TOKEN_RETURNED = "Particle.io returned an access token.";
  ParticleBase.ERROR_PARTICLEBASE_UNKNOWN = "Hmm... Unhandled ParticleBase error.";
  ParticleBase.ERROR_FIREBASE_COULD_NOT_SET_PARTICLE_TOKEN = "Could not set Particle.io authorization token.";
  ParticleBase.ERROR_FIREBASE_NOT_LOGGED_IN = "You are not logged in to Firebase.";
  ParticleBase.SUCCESS_PARTICLEBASE_ACCESS_TOKEN = "ParticleBase has acquired a valid access token.";
  ParticleBase.ERROR_PARTICLEBASE_NO_ACCESS_TOKEN = "The logged in Firebase user does not yet have an access token from Particle.io.";
  ParticleBase.ERROR_PARTICLEBASE_INVALID_ACCESS_TOKEN = "The access token for this Firebase user is currently invalid.";
  ParticleBase.SUCCESS_PARTICLE_REST_OPERATION = "Particle.io REST operation succeeded.";
  ParticleBase.SUCCESS_PARTICLE_LIST_DEVICES = "Particle.io list device operation succeeded.";
  ParticleBase.SUCCESS_PARTICLE_PUBLISH_EVENT = "Particle.io successfully published the event.";

  ParticleBase.prototype = {
    constructor: ParticleBase,

    firebaseLoggedIn : function() {
      return this.firebase.getAuth() != null;
    },

    buildXHR : function(method, endpoint) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, ParticleBase.ApiUrl + endpoint, true);
      xhr.setRequestHeader("Accept", "*/*");
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      return xhr;
    },


    getParticleXHRStatus : function (xhrstatus, success) {
      var status = ParticleBase.ERROR_PARTICLEBASE_UNKNOWN;
      switch(xhrstatus) {
        case 0 : status = ParticleBase.ERROR_PARTICLE_UNREACHABLE; break;
        case 200 : status = success ? success : ParticleBase.SUCCESS_PARTICLE_REST_OPERATION; break;
        case 400 : status = ParticleBase.ERROR_PARTICLE_INVALID_CREDENTIALS; break;
        case 401 : status = ParticleBase.ERROR_PARTICLEBASE_INVALID_ACCESS_TOKEN; break;
        case 500 : status = ParticleBase.ERROR_PARTICLE_SERVER_ERROR; break;
        default : status = ParticleBase.ERROR_PARTICLE_UNKNOWN_ERROR; break;
      };
      return status;
    },

    // Sets an access token event callback which fires if an accessToken
    // is missing, invalid, or acquired
    // This callback could be used to collect a Particle.io
    // username and password, which can be passed to the bindAccessToken function
    setAccessTokenCallback : function(callback) {
      this.accessTokenCallback = callback;
    },

    // Lists devices accessible with this user's access token
    // callback first parameter will be passed one of the following:
    // ParticleBase.SUCCESS_PARTICLE_LIST_DEVICES
    // ParticleBase.ERROR_FIREBASE_NOT_LOGGED_IN
    // ParticleBase.ERROR_PARTICLE_UNREACHABLE
    // ParticleBase.ERROR_PARTICLEBASE_INVALID_ACCESS_TOKEN
    // ParticleBase.ERROR_PARTICLE_SERVER_ERROR
    // If ParticleBase.SUCCESS_PARTICLE_LIST_DEVICES then the
    // second callback parameter will be a list of devices
    listDevices : function(callback) {
      if (!this.firebaseLoggedIn()) {
        callback(Particle.ERROR_FIREBASE_NOT_LOGGED_IN, null);
        return false;
      }
      var xhr = this.buildXHR("GET", "/v1/devices");
      xhr.setRequestHeader("Authorization", "Bearer " + this.accessToken);
      var ref = this;
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 0 && xhr.status == 0) {
          callback(ParticleBase.ERROR_PARTICLE_UNREACHABLE, null);
          return false;
        };
        if (xhr.readyState == 4) {
          var data = xhr.status == 200 ? JSON.parse(xhr.responseText) : null;
          var status = ref.getParticleXHRStatus(xhr.status, ParticleBase.SUCCESS_PARTICLE_LIST_DEVICES);
          callback(status, data);
          return true;
        }
      };
      xhr.send();
      return true;
    },

    

    // REST publish event wrapper
    // callback first parameter will be passed one of the following:
    // ParticleBase.SUCCESS_PARTICLE_PUBLISH_EVENT
    // ParticleBase.ERROR_FIREBASE_NOT_LOGGED_IN
    // ParticleBase.ERROR_PARTICLE_UNREACHABLE
    // ParticleBase.ERROR_PARTICLEBASE_INVALID_ACCESS_TOKEN
    // ParticleBase.ERROR_PARTICLE_SERVER_ERROR
    publishEvent : function(eventName, data, callback) {
      if (!this.firebaseLoggedIn()) {
        callback(Particle.ERROR_FIREBASE_NOT_LOGGED_IN);
        return false;
      }
      var xhr = this.buildXHR("POST", "/v1/devices/events");
      xhr.setRequestHeader("Authorization", "Bearer " + this.accessToken);
      var ref = this;
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 0 && xhr.status == 0) {
          callback(ParticleBase.ERROR_PARTICLE_UNREACHABLE, null);
          return false;
        };
        if (xhr.readyState == 4) {
          var status = ref.getParticleXHRStatus(xhr.status, ParticleBase.SUCCESS_PARTICLE_PUBLISH_EVENT);
          callback(status);
          return true;
        }
      }
      xhr.send("name=" + eventName + "&data=" + encodeURIComponent(data) + "&private=true&ttl=60");
    },

    // callback will be passed one of the following:
    // ParticleBase.SUCCESS_PARTICLEBASE_ACCESS_TOKEN
    // ParticleBase.ERROR_PARTICLE_UNREACHABLE
    // ParticleBase.ERROR_PARTICLEBASE_INVALID_ACCESS_TOKEN
    // ParticleBase.ERROR_FIREBASE_NOT_LOGGED_IN
    // ParticleBase.ERROR_PARTICLE_SERVER_ERROR
    testToken : function(callback) {
      if (!this.firebaseLoggedIn()) {
        callback(Particle.ERROR_FIREBASE_NOT_LOGGED_IN);
        return false;
      }
      this.listDevices(function(status, device_list) {
        callback(status === ParticleBase.SUCCESS_PARTICLE_LIST_DEVICES ? ParticleBase.SUCCESS_PARTICLEBASE_ACCESS_TOKEN : status);
      });
      return true;
    },

    hasAccessToken : function() {
      return this.accessToken != null;
    },

    // callback will be passed one of the following statuses:
    // ParticleBase.ERROR_FIREBASE_NOT_LOGGED_IN
    // ParticleBase.ERROR_PARTICLE_UNREACHABLE
    // ParticleBase.ERROR_FIREBASE_COULD_NOT_SET_PARTICLE_TOKEN
    // ParticleBase.ERROR_PARTICLE_BAD_RESPONSE
    // ParticleBase.SUCCESS_PARTICLEBASE_ACCESS_TOKEN
    // If successful, the supplied Access Token Callback will be triggered
    // with status ParticleBase.SUCCESS_PARTICLEBASE_ACCESS_TOKEN
    bindAccessToken : function(particle_username, particle_password, callback) {
      if (this.firebase.getAuth() == null) {
        callback(ParticleBase.ERROR_FIREBASE_NOT_LOGGED_IN);
        return false;
      }
      var xhr = this.buildXHR("POST", "/oauth/token");
      xhr.setRequestHeader ("Authorization", "Basic " + btoa("particle:particle"));
      var ref = this;
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 0 && xhr.status == 0) {
          callback(ParticleBase.ERROR_PARTICLE_UNREACHABLE);
          return false;
        };
        if (xhr.readyState == 4) {
          var data = xhr.status == 200 ? JSON.parse(xhr.responseText) : null;
          var status = ref.getParticleXHRStatus(xhr.status, ParticleBase.SUCCESS_PARTICLE_TOKEN_RETURNED);
          if (status === ParticleBase.SUCCESS_PARTICLE_TOKEN_RETURNED) {
            if ("access_token" in data) {
              var token = data.access_token;
              ref.firebase.child('ParticleBase').child('users').child('tokens').child(ref.firebase.getAuth().uid).set(token, function(error) {
                if (error) {
                  callback(ParticleBase.ERROR_FIREBASE_COULD_NOT_SET_PARTICLE_TOKEN);
                } else {
                  callback(ParticleBase.SUCCESS_PARTICLEBASE_ACCESS_TOKEN);
                }
              });
            } else {
              callback(ParticleBase.ERROR_PARTICLE_BAD_RESPONSE);
            }
          } else {
            callback(status);
          }
          return true;
        }
      };
      xhr.send("grant_type=password&expires_in=0&username=" +
          encodeURIComponent(particle_username) + "&password=" +
          encodeURIComponent(particle_password));
      return true;
    },
  };
  return ParticleBase;
});

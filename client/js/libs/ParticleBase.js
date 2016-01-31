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
                  case ParticleBase.SUCCESS_PARTICLEBASE_ACCESS_TOKEN : this.accessTokenCallback(status); break;
                  case ParticleBase.ERROR_PARTICLE_INVALID_CREDENTIALS : this.accessTokenCallback(ParticleBase.ERROR_PARTICLEBASE_INVALID_ACCESS_TOKEN); break;
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

  ParticleBase.prototype = {
    constructor: ParticleBase,

    // creates token, returns a status code and a
    // particle.io response json (including accessToken) or null
    createToken : function(particle_username, particle_password, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", ParticleBase.ApirUrl + "/oauth/token", true);
      xhr.setRequestHeader ("Authorization", "Basic " + btoa("particle:particle"));
      xhr.setRequestHeader("Accept", "*/*");
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      var ref = this;
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 0 && xhr.status == 0) {
          callback(ParticleBase.ERROR_PARTICLE_UNREACHABLE, null);
          return false;
        };
        if (xhr.readyState == 4) {
          var data = xhr.status == 200 ? JSON.parse(xhr.responseText) : null;
          var status = ref.getParticleXHRStatus(xhr.status, ParticleBase.SUCCESS_PARTICLE_TOKEN_RETURNED);
          callback(status, data);
          return false;
        }
      };
      xhr.send("grant_type=password&expires_in=0&username=" +
          encodeURIComponent(particle_username) + "&password=" +
          encodeURIComponent(particle_password));
      return true;
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
    // callback parameters: status, device_list
    listDevices : function(callback) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", ParticleBase.ApiUrl + "/v1/devices", true);
      xhr.setRequestHeader("Authorization", "Bearer " + this.accessToken);
      xhr.setRequestHeader("Accept", "*/*");
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
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
    },

    testToken : function(callback) {
      this.listDevices(function(status, device_list) {
        callback(status === ParticleBase.SUCCESS_PARTICLE_LIST_DEVICES ? ParticleBase.SUCCESS_PARTICLEBASE_ACCESS_TOKEN : status);
      });
    },

    hasAccessToken : function() {
      return this.accessToken != null;
    },

    bindAccessToken : function(particle_username, particle_password, callback) {
      this.createToken(particle_username, particle_password, function(status, data) {
        if (status === ParticleBase.SUCCESS_PARTICLE_TOKEN_RETURNED) {
          if (data == null) {
            callback(ParticleBase.ERROR_PARTICLEBASE_UNKNOWN);
            return false;
          } else {
            console.log(status, data);

            if (this.firebase.getAuth() == null) {
              callback(FirebaseConnection.ERROR_FIREBASE_NOT_LOGGED_IN);
              return false;
            }
            this.firebase.child('users').child('tokens').child(this.firebase.getAuth().uid).set(token, function(error) {
              if (error) {
                callback(ERROR_FIREBASE_COULD_NOT_SET_PARTICLE_TOKEN);
              } else {
                callback(SUCCESS_PARTICLEBASE_ACCESS_TOKEN);
              }
            });
          }
        } else {
          callback(status);
        }
      });
    },
  };
  return ParticleBase;
});

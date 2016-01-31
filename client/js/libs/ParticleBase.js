define([], function(require) {
  // requires a firebase reference with a child called ParticleBase
  // also an access token event callback which fires if an accessToken
  // is missing, invalid, or acquired
  // This callback could be used to collect a Particle.io
  // username and password, which can be passed to the bindAccessToken function
  ParticleBase = function(firebaseRef, accessTokenCallback) {
    if (firebaseRef == null) {
      throw "Firebase reference must not be null.";
    }
    this.accessToken = null;
    this.accessTokenCallback = accessTokenCallback;
    this.firebase = firebaseRef;
    this.firebase.onAuth(function(auth) {
      if (auth) {
        var tokenChild = this.firebase.child('ParticleBase').child('users').child('tokens').child(auth.uid);
        tokenChild.on('value', function(dataSnapshot) {
          if (dataSnapshot.exists()) {
            console.log("Firebase: Access token updated", dataSnapshot.val());
            this.accessToken = dataSnapshot.val();
          }
        }, null, this);
      }
    }, this);
  };

  ParticleBase.ERROR_PARTICLE_UNREACHABLE = "Particle.io was unreachable.";
  ParticleBase.ERROR_PARTICLE_INVALID_CREDENTIALS = "The supplied username or password for Particle.io was invalid.";
  ParticleBase.ERROR_PARTICLE_SERVER_ERROR = "Particle.io had some type of server error. Please try again later.";
  ParticleBase.ERROR_PARTICLE_UNKNOWN_ERROR = "There was an unknown error while contacting Particle.io.";
  ParticleBase.ERROR_PARTICLE_BAD_RESPONSE = "Particle.io was successfully contacted, but didn't return an Authorization token.";
  ParticleBase.SUCCESS_PARTICLE_TOKEN_RETURNED = "Particle.io returned an access token.";
  ParticleBase.ERROR_PARTICLEBASE_UNKNOWN = "Hmm... Unhandled ParticleBase error.";
  ParticleBase.ERROR_FIREBASE_COULD_NOT_SET_PARTICLE_TOKEN = "Could not set Particle.io authorization token.";
  ParticleBase.SUCCESS_PARTICLEBASE_ACCESS_TOKEN = "ParticleBase has acquired a valid access token.";
  ParticleBase.ERROR_FIREBASE_NOT_LOGGED_IN = "You are not logged in to Firebase.";
  ParticleBase.SUCCESS_FIREBASE_LOGIN = "Firebase login was successful.";
  ParticleBase.ERROR_FIREBASE_LOGIN = "Firebase login was unsuccessful.";
  ParticleBase.ERROR_PARTICLEBASE_NO_ACCESS_TOKEN = "The logged in Firebase user does not yet have an access token from Particle.io.";
  ParticleBase.ERROR_PARTICLEBASE_INVALID_ACCESS_TOKEN = "The access token for this Firebase user is currently invalid.";

  ParticleBase.prototype = {
    constructor: ParticleBase,

    // creates token, returns a status code and a
    // particle.io response json (including accessToken) or null
    createToken : function(particle_username, particle_password, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "https://api.particle.io/oauth/token", true);
      xhr.setRequestHeader ("Authorization", "Basic " + btoa("particle:particle"));
      xhr.setRequestHeader("Accept", "*/*");
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 0 && xhr.status == 0) {
          callback(ParticleBase.ERROR_PARTICLE_UNREACHABLE, null);
          return false;
        };
        if (xhr.readyState == 4) {
          var status = ParticleBase.ERROR_PARTICLE_UNKNOWN_ERROR;
          var data = xhr.status == 200 ? JSON.parse(xhr.responseText) : null;
          switch(xhr.status) {
            case 0 : status = ParticleBase.ERROR_PARTICLE_UNREACHABLE; break;
            case 200 : status = ParticleBase.SUCCESS_PARTICLE_TOKEN_RETURNED; break;
            case 400 : status = ParticleBase.ERROR_PARTICLE_INVALID_CREDENTIALS; break;
            case 500 : status = ParticleBase.ERROR_PARTICLE_SERVER_ERROR; break;
            default : status = ParticleBase.ERROR_PARTICLE_UNKNOWN_ERROR; break;
          }
          callback(status, data);
          return false;
        }
      };
      xhr.send("grant_type=password&expires_in=0&username=" +
          encodeURIComponent(particle_username) + "&password=" +
          encodeURIComponent(particle_password));
      return true;
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

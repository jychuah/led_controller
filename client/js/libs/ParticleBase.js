define(['require', 'firebase'], function(require) {
  ParticleBase = function(firebaseUrl) {
    var Firebase = require('firebase');
    this.firebase = new Firebase(firebaseUrl);

  };

  ParticleBase.ERROR_PARTICLE_UNREACHABLE = "Particle.io was unreachable.";
  ParticleBase.ERROR_PARTICLE_INVALID_CREDENTIALS = "The supplied username or password for Particle.io was invalid.";
  ParticleBase.ERROR_PARTICLE_SERVER_ERROR = "Particle.io had some type of server error. Please try again later.";
  ParticleBase.ERROR_PARTICLE_UNKNOWN_ERROR = "There was an unknown error while contacting Particle.io.";
  ParticleBase.ERROR_PARTICLE_BAD_RESPONSE = "Particle.io was successfully contacted, but didn't return an Authorization token.";
  ParticleBase.SUCCESS_PARTICLE_TOKEN_RETURNED = "Particle.io returned an access token";
  ParticleBase.ERROR_PARTICLEBASE_UNKNOWN = "Hmm... Unhandled ParticleBase error.";
  ParticleBase.ERROR_FIREBASE_COULD_NOT_SET_PARTICLE_TOKEN = "Could not set Particle.io authorization token";
  ParticleBase.SUCCESS_FIREBASE_SET_PARTICLE_TOKEN = "The Particle.io authorization has been set";
  ParticleBase.ERROR_FIREBASE_NOT_LOGGED_IN = "You are not logged in to Firebase";

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
    bindToParticle : function(username, password, callback) {
      this.createToken(username, password, function(status, data) {
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
                callback(SUCCESS_FIREBASE_SET_PARTICLE_TOKEN);
              }
            });
            
          }
        } else {
          callback(status);
        }
      });
    },
    login : function(username, password, callback) {
      this.fb.authWithPassword({
        "email" : username,
        "password" : password
      }, function(error, authData) {
        if (error) {
          callback(error, null);
        } else {
          callback(null, authData);
        }
      });
    }
  };
  return ParticleBase;
});

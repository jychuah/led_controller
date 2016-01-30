define(['require', 'firebase'], function(require) {

FirebaseConnection = function(firebaseUrl) {
    var Firebase = require('firebase');
    this.fb = new Firebase(firebaseUrl);

};

FirebaseConnection.prototype = {
    constructor: FirebaseConnection,

    ERROR_FIREBASE_NOT_LOGGED_IN : "You are not logged in to Firebase",
    ERROR_FIREBASE_COULD_NOT_SET_PARTICLE_TOKEN : "Could not set Particle.io authorization token",
    SUCCESS_FIREBASE_SET_PARTICLE_TOKEN : "The Particle.io authorization has been set",

    login: function(username, password, callback) {
        this.fb.authWithPassword({
          "email" : username,
          "password" : password
        }, function(error, authData) {
          if (error) {
            callback(error, null);
          } else {
            callback(null, authData);
          }
        })
    },
    // callback called upon completion with status constant
    setAuthToken : function(token, callback) {
      if (this.fb.getAuth() == null) {
        callback(ERROR_FIREBASE_NOT_LOGGED_IN);
        return false;
      }
      this.fb.child('users').child('tokens').child(this.fb.getAuth().uid).set(token, function(error) {
        if (error) {
          callback(ERROR_FIREBASE_COULD_NOT_SET_PARTICLE_TOKEN);
        } else {
          callback(SUCCESS_FIREBASE_SET_PARTICLE_TOKEN);
        }
      });
    }
};

return FirebaseConnection;

})

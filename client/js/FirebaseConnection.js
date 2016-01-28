define(['require', 'firebase'], function(require) {

FirebaseConnection = function(firebaseUrl) {
    var Firebase = require('firebase');
    this.fb = new Firebase(firebaseUrl);

};

FirebaseConnection.prototype = {
    constructor: FirebaseConnection,
    login: function(username, password) {
        this.fb.authWithPassword({
          "email" : username,
          "password" : password
        }, function(error, authData) {
          if (error) {
            console.log("Login failed", error);
          } else {
            console.log("Authenticated", authData);
          }
        })
    }
};

return FirebaseConnection;

})

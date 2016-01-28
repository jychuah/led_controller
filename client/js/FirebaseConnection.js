define(['require', 'firebase'], function(require) {

FirebaseConnection = function(firebaseUrl) {
    var Firebase = require('firebase');
    this.fb = new Firebase(firebaseUrl);

};

FirebaseConnection.prototype = {
    constructor: FirebaseConnection,
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
    }
};

return FirebaseConnection;

})

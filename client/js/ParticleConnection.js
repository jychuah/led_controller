define(['jquery'], function($) {

ParticleConnection = function() {

};

ParticleConnection.prototype = {
    constructor: ParticleConnection,

    login: function(username, password, callback) {
        console.log("Spark login beginning");
        spark.login({username: username, password: password}).then(
            function(token) {
              callback(null, token);
            },
            function(error) {
              callback(error, null);
            }
        );
    },
    createUser: function(username, password, callback) {
      spark.createUser(username, password, function(err, data) {
        if (!err) {
          spark.login({username: username, password: password}).then(
            function(accessToken) {
              console.log("First login successful", accessToken);
              this.createToken(username, password, callback);
            },
            function(error) {
              console.log("First login failed", error);
              callback(null);
            }
          )
        } else {
          console.log("Error creating Particle.io user");
          callback(null);
        }
      });
    },
    createToken: function(username, password, callback) {
      console.log(username);
      console.log(password);
      $.ajax({
        type: "POST",
        url: "https://api.particle.io/oauth/token",
        beforeSend: function (xhr) {
          xhr.setRequestHeader ("Authorization", "Basic " + btoa("particle:particle"));
          xhr.setRequestHeader("Accept", "*/*");
        },
        data: {
          username: username,
          password: password,
          expires_in: 0,
          grant_type: "password"
        },
        complete: function(jqXHR, textStatus) {
          // callback will return status code and responseJSON upon status 200
          // or null otherwise.
          // codes are 0 - unreachable, 200 - ok, 400 - invalid credentials
          callback(jqXHR.status, jqXHR.status == 200 ? jqXHR.responseJSON : null);
        }
      });
    }
};

return ParticleConnection;

});

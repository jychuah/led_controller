define(['jquery'], function($) {

ParticleConnection = function() {

};

ParticleConnection.prototype = {
    constructor: ParticleConnection,

    ERROR_PARTICLE_UNREACHABLE: "Particle.io was unreachable.",
    ERROR_PARTICLE_INVALID_CREDENTIALS: "The supplied username or password for Particle.io was invalid.",
    ERROR_PARTICLE_SERVER_ERROR: "Particle.io had some type of server error. Please try again later.",
    ERROR_PARTICLE_UNKNOWN_ERROR: "There was an unknown error while contacting Particle.io.",
    ERROR_PARTICLE_BAD_RESPONSE: "Particle.io was successfully contacted, but didn't return an Authorization token.",
    SUCCESS_PARTICLE_TOKEN_RETURNED : "Particle.io returned an access token",

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
          // callback called with status constant and data
          var status = ERROR_PARTICLE_UNKNOWN_ERROR;
          var data = jqXHR.status == 200 ? jqXHR.responseJSON : null;
          switch(status) {
            0 : status = ERROR_PARTICLE_UNREACHABLE; break;
            200 : stauts = SUCCESS_PARTICLE_TOKEN_RETURNED; break;
            400 : status = ERROR_PARTICLE_INVALID_CREDENTIALS; break;
            500 : status = ERROR_PARTICLE_SERVER_ERROR; break;
            default : status = ERROR_PARTICLE_UNKNOWN_ERROR; break;
          }
          callback(status, data);
        }
      });
    }
};

return ParticleConnection;

});

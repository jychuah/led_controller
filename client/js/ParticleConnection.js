define([], function() {

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
};

return ParticleConnection;

});

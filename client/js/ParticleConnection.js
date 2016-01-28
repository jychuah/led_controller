define(['jquery'], function($) {

ParticleConnection = function() {

};

ParticleConnection.prototype = {
    constructor: ParticleConnection,

    login: function(username, password) {
        console.log("Spark login beginning");
        spark.login({username: username, password: password}).then(
            function(token) {
                console.log("Token: ", token);
            },
            function(error) {
                console.log("Unable to log in:", error);
            }
        );
    }
};

return ParticleConnection;

});

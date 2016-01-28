define(['require', 'spark'], function(require) {

ParticleConnection = function() {

};

ParticleConnection.prototype = {
    constructor: ParticleConnection,

    login: function(username, password) {
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

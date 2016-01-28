require.config({
  baseUrl: "js/libs",
  shim : {
        "bootstrap" : { "deps" :['jquery'] },
    },
  paths: {
      jquery: "jquery-2.2.0.min",
      particleconnection: "../ParticleConnection",
      app: "../app",
      "bootstrap" :  "bootstrap.min" 
  }
});


require(['require'], function(require) {
  require(['app'], function(App) {
      var a = new App();
  });
});

require.config({
  baseUrl: "js/libs",
  paths: {
      jquery: "jquery-2.2.0.min",
      particleconnection: "../ParticleConnection",
      spark: "http://cdn.jsdelivr.net/sparkjs/1/spark.min"
  },
  packages: [
    { name : 'when', location: 'when', main: 'when' }
  ]
});


require(['require', 'when', 'spark'], function(require) {
  require(['jquery', 'particleconnection'], function($, ParticleConnection) {
      $(document).ready(function() {
          console.log("hello world");
      });
  });
});

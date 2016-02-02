define(['jquery', 'require', 'module', 'bootstrap'], function($, require, module) {
  PBDevicesModal = function(particleBaseInstance) {
    var pb = particleBaseInstance;
    this.$pbdevicesmodal = $('.pb-devices-modal');
    var path = require.toUrl(module.id);
    path = path.substring(0, path.lastIndexOf('/'));
    var htmlPath = path + '/html/pb-devices-modal.html';

    function init() {
      console.log("PB Devices Modal Hello World");
      $.getScript(path + '/listgroup.min.js');
    }

    $('.pb-devices-modal').addClass('modal fade');
    $('.pb-devices-modal').prop('role', 'dialog');
    $('.pb-devices-modal').load(htmlPath, null, init);


  }

  PBDevicesModal.prototype = {
    constructor: PBDevicesModal,
  }

  return PBDevicesModal;
});

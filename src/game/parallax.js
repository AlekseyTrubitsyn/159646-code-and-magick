'use strict';

module.exports = {
  slideClouds: function() {
    var utilities = require('../utilities');
    var clouds = document.querySelector('.header-clouds');

    clouds.style.backgroundPosition = 0;

    var waitSomeSec = false;
    var PARALLAX_TIMEOUT = 100;

    window.addEventListener('scroll', function() {

      if(!waitSomeSec) {
        waitSomeSec = true;

        if (utilities.isElementVisible(clouds)) {
          clouds.style.backgroundPosition = clouds.getBoundingClientRect().top + 'px 0';
        }
        setTimeout(function() {
          waitSomeSec = false;
        }, PARALLAX_TIMEOUT);
      }
    });
  }
};

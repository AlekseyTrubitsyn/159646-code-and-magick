'use strict';

module.exports = {

  getXHR: function(callback, loadURL) {
    var xhr = new XMLHttpRequest();

    xhr.onerror = function() {
      callback(true);
    };

    xhr.timeout = 10000;
    xhr.ontimeout = xhr.onerror;

    xhr.onloadstart = function() {
      callback(false);
    };

    xhr.onload = function(e) {
      callback(false, JSON.parse(e.target.response));
    };

    xhr.open('GET', loadURL);
    xhr.send();
  },

  downloadImage: function(url, callback) {
    var image = new Image();
    var imageLoadTimeout;
    var IMAGE_LOAD_TIMEOUT = 10000;

    image.addEventListener('load', function() {
      clearTimeout(imageLoadTimeout);
      callback();
    });

    image.addEventListener('error', function() {
      callback(true);
    });

    imageLoadTimeout = setTimeout(function() {
      callback(true);
      image.src = '';
    }, IMAGE_LOAD_TIMEOUT);

    image.src = url;
  },

  isElementVisible: function(elem) {
    return elem.getBoundingClientRect().bottom >= 0;
  },

  /**
   * @param {HTMLElement} elem
   * @param {boolean} isVisible
   */
  setVisibility: function(elem, isVisible) {
    if (isVisible) {
      elem.classList.remove('invisible');
    } else {
      elem.classList.add('invisible');
    }
  }



};

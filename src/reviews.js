'use strict';

(function() {
  var filterBlock = document.querySelector('.reviews-filter');
  var container = document.querySelector('.reviews-list');
  var template = document.querySelector('#review-template');
  var IMAGE_LOAD_TIMEOUT = 10000;
  var RATING_STAR_IMAGE_WIDTH = 30;
  var AUTHOR_IMAGE_WIDTH = 124;
  var AUTHOR_IMAGE_HEIGH = 124;
  var reviewToClone;

  setVisibility(filterBlock, false);

  if ('content' in template) {
    reviewToClone = template.content.querySelector('.review');
  } else {
    reviewToClone = template.querySelector('.review');
  }

  var createElement = function(data) {
    var clonedReview = reviewToClone.cloneNode(true);
    container.appendChild(clonedReview);

    clonedReview.querySelector('.review-text').textContent = data.description;

    if (data.rating > 1) {
      clonedReview.querySelector('.review-rating').style.width = RATING_STAR_IMAGE_WIDTH * data.rating + 'px';
    }

    var reviewAuthorImage = new Image();
    var reviewAuthorImageTimeout;

    var reviewAuthor = clonedReview.querySelector('.review-author');
    reviewAuthor.title = data.author.name;
    reviewAuthor.width = AUTHOR_IMAGE_WIDTH;
    reviewAuthor.height = AUTHOR_IMAGE_HEIGH;

    function setLoadFailureClass() {
      clonedReview.classList.add('review-load-failure');
    }

    reviewAuthorImage.onload = function(e) {
      clearTimeout(reviewAuthorImageTimeout);
      reviewAuthor.src = e.target.src;
    };

    reviewAuthorImage.onerror = setLoadFailureClass;

    reviewAuthorImageTimeout = setTimeout(function() {
      reviewAuthorImage.src = '';
      setLoadFailureClass();
    }, IMAGE_LOAD_TIMEOUT);

    reviewAuthorImage.src = data.author.picture; // На всякий случай поставил после установки таймаута

    return clonedReview;
  };

  window.reviews.forEach(function(review) {
    createElement(review);
  });

  setVisibility(filterBlock, true);

  function setVisibility(elem, isVisible) {
    if (isVisible) {
      elem.classList.remove('invisible');
    } else {
      elem.classList.add('invisible');
    }
  }
})();

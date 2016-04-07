'use strict';

(function() {
  var reviewsFilter = document.querySelector('.reviews-filter');
  var reviewsContainer = document.querySelector('.reviews-list');
  var reviewsTemplate = document.querySelector('#review-template');
  var IMAGE_LOAD_TIMEOUT = 10000;
  var reviewToClone;

  setVisibility(reviewsFilter, false);

  if ('content' in reviewsTemplate) {
    reviewToClone = reviewsTemplate.content.querySelector('.review');
  } else {
    reviewToClone = reviewsTemplate.querySelector('.review');
  }

  var getReviewElement = function(data, container) {
    var clonedReview = reviewToClone.cloneNode(true);
    container.appendChild(clonedReview);

    clonedReview.querySelector('.review-text').textContent = data.description;

    if (data.rating > 1) {
      var ratingStar = clonedReview.querySelector('.review-rating');
      for (var i = 2; i <= data.rating; i++) {
        clonedReview.insertBefore(ratingStar.cloneNode(), ratingStar);
      }
    }

    var reviewAuthorImage = new Image();
    var reviewAuthorImageTimeout;

    var reviewAuthor = clonedReview.querySelector('.review-author');
    reviewAuthor.title = data.author.name;
    reviewAuthor.width = 124;
    reviewAuthor.height = 124;

    reviewAuthorImage.onload = function(e) {
      clearTimeout(reviewAuthorImageTimeout);
      reviewAuthor.src = e.target.src;
    };

    reviewAuthorImage.onerror = function() {
      clonedReview.classList.add('review-load-failure');
    };

    reviewAuthorImage.src = data.author.picture;

    reviewAuthorImageTimeout = setTimeout(function() {
      reviewAuthorImage.src = '';
      clonedReview.classList.add('review-load-failure');
    }, IMAGE_LOAD_TIMEOUT);

    return clonedReview;
  };

  window.reviews.forEach(function(review) {
    getReviewElement(review, reviewsContainer);
  });

  setVisibility(reviewsFilter, true);

  function setVisibility(elem, isVisible) {
    if (isVisible) {
      elem.classList.remove('invisible');
    } else {
      elem.classList.add('invisible');
    }
  }
})();

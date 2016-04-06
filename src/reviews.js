'use strict';

(function() {
  var reviewsFilter = document.querySelector('.reviews-filter');
  var reviewsContainer = document.querySelector('.reviews-list');
  var reviewsTemplate = document.querySelector('#review-template');
  var elementToClone;

  setVisibility(reviewsFilter, false);

  if ('content' in reviewsTemplate) {
    elementToClone = reviewsTemplate.content.querySelector('.review');
  } else {
    elementToClone = reviewsTemplate.querySelector('.review');
  }

  /**
   * @param {Object} data
   * @param {HTMLElement} container
   * @return {HTMLElement}
   */
  var getReviewElement = function(data, container) {
    var element = elementToClone.cloneNode(true);
    elementToClone.querySelector('.review-text').textContent = data.description;
    container.appendChild(element);

    return element;
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

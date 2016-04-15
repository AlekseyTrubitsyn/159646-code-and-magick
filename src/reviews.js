'use strict';

(function() {

  var filterBlock = document.querySelector('.reviews-filter');
  var container = document.querySelector('.reviews-list');
  var template = document.querySelector('#review-template');

  var REVIEWS_LOAD_URL = '//o0.github.io/assets/json/reviews.json';
  var ACTIVE_FILTER_CLASSNAME = 'reviews-filter-active';
  var REVIEWS_LOAD_TIMEOUT = 10000;
  var reviews = [];
  var Filter = {
    'ALL': 'reviews-all',
    'RECENT': 'reviews-recent',
    'GOOD': 'reviews-good',
    'BAD': 'reviews-bad',
    'POPULAR': 'reviews-popular'
  };
  var DEFAULT_FILTER = Filter.ALL;

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

    reviewAuthorImage.onload = function(e) {
      clearTimeout(reviewAuthorImageTimeout);
      reviewAuthor.src = e.target.src;
    };

    reviewAuthorImage.onerror = function() {
      addLoadFailureClass(clonedReview);
    };

    reviewAuthorImageTimeout = setTimeout(function() {
      reviewAuthorImage.src = '';
      addLoadFailureClass(clonedReview);
    }, IMAGE_LOAD_TIMEOUT);

    reviewAuthorImage.src = data.author.picture;

    return clonedReview;
  };

  var getReviews = function(callback) {
    var xhr = new XMLHttpRequest();

    xhr.onerror = function() {
      addXhrErrorClass(container);
    };

    xhr.timeout = REVIEWS_LOAD_TIMEOUT;
    xhr.ontimeout = xhr.onerror;

    xhr.onloadstart = function() {
      addXhrListLoadingClass(container);
    };

    xhr.onload = function(e) {
      removeXhrListLoadingClass(container);
      var loadedData = JSON.parse(e.target.response);
      callback(loadedData);
    };

    xhr.open('GET', REVIEWS_LOAD_URL);
    xhr.send();
  };

  var clonedReviews = function(filteredReviews) {
    container.innerHTML = '';
    filteredReviews.forEach(function(review) {
      createElement(review);
    });
  };

  var setFilterEnabled = function(filter) {
    clonedReviews(getFilteredReviews(filter));

    var activeFilter = filterBlock.querySelector('.' + ACTIVE_FILTER_CLASSNAME);
    if (activeFilter) {
      activeFilter.classList.remove(ACTIVE_FILTER_CLASSNAME);
    }
    var filterToActivate = document.getElementById(filter);
    if (filterToActivate) {
      filterToActivate.classList.add(ACTIVE_FILTER_CLASSNAME);
      filterToActivate.checked = true;
    }
  };

  var setFiltersEnabled = function(enabled) {
    for (var i = 0; i < filterBlock.length; i++) {
      filterBlock[i].onclick = enabled ? function() {
        setFilterEnabled(this.id);
      } : null;
    }
  };

  getReviews(function(loadedReviews) {
    reviews = loadedReviews;
    setFiltersEnabled(true);
    setFilterEnabled(DEFAULT_FILTER);
    clonedReviews(reviews);
  });

  setVisibility(filterBlock, true);

  var getFilteredReviews = function(filter) {
    var reviewsToFilter = reviews.slice(0);
    var twoWeeksBefore = new Date() - 1000 * 60 * 60 * 24 * 14;

    switch (filter) {

      case Filter.RECENT:
        reviewsToFilter = reviewsToFilter.filter(function(a) {
          return new Date(a.date) >= twoWeeksBefore; // Про "не позже текущей даты ничего нет :)"
        });
        reviewsToFilter = reviewsToFilter.sort(function(a, b) {
          return b.date - a.date;
        });
        break;

      case Filter.GOOD:
        reviewsToFilter = reviewsToFilter.filter(function(a) {
          return a.rating >= 3;
        });
        reviewsToFilter = reviewsToFilter.sort(function(a, b) {
          return b.rating - a.rating;
        });
        break;

      case Filter.BAD:
        reviewsToFilter = reviewsToFilter.filter(function(a) {
          return a.rating <= 2;
        });
        reviewsToFilter = reviewsToFilter.sort(function(a, b) {
          return a.rating - b.rating;
        });
        break;

      case Filter.POPULAR:
        reviewsToFilter = reviewsToFilter.sort(function(a, b) {
          return b.review_usefulness - a.review_usefulness;
        });
        break;
      default:

    }
    return reviewsToFilter;
  };

  function addLoadFailureClass(elem) {
    elem.classList.add('review-load-failure');
  }

  function addXhrListLoadingClass(elem) {
    elem.classList.add('reviews-list-loading');
  }

  function removeXhrListLoadingClass(elem) {
    elem.classList.remove('reviews-list-loading');
  }

  function addXhrErrorClass(elem) {
    elem.classList.add('reviews-load-failure');
  }

  function setVisibility(elem, isVisible) {
    if (isVisible) {
      elem.classList.remove('invisible');
    } else {
      elem.classList.add('invisible');
    }
  }
})();

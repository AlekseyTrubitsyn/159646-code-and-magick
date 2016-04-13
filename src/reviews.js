'use strict';

(function() {
  var reviewsFilter = document.querySelector('.reviews-filter');
  var reviewsContainer = document.querySelector('.reviews-list');
  var reviewsTemplate = document.querySelector('#review-template');
  var showMoreReviews = document.querySelector('.reviews-controls-more');

  var REVIEWS_LOAD_URL = '//o0.github.io/assets/json/reviews.json';
  var ACTIVE_FILTER_CLASSNAME = 'reviews-filter-active';
  var REVIEWS_LOAD_TIMEOUT = 10000;
  var reviews = [];
  var filteredReviews = [];

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

  var PAGE_SIZE = 3;
  var pageNumber = 0;

  setVisibility(reviewsFilter, false);

  if ('content' in reviewsTemplate) {
    reviewToClone = reviewsTemplate.content.querySelector('.review');
  } else {
    reviewToClone = reviewsTemplate.querySelector('.review');
  }

  showMoreReviews.onclick = function() {
    pageNumber++;
    cloneReviews(pageNumber, false);
  };

  /**
   * @param {Object} data
   * @param {HTMLElement} container
   * @return {HTMLElement}
   */
  var getReviewElement = function(data, container) {
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
      clonedReview.classList.add('review-load-failure');
    };

    reviewAuthorImage.src = data.author.picture;

    reviewAuthorImageTimeout = setTimeout(function() {
      reviewAuthorImage.src = '';
      clonedReview.classList.add('review-load-failure');
    }, IMAGE_LOAD_TIMEOUT);

    return clonedReview;
  };

  /**
  * @param {function(Array.<Object>)} callback
  */
  var getReviews = function(callback) {
    var xhr = new XMLHttpRequest();

    xhr.onerror = function() {
      if (reviewsContainer) {
        reviewsContainer.classList.add('reviews-load-failure');
      }
    };

    xhr.timeout = REVIEWS_LOAD_TIMEOUT;
    xhr.ontimeout = xhr.onerror;

    xhr.onloadstart = function() {
      if (reviewsContainer) {
        reviewsContainer.classList.add('reviews-list-loading');
      }
    };

    xhr.onload = function(e) {
      reviewsContainer.classList.remove('reviews-list-loading');
      var loadedData = JSON.parse(e.target.response);
      callback(loadedData);
    };

    xhr.open('GET', REVIEWS_LOAD_URL);
    xhr.send();
  };

  /**
   * @param {Array.<Object>} filteredReviews
   * @param {number} page
   * @param {boolean=} replaceReviews
   */
  var cloneReviews = function(page, replaceReviews) {
    if (replaceReviews) {
      reviewsContainer.innerHTML = '';
    }

    var pageFrom = page * PAGE_SIZE;
    var pageTo = pageFrom + PAGE_SIZE;

    setVisibility(showMoreReviews, isNextPageAvailable(filteredReviews, pageNumber, PAGE_SIZE));

    filteredReviews.slice(pageFrom, pageTo).forEach(function(review) {
      getReviewElement(review, reviewsContainer);
    });
  };

  /**
  * @param {Filter} filter
  */
  var setFilterEnabled = function(filter) {
    pageNumber = 0;
    filteredReviews = getFilteredReviews(filter);
    cloneReviews(pageNumber, true);

    var activeFilter = reviewsFilter.querySelector('.' + ACTIVE_FILTER_CLASSNAME);
    if (activeFilter) {
      activeFilter.classList.remove(ACTIVE_FILTER_CLASSNAME);
    }
    var filterToActivate = document.getElementById(filter);
    if (filterToActivate) {
      filterToActivate.classList.add(ACTIVE_FILTER_CLASSNAME);
      filterToActivate.checked = true;
    }
  };

  /**
  * @param {boolean} enabled
  */
  var setFiltersEnabled = function() {
    reviewsFilter.addEventListener('click', function(evt) {
      if (evt.target.type === 'radio') { // Внутри блока с фильтрами ловим нажатие на radio button.
        setFilterEnabled(evt.target.id);
      }
    });
  };

  getReviews(function(loadedReviews) {
    reviews = loadedReviews;
    setFiltersEnabled(true);
    setFilterEnabled(DEFAULT_FILTER);
    cloneReviews(pageNumber, true);
  });

  setVisibility(reviewsFilter, true);

  /**
   * @param {Array} reviewList
   * @param {number} currentPageNumber
   * @param {number} pageSize
   * @return {boolean}
   */
  var isNextPageAvailable = function(reviewList, currentPageNumber, pageSize) {
    return (currentPageNumber + 1) < Math.ceil(reviewList.length / pageSize);
  };

  /**
   * @param {Filter} filter
   */
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

  /**
   * @param {HTMLElement} elem
   * @param {boolean} isVisible
   */
  function setVisibility(elem, isVisible) {
    if (isVisible) {
      elem.classList.remove('invisible');
    } else {
      elem.classList.add('invisible');
    }
  }
})();

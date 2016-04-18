'use strict';

(function() {
  var filterBlock = document.querySelector('.reviews-filter');
  var container = document.querySelector('.reviews-list');
  var template = document.querySelector('#review-template');
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

  var ONE_DAY_MILLISEC = 1000 * 60 * 60 * 24;
  var RECENT_DATE = new Date() - ONE_DAY_MILLISEC * 14;

  var reviewToClone;

  var PAGE_SIZE = 3;
  var pageNumber = 0;

  setVisibility(filterBlock, false);

  if ('content' in template) {
    reviewToClone = template.content.querySelector('.review');
  } else {
    reviewToClone = template.querySelector('.review');
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

  /**
  * @param {function(Array.<Object>)} callback
  */
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

  /**
   * @param {Array.<Object>} filteredReviews
   * @param {number} page
   * @param {boolean=} replaceReviews
   */
  var cloneReviews = function(page, replaceReviews) {
    if (replaceReviews) {
      container.innerHTML = '';
    }

    var pageFrom = page * PAGE_SIZE;
    var pageTo = pageFrom + PAGE_SIZE;

    setVisibility(showMoreReviews, isNextPageAvailable(filteredReviews, pageNumber, PAGE_SIZE));

    filteredReviews.slice(pageFrom, pageTo).forEach(function(review) {
      createElement(review);
    });
  };

  /**
  * @param {Filter} filter
  */
  var setFilterEnabled = function(filter) {
    pageNumber = 0;
    filteredReviews = filterReviews(filter);
    cloneReviews(pageNumber, true);

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

  /**
  * @param {boolean} enabled
  */
  var setFiltersEnabled = function() {
    filterBlock.addEventListener('click', function(evt) {
      if (evt.target.type === 'radio') {
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

  setVisibility(filterBlock, true);

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
  var filterReviews = function(filter) {
    var reviewsToFilter = reviews.slice(0);

    switch (filter) {

      case Filter.RECENT:
        return reviewsToFilter.filter(function(a) {
          return new Date(a.date) >= RECENT_DATE;
        }).sort(function(a, b) {
          return b.date > a.date;
        });

      case Filter.GOOD:
        return reviewsToFilter.filter(function(a) {
          return a.rating >= 3;
        }).sort(function(a, b) {
          return b.rating > a.rating;
        });

      case Filter.BAD:
        return reviewsToFilter.filter(function(a) {
          return a.rating <= 2;
        }).sort(function(a, b) {
          return a.rating > b.rating;
        });

      case Filter.POPULAR:
        return reviewsToFilter.sort(function(a, b) {
          return b.review_usefulness - a.review_usefulness;
        });

      default:
        return reviewsToFilter;
    }
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

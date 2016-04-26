'use strict';

(function() {
  var utilities = require('../utilities');

  var filterBlock = document.querySelector('.reviews-filter');
  var container = document.querySelector('.reviews-list');
  var template = document.querySelector('#review-template');
  var showMoreReviewsButton = document.querySelector('.reviews-controls-more');

  var REVIEWS_LOAD_URL = '//o0.github.io/assets/json/reviews.json';
  var ACTIVE_FILTER_CLASSNAME = 'reviews-filter-active';
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

  var RATING_STAR_IMAGE_WIDTH = 30;
  var AUTHOR_IMAGE_WIDTH = 124;
  var AUTHOR_IMAGE_HEIGH = 124;

  var ONE_DAY_MILLISEC = 1000 * 60 * 60 * 24;
  var RECENT_DATE = new Date() - ONE_DAY_MILLISEC * 14;

  var reviewToClone;

  var PAGE_SIZE = 3;
  var pageNumber = 0;

  utilities.setVisibility(filterBlock, false);

  if ('content' in template) {
    reviewToClone = template.content.querySelector('.review');
  } else {
    reviewToClone = template.querySelector('.review');
  }

  var showMoreReviews = function() {
    utilities.setVisibility(showMoreReviewsButton, isNextPageAvailable(filteredReviews, pageNumber, PAGE_SIZE));

    showMoreReviewsButton.addEventListener('click', function() {
      pageNumber++;
      cloneReviews(pageNumber, false);
    });
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

    utilities.downloadImage(data.author.picture, function(error) {
      if (error) {
        addLoadFailureClass(clonedReview);
      } else {
        var reviewAuthor = clonedReview.querySelector('.review-author');

        reviewAuthor.title = data.author.name;
        reviewAuthor.width = AUTHOR_IMAGE_WIDTH;
        reviewAuthor.height = AUTHOR_IMAGE_HEIGH;
        reviewAuthor.src = data.author.picture;
      }
    });

    return clonedReview;
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

    utilities.setVisibility(showMoreReviewsButton, isNextPageAvailable(filteredReviews, pageNumber, PAGE_SIZE));

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

  function reviewCallback(error, loadedReviews) {
    removeXhrListLoadingClass(container);

    if (error) {
      addXhrErrorClass(container);
    } else {
      reviews = loadedReviews;

      filterBlock.addEventListener('click', function(evt) {
        if (evt.target.type === 'radio') {
          setFilterEnabled(evt.target.id);
        }
      });

      setFilterEnabled(DEFAULT_FILTER);
      showMoreReviews();
    }
  }

  addXhrListLoadingClass(container);
  utilities.getXHR(reviewCallback, REVIEWS_LOAD_URL);

  utilities.setVisibility(filterBlock, true);

  /**
   * @param {Array} reviewList
   * @param {number} currentPageNumber
   * @param {number} pageSize
   * @return {boolean}
   */
  var isNextPageAvailable = function(reviewList, currentPageNumber, pageSize) {
    return (currentPageNumber + 1) < Math.ceil(reviewList.length / pageSize);
    // return currentPageNumber < Math.ceil(reviewList.length / pageSize);
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

})();

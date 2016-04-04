'use strict';

(function() {
  var formContainer = document.querySelector('.overlay-container');
  var formOpenButton = document.querySelector('.reviews-controls-new');
  var formCloseButton = document.querySelector('.review-form-close');

  var formSubmitButton = document.querySelector('.review-submit');
  var formScoreRadio = document.querySelector('.review-form-group-mark');
  var reviewScore;

  var formNameField = document.querySelector('#review-name');
  var formTextField = document.querySelector('#review-text');

  var reviewFields = document.querySelector('.review-fields');
  var reviewFieldName = document.querySelector('.review-fields-name');
  var reviewFieldText = document.querySelector('.review-fields-text');

  var browserCookies = require('browser-cookies');

  var cookieUserNameKey = 'code-and-magick-userName';
  var cookieUserTextKey = 'code-and-magick-userText';
  var cookieUserScoreKey = 'code-and-magick-userScore';

  checkScoreAndFields();

  formOpenButton.onclick = function(evt) {
    readReviewCookies();
    evt.preventDefault();
    formContainer.classList.remove('invisible');
  };

  formCloseButton.onclick = function(evt) {
    writeReviewCookies();
    evt.preventDefault();
    formContainer.classList.add('invisible');
  };

  formScoreRadio.onclick = function() {
    checkScoreAndFields();
  };

  formNameField.onchange = function() {
    checkFields();
  };

  formTextField.onchange = function() {
    checkFields();
  };

  function checkScoreAndFields() {
    reviewScore = document.querySelector('input[name=review-mark]:checked').value;
    if (reviewScore < 4) {
      formTextField.required = true;
    } else {
      formTextField.required = false;
    }
    checkFields();
  }

  function checkFields() {

    var nameFieldOK = !!formNameField.value;
    var textFieldOK = !!((reviewScore >= 4) || formTextField.value);
    var bothFieldsOK = nameFieldOK === textFieldOK;

    if (bothFieldsOK) {
      reviewFields.classList.add('invisible');
      formSubmitButton.disabled = false;

    } else {
      reviewFields.classList.remove('invisible');
      formSubmitButton.disabled = true;

      if (nameFieldOK) {
        reviewFieldName.classList.add('invisible');
      } else if (textFieldOK) {
        reviewFieldText.classList.add('invisible');
      }
    }
  }

  function readReviewCookies() {
    var nameFromCookies = browserCookies.get(cookieUserNameKey);
    var textFromCookies = browserCookies.get(cookieUserTextKey);
    var scoreFromCookies = browserCookies.get(cookieUserScoreKey);

    if (nameFromCookies !== null) {
      formNameField.value = nameFromCookies;
    }
    if (textFromCookies !== null) {
      formTextField.value = textFromCookies;
    }
    if (scoreFromCookies !== null) {
      reviewScore = scoreFromCookies;
      document.querySelector('#review-mark-' + reviewScore).checked = true;
    }
  }

  function writeReviewCookies() {
    var expiresDaysDelta = '{expires: ' + getDeltaFromBirthday() + '}';

    if (formNameField.value !== '') {
      browserCookies.set(cookieUserNameKey, formNameField.value, expiresDaysDelta);
    }
    if (formTextField.value !== '') {
      browserCookies.set(cookieUserTextKey, formTextField.value, expiresDaysDelta);
    }
    if (reviewScore.value !== '') {
      browserCookies.set(cookieUserScoreKey, reviewScore, expiresDaysDelta);
    }
  }

  function getDeltaFromBirthday() {
    var oneDayMilliseconds = 24 * 60 * 60 * 1000;
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var birthdayDate = (currentDate < birthdayDate) ? new Date(currentYear + '-06-04') : new Date(currentYear - 1 + '-06-04');

    return Math.round((currentDate.getTime() - birthdayDate.getTime()) / oneDayMilliseconds);
  }
})();

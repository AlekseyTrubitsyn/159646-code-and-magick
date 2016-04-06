'use strict';

(function() {
  var formContainer = document.querySelector('.overlay-container');
  var formOpenButton = document.querySelector('.reviews-controls-new');
  var formCloseButton = document.querySelector('.review-form-close');

  var formSubmitButton = document.querySelector('.review-submit');
  var formScoreRadio = document.querySelector('.review-form-group-mark');

  var formNameField = document.querySelector('#review-name');
  var formTextField = document.querySelector('#review-text');

  var reviewFields = document.querySelector('.review-fields');
  var reviewFieldName = document.querySelector('.review-fields-name');
  var reviewFieldText = document.querySelector('.review-fields-text');

  var browserCookies = require('browser-cookies');

  var cookieUserNameKey = 'code-and-magick-userName';
  var cookieUserTextKey = 'code-and-magick-userText';
  var cookieUserScoreKey = 'code-and-magick-userScore';

  formNameField.required = true;

  checkFields();

  formOpenButton.onclick = function(evt) {
    readReviewCookies();
    evt.preventDefault();
    setVisibility(formContainer, true);
  };

  formCloseButton.onclick = function(evt) {
    writeReviewCookies();
    evt.preventDefault();
    setVisibility(formContainer, false);
  };

  formScoreRadio.onclick = function() {
    checkFields();
  };

  formNameField.onchange = function() {
    checkFields();
  };

  formTextField.onchange = function() {
    checkFields();
  };

  function checkFields() {
    var negativeScore = getReviewScore() < 4;
    var nameFieldWrong = !formNameField.value;
    var textFieldWrong = negativeScore && !formTextField.value;
    var anyFieldWrong = nameFieldWrong || textFieldWrong;

    formTextField.required = negativeScore;
    formSubmitButton.disabled = anyFieldWrong;
    setVisibility(reviewFields, anyFieldWrong);
    setVisibility(reviewFieldName, nameFieldWrong);
    setVisibility(reviewFieldText, textFieldWrong);
  }

  function setVisibility(elem, isVisible) {
    if (isVisible) {
      elem.classList.remove('invisible');
    } else {
      elem.classList.add('invisible');
    }
  }

  function getReviewScore() {
    return document.querySelector('input[name=review-mark]:checked').value;
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
      document.querySelector('#review-mark-' + scoreFromCookies).checked = true;
    }
  }

  function writeReviewCookies() {
    var expiresDaysDelta = '{expires: ' + getDeltaFromBirthday() + '}';

    browserCookies.set(cookieUserNameKey, formNameField.value, expiresDaysDelta);
    browserCookies.set(cookieUserTextKey, formTextField.value, expiresDaysDelta);
    browserCookies.set(cookieUserScoreKey, getReviewScore(), expiresDaysDelta);
  }

  function getDeltaFromBirthday() {
    var oneDayMilliseconds = 24 * 60 * 60 * 1000;
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var birthdayDate = (currentDate < birthdayDate) ? new Date(currentYear + '-06-04') : new Date(currentYear - 1 + '-06-04');

    return Math.round((currentDate.getTime() - birthdayDate.getTime()) / oneDayMilliseconds);
  }
})();

'use strict';
var browserCookies = require('browser-cookies');

(function() {
  var utilities = require('./utilities.js');

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

  var cookieUserNameKey = 'code-and-magick-userName';
  var cookieUserTextKey = 'code-and-magick-userText';
  var cookieUserScoreKey = 'code-and-magick-userScore';

  formNameField.required = true;

  checkFields();

  formOpenButton.onclick = function(evt) {
    readReviewCookies();
    evt.preventDefault();
    utilities.setVisibility(formContainer, true);
  };

  formCloseButton.onclick = function(evt) {
    writeReviewCookies();
    evt.preventDefault();
    utilities.setVisibility(formContainer, false);
  };

  formScoreRadio.onclick = checkFields;
  formNameField.oninput = checkFields;
  formTextField.oninput = checkFields;

  function checkFields() {
    var negativeScore = getReviewScore() < 4;
    var nameFieldWrong = !formNameField.value;
    var textFieldWrong = negativeScore && !formTextField.value;
    var anyFieldWrong = nameFieldWrong || textFieldWrong;

    formTextField.required = negativeScore;
    formSubmitButton.disabled = anyFieldWrong;
    utilities.setVisibility(reviewFields, anyFieldWrong);
    utilities.setVisibility(reviewFieldName, nameFieldWrong);
    utilities.setVisibility(reviewFieldText, textFieldWrong);
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
    var birthday = new Date(currentYear + '-06-04');

    if (currentDate <= birthday) {
      birthday.setFullYear(currentYear - 1);
    }

    return Math.round((currentDate.getTime() - birthday.getTime()) / oneDayMilliseconds);
  }
})();

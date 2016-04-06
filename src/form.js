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

  formNameField.required = true;

  checkFields();

  formOpenButton.onclick = function(evt) {
    evt.preventDefault();
    setVisibility(formContainer, true);
  };

  formCloseButton.onclick = function(evt) {
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
})();

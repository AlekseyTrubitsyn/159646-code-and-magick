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

  checkScoreAndFields();

  formOpenButton.onclick = function(evt) {
    evt.preventDefault();
    formContainer.classList.remove('invisible');
  };

  formCloseButton.onclick = function(evt) {
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
})();

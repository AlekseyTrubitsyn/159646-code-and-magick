/* exported getMessage(a, b) */
'use strict';

function getMessage(a, b) {

  var valueIsBooleanAndCorrect = 'Я попал в [b]';
  var valueIsBooleanAndCorrectReplace = '[b]';

  var valueIsBooleanAndWrong = 'Я никуда не попал';

  var valueIsNumber = 'Я прыгнул на [a] * 100 сантиметров';
  var valueIsNumberReplace = '[a] * 100';

  var valueIsArray = 'Я прошёл [sum] шагов';
  var valueIsArrayReplace = '[sum]';

  var valueIsDoubleArray = 'Я прошёл [length] метров';
  var valueIsDoubleArrayReplace = '[length]';

  var valueUndefinedOrWrong = 'Что-то пошло не так...';

  var arraySum;

  switch (typeof (a)) {

    case 'boolean':
      if (a === true) {
        return valueIsBooleanAndCorrect.replace(valueIsBooleanAndCorrectReplace, b);
      } else {
        return valueIsBooleanAndWrong;
      }

    case 'number':
      return valueIsNumber.replace(valueIsNumberReplace, a * 100);

    case 'object':
      var aIsArray = Array.isArray(a);
      var bIsArray = Array.isArray(b);

      if (aIsArray && !bIsArray) {
        arraySum = 0;
        for (var i = a.length - 1; i >= 0; i--) {
          if (!isNaN(a[i])) {
            arraySum += a[i];
          }
        }
        return valueIsArray.replace(valueIsArrayReplace, arraySum);

      } else if (aIsArray && bIsArray) {
        arraySum = 0;
        for (var j = Math.min(a.length, b.length) - 1; j >= 0; j--) { /* Если в одном из массивов не число, то не учитываем этот индекс */
          arraySum += checkNumberAndMultiply(a[i], b[i]);
        }
        return valueIsDoubleArray.replace(valueIsDoubleArrayReplace, arraySum);
      } else {
        return valueUndefinedOrWrong;
      }

    default:
      return valueUndefinedOrWrong;
  }

  function checkNumberAndMultiply(firstValue, secondValue) {
    if (isNaN(firstValue) || isNaN(secondValue)) {
      return 0; /* Если в одном из массивов не число, то не учитываем этот индекс */
    } else {
      return firstValue * secondValue;
    }
  }
}

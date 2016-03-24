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

  switch (typeof(a)) {

    case "boolean":
      if (a === true)
        return valueIsBooleanAndCorrect.replace(valueIsBooleanAndCorrectReplace, b);
      else
        return valueIsBooleanAndWrong;
      break;

    case "number":
      return valueIsNumber.replace(valueIsNumberReplace, a*100);
      break;

    case "object":
      var aIsArray = Array.isArray(a);
      var bIsArray = Array.isArray(b);

      if (aIsArray && !bIsArray) {
        var i = a.length;
        var arraySum = 0;
        while (i--) {
          if (typeof(a[i]) !== "number") continue;
          arraySum += a[i];
        }
        return valueIsArray.replace(valueIsArrayReplace, arraySum);

      } else if (aIsArray && bIsArray) {
        var i = a.length;
        var j = b.length;
        var arraySum = 0;

        if (i === j) {
          while (i--) {
            // arraySum += a[i] * b[i]; /* Версия обычного человека */
            arraySum += checkNumberAndMultiply(a[i], b[i]); /* Версия параноика */
          }
          return valueIsDoubleArray.replace(valueIsDoubleArrayReplace, arraySum);

        } else if (i > j) {
          while (i-- > j){
            if (!checkNumber(a[i])) continue;
            arraySum += a[i];
          }
          while (j--) {
            arraySum += checkNumberAndMultiply(a[j], b[j]);
          }
          return valueIsDoubleArray.replace(valueIsDoubleArrayReplace, arraySum);

        } else if (i < j) {
          while (j-- > i){
            if (!checkNumber(b[j])) continue;
            arraySum += b[j];
          }
          while (i--) {
            arraySum += checkNumberAndMultiply(a[i], b[i]);
          }
          return valueIsDoubleArray.replace(valueIsDoubleArrayReplace, arraySum);
        }
      }
      break;

    default:
      return valueUndefinedOrWrong;
  }
}

function checkNumberAndMultiply(firstValue, secondValue){
  var firstIsNumber = checkNumber(firstValue);
  var secondIsNumber = checkNumber(secondValue);

  if (firstIsNumber && secondIsNumber) {
    return firstValue * secondValue;
  } else if (firstIsNumber) {
    return firstValue;
  } else if (secondIsNumber) {
    return secondValue;
  } else {
    return 0;
  }
}

function checkNumber(varToCheck) {
  return typeof(varToCheck) === "number";
}

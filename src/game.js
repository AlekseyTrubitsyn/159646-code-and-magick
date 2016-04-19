'use strict';

(function() {
  /**
   * @const
   * @type {number}
   */
  var HEIGHT = 300;

  /**
   * @const
   * @type {number}
   */
  var WIDTH = 700;

  /**
   * ID уровней.
   * @enum {number}
   */
  var Level = {
    'INTRO': 0,
    'MOVE_LEFT': 1,
    'MOVE_RIGHT': 2,
    'LEVITATE': 3,
    'HIT_THE_MARK': 4
  };

  /**
   * Порядок прохождения уровней.
   * @type {Array.<Level>}
   */
  var LevelSequence = [
    Level.INTRO
  ];

  /**
   * Начальный уровень.
   * @type {Level}
   */
  var INITIAL_LEVEL = LevelSequence[0];

  /**
   * Допустимые виды объектов на карте.
   * @enum {number}
   */
  var ObjectType = {
    'ME': 0,
    'FIREBALL': 1
  };

  /**
   * Допустимые состояния объектов.
   * @enum {number}
   */
  var ObjectState = {
    'OK': 0,
    'DISPOSED': 1
  };

  /**
   * Коды направлений.
   * @enum {number}
   */
  var Direction = {
    NULL: 0,
    LEFT: 1,
    RIGHT: 2,
    UP: 4,
    DOWN: 8
  };

  /**
   * Правила перерисовки объектов в зависимости от состояния игры.
   * @type {Object.<ObjectType, function(Object, Object, number): Object>}
   */
  var ObjectsBehaviour = {};

  /**
   * Обновление движения мага. Движение мага зависит от нажатых в данный момент
   * стрелок. Маг может двигаться одновременно по горизонтали и по вертикали.
   * На движение мага влияет его пересечение с препятствиями.
   * @param {Object} object
   * @param {Object} state
   * @param {number} timeframe
   */
  ObjectsBehaviour[ObjectType.ME] = function(object, state, timeframe) {
    // Пока зажата стрелка вверх, маг сначала поднимается, а потом левитирует
    // в воздухе на определенной высоте.
    // NB! Сложность заключается в том, что поведение описано в координатах
    // канваса, а не координатах, относительно нижней границы игры.
    if (state.keysPressed.UP && object.y > 0) {
      object.direction = object.direction & ~Direction.DOWN;
      object.direction = object.direction | Direction.UP;
      object.y -= object.speed * timeframe * 2;

      if (object.y < 0) {
        object.y = 0;
      }
    }

    // Если стрелка вверх не зажата, а маг находится в воздухе, он плавно
    // опускается на землю.
    if (!state.keysPressed.UP) {
      if (object.y < HEIGHT - object.height) {
        object.direction = object.direction & ~Direction.UP;
        object.direction = object.direction | Direction.DOWN;
        object.y += object.speed * timeframe / 3;
      } else {
        object.Direction = object.direction & ~Direction.DOWN;
      }
    }

    // Если зажата стрелка влево, маг перемещается влево.
    if (state.keysPressed.LEFT) {
      object.direction = object.direction & ~Direction.RIGHT;
      object.direction = object.direction | Direction.LEFT;
      object.x -= object.speed * timeframe;
    }

    // Если зажата стрелка вправо, маг перемещается вправо.
    if (state.keysPressed.RIGHT) {
      object.direction = object.direction & ~Direction.LEFT;
      object.direction = object.direction | Direction.RIGHT;
      object.x += object.speed * timeframe;
    }

    // Ограничения по перемещению по полю. Маг не может выйти за пределы поля.
    if (object.y < 0) {
      object.y = 0;
      object.Direction = object.direction & ~Direction.DOWN;
      object.Direction = object.direction & ~Direction.UP;
    }

    if (object.y > HEIGHT - object.height) {
      object.y = HEIGHT - object.height;
      object.Direction = object.direction & ~Direction.DOWN;
      object.Direction = object.direction & ~Direction.UP;
    }

    if (object.x < 0) {
      object.x = 0;
    }

    if (object.x > WIDTH - object.width) {
      object.x = WIDTH - object.width;
    }
  };

  /**
   * Обновление движения файрбола. Файрбол выпускается в определенном направлении
   * и после этого неуправляемо движется по прямой в заданном направлении. Если
   * он пролетает весь экран насквозь, он исчезает.
   * @param {Object} object
   * @param {Object} state
   * @param {number} timeframe
   */
  ObjectsBehaviour[ObjectType.FIREBALL] = function(object, state, timeframe) {
    if (object.direction & Direction.LEFT) {
      object.x -= object.speed * timeframe;
    }

    if (object.direction & Direction.RIGHT) {
      object.x += object.speed * timeframe;
    }

    if (object.x < 0 || object.x > WIDTH) {
      object.state = ObjectState.DISPOSED;
    }
  };

  /**
   * ID возможных ответов функций, проверяющих успех прохождения уровня.
   * CONTINUE говорит о том, что раунд не закончен и игру нужно продолжать,
   * WIN о том, что раунд выигран, FAIL — о поражении. PAUSE о том, что игру
   * нужно прервать.
   * @enum {number}
   */
  var Verdict = {
    'CONTINUE': 0,
    'WIN': 1,
    'FAIL': 2,
    'PAUSE': 3,
    'INTRO': 4
  };

  /**
   * Правила завершения уровня. Ключами служат ID уровней, значениями функции
   * принимающие на вход состояние уровня и возвращающие true, если раунд
   * можно завершать или false если нет.
   * @type {Object.<Level, function(Object):boolean>}
   */
  var LevelsRules = {};

  /**
   * Уровень считается пройденным, если был выпущен файлболл и он улетел
   * за экран.
   * @param {Object} state
   * @return {Verdict}
   */
  LevelsRules[Level.INTRO] = function(state) {
    var fireballs = state.garbage.filter(function(object) {
      return object.type === ObjectType.FIREBALL;
    });

    return fireballs.length ? Verdict.WIN : Verdict.CONTINUE;
  };

  /**
   * Начальные условия для уровней.
   * @enum {Object.<Level, function>}
   */
  var LevelsInitialize = {};

  /**
   * Первый уровень.
   * @param {Object} state
   * @return {Object}
   */
  LevelsInitialize[Level.INTRO] = function(state) {
    state.objects.push(
      // Установка персонажа в начальное положение. Он стоит в крайнем левом
      // углу экрана, глядя вправо. Скорость перемещения персонажа на этом
      // уровне равна 2px за кадр.
      {
        direction: Direction.RIGHT,
        height: 84,
        speed: 2,
        sprite: 'img/wizard.gif',
        spriteReversed: 'img/wizard-reversed.gif',
        state: ObjectState.OK,
        type: ObjectType.ME,
        width: 61,
        x: WIDTH / 3,
        y: HEIGHT - 100
      }
    );

    return state;
  };

  /**
   * Конструктор объекта Game. Создает canvas, добавляет обработчики событий
   * и показывает приветственный экран.
   * @param {Element} container
   * @constructor
   */
  var Game = function(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._pauseListener = this._pauseListener.bind(this);
  };

  Game.prototype = {
    /**
     * Текущий уровень игры.
     * @type {Level}
     */
    level: INITIAL_LEVEL,

    /**
     * Состояние игры. Описывает местоположение всех объектов на игровой карте
     * и время проведенное на уровне и в игре.
     * @return {Object}
     */
    getInitialState: function() {
      return {
        // Статус игры. Если CONTINUE, то игра продолжается.
        currentStatus: Verdict.CONTINUE,

        // Объекты, удаленные на последнем кадре.
        garbage: [],

        // Время с момента отрисовки предыдущего кадра.
        lastUpdated: null,

        // Состояние нажатых клавиш.
        keysPressed: {
          ESC: false,
          LEFT: false,
          RIGHT: false,
          SPACE: false,
          UP: false
        },

        // Время начала прохождения уровня.
        levelStartTime: null,

        // Все объекты на карте.
        objects: [],

        // Время начала прохождения игры.
        startTime: null
      };
    },

    /**
     * Начальные проверки и запуск текущего уровня.
     * @param {Level=} level
     * @param {boolean=} restart
     */
    initializeLevelAndStart: function(level, restart) {
      level = typeof level === 'undefined' ? this.level : level;
      restart = typeof restart === 'undefined' ? true : restart;

      if (restart || !this.state) {
        // При перезапуске уровня, происходит полная перезапись состояния
        // игры из изначального состояния.
        this.state = this.getInitialState();
        this.state = LevelsInitialize[this.level](this.state);
      } else {
        // При продолжении уровня состояние сохраняется, кроме записи о том,
        // что состояние уровня изменилось с паузы на продолжение игры.
        this.state.currentStatus = Verdict.CONTINUE;
      }

      // Запись времени начала игры и времени начала уровня.
      this.state.levelStartTime = Date.now();
      if (!this.state.startTime) {
        this.state.startTime = this.state.levelStartTime;
      }

      this._preloadImagesForLevel(function() {
        // Предварительная отрисовка игрового экрана.
        this.render();

        // Установка обработчиков событий.
        this._initializeGameListeners();

        // Запуск игрового цикла.
        this.update();
      }.bind(this));
    },

    /**
     * Временная остановка игры.
     * @param {Verdict=} verdict
     */
    pauseLevel: function(verdict) {
      if (verdict) {
        this.state.currentStatus = verdict;
      }

      this.state.keysPressed.ESC = false;
      this.state.lastUpdated = null;

      this._removeGameListeners();
      window.addEventListener('keydown', this._pauseListener);

      this._drawPauseScreen();
    },

    /**
     * Обработчик событий клавиатуры во время паузы.
     * @param {KeyboardsEvent} evt
     * @private
     * @private
     */
    _pauseListener: function(evt) {
      if (evt.keyCode === 32) {
        evt.preventDefault();
        var needToRestartTheGame = this.state.currentStatus === Verdict.WIN ||
            this.state.currentStatus === Verdict.FAIL;
        this.initializeLevelAndStart(this.level, needToRestartTheGame);

        window.removeEventListener('keydown', this._pauseListener);
      }
    },

    /**
     * Отрисовка экрана паузы.
     */
    _drawPauseScreen: function() {
      switch (this.state.currentStatus) {
        case Verdict.WIN:
          console.log('you have won!');
          this._drawWizardDialog('Фантастика! Точный выстрел!');
          break;
        case Verdict.FAIL:
          console.log('you have failed!');
          this._drawWizardDialog('Мимо. Сосредоточьтесь!');
          break;
        case Verdict.PAUSE:
          console.log('game is on pause!');
          this._drawWizardDialog('Пауза!');
          break;
        case Verdict.INTRO:
          console.log('welcome to the game! Press Space to start');
          this._drawWizardDialog('Добро пожаловать в игру!   Управляйте волшебником с помощью стрелок на клавиатуре, стрелять файерболом - shift. Удачи! Пробел для продолжения.');
          break;
      }
    },

    /**
     * Отрисовка окна диалога с тенью
     * @param {string} dialogText Строка с текстом диалога
    */

    _drawWizardDialog: function(dialogText) {

      var thisCtx = this.ctx;

      var textFont = '16px \'Pt Sans\'';
      var textBaseLine = 'hanging';
      var textFillStyle = '#000';
      var textLineHeight = 20;

      var canvasShadowStyle = 'rgba(0, 0, 0, 0.7)';
      var canvasShadowShift = 5;
      var canvasDialogStyle = '#fff';

      var wizardObject = this.state.objects[0];
      var dialogPosX = 0;
      var dialogPosY = 0;
      var wizardWidth = 0;

      var dialogMarginX = 7;
      var dialogMarginY = 102;
      var dialogOnTheRight = true;

      /*
      *   Считаем, что фигура представляет собой квадрат, размеры которого
      *   определяются размерами текста внутри плюс паддинги, а 3 или 4 точка
      *   (в зависимости от расположения dialogOnTheRight) удалена на некоторое
      *   расстояние.
      */
      var dialogWidth = 266;
      var dialogHeight = 122;
      var dialogPaddingX = 20;
      var dialogPaddingY = 15;
      var displaceDelta = [16, 14];
      var displaceAndMarginY = displaceDelta[1] + dialogMarginY;

      var dialogPoint1;
      var dialogPoint2;
      var dialogPoint3;
      var dialogPoint4;
      var dialogPoint5;

      /*
      * Вычислим расположение первой точки фигуры с учетом
      * расположения Волшебника и заданных выше отступов.
      * Считаем, что поля y, x и width у объекта существуют.
      */
      if (wizardObject !== 'undefined') {
        wizardWidth = wizardObject.width;
        dialogPosX = wizardWidth + wizardObject.x + dialogMarginX;
        dialogPosY = wizardObject.y - dialogMarginY;

      } else {
        dialogPosX = WIDTH / 2 - dialogWidth / 2;
        dialogPosY = HEIGHT / 2 - (dialogHeight + displaceAndMarginY) / 2;
      }

      /*
      * Проверим, не выходит ли диалог за пределы канваса.
      * Если выходит по ширине - отрисуем его слева
      */
      if (dialogPosX + dialogWidth > WIDTH) {
        dialogPosX = dialogPosX - wizardWidth - dialogWidth - dialogMarginX;
        dialogOnTheRight = false;
      }

      dialogPosY = (dialogPosY >= 0) ? dialogPosY : 0;

      /*
      *  Зададим первоначальные координаты точек без учета высоты текста.
      */
      if (dialogOnTheRight) {
        dialogPoint1 = [dialogPosX + displaceDelta[0], dialogPosY];
        dialogPoint2 = [dialogPoint1[0] + dialogWidth, dialogPoint1[1]];
        dialogPoint3 = [dialogPoint2[0], dialogPoint2[1] + dialogHeight];
        dialogPoint4 = [dialogPosX, dialogPoint3[1] + displaceDelta[1]];

      } else {
        dialogPoint1 = [dialogPosX - displaceDelta[0] - canvasShadowShift - 2 * dialogMarginX, dialogPosY];
        dialogPoint2 = [dialogPoint1[0] + dialogWidth, dialogPoint1[1]];
        dialogPoint3 = [dialogPoint2[0] + displaceDelta[0], dialogPoint2[1] + dialogHeight + displaceDelta[1]];
        dialogPoint4 = [dialogPoint1[0], dialogPoint3[1] - displaceDelta[1]];
      }
      dialogPoint5 = dialogPoint1;

      /*
      * Получим необходимую высоту фигуры с
      * учетом количества строк текста.
      */
      var ctxTemp = thisCtx;
      ctxTemp.font = textFont;
      var modifiedDialogText = splitText(ctxTemp, dialogWidth - dialogPaddingX * 2, dialogText);
      var newDialogHeight = modifiedDialogText.length * textLineHeight + dialogPaddingY;

      /*
      *  Изменим положение точек на вертикальной оси с учетом размеров текста и положения нашей фигуры.
      *  Поднимаем верхнюю грань (1,2 и 5 точки) до максимальной высоты,
      *  если не хватает места - двигаем 3 и 4 точки вниз.
      */

      var minBottomSpace = displaceDelta[1] + canvasShadowShift + dialogPaddingY;

      if (newDialogHeight > dialogHeight) {
        var maxDialogHeight = HEIGHT - minBottomSpace;

        newDialogHeight = (newDialogHeight > maxDialogHeight) ? maxDialogHeight : newDialogHeight;

        var heightDelta = newDialogHeight - dialogHeight;
        var overflowDelta = dialogPosY - heightDelta;

        if (overflowDelta >= 0) {
          dialogPoint1[1] -= heightDelta;
          dialogPoint2[1] -= heightDelta;
          dialogPoint5[1] = dialogPoint1[1];

        } else {
          if (overflowDelta < 0) {
            dialogPoint1[1] -= dialogPosY;
            dialogPoint2[1] -= dialogPosY;
            dialogPoint3[1] -= overflowDelta;
            dialogPoint4[1] -= overflowDelta;
            dialogPoint5[1] = dialogPoint1[1];
          }
        }
      }

      var dialogPoints = [dialogPoint1, dialogPoint2, dialogPoint3, dialogPoint4, dialogPoint5];

      drawFigure(canvasShadowStyle, canvasShadowShift);
      drawFigure(canvasDialogStyle, 0);
      drawText();

      function drawFigure(fillColor, shift) {
        var ctxShape = thisCtx;
        ctxShape.fillStyle = fillColor;
        ctxShape.beginPath();
        ctxShape.moveTo(dialogPoints[0][0] + shift, dialogPoints[0][1] + shift);

        for (var j = 1; j < dialogPoints.length; j++) {
          ctxShape.lineTo(dialogPoints[j][0] + shift, dialogPoints[j][1] + shift);
        }

        ctxShape.closePath();
        ctxShape.fill();
      }

      function drawText() {
        var ctxText = thisCtx;
        var linePositionY = dialogPoint1[1] + dialogPaddingY;
        var bottomLineY = Math.min(dialogPoints[2][1], dialogPoints[3][1]) - dialogPaddingY;

        ctxText.font = textFont;
        ctxText.textBaseline = textBaseLine;
        ctxText.fillStyle = textFillStyle;

        for (var m = 0; (m < modifiedDialogText.length) && (linePositionY < bottomLineY); m++) {
          ctxText.fillText(modifiedDialogText[m], dialogPoint1[0] + dialogPaddingX, linePositionY);
          linePositionY += textLineHeight;
        }
      }

      function splitText(context, canvasWidth, text) {
        var words = text.split(' ');
        var wordsCount = words.length;
        var resultText = '';
        var resultTextLinesArray = [''];
        var k = 0;

        for (var j = 0; j < wordsCount; j++) {

          var newWord = words[j];
          resultText += newWord;

          var newLineWidth = context.measureText(resultText).width;

          if (newLineWidth > canvasWidth) {
            k++;
            resultTextLinesArray[k] = words[j] + ' ';
            resultText = words[j];

          } else {
            resultTextLinesArray[k] += words[j] + ' ';
            resultText += ' ';
          }
        }
        return resultTextLinesArray;
      }
    },

    /**
     * Предзагрузка необходимых изображений для уровня.
     * @param {function} callback
     * @private
     */
    _preloadImagesForLevel: function(callback) {
      if (typeof this._imagesArePreloaded === 'undefined') {
        this._imagesArePreloaded = [];
      }

      if (this._imagesArePreloaded[this.level]) {
        callback();
        return;
      }

      var levelImages = [];
      this.state.objects.forEach(function(object) {
        levelImages.push(object.sprite);

        if (object.spriteReversed) {
          levelImages.push(object.spriteReversed);
        }
      });

      var i = levelImages.length;
      var imagesToGo = levelImages.length;

      while (i-- > 0) {
        var image = new Image();
        image.src = levelImages[i];
        image.onload = function() {
          if (--imagesToGo === 0) {
            this._imagesArePreloaded[this.level] = true;
            callback();
          }
        }.bind(this);
      }
    },

    /**
     * Обновление статуса объектов на экране. Добавляет объекты, которые должны
     * появиться, выполняет проверку поведения всех объектов и удаляет те, которые
     * должны исчезнуть.
     * @param {number} delta Время, прошеднее с отрисовки прошлого кадра.
     */
    updateObjects: function(delta) {
      // Персонаж.
      var me = this.state.objects.filter(function(object) {
        return object.type === ObjectType.ME;
      })[0];

      // Добавляет на карту файрбол по нажатию на Shift.
      if (this.state.keysPressed.SHIFT) {
        this.state.objects.push({
          direction: me.direction,
          height: 24,
          speed: 5,
          sprite: 'img/fireball.gif',
          type: ObjectType.FIREBALL,
          width: 24,
          x: me.direction & Direction.RIGHT ? me.x + me.width : me.x - 24,
          y: me.y + me.height / 2
        });

        this.state.keysPressed.SHIFT = false;
      }

      this.state.garbage = [];

      // Убирает в garbage не используемые на карте объекты.
      var remainingObjects = this.state.objects.filter(function(object) {
        ObjectsBehaviour[object.type](object, this.state, delta);

        if (object.state === ObjectState.DISPOSED) {
          this.state.garbage.push(object);
          return false;
        }

        return true;
      }, this);

      this.state.objects = remainingObjects;
    },

    /**
     * Проверка статуса текущего уровня.
     */
    checkStatus: function() {
      // Нет нужны запускать проверку, нужно ли останавливать уровень, если
      // заранее известно, что да.
      if (this.state.currentStatus !== Verdict.CONTINUE) {
        return;
      }

      if (!this.commonRules) {
        /**
         * Проверки, не зависящие от уровня, но влияющие на его состояние.
         * @type {Array.<functions(Object):Verdict>}
         */
        this.commonRules = [
          /**
           * Если персонаж мертв, игра прекращается.
           * @param {Object} state
           * @return {Verdict}
           */
          function checkDeath(state) {
            var me = state.objects.filter(function(object) {
              return object.type === ObjectType.ME;
            })[0];

            return me.state === ObjectState.DISPOSED ?
                Verdict.FAIL :
                Verdict.CONTINUE;
          },

          /**
           * Если нажата клавиша Esc игра ставится на паузу.
           * @param {Object} state
           * @return {Verdict}
           */
          function checkKeys(state) {
            return state.keysPressed.ESC ? Verdict.PAUSE : Verdict.CONTINUE;
          },

          /**
           * Игра прекращается если игрок продолжает играть в нее два часа подряд.
           * @param {Object} state
           * @return {Verdict}
           */
          function checkTime(state) {
            return Date.now() - state.startTime > 3 * 60 * 1000 ?
                Verdict.FAIL :
                Verdict.CONTINUE;
          }
        ];
      }

      // Проверка всех правил влияющих на уровень. Запускаем цикл проверок
      // по всем универсальным проверкам и проверкам конкретного уровня.
      // Цикл продолжается до тех пор, пока какая-либо из проверок не вернет
      // любое другое состояние кроме CONTINUE или пока не пройдут все
      // проверки. После этого состояние сохраняется.
      var allChecks = this.commonRules.concat(LevelsRules[this.level]);
      var currentCheck = Verdict.CONTINUE;
      var currentRule;

      while (currentCheck === Verdict.CONTINUE && allChecks.length) {
        currentRule = allChecks.shift();
        currentCheck = currentRule(this.state);
      }

      this.state.currentStatus = currentCheck;
    },

    /**
     * Принудительная установка состояния игры. Используется для изменения
     * состояния игры от внешних условий, например, когда необходимо остановить
     * игру, если она находится вне области видимости и установить вводный
     * экран.
     * @param {Verdict} status
     */
    setGameStatus: function(status) {
      if (this.state.currentStatus !== status) {
        this.state.currentStatus = status;
      }
    },

    /**
     * Отрисовка всех объектов на экране.
     */
    render: function() {
      // Удаление всех отрисованных на странице элементов.
      this.ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Выставление всех элементов, оставшихся в this.state.objects согласно
      // их координатам и направлению.
      this.state.objects.forEach(function(object) {
        if (object.sprite) {
          var image = new Image(object.width, object.height);
          image.src = (object.spriteReversed && object.direction & Direction.LEFT) ?
              object.spriteReversed :
              object.sprite;
          this.ctx.drawImage(image, object.x, object.y, object.width, object.height);
        }
      }, this);
    },

    /**
     * Основной игровой цикл. Сначала проверяет состояние всех объектов игры
     * и обновляет их согласно правилам их поведения, а затем запускает
     * проверку текущего раунда. Рекурсивно продолжается до тех пор, пока
     * проверка не вернет состояние FAIL, WIN или PAUSE.
     */
    update: function() {
      if (!this.state.lastUpdated) {
        this.state.lastUpdated = Date.now();
      }

      var delta = (Date.now() - this.state.lastUpdated) / 10;
      this.updateObjects(delta);
      this.checkStatus();

      switch (this.state.currentStatus) {
        case Verdict.CONTINUE:
          this.state.lastUpdated = Date.now();
          this.render();
          requestAnimationFrame(function() {
            this.update();
          }.bind(this));
          break;

        case Verdict.WIN:
        case Verdict.FAIL:
        case Verdict.PAUSE:
        case Verdict.INTRO:
        default:
          this.pauseLevel();
          break;
      }
    },

    /**
     * @param {KeyboardEvent} evt [description]
     * @private
     */
    _onKeyDown: function(evt) {
      switch (evt.keyCode) {
        case 37:
          this.state.keysPressed.LEFT = true;
          break;
        case 39:
          this.state.keysPressed.RIGHT = true;
          break;
        case 38:
          this.state.keysPressed.UP = true;
          break;
        case 27:
          this.state.keysPressed.ESC = true;
          break;
      }

      if (evt.shiftKey) {
        this.state.keysPressed.SHIFT = true;
      }
    },

    /**
     * @param {KeyboardEvent} evt [description]
     * @private
     */
    _onKeyUp: function(evt) {
      switch (evt.keyCode) {
        case 37:
          this.state.keysPressed.LEFT = false;
          break;
        case 39:
          this.state.keysPressed.RIGHT = false;
          break;
        case 38:
          this.state.keysPressed.UP = false;
          break;
        case 27:
          this.state.keysPressed.ESC = false;
          break;
      }

      if (evt.shiftKey) {
        this.state.keysPressed.SHIFT = false;
      }
    },

    /** @private */
    _initializeGameListeners: function() {
      window.addEventListener('keydown', this._onKeyDown);
      window.addEventListener('keyup', this._onKeyUp);
    },

    /** @private */
    _removeGameListeners: function() {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
    }
  };

  window.Game = Game;
  window.Game.Verdict = Verdict;

  var game = new Game(document.querySelector('.demo'));
  game.initializeLevelAndStart();
  game.setGameStatus(window.Game.Verdict.INTRO);

  // Параллакс
  var clouds = document.querySelector('.header-clouds');
  var demo = document.querySelector('.demo');

  var CLOUDS_IMAGE_WIDTH = 1024;
  var currentPageY = window.scrollY;
  var cloudsDefaultPosX = (document.body.clientWidth - CLOUDS_IMAGE_WIDTH) / 2 || 0;
  var scrollTimeout;

  var PARALLAX_TIMEOUT = 100;

  var cloudsPosX = function() {
    var cloudsCurrentPosX = clouds.style.backgroundPosition;

    if(cloudsCurrentPosX === '') {
      cloudsCurrentPosX = cloudsDefaultPosX;
    } else {
      cloudsCurrentPosX = cloudsCurrentPosX.split(' ')[0].replace('px', '');
    }
    return cloudsCurrentPosX;
  };

  window.addEventListener('scroll', function(evt) {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(function() {
      if (clouds.getBoundingClientRect().bottom >= 0) {
        var deltaPageY = evt.pageY - currentPageY;
        var cloudsCurrentPosX = cloudsPosX();

        clouds.style.backgroundPosition = cloudsCurrentPosX - deltaPageY * 0.15 + 'px 0';
        currentPageY = evt.pageY;
      } else if (demo.getBoundingClientRect().bottom < 0) {
        game.setGameStatus(Game.Verdict.PAUSE);
      }
    }, PARALLAX_TIMEOUT);
  });
})();

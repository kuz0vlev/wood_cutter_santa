var Santa = {
  /* MINIMAL WIDTH AND HEIGHT */
  CANVAS_WIDTH: 950,
  CANVAS_HEIGHT: 1200,

  best: 0,

  /**
   *
   * Запуск игры
   *
   */
  start: function () {
    $(document).ready(function () {
      Santa.preload();

      Santa.update();
    });
  },

  /**
   *
   * Подготовка игры
   *
   */
  preload: function () {
    this.html.preload();

    this.state.menu.layers.preload();

    this.events.preload();
    this.snow.preload();

    this.cookie.get();
  },

  /**
   *
   * Анимация в постоянном режиме
   *
   */
  update: function () {
    var update = function () {
      if (Santa.state.now === "menu") {
        Santa.state.menu.animate();
      }

      if (Santa.state.now === "game") {
        Santa.state.game.animate();
      }

      $("#display").drawLayers();
      Santa.snow.drawFlakes();

      requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  },

  /**
   *
   * Снег
   *
   */
  snow: {
    flakes: [],
    mf: 200,
    angle: 0,
    access: true,

    preload: function () {
      for (var i = 0; i < Santa.snow.mf; i++) {
        this.flakes.push({
          x: Santa.rand(-0.7 * Santa.CANVAS_WIDTH, 1.4 * Santa.CANVAS_WIDTH), //set width of flake to random nr between 0 and 1 * width of screen
          y: Math.random() * Santa.CANVAS_HEIGHT, //set height of flake to random nr between 0 and 1 * height of screen
          r: Math.random() * 5 + 2, //set radius between 2 and 5
          d: Math.random() + 1,
        });
      }
    },

    //draw flakes
    drawFlakes: function () {
      if (!this.access) {
        return;
      }

      var ctx = document.getElementById("display").getContext("2d");

      ctx.fillStyle = "white";
      ctx.beginPath();
      for (var i = 0; i < this.mf; i++) {
        var f = this.flakes[i];
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      Santa.snow.moveFlakes();
    },

    moveFlakes: function () {
      Santa.snow.angle += 0.01;

      for (var i = 0; i < Santa.snow.mf; i++) {
        var f = this.flakes[i];
        f.y += Math.pow(f.d, 2) + 1;
        f.x += Math.cos(Santa.snow.angle) * 2;

        if (f.y > Santa.CANVAS_HEIGHT) {
          this.flakes[i] = {
            x: Santa.rand(-0.7 * Santa.CANVAS_WIDTH, 1.4 * Santa.CANVAS_WIDTH),
            y: 0,
            r: f.r,
            d: f.d,
          };
        }
      }
    },
  },

  /**
   *
   * Сцены (меню и игра) + Экшены и Анимации к сценам
   *
   */
  state: {
    /**
     *
     * Какая сцена на данный момент
     *
     */
    now: "menu",

    /**
     *
     * Загружает переданные слои в объект
     *
     */
    preloadLayers: function (layers) {
      $("#display").removeLayers();

      for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];

        if (
          typeof layer.data === "object" &&
          typeof layer.data.type !== "undefined"
        ) {
          layer.type = layer.data.type;
        } else {
          // default type
          layer.type = "image";
        }
        layer.layer = true;
        layer.fromCenter = false;

        $("#display").addLayer(layer);
      }
    },

    /**
     *
     * Экшены (Действия при нажатии на экран или мышкой)
     *
     */
    action: {
      buttonTouching: function (name) {
        $("#display")
          .setLayer(name, { visible: false })
          .setLayer(name + "Down", { visible: true });
      },
      buttonOut: function (name) {
        $("#display")
          .setLayer(name, { visible: true })
          .setLayer(name + "Down", { visible: false });
      },

      playTouched: function () {
        Santa.state.switchStateToGame();
      },
      titleTouching: function () {
        $("#display").setLayer("title", {
          rotate: 3,
        });
      },
      titleTouched: function () {
        $("#display").setLayer("title", {
          rotate: 0,
        });
      },
      charMove: function (pos) {
        var isPause = Santa.layersGame().pauseButton.pause;

        if (isPause) {
          return;
        }

        var that = Santa.layersGame().char;

        if (that.death) {
          return;
        }

        Santa.layersGame().time.animatePlusTime();
        Santa.layersGame().time.start = true;

        Santa.layersGame().arrows.hide = true;
        Santa.layersGame().pauseButton.show = true;

        that.end();
        that.position = pos;
        that.access = true;
      },
      startNewGame: function () {
        Santa.snow.access = true;
        Santa.state.game = $.extend(true, {}, Santa.state.game.copy); // restore backup
        Santa.state.switchStateToGame();
      },
    },

    /**
     *
     * Содержит доступные анимации
     *
     */
    animations: {
      titleDown: function () {
        var y = $("#display").getLayer("title").y;
        var pos = (Santa.CANVAS_HEIGHT * 0.4 - 397) / 2;

        if (y < pos) {
          y = y > pos - 50 ? pos : y + 50;

          $("#display").setLayer("title", {
            y: y,
          });
        }
      },

      playDown: function () {
        var y = $("#display").getLayer("playbig").y;
        var pos = (Santa.CANVAS_HEIGHT - 241 + 100) / 2;

        if (y < pos) {
          y = y > pos - 50 ? pos : y + 50;

          $("#display").setLayer("playbig", { y: y });
        } else {
          $("#display").setLayer("playbigDown", { y: y + 10 });
        }
      },

      char: function () {
        Santa.layersGame().char.animate();
      },

      trunk: function () {
        Santa.layersGame().trunk.animate();
      },

      cutting: function () {
        Santa.layersGame().cutting.animate();
      },

      arrows: function () {
        Santa.layersGame().arrows.animate();
      },

      pauseButton: function () {
        Santa.layersGame().pauseButton.pauseShow();
      },

      time: function () {
        Santa.layersGame().time.animateMinusTime();
      },

      panelHide: function () {
        Santa.layersGame().time.timeHide();
        Santa.layersGame().score.scoreHide();
        Santa.layersGame().pauseButton.pauseHide();
      },

      flash: function () {
        Santa.layersGame().flash.animate();
      },

      replay: function () {
        // On animation to replay
        Santa.layersGame().scoreBoard.replay = true;
        Santa.layersGame().black.replay = true;
      },

      blackShow: function () {
        Santa.layersGame().black.show();
      },

      blackHide: function () {
        Santa.layersGame().black.hide();
      },

      scoreBoard: function () {
        Santa.layersGame().scoreBoard.animate();
      },

      pauseBoard: function () {
        Santa.layersGame().pauseBoard.animate();
      },
    },

    /**
     *
     * Переключает состояние на игровое
     *
     */
    switchStateToGame: function () {
      Santa.state.game.copy = $.extend(true, {}, Santa.state.game); // do backup

      this.now = "game";
      this.game.layers.preload();
    },

    /**
     *
     * Получает размер фона
     *
     * @returns {{width: number, height: number}}
     */
    getSizeBg: function () {
      var width = 2287;
      var height = 1308;

      while (height < Santa.CANVAS_HEIGHT || width < Santa.CANVAS_WIDTH) {
        height *= 1.1;
        width *= 1.1;
      }

      return {
        width: width,
        height: height,
      };
    },

    /**
     *
     * Состояние "меню"
     *
     */
    menu: {
      animate: function () {
        var that = Santa.state.animations;

        that.titleDown();
        that.playDown();
      },

      layers: {
        build: function () {
          var width = Santa.state.getSizeBg().width;
          var height = Santa.state.getSizeBg().height;

          return [
            {
              name: "bgMenu",
              source: "src/bg/sky-mountain-menu.png",
              x: (Santa.CANVAS_WIDTH - width) / 2,
              y: (Santa.CANVAS_HEIGHT - height) / 1.5,
              data: {
                tapend: function () {
                  Santa.state.action.buttonOut("playbig");
                  Santa.state.action.titleTouched();
                },
                mousemove: function () {
                  Santa.state.action.titleTouched();
                },
              },
              width: width,
              height: height,
            },
            {
              name: "title",
              source: "src/gui/title.png",
              x: (Santa.CANVAS_WIDTH - 831) / 2,
              y: -600,
              data: {
                tapend: function () {
                  Santa.state.action.buttonOut("playbig");
                },
                mousemove: function () {
                  Santa.state.action.titleTouching();
                },
              },
            },
            {
              name: "playbig",
              source: "src/gui/buttons/playbig.png",
              x: (Santa.CANVAS_WIDTH - 231) / 2,
              y: -100,
              data: {
                tapstart: function () {
                  Santa.state.action.buttonTouching("playbig");
                },
              },
            },
            {
              name: "playbigDown",
              source: "src/gui/buttons/playbig-down.png",
              x: (Santa.CANVAS_WIDTH - 231) / 2,
              y: (Santa.CANVAS_HEIGHT - 241) / 2 + 10,
              visible: false,
              data: {
                tapend: function () {
                  Santa.state.action.playTouched();
                },
              },
            },
          ];
        },
        preload: function () {
          Santa.state.preloadLayers(this.build());
        },
      },
    },

    /**
     *
     * Состояние "игра"
     *
     */
    game: {
      fpsChar: 0,
      copy: {},

      animate: function () {
        var that = Santa.state.animations;
        var isDeath = Santa.layersGame().char.death;
        var isPause = Santa.layersGame().pauseButton.pause;

        if (!isDeath) {
          // Time line animate

          if (isPause) {
            that.blackShow();
          } else {
            that.blackHide();
            that.time();
          }
        } else {
          // Hide panel (time and score)
          that.panelHide();

          // Flash white animate
          that.flash();

          if (Santa.layersGame().flash.ready) {
            that.blackShow();
            that.scoreBoard();
          }
        }

        // Char animate
        this.fpsChar++;
        if (this.fpsChar === 3) {
          that.char();
          this.fpsChar = 0;
        }

        // Arrows animate
        that.arrows();

        // Pause button animate
        that.pauseButton();

        // Trunk animate
        that.trunk();

        // Cutting animate
        that.cutting();

        // Pause board animate
        that.pauseBoard();
      },

      layers: {
        /* Объекты слоёв */
        parts: {
          // Фон
          bg: {
            build: function () {
              var width = Santa.state.getSizeBg().width;
              var height = Santa.state.getSizeBg().height;

              return {
                name: "bgGame",
                source: "src/bg/sky-mountain-game.png",
                x: (Santa.CANVAS_WIDTH - width) / 2,
                y: (Santa.CANVAS_HEIGHT - height) / 2,
                width: width,
                height: height,
                data: {
                  tapstart: function (x) {
                    var pos = x < Santa.CANVAS_WIDTH / 2 ? "left" : "right";
                    Santa.state.action.charMove(pos);
                  },
                  tapend: function () {
                    Santa.state.action.buttonOut("pause");
                  },
                },
              };
            },
          },
          // Части дерева
          trunk: {
            data: [],
            maxTrunks: 0,

            addOne: function () {
              if (!this.data.length) {
                this.data.push(0);
                return;
              }

              var last = this.data[this.data.length - 1];

              if (last) {
                this.data.push(0);
              } else {
                var items = [-2, -1, 0, 1, 2];
                this.data.push(items[Santa.rand(0, items.length - 1)]);
              }
            },

            generate: function () {
              this.maxTrunks = parseInt(Santa.CANVAS_HEIGHT / (214 - 43)) + 1;

              for (var i = this.data.length; i < this.maxTrunks; i++) {
                this.addOne();
              }
            },

            build: function () {
              var layers = [];

              // Основа
              var height = Santa.CANVAS_HEIGHT - 104 - 50;
              layers.push({
                source: "src/trunk/trunk-01.png",
                x: (Santa.CANVAS_WIDTH - 281) / 2,
                y: height,
              });

              if (this.data.length === 0) {
                this.generate();
              }

              for (var i = 0; i < this.data.length; i++) {
                var path = "";
                var id = this.data[i];

                height -= 214 - 43;
                var width = 0;

                var widthImg = 0;
                var heightImg = 214; // высота у всех одинаковая

                if (id === 0) {
                  path = "src/trunk/trunk-02.png";
                  widthImg = 144;
                  width = (Santa.CANVAS_WIDTH - widthImg) / 2 - 3;
                } else if (id === -1) {
                  path = "src/trunk/trunk-03.png";
                  widthImg = 342;
                  width = (Santa.CANVAS_WIDTH - widthImg - 198) / 2 - 3;
                } else if (id === -2) {
                  path = "src/trunk/trunk-04.png";
                  widthImg = 356;
                  width = (Santa.CANVAS_WIDTH - widthImg - 198 - 14) / 2 - 3;
                } else if (id === 1) {
                  path = "src/trunk/trunk-05.png";
                  widthImg = 342;
                  width = (Santa.CANVAS_WIDTH - widthImg + 198) / 2 - 3;
                } else if (id === 2) {
                  path = "src/trunk/trunk-06.png";
                  widthImg = 356;
                  width = (Santa.CANVAS_WIDTH - widthImg + 198 + 14) / 2 - 3;
                }

                var layer = {
                  id: id,
                  name: "trunk" + i,
                  source: path,
                  x: width,
                  y: height,
                  width: widthImg,
                  height: heightImg,
                };

                layers.push(layer);
              }

              return layers;
            },

            shift: function (position) {
              // Так как дерево срезается, увеличиваем счётчик на один
              Santa.layersGame().score.add();

              // Добавляем в cutting новый отрубленный пенек
              var oldLayer = this.build()[1];
              var prevLayer = this.build()[2];

              // Проверка на конец игры
              var id = oldLayer.id;
              var prevId = prevLayer.id;
              var death = false;
              if (position === "left" && (id < 0 || prevId < 0)) {
                death = true;
                if (id < 0) {
                  return death;
                }
              } else if (position === "right" && (id > 0 || prevId > 0)) {
                death = true;
                if (id > 0) {
                  return death;
                }
              }

              Santa.layersGame().cutting.data.push({
                position: position,
                layer: {
                  rotate: 0,
                  source: oldLayer.source,
                  x: oldLayer.x,
                  y: oldLayer.y,
                  width: oldLayer.width,
                  height: 214,
                  visible: true,
                },
              });

              this.data.shift();
              this.addOne();

              var layers = this.build();

              for (var i = 0; i < this.data.length; i++) {
                layers[i + 1].y -= 214 - 43;
                $("#display").setLayer("trunk" + i, layers[i + 1]);
              }

              return death;
            },

            animate: function () {
              var f = Santa.CANVAS_HEIGHT - 104 - 50 - 214 + 43;
              var y = $("#display").getLayer("trunk0").y;

              var step = f - y;
              if (step >= 22) {
                step = 22;
              }

              if (y < f) {
                for (var i = 0; i < this.data.length; i++) {
                  $("#display").setLayer("trunk" + i, {
                    y: "+=" + step,
                  });
                }
              }
            },
          },

          // Отрубленные части дерева
          cutting: {
            data: [],
            max_layers: 8,

            build: function () {
              var layers = [];
              for (var i = 0; i < this.max_layers; i++) {
                layers[i] = {
                  name: "cutting" + i,
                  visible: false,
                };
              }

              return layers;
            },

            animate: function () {
              // Удаляем ненужные первые пеньки, если количество отрубленных
              // превышает норму
              var del = this.data.length - this.max_layers;
              if (del > 0) {
                this.data = this.data
                  .reverse()
                  .slice(0, this.max_layers)
                  .reverse();
              }

              // Убираем видимость
              for (var i = 0; i < this.max_layers; i++) {
                $("#display").setLayer("cutting" + i, {
                  visible: false,
                });
              }

              var draw = 0;
              // Устаналиваем срезы в слои
              for (i = 0; i < this.data.length; i++) {
                var layer = this.data[i].layer;

                // Анимация движение слоев
                var pos = this.data[i].position;
                var k = pos === "right" ? 1 : -1;

                layer.x += 30 * k;
                layer.rotate += 10 * k;

                if (
                  (k === 1 &&
                    layer.x + layer.width > Santa.CANVAS_WIDTH / 2 + 700) ||
                  (k === -1 && layer.x < Santa.CANVAS_WIDTH / 2 - 700)
                ) {
                  layer.y += 10;
                } else {
                  layer.y -= 10;
                }

                var x = layer.x;
                var width = layer.width;

                // Сама установка слоев

                if (x > -width && x < Santa.CANVAS_WIDTH + width) {
                  $("#display").setLayer("cutting" + i, layer);
                  draw++;
                }
              }
            },
          },

          // Персонаж
          char: {
            position: undefined,
            max: 4,
            now: 1,
            access: false,
            death: false,

            build: function () {
              // generate start position character if undefined
              if (this.position === undefined) {
                this.position = Santa.rand(0, 1) ? "right" : "left";
              }

              var path = "";

              var width = 0;
              var height = 0;

              var y = 0;
              var x = 0;

              var add = this.position === "left" ? "" : "-2";

              if (this.death) {
                path = "src/char/faint" + add + ".png";
                width = 364;
                height = 188;
                y = Santa.CANVAS_HEIGHT - 188 - 20;
              } else {
                path = "src/char/cutting-0" + this.now + add + ".png";
                width = 413;
                height = 294;
                y = Santa.CANVAS_HEIGHT - 294 - 75;
              }

              if (this.position === "left") {
                x = (Santa.CANVAS_WIDTH - 413) / 2 - 170;
                if (this.death) x -= 50;
              } else {
                x = (Santa.CANVAS_WIDTH - 413) / 2 + 170;
                if (this.death) x += 50;
              }

              return {
                name: "char",
                source: path,
                x: x,
                y: y,
                width: width,
                height: height,
              };
            },

            animate: function () {
              if (this.death) {
                // Игрок закончил играть, проверка на рекорд:
                Santa.layersGame().score.setBest();

                $("#display").setLayer("char", this.build());
                return;
              }

              if (!this.access) {
                return;
              }

              if (this.now === 2) {
                this.death = Santa.layersGame().trunk.shift(this.position);
              }

              // update now
              if (this.now === 4) {
                this.now = 2;
                this.access = false;
              } else {
                this.now++;
              }

              // update layer
              $("#display").setLayer("char", this.build());
            },

            // Заканчивает заранее анимацию санты, если было еще одно нажатии,
            // а прошлая анимация еще не закончилась
            end: function () {
              if (this.now > 2) {
                this.now = 2;
              }
            },
          },

          // Стрелки
          arrows: {
            move: -2,
            parts: 6,
            width: 62 * 1.2,
            height: 94 * 1.2,
            hide: false, // скрыть ли стрелки
            end: false, // конец анимации стрелок

            build: function () {
              var h = this.height;
              var w = this.width;
              var y = (Santa.CANVAS_HEIGHT - h) / 2;

              return [
                {
                  name: "prev",
                  source: "src/gui/buttons/prev-down.png",
                  x: Santa.CANVAS_WIDTH / this.parts - w / 2,
                  y: y,
                  width: w,
                  height: h,
                },
                {
                  name: "next",
                  source: "src/gui/buttons/next-down.png",
                  x:
                    (Santa.CANVAS_WIDTH / this.parts) * (this.parts - 1) -
                    w / 2,
                  y: y,
                  width: w,
                  height: h,
                },
              ];
            },

            animate: function () {
              if (this.end) {
                return;
              }

              if (this.hide) {
                // Скрываем
                if ($("#display").getLayer("prev").x < -this.width) {
                  this.end = true;
                  $("#display")
                    .setLayer("prev", {
                      visible: false,
                    })
                    .setLayer("next", {
                      visible: false,
                    });
                  return;
                }

                $("#display")
                  .setLayer("prev", {
                    x: "-=15",
                  })
                  .setLayer("next", {
                    x: "+=15",
                  });
                return;
              }

              if (
                $("#display").getLayer("prev").x >
                Santa.CANVAS_WIDTH / (this.parts - 1.5)
              ) {
                this.move = 2;
              }

              if (
                $("#display").getLayer("prev").x <
                Santa.CANVAS_WIDTH / (this.parts + 1.5)
              ) {
                this.move = -2;
              }

              $("#display")
                .setLayer("prev", {
                  x: "-=" + this.move,
                })
                .setLayer("next", {
                  x: "+=" + this.move,
                });
            },
          },

          // Полоска времени в игре
          time: {
            min: 18,
            max: 508 - 18,
            percent: 50,
            start: false,

            time: function () {
              this.percent = this.percent > 100 ? 100 : this.percent;
              this.percent = this.percent < 0 ? 0 : this.percent;

              if (!this.percent) {
                Santa.layersGame().char.death = true;
              }

              return this.min + (this.max - this.min) * this.percent * 0.01;
            },

            build: function () {
              return [
                {
                  name: "timeWindow",
                  source: "src/gui/windows/gauge.png",
                  x: (Santa.CANVAS_WIDTH - 508) / 2,
                  y: 20,
                },
                {
                  name: "time",
                  source: "src/gui/windows/gauge-fill.png",
                  x: (Santa.CANVAS_WIDTH - 508) / 2,
                  y: 20,
                  sWidth: this.time(),
                  sHeight: 100,
                  sx: 0,
                  sy: 0,
                },
              ];
            },

            animatePlusTime: function () {
              this.percent += 2.7;
              this.update();
            },

            animateMinusTime: function () {
              if (this.start) {
                this.percent -= 0.15 + (this.score() + 1) / 1500;
                this.update();
              }
            },

            score: function () {
              return Santa.layersGame().score.score;
            },

            timeHide: function () {
              if ($("#display").getLayer("time").y < -50) {
                $("#display")
                  .setLayer("time", {
                    visible: false,
                  })
                  .setLayer("timeWindow", {
                    visible: false,
                  });
                return;
              }

              $("#display")
                .setLayer("time", {
                  y: "-=10",
                })
                .setLayer("timeWindow", {
                  y: "-=10",
                });
            },

            update: function () {
              $("#display").setLayer("time", {
                sWidth: this.time(),
              });
            },
          },

          // Счёт
          score: {
            score: 0,
            fontSize: 65,
            fontFamily: "SF Arch Rival Bold",
            fontColor: "#ff3200",

            build: function () {
              return [
                {
                  name: "scoreWindow",
                  source: "src/gui/windows/score-box.png",
                  x: (Santa.CANVAS_WIDTH * 9) / 10 - 154 / 2,
                  y: 20,
                },
                {
                  name: "score",
                  text: this.score,
                  x: this.getTextX(),
                  y: this.getTextY(),
                  fontSize: this.fontSize,
                  fillStyle: this.fontColor,
                  fontFamily: this.fontFamily,
                  data: {
                    type: "text",
                  },
                },
              ];
            },

            getTextX: function () {
              var context = document.getElementById("display").getContext("2d");

              context.font = this.fontSize + "px " + this.fontFamily;

              var measure = context.measureText(this.score.toString());
              var width = measure.width;

              if (width > 154 - 30 - 10) {
                this.fontSize -= 1;
                return this.getTextX();
              }

              return (Santa.CANVAS_WIDTH * 9) / 10 - width / 2;
            },

            getTextY: function () {
              return 62 - this.fontSize / 2;
            },

            add: function () {
              this.score++;

              $("#display").setLayer("score", {
                text: this.score,
                x: this.getTextX(),
                y: this.getTextY(),
                fontSize: this.fontSize,
              });
            },

            scoreHide: function () {
              if ($("#display").getLayer("score").y < -50) {
                $("#display")
                  .setLayer("score", {
                    visible: false,
                  })
                  .setLayer("scoreWindow", {
                    visible: false,
                  });
                return;
              }

              $("#display")
                .setLayer("score", {
                  y: "-= 10",
                })
                .setLayer("scoreWindow", {
                  y: "-= 10",
                });
            },

            setBest: function () {
              Santa.best = Santa.best < this.score ? this.score : Santa.best;
              Santa.cookie.set();
            },
          },

          // Кнопка паузы
          pauseButton: {
            show: false,
            pause: false,

            build: function () {
              return [
                {
                  name: "pause",
                  source: "src/gui/buttons/pause.png",
                  x: Santa.CANVAS_WIDTH / 10 - (95 - 40) / 2,
                  y: -105,
                  data: {
                    tapstart: function () {
                      Santa.state.action.buttonTouching("pause");
                    },
                  },
                },
                {
                  name: "pauseDown",
                  source: "src/gui/buttons/pause-down.png",
                  x: Santa.CANVAS_WIDTH / 10 - (95 - 40) / 2,
                  y: -100,
                  visible: false,
                  data: {
                    tapend: function () {
                      Santa.state.action.buttonOut("pause");
                      Santa.layersGame().pauseButton.pause = true;
                      Santa.snow.access = false;
                    },
                  },
                },
              ];
            },

            pauseHide: function () {
              this.show = false;

              if ($("#display").getLayer("pause").y < -100) {
                $("#display")
                  .setLayer("pause", {
                    visible: false,
                  })
                  .setLayer("pauseDown", {
                    visible: false,
                  });
                return;
              }

              $("#display")
                .setLayer("pause", {
                  y: "-=10",
                })
                .setLayer("pauseDown", {
                  y: "-=10",
                });
            },

            pauseShow: function () {
              if (!this.show) {
                return;
              }

              var y = $("#display").getLayer("pause").y;
              var add = 15;

              if (y < 22) {
                if (y > 22 - add) {
                  add = 22 - y;
                }

                $("#display")
                  .setLayer("pause", {
                    y: "+=" + add,
                  })
                  .setLayer("pauseDown", {
                    y: "+=" + add,
                  });
              }
            },
          },

          // Мигание
          flash: {
            action: "plus",
            opacity: 0,
            ready: false,

            build: function () {
              return {
                name: "flash",
                x: 0,
                y: 0,
                width: Santa.CANVAS_WIDTH,
                height: Santa.CANVAS_HEIGHT,
                fillStyle: "white",
                opacity: this.opacity,
                visible: false,
                data: { type: "rectangle" },
              };
            },

            animate: function () {
              if (this.action === "plus") {
                this.opacity += 0.18;
              } else {
                this.opacity -= 0.1;
              }

              if (this.opacity < 0) {
                this.opacity = 0;

                $("#display").setLayer("flash", {
                  opacity: this.opacity,
                  visible: false,
                });

                this.ready = true;

                return;
              }

              if (this.opacity > 1) {
                this.opacity = 1;
                this.action = "minus";
              }

              $("#display").setLayer("flash", {
                opacity: this.opacity,
                visible: true,
              });
            },
          },

          // Чёрный фон
          black: {
            opacity: 0,
            on: false,
            replay: false,

            build: function () {
              return {
                name: "black",
                x: 0,
                y: 0,
                width: Santa.CANVAS_WIDTH,
                height: Santa.CANVAS_HEIGHT,
                fillStyle: "black",
                opacity: this.opacity,
                visible: false,
                data: {
                  type: "rectangle",
                  tapend: function () {
                    Santa.state.action.buttonOut("retry");
                    Santa.state.action.buttonOut("continue");
                  },
                },
              };
            },

            show: function () {
              // Регулируем прозрачность слоя
              if (this.replay) {
                this.opacity += 0.02;
                this.opacity = this.opacity > 1 ? 1 : this.opacity;
              } else {
                var isDeath = Santa.layersGame().char.death;
                if (isDeath) {
                  this.opacity += 0.03;
                } else {
                  this.opacity += 0.06;
                }

                this.opacity = this.opacity > 0.75 ? 0.75 : this.opacity;
              }

              // Отключаем генерацию снега
              Santa.snow.access = false;

              this.update();
            },

            hide: function () {
              if (!this.retry) {
                this.opacity -= 0.08;
                this.opacity = this.opacity < 0 ? 0 : this.opacity;

                this.update(this.opacity !== 0);
              }
            },

            update: function (visible) {
              // Обновление слоя
              $("#display").setLayer("black", {
                opacity: this.opacity,
                visible: visible === undefined ? true : visible,
              });
            },
          },

          // Окошко паузы
          pauseBoard: {
            speed: 75,

            build: function () {
              return [
                {
                  name: "pauseBoard",
                  source: "src/gui/windows/window-2.png",
                  x: (Santa.CANVAS_WIDTH - 508) / 2,
                  y: -421 - 100,
                  visible: false,
                },
                {
                  name: "pauseText",
                  source: "src/gui/texts/paused.png",
                  x: (Santa.CANVAS_WIDTH - 271) / 2,
                  y: -421 - 15,
                  visible: false,
                },
                {
                  name: "continue",
                  source: "src/gui/buttons/playsmall.png",
                  x: (Santa.CANVAS_WIDTH - 157) / 2,
                  y: -421 + 95,
                  data: {
                    tapstart: function () {
                      Santa.state.action.buttonTouching("continue");
                    },
                  },
                },
                {
                  name: "continueDown",
                  source: "src/gui/buttons/playsmall-down.png",
                  x: (Santa.CANVAS_WIDTH - 157) / 2,
                  y: -421 + 105,
                  visible: false,
                  data: {
                    tapend: function () {
                      Santa.state.action.buttonOut("continue");
                      Santa.snow.access = true;
                      Santa.layersGame().pauseButton.pause = false;
                    },
                  },
                },
              ];
            },

            prop: function (prop) {
              this.build().forEach(function (layer) {
                $("#display").setLayer(layer.name, prop);
              });
              $("#display").setLayer("continueDown", { visible: false });
            },

            y: function () {
              return $("#display").getLayer("pauseBoard").y;
            },

            animate: function () {
              if (Santa.layersGame().pauseButton.pause) {
                var y = (Santa.CANVAS_HEIGHT - 421) / 2;
                if (this.y() < y) {
                  var speed =
                    this.speed > y - this.y() ? y - this.y() : this.speed;
                  this.prop({
                    y: "+=" + speed,
                    visible: true,
                  });
                }
              } else {
                var y = -421 - 100;
                if (this.y() > y) {
                  var speed =
                    this.speed > this.y() - y ? this.y() - y : this.speed;
                  this.prop({
                    y: "-=" + speed,
                  });
                } else {
                  this.prop({
                    visible: false,
                  });
                }
              }
            },
          },

          // Окошко с результатами
          scoreBoard: {
            fontFamily: "SF Arch Rival Bold",
            scoreCounter: 0,
            bestCounter: 0,
            replay: false,

            build: function () {
              return [
                {
                  name: "scoreBoard",
                  source: "src/gui/windows/window-1.png",
                  x: (Santa.CANVAS_WIDTH - 509) / 2,
                  y: -670 - 100,
                  visible: false,
                },
                {
                  name: "retry",
                  source: "src/gui/buttons/playsmall.png",
                  x: (Santa.CANVAS_WIDTH - 157) / 2,
                  y: -670 + 350,
                  visible: false,
                  data: {
                    tapstart: function () {
                      Santa.state.action.buttonTouching("retry");
                    },
                  },
                },
                {
                  name: "retryDown",
                  source: "src/gui/buttons/playsmall-down.png",
                  x: (Santa.CANVAS_WIDTH - 157) / 2,
                  y: -670 + 355,
                  visible: false,
                  data: {
                    tapend: function () {
                      Santa.state.action.buttonOut("retry");
                      Santa.state.animations.replay();
                      setTimeout(Santa.state.action.startNewGame, 200);
                    },
                  },
                },
                {
                  name: "gameOver",
                  source: "src/gui/texts/gameover.png",
                  x: (Santa.CANVAS_WIDTH - 396) / 2,
                  y: -670 - 40,
                  visible: false,
                },
                this.text("YOUR SCORE", "yourScore", 30, "#4e3759", 65),
                this.text("0", "varScorescoreBoard", 70, "#ff4f00", 65 + 40),
                this.text("BEST", "best", 30, "#4e3759", 205),
                this.text("0", "varBestscoreBoard", 70, "#ff4f00", 205 + 40),
              ];
            },

            text: function (text, name, size, color, y) {
              return {
                name: name,
                text: text,
                x: (Santa.CANVAS_WIDTH - this.widthText(text, size)) / 2,
                y: -670 + y,
                fontSize: size,
                fillStyle: color,
                fontFamily: this.fontFamily,
                visible: false,
                data: {
                  type: "text",
                },
              };
            },

            widthText: function (text, fontSize) {
              var context = document.getElementById("display").getContext("2d");
              context.font = fontSize + "px " + this.fontFamily;

              return context.measureText(text).width;
            },

            move: function (add) {
              this.build().forEach(function (layer) {
                $("#display").setLayer(layer.name, {
                  y: "+=" + add,
                  visible: true,
                });
              });

              $("#display").setLayer("retryDown", { visible: false });
            },

            animate: function () {
              if (this.replay) {
                this.move(-50);
                return;
              }

              var scoreBoard = $("#display").getLayer("scoreBoard");

              var add = (Santa.CANVAS_HEIGHT - 670) / 2 - scoreBoard.y;
              add = add < 60 ? add : 60;

              if (add > 0) {
                this.move(add);
              } else {
                var that = this;
                function updateCounter(counter, score, layerName) {
                  var widthText = that.widthText(
                    counter,
                    $("#display").getLayer(layerName).fontSize,
                  );

                  if (counter < score) {
                    counter += parseInt(score / 17) ? parseInt(score / 17) : 1;
                    counter = counter > score ? score : counter;

                    $("#display").setLayer(layerName, {
                      text: counter,
                      x: (Santa.CANVAS_WIDTH - widthText) / 2,
                    });
                  }

                  return counter;
                }

                this.scoreCounter = updateCounter(
                  this.scoreCounter,
                  Santa.layersGame().score.score,
                  "varScorescoreBoard",
                );
                this.bestCounter = updateCounter(
                  this.bestCounter,
                  Santa.best,
                  "varBestscoreBoard",
                );
              }
            },
          },
        },

        build: function () {
          var layers = [];

          for (var part in this.parts) {
            part = this.parts[part].build();

            if (Array.isArray(part)) {
              part.forEach(function (layer) {
                layers.push(layer);
              });
            } else {
              layers.push(part);
            }
          }

          return layers;
        },

        preload: function () {
          Santa.state.preloadLayers(this.build());
        },
      },
    },
  },

  /**
   *
   * Обработчик событий canvas'а
   *
   */
  events: {
    // Обработчик событий при нажатии на слой
    event: function (event) {
      var mouse = this.mouse(event);

      var layers = $("#display").getLayers();
      var confirmLayer = false;

      for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];

        if (!$.isEmptyObject(layer.data) && layer.visible !== false) {
          if (
            mouse.x > layer.x &&
            mouse.x < layer.x + layer.width &&
            mouse.y > layer.y &&
            mouse.y < layer.y + layer.height
          ) {
            if (confirmLayer === false || confirmLayer < i) {
              confirmLayer = i;
            }
          }
        }
      }

      if (confirmLayer !== false) {
        if (typeof layers[confirmLayer].data[event.type] === "function") {
          layers[confirmLayer].data[event.type](mouse.x, mouse.y);
        }
      }
    },

    preload: function () {
      var that = this;

      // TOUCH EVENTS
      $("#display")
        .tapstart(function (event) {
          that.event(event);
        })
        .tapend(function (event) {
          that.event(event);
        })
        .tapmove(function (event) {
          that.event(event);
        })
        .mousemove(function (event) {
          that.event(event);
        });

      // CHAR MOVE KEY PRESS EVENT
      $(document).keydown(function (e) {
        if (Santa.state.now !== "game") {
          return;
        }

        switch (e.which) {
          case 37: // left
          case 65: // left
            Santa.state.action.charMove("left");
            break;

          case 39: // right
          case 68: // right
            Santa.state.action.charMove("right");
            break;
        }
      });
    },

    /**
     *
     * Получает координаты канваса по нажатию мыши
     *
     */
    mouse: function (event) {
      var canvas = $("#display");

      var widthCss = parseFloat(canvas.css("width"));
      var heightCss = parseFloat(canvas.css("height"));

      var widthCanvas = canvas[0].width;
      var heightCanvas = canvas[0].height;

      var mouseX = (widthCanvas * event.offsetX) / widthCss;
      var mouseY = (heightCanvas * event.offsetY) / heightCss;

      return {
        x: mouseX,
        y: mouseY,
      };
    },
  },

  /**
   *
   * Html settings
   *
   */
  html: {
    preload: function () {
      this.create();
      this.resize();
      this.fillDisplay();
      this.setResize();
      this.preloadImages();
      this.addFont();
    },

    create: function () {
      $("body").append('<canvas id="display"></canvas>');
      $("#display").attr({
        width: Santa.CANVAS_WIDTH,
        height: Santa.CANVAS_HEIGHT,
      });
    },

    setCss: function () {
      $("#display").css({
        width: Santa.CSS_WIDTH + "px",
        height: Santa.CSS_HEIGHT + "px",
        position: "fixed",
        left: "calc(50% - " + Santa.CSS_WIDTH / 2 + "px)",
        top: "calc(50% - " + Santa.CSS_HEIGHT / 2 + "px)",
        "-webkit-tap-highlight-color": "transparent",
      });
    },

    setCanvas: function () {
      $("#display").attr({
        height: Santa.CANVAS_HEIGHT,
        width: Santa.CANVAS_WIDTH,
      });
    },

    setResize: function () {
      var that = this;
      $(window).resize(function () {
        that.resize();
      });
    },

    resize: function () {
      Santa.CSS_WIDTH = Santa.CANVAS_WIDTH;
      Santa.CSS_HEIGHT = Santa.CANVAS_HEIGHT;

      while (
        $(window).height() < Santa.CSS_HEIGHT ||
        $(window).width() < Santa.CSS_WIDTH
      ) {
        Santa.CSS_HEIGHT *= 0.995;
        Santa.CSS_WIDTH *= 0.995;
      }

      if (
        $(window).width() - Santa.CSS_WIDTH <
        $(window).height() - Santa.CSS_HEIGHT
      ) {
        Santa.CSS_WIDTH = $(window).width();
      } else {
        Santa.CSS_HEIGHT = $(window).height();
      }

      this.setCss();
    },

    fillDisplay: function () {
      var width = $(window).width();
      var height = $(window).height();

      if (width === Santa.CSS_WIDTH && height > Santa.CSS_HEIGHT) {
        var newCanvasHeight = (Santa.CANVAS_WIDTH * height) / Santa.CSS_WIDTH;

        if (newCanvasHeight > 2200) {
          newCanvasHeight = 2200;
          height = (Santa.CSS_WIDTH * newCanvasHeight) / Santa.CANVAS_WIDTH;
        }

        Santa.CSS_HEIGHT = height;
        Santa.CANVAS_HEIGHT = newCanvasHeight;

        this.setCss();
        this.setCanvas();
      } else if (height === Santa.CSS_HEIGHT && width > Santa.CSS_WIDTH) {
        var newCanvasWidth = (Santa.CANVAS_HEIGHT * width) / Santa.CSS_HEIGHT;

        if (newCanvasWidth > 2400) {
          newCanvasWidth = 2400;
          width = (Santa.CSS_HEIGHT * newCanvasWidth) / Santa.CANVAS_HEIGHT;
        }

        Santa.CSS_WIDTH = width;
        Santa.CANVAS_WIDTH = newCanvasWidth;

        this.setCss();
        this.setCanvas();
      }
    },

    preloadImages: function () {
      var paths = [
        "src/bg/sky-mountain-menu.png",
        "src/bg/sky-mountain-game.png",
        "src/char/cutting-01.png",
        "src/char/cutting-02.png",
        "src/char/cutting-03.png",
        "src/char/cutting-04.png",
        "src/char/cutting-01-2.png",
        "src/char/cutting-02-2.png",
        "src/char/cutting-03-2.png",
        "src/char/cutting-04-2.png",
        "src/char/faint.png",
        "src/char/faint-2.png",
        "src/gui/title.png",
        "src/gui/buttons/next-down.png",
        "src/gui/buttons/prev-down.png",
        "src/gui/buttons/playbig.png",
        "src/gui/buttons/playbig-down.png",
        "src/gui/buttons/playsmall.png",
        "src/gui/buttons/playsmall-down.png",
        "src/gui/buttons/pause.png",
        "src/gui/buttons/pause-down.png",
        "src/gui/windows/gauge.png",
        "src/gui/windows/gauge-fill.png",
        "src/gui/windows/score-box.png",
        "src/gui/windows/window-1.png",
        "src/gui/windows/window-2.png",
        "src/gui/title.png",
        "src/gui/texts/gameover.png",
        "src/gui/texts/paused.png",
        "src/trunk/trunk-01.png",
        "src/trunk/trunk-02.png",
        "src/trunk/trunk-03.png",
        "src/trunk/trunk-04.png",
        "src/trunk/trunk-05.png",
        "src/trunk/trunk-06.png",
      ];

      paths.forEach(function (path) {
        $("#display").drawImage({
          source: path,
        });
      });

      $("#display").clearCanvas();
    },

    addFont: function () {
      $("head").append("<style></style>");
      $("style").text(
        "@font-face {font-family: 'SF Arch Rival Bold';src: url('src/font/SF Arch Rival Bold.ttf');}",
      );
    },
  },

  /**
   *
   * Cookie
   *
   */
  cookie: {
    set: function () {
      Cookies.set("data", Santa.best, {
        expires: 365,
      });
    },

    get: function () {
      var data = Cookies.get("data");

      if (typeof data !== "undefined" && data) {
        Santa.best = parseInt(data);
      } else {
        Santa.best = 0;
      }
    },
  },

  /**
   *
   * Get layers of Game
   *
   * @returns {Santa.state.game.layers.parts|{bg, trees, trunk, cutting, char, arrows, time, score, pauseButton, flash, black, scoreBoard}}
   */
  layersGame: function () {
    return Santa.state.game.layers.parts;
  },

  /**
   *
   * Рандом
   *
   */
  rand: function (min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
  },
};

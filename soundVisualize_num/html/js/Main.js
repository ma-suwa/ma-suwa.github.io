var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var demo;
(function (demo) {
    var SoundVisualizer = (function () {
        function SoundVisualizer() {
            var _this = this;

            //soundID
            this.SOUND_ID = "sound";
            //color
            this.START_COLOR = 0x2DADAC;
            this.END_COLOR = 0xFF337A;
            //フーリエ変換を行う分割数
            this.FFTSIZE = 64;
            //数値の間隔
            this.INTERVAL_X = window.innerWidth / this.FFTSIZE;
            this.INTERVAL_Y = window.innerHeight / this.FFTSIZE;

            // iOS
            if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
                this.soundPass = "sound/sound.m4a";
            }
            else {
                this.soundPass = "sound/sound.ogg";
            }
            // touch
            if (createjs.Touch.isSupported()) {
                document.addEventListener("touchstart", function (event) { return _this.touchstartHandler(event); });
                document.addEventListener("touchmove", function (event) { return _this.touchmoveHandler(event); });
                document.addEventListener("touchend", function (event) { return _this.touchendHandler(event); });
            }
            else {
                document.addEventListener("mousedown", function (event) { return _this.mousedownHandler(event); });
                document.addEventListener("mousemove", function (event) { return _this.mousemoveHandler(event); });
                document.addEventListener("mouseup", function (event) { return _this.mouseupHandler(event); });
            }

            window.addEventListener("resize", function () { return _this.handleResize(event); });

            createjs.Ticker.addEventListener("tick",  function (event){return _this.handleTick(event); });

            //stageの作成
            this.stage = new createjs.Stage("myCanvas");

            // freqByteDataを保持しておく配列
            this.freqByteDataArray = [];
            this.firstText = [];
            for (var i = 0; i < this.FFTSIZE / 2; i++) {
                var array = new Uint8Array(this.FFTSIZE / 2);
                this.firstText[i] = [];
                for (var j = 0; j < this.FFTSIZE / 2; j++) {
                    var text = new createjs.Text("Hello", "12px Play", "#333333");
                    text.x = i*this.INTERVAL_X*2;
                    text.y = j*this.INTERVAL_Y*2;
                    text.textAlign = "left";
                    text.textBaseline = "top";
                    text.shadow = new createjs.Shadow("#cccccc", 0, 0, 8);
                    this.firstText[i][j] = text;

                    this.stage.addChild(text);
                }
                this.freqByteDataArray.push(array);
            }
            this.handleResize();
            // サウンドを読み込みます
            this.load();
        }

        /**
         * サウンドを再生します
         */
        SoundVisualizer.prototype.soundPlay = function () {
            this.startPlayback();
        };
        /**
         * サウンドの音量をONにします
         */
        SoundVisualizer.prototype.soundOn = function () {
            if (!this.plugin)
                return;
            this.plugin.setVolume(1);
        };
        /**
         * サウンドの音量をOFFにします
         */
        SoundVisualizer.prototype.soundOff = function () {
            if (!this.plugin)
                return;
            this.plugin.setVolume(0);
        };
        /**
         * サウンドを読み込みます
         */
        SoundVisualizer.prototype.load = function () {
            var _this = this;
            // プラグインが初期化されているかどうか
            if (!createjs.Sound.initializeDefaultPlugins())
                return;
            createjs.Sound.alternateExtensions = ["mp3"];
            createjs.FlashAudioPlugin.swfPath = "swf/";
            createjs.Sound.on("fileload", function () { return _this.fileloadHandler(); });
            // サウンドの登録 読み込み
            createjs.Sound.registerSound({ id: this.SOUND_ID, src: this.soundPass });
        };
        /**
         * サウンドファイルの読み込みが完了しました。
         */
        SoundVisualizer.prototype.fileloadHandler = function () {
            var loading = document.getElementById("loading");
            loading.style.display = "none";
            this.analyser();
        };
        /**
         * アナライザーの設定を行います
         */
        SoundVisualizer.prototype.analyser = function () {
            // WebAudioPluginを取得
            this.plugin = new createjs.WebAudioPlugin();
            var context = this.plugin.context;
            // アナライザーを生成
            this.analyserNode = context.createAnalyser();
            // フーリエ変換を行う分割数。2の乗数でなくてはならない
            this.analyserNode.fftSize = this.FFTSIZE;
            // 0～1の範囲でデータの動きの速さ 0だともっとも速く、1に近づくほど遅くなる
            this.analyserNode.smoothingTimeConstant = 0.85;
            // オーディオの出力先を設定
            this.analyserNode.connect(context.destination);
            // 音のゆがみを補正するコンプレッサー
            var dynamicsNode = this.plugin.dynamicsCompressorNode;
            dynamicsNode.disconnect();
            dynamicsNode.connect(this.analyserNode);
            var playBtn = document.getElementById("play_btn");
            playBtn.style.display = "block";
        };
        /**
         * サウンドを再生します
         */
        SoundVisualizer.prototype.startPlayback = function () {
            // サウンドをループ再生
            createjs.Sound.play(this.SOUND_ID, { loop: -1 });
        };

        /**
         * mousedown Handler
         * @param event
         */
        SoundVisualizer.prototype.mousedownHandler = function (event) {
            this.isMouseDown = true;
            this.oldX = event.pageX;
        };
        /**
         * mousemove Handler
         * @param event
         */
        SoundVisualizer.prototype.mousemoveHandler = function (event) {
            if (this.isMouseDown) {
                var dy = event.pageX - this.oldX;
                this.targetRot -= dy * 0.25;
                this.oldX = event.pageX;
            }
        };
        /**
         * mouseup Handler
         * @param event
         */
        SoundVisualizer.prototype.mouseupHandler = function (event) {
            this.isMouseDown = false;
        };
        /**
         * touchstart Handler
         * @param event
         */
        SoundVisualizer.prototype.touchstartHandler = function (event) {
            this.isMouseDown = true;
            this.oldX = event.touches[0].pageX;
        };
        /**
         * touchmove Handler
         * @param event
         */
        SoundVisualizer.prototype.touchmoveHandler = function (event) {
            if (this.isMouseDown) {
                var dy = event.touches[0].pageX - this.oldX;
                this.targetRot -= dy * 0.25;
                this.oldX = event.touches[0].pageX;
            }
        };

        SoundVisualizer.prototype.handleResize =function(event) {
          // 画面幅・高さを取得
          var w = window.innerWidth;
          var h = window.innerHeight;
          // Canvas要素の大きさを画面幅・高さに合わせる
          this.stage.canvas.width = w;
          this.stage.canvas.height = h;
          // 画面更新する
          this.stage.update();
        }


        SoundVisualizer.prototype.handleTick = function (event) {
          if (this.analyserNode) {
              // 波形データを格納する配列の生成
              var freqByteData = new Uint8Array(this.FFTSIZE / 2);
              // それぞれの周波数の振幅を取得
              this.analyserNode.getByteFrequencyData(freqByteData);
              this.freqByteDataArray.push(freqByteData);
              // 古いデータを一つ削除
              if (this.freqByteDataArray.length > this.FFTSIZE / 2)
                  this.freqByteDataArray.shift();
              for (var i = 0; i < this.FFTSIZE / 2; i++) {
                  for (var j = 0; j < this.FFTSIZE / 2; j++) {
                      var freqSum = this.freqByteDataArray[i][j];
                      var text = this.firstText[i][j];
                      if (!freqSum){
                        freqSum = 0;
                      }else{
                        freqSum /= 256;
                      }
                      text.alpha = freqSum + 0.2;
                      if (freqSum < 0.5) {
                        text.scaleX = freqSum + 0.4;
                        text.scaleY = freqSum + 0.4;
                      }else{
                        text.scaleX = 1;
                        text.scaleY = 1;
                      }
                      text.text = freqSum*256;
                      text.color = createjs.Graphics.getHSL(freqSum*256 + 120, 80, 80)
                  }
              }
          }
          this.stage.update();
        };
        /**
         * touchend Handler
         * @param event
         */
        SoundVisualizer.prototype.touchendHandler = function (event) {
            this.isMouseDown = false;
        };
        return SoundVisualizer;
    })();
    demo.SoundVisualizer = SoundVisualizer;

})(demo || (demo = {}));
window.addEventListener("load", function () {
    var soundVisualizer = new demo.SoundVisualizer();
    var soundBtn = document.getElementById("sound_btn");
    soundBtn.addEventListener("click", function () {
        if (soundBtn.className == "on") {
            soundBtn.innerHTML = "SOUND : ON";
            soundBtn.className = "off";
            soundVisualizer.soundOff();
        }
        else {
            soundBtn.innerHTML = "SOUND : OFF";
            soundBtn.className = "on";
            soundVisualizer.soundOn();
        }
    });
    var playBtn = document.getElementById("play_btn");
    playBtn.addEventListener("click", function () {
        playBtn.style.display = "none";
        soundVisualizer.soundPlay();
    });
});

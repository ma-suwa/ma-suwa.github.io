	// global constants
	var FFTSIZE = 64;      // number of samples for the analyser node FFT, min 32
	var TICK_FREQ = 20;     // how often to run the tick function, in milliseconds

	// global variables
	var stage;              // the stage we draw everything to
	var w,h;
	var canvasWidth, canvasHeight;
	var centerX = window.innerWidth/2;
	var centerY = window.innerHeight/2;   // variables to hold the center point, so that tick is quicker
	var messageField;       // Message display field

	var assetsPath = "/_assets/audio/";   // Create a single item to load.
	var src = assetsPath + "sound.mp3";  // set up our source
	var soundInstance;      // the sound instance we create
	var analyserNode;       // the analyser node that allows us to visualize the audio
	var freqFloatData, freqByteData, timeByteData;  // arrays to retrieve data from analyserNode

	var lines = {};
	var lines2 = {};
	var lines3 = {};

	var freqBytes = {};
	var bg,angle,radian,startX,startY,endX,endY;

	function init() {
		stage = new createjs.Stage("myCanvas");
		//リサイズイベント
		window.addEventListener("resize", handleResize);
		handleResize();
		//loadingテキスト表示
		createMessage();

		createjs.Sound.on("fileload", handleLoad, this); // add an event listener for when load is completed
		createjs.Sound.registerSound(src);  // register sound, which will preload automatically
		stage.update();
	}

	function handleResize(){
		var w = window.innerWidth;
		var h = window.innerHeight;
		stage.canvas.width = w;
		stage.canvas.height = h;
		centerX = w/2;
		centerY = h/2;
		stage.update();
	}

	function createMessage() {
		messageField = new createjs.Text("Loading Audio", "bold 24px Arial", "#FFFFFF");
		messageField.maxWidth = w;
		messageField.textAlign = "center";
		messageField.x = centerX;
		messageField.y = centerY;
		stage.addChild(messageField);
	}

	function handleLoad(evt) {
		var context = createjs.Sound.activePlugin.context;
		// create an analyser node
		analyserNode = context.createAnalyser();
		analyserNode.fftSize = FFTSIZE;  //The size of the FFT used for frequency-domain analysis. This must be a power of two
		analyserNode.smoothingTimeConstant = 0.85;  //A value from 0 -> 1 where 0 represents no time averaging with the last analysis frame
		analyserNode.connect(context.destination);  // connect to the context.destination, which outputs the audio
		// attach visualizer node to our existing dynamicsCompressorNode, which was connected to context.destination
		var dynamicsNode = createjs.Sound.activePlugin.dynamicsCompressorNode;
		dynamicsNode.disconnect();  // disconnect from destination
		dynamicsNode.connect(analyserNode);

		// set up the arrays that we use to retrieve the analyserNode data
		freqFloatData = new Float32Array(analyserNode.frequencyBinCount);
		freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
		timeByteData = new Uint8Array(analyserNode.frequencyBinCount);

		// enable touch interactions if supported on the current device, and display appropriate message
		if (createjs.Touch.enable(stage)) {
			messageField.text = "Touch to start";
			// wrap our sound playing in a click event so we can be played on mobile devices
			stage.addEventListener("stagemousedown", startPlayback);
			stage.update(); 	//update the stage to show text
		} else {
			startPlayback();
		}
	}

	function startPlayback(evt) {
		// we only start once, so remove the click/touch listener
		stage.removeEventListener("stagemousedown", startPlayback);
		if (soundInstance) {
			return;
		}
		stage.removeChild(messageField);
		soundInstance = createjs.Sound.play(src, {loop: -1});

		//freqByteData
		for(var i = 0; i < freqByteData.length; i++){
			var freqByte = freqBytes[i] = new createjs.Shape();
			freqByte.size = window.innerWidth/2;
			freqByte.graphics
				.beginStroke("#EEEEEE")
				.setStrokeStyle(5)
				.drawCircle(0,0,freqByte.size)
			freqByte.x = centerX;
			freqByte.y = centerY;
			stage.addChild(freqByte);
		}

		createLine(freqByteData);
		createLine2(freqByteData);
		createLine3(freqByteData);

		// start the tick and point it at the window so we can do some work before updating the stage:
		createjs.Ticker.addEventListener("tick", tick);
		createjs.Ticker.setInterval(20);
	}

/***/
	function createLine(freqByteData){
		for(var i = 0; i < freqByteData.length; i++){
			lines[i] = [];
			for(var j = 0; j < 8; j++){
				var line = lines[i][j] = new createjs.Shape();
				angle = i * (360 / freqByteData.length);
				radian = angle * Math.PI / 180;
				line.graphics
					.setStrokeStyle(2)
					.beginStroke()
					.moveTo(line.startX, line.startY)
					.lineTo(line.endX, line.endY);
				stage.addChild(line);
			}
		}
	}

	function updateLine(freqByteData, startAngle){
		for (var i = 0; i < freqByteData.length; i++) {
			for(var j = 0; j < 8; j++){
				angle = i * (45 / freqByteData.length);
				radian = angle * Math.PI / 180 + (j * startAngle);
				lines[i][j].startX = (window.innerWidth/7 + freqByteData[i]/2) * Math.cos(radian) + centerX;
				lines[i][j].startY = (window.innerWidth/7 + freqByteData[i]/2) * Math.sin(radian) + centerY;
				lines[i][j].endX = window.innerWidth/8 * Math.cos(radian) + centerX;
				lines[i][j].endY =  window.innerWidth/8 * Math.sin(radian) + centerY;
				lines[i][j].graphics
					.clear()
					.setStrokeStyle(1)
					.beginStroke(createjs.Graphics.getHSL(180*freqByteData[i]/256 + 180,  30, 50))
					.moveTo(lines[i][j].startX, lines[i][j].startY)
					.lineTo(lines[i][j].endX, lines[i][j].endY);
			}
		}
	}

	function createLine2(freqByteData){
		for(var i = 0; i < freqByteData.length; i++){
			lines2[i] = [];
			for(var j = 0; j < 8; j++){
				var line2 = lines2[i][j] = new createjs.Shape();
				angle = i * (360 / freqByteData.length);
				radian = angle * Math.PI / 180;
				line2.graphics
					.setStrokeStyle(2)
					.beginStroke("gray")
					.moveTo(line2.startX, line2.startY)
					.lineTo(line2.endX, line2.endY);
				stage.addChild(line2);
			}
		}
	}

	function updateLine2(freqByteData, startAngle){
		for (var i = 0; i < freqByteData.length; i++) {
			for(var j = 0; j < 8; j++){
				angle = i * (45 / freqByteData.length);
				radian = angle * Math.PI / 180 + (j * startAngle);
				lines2[i][j].startX = (window.innerWidth/12 + freqByteData[i]/4) * Math.cos(radian) + centerX;
				lines2[i][j].startY = (window.innerWidth/12 + freqByteData[i]/4) * Math.sin(radian) + centerY;
				lines2[i][j].endX = (window.innerWidth/4 + freqByteData[i]/4) * Math.cos(radian) + centerX;
				lines2[i][j].endY =  (window.innerWidth/4 + freqByteData[i]/4) * Math.sin(radian) + centerY;
				lines2[i][j].graphics
					.clear()
					.setStrokeStyle(freqByteData[i]/256)
					.beginStroke(createjs.Graphics.getHSL(360*freqByteData[i]/256,freqByteData[i]/4, 100))
					.moveTo(lines2[i][j].startX, lines2[i][j].startY)
					.lineTo(lines2[i][j].endX, lines2[i][j].endY);
			}
		}
	}

	function createLine3(freqByteData){
		for(var i = 0; i < freqByteData.length; i++){
			lines3[i] = [];
			for(var j = 0; j < 8; j++){
				var line3 = lines3[i][j] = new createjs.Shape();
				angle = i * (360 / freqByteData.length);
				radian = angle * Math.PI / 180;
				line3.graphics
					.setStrokeStyle(2)
					.beginStroke("gray")
					.moveTo(line3.startX, line3.startY)
					.lineTo(line3.endX, line3.endY);
				stage.addChild(line3);
			}
		}
	}

	function updateLine3(freqByteData, startAngle){
		for (var i = 0; i < freqByteData.length; i++) {
			for(var j = 0; j < 8; j++){
				angle = i * (45 / freqByteData.length);
				radian = angle * Math.PI / 180 + (j * startAngle);
				lines3[i][j].startX = (window.innerWidth + freqByteData[i]) * Math.cos(radian) + centerX;
				lines3[i][j].startY = (window.innerWidth + freqByteData[i]) * Math.sin(radian) + centerY;
				lines3[i][j].endX = (window.innerWidth/8 + freqByteData[i]) * Math.cos(radian) + centerX;
				lines3[i][j].endY =  (window.innerWidth/8 + freqByteData[i]) * Math.sin(radian) + centerY;
				lines3[i][j].graphics
					.clear()
					.setStrokeStyle(freqByteData[i]/256)
					.beginStroke(createjs.Graphics.getHSL(360*freqByteData[i]/256 + 90,  60, freqByteData[i]/256*100))
					.moveTo(lines3[i][j].startX, lines3[i][j].startY)
					.lineTo(lines3[i][j].endX, lines3[i][j].endY);
			}
		}
	}

	function tick(evt) {
		analyserNode.getFloatFrequencyData(freqFloatData);  // this gives us the dBs
		analyserNode.getByteFrequencyData(freqByteData);  // this gives us the frequency
		analyserNode.getByteTimeDomainData(timeByteData);  // this gives us the waveform

		//freqByteData
		for (var i = 0; i < freqByteData.length; i++) {
			freqBytes[i].x = centerX;
			freqBytes[i].y = centerY;
			freqBytes[i].scaleX = freqByteData[i]/256;
			freqBytes[i].scaleY = freqByteData[i]/256;
			if (freqByteData[i] > 200) {
				freqBytes[i].alpha = 0.2;
			}else{
				freqBytes[i].alpha = 0.2;
			}
		}

		updateLine(freqByteData, 35);
		updateLine2(freqByteData, 45);
		updateLine3(freqByteData, 180);

		// draw the updates to stage
		stage.update();
	}

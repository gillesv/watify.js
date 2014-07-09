var WatifyInstances = [];

// Global settings
var WatifyGeneratorModel = {
	min_radius_step : 10.0,
	max_radius_step : 20.0,
	
	min_angle : 0.0,
	max_angle : 45.0,
	
	min_angle_step : 0,
	max_angle_step : 0,
	
	min_amplitude : 1.0,
	max_amplitude : 40.0,
	
	min_amplitude_step : -1.0,
	max_amplitude_step : +1.0,
	
	min_frequency : 1.0,
	max_frequency : 10.0,
	
	min_frequency_step : -0.2,
	max_frequency_step : +0.2,
	
	typo_png: 'assets/img/png/watify.png',				// location of the Watify type-mark (in PNG or SVG formats, depending on browser-capabilities)
	typo_svg: 'assets/img/svg/watify.svg',
	typo_main_png: 'assets/img/png/watify_main.png',	// location of the Watify type-mark, sans "stimulating digital entrepreneurs" 
	typo_main_svg: 'assets/img/svg/watify_main.svg',
	
	num_fallbacks: 10	// how many pre-generated fallbacks exist
};

// Watify WaveFunction <canvas> generator class
var Watify = function(elem, options){
	this.elem = elem;	
	this.options = options;
	
	this.setup();
	
	return this;
};

Watify.prototype = {
	
	elem: null, 		// DOM element
	options: null, 		// options & settings
	canvas: null,		// canvas
	img: null,
	context: null,		// 2D drawing context
	typo_img: null, 	// invisible <img> to load the Watify type-mark
	typo_loaded: false,	// keep track of the img's load status
	pixelRatio: 1,		// keep track if we're on "retina"-esque HiDPi devices 
	
	width: 0,			// width & height
	height: 0,
	
	keyFrame0: null,	// animation keyframes
	keyFrame1: null,	
	tweenFrame: null,
	
	playhead: 0,		// keep track of animation
	
	// init/setup function
	setup: function(){
		var $ref = this;
		
		// test if we're on retina or not
		if(window.devicePixelRatio !== undefined) {
			this.pixelRatio = window.devicePixelRatio;
		}
		
		this.resize(); // call this first so we know width & height
		
		this.elem.empty(); // empty the elem
		
		// feature-test
		if(Modernizr && Modernizr.canvas) {
			// create canvas & get 2D context	
			this.canvas = $('<canvas/>', { Width: this.width*this.pixelRatio, Height: this.height*this.pixelRatio})[0];
			
			if(this.pixelRatio > 1) {
				$(this.canvas).width(this.width).height(this.height);
			}
			
			if(this.options.cansave) {
				this.img = $("<img />", { Width: this.width, Height: this.height });
				this.elem.append(this.img);
			} else {
				this.elem.append(this.canvas);	
			}
						
			
			this.context = this.canvas.getContext("2d");
						
			if(this.options.typo) {
				var src;
				
				// test for svg
				if(Modernizr.svg) {
					if(this.options.tagline) {
						src = WatifyGeneratorModel.typo_svg;
					} else {
						src = WatifyGeneratorModel.typo_main_svg;
					}
				} else {
					if(this.options.tagline) {
						src = WatifyGeneratorModel.typo_png;
					} else {
						src = WatifyGeneratorModel.typo_main_png;
					}
				}
				
				// create the off-canvas <img> element and load the needed resources
				this.typo_img = $('<img/>')[0];
				this.typo_img.src = src;
				this.typo_img.onload = function () {
					$ref.typo_loaded = true;
					
					if(!$ref.options.animated) {
						$ref.draw();
					}
				};
			}
		} else {
			// random image code goes here
			this.elem.addClass("fallback");
			
			// attach correct classes
			if(this.options.typo && this.options.tagline) {
				this.elem.addClass("typo_1");
			} else if(this.options.typo && !this.options.tagline) {
				this.elem.addClass("typo_2");
			} else if(!this.options.typo) {
				this.elem.addClass("blank");
			}
			
			// color
			switch(this.options.color) {
				default:
				case 0:
					this.elem.addClass("b");
				break;
				case 1:
					this.elem.addClass("y");
				break;
				case 2:
					this.elem.addClass("r");
				break;
				case 3:
					this.elem.addClass("g");
				break;
			}
			
			// transparancy
			if(this.options.transparent) {
				this.elem.addClass("transparent");
			}
			
			if(this.options.resizable) {
				this.elem.addClass("large");
			} else {
				if(Math.min(this.width, this.height) > 600) {
					this.elem.addClass("large");
				} else if(Math.min(this.width, this.height) > 300 && Math.min(this.width, this.height) < 600) {
					this.elem.addClass("medium");
				} else if(Math.min(this.width, this.height) < 300) {
					this.elem.addClass("small");
				}
			}
			
			var rand = Math.floor(Math.random()*WatifyGeneratorModel.num_fallbacks);
			
			if(rand.toString().length < 2) {
				rand = "0" + rand.toString();
			}	
					
			this.elem.addClass("v" + rand);
			
			// TODO: fallback
			return false;
		}
				
		// generate initial keyframes
		this.keyFrame0 = this.generateKeyFrame();
		this.keyFrame1 = this.generateKeyFrame();
		
		// if resizable, add window event listener
		if(this.options.resizable) {
			$(window).resize(function(e){
				$ref.resize();
				$ref.draw();
			});
		}
		
		// if animated, add requestAnimationFrame listener
		if(this.options.animated) {
			(function animLoop() {
				requestAnimationFrame(animLoop);
				$ref.draw();
			})();
		} else {	// else, just draw once
			this.draw();
		}
	},
	
	// update size of element (based on measured size of DOM elem(ent))
	resize: function() {	
		if(this.elem) {
			// set width & height from element
			this.width = this.elem.width();
			this.height = this.elem.height();
		}
		
		if(this.canvas) {
			$(this.canvas).attr("width", this.width * this.pixelRatio).attr("height", this.height * this.pixelRatio);
			
			if(this.pixelRatio > 1) {
				$(this.canvas).width(this.width).height(this.height);
			}
		}
		
		if(this.img) {
			this.img.attr("width", this.width).attr("height", this.height);
		}
	},
	
	// keyframes
	// generate (or update the values of) a new (or existing) keyframe object with random values
	generateKeyFrame: function(frame) {
		var random = this.random;	// reference to random() function
	
		if(frame == null) {
			frame = {
				radius_start: 		360.0,
				radius_step:  		10.0,
				frequency_start: 	10.0,
				frequency_step:		-1.0,
				amplitude_start:	30.0,
				amplitude_step:		-1.0,
				angle_start:		0.0,
				angle_step: 		1.0,
				c:					this.options.color
			};
		}
		
		frame.radius_step = random(WatifyGeneratorModel.min_radius_step, WatifyGeneratorModel.max_radius_step);
		frame.frequency_start = random(WatifyGeneratorModel.min_frequency, WatifyGeneratorModel.max_frequency);
		frame.frequency_step = -0.2;
		frame.amplitude_start = random(WatifyGeneratorModel.min_amplitude, WatifyGeneratorModel.max_amplitude);
		frame.amplitude_step = -0.1;
		frame.angle_start = random(WatifyGeneratorModel.min_angle, WatifyGeneratorModel.max_angle);
		frame.angle_step = 0.0;
		
		return frame;	
	},
	
	// helper function to clone keyframe objects
	cloneKeyFrame: function(frame) {
		var clone = {
			radius_start: 		frame.radius_start,
			radius_step:  		frame.radius_step,
			frequency_start: 	frame.frequency_start,
			frequency_step:		frame.frequency_step,
			amplitude_start:	frame.amplitude_start,
			amplitude_step:		frame.amplitude_step,
			angle_start:		frame.angle_start,
			angle_step: 		frame.angle_step,
			c:					frame.c
		};
		
		return clone;
	},
	
	// generate tween frame: take 2 keyframes and interpolate between them
	generateTweenFrame: function(frame, keyFrame0, keyFrame1, delta) {
		var lerp = this.lerp;	// reference to lerp() function
		
		if(frame == null) {
			frame = {
				radius_start: 		360.0,
				radius_step:  		10.0,
				frequency_start: 	10.0,
				frequency_step:		-1.0,
				amplitude_start:	30.0,
				amplitude_step:		-1.0,
				angle_start:		0.0,
				angle_step: 		1.0,
				c:					this.options.color
			};
		}
		
		frame.radius_start = lerp(keyFrame0.radius_start, keyFrame1.radius_start, delta);
		frame.radius_step = lerp(keyFrame0.radius_step, keyFrame1.radius_step, delta);
		frame.frequency_start = lerp(keyFrame0.frequency_start, keyFrame1.frequency_start, delta);
		frame.frequency_step = lerp(keyFrame0.frequency_step, keyFrame1.frequency_step, delta);
		frame.amplitude_start = lerp(keyFrame0.amplitude_start, keyFrame1.amplitude_start, delta);
		frame.amplitude_step = lerp(keyFrame0.amplitude_step, keyFrame1.amplitude_step, delta);
		frame.angle_start = lerp(keyFrame0.angle_start, keyFrame1.angle_start, delta);
		frame.angle_step = lerp(keyFrame0.angle_step, keyFrame1.angle_step, delta);
	
		return frame;
	},
	
	// main loop
	draw: function() {
		
		var delta = (this.playhead % this.options.keyFrameDistance) / this.options.keyFrameDistance;	// 0-1: percentage of how far along we are between keyFrame0 & keyFrame1
		
		this.tweenFrame = this.generateTweenFrame(this.tweenFrame, this.keyFrame0, this.keyFrame1, delta);
		
		this.render(this.tweenFrame);
		
		// advance playhead & generate new keyframes as needed
		
		if(this.options.animated) {
			this.playhead ++;
		}
		
		if(this.playhead / this.options.keyFrameDistance === 1) {
			this.keyFrame0 = this.cloneKeyFrame(this.keyFrame1);
			this.generateKeyFrame(this.keyFrame1);
			
			this.playhead = 0;
		}
	},
	
	// main rendering loop
	render: function(frame) {
		var ctx = this.context,
			width = this.width*this.pixelRatio,
			height = this.height*this.pixelRatio,
			lerp = this.lerp,
			radians = this.radians,
			scale = 1;	// scaling factor
				
		if(Math.max(width, height) < 400) {
			scale = 0.5;
		} else if(Math.max(width, height) < 200) {
			scale = 0.2;
		}
				
		var useFill = true,
			useOutline = false,
			background = '#348ec0',
			fillColor = '#0000008D',
			strokeColor = '#ffffff';
			
		// set colours
		switch(frame.c) {
			case 1: // yellow
				background = '#fbc700';
				strokeColor = '#fbc700';
				fillColor = '#f8b327';
			break;
			case 2: // red
				background = '#e51935';
				strokeColor = '#e51935';
				fillColor = '#c80b30';
			break;
			case 3: // green
				background = '#00a285';
				strokeColor = '#00a285';
				fillColor = '#00856b';
			case 4: // wireframe
				background = 'transparent';
				strokeColor = '#000000';
				fillColor = 'transparent';
			break;
			case 0: // blue
			default:
				background = '#3a90c1';
				strokeColor = '#3a90c1';
				fillColor = '#286386';
			break;
		}
		
		
		ctx.clearRect(0, 0, width, height);	// clear canvas
		
		// draw background
		if(!this.options.transparent) {
			ctx.rect(0, 0, width, height);
			ctx.fillStyle = background;
			ctx.fill();
		}
		
		
		var radius = Math.min(frame.radius_start, Math.min(width, height)*.40),
			angle_offset = frame.angle_start*scale,
			frequency = frame.frequency_start*scale,
			amplitude = frame.amplitude_start*scale;
		
		
		while(radius > 10*scale) {
			ctx.save();	// pushmatrix();
			
			ctx.translate(width/2, height/2);	// move to the center of the canvas
			ctx.rotate(radians(angle_offset));	
			
			ctx.beginPath();
			
			for(var i = 0; i < 360; i++ ) {
				var angle = i,
					freq = frequency,
					offset,
					rad,
					xpos, ypos;
				
				if(i < 90) {
					freq = lerp(Math.round(frequency), frequency, i/90.0);
				} else if (i > 270) {
					freq = lerp(Math.round(frequency), frequency, (i - 270.0)/90.0);
				}
				
				freq = Math.round(frequency);
				
				offset = (amplitude * Math.sin(radians(i) * freq));
				
				rad = radius + offset;
				
				xpos = rad * Math.sin(radians(angle));
				ypos = rad * Math.cos(radians(angle));
				
				ctx.lineTo(xpos, ypos);
			}
			
			radius -= frame.radius_step*scale;
			angle_offset += frame.angle_step*scale;
			frequency += frame.frequency_step*scale;
			amplitude += frame.amplitude_step*scale;
			
			ctx.closePath();
			
			if(useFill) {
				ctx.fillStyle = fillColor;
				ctx.fill();
				useFill = false;
			}
			
			ctx.lineWidth = scale;
			ctx.strokeStyle = strokeColor;
						
			ctx.stroke();
			ctx.restore(); // popMatrix();
		}
		
		// draw type-mark?
		if(this.typo_loaded) {
			var dim = Math.min(frame.radius_start*2, Math.min(width, height));
			ctx.drawImage(this.typo_img, (width - dim)/2, (height - dim)/2, dim, dim);
		}
		
		if(this.options.cansave) {
			this.img.attr("src", this.canvas.toDataURL());
		}
	},	
	
	// random number helper method
	random: function(min, max) {
		if(min > max) {
			var sanity = min;
			min = max;
			max = sanity;
		}
		
		return min + Math.random()*(max - min);
	},
	
	// linear interpolation helper method
	lerp: function(start, end, delta) {
		var diff = (end - start);
		
		return (start + diff*delta);
	},
	
	// convert degrees to radians
	radians: function(degrees) {
		return degrees*(Math.PI/180.0);
	}
};

// parse options from data- attributes
function readWaveFunctionOptions(elem) {
	var options = {
		color: 0,
		typo: true,
		tagline: true,
		transparent: true,
		animated: false,
		resizable: true, 
		keyFrameDistance: 240,
		cansave: false
	};
	
	if(elem.data("color") !== undefined) {
	
		switch(elem.data("color").toString()) {
			case "blue":
			default:
				options.color = 0;
			break;
			case "yellow":
				options.color = 1;
			break;
			case "red":
				options.color = 2;
			break;
			case "green":
				options.color = 3;
			break;
			case "wireframe":
				options.color = 4;
			break;
		}
	}
	
	if(elem.data("typo") !== undefined) {
		options.typo = elem.data("typo");
	}
	
	if(elem.data("tagline") !== undefined) {
		options.tagline = elem.data("tagline");
	}
	
	if(elem.data("transparent") !== undefined) {
		options.transparent = elem.data("transparent");
	}
	
	if(elem.data("animated") !== undefined) {
		options.animated = elem.data("animated");
	}
	
	if(elem.data("resizable") !== undefined) {
		options.resizable = elem.data("resizable");
	}
	
	if(elem.data("cansave") !== undefined) {
		options.cansave = elem.data("cansave");
	}
	
	if(elem.data("keyframedistance") !== undefined) {
		options.keyFrameDistance = elem.data("keyframedistance");
	}
	
	return options;
}

// init
$(document).ready(function(){
	WatifyInstances = [];

	$('.wavefunction').each(function(i){
		var elem = $(this),
			options = readWaveFunctionOptions(elem);
		
		WatifyInstances.push(new Watify(elem, options));
	});
});

// Request Animation Frame Polyfill (source: http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/)
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
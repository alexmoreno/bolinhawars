var bossLife;
function timer(){
  bossLife--;
  if (bossLife <= 0)
  {
     clearInterval(bossCounter);
     return;
  }
  $('#boss-life').html(bossLife)
}


function rand(min, max) { return Math.floor(Math.random() * (max - min)) + min; }
function frand(min,max){ return Math.random() * (max - min) + min;} //float arandom
var bossCounter;
var lS = localStorage;
(function(){
	var J = {
	lastTime: (new Date()).getTime(),  //lasttime
	canvasWidth: 600,
	canvasHeight: 600,
	interval : 0,
	fps: 30,
	Boss : false,
	BossLiveInterval: false,
	Player: {
		x: this.canvasWidth/2,
		y: this.canvasHeight/2,
		x: this.canvasWidth/2,
		y: this.canvasHeight/2,
		radius: 10,
		bombs: 0,
		bombsEnabled : false,
		maxBombs : 0
	},	
	circleRadius : 10,
	maxCircleRadiusInterval: 10,
	maxCircles: 45,
	maxScore: 0,
	totalEaten: 0,
	circles : [],
	colors: ['Blue', 'DeepSkyBlue', 'MediumSlateBlue', 'Aquamarine', 'Lime', 'Indigo', 'Red', 'DarkRed', 'Fuchsia', 'Magenta', 'Orange', 'OrangeRed', 'GreenYellow', 'Purple'],

	resetStartValues: function(){
		J.lastTime = (new Date()).getTime(),  //lasttime
		J.startx   = 100,
		J.starty  = 100,
		J.circleRadius =  10
		
		J.Player.x = J.canvasWidth/2
		J.Player.y = J.canvasHeight/2
		J.Player.rx = J.canvasWidth/2
		J.Player.ry = J.canvasHeight/2
		J.Player.radius = 10
		J.Player.bombsEnabled = true,
		J.Player.maxBombs = 1
		J.Player.bombs = 1
		J.setBombs(J.Player.maxBombs)
			
		
	},

	init: function(restart){
		J.canvas = document.getElementById('canvas');
		J.ctx = J.canvas.getContext('2d')
		J.canvasWidth = window.innerWidth
       	J.canvasHeight = window.innerHeight - 80

       	J.setScore(0)
       	J.setMaxScore(lS.getItem('maxScore') | 0);
       	
       	J.setLocalStorage();
       	J.Boss = false;
      	$(J.canvas).attr({width: J.canvasWidth, height: J.canvasHeight})

		J.checkAchievements();
		
      	if(restart){
			J.start()
      	}
		$('#start-button').unbind('click').bind('click', function(){
			J.start()
		})
		$('#boss-life').html(0)

		
	},
	deleteItem: function(x, y, radius){
		J.ctx.beginPath();
		J.ctx.arc(x,y,radius+1,0,Math.PI*2,false)
		J.ctx.fillStyle = '#000'
		J.ctx.closePath()
		J.ctx.fill();

	},

	deleteObj: function(obj){
		J.ctx.beginPath();
		J.ctx.arc(obj.x,obj.y,obj.radius+1,0,Math.PI*2,false)
		J.ctx.fillStyle = '#000'
		J.ctx.closePath()
		J.ctx.fill();

	},
	draw: function(x,y, radius, color){
	    J.ctx.beginPath()
		J.ctx.arc(x,y,radius,Math.PI*2,false)
		J.ctx.fillStyle = color
		J.ctx.closePath()
		J.ctx.fill()
	},
	

	start: function(){
		J.resetStartValues();
		J.interval = setInterval(J.tick, J.fps);
		J.spawnCircles()
		$('canvas').css('cursor', 'none')
		$(J.canvas).mousemove(J.mouseMove)
		$(document).bind('touchmove', J.touchMove)
		$(document).bind('keypress', J.keyPress)

		$('#start').css('display', 'none')
	},

	spawnCircles: function(){
		for(var i = 0; i < J.maxCircles; i++ ){
			J.circles[i] = J.createCircle()
		}
	},

	spawnBoss: function(){
		J.deleteObj(J.Player)
		J.Player.radius = 10;

		J.Boss = J.createBoss();
		J.draw(J.Boss.x, J.Boss.y, J.Boss.radius, J.Boss.color);

		
		bossLife = 30;
		$('#boss-life').html(bossLife).show()

		// a pausinha dramática do chefe
		setTimeout(function(){
			bossCounter = setInterval(timer, 1000);
			J.Boss.shoot()
			J.BossLiveInterval = setTimeout(J.Boss.die, bossLife*1000);
		}, 3000) 
		
    	
		
		
	},

	createBoss: function(){
		boss = {
			radius: 20,
			color: '#f00',
			//x : J.canvasHeight / 4 * 3,
			//y : J.canvasWidth / 2,
			x : J.canvasWidth/2,
			y : 20,

			alive : true,
			shoot: function(){
				J.bossInterval = setTimeout(J.createShoot, 50)
				
			},
			die: function(){
				J.deleteAll(),
				J.Boss = {};
				J.BossKilled = 1;
				lS.setItem('BossKilled', 1);
				clearInterval(bossCounter)
				alert('Zerou a primeira fase! Aguarde por updates. =)')
				
	
			},
			erase: function(){

			},
			shootSeed: 0
		}
		return boss

	},
	createShoot : function(){
		circle = {
			radius: 50,
			color: '#ff0',
		
       		move: function(){
       			if (this.inBounds()) {
       				r = 5
	       			this.x += this.vx *  r 
	     			this.y += this.vy *  r 
     			}
       		},

		   	inBounds : function() {
		     if(this.x + this.radius < 0 ||
		        this.x - this.radius > J.canvasWidth ||
		        this.y + this.radius < 0 ||
		        this.y - this.radius > J.canvasHeight)
		       return false
		     else
		       return true
		   }
		}
		r = Math.random()
	    
		circle.x = J.Boss.x
		circle.y = J.Boss.y
		
	     J.Boss.shootSeed++;
	     if (J.Boss.shootSeed == 2) {
	     	J.Boss.shootSeed = 0;
	     }
	     switch(J.Boss.shootSeed) {
	     	case 0:
			     circle.vx = -1
			     circle.vy = 1

	     		break;
	     	case 1:
	     		circle.vx = 1
			    circle.vy = 1
	     		
	     		
	     		break;
     	
	     }
	     r = Math.random()
	     circle.vx += frand(-1,1)
	     circle.vy += frand(-1,1)
	     
/*
		if(Math.abs(circle.vx) + Math.abs(circle.vy) < 1) {
		     circle.vx = (circle.vx < 0) ? -1 : 1
		     circle.vy = (circle.vy < 0) ? -1 : 1
		}
*/
		J.circles.push(circle)
		
		J.Boss.shoot()
		
	},

	setScore: function(score){
		$('#score').html(score)
		
		if(score > lS.getItem('maxScore')){
			J.setMaxScore(score);
		}

		if (score) {
			J.totalEaten++;
			lS.setItem('totalEaten', J.totalEaten)
		}
		
	},
	setBombs: function(bombs){
		$('#bombs').html(bombs)
	},
	setMaxScore: function(score){
		lS.setItem('maxScore',  score);
		$('#max-score').html(lS.getItem('maxScore'))
		$('#60maxScore-progress').html(score)
	},
	tick: function(){

		now = (new Date()).getTime()
	    window.elapsed = now - J.lastTime
	    J.lastTime = now
		for(var i = 0; i < J.circles.length; i++){
			var circle = J.circles[i];
			J.deleteItem(circle.x, circle.y, circle.radius)
			circle.move();
			J.draw(circle.x, circle.y, circle.radius, circle.color);
		}

		J.deleteItem(J.Boss.rx, J.Boss.ry, J.Boss.radius)
		J.draw(J.Boss.x, J.Boss.y, J.Boss.radius, J.Boss.color);
		
		J.deleteItem(J.Player.rx, J.Player.ry, J.Player.radius)
		J.draw(J.Player.x, J.Player.y, J.Player.radius, "#fff");
		J.detectCollision()
	},
	createCircle: function(){

		circle = {
			radius: rand(J.circleRadius-J.maxCircleRadiusInterval, J.circleRadius+J.maxCircleRadiusInterval+15),
			color: J.colors[rand(0,J.colors.length-1)],
		
       		move: function(){
       			if (this.inBounds()) {
       				
       				
	       			this.x += this.vx * elapsed / 15
	     			this.y += this.vy * elapsed / 15
     			}else{
				    
       				for(var i = 0; i < J.circles.length; i++){
				        if(J.circles[i].x == this.x && J.circles[i].y == this.y) {
				           J.circles[i] = J.createCircle();
				        }
				    } 
       			}
       		},

		   	inBounds : function() {
		     if(this.x + this.radius < 0 ||
		        this.x - this.radius > J.canvasWidth ||
		        this.y + this.radius < 0 ||
		        this.y - this.radius > J.canvasHeight)
		       return false
		     else
		       return true
		   }
		}
		 r = Math.random()
	     if(r <= .25) {
	       circle.x = 1 - circle.radius
	       circle.y = Math.random() * J.canvasHeight
	       circle.vx = Math.random()
	       circle.vy = Math.random() 
	     } else if(r > .25 && r <= .5) {
	       circle.x = J.canvasWidth + circle.radius - 1
	       circle.y = Math.random() * J.canvasHeight
	       circle.vx = - Math.random()
	       circle.vy = Math.random() 
	     } else if(r > .5 && r <= .75) {
	       circle.x = Math.random() * J.canvasHeight
	       circle.y = 1 - circle.radius
	       circle.vx = Math.random() 
	       circle.vy = Math.random()
	     } else {
	       circle.x = Math.random() * J.canvasHeight
	       circle.y = J.canvasHeight + circle.radius - 1
	       circle.vx = Math.random() 
	       circle.vy = - Math.random()
	     }

		if(Math.abs(circle.vx) + Math.abs(circle.vy) < 1) {
		     circle.vx = circle.vx < 0 ? -1 : 1
		     circle.vy = circle.vy < 0 ? -1 : 1
		}


		return circle;
	},
	mouseMove: function(e) {
		J.Player.rx = J.Player.x,
		J.Player.ry = J.Player.y
	    J.Player.x = e.clientX 
	    J.Player.y = e.clientY -40
	    J.deleteItem(J.Player.rx, J.Player.ry, J.Player.radius)
		J.draw(J.Player.x, J.Player.y, J.Player.radius, "#fff");
    },
	touchMove: function(e) {
		e.preventDefault()
		var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]
		J.mouseMove(touch)
	},
	keyPress: function(e){
		console.log(e.keyCode); //aperte B pra usar bomba
		if(e.keyCode == 98 && J.Player.bombsEnabled && J.Player.bombs){
			J.useBomb()
		}
	},
	useBomb: function(){
		J.Player.bombs--;
		J.deleteAll();
		if (!J.Boss) {
			J.spawnCircles();
		}
		J.setBombs(J.Player.bombs);
	},
    detectCollision : function() {
		for(var i = 0; i < J.circles.length; i++) { //verifica se todas as bolinhas possuem distancia
			circle = J.circles[i]
			dist = Math.pow(
				Math.pow(circle.x - J.Player.x,2) + 
				Math.pow(circle.y - J.Player.y,2),
			.5) //distancia
			
			if(dist < J.Player.radius + circle.radius) {  //verifica se as bolinhas encostaram
				if(circle.radius > J.Player.radius) {
					J.death()
				} else {
					J.eat(i)
				}
			}
		}
		if(J.Boss){

			dist = Math.pow(
				Math.pow(J.Boss.x - J.Player.x,2) + 
				Math.pow(J.Boss.y - J.Player.y,2),
			.5) //distancia
			
			if(dist < J.Player.radius +J.Boss.radius) {  //verifica se as bolinhas encostaram
				if(J.Boss.radius > J.Player.radius) {
					J.death()
				} 
			}
		}
		
   	},
   	eat: function(index){
   		circle = J.circles[index]
   		J.deleteItem(circle.x, circle.y, circle.radius)
		J.circles.splice(index,1) // ou encostam ou somem
		J.circleRadius = J.circleRadius + 1;
		J.circles.push(J.createCircle());
		J.Player.radius = J.Player.radius+1;
   		J.Player.score = J.Player.radius - 10
		J.setScore(J.Player.score)
		if((J.Player.score) == 5){
			J.deleteAll();
			J.spawnBoss();
		}
   	},
   	death: function(){
   		score = J.Player.radius-10
		if (score > 10) { 
			deathsAbove10 = lS.getItem('deathsAbove10');
			lS.setItem('deathsAbove10', ++deathsAbove10)
		 }
		J.deleteAll();
		
		clearInterval(J.interval)
		clearInterval(J.bossInterval)
		clearInterval(J.BossLiveInterval)
		clearInterval(bossCounter)
		
		J.init(true);
   	},
	deleteAll: function(){
		for(var i = 0; i < J.circles.length; i++){
			circle = J.circles[i];
			J.deleteItem(circle.x, circle.y, circle.radius)
		}
		J.circles = [];
	},
	setLocalStorage: function(){

		if (lS.getItem('totalEaten')) {
			J.totalEaten = lS.getItem('totalEaten')
		}

		if (lS.getItem('maxScore')) {
			J.maxScore = lS.getItem('maxScore')
		}

		if (lS.getItem('deathsAbove10')) {
			J.deathsAbove10 = lS.getItem('deathsAbove10')
		}
		if (lS.getItem('BossKilled')) {
			J.BossKilled = lS.getItem('BossKilled') | 0
		}
	},
	setAchievements: function(){
		$('#60maxScore-progress').html(J.maxScore)
		$('#1000score-progress').html(J.totalEaten)
		$('#100000score-progress').html(J.totalEaten)
		$('#200deaths-progress').html(J.deathsAbove10)
		$('#killFirstBoss-progress').html(J.BossKilled)
	},

	checkAchievements: function(){

		J.setAchievements();


		
		if (lS.getItem('totalEaten') > 1000) {
			J.Achievements['1000score'].prize();
		}
	},

	Achievements: 	{
		'1000score': {
			prize: function(){
				J.Player.bombsEnabled = true,
				J.Player.maxBombs = 3
				J.Player.bombs = 3
			}
			
		}
	},
}
  
J.init(false);
})()


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
		maxBombs : 0,
		bombsMod: false,
		score: 0
	},	
	circleRadius : 10,
	maxCircleRadiusInterval: 10,
	maxCircles: 45,
	maxScore: 0,
	totalEaten: 0,
	spawnCirclesCounter: 0,
	circles : [],
	colors: ['Blue', 'DeepSkyBlue', 'MediumSlateBlue', 'Aquamarine', 'Lime', 'Indigo', 'Red', 'DarkRed', 'Fuchsia', 'Magenta', 'Orange', 'OrangeRed', 'GreenYellow', 'Purple'],

	resetStartValues: function(){
		J.lastTime = (new Date()).getTime(),  //lasttime
		J.startx   = 100,
		J.starty  = 100,
		J.circleRadius =  10
		J.deleteAll()


		J.Player.x = J.canvasWidth/2
		J.Player.y = J.canvasHeight/2
		J.Player.rx = J.canvasWidth/2
		J.Player.ry = J.canvasHeight/2
		J.Player.radius = 10
		J.Player.score = 0
		J.Player.bombsEnabled = true,
		J.Player.maxBombs = 1
		J.Player.bombs = 1
		// if any achievement enabled
		if (J.Player.bombsMod) {
			J.Player.maxBombs = J.Player.bombsMod
			J.Player.bombs = J.Player.bombsMod
		}
		
			
		J.setBombs(J.Player.maxBombs)
	},

	init: function(restart){
		J.canvas = document.getElementById('canvas');
		J.ctx = J.canvas.getContext('2d')
		J.canvasWidth = 800
       	J.canvasHeight = 576

       	J.setScore(0)
       	J.setMaxScore(lS.getItem('maxScore') | 0);
       	
       	J.setLocalStorage();
       	J.Boss = false;
      	$(J.canvas).attr({width: J.canvasWidth, height: J.canvasHeight})

		J.checkAchievements();
		
      	if(restart){
      		$('#start').show()
      	}
		$('#start-button').unbind('click').bind('click', function(){
			J.canvasWrite('Fase 1', J.start)
			
		})
		$('#boss-life').html(0)

		
	},


	canvasWrite: (text, cb) => {
		J.deleteItem(J.Player.rx, J.Player.ry, J.Player.radius)
		$(J.canvas).unbind('mousemove').css('cursor', 'default')
		J.ctx.fillStyle = "#fff";
		J.ctx.textBaseLine = 'middle';
		J.ctx.textAlign = 'center';

		if (text == 'Fase 1') {
			
			
			J.ctx.font = "bold 24px lunchTime";
			J.ctx.fillText(text, 400, 300);
		}

		if (text == 'boss1') {
			
			J.ctx.font = "bold 24px lunchTime";
			J.ctx.fillText('Chefe!', 400, 300);
			
			J.ctx.font = "bold 18px lunchTime";
			J.ctx.fillText('Esquive-se dos tiros por 30 segundos!', 400, 340);
			
		}

		if (text == 'zerou') {
			J.ctx.font = "bold 24px lunchTime";
			J.ctx.fillText('PARABENS!', 400, 300);

			J.ctx.font = "bold 18px lunchTime";
			J.ctx.fillText('Aguarde novas atualizações!', 400, 340);
			
		}

		  $('#start').css('display', 'none')
		  setTimeout(() => {

			  J.ctx.fillStyle = "#000";
			  J.ctx.font = "bold 24px lunchTime";
			  J.ctx.clearRect(200, 200, 400, 300);
			  $(J.canvas).mousemove(J.mouseMove).css('cursor', 'none')
		  		cb()
		  }, 3000);

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

	},

	spawnCircles: function(){
		
		setTimeout(function(){
			J.circles[J.spawnCirclesCounter] = J.createCircle()
			J.spawnCirclesCounter++
			if(J.spawnCirclesCounter <= J.maxCircles){
				J.spawnCircles()
			}
			else J.spawnCirclesCounter = 0;
		}, 60)

	},

	spawnBoss: function(){
		J.deleteObj(J.Player)
		J.Player.radius = 10;

		J.Boss = J.createBoss();
		J.draw(J.Boss.x, J.Boss.y, J.Boss.radius, J.Boss.color);

		// começar a atirar depois de 3 segundos
		
		// começar a fazer a contagem de life após ele começar a atirar
		bossLife = 30;
		$('#boss-life').html(bossLife).show()
		setTimeout(function(){
			bossCounter = setInterval(function(){
				timer
				J.setScore(++J.Player.score)
			}, 1000);
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
				console.log('atira');
			},
			die: function(){
				J.deleteAll(),
				J.Boss = {};
				J.BossKilled = 1;
				lS.setItem('BossKilled', 1);
				clearInterval(bossCounter)
				J.canvasWrite('zerou', function(){zerou = 0})

				
	
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
			radius: rand(J.circleRadius-J.maxCircleRadiusInterval, J.circleRadius+J.maxCircleRadiusInterval+7),
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
		var mouseX, mouseY;

	    if(e.offsetX) {
	        mouseX = e.offsetX;
	        mouseY = e.offsetY;
	    }
	    else if(e.layerX) {
	        mouseX = e.layerX;
	        mouseY = e.layerY;
	    }


		J.Player.rx = J.Player.x,
		J.Player.ry = J.Player.y
	    J.Player.x = mouseX 
	    J.Player.y = mouseY 
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
   		J.Player.score++
		J.setScore(J.Player.score)
		if((J.Player.score) == 20){
			J.deleteAll();
			J.deleteItem(J.Player.rx, J.Player.ry, J.Player.radius)

			J.canvasWrite('boss1', J.spawnBoss)
		}
   	},
   	death: function(){
   		score = J.Player.score
		if (score > 10) { 
			deathsAbove10 = lS.getItem('deathsAbove10');
			lS.setItem('deathsAbove10', ++deathsAbove10)
		 }

		//J.deleteAll();
		$(J.canvas).unbind('mousemove').css('cursor', 'default')
		wordPontos = (score > 1) ? 'pontos' : 'ponto'
		$('#you-died-score').html(score)
		$('#you-died-pontos-word').html(wordPontos)
		$('#you-died').show()
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
		

		

	},

	calcAchievements : (index) => {
		console.log(J.Achievements[index]);
		$(index).html(J.Achievements[index].progress)
		var color = (J.Achievements[index].progress >= J.Achievements[index].goal) ? 'green' : 'red'
		var width = (J.Achievements[index].progress >= J.Achievements[index].goal) ? '100'  : J.Achievements[index].progress / J.Achievements[index].goal * 100
		$(index).next().css({backgroundColor: color, width: width +'%'})
		if ( J.Achievements[index].progress >= J.Achievements[index].goal) { J.Achievements[index].prize()}
	},
	

	checkAchievements: function(){
		J.generateAchievements()
		for(var a in J.Achievements){
			J.calcAchievements(a)
		}
	},

	generateAchievements: () =>{
		J.Achievements = {
			'#100000score-progress' : {
				progress: J.totalEaten,
				goal: 100000
			},

			'#1000score-progress' : {
				progress: J.totalEaten,
				goal: 1000,
				prize: () => {
					J.Player.bombsEnabled = true,
					J.Player.maxBombs = 3
					J.Player.bombs = 3,
					J.Player.bombsMod = 3
				}
			},

			'#40maxScore-progress' : {
				progress: J.maxScore,
				goal: 40,
				prize: () => {
					J.Player.bombsEnabled = true,
					J.Player.maxBombs = 3
					J.Player.bombs = 3,
					J.Player.bombsMod = 3
				}
			},	

			'#killFirstBoss-progress' : {
				progress: J.BossKilled,
				goal: 1,
				prize: () => {
					
				}
			},

			'#200deaths-progress' : {
				progress: J.deathsAbove10,
				goal: 200
			}
		}
	},

	Achievements: 	{},
}
  
J.init(false);
})()


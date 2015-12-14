/// <reference path="../../typings/jquery/jquery.d.ts"/>
function rand(min, max) { return Math.floor(Math.random() * (max - min)) + min; }
function frand(min, max) { return Math.random() * (max - min) + min; } //float arandom
var lS = localStorage;
var bossLife;
function timer() {
    bossLife--;
    if (bossLife <= 0) {
        clearInterval(game.bossCounter);
        return;
    }
    $('#boss-life').html(bossLife);
}
var Game = (function () {
    function Game() {
        var _this = this;
        this.that = this;
        this.canvasWidth = 600;
        this.canvasHeight = 600;
        this.lastTime = (new Date()).getTime();
        this.interval = 0;
        this.fps = 30;
        this.BossLiveInterval = 0;
        this.BossKilled = 0;
        this.deathsAbove10 = 0;
        this.circleRadius = 10;
        this.maxCircles = 45;
        this.maxCircleRadiusInterval = 10;
        this.maxScore = 0;
        this.totalEaten = 0;
        this.circles = [];
        this.bossCounter = 0;
        this.canvas = 0;
        this.ctx = 0;
        this.bossInterval = 0;
        this.bossLiveInterval = 0;
        this.init = function (restart) {
            if (restart === void 0) { restart = false; }
            _this.canvas = document.getElementById('canvas');
            _this.ctx = _this.canvas.getContext('2d');
            _this.canvasWidth = window.innerWidth;
            _this.canvasHeight = window.innerHeight;
            _this.setScore(0);
            _this.setMaxScore(localStorage.getItem('maxScore') | 0);
            _this.setLocalStorage();
            $(_this.canvas).attr({ width: _this.canvasWidth, height: _this.canvasHeight });
            _this.checkAchievements();
            if (restart) {
                _this.start();
            }
            var that = _this;
            $('#start-button').unbind('click').bind('click', function () {
                that.start();
            });
            $('#boss-life').html('0');
        };
        this.deleteItem = function (circle) {
            _this.ctx.beginPath();
            _this.ctx.arc(circle.x, circle.y, circle.radius + 1, 0, Math.PI * 2, false);
            _this.ctx.fillStyle = '#000';
            _this.ctx.closePath();
            _this.ctx.fill();
        };
        this.deleteObj = function (obj) {
            _this.ctx.beginPath();
            _this.ctx.arc(obj.x, obj.y, obj.radius + 1, 0, Math.PI * 2, false);
            _this.ctx.fillStyle = '#000';
            _this.ctx.closePath();
            _this.ctx.fill();
        };
        this.Achievements = {
            '1000score': function () {
                _this.Player.bombsEnabled = true;
                _this.Player.maxBombs = 3;
                _this.Player.bombs = 3;
            }
        };
    }
    Game.prototype.construct = function () {
        this.Player = {
            x: this.canvasWidth / 2,
            y: this.canvasHeight / 2,
            rx: this.canvasWidth / 2,
            ry: this.canvasHeight / 2,
            radius: 10,
            bombs: 0,
            bombsEnabled: false,
            maxBombs: 0,
            score: 0
        };
    };
    Game.prototype.resetStartValues = function () {
        this.lastTime = (new Date()).getTime(),
            this.circleRadius = 10;
        this.Player.x = this.canvasWidth / 2;
        this.Player.y = this.canvasHeight / 2;
        this.Player.rx = this.canvasWidth / 2;
        this.Player.ry = this.canvasHeight / 2;
        this.Player.radius = 10;
        this.Player.bombsEnabled = true,
            this.Player.maxBombs = 1;
        this.Player.bombs = 1;
        this.setBombs(this.Player.maxBombs);
    };
    Game.prototype.start = function () {
        this.resetStartValues();
        this.interval = setInterval(this.tick, this.fps);
        this.spawnCircles();
        $('canvas').css('cursor', 'none');
        $(this.canvas).mousemove(this.mouseMove);
        $(document).bind('touchmove', this.touchMove);
        $(document).bind('keypress', this.keyPress);
        $('#start').css('display', 'none');
    };
    Game.prototype.draw = function (circle) {
        this.ctx.beginPath();
        this.ctx.arc(circle.x, circle.y, circle.radius, Math.PI * 2, false);
        this.ctx.fillStyle = circle.color;
        this.ctx.closePath();
        this.ctx.fill();
    };
    Game.prototype.useBomb = function () {
        this.Player.bombs--;
        this.deleteAll();
        if (!this.Boss)
            this.spawnCircles();
        this.setBombs(this.Player.bombs);
    };
    Game.prototype.spawnCircles = function () {
        for (var i = 0; i < this.maxCircles; i++) {
            this.circles[i] = this.createCircle();
        }
    };
    Game.prototype.createCircle = function () {
        var circle;
        circle = {
            radius: rand(this.circleRadius - this.maxCircleRadiusInterval, this.circleRadius + this.maxCircleRadiusInterval + 15),
            color: Game.colors[rand(0, Game.colors.length - 1)],
            x: 0,
            y: 0,
            move: function () {
                if (this.inBounds()) {
                    this.x += this.vx * window.elapsed / 15;
                    this.y += this.vy * window.elapsed / 15;
                }
                else {
                    for (var i = 0; i < this.circles.length; i++) {
                        if (this.circles[i].x == this.x && this.circles[i].y == this.y) {
                            this.circles[i] = this.createCircle();
                        }
                    }
                }
            },
            inBounds: function () {
                if (this.x + this.radius < 0 ||
                    this.x - this.radius > this.canvasWidth ||
                    this.y + this.radius < 0 ||
                    this.y - this.radius > this.canvasHeight)
                    return false;
                else
                    return true;
            }
        };
        var r = Math.random();
        if (r <= .25) {
            circle.x = 1 - circle.radius;
            circle.y = Math.random() * this.canvasHeight;
            circle.vx = Math.random();
            circle.vy = Math.random();
        }
        else if (r > .25 && r <= .5) {
            circle.x = this.canvasWidth + circle.radius - 1;
            circle.y = Math.random() * this.canvasHeight;
            circle.vx = -Math.random();
            circle.vy = Math.random();
        }
        else if (r > .5 && r <= .75) {
            circle.x = Math.random() * this.canvasHeight;
            circle.y = 1 - circle.radius;
            circle.vx = Math.random();
            circle.vy = Math.random();
        }
        else {
            circle.x = Math.random() * this.canvasHeight;
            circle.y = this.canvasHeight + circle.radius - 1;
            circle.vx = Math.random();
            circle.vy = -Math.random();
        }
        if (Math.abs(circle.vx) + Math.abs(circle.vy) < 1) {
            circle.vx = circle.vx < 0 ? -1 : 1;
            circle.vy = circle.vy < 0 ? -1 : 1;
        }
        return circle;
    };
    Game.prototype.spawnBoss = function () {
        this.deleteObj(this.Player);
        this.Player.radius = 10;
        this.Boss = this.createBoss();
        this.draw(this.Boss);
        bossLife = 30;
        $('#boss-life').html(String(bossLife)).show();
        // a pausinha dramática do chefe
        setTimeout(function () {
            this.bossCounter = setInterval(timer, 1000);
            this.Boss.shoot();
            this.BossLiveInterval = setTimeout(this.Boss.die, bossLife * 1000);
        }, 3000);
    };
    Game.prototype.createBoss = function () {
        var boss;
        boss = {
            radius: 20,
            color: '#f00',
            //x : this.canvasHeight / 4 * 3,
            //y : this.canvasWidth / 2,
            x: this.canvasWidth / 2,
            y: 20,
            shoot: function () {
                this.bossInterval = setTimeout(this.createShoot, 50);
            },
            die: function () {
                this.deleteAll(),
                    this.Boss = {};
                this.BossKilled = 1;
                lS.setItem('BossKilled', '1');
                clearInterval(this.bossCounter);
                alert('Zerou a primeira fase! Aguarde por updates. =)');
            },
            shootSeed: 0,
            alive: true
        };
        return boss;
    };
    Game.prototype.createShoot = function () {
        var circle;
        circle = {
            radius: 50,
            color: '#ff0',
            x: 0,
            y: 0,
            move: function () {
                if (this.inBounds()) {
                    var r = 5;
                    this.x += this.vx * r;
                    this.y += this.vy * r;
                }
            },
            inBounds: function () {
                if (this.x + this.radius < 0 ||
                    this.x - this.radius > this.canvasWidth ||
                    this.y + this.radius < 0 ||
                    this.y - this.radius > this.canvasHeight)
                    return false;
                else
                    return true;
            }
        };
        var r = Math.random();
        circle.x = this.Boss.x;
        circle.y = this.Boss.y;
        this.Boss.shootSeed++;
        if (this.Boss.shootSeed == 2) {
            this.Boss.shootSeed = 0;
        }
        switch (this.Boss.shootSeed) {
            case 0:
                circle.vx = -1;
                circle.vy = 1;
                break;
            case 1:
                circle.vx = 1;
                circle.vy = 1;
                break;
        }
        r = Math.random();
        circle.vx += frand(-1, 1);
        circle.vy += frand(-1, 1);
        /*
                if(Math.abs(circle.vx) + Math.abs(circle.vy) < 1) {
                     circle.vx = (circle.vx < 0) ? -1 : 1
                     circle.vy = (circle.vy < 0) ? -1 : 1
                }
        */
        this.circles.push(circle);
        this.Boss.shoot();
    };
    Game.prototype.setScore = function (score) {
        $('#score').html(score);
        if (score > lS.getItem('maxScore')) {
            this.setMaxScore(score);
        }
        if (score) {
            this.totalEaten++;
            lS.setItem('totalEaten', String(this.totalEaten));
        }
    };
    Game.prototype.setBombs = function (bombs) {
        $('#bombs').html(bombs);
    };
    Game.prototype.setMaxScore = function (score) {
        lS.setItem('maxScore', score);
        $('#max-score').html(lS.getItem('maxScore'));
        $('#60maxScore-progress').html(score);
    };
    Game.prototype.eat = function (index) {
        var circle = this.circles[index];
        this.deleteItem(circle);
        this.circles.splice(index, 1); // ou encostam ou somem
        this.circleRadius = this.circleRadius + 1;
        this.circles.push(this.createCircle());
        this.Player.radius = this.Player.radius + 1;
        this.Player.score = this.Player.radius - 10;
        this.setScore(this.Player.score);
        if ((this.Player.score) == 50) {
            this.deleteAll();
            this.spawnBoss();
        }
    };
    Game.prototype.detectCollision = function () {
        for (var i = 0; i < this.circles.length; i++) {
            var circle = this.circles[i];
            var dist = Math.pow(Math.pow(circle.x - this.Player.x, 2) +
                Math.pow(circle.y - this.Player.y, 2), .5); //distancia
            if (dist < this.Player.radius + circle.radius) {
                if (circle.radius > this.Player.radius) {
                    this.death();
                }
                else {
                    this.eat(i);
                }
            }
        }
        if (this.Boss) {
            dist = Math.pow(Math.pow(this.Boss.x - this.Player.x, 2) +
                Math.pow(this.Boss.y - this.Player.y, 2), .5); //distancia
            if (dist < this.Player.radius + this.Boss.radius) {
                if (this.Boss.radius > this.Player.radius) {
                    this.death();
                }
            }
        }
    };
    Game.prototype.death = function () {
        var score = this.Player.radius - 10;
        if (score > 10) {
            var deathsAbove10 = +lS.getItem('deathsAbove10');
            lS.setItem('deathsAbove10', String(++deathsAbove10));
        }
        this.deleteAll();
        var dumb = clearInterval(this.interval);
        var dumb = clearInterval(this.bossInterval);
        var dumb = clearInterval(this.BossLiveInterval);
        var dumb = clearInterval(this.bossCounter);
        this.init(true);
    };
    Game.prototype.deleteAll = function () {
        for (var i = 0; i < this.circles.length; i++) {
            var circle = this.circles[i];
            this.deleteItem(circle);
        }
        this.circles = [];
    };
    Game.prototype.tick = function () {
        var now = (new Date()).getTime();
        window.elapsed = now - this.lastTime;
        this.lastTime = now;
        console.log(this.circles);
        for (var i = 0; i < this.circles.length; i++) {
            var circle = this.circles[i];
            this.deleteItem(circle);
            circle.move();
            this.draw(circle);
        }
        this.deleteItem(this.Boss);
        this.draw(this.Boss);
        this.deleteItem(this.Player);
        this.draw(this.Player);
        this.detectCollision();
    };
    Game.prototype.mouseMove = function (e) {
        console.log(this.Player);
        this.Player.rx = this.Player.x;
        this.Player.ry = this.Player.y;
        this.Player.x = e.clientX;
        this.Player.y = e.clientY - 40;
        this.deleteItem(this.Player);
        this.draw(this.Player);
    };
    Game.prototype.touchMove = function (e) {
        e.preventDefault();
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        this.mouseMove(touch);
    };
    Game.prototype.keyPress = function (e) {
        console.log(e.keyCode); //aperte B pra usar bomba
        if (e.keyCode == 98 && this.Player.bombsEnabled && this.Player.bombs) {
            this.useBomb();
        }
    };
    Game.prototype.setLocalStorage = function () {
        if (lS.getItem('totalEaten')) {
            this.totalEaten = lS.getItem('totalEaten');
        }
        if (lS.getItem('maxScore')) {
            this.maxScore = lS.getItem('maxScore');
        }
        if (lS.getItem('deathsAbove10')) {
            this.deathsAbove10 = lS.getItem('deathsAbove10');
        }
        if (lS.getItem('BossKilled')) {
            this.BossKilled = lS.getItem('BossKilled') | 0;
        }
    };
    Game.prototype.setAchievements = function () {
        $('#60maxScore-progress').html(String(this.maxScore));
        $('#1000score-progress').html(String(this.totalEaten));
        $('#100000score-progress').html(String(this.totalEaten));
        $('#200deaths-progress').html(String(this.deathsAbove10));
        $('#killFirstBoss-progress').html(String(this.BossKilled));
    };
    Game.prototype.checkAchievements = function () {
        this.setAchievements();
        if (lS.getItem('totalEaten') > 1000) {
            this.Achievements['1000score']();
        }
    };
    Game.colors = ['Blue', 'DeepSkyBlue', 'MediumSlateBlue', 'Aquamarine', 'Lime', 'Indigo', 'Red', 'DarkRed', 'Fuchsia', 'Magenta', 'Orange', 'OrangeRed', 'GreenYellow', 'Purple'];
    return Game;
})();
window.elapsed = window.elapsed || {};
var game = new Game();
game.init(false);

var socket = io();

var canvas = document.getElementById("ctx");
var ctx = canvas.getContext("2d");
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;
var canvasWidth = ctx.canvas.width;
var canvasHeight = ctx.canvas.height;

//sign
var signDiv = document.getElementById('signDiv');
var signDivUsername = document.getElementById('signDiv-username');
var signDivPlay = document.getElementById('signDiv-signIn');
//scoreboard
var ctxDiv = document.getElementById("ctx-div");
//shop
var storeButton = document.getElementById("shop-button");
var storeMenu = document.getElementById("shop-div-menu");
var sb1 = document.getElementById("shop-button1");
var sb2 = document.getElementById("shop-button2");
var sb3 = document.getElementById("shop-button3");
var sb4 = document.getElementById("shop-button4");
var sb5 = document.getElementById("shop-button5");
//Play Button
signDivPlay.onclick = function() {
    socket.emit('signIn', signDivUsername.value);
}
//Store Button
storeButton.onclick = function(){
		if(storeMenu.style.display == 'none'){
			storeMenu.style.display = 'block';
		}else{
			storeMenu.style.display = 'none';
		}
	}

socket.on('signInResponse', function(data) {
    if (data.success) {
        signDiv.style.display = 'none';
        gameDiv.style.display = 'inline-block';
    } else
        alert("Sign in unsuccessul.");
});
socket.on('signUpResponse', function(data) {
    if (data.success) {
        alert("Sign up successul.");
    } else
        alert("Sign up unsuccessul.");
});

//chat
var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');

socket.on('addToChat', function(data) {
    chatText.innerHTML += '<div>' + data + '</div>';
});
socket.on('evalAnswer', function(data) {
    console.log(data);
});


chatForm.onsubmit = function(e) {
    e.preventDefault();
    if (chatInput.value[0] === '/')
        socket.emit('evalServer', chatInput.value.slice(1));
    else
        socket.emit('sendMsgToServer', chatInput.value);
    chatInput.value = '';
}

//game
var Img = {};
Img.playerSprite = new Image();
Img.playerSprite.src = '/client/img/humanSprite.png';
Img.playerSprite2 = new Image();
Img.playerSprite2.src = '/client/img/zombieSprite.png';
Img.bullet = new Image();
Img.bullet.src = '/client/img/bullet.png';
Img.obj = new Image();
Img.obj.src = '/client/img/obj.png';
Img.map = {};
Img.map.floor = new Image();
Img.map.floor.src = '/client/img/floor.png';
Img.map.walls = new Image();
Img.map.walls.src = '/client/img/walls.png';

function Entity() {
    this.init = function(initPack, imgParam) {
        this.id = initPack.id;
        this.x = initPack.x;
        this.y = initPack.y;
        this.width = imgParam.width / 2;
        this.height = imgParam.height / 2;

    }

    this.drawSelf = function() {}
    this.drawAttributes = function() {}

    this.update = function() {
        this.relativeX = this.x - Player.list[selfId].x + canvasWidth / 2;
        this.relativeY = this.y - Player.list[selfId].y + canvasHeight / 2;
    }

    this.draw = function(part) {
        if (part == 'self'){
            this.drawSelf();
        }else if (part == 'attributes')
            this.drawAttributes();
    }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////
var Player = function(initPack) {
    var self = new Entity();
    self.init(initPack, Img.playerSprite);
    self.number = initPack.number;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.score = initPack.score;
    self.mouseAngle = initPack.mouseAngle;
    self.animCounter = initPack.animCounter;
    self.isZombie = initPack.isZombie;
    self.name = initPack.name;
    self.skins = initPack.skins;

    ///////////////sprite///////////////////
    self.spriteW = Img.playerSprite.width / 4;
    self.spriteH = Img.playerSprite.height / 4;

    self.drawSelf = function() {
        //gets mouse angel and makes it positive if negative
        var mouseAngle = self.mouseAngle;
        if (mouseAngle < 0)
            mouseAngle += 360;
        ///sets directionMod depending on angle
        var directionMod = 0; //down
        if (mouseAngle >= 135 && mouseAngle < 225) //left
            directionMod = 1;
        else if (mouseAngle >= 225 && mouseAngle < 315) //up
            directionMod = 3;
        else if (mouseAngle >= 315 || mouseAngle < 45) //right
            directionMod = 2;
        ///sets moveMod depending on how long moving
        var moveMod = Math.floor(self.animCounter) % 4;
        //picks the sprite from sheet based on directionMod and moveMod
        if(self.isZombie)
			var imgPicker = Img.playerSprite2;
		else if(!self.isZombie && self.skins == "reg")
			var imgPicker = Img.playerSprite;
		else if(!self.isZombie && self.skins == "boughtHarambe")
			var imgPicker = Img.harambeSprite;
		else
			var imgPicker = Img.playerSprite;
		ctx.drawImage(imgPicker, moveMod * self.spriteW, directionMod * self.spriteH, self.spriteW, self.spriteH, self.relativeX - self.width / 2, self.relativeY - self.height / 2, self.width, self.height);
    }

    self.drawAttributes = function() {
        //draw health bar
        var hpWidth = 30 * self.hp / self.hpMax;
        ctx.fillStyle = 'green';
        ctx.fillRect(self.relativeX - hpWidth / 2, self.relativeY - 40, hpWidth, 4);
    }

    Player.list[self.id] = self;


    return self;
}
Player.list = {};
////////////////////////////////////////////////////////////////////////////////

var Bullet = function(initPack) {
    var self = new Entity();
    self.init(initPack, Img.bullet);
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.drawSelf = function() {
			var width = Img.bullet.width/2;
			var height = Img.bullet.height/2;
			
			var x = self.x - Player.list[selfId].x + canvasWidth/2;
			var y = self.y - Player.list[selfId].y + canvasHeight/2;
			
			ctx.drawImage(Img.bullet,
				0,0,Img.bullet.width,Img.bullet.height,
				x-width/2,y-height/2,width,height);
    }

    Bullet.list[self.id] = self;
    return self;
}
Bullet.list = {};
////////////////////////////////////////////////////////////////////////////////
var Objective = function(initPack) {
    var self = new Entity();
    self.init(initPack, Img.obj);
    self.x = initPack.x;
    self.y = initPack.y;
    self.drawSelf = function() {
        console.log("like to get: " + self.x + " " + self.y);
        ctx.drawImage(Img.obj, 0, 0, Img.obj.width, Img.obj.height, 1024 - self.width / 2, 1024 - self.height / 2, self.width, self.height);
    }

    Objective.list[self.id] = self;
    return self;
}
Objective.list = {};




var selfId = null;

socket.on('init', function(data) {
    if (data.selfId)
        selfId = data.selfId;
    for (var i = 0; i < data.player.length; i++) {
        new Player(data.player[i]);
    }
    for (var i = 0; i < data.bullet.length; i++) {
        new Bullet(data.bullet[i]);
    }
    for (var i = 0; i < data.obj.length; i++) {
        new Objective(data.obj[i]);
    }
});

socket.on('update', function(data) {
    for (var i = 0; i < data.player.length; i++) {
        var pack = data.player[i];
        var p = Player.list[pack.id];
        if (p) {
            if (pack.x !== undefined)
                p.x = pack.x;
            if (pack.y !== undefined)
                p.y = pack.y;
            if (pack.hp !== undefined)
                p.hp = pack.hp;
            if (pack.score !== undefined)
                p.score = pack.score;
            ///////////////////////////////////////////////////////////////////////////////
            if (pack.mouseAngle !== undefined)
                p.mouseAngle = pack.mouseAngle;
            ////////////////////////////////////////////////////////////////////////////////
            if (pack.animCounter !== undefined)
                p.animCounter = pack.animCounter;
            if (pack.isZombie !== undefined)
                p.isZombie = pack.isZombie;
            if(pack.skins !== undefined)
				p.skins = pack.skins;
			if (pack.underWallLayer !== undefined)
                p.underWallLayer = pack.underWallLayer;
        }
    }
    for (var i = 0; i < data.bullet.length; i++) {
        var pack = data.bullet[i];
        var pack2 = data.obj[i];
        var b = Bullet.list[data.bullet[i].id];
        var o = Objective.list[data.bullet[i].id];
        if (b) {
            if (pack.x !== undefined)
                b.x = pack.x;
            if (pack.y !== undefined)
                b.y = pack.y;
        }
        if (o) {
            if (pack.x !== undefined)
                o.x = pack.x;
            if (pack.y !== undefined)
                o.y = pack.y;
        }
    }
});

socket.on('remove', function(data) {
    //{player:[12323],bullet:[12323,123123]}
    for (var i = 0; i < data.player.length; i++) {
        delete Player.list[data.player[i]];
    }
    for (var i = 0; i < data.bullet.length; i++) {
        delete Bullet.list[data.bullet[i]];
    }
    for (var i = 0; i < data.obj.length; i++) {
        delete Objective.list[data.obj[i]];
    }
});

/////////////////////////listens for time and round data from server
var time = 0;
var displayEnd = false;
var roundStarted = false;
var roundStarted = false;
socket.on('roundInfo', function(data) {
    time = data.timer;
    roundStarted = data.roundStarter;
    displayEnd = data.displayEnder;
});

setInterval(function() {
    if (!selfId)
        return;
    update();
    draw();
}, 40);

function update() {
    for (var i in Player.list)
        Player.list[i].update();
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawMap('floor');

    for (var i in Player.list) {
        if (!Player.list[i].underWallLayer) {
            Player.list[i].draw("self");
        }
    }
    drawMap('walls');
    drawScore();
    drawTime();
    for (var i in Player.list) {
        if (Player.list[i].underWallLayer) {
            Player.list[i].draw("self");
        }
    }
    for (var i in Player.list)
        Player.list[i].draw("attributes")
    for (var i in Objective.list)
        Objective.list[i].drawSelf();
    for (var i in Bullet.list)
        Bullet.list[i].drawSelf();
}

var roundPharse;
var drawTime = function(){
	if(!roundStarted && !displayEnd){
		roundPharse = 'Round starts in ' + (15 - time);
	}else if(roundStarted && !displayEnd){
		roundPharse = 'Round ends in ' + (60 - time);
	}else{
		roundPharse = 'Review Scores! ' + (10 - time);
	}
	
	if(!displayEnd){
		if(ctxDiv.style.display == 'block'){
		ctxDiv.style.display = 'none';
		}
	}else{
		if(ctxDiv.style.display == 'none'){
		var scoresAndNames = "Scores: " + '<br>';
			for(var i in Player.list){
				scoresAndNames+= Player.list[i].name +': '+ Player.list[i].score + '<br>';
				//ctxDiv.innerHTML += '<br>';
			}
		ctxDiv.innerHTML = '<span style="font-size:40px; text-align:center;">' + scoresAndNames + '</span>';
		ctxDiv.style.display = 'block';
		}
	}
	ctx.font = '20px Arial';
	ctx.fillStyle = 'green';
	ctx.fillText(roundPharse,200,30);
}

var drawMap = function(part) {
    var player = Player.list[selfId];
    var x = canvasWidth / 2 - player.x;
    var y = canvasHeight / 2 - player.y;
    var map = Img.map[part];
    ctx.drawImage(map, 0, 0, map.width, map.height, x, y, map.width, map.height);
}

var drawScore = function() {
        ctx.font = '30px Arial';
        ctx.fillStyle = 'green';
        ctx.fillText(Player.list[selfId].score, 0, 30);
    }

sb1.onclick = function(){
	if(Player.list[selfId].score >= 10){
		socket.emit('updateScore', Player.list[selfId].score-10);
		socket.emit('boughtHarambe', "boughtHarambe");
	}
}

document.onkeydown = function(event) {
    if (event.keyCode === 68) //d
        socket.emit('keyPress', { inputId: 'right', state: true });
    else if (event.keyCode === 83) //s
        socket.emit('keyPress', { inputId: 'down', state: true });
    else if (event.keyCode === 65) //a
        socket.emit('keyPress', { inputId: 'left', state: true });
    else if (event.keyCode === 87) // w
        socket.emit('keyPress', { inputId: 'up', state: true });

}
document.onkeyup = function(event) {
    if (event.keyCode === 68) //d
        socket.emit('keyPress', { inputId: 'right', state: false });
    else if (event.keyCode === 83) //s
        socket.emit('keyPress', { inputId: 'down', state: false });
    else if (event.keyCode === 65) //a
        socket.emit('keyPress', { inputId: 'left', state: false });
    else if (event.keyCode === 87) // w
        socket.emit('keyPress', { inputId: 'up', state: false });
}

document.onmousedown = function(event) {
    socket.emit('keyPress', { inputId: 'attack', state: true });
}
document.onmouseup = function(event) {
    socket.emit('keyPress', { inputId: 'attack', state: false });
}
document.onmousemove = function(event) {
    var x = -1 * (canvasWidth/2) + event.clientX - 8;
    var y = -1 * (canvasHeight/2) + event.clientY - 8;
    var angle = Math.atan2(y, x) / Math.PI * 180;
    socket.emit('keyPress', { inputId: 'mouseAngle', state: angle });
}
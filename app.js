//var db = null;//mongojs('localhost:27017/myGame', ['account','progress']);

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

var SOCKET_LIST = {};
////////////Player img width and height
var PimgW = 96.6666666667;
var PimgH = 94.75;
var Entity = function(param){
	////////detects if there is a collision with any player and only spawns when there is no collision
	var self = {collision:false,}
	do{
		self.collision = false;
		var spawnX = ((640*2-100) - 100 + 1) * Math.random() + 100;
		var spawnY = ((480*2-100) - 100 + 1) * Math.random() + 100;
		for(var i in Player.list){
			var p = Player.list[i];
			if(spawnX - PimgW < p.x + PimgW && spawnX + PimgW > p.x - PimgW && spawnY - PimgH < p.y + PimgH && spawnY + PimgH > p.y - PimgH&& Player.list[self.id] != Player.list[i]){
				self.collision = true;
			}
		}
	}while(self.collision);
	////////////declares all the self variables for all entities
	var self = {
		//randomly generated spawn
		x:spawnX,
		y:spawnY,
		spdX:0,
		spdY:0,
		id:"",
		map:'forest',
	}
	if(param){
		if(param.x)
			self.x = param.x;
		if(param.y)
			self.y = param.y;
		if(param.map)
			self.map = param.map;
		if(param.id)
			self.id = param.id;		
	}
	
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
		
	}
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	}
	///////checks collision between all players
	self.checkForCollision = function(x,y){
		if(!x && !y){
			for(var i in Player.list){
				var p = Player.list[i];
				if(self.x - PimgW < p.x + PimgW && self.x + PimgW > p.x - PimgW && self.y - PimgH < p.y + PimgH && self.y + PimgH > p.y - PimgH&& Player.list[self.id] != Player.list[i]){
					console.log('collison detected');
					self.collision = true;
				}
			}
		}else{
			for(var i in Player.list){
				var p = Player.list[i];
				if(x - PimgW < p.x + PimgW && x + PimgW > p.x - PimgW && y - PimgH < p.y + PimgH && y + PimgH > p.y - PimgH&& Player.list[self.id] != Player.list[i]){
					console.log('collison detected');
					if(p.isZombie || self.isZombie){
						p.isZombie = true;
						self.isZombie = true;
					}
					return true;
				}
			}
		}
	}
	return self;
}

var Player = function(param){
	var self = Entity(param);
	self.number = "" + Math.floor(10 * Math.random());
	self.pressingRight = false;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.maxSpd = 10;
	self.hp = 10;
	self.hpMax = 10;
	self.score = 0;
	self.animCounter = 1;//1 is the starting frame for this sprite//0 and 2
	self.isZombie = roundStarted;
	
	self.updatePosition = function(){
		/*
		if(self.x < 0){
			self.x+=10;
			
		}else if(self.x > 640*2-12){
			self.x-=10;
		}
		if(self.y < 0){
			self.y+=10;
			
		}else if(self.y > 480*2-14){
			self.y-=10;
		}
		*/
		self.x += self.spdX;
		self.y += self.spdY;
		
	}
	
	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		
		super_update();
		//shots if mouse if pressed and round has started
		if(self.pressingAttack && roundStarted == true && !self.isZombie){
			self.shootBullet(self.mouseAngle);
		}
	}
	self.shootBullet = function(angle){
		Bullet({
			parent:self.id,
			angle:angle,
			x:self.x,
			y:self.y,
			map:self.map,
		});
	}
	
	self.updateSpd = function(){
		if(self.pressingRight && self.pressingLeft)
			self.spdX = 0;
		else if(self.pressingRight && self.x < 640*2-PimgW && !self.checkForCollision(self.x+self.maxSpd,self.y))
			self.spdX = self.maxSpd;
		else if(self.pressingLeft && self.x > PimgW && !self.checkForCollision(self.x-self.maxSpd,self.y))
			self.spdX = -self.maxSpd;
		else
			self.spdX = 0;
		
		if(self.pressingUp && self.pressingDown)
			self.spdY = 0;
		else if(self.pressingUp && self.y > PimgH && !self.checkForCollision(self.x,self.y-self.maxSpd))
			self.spdY = -self.maxSpd;
		else if(self.pressingDown && self.y < 480*2-PimgH && !self.checkForCollision(self.x,self.y+self.maxSpd))
			self.spdY = self.maxSpd;
		else
			self.spdY = 0;
		//counters movement and sets animCounter = to it 
		if(self.spdY != 0 || self.spdX != 0)
			self.animCounter+= 0.2;
			if(self.animCounter>3)
				self.animCounter = 0;
		
	}
	
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,	
			number:self.number,	
			hp:self.hp,
			hpMax:self.hpMax,
			score:self.score,
			map:self.map,
			mouseAngle:self.mouseAngle,
			animCounter:self.animCounter,
			isZombie:self.isZombie,
		};		
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			score:self.score,
			/////////sending mouse angle//////////////////////////////////////////////////////////////////////////////////////////////
			mouseAngle:self.mouseAngle,
			//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			animCounter:self.animCounter,
			isZombie:self.isZombie,
		}	
	}
	
	Player.list[self.id] = self;
	
	initPack.player.push(self.getInitPack());
	return self;
}
Player.list = {};
Player.onConnect = function(socket){
	var map = 'forest';
	var player = Player({
		id:socket.id,
		map:map,
	});
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
	});
	
	socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
	})
}
Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
}
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());		
	}
	return pack;
}


var Bullet = function(param){
	var self = Entity(param);
	self.id = Math.random();
	self.angle = param.angle;
	self.spdX = Math.cos(param.angle/180*Math.PI) * 10;
	self.spdY = Math.sin(param.angle/180*Math.PI) * 10;
	self.parent = param.parent;
	
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > 100)
			self.toRemove = true;
		super_update();
		
		for(var i in Player.list){
			var p = Player.list[i];
			if(self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id && p.isZombie){
				p.hp -= 1;
								
				if(p.hp <= 0){
					var shooter = Player.list[self.parent];
					if(shooter)
						shooter.score += 1;
					p.hp = p.hpMax;
					//randomly generated respawn and checks for respawn collision
					do{
						p.collision = false;
						p.x = ((640*2-100) - 100 + 1) * Math.random() + 100;
						p.y = ((480*2-100) - 100 + 1) * Math.random() + 100;
						p.checkForCollision();
					}while(p.collision);
				}
				self.toRemove = true;
			}
		}
	}
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			map:self.map,
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,		
		};
	}
	
	Bullet.list[self.id] = self;
	initPack.bullet.push(self.getInitPack());
	return self;
}
Bullet.list = {};

Bullet.update = function(){
	var pack = [];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.update();
		if(bullet.toRemove){
			delete Bullet.list[i];
			removePack.bullet.push(bullet.id);
		} else
			pack.push(bullet.getUpdatePack());		
	}
	return pack;
}

Bullet.getAllInitPack = function(){
	var bullets = [];
	for(var i in Bullet.list)
		bullets.push(Bullet.list[i].getInitPack());
	return bullets;
}

var DEBUG = true;
var counter = 0;
var NAMES_LIST = [];
var DISCONECTED_LIST = [];
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = counter+1;
	SOCKET_LIST[socket.id] = socket;
	
	socket.on('signIn',function(data){
		NAMES_LIST[socket.id] = data;
		counter++;
		Player.onConnect(socket);
		socket.emit('signInResponse',{success:true});
		
	});
	
	
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		delete NAMES_LIST[socket.id];
		DISCONECTED_LIST.push(socket.id);
		Player.onDisconnect(socket);
	});
	socket.on('sendMsgToServer',function(data){
		var playerName = NAMES_LIST[socket.id];
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat', playerName +': ' + data);
		}
	});
	
	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);		
	});
	
	
	
});

var initPack = {player:[],bullet:[]};
var removePack = {player:[],bullet:[]};
///////////////Time
var partTime = 0;
var time = 0;
var running = true;
//////////////Round
var roundStarted = false;
var allZombies = false;
function gameTimer(){
	partTime++;
	if(partTime % 25 == 0){
		partTime = 0;
		time++;
		console.log(time);
		if(time >= 30 && !roundStarted){
			resetTime();
			if(NAMES_LIST.length >= 1)
			pickZombie();
		}else if(time >= 60 && roundStarted){
			resetTime();
			if(NAMES_LIST.length >= 1)
				resetZombie();
		}else if(roundStarted){
			allZombies = true;
				for(var i in Player.list){
					var p = Player.list[i];
					if(!p.isZombie)
						allZombies = false;
				}
			if(allZombies){
				resetZombie();
				resetTime();
			}
		}
	}
	
}

function resetTime(){
	time = 0;
	roundStarted = !roundStarted;
}
function isPlayerOffline(num){
	for(var i in DISCONECTED_LIST){
		if(num == DISCONECTED_LIST[i])
			return true;
	}
	return false;
}

function pickZombie(){
	var zNum;
		do{
			zNum = Math.floor((counter)*Math.random()) + 1;
		}while(isPlayerOffline(zNum));
	console.log(NAMES_LIST[zNum] + " is a zombie");
	Player.list[zNum].isZombie = true;
}

function resetZombie(){
	for(var i in Player.list){
		var p = Player.list[i];
		p.isZombie = false;
	}
	allZombies = false;
}

setInterval(function(){
	gameTimer();
	
	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
	}
	
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',initPack);
		socket.emit('update',pack);
		socket.emit('remove',removePack);
		socket.emit('time',time);
		socket.emit('roundInfo',{timer:time,roundStarter:roundStarted});
	}
	initPack.player = [];
	initPack.bullet = [];
	removePack.player = [];
	removePack.bullet = [];
	
	
},1000/25);






var socket = io();

var canvas = document.getElementById("ctx");
var canvasUi = document.getElementById("ctx-ui");
var ctx = canvas.getContext("2d");
var ctxUi = canvasUi.getContext("2d");
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;
var canvasWidth = ctx.canvas.width;
var canvasHeight = ctx.canvas.height;

//sign
var signDiv = document.getElementById('signDiv');
var signDivUsername = document.getElementById('signDiv-username');
var signDivPlay = document.getElementById('signDiv-signIn');

signDivPlay.onclick = function() {
    socket.emit('signIn', signDivUsername.value);
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
Img.map = {};
Img.map = new Image();
Img.map.src = '/client/img/map.png';


socket.emit('PlayerImgInfo', { 'height': Img.playerSprite.height / 4, 'width': Img.playerSprite.width / 3 });

var Player = function(initPack) {
    var self = {};
    self.id = initPack.id;
    self.number = initPack.number;
    self.x = initPack.x;
    self.y = initPack.y;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.score = initPack.score;
    self.map = initPack.map;
    self.mouseAngle = initPack.mouseAngle;
    self.animCounter = initPack.animCounter;
    self.isZombie = initPack.isZombie;

    self.draw = function() {
        if (Player.list[selfId].map !== self.map)
            return;
        var x = self.x - Player.list[selfId].x + canvasWidth / 2;
        var y = self.y - Player.list[selfId].y + canvasHeight / 2;

        var hpWidth = 30 * self.hp / self.hpMax;
        ctx.fillStyle = 'green';
        ctx.fillRect(x - hpWidth / 2, y - 40, hpWidth, 4);
        ///////////////player width and height///
        var width = Img.playerSprite.width / 4 * 2;
        var height = Img.playerSprite.height / 4 * 2;
        ///////////////sprite///////////////////
        var spriteW = Img.playerSprite.width / 4;
        var spriteH = Img.playerSprite.height / 4;
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
        if (self.isZombie)
            var imgPicker = Img.playerSprite2;
        else
            var imgPicker = Img.playerSprite;
        ctx.drawImage(imgPicker, moveMod * spriteW, directionMod * spriteH, spriteW, spriteH, x - width / 2, y - height / 2, width, height);
    }

    Player.list[self.id] = self;


    return self;
}
Player.list = {};


var Bullet = function(initPack) {
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.map = initPack.map;

    self.draw = function() {
        if (Player.list[selfId].map !== self.map)
            return;
        var width = Img.bullet.width / 2;
        var height = Img.bullet.height / 2;

        var x = self.x - Player.list[selfId].x + canvasWidth / 2;
        var y = self.y - Player.list[selfId].y + canvasHeight / 2;

        ctx.drawImage(Img.bullet,
            0, 0, Img.bullet.width, Img.bullet.height,
            x - width / 2, y - height / 2, width, height);
    }

    Bullet.list[self.id] = self;
    return self;
}
Bullet.list = {};

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
        }
    }
    for (var i = 0; i < data.bullet.length; i++) {
        var pack = data.bullet[i];
        var b = Bullet.list[data.bullet[i].id];
        if (b) {
            if (pack.x !== undefined)
                b.x = pack.x;
            if (pack.y !== undefined)
                b.y = pack.y;
        }
    }
    console.log(data.bullet.length);
});

socket.on('remove', function(data) {
    //{player:[12323],bullet:[12323,123123]}
    for (var i = 0; i < data.player.length; i++) {
        delete Player.list[data.player[i]];
    }
    for (var i = 0; i < data.bullet.length; i++) {
        delete Bullet.list[data.bullet[i]];
    }
});
/////////////////////////listens for time and round data from server
var time = 0;
var roundStarted = false;
socket.on('roundInfo', function(data) {
    time = data.timer;
    roundStarted = data.roundStarter;
});

setInterval(function() {
    if (!selfId)
        return;
    ctx.clearRect(0, 0, 500, 500);
    drawMap();
    drawScore();
    drawTime();
    for (var i in Player.list)
        Player.list[i].draw();
    for (var i in Bullet.list)
        Bullet.list[i].draw();
}, 40);

var roundPharse;
var drawTime = function() {
    if (!roundStarted) {
        roundPharse = 'Round starts in ' + (30 - time);
    } else {
        roundPharse = 'Round ends in ' + (60 - time);
    }
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(roundPharse, 200, 30);
}

var drawMap = function() {
    var player = Player.list[selfId];
    var x = canvasWidth / 2 - player.x;
    var y = canvasHeight / 2 - player.y;
    ctx.fillStyle = 'white';
    ctx.fillRect(-200, -200, Img.map.width + 200, Img.map.height + 200);
    ctx.drawImage(Img.map, 0, 0, Img.map.width, Img.map.height, x, y, Img.map.width, Img.map.height);
}

var drawScore = function() {
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(Player.list[selfId].score, 0, 30);
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
    var x = -250 + event.clientX - 8;
    var y = -250 + event.clientY - 8;
    var angle = Math.atan2(y, x) / Math.PI * 180;
    socket.emit('keyPress', { inputId: 'mouseAngle', state: angle });
}
var pressed = [];
var stdTime;
var cam;
var connection;
var compass;
var gps;
var socket;

function init()
{
	stdTime = 500;
	
	connection = false;
	
	cam = false;
	compass = false;
	gps = false;
	
	pressed["W"] = false;
	pressed["A"] = false;
	pressed["S"] = false;
	pressed["D"] = false;
	
	pressed[   "UP"] = false;
	pressed[ "LEFT"] = false;
	pressed[ "DOWN"] = false;
	pressed["RIGHT"] = false;
	
	pressed["STOP"] = false;
	
	pressed["Q"] = false;
	pressed["E"] = false;
	
	pressed[ "PLUS"] = false;
	pressed["MINUS"] = false;
	
	pressed["CAM"] = false;
}

function connect(address)
{
	socket = new WebSocket("ws://" + address);
	
	socket.onopen = function(e) {onSockOpen(e);}
	socket.onclose = function(e) {onSockClose(e);}
	socket.onmessage = function(e) {onSockMsg(e);}
	socket.onerror = function(e) {onSockErr(e);}
}

function disconnect()
{
	socket.close(1000);
}

function onSockOpen(e)
{
	console.log("Connected");
	connection = true;
	visualize();
}

function onSockClose(e)
{
	console.log("Disconnected");
	connection = false;
	visualize();
}

function onSockMsg(e)
{
	console.log("Received: " + e.data);
}

function onSockErr(e)
{
	console.log("Error: " + e.data);
}

function sendCmd(cmd)
{
	console.log("Sent: " + cmd);
	socket.send(cmd);
}

function move(x, y, time = stdTime)
{
	sendCmd("move " + x + " " + y + " " + time);
}

function changeSpeed(val)
{
	sendCmd("speed mod " + val);
}

function toggleCam()
{
	cam = !cam;
}

function handleKeys()
{
	// SPECIAL ACTIONS
	
	var camera   = pressed[  "CAM"]                 || false;
	var plus     = pressed[ "PLUS"] || pressed["E"] || false;
	var minus    = pressed["MINUS"] || pressed["Q"] || false;
	
	if(camera) toggleCam();
	
	if     ( plus && !minus) changeSpeed( 0.1);
	else if(!plus &&  minus) changeSpeed(-0.1);
	
	// MOVEMENT
	
	var forward  = pressed["W"] || pressed[   "UP"] || false;
	var backward = pressed["S"] || pressed[ "DOWN"] || false;
	var left     = pressed["A"] || pressed[ "LEFT"] || false;
	var right    = pressed["D"] || pressed["RIGHT"] || false;
	var stop     =                 pressed[ "STOP"] || false;
	
	var f = forward;
	var b = backward;
	var l = left;
	var r = right;
	var s = stop;
	
	if(s)                         move(0, 0);
	else if(l && r)               move(0, 0);
	else if(f && b)               move(0, 0);
	else if(!f && !b && !l && !r) move(0, 0);
	
	else if(!f && !b && !l &&  r) move( 0, -1);
	else if(!f && !b &&  l && !r) move( 0,  1);
	else if(!f &&  b && !l && !r) move(-1,  0);
	else if(!f &&  b && !l &&  r) move(-1, -1);
	else if(!f &&  b &&  l && !r) move(-1,  1);
	else if( f && !b && !l && !r) move( 1,  0);
	else if( f && !b && !l &&  r) move( 1, -1);
	else if( f && !b &&  l && !r) move( 1,  1);
}

function visualize()
{
	var plus     = pressed[ "PLUS"] || pressed["E"] || false;
	var minus    = pressed["MINUS"] || pressed["Q"] || false;
	
	var up       = pressed["W"] || pressed[   "UP"] || false;
	var down     = pressed["S"] || pressed[ "DOWN"] || false;
	var left     = pressed["A"] || pressed[ "LEFT"] || false;
	var right    = pressed["D"] || pressed["RIGHT"] || false;
	var stop     =                 pressed[ "STOP"] || false;
	
	if(up) $(".btn.marco-up").removeClass("btn-default").addClass("btn-info");
	else   $(".btn.marco-up").removeClass("btn-info").addClass("btn-default");
	
	if(down) $(".btn.marco-down").removeClass("btn-default").addClass("btn-info");
	else     $(".btn.marco-down").removeClass("btn-info").addClass("btn-default");
	
	if(left) $(".btn.marco-left").removeClass("btn-default").addClass("btn-info");
	else     $(".btn.marco-left").removeClass("btn-info").addClass("btn-default");
	
	if(right) $(".btn.marco-right").removeClass("btn-default").addClass("btn-info");
	else      $(".btn.marco-right").removeClass("btn-info").addClass("btn-default");
	
	if(plus) $(".btn.marco-plus").removeClass("btn-default").addClass("btn-info");
	else     $(".btn.marco-plus").removeClass("btn-info").addClass("btn-default");
	
	if(minus) $(".btn.marco-minus").removeClass("btn-default").addClass("btn-info");
	else      $(".btn.marco-minus").removeClass("btn-info").addClass("btn-default");
	
	if(stop) $(".label.marco-brake").removeClass("label-danger").addClass("label-success");
	else      $(".label.marco-brake").removeClass("label-success").addClass("label-danger");
	
	if(cam)    $(".label.marco-cam").removeClass("label-danger").addClass("label-success");
	else       $(".label.marco-cam").removeClass("label-success").addClass("label-danger");
	
	if(connection)
	{
		$(".label.marco-connection").removeClass("label-danger").addClass("label-success");
		$(".connectionForm").hide();
		$(".cmdForm").show();
	}
	else
	{
		$(".label.marco-connection").removeClass("label-success").addClass("label-danger");
		$(".connectionForm").show();
		$(".cmdForm").hide();
	}
}

$(document).ready(function()
{
	init();
	
	$(".cmdForm").submit(function(e)
	{
		// TODO PreventDefault
		e.preventDefault();
		
		var field = $("#cmdInput");
		
		if(field.val() == "disconnect")
		{
			disconnect();
		}
		else
		{
			sendCmd(field.val());
		}
		
		field.val("");
	})
	
	$(".connectionForm").submit(function(e)
	{
		// TODO PreventDefault
		e.preventDefault();
		
		connect($("#addressInput").val());
	})
	
	$(".cmdForm").hide();
	
	console.log("Ready");
});

$(document).keydown(function(e)
{
	if($("#cmdInput").is(":focus") || $("#addressInput").is(":focus"))
	{
		return;
	}
	
	e = e || window.event;
	
	var flag = true;
	
	if     (e.keyCode == "W".charCodeAt(0)) pressed["W"] = true;
	else if(e.keyCode == "A".charCodeAt(0)) pressed["A"] = true;
	else if(e.keyCode == "S".charCodeAt(0)) pressed["S"] = true;
	else if(e.keyCode == "D".charCodeAt(0)) pressed["D"] = true;
	
	else if(e.keyCode == 38) pressed[   "UP"] = true;
	else if(e.keyCode == 37) pressed[ "LEFT"] = true;
	else if(e.keyCode == 40) pressed[ "DOWN"] = true;
	else if(e.keyCode == 39) pressed["RIGHT"] = true;
	
	else if(e.keyCode == 32) pressed["STOP"] = true;
	
	else if(e.keyCode == "Q".charCodeAt(0)) pressed["Q"] = true;
	else if(e.keyCode == "E".charCodeAt(0)) pressed["E"] = true;
	
	else if(e.keyCode == 107) pressed[ "PLUS"] = true;
	else if(e.keyCode == 109) pressed["MINUS"] = true;
	
	else if(e.keyCode == "C".charCodeAt(0)) pressed["CAM"] = true;
	
	else flag = false;
	
	if(flag)
	{
		e.preventDefault();
	}
	
	if(!connection)
	{
		return;
	}
	
	handleKeys();
	visualize();
});

$(document).keyup(function(e)
{
	if($("#cmdInput").is(":focus") || $("#addressInput").is(":focus"))
	{
		return;
	}
	
	e = e || window.event;
	
	var flag = true;
	
	if     (e.keyCode == "W".charCodeAt(0)) pressed["W"] = false;
	else if(e.keyCode == "A".charCodeAt(0)) pressed["A"] = false;
	else if(e.keyCode == "S".charCodeAt(0)) pressed["S"] = false;
	else if(e.keyCode == "D".charCodeAt(0)) pressed["D"] = false;
	
	else if(e.keyCode == 38) pressed[   "UP"] = false;
	else if(e.keyCode == 37) pressed[ "LEFT"] = false;
	else if(e.keyCode == 40) pressed[ "DOWN"] = false;
	else if(e.keyCode == 39) pressed["RIGHT"] = false;
	
	else if(e.keyCode == 32) pressed["STOP"] = false;
	
	else if(e.keyCode == "Q".charCodeAt(0)) pressed["Q"] = false;
	else if(e.keyCode == "E".charCodeAt(0)) pressed["E"] = false;
	
	else if(e.keyCode == 107) pressed[ "PLUS"] = false;
	else if(e.keyCode == 109) pressed["MINUS"] = false;
	
	else if(e.keyCode == "C".charCodeAt(0)) pressed["CAM"] = false;
	
	else flag = false;
	
	if(flag)
	{
		e.preventDefault();
	}
	
	if(!connection)
	{
		return;
	}
	
	handleKeys();
	visualize();
});

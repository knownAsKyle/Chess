var Chester = Chester || {};
/*
	LOCAL STATE TRACKER
*/
(function(c) {
	c.state = {};
	c.state.firstLoad = true;
	c.state.makeNewBoard = false;
	c.state.selectedPiece = null;
	c.state.selectedPieceId = null;
	return c;
})(Chester);
/*
	CONSTANTS
*/
(function(c) {
	c.consts = {};
	c.consts.fbRef = "https://quicktest1.firebaseio.com/chess";
	c.consts.pieces = {};
	c.consts.pieces.tower = "tower";
	c.consts.pieces.knight = "knight";
	c.consts.pieces.bishop = "bishop";
	c.consts.pieces.queen = "queen";
	c.consts.pieces.king = "king";
	c.consts.pieces.pawn = "pawn";
	return c;
})(Chester);
/*
	DB (Firebase) Interactions
*/

(function(c) {
	c.db = {};
	c.db.ref = new Firebase(c.consts.fbRef);

	return c;
})(Chester);
/*
	ELEMENTS
*/
(function(c) {
	c.ele = {};
	c.ele.board = document.getElementById("board");

	return c;
})(Chester);

/*
	Movement Handler
*/

(function(c) {
	c.move = {};
	c.move.handleSquareClick = handleSquareClick

	function handleSquareClick(e) {
		if ($(this).children("span").length > 0) {
			if (!c.state.selectedPiece) {
				c.state.selectedPiece = $(this).children("span").detach();
				c.state.selectedPieceId = $(this).attr("id");
			} else {
				//captured.push($(this).children("span").detach())
				$(this).append(c.state.selectedPiece)
				c.db.ref.child("boardState").child(c.state.selectedPieceId).remove()
				updateRemoteBoardState(c.state.selectedPiece[0], $(this).attr("id"))
				c.state.selectedPiece = null;
				c.state.selectedPieceId = null;
			}
		} else {
			if (c.state.selectedPiece) {
				$(this).append(c.state.selectedPiece)
				c.db.ref.child("boardState").child(c.state.selectedPieceId).remove();
				updateRemoteBoardState(c.state.selectedPiece[0], $(this).attr("id"))
				c.state.selectedPiece = null;
				c.state.selectedPieceId = null;
			}
		}
	}

	function updateRemoteBoardState(selectedPiece, id) {

		var name = getPieceName(selectedPiece);
		var color = selectedPiece.classList[2];
		c.db.ref.child("boardState").child(id).set({
			name: name,
			color: color
		})
	}

	function getPieceName(piece) {
		var startPos = piece.className.indexOf("con-") + 4;
		var newString = piece.className.substring(startPos);
		var endPos = newString.indexOf(" ");
		newString = newString.substring(0, endPos);
		return newString;
	}
})(Chester);

/*
	EVENTS
*/
(function(c) {
	c.events = {};
	// c.db.ref.once("value", function(snap) {
	// 	handleDBAction(snap.val());
	// });

	function handleDBAction(val) {
		val = val || {};
		c.board.makeNew(val.boardState)
			//c.state.firstLoad = false;

		/*pOne.ele.firstElementChild.innerText = (p1 && p1.userInfo) ? p1.userInfo.name : "Player 1";
		pTwo.ele.firstElementChild.innerText = (p2 && p2.userInfo) ? p2.userInfo.name : "Player 2";
		*/
	}

	c.db.ref.child("boardState").on("value", function(snap) {

		c.board.update(snap.val());
	});

	$('.board').on("click", ".square", c.move.handleSquareClick);
	var reset = document.getElementById("reset");
	reset.addEventListener("click", clearDB);

	function clearDB() {
		if (confirm("Reset User Name?")) {
			c.db.ref.child("Player 2").child("userInfo").remove();
		}
		if (confirm("Reset Board?")) {
			c.state.makeNewBoard = true;
			c.db.ref.child("boardState").remove();
			init()
		}
	}
	return c;
})(Chester);



/*Update Board*/
(function(c) {
	c.board = {};
	c.board.update = update;
	c.board.makeNew = makeNew;
	

	function update(boardState) {
		console.log(boardState)
makeNew()

			$(".glyphicon").remove();
			for (key in boardState) {
				var ele = $("#" + key).html("<span style='' class='glyphicon glyphicon-" + boardState[key].name + " " + boardState[key].color + "'></span>")
			}
		
	}

	function makeNew(boardState) {
		if (!boardState) {
			boardState = {};
			c.state.makeNewBoard = true;
		}
		c.ele.board.innerHTML = null;
		var row = 65;
		var col = 8;
		for (var i = 0; i < 64; i++) {
			if (i % 8 === 0 && i !== 0) {
				row = 65;
				col--;
			}
			var letter = String.fromCharCode(row);
			var boardPosition = letter + col;
			if (c.state.makeNewBoard) {
				if (col < 3 || col > 6) {
					boardState[boardPosition] = getNewPiece(letter, col);
				}
			}
			var boardPositionClass = "fl square";
			boardPositionClass = (isEven(i)) ? boardPositionClass + " whiteSquare" : boardPositionClass + " blackSquare";
			c.ele.board.appendChild(makeTile(boardPosition, boardPositionClass));
			row++;
		}
		c.state.makeNewBoard = false;
		c.board.update(boardState)
		c.db.ref.child("boardState").set(boardState)
	}

	function getNewPiece(l, c) {
		var newPiece = {};
		newPiece.color = (c === 8 || c === 7) ? "white" : "black";
		if (c === 2 || c === 7) {
			newPiece.name = "pawn";
			return newPiece;
		}
		if (l === "A" || l === "H") {
			newPiece.name = c.consts.pieces.tower;
		} else if (l === "B" || l === "G") {
			newPiece.name = c.consts.pieces.knight;
		} else if (l === "C" || l === "F") {
			newPiece.name = c.consts.pieces.bishop;
		} else if (l === "D") {
			newPiece.name = c.consts.pieces.queen;
		} else if (l === "E") {
			newPiece.name = c.consts.pieces.king;
		}
		return newPiece;
	}

	function makeTile(pos, classes) {
		var tile = document.createElement("div");
		tile.id = pos;
		tile.title = pos;
		tile.setAttribute('class', classes);
		return tile;
	}

	function isEven(num) {
		return parseInt((num / 8) + num) % 2 === 0 ? true : false;
	}

	return c;
})(Chester)



// (function() {
// 	var ref = new Firebase("https://quicktest1.firebaseio.com/chess");

// 	var firstLoad = true;
// 	var makeNewBoard = false;
// 	var localBoardState = {};
// 	var pOne = {};
// 	var pTwo = {};
// 	pOne.ele = document.getElementById("playerOne");
// 	pTwo.ele = document.getElementById("playerTwo");

// 	function init() {
// 		ref.once("value", function(snap) {
// 			handleDBAction(snap.val());
// 		});
// 	}
// 	init();

// 	function handleDBAction(val) {
// 		val = val || {};
// 		buildBoard(val.boardState)
// 		firstLoad = false;
// 		var p1 = val["Player 1"];
// 		var p2 = val["Player 2"];

// 		pOne.ele.firstElementChild.innerText = (p1 && p1.userInfo) ? p1.userInfo.name : "Player 1";
// 		pTwo.ele.firstElementChild.innerText = (p2 && p2.userInfo) ? p2.userInfo.name : "Player 2";
// 	}

// 	ref.on("value", function(snap) {
// 		if (!firstLoad) {
// 			updateBoard(snap.val());
// 		}
// 	});

// 	function updateBoard(val) {
// 		if (val) {
// 			console.log("about to update")
// 			setBoardState(val.boardState)
// 		}

// 	}

// 	pOne.currentPieces = [];
// 	pTwo.currentPieces = [];


// 	pOne.ele.addEventListener("click", enterPlayer);
// 	pTwo.ele.addEventListener("click", enterPlayer);

// 	var board = document.getElementById("board");
// 	var selectedPiece = null;
// 	var selectedPieceId = null;
// 	var captured = [];
// 	$('.board').on("click", ".square", handleSquareClick);

// 	function handleSquareClick(e) {
// 		// console.log($(this).attr("id"))
// 		// console.log($(this).children("span").length)
// 		if ($(this).children("span").length > 0) {
// 			if (!selectedPiece) {
// 				selectedPiece = $(this).children("span").detach();
// 				selectedPieceId = $(this).attr("id");
// 			} else {
// 				captured.push($(this).children("span").detach())
// 				$(this).append(selectedPiece)
// 				ref.child("boardState").child(selectedPieceId).remove()
// 				updateRemoteBoardState(selectedPiece[0], $(this).attr("id"))
// 				selectedPiece = null;
// 				selectedPieceId = null;
// 			}
// 		} else {
// 			if (selectedPiece) {
// 				$(this).append(selectedPiece)
// 				ref.child("boardState").child(selectedPieceId).remove()
// 				updateRemoteBoardState(selectedPiece[0], $(this).attr("id"))
// 				selectedPiece = null;
// 				selectedPieceId = null;
// 			}
// 		}
// 	}

// 	function buildBoard(boardState) {
// 		if (!boardState) {
// 			boardState = {};
// 			makeNewBoard = true;
// 		}
// 		board.innerHTML = null;
// 		var row = 65;
// 		var col = 8;
// 		for (var i = 0; i < 64; i++) {
// 			if (i % 8 === 0 && i !== 0) {
// 				row = 65;
// 				col--;
// 			}
// 			var letter = String.fromCharCode(row);
// 			var boardPosition = letter + col;
// 			if (makeNewBoard) {
// 				if (col < 3 || col > 6) {
// 					boardState[boardPosition] = getNewPiece(letter, col);
// 				}
// 			}
// 			var boardPositionClass = "fl square";
// 			boardPositionClass = (isEven(i)) ? boardPositionClass + " whiteSquare" : boardPositionClass + " blackSquare";
// 			board.appendChild(makeTile(boardPosition, boardPositionClass));
// 			row++;
// 		}
// 		makeNewBoard = false;
// 		setBoardState(boardState)
// 		localBoardState = boardState;
// 		ref.child("boardState").set(boardState)
// 	}

// 	function makeTile(pos, classes) {
// 		var tile = document.createElement("div");
// 		tile.id = pos;
// 		tile.title = pos;
// 		tile.setAttribute('class', classes);
// 		return tile;
// 	}

// 	function isEven(num) {
// 		return parseInt((num / 8) + num) % 2 === 0 ? true : false;
// 	}



// 	function setBoardState(boardState) {
// 		$(".glyphicon").remove();
// 		if (true) {
// 			for (key in boardState) {
// 				var ele = $("#" + key).html("<span style='' class='glyphicon glyphicon-" + boardState[key].name + " " + boardState[key].color + "'></span>")
// 			}
// 		}
// 	}

// 	function enterPlayer(e) {
// 		var player = e.target.innerText;
// 		switch (player) {
// 			case "Player 1":
// 				if (!pOne.userInfo || pOne.userInfo.name || pOne.userInfo.name === "") {
// 					pOne.userInfo = makePlayer(player);
// 					e.target.innerText = pOne.userInfo.name;
// 					ref.child(player).set(pOne);
// 				}
// 				break;
// 			case "Player 2":
// 				if (!pTwo.userInfo || pTwo.userInfo.name || pTwo.userInfo.name === "") {
// 					pTwo.userInfo = makePlayer(player);
// 					e.target.innerText = pTwo.userInfo.name;
// 					ref.child(player).set(pTwo);
// 				}
// 				break;
// 			default:
// 				console.log("...who is that...");
// 		}
// 	}
// 	var reset = document.getElementById("reset");
// 	reset.addEventListener("click", clearDB);

// 	function clearDB() {
// 		if (confirm("Reset User Name?")) {
// 			ref.child("Player 2").child("userInfo").remove();
// 		}
// 		if (confirm("Reset Board?")) {
// 			makeNewBoard = true;
// 			ref.child("boardState").remove();
// 			init()
// 		}
// 	}

// 	function makePlayer(player) {
// 		var obj = {};
// 		var name = prompt("Enter Name For " + player) || player;
// 		obj.name = name;
// 		return obj;
// 	}

// 	var announcement = $("#announcement");
// 	var annouceFlag;

// 	function announceMove(selectedPiece, square) {
// 		clearTimeout(annouceFlag)
// 		var name = getPieceName(selectedPiece);
// 		if (square) {
// 			var msg = name + " to " + square;
// 			announcement.text(msg).show("slow");
// 			annouceFlag = setTimeout(function() {
// 				announcement.text(" ").hide("fast");
// 			}, 2000);
// 		}
// 	}

// 	function updateRemoteBoardState(selectedPiece, id) {
// 		var name = getPieceName(selectedPiece);
// 		var color = selectedPiece.classList[2];
// 		ref.child("boardState").child(id).set({
// 			name: name,
// 			color: color
// 		})
// 	}

// 	function movePiece(key, val) {
// 		boardState[key] = val;
// 	}

// 	function getPieceName(piece) {
// 		var startPos = piece.className.indexOf("con-") + 4;
// 		var newString = piece.className.substring(startPos);
// 		var endPos = newString.indexOf(" ");
// 		newString = newString.substring(0, endPos);
// 		return newString;
// 	}

// })();
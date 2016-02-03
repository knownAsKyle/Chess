(function() {
	var firstLoad = true;
	var pOne = {};
	var pTwo = {};
	pOne.ele = document.getElementById("playerOne");
	pTwo.ele = document.getElementById("playerTwo");
	
	var boardState = {}
	// {
	// 	A1: "tower",
	// 	A2: "pawn",
	// 	A7: "pawn",
	// 	A8: "tower",
	// 	B1: "knight",
	// 	B2: "pawn",
	// 	B7: "pawn",
	// 	B8: "knight",
	// 	C1: "bishop",
	// 	C2: "pawn",
	// 	C7: "pawn",
	// 	C8: "bishop",
	// 	D1: "king",
	// 	D2: "pawn",
	// 	D7: "pawn",
	// 	D8: "king",
	// 	E1: "queen",
	// 	E2: "pawn",
	// 	E7: "pawn",
	// 	E8: "queen",
	// 	F1: "bishop",
	// 	F2: "pawn",
	// 	F7: "pawn",
	// 	F8: "bishop",
	// 	G1: "knight",
	// 	G2: "pawn",
	// 	G7: "pawn",
	// 	G8: "knight",
	// 	H1: "tower",
	// 	H2: "pawn",
	// 	H7: "pawn",
	// 	H8: "tower"
	// }



	var ref = new Firebase("https://quicktest1.firebaseio.com/chess");
	ref.on("value", function(snap) {
		handleDBAction(snap.val());
	});

	function handleDBAction(val) {
		val = val || {};
		var p1 = val["Player 1"];
		var p2 = val["Player 2"];
		pOne.ele.firstElementChild.innerText = (p1 && p1.userInfo) ? p1.userInfo.name : "Player 1";
		pTwo.ele.firstElementChild.innerText = (p2 && p2.userInfo) ? p2.userInfo.name : "Player 2";
	}

	pOne.currentPieces = [];
	pTwo.currentPieces = [];
	
	pOne.ele.addEventListener("click", enterPlayer);
	pTwo.ele.addEventListener("click", enterPlayer);

	function enterPlayer(e) {
		var player = e.target.innerText;
		switch (player) {
			case "Player 1":
				if (!pOne.userInfo || pOne.userInfo.name || pOne.userInfo.name === "") {
					pOne.userInfo = makePlayer(player);
					e.target.innerText = pOne.userInfo.name;
					ref.child(player).set(pOne);
					firstLoad = false;
				}
				break;
			case "Player 2":
				if (!pTwo.userInfo || pTwo.userInfo.name || pTwo.userInfo.name === "") {
					pTwo.userInfo = makePlayer(player);
					e.target.innerText = pTwo.userInfo.name;
					ref.child(player).set(pTwo);
					firstLoad = false;
				}
				break;
			default:
				console.log("...who is that...");
		}
	}
	var reset = document.getElementById("reset");
	reset.addEventListener("click", clearDB);

	function clearDB() {
		if (confirm("Reset User Name?")) {
			ref.remove();
		}
	}

	function makePlayer(player) {
		var obj = {};
		var name = prompt("Enter Name For " + player) || player;
		obj.name = name;
		return obj;
	}
	var board = document.getElementById("board");
	var row = 65;
	var col = 8;
	for (var i = 0; i < 64; i++) {
		var addedClass = "fl square";
		var pieceClasses = "glyphicon glyphicon-";
		var tile = document.createElement("div");
		var piece = document.createElement("div");
		var icon = document.createElement("span");
		var even = parseInt((i / 8) + i) % 2 === 0 ? true : false;
		if (i % 8 === 0 && i !== 0) {
			row = 65;
			col--;
		}
		var letter = String.fromCharCode(row);
		var pieceInfo = {
			position: (letter + col),
		}

		if (even) {
			addedClass = addedClass + " whiteSquare";
		} else {
			addedClass = addedClass + " blackSquare";
		}
		piece.setAttribute('class', 'piece');
		//piece.addEventListener("click", handlePieceClicked);
		if (col === 1 || col === 8) {
			if (row === 65 || row === 72) {
				pieceClasses = pieceClasses + "tower";
				pieceInfo.name = "tower";
				boardState[letter + col] = {name: "tower"};
			}
			if (row === 66 || row === 71) {
				pieceClasses = pieceClasses + "knight";
				pieceInfo.name = "knight";
				boardState[letter + col] = {name:"knight"};
			}
			if (row === 67 || row === 70) {
				pieceClasses = pieceClasses + "bishop";
				pieceInfo.name = "bishop";
				boardState[letter + col] = {name:"bishop"};
			}
			if (row === 68) {
				pieceClasses = pieceClasses + "king";
				pieceInfo.name = "king";
				boardState[letter + col] = {name:"king"};
			}
			if (row === 69) {
				pieceClasses = pieceClasses + "queen";
				pieceInfo.name = "queen";
				boardState[letter + col] = {name:"queen"};
			}
			if(col === 8){
				pieceInfo.color = "white";
				pOne.currentPieces.push(pieceInfo);
				pieceClasses = pieceClasses + " white"
				boardState[letter + col].color =  "white"
			}else{
				pieceInfo.color = "black";
				pTwo.currentPieces.push(pieceInfo);
				pieceClasses = pieceClasses + " black"
				boardState[letter + col].color =  "black"
			};

			icon.setAttribute('class', pieceClasses);
			piece.appendChild(icon);
		}
		if (col === 2 || col === 7) {
			pieceClasses = pieceClasses + "pawn";
			pieceInfo.name = "pawn";
			boardState[letter + col] = {name:"pawn"};
			if(col === 7){
				pieceInfo.color = "white";
				pOne.currentPieces.push(pieceInfo);
				pieceClasses = pieceClasses+ " white";
				boardState[letter + col].color =  "white"
			}else{
				pieceInfo.color = "black";
				pTwo.currentPieces.push(pieceInfo);
				pieceClasses = pieceClasses + " black";
				boardState[letter + col].color =  "black"
			}
			icon.setAttribute('class', pieceClasses);
			piece.appendChild(icon);
		}
		

		tile.id = letter + col;
		tile.title = letter + col;
		tile.setAttribute('class', addedClass);
		tile.appendChild(piece);
		tile.addEventListener("click", handleTileClicked);
		board.appendChild(tile);
		row++;
	}
	console.log(boardState, pOne, pTwo)

	//var q = document.getElementsByClassName("piece");
	var announcement = $("#announcement");
	var selectedPiece = null;
	//var pieceCss = {};
	function handleTileClicked(e) {
		console.log("TILE ", e);
		switch (e.target.nodeName) {
			case "DIV":
				if (selectedPiece) {
					announceMove(selectedPiece[0], $(e.target)[0].id);
					//$(selectedPiece).css(pieceCss);
					$(e.target).children('.piece').append(selectedPiece);
					$(selectedPiece).css({
						"font-size": "2.1em"
					}).animate({
						"font-size": "1.2em"
					});
					selectedPiece = null;

				}
				break;
			case "SPAN":
				if (!selectedPiece) {
					console.log(jQuery(e.target))
					selectedPiece = jQuery(e.target).detach();

					console.dir($(e.target).parent())
				}
				break;
			default:
			console.log("did I just step on some one? ")
		}
	}

	function announceMove(selectedPiece, square) {
		var name = getPieceName(selectedPiece);
		if (square) {
			var msg = name + " to " + square;
			announcement.text(msg).show("slow");
			setTimeout(function() {
				announcement.text(" ").hide("fast");
			}, 3000);
		}
	}

	function movePiece(key, val) {
		boardState[key] = val;
	}

	function getPieceName(piece) {
		var startPos = piece.className.indexOf("con-") + 4;
		var newString = piece.className.substring(startPos);
		var endPos = newString.indexOf(" ");
		newString = newString.substring(0, endPos);
		return newString;
	}
})();
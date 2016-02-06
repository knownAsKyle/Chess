(function() {
	var ref = new Firebase("https://quicktest1.firebaseio.com/chess");

	var firstLoad = true;
	var makeNewBoard = false;
	var pOne = {};
	var pTwo = {};
	pOne.ele = document.getElementById("playerOne");
	pTwo.ele = document.getElementById("playerTwo");
	ref.on("value", function(snap) {
		handleDBAction(snap.val());
	});

	function handleDBAction(val) {
		val = val || {};
		buildBoard(val.boardState)
		var p1 = val["Player 1"];
		var p2 = val["Player 2"];
		pOne.ele.firstElementChild.innerText = (p1 && p1.userInfo) ? p1.userInfo.name : "Player 1";
		pTwo.ele.firstElementChild.innerText = (p2 && p2.userInfo) ? p2.userInfo.name : "Player 2";
	}

	pOne.currentPieces = [];
	pTwo.currentPieces = [];

	pOne.ele.addEventListener("click", enterPlayer);
	pTwo.ele.addEventListener("click", enterPlayer);


	function buildBoard(boardState) {
		if (firstLoad) {
			var board = document.getElementById("board");
			board.innerHTML = null;
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
				if (makeNewBoard) {
					boardState = newGameBoardPieces(col, row, icon, piece, letter, pieceClasses, pieceInfo, boardState);
				}
				tile.id = letter + col;
				tile.title = letter + col;
				tile.setAttribute('class', addedClass);
				tile.appendChild(piece);
				tile.addEventListener("click", handleTileClicked);
				board.appendChild(tile);
				row++;
			}
		}
		setBoardState(boardState)
		ref.child("boardState").set(boardState)
		firstLoad = false;
		makeNewBoard = false;

	}

	function setBoardState(boardState) {
		$(".piece").empty();
		for (key in boardState) {
			var ele = $("#" + key + " .piece").append("<span class='glyphicon glyphicon-" + boardState[key].name + " " + boardState[key].color + "'></span>")
		}
	}

	function newGameBoardPieces(col, row, icon, piece, letter, pieceClasses, pieceInfo, boardState) {
		boardState = boardState || {};
		if (col === 1 || col === 8) {
			if (row === 65 || row === 72) {
				pieceClasses = pieceClasses + "tower";
				pieceInfo.name = "tower";
				boardState[letter + col] = addBoardState("tower");
			}
			if (row === 66 || row === 71) {
				pieceClasses = pieceClasses + "knight";
				pieceInfo.name = "knight";
				boardState[letter + col] = addBoardState("knight");
			}
			if (row === 67 || row === 70) {
				pieceClasses = pieceClasses + "bishop";
				pieceInfo.name = "bishop";
				boardState[letter + col] = addBoardState("bishop");
			}
			if (row === 68) {
				pieceClasses = pieceClasses + "king";
				pieceInfo.name = "king";
				boardState[letter + col] = addBoardState("king");
			}
			if (row === 69) {
				pieceClasses = pieceClasses + "queen";
				pieceInfo.name = "queen";
				boardState[letter + col] = addBoardState("queen");
			}
			if (col === 8) {
				pieceInfo.color = "white";
				pOne.currentPieces.push(pieceInfo);
				pieceClasses = pieceClasses + " white"
				boardState[letter + col].color = "white"
			} else {
				pieceInfo.color = "black";
				pTwo.currentPieces.push(pieceInfo);
				pieceClasses = pieceClasses + " black"
				boardState[letter + col].color = "black"
			};
			icon.setAttribute('class', pieceClasses);
			piece.appendChild(icon);
		}
		if (col === 2 || col === 7) {
			pieceClasses = pieceClasses + "pawn";
			pieceInfo.name = "pawn";
			boardState[letter + col] = addBoardState("pawn");
			if (col === 7) {
				pieceInfo.color = "white";
				pOne.currentPieces.push(pieceInfo);
				pieceClasses = pieceClasses + " white";
				boardState[letter + col].color = "white"
			} else {
				pieceInfo.color = "black";
				pTwo.currentPieces.push(pieceInfo);
				pieceClasses = pieceClasses + " black";
				boardState[letter + col].color = "black"
			}
			if (true) {
				icon.setAttribute('class', pieceClasses);
				piece.appendChild(icon);
			}
		}
		return boardState;

	}

	function addBoardState(name) {
		return {
			name: name
		}
	}

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
			ref.child("Player 2").child("userInfo").remove();
		}
		if (confirm("Reset Board?")) {
			firstLoad = true;
			makeNewBoard = true;
			ref.child("boardState").remove();

		}
	}

	function makePlayer(player) {
		var obj = {};
		var name = prompt("Enter Name For " + player) || player;
		obj.name = name;
		return obj;
	}

	//var q = document.getElementsByClassName("piece");
	var announcement = $("#announcement");
	var selectedPiece = null;
	//var pieceCss = {};
	function handleTileClicked(e) {
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
					updateRemoteBoardState(selectedPiece[0], $(e.target)[0].id);
					selectedPiece = null;

				}
				break;
			case "SPAN":
				if (!selectedPiece) {
					ref.child("boardState").child($(e.target).parent().parent()[0].id).remove();
					selectedPiece = jQuery(e.target).detach();
				}
				break;
			default:
				console.log("did I just step on some one? ")
		}
	}

	var annouceFlag;

	function announceMove(selectedPiece, square) {
		clearTimeout(annouceFlag)
		var name = getPieceName(selectedPiece);
		if (square) {
			var msg = name + " to " + square;
			announcement.text(msg).show("slow");
			annouceFlag = setTimeout(function() {
				announcement.text(" ").hide("fast");
			}, 2000);
		}
	}

	function updateRemoteBoardState(selectedPiece, id) {
		var name = getPieceName(selectedPiece);
		var color = selectedPiece.classList[2];
		ref.child("boardState").child(id).set({
			name: name,
			color: color
		})
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

	// var sortOptions =  {
	// 	animation: 150
	// }
	// var sortable = Sortable.create(board,sortOptions);
})();
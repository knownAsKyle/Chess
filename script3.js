(function() {
	var ref = new Firebase("https://quicktest1.firebaseio.com/chess");

	var firstLoad = true;
	var makeNewBoard = false;
	var localBoardState = {};
	var pOne = {};
	var pTwo = {};
	pOne.ele = document.getElementById("playerOne");
	pTwo.ele = document.getElementById("playerTwo");

	function init() {
		ref.once("value", function(snap) {
			handleDBAction(snap.val());
		});
	}
	init();

	function handleDBAction(val) {
		val = val || {};
		buildBoard(val.boardState)
		firstLoad = false;
		var p1 = val["Player 1"];
		var p2 = val["Player 2"];

		pOne.ele.firstElementChild.innerText = (p1 && p1.userInfo) ? p1.userInfo.name : "Player 1";
		pTwo.ele.firstElementChild.innerText = (p2 && p2.userInfo) ? p2.userInfo.name : "Player 2";
	}

	ref.on("value", function(snap) {
		if (!firstLoad) {
			updateBoard(snap.val());
		}
	});

	function updateBoard(val) {
		if (val) {
			console.log("about to update")
			setBoardState(val.boardState)
		}

	}

	pOne.currentPieces = [];
	pTwo.currentPieces = [];


	pOne.ele.addEventListener("click", enterPlayer);
	pTwo.ele.addEventListener("click", enterPlayer);

	var board = document.getElementById("board");
	var selectedPiece = null;
	var selectedPieceId = null;
	var captured = [];
	$('.board').on("click", ".square", handleSquareClick);

	function handleSquareClick(e) {
		// console.log($(this).attr("id"))
		// console.log($(this).children("span").length)
		if ($(this).children("span").length > 0) {
			if (!selectedPiece) {
				selectedPiece = $(this).children("span").detach();
				selectedPieceId = $(this).attr("id");
			} else {
				captured.push($(this).children("span").detach())
				$(this).append(selectedPiece)
				ref.child("boardState").child(selectedPieceId).remove()
				updateRemoteBoardState(selectedPiece[0], $(this).attr("id"))
				selectedPiece = null;
				selectedPieceId = null;
			}
		} else {
			if (selectedPiece) {
				$(this).append(selectedPiece)
				ref.child("boardState").child(selectedPieceId).remove()
				updateRemoteBoardState(selectedPiece[0], $(this).attr("id"))
				selectedPiece = null;
				selectedPieceId = null;
			}
		}
	}

	function buildBoard(boardState) {
		if (!boardState) {
			boardState = {};
			makeNewBoard = true;
		}
		board.innerHTML = null;
		var row = 65;
		var col = 8;
		for (var i = 0; i < 64; i++) {
			if (i % 8 === 0 && i !== 0) {
				row = 65;
				col--;
			}
			var letter = String.fromCharCode(row);
			var boardPosition = letter + col;
			if (makeNewBoard) {
				if (col < 3 || col > 6) {
					boardState[boardPosition] = getNewPiece(letter, col);
				}
			}
			var boardPositionClass = "fl square";
			boardPositionClass = (isEven(i)) ? boardPositionClass + " whiteSquare" : boardPositionClass + " blackSquare";
			board.appendChild(makeTile(boardPosition, boardPositionClass));
			row++;
		}
		makeNewBoard = false;
		setBoardState(boardState)
		localBoardState = boardState;
		ref.child("boardState").set(boardState)
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

	function getNewPiece(l, c) {
		var newPiece = {};
		newPiece.color = (c === 8 || c === 7) ? "white" : "black";
		if (c === 2 || c === 7) {
			newPiece.name = "pawn";
			return newPiece;
		}
		if (l === "A" || l === "H") {
			newPiece.name = "tower";
		} else if (l === "B" || l === "G") {
			newPiece.name = "knight";
		} else if (l === "C" || l === "F") {
			newPiece.name = "bishop";
		} else if (l === "D") {
			newPiece.name = "queen";
		} else if (l === "E") {
			newPiece.name = "king";
		}
		return newPiece;
	}

	function setBoardState(boardState) {
		$(".glyphicon").remove();
		if (true) {
			for (key in boardState) {
				var ele = $("#" + key).html("<span style='' class='glyphicon glyphicon-" + boardState[key].name + " " + boardState[key].color + "'></span>")
			}
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
				}
				break;
			case "Player 2":
				if (!pTwo.userInfo || pTwo.userInfo.name || pTwo.userInfo.name === "") {
					pTwo.userInfo = makePlayer(player);
					e.target.innerText = pTwo.userInfo.name;
					ref.child(player).set(pTwo);
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
			makeNewBoard = true;
			ref.child("boardState").remove();
			init()
		}
	}

	function makePlayer(player) {
		var obj = {};
		var name = prompt("Enter Name For " + player) || player;
		obj.name = name;
		return obj;
	}

	var announcement = $("#announcement");
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

	var sortOptions = {
			animation: 150
		}
		//var sortable = Sortable.create(board, sortOptions);
})();
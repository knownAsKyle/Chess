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

	var board = document.getElementById("board");
	var selectedPiece = null;
	$('.board').on("click", ".square", handleSquareClick);

	function handleSquareClick(e) {
		return findPiece(e.target)
	}

	function findPiece(ele) {
		if (ele.children.length > 0) {
			findPiece(ele.children[0])
		} else {
			if (ele.tagName === "SPAN" && !selectedPiece) {
				ref.child("boardState").child(jQuery(ele).parent().parent(".square")[0].id).remove()
				return (selectedPiece = jQuery(ele).detach());
			}
			if (selectedPiece && ele.tagName !== "SPAN") {
				if (ele.className === "piece") {
					jQuery(ele).append(selectedPiece);
					updateRemoteBoardState(selectedPiece[0], jQuery(ele).parent(".square")[0].id)
					return (selectedPiece = null);
				}
				if (ele.className !== "piece") {
					jQuery('<div/>', {
						class: 'piece',
					}).appendTo(ele);
					$(ele).children(".piece").append(selectedPiece);
					updateRemoteBoardState(selectedPiece[0], $(ele)[0].id)
					return (selectedPiece = null);
				}
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
		$(".sqaure").empty();
		for (key in boardState) {
			var ele = $("#" + key).append("<div class='piece'><span class='glyphicon glyphicon-" + boardState[key].name + " " + boardState[key].color + "'></span></div>")
		}
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
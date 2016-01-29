(function() {
	var ref = new Firebase("https://quicktest1.firebaseio.com/chess");

	var pOne = {}
	var pTwo = {}
	pOne.ele = document.getElementById("playerOne");
	pTwo.ele = document.getElementById("playerTwo");

	pOne.ele.addEventListener("click", enterPlayer);
	pTwo.ele.addEventListener("click", enterPlayer);

	function enterPlayer(e) {
		var player = e.target.innerText
		switch (player) {
			case "Player 1":
				if (!pOne.userInfo || pOne.userInfo.name || pOne.userInfo.name === "") {
					pOne.userInfo = makePlayer(player);
					e.target.innerText = pOne.userInfo.name
				}
				break
			case "Player 2":
				if (!pTwo.userInfo || pTwo.userInfo.name || pTwo.userInfo.name === "") {
					pTwo.userInfo = makePlayer(player);
					e.target.innerText = pTwo.userInfo.name;
				}
				break
			default:
				console.log("...who is that...")
		}
		console.log(pOne, pTwo)
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

		var even = parseInt((i / 8) + i) % 2 == 0 ? true : false;

		if (i % 8 === 0 && i !== 0) {
			row = 65;
			col--;
		}

		var letter = String.fromCharCode(row);

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
			}
			if (row === 66 || row === 71) {
				pieceClasses = pieceClasses + "knight";
			}
			if (row === 67 || row === 70) {
				pieceClasses = pieceClasses + "bishop";
			}
			if (row === 68) {
				pieceClasses = pieceClasses + "king";
			}
			if (row === 69) {
				pieceClasses = pieceClasses + "queen";
			}
			pieceClasses = (col === 8) ? (pieceClasses + " white") : (pieceClasses + " black");
			icon.setAttribute('class', pieceClasses);
			piece.appendChild(icon)

		}
		if (col === 2 || col === 7) {
			pieceClasses = pieceClasses + "pawn";
			pieceClasses = (col === 7) ? (pieceClasses + " white") : (pieceClasses + " black");
			icon.setAttribute('class', pieceClasses);
			piece.appendChild(icon)
		}

		tile.id = letter + col;
		tile.title = letter + col;
		tile.setAttribute('class', addedClass);
		tile.appendChild(piece)
		tile.addEventListener("click", handleTileClicked);
		board.appendChild(tile)

		row++;
	}

	var q = document.getElementsByClassName("piece");
	var defaultSize = "30px";

	var selectedPiece = null;
	var pieceCss = {


	}

	function handleTileClicked(e) {
		console.log("TITLE ", e)
		switch (e.target.nodeName) {
			case "DIV":
				if (selectedPiece) {
					$(selectedPiece).css(pieceCss);
					$(e.target).children('.piece').append(selectedPiece)
					$(selectedPiece).css({
						"font-size": "2.1em"
					}).animate({
						"font-size": "1.2em"
					})
					selectedPiece = null;
				}
				break;
			case "SPAN":
				if (!selectedPiece) {
					selectedPiece = jQuery(e.target).detach();
				}
				break;
			default:

		}
	}

})()
(function() {

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



		var pieceContent = document.createTextNode(String.fromCharCode(row) + col);
		
		
		if (even) {
			addedClass = addedClass + " whiteSquare";
		} else {
			addedClass = addedClass + " blackSquare";
		}
		piece.setAttribute('class', 'piece');
		if(col === 1 || col === 8){
			if(row === 65 || row === 72){
				pieceClasses = pieceClasses + "tower";
			}
			if(row === 66 || row === 71){
				pieceClasses = pieceClasses + "knight";
			}
			if(row === 67 || row === 70){
				pieceClasses = pieceClasses + "bishop";
			}
			if(row === 68){
				pieceClasses = pieceClasses + "king";
			}
			if(row === 69){
				pieceClasses = pieceClasses + "queen";
			}
			pieceClasses = (col === 8)?(pieceClasses + " black"):(pieceClasses + " white");
			
			
		}
		if(col === 2 || col === 7){
			pieceClasses = pieceClasses + "pawn";
			pieceClasses = (col === 7)?(pieceClasses + " black"):(pieceClasses + " white");
		}
		icon.setAttribute('class', pieceClasses);
		piece.appendChild(icon)
		tile.id = i;
		tile.setAttribute('class', addedClass);
		tile.appendChild(piece)
		tile.addEventListener("click", handleTileClicked);
		board.appendChild(tile)

		row++;
	}

	var q = document.getElementsByClassName("piece");
	function handleTileClicked(e) {
		for (var i = 0; i < q.length; i++) {
			if (q[i].style.fontSize !== 'inherit') {
				q[i].style.fontSize = 'inherit';
			}
		}
		var content = e.target.children[0];
		if (content) {
			content.style.fontSize = '30px';
		}

	}
})()
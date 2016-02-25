var Chester = Chester || {};
/*
	LOCAL STATE TRACKER
*/
(function(c) {
	Chester.state = {};
	Chester.state.firstLoad = true;
	Chester.state.makeNewBoard = false;
	Chester.state.selectedPiece = null;
	Chester.state.selectedPieceId = null;
	return c;
})(Chester);
/*
	CONSTANTS
*/
(function(c) {
	Chester.consts = {};
	Chester.consts.fbRef = "https://quicktest1.firebaseio.com/chess";
	Chester.consts.pieces = {};
	Chester.consts.pieces.tower = "tower";
	Chester.consts.pieces.knight = "knight";
	Chester.consts.pieces.bishop = "bishop";
	Chester.consts.pieces.queen = "queen";
	Chester.consts.pieces.king = "king";
	Chester.consts.pieces.pawn = "pawn";
	return c;
})(Chester);
/*
	DB (Firebase) Interactions
*/

(function(c) {
	Chester.db = {};
	Chester.db.ref = new Firebase(Chester.consts.fbRef);

	return c;
})(Chester);
/*
	ELEMENTS
*/
(function(c) {
	Chester.ele = {};
	Chester.ele.board = document.getElementById("board");

	return c;
})(Chester);

/*
	Movement Handler
*/

(function(c) {
	Chester.move = {};
	Chester.move.handleSquareClick = handleSquareClick;

	function handleSquareClick(e) {
		var sqr = $(this);
		if (sqr.children("span").length > 0) {
			if (!Chester.state.selectedPiece) {
				Chester.state.selectedPiece = sqr.children("span").detach();
				Chester.state.selectedPieceId = sqr.attr("id");
			} else {
				//captured.push(sqr.children("span").detach())
				sqr.append(Chester.state.selectedPiece)
				Chester.helper.animateMove(sqr);
				Chester.db.ref.child("boardState").child(Chester.state.selectedPieceId).remove();
				updateRemoteBoardState(Chester.state.selectedPiece[0], sqr.attr("id"));
				Chester.state.selectedPiece = null;
				Chester.state.selectedPieceId = null;
			}
		} else {
			if (Chester.state.selectedPiece) {
				sqr.append(Chester.state.selectedPiece)
				Chester.helper.animateMove(sqr);
				// sqr.addClass()
				Chester.db.ref.child("boardState").child(Chester.state.selectedPieceId).remove();
				updateRemoteBoardState(Chester.state.selectedPiece[0], sqr.attr("id"))
				Chester.state.selectedPiece = null;
				Chester.state.selectedPieceId = null;
			}
		}
	}

	function updateRemoteBoardState(selectedPiece, id) {
		var name = getPieceName(selectedPiece);
		var color = selectedPiece.classList[2];
		Chester.db.ref.child("boardState").child(id).set({
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
	Chester.events = {};
	// Chester.db.ref.once("value", function(snap) {
	// 	handleDBAction(snap.val());
	// });

	function handleDBAction(val) {
		val = val || {};
		Chester.board.makeNew(val.boardState)
			//Chester.state.firstLoad = false;

		/*pOne.ele.firstElementChild.innerText = (p1 && p1.userInfo) ? p1.userInfo.name : "Player 1";
		pTwo.ele.firstElementChild.innerText = (p2 && p2.userInfo) ? p2.userInfo.name : "Player 2";
		*/
	}

	Chester.db.ref.child("boardState").on("value", function(snap) {
		Chester.board.update(snap.val());
	});

	$("body").on("click", '.innnerGameList .joinGameButton', function(e) {
		if ($(e.target).attr("id")) {
			var cl = $(e.target).attr("id")
			cl = cl.substring(cl.length - 1)
			console.log("clicked a game: ", cl)
			setTimeout(function() {
				if (Chester.auth.authStatus()) {
					if ($(e.target).text() === "Join") {
						return swal("Joined Game!", "Entering Game Number " + cl, "success");
					}
					return swal("Watching Game", "Watching Game Number " + cl, "success");
				}
				if ($(e.target).text() === "Watch") {
					return swal("Watching Game", "Watching Game Number " + cl, "success");
				}
			}, 300)
		}
	})

	$("body").on("click", '.newGameButton', function(e) {
		console.log("newGameButton button clicked ... ", e)
		var time = new Date().getTime();
		var date = new Date(time);
		var newGame = {};
		newGame.timeStamp = date.toString();
		newGame.playerOne = {"name":Chester.auth.getAuthData().google.displayName};
		var id = Chester.db.ref.child("games").push(newGame);

			//TODO
			//call fb with a push, add timestamp, add user name (from login) as playerOne,
			//have listener from fb update list of games with new entry, rely on my listener to adjust html 
	})

	$('.board').on("click", ".square", Chester.move.handleSquareClick);

	function clearDB() {
		if (confirm("Reset User Name?")) {
			Chester.db.ref.child("Player 2").child("userInfo").remove();
		}
		if (confirm("Reset Board?")) {
			Chester.state.makeNewBoard = true;
			Chester.db.ref.child("boardState").remove();
			init()
		}
	}
	return c;
})(Chester);

/*authentication*/
(function() {
	Chester.auth = {};
	Chester.auth.login = login;
	Chester.auth.logout = logout;
	Chester.auth.getAuth = false;
	Chester.auth.authStatus = authStatus;
	Chester.auth.getAuthData = getAuthData;

	function login() {
		if (window.location.protocol === "file:") {
			swal("Login Success", "User: TESTING","success");
			Chester.auth.getAuth = true;
		} else {
			Chester.db.ref.authWithOAuthPopup("google", function(error, authData) {
				if (error) {
					console.log("Login Failed!", error);
					swal({
						title: "There was an issue.",
						text: error,
						type: "warning",
						confirmButtonText: "Ok",
					});
					swal()
				} else {
					console.log("Authenticated successfully with payload:", authData);
					swal("Login Success", "User: " + authData.google.displayName, "success");
					Chester.auth.getAuth = true;
					Chester.auth.authData = authData;
				}
			});
		}
	}

	function logout() {
		Chester.auth.getAuth = false;
	}

	function authStatus() {
		return Chester.auth.getAuth;
	}

	function getAuthData(){
		return Chester.auth.authData;
	}
})();

/*Helper*/
(function() {
	Chester.helper = {}
	Chester.helper.animateMove = animateMove;

	function animateMove(e) {
		e.addClass('active');
		return setTimeout(function() {
			e.removeClass('active')
		}, 200);
	}
})();

/*menu handler*/
(function($) {
	var options = {
		'primaryIcon': 'external-link',
	};
	var icons = ['google', 'check-square', 'rocket'];
	$.ferrisWheelButton(options, icons);

	var allButtons = $.ferrisWheelButton('getButtons')
	var menuButtonOne = $.ferrisWheelButton('getButton', 'google')
	var menuButtonTwo = $.ferrisWheelButton('getButton', 'check-square')
	var menuButtonThree = $.ferrisWheelButton('getButton', 'rocket')

	//Use jquery on all buttons
	allButtons.css({
		'border': '2px solid white'
	});
	menuButtonOne.css({
		'background-color': '#F44336'
	});
	menuButtonTwo.css({
		'background-color': '#3b5998',
	});

	allButtons.on('click', handleMenuButtonClick);

	function handleMenuButtonClick(ev) {
		ev.stopImmediatePropagation();
		var optionSelected = $(ev.target);
		var optionSelectedName = optionSelected.attr("title") ? optionSelected.attr("title") : optionSelected.children(".fa").attr("title");
		routeMenuButtonClick(optionSelectedName, icons);
	}

	function routeMenuButtonClick(option, opts) {
		switch (option) {
			case opts[0]:
				Chester.auth.login()
				if (Chester.auth.getAuth) {
					console.log("google login set to true ", Chester.auth.getAuth);
				}
				break;
			case opts[1]:
				swal({
					title: "Clear board?",
					text: "This will reset the board",
					type: "info",
					showCancelButton: true,
					confirmButtonText: "Ok!",
					cancelButtonText: "No, cancel!",
					closeOnConfirm: false,
					closeOnCancel: true
				}, function(isConfirm) {
					if (isConfirm) {
						Chester.board.makeNew();
						swal("Reset!", "game reset!", "success");
					}
				});
				break;
			case opts[2]:
				var newOption = Chester.auth.authStatus() ? "<button class='newGameButton' title='new game'>New</button>" : "";
				swal({
					showConfirmButton: false,
					title: "<div class='gameMenuTitle'><span>Games</span> " + newOption + "</div>",
					text: buildMockGames(6, false),
					html: true,
					allowOutsideClick: true
				})
				$("body .innnerGameList ul").height($(".sweet-alert").height() - 100)
				break;
			default:
		}
	}

	function buildMockGames(amt, addImg) {

		console.log("I'm firing", Chester.auth.authStatus())
		var html = '<div class="innnerGameList"><ul>'
		for (var i = 0; i < amt; i++) {
			var buttonText = Chester.auth.authStatus() ? "Join" : "Log In to Join";
			var p2Name = ".............";
			var mockGameThing = {};
			mockGameThing.gameId = "gameId_" + i;
			mockGameThing.playerOne = {
				"name": "Player1"
			};
			if (i < (amt - 2)) {
				mockGameThing.playerTwo = {
					"name": "Player2"
				};
			}



			html = html + '<li class="' + mockGameThing.gameId + '">';
			if (addImg) {
				html = html + '<img src="http://lorempixum.com/100/100/nature/' + (i + 1) + '">';
			}
			if (mockGameThing.playerTwo) {
				buttonText = "Watch";
				p2Name = mockGameThing.playerTwo.name;
			}
			html = html + '<h3><div class="playerOne">' + mockGameThing.playerOne.name + '</div> vs <div class="playerTwo">' + p2Name + '</div></h3>';
			html = html + '<button id="' + mockGameThing.gameId + '" class="joinGameButton">' + buttonText + '</button>';
			html = html + '</li>'
		}
		html = html + '</ul></div>'
		return html;
	}
})(jQuery);

/*Update Board*/
(function(c) {
	Chester.board = {};
	Chester.board.update = update;
	Chester.board.makeNew = makeNew;


	function update(boardState) {
		if ($("#board").children().length < 1) {
			makeNew(boardState)
		} else {
			$(".glyphicon").remove();
			for (key in boardState) {
				var ele = $("#" + key).html("<span style='' class='glyphicon glyphicon-" + boardState[key].name + " " + boardState[key].color + "'></span>")
			}
		}
	}

	function makeNew(boardState) {
		if (!boardState) {
			boardState = {};
			Chester.state.makeNewBoard = true;
		}
		Chester.ele.board.innerHTML = null;
		var row = 65;
		var col = 8;
		for (var i = 0; i < 64; i++) {
			if (i % 8 === 0 && i !== 0) {
				row = 65;
				col--;
			}
			var letter = String.fromCharCode(row);
			var boardPosition = letter + col;
			if (Chester.state.makeNewBoard) {
				if (col < 3 || col > 6) {
					boardState[boardPosition] = getNewPiece(letter, col);
				}
			}
			var boardPositionClass = "fl square";
			boardPositionClass = (isEven(i)) ? boardPositionClass + " whiteSquare" : boardPositionClass + " blackSquare";
			Chester.ele.board.appendChild(makeTile(boardPosition, boardPositionClass));
			row++;
		}
		Chester.state.makeNewBoard = false;
		Chester.board.update(boardState)
		Chester.db.ref.child("boardState").set(boardState)
	}

	function getNewPiece(l, c) {
		var newPiece = {};
		newPiece.color = (c === 8 || c === 7) ? "white" : "black";
		if (c === 2 || c === 7) {
			newPiece.name = "pawn";
			return newPiece;
		}
		if (l === "A" || l === "H") {
			newPiece.name = Chester.consts.pieces.tower;
		} else if (l === "B" || l === "G") {
			newPiece.name = Chester.consts.pieces.knight;
		} else if (l === "C" || l === "F") {
			newPiece.name = Chester.consts.pieces.bishop;
		} else if (l === "D") {
			newPiece.name = Chester.consts.pieces.queen;
		} else if (l === "E") {
			newPiece.name = Chester.consts.pieces.king;
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

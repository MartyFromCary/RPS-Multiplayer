"use strict";
const myUnset = "";
var playing = false;
var opponentChoiceIndex;

const imagesRPS = {
  rock: "https://static.pexels.com/photos/268018/pexels-photo-268018.jpeg",
  paper: "https://static.pexels.com/photos/479444/pexels-photo-479444.jpeg",
  scissors:
    "https://media1.picsearch.com/is?dKwmDvH9LH873_IpmAkHG_BWWQ5vHVh4WHD8wON7wtc"
};

const emptyImage =
  "https://media1.picsearch.com/is?MCHR0iSPWmA1i6V4CZdJsyaMuPdJ4VLsPWP8Cm_-qZw";

const resultsMatrix = {
  rock: {
    rock: "tie",
    paper: "lose",
    scissors: "win"
  },
  paper: {
    rock: "win",
    paper: "tie",
    scissors: "lose"
  },
  scissors: {
    rock: "lose",
    paper: "win",
    scissors: "tie"
  }
};

var scoreDiv = {};
var scoreNum = {
  win: 0,
  lose: 0,
  tie: 0
};

var myName = "",
  oppoName = "Mikey";
var myChoice, oppoChoice;

var classChoice;
var nameSubmit;
var submitBtn;
var gameComment;

var dbContent = {
  Name0: myUnset,
  Name1: myUnset,
  Choice0: myUnset,
  Choice1: myUnset
};

var playObj = {
  opponentName: null,
  myPlay: myUnset,
  opponentPlay: myUnset
};

firebase.initializeApp({
  apiKey: "AIzaSyDXKUqp98KcPEz9mZ73yN-JeVt9tKhIy3Y",
  authDomain: "bootcampfb-540310.firebaseapp.com",
  databaseURL: "https://bootcampfb-540310.firebaseio.com",
  projectId: "bootcampfb-540310",
  storageBucket: "bootcampfb-540310.appspot.com",
  messagingSenderId: "802837114116"
});

var numConn = 0;
const dataBase = firebase.database();
const dbRefRPS = dataBase.ref("RPS");
const connRef = dataBase.ref("RPSconnections");
const connectedRef = dataBase.ref(".info/connected");

function clearRSP() {
  dbRefRPS.set({
    Name0: myUnset,
    Name1: myUnset,
    Choice0: myUnset,
    Choice1: myUnset
  });
}

// When first loaded or when the connections list changes...
connRef.on("value", function(snap) {
  // The number of online users is the number of children in the connections list.
  let n = snap.numChildren();
  //alert(`n: ${n}`);
  if ((numConn == 0) & (n == 1)) {
    // I'm the first
    numConn = n;
    clearRSP();
    return;
  }
});

connectedRef.on("value", function(snap) {
  // If they are connected..
  if (snap.val()) {
    var con = connRef.push(true);
    // Remove user from the connection list when they disconnect.
    con.onDisconnect().remove();
  }
});

var dataRPS;

function waitingForOpponent() {
  if (
    dataRPS.Name1 !== dbContent.Name1 &&
    dataRPS.Name0 === dbContent.Name0 &&
    dataRPS.Name1 !== myUnset
  ) {
    dbContent.Name1 = dataRPS.Name1;
    playObj.opponentName = dataRPS.Name1;

    foundOpponent();
    return;
  }
  setTimeout(waitingForOpponent, 500);
} // waitingForOpponent

function foundOpponent() {
  if (playObj.opponentName !== null) {
    gameComment.html(`Your opponent is ${playObj.opponentName}<br>Let's play!`);
    playing = true;
  } // show begin message
}

function resetBets() {
  dbRefRPS.update({
    Choice0: myUnset,
    Choice1: myUnset
  });
  myChoice.attr("src", emptyImage);
  oppoChoice.attr("src", emptyImage);
  gameComment.html("Mesdames, Messieurs<br>Faites vos Jeux");
  playing = true;
}

function checkBets() {
  var myPlay = playObj.myPlay;
  var opponentPlay = playObj.opponentPlay;
  var result = resultsMatrix[myPlay][opponentPlay];
  var message;

  switch (result) {
    case "tie":
      message = "you tie!";
      break;
    case "win":
      message = `${myPlay} beats ${opponentPlay}, you win!`;
      break;
    case "lose":
      message = `${opponentPlay} beats ${myPlay}, you lose!`;
      break;
  }

  gameComment.html(message);
  scoreNum[result]++;
  scoreDiv[result].text(scoreNum[result]);

  setTimeout(resetBets, 3000);
}

function checkOpponentBet() {
  if (dataRPS[opponentChoiceIndex] !== myUnset) {
    dbContent[opponentChoiceIndex] = dataRPS[opponentChoiceIndex];
    playObj.opponentPlay = dbContent[opponentChoiceIndex];
    oppoChoice.attr("src", imagesRPS[playObj.opponentPlay]);
    setTimeout(checkBets, 1000);
  } else {
    setTimeout(checkOpponentBet, 500);
  }
}

$(document).ready(function() {
  myChoice = $("#my-choice");
  oppoChoice = $("#oppo-choice");
  myChoice.attr("src", emptyImage);
  oppoChoice.attr("src", emptyImage);

  $("#image-rock").attr("src", imagesRPS.rock);
  $("#image-paper").attr("src", imagesRPS.paper);
  $("#image-scissors").attr("src", imagesRPS.scissors);
  nameSubmit = $("#name-submit");
  submitBtn = $("#submitBtn");
  gameComment = $("#status");

  scoreDiv = {
    win: $("#wins"),
    tie: $("#ties"),
    lose: $("#losses")
  };

  classChoice = $(".choose");

  classChoice.on("click", function() {
    if (!playing) {
      return;
    }
    playing = false;
    let dataChoice = $(this).data("choice");
    //alert("choice: "+dataChoice);
    playObj.myPlay = dataChoice;
    myChoice.attr("src", imagesRPS[playObj.myPlay]);

    if (playObj.opponentName === dataRPS.Name1 && dataRPS.Choice0 === myUnset) {
      dbContent.Choice0 = playObj.myPlay;
      dbRefRPS.update({
        Choice0: dbContent.Choice0
      });
      opponentChoiceIndex = "Choice1";
      checkOpponentBet();
      return;
    }

    if (playObj.opponentName === dataRPS.Name0 && dataRPS.Choice1 === myUnset) {
      dbContent.Choice1 = playObj.myPlay;
      dbRefRPS.update({
        Choice1: dbContent.Choice1
      });
      opponentChoiceIndex = "Choice0";
      checkOpponentBet();
      return;
    }
  });

  submitBtn.click(function() {
    let name = nameSubmit.val().trim();
    if (name != "" && name == myName) {
      gameComment.html("I know already!");
      return;
    }
    if (myName != "") {
      gameComment.html(`Too late<br>I've marked you as ${myName}`);
      return;
    }
    if (name == "") {
      gameComment.html("Come on, what's your name?");
      return;
    }

    myName = name;
    if (dataRPS.Name0 === myUnset) {
      dbContent.Name0 = myName;
      dbRefRPS.update({
        Name0: dbContent.Name0
      });
      dbContent.Name0 = dataRPS.Name0;
      gameComment.html(`Hello, ${myName}<br>Waiting for an opponent`);
      waitingForOpponent();
      return;
    }
    if (dataRPS.Name1 === myUnset && dataRPS.Name0 != dbContent.Name0) {
      dbContent.Name1 = myName;
      dbRefRPS.update({
        Name1: dbContent.Name1
      });
      dbContent.Name1 = dataRPS.Name1;
      playObj.opponentName = dataRPS.Name0;
      foundOpponent();
      return;
    }
  });

  dbRefRPS.on("value", function(snapshot) {
    dataRPS = snapshot.val();
  });
});

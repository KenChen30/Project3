// JavaScript for Phone Application Demo Program Using Express and REST
// Jim Skon, Kenyon College, 2020
const port='9018' // Must match port used on server, port>8000
const Url='http://jimskon.com:'+port
var operation;	// operation
var selectid;
var recIndex
var rows;
var saveRecord; // Place to store record for add varification
var loggedIn = false;
var UserID;
var LikeStatus = false;

// Set up events when page is ready
$(document).ready(function () {

    // get the UID
    var url = window.location.href;
    params=getParams(url);
    UserID=params.UID;
    console.log("UID:",UserID);
    checkUID();

    $("#modalLRForm").modal('show');

    // For this program is will be a reponse to a request from this page for an action

    operation = "Author"; // Default operation

    $("#search-btn").click(getMatches).click(checkUID);  // Search button click
    // do a search on every keystroke.
    $("#search").keyup(function(e){
	getMatches();
    });
    $("#add-btn").click(addEntry);
    $("#clear").click(clearResults);
    var randomID=randomPicture();
    console.log("this is randomID"+randomID);
    $("#randomPicComment").click(addCommentRandPic);
    // $("#login-btn").click(login);
    // $("#login-btn").click(setCookie);
    //Handle pulldown menu
    $(".dropdown-menu li a").click(function(){
	$(this).parents(".btn-group").find('.selection').text($(this).text());
	operation=$(this).text().split(" ").pop();  // Get last word (Last, First, Type, New)
	//console.log("pick!"+operation);

	changeOperation(operation);
    });

    $('.completeDelete').click(processDelete);

});

//
// function randomPicID(ranId){
//   var picYear = new Date().getFullYear();
//   var picMonth = new Date().getMonth() + 1;
//   var picDay = new Date().getDate();
//   var picNum = 49567;
//   var picConst = 1123;
//   var picRan = picMonth*1000000 + picDay*10000 + picYear;
//   var picIndex = ((1+picRan)%picNum)+1;
//   ranId=picIndex;
//   return ranId;
// }

function checkUID() {
  var checkID = UserID;
  if (checkID === undefined && window.location.href=== Url+"/artApp.html") {
    location.replace(Url);
  }
}

// This processes the results from the server after we have sent it a lookup request.
// This clears any previous work, and then calls buildTable to create a nice
// Table of the results, and pushes it to the screen.
// The rows are all saved in "rows" so we can later edit the data if the user hits "Edit"
function processResults(results) {
    $('#editmessage').empty();
    $('#addmessage').empty();
    //console.log("Results:"+results);
    $('#searchresults').empty();
    $('#searchresults').append(buildTable(results));

}

// function processPost(results) {
//   $('#postpage').append("sth?");
// }

// This function is called when an option is selected in the pull down menu
// If the option is "Add New" the shows the add form, and hides the others
// Otherwise it shows the ss div
function changeOperation(operation){
    if(operation=="New"){
	$('#addmessage').val("");
	$('.inputdata').show();
	$('.searchbox').hide();
	$('.results').hide();
	$('.editdata').hide();}
    else{
	$('.editdata').hide();
	$('.inputdata').hide();
	$('.results').show();
	$('.searchbox').show();
    }
}

function setCookie() {
  document.cookie='myCookie='+value;
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Build output table from comma delimited data list from the server (a list of phone entries)
function buildTable(data) {
    rows=JSON.parse(data);
    if (rows.length < 1) {
	return "<h3>Nothing Found</h3>";
    } else {
	var result = '<table class="w3-table-all w3-hoverable" border="2"><tr><th>Author</th><th>Title</th><th>Date</th><th>Image</th><th>Hide</th><tr>';
	var i=0;
	rows.forEach(function(row) {


      result+=makeModal(row,i);
      i++;
	})
	result += "</table>";

	return result;
    }
}


function makeModal(row,i){
  var result = "<tr><td class='author'>"+row.Author+"</td><td class='title'>"+row.Title+"</td><td class='date'>"+row.Date+"</td><td><button onclick=\"showInfo('myButton"+i+"')\">Show Image</button><div id=\"myButton"+i+"\" style=\"display:none;\"><img src="+row.IMGURL+" width='300' height='300'></div></td><td><button onclick=\"showPostModal(myPost"+i+")\" data-toggle=\"modal\" data-target=\"#myPost"+i+"\">Open Art Page</button></td>";
  result += "<div class=\"modal\" id=\"myPost"+i+"\" style=\"display:none;\"><div class=\"modal-dialog modal-lg\">";
  result += "<div class=\"modal-content\"><div class=\"modal-header\"><h4 class=\"modal-title\">"+row.Title+"</h4>";
  result += "<button type=\"button\" class=\"close\" data-dismiss=\"modal\"></button></div><div class=\"modal-body\"><br><img src="+row.IMGURL+" width='300' height='300'>";
  result += "</br>"+row.Author+"<br/>"+row.Location+"<br/>"+row.Technique+"<br/>"+row.Form+"<br/>"+row.Type+"<br/>"+row.School+"<br/>"+row.Timeframe+"<br/>"+"<a style='color:blue;' href="+row.URL+">Art Page Link</a><br/>";
  result += "<div id=\"Like"+i+"\"></div><div id='loading' style=display:none;></div></br>";
  getLike(row.ID,i);
  result += "<button onclick=\"addLike("+row.ID+")\">Like</button>";
  result += "<div id=\"myComment"+i+"\"></div><div id='loading' style=display:none;></div>";
  getComments(row.ID,i);
  result += "<input type=\"text\" id=\"userComment\" class=\"form-control\" placeholder=\"Add Comment\"><button onclick=\"addComment("+row.ID+")\">Comment</button>";
  result += "<div id=\"postpage\"></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button></div></div></div></div>";
  return result;

}

function getLike(xid,i) {
  $.ajax({
      url: Url+'/getLike?ID='+xid,
      type:"GET",
      index:i,
      success: function (result){
        processLike(result,this.index)
      },
      error: displayError
  })
}

function processLike(results,i) {
  rows=JSON.parse(results);
  if (rows.length < 1) {
    return "<h3>Nothing Found</h3>";
  } else {
    var results = '';
    var j=0;
    rows.forEach(function(row) {
        results += "Likes" + ": "+ row.NumLike + "<br>";
        j++;
    })
  }
  console.log(results);
  $('#Like'+i).append(results);
}

function addLike(artID){

  var stringUserID = UserID;
  $.ajax({
      url: Url+'/addLike?RatingUserID='+stringUserID+'&RatingArtID='+artID,
      type:"GET",
      success: processAddLike,
      error: displayError
})
}
function processAddLike() {
    console.log("Like = Success");
    location.replace(window.location.href)

}



function getComments(id,i){

  $.ajax({
      url: Url+'/listComments?ID='+id,
      type:"GET",
      index:i,
      success: function (result){
        processComment(result,this.index)
      },
      error: displayError
  })
}



function processComment(results,i){
    rows=JSON.parse(results);
    if (rows.length < 1) {
	    return "<h3>Nothing Found</h3>";
    } else {
      var results = '';
    	var j=0;
    	rows.forEach(function(row) {
          results += row.Username + ": "+ row.Comment + "<br>";
          j++;
    	})
    }
    console.log(results);
    $('#myComment'+i).append(results);
}










function buildPostPage(artRow) {
	var result;
  result += 1;

	return result;
}

function hideTable(){
  document.getElementById('searchresults').style.visibility = "hidden";
}

function showTable(){
document.getElementById('searchresults').style.visibility = "visible";
}

function showInfo(myButton) {
  var x = document.getElementById(myButton);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

function showPostModal(myPost) {
  // var x = document.getElementById(myPost);
  // console.log(myPost);
  // console.log(x);
  if (myPost.style.display === "none") {
    myPost.style.display = "block";
    myPost.style.display = "none";
  }else {
  myPost.style.display = "none";

}
}

// Called when the user clicks on the Edit button on the results list from a search
// This clears the search  results and shows the edit form, filling it in with the data from the associated record.
// We get the "row" node for $(this) so we have the tight record to edit
// Since this is a result of a button click, we look up the 'ID' of '$(this)' to get the ID of the record to edit
// The record ID is then saved in selectID so we know which record to update with the save button is pushed
// We fill in the edit form with the data from the record from this row.

// This is called when the "Save" button in the edit form is pressed.
// It takes the updated data, and the saves "selectid", and sends the record to the server
// ot update the database.


// Process a completed update process
function processUpdate(results) {
    // Look up the record and display it
    $('.editdata').hide();
    $.ajax({
        url: Url+'/find?field=ID'+'&search='+selectid,
        type:"GET",
        success: processResults,
        error: displayError
    })

}

// Process a completed add process
function processAdd(results) {
    // Look up the record and display it
    console.log("Add success:"+saveRecord);
    $('.editdata').hide();
    $('#addchangemodal').modal();
    $('#modalMessage').text("Record added: "+saveRecord);
    $('#messageTitle').text("Record Added");
}

// This is called when the user hits the "Add button" in the add screen.
// It calls the server with the fields they entered.
function addEntry(){
    $('#searchresults').empty();
    console.log("Add:"+$('#addusername').val());
    saveRecord=$('#addusername').val()+', '+$('#addpassword').val()+', '+$('#addbio').val()
    $.ajax({
        url: Url+'/addrec?Username='+$('#addusername').val()+'&Password='+$('#addpassword').val()+'&Bio='+$('#addbio').val(),
        type:"GET",
        success: processAdd,
        error: displayError
    })
}
function processRandomPic(results){

  rows=JSON.parse(results);

  imgURL = rows[0].IMGURL;
  randomPicID = rows[0].ID;
  console.log("This is randomID"+randomPicID);
  $('#randomPic').append("<img src="+imgURL+" width='60%' height='60%'>");
  return randomPicID;

}
// This is called when the user clicks on a "Delete" button on a row matches from a search.
// It puts up a modal asking the user to confirm if they really want to delete this record.  If they
// hit "Delete record", the processDelete function is called to do the delete.


// Calls the server with a recordID of a row to delete
function processDelete(){
    var id=$(this).attr('ID');
    $.ajax({
    	type: "DELETE",
	    url: Url+'/delete?ID='+selectid,
	    success: deleteComplete,
    	error: displayError
    })
}

// Process a completed delete
function deleteComplete(results) {
    console.log("Delete success:"+saveRecord);
    $('.editdata').hide();
    $('#addchangemodal').modal();
    $('#modalMessage').text(saveRecord);
    $('#messageTitle').text("Record deleted");
}

function displayError(error) {
    console.log('Error ${error}');
}

// Clears the search results area on the screen
function clearResults() {
    $('#searchresults').empty();
}


function addComment(artID){
    console.log("Add:"+$('#userComment').val());
    saveRecord=$('#userComment').val();
    var stringUserID = UserID;
    $.ajax({
        url: Url+'/addComment?UserID='+stringUserID+'&Comment='+saveRecord+'&ArtID='+artID,
        type:"GET",
        success: processAddComment,
        error: displayError
  })
}


function addCommentRandPic(){

    console.log("Add:"+$('#RandPicComment').val());
    var commentRanID="";
    commentRanID=randomPicID(commentRanID);
    saveRecord=$('#RandPicComment').val();
    var stringUserID = UserID;
    $.ajax({
        url: Url+'/addComment?UserID='+stringUserID+'&Comment='+saveRecord+'&ArtID='+commentRanID,
        type:"GET",
        success: processAddComment,
        error: displayError
  })
}

function processAddComment(results) {
    // Look up the record and display it
    console.log("Add success:"+saveRecord);

}
// function authenticate() {
//   var password = document.getElementById('loginpassword').value;
//   var username = document.getElementById('loginusername').value;
//   loggedIn = login(password,username);
//   status();
// }

function userInfo(){

  $.ajax({
      url: Url+'/addrec?Username='+$('#addusername').val()+'&Password='+$('#addpassword').val()+'&Bio='+$('#addbio').val(),
      type:"GET",
      success: processAdd,
      error: displayError
  })
}

function login(results) {
  $.ajax({
      url: Url+'/auth?Username='+$('#loginusername').val()+'&Password='+$('#loginpassword').val(),
      type:"GET",
      success: processLogin,
      error: displayError
  })

}




function randomPicture(){
  var randomPicID="";
  $.ajax({
      url: Url+'/picture?',
      type:"GET",
      success: processRandomPic,
      error: displayError
  })
  console.log(randomPicID);
}


function processLogin(results) {
    // Logged in and tell them their logged in
    console.log("Login Success");
    loggedIn===True;
    console.log(loggedIn)

}

// function homepage(){
//   $('.editdata').hide();
//   $.ajax({
//       url: Url+'/home?',
//       type:"GET",
//       success: processResults,
//       error: displayError
//   })
// }
// function status() {
//   if(loggedIn) {
//     console.log('You are in :)');
//   } else {
//     console.log('You are not in :(');
//   }
// }

// Called when the user hits the "Search" button.
// It sends a request to the server (operation,search string),
// Where operation is one of (Last, First, Type)

function getMatches(){
    $('.editdata').hide();
    var search = $('#search').val();
    $('#searchresults').empty();
    $.ajax({
	     url: Url+'/find?field='+operation+'&search='+search,
	     type:"GET",
	     success: processResults,
	     error: displayError
    })

}

var getParams = function (url) {
  var params = {};
  var parser = document.createElement('a');
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
};

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
var randomPicID;

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
    randomPicture();

    $("#randomPicLike").click(addLikeRandPic);
    $("#randomPicComment").click(addCommentRandPic);

    $(".dropdown-menu li a").click(function(){
	$(this).parents(".btn-group").find('.selection').text($(this).text());
	operation=$(this).text().split(" ").pop();  // Get last word (Last, First, Type, New)


	changeOperation(operation);
    });


});


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
    rows=JSON.parse(results);
    if (rows[0].Author === undefined) {
      $('#searchresults').append(buildUserTable(results));
    }
    else {
      $('#searchresults').append(buildTable(results));
    }

}


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


// Build output table from comma delimited data list from the server (a list of either username or art piece information taken from sql server)
function buildTable(data) {
    rows=JSON.parse(data);
    if (rows.length < 1) {
	return "<h3>Nothing Found</h3>";
    } else {
	var result = '<table class="w3-table-all w3-hoverable" border="2"><tr><th>Author</th><th>Title</th><th>Date</th><th>Image</th><th>Hide</th></tr>';
	var i=0;
	rows.forEach(function(row) {
      result+=makeModal(row,i);
      i++;
	})
	result += "</table>";

	return result;
    }
}
//builds table for the user info when searched
function buildUserTable(data) {
  rows=JSON.parse(data);
  if (rows.length < 1) {
    return "<h3>Nothing Found</h3>";
  } else {
    var result = '<table class="w3-table-all w3-hoverable" border="2"><tr><th>User Name</th><th>Bio</th></tr>';
    var i=0;
    rows.forEach(function(row) {
      result+="<tr><td class='username'>"+row.Username+"</td><td class='bio'>"+row.Bio+"</td></tr>";
      i++;
})
result += "</table>";

return result;
  }
}
//creates modal for each art piece to display their information
function makeModal(row,i){
  var result = "<tr><td class='author'>"+row.Author+"</td><td class='title'>"+row.Title+"</td><td class='date'>"+row.Date+"</td><td><img src="+row.IMGURL+" class=\"img-thumbnail\" width='20%' height='20%'></td><td><button onclick=\"showPostModal(myPost"+i+")\" data-toggle=\"modal\" data-target=\"#myPost"+i+"\">Open Art Page</button></td>";
  result += "<div class=\"modal\" id=\"myPost"+i+"\" style=\"display:none;\"><div class=\"modal-dialog modal-lg\">";
  result += "<div class=\"modal-content\"><div class=\"modal-header\"><h4 class=\"modal-title\">"+row.Title+"</h4>";
  result += "<button type=\"button\" class=\"close\" data-dismiss=\"modal\"></button></div><div class=\"modal-body\"><br><img src="+row.IMGURL+" width='300' height='300'>";
  result += "</br>Author: "+row.Author+"<br/>Art Origin: "+row.Location+"<br/>Art Technique: "+row.Technique+"<br/>Art Form: "+row.Form+"<br/>Art Type: "+row.Type+"<br/>School's country type: "+row.School+"<br/>Timefram: "+row.Timeframe+"<br/>"+"<a style='color:white;' href="+row.URL+">Art Page Link</a><br/>";
  result += "<div id=\"Like"+i+"\"></div><div id='loading' style=display:none;></div></br>";
  getLike(row.ID,i);
  result += "<button onclick=\"addLike("+row.ID+")\">Like</button>";
  result += "<div id=\"myComment"+i+"\"></div><div id='loading' style=display:none;></div>";
  getComments(row.ID,i);
  result += "<input type=\"text\" id=\"userComment"+i+"\" class=\"form-control\" placeholder=\"Add Comment\"><button onclick=\"addComment("+row.ID+","+i+")\">Comment</button>";
  result += "<div id=\"postpage\"></div></div><div class=\"modal-footer\"><button type=\"button\" class=\"btn btn-secondary\" data-dismiss=\"modal\">Close</button></div></div></div></div>";
  return result;

}
//shows number of likes when called to display on the modal for each artpiece
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
//when like button is pressed it is called and adds changes to the sql server
function processLike(results,i) {
  rows=JSON.parse(results);
  if (rows.length < 1) {
    return "<h3>Nothing Found</h3>";
  } else {
    var likeResult = '';
    likeResult = "Likes" + ": "+ rows[0].NumLike;
  }
  console.log("This is the likeResult in the processLike "+likeResult);
  $('#Like'+i).text(likeResult);
}
//gets and displays the random picture
function randomPicture(){
  var randomPicID="";
  $.ajax({
      url: Url+'/picture?',
      type:"GET",
      success: processRandomPic,
      error: displayError
  })
  console.log("This is the randomPicID in randomPicture function: "+randomPicID);
}
//gets and displays the random picture
function processRandomPic(results){
  rows=JSON.parse(results);
  imgURL = rows[0].IMGURL;
  randomPicID = rows[0].ID;
  getRandomLike();
  getRandomComment();
  console.log("This is randomID"+randomPicID);
  $('#randomPic').append("<img src="+imgURL+" width='60%' height='60%'>");

}
//gets the random picture's amount of likes
function getRandomLike() {
  console.log("This is the id in getRandomlike: "+randomPicID);
  $.ajax({
      url: Url+'/getLike?ID='+randomPicID,
      type:"GET",
      success:processRandomLike,
      error: displayError
  })
}
//when the getrandomlike is a success this is called to display on the client side
function processRandomLike(results) {
  rows=JSON.parse(results);
  if (rows.length < 1) {
    return "<h3>Nothing Found</h3>";
  } else {
    var likeResult = '';
    likeResult = "Likes" + ": "+ rows[0].NumLike;
  }
  console.log("This is the likeResult in the processRandomLike "+likeResult);
  $('#randomPicShowLike').text(likeResult);
}
//adds the like whenever like button is pressed
function addLike(artID){

  var stringUserID = UserID;
  $.ajax({
      url: Url+'/addLike?RatingUserID='+stringUserID+'&RatingArtID='+artID,
      type:"GET",
      success: processAddLike,
      error: displayError
})
}
//the client side function is this and reloads the page so user can see the difference in number of likes
function processAddLike() {
    console.log("Like = Success");
    location.replace(window.location.href);
    alert("Artpiece liked");

}
//adds like on the random picture
function addLikeRandPic(){
    var stringUserID = UserID;
    console.log("This is the pic id right before add Like "+randomPicID);
    $.ajax({
        url: Url+'/addLike?RatingUserID='+stringUserID+'&RatingArtID='+randomPicID,
        type:"GET",
        success: processAddLike,
        error: displayError
  })
}
//gets the comment of the random picture to display
function getRandomComment(){

  $.ajax({
      url: Url+'/listComments?ID='+randomPicID,
      type:"GET",
      success:processRandomComment,
      error: displayError
  })
}


//when getrandomcomment is a success this is called to display the comments for the client side
function processRandomComment(results){
    rows=JSON.parse(results);
    if (rows.length < 1) {
	    return "<h3>Nothing Found</h3>";
    } else {
      var results = '';
    	var j=0;
    	rows.forEach(function(row) {
          results += row.Username + ": "+ row.Comment + "<br/>";
          j++;
    	})
    }
    console.log(results);
    $('#randomPicShowComment').html(results);
}

//gets all the comments based on the art id a
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


//when the getcomment is success this is called to display the comment on the client side
function processComment(results,i){
    rows=JSON.parse(results);
    if (rows.length < 1) {
	    return "<h3>Nothing Found</h3>";
    } else {
      var results = '';
    	var j=0;
    	rows.forEach(function(row) {
          results += row.Username + ": "+ row.Comment + "<br/>";
          j++;
    	})
    }
    console.log(results);
    $('#myComment'+i).html(results);
}

//hides the table when button is clicked
function hideTable(){
  document.getElementById('searchresults').style.visibility = "hidden";
}
//shows the table when show button is clicked
function showTable(){
document.getElementById('searchresults').style.visibility = "visible";
}
//function for showing the button
function showInfo(myButton) {
  var x = document.getElementById(myButton);
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}
//function for showing the modal for each art piece including all the information
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

//displays error whenever ajax is a failure
function displayError(error) {
    console.log('Error ${error}');
}

// Clears the search results area on the screen
function clearResults() {
    $('#searchresults').empty();
}
//adds comment for each art piece whenever users comment on the art piece
function addComment(artID,i){
    console.log("Add:"+$('#userComment').val());
    saveRecord=$('#userComment'+i).val();
    var stringUserID = UserID;
    $.ajax({
        url: Url+'/addComment?UserID='+stringUserID+'&Comment='+saveRecord+'&ArtID='+artID,
        type:"GET",
        success: processAddComment,
        error: displayError
  })
}

//adds comments on the random picture of the day
function addCommentRandPic(){

    console.log("Add:"+$('#RandPicComment').val());
    saveRecord=$('#RandPicComment').val();
    var stringUserID = UserID;
    console.log("This is the pic id right before add comment"+randomPicID);
    $.ajax({
        url: Url+'/addComment?UserID='+stringUserID+'&Comment='+saveRecord+'&ArtID='+randomPicID,
        type:"GET",
        success: processAddComment,
        error: displayError
  })
}
//adds comment for each art pieec on the server side.
function processAddComment(results) {
    // Look up the record and display it
    console.log("Add success:"+saveRecord);
    location.replace(window.location.href);
    alert("Comment Added");

}
//calls in the userinformation  whenever someone registers for an account
function userInfo(){

  $.ajax({
      url: Url+'/addrec?Username='+$('#addusername').val()+'&Password='+$('#addpassword').val()+'&Bio='+$('#addbio').val(),
      type:"GET",
      success: processAdd,
      error: displayError
  })
}

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

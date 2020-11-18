// JavaScript for Phone Application Demo Program Using Express and REST
// Jim Skon, Kenyon College, 2020
const port='9002' // Must match port used on server, port>8000
const Url='http://jimskon.com:'+port
var operation;	// operation
var selectid;
var recIndex
var rows;
var saveRecord; // Place to store record for add varification
// Set up events when page is ready
$(document).ready(function () {
    // For this program is will be a reponse to a request from this page for an action

    operation = "Last"; // Default operation

    // Clear everything on startup
    $('.editdata').hide();
    $("#search-btn").click(getMatches);  // Search button click
    // do a search on every keystroke.
    $("#search").keyup(function(e){
	getMatches();
    });
    $("#add-btn").click(addEntry);
    $("#clear").click(clearResults);

    //Handle pulldown menu
    $(".dropdown-menu li a").click(function(){
	$(this).parents(".btn-group").find('.selection').text($(this).text());
	operation=$(this).text().split(" ").pop();  // Get last word (Last, First, Type, New)
	//console.log("pick!"+operation);
	changeOperation(operation);
    });

    $('.completeDelete').click(processDelete);

});

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
    $(".edit").click(processEdit);
    $(".delete").click(DeleteConfirm);

}
changeOperation(operation);

// This function is called when an option is selected in the pull down menu
// If the option is "Add New" the shows the add form, and hides the others
// Otherwise it shows the results div
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

// Build output table from comma delimited data list from the server (a list of phone entries)
function buildTable(data) {
    rows=JSON.parse(data);
    if (rows.length < 1) {
	return "<h3>Nothing Found</h3>";
    } else {
	var result = '<table class="w3-table-all w3-hoverable" border="2"><tr><th>First</th><th>Last</th><th>Phone</th><th>Type</th><th>Action</th><tr>';
	var i=0
	rows.forEach(function(row) {
	    result += "<tr><td class='first'>"+row.First+"</td><td class='last'>"+row.Last+"</td><td class='phone'>"+row.Phone+"</td><td class='type'>"+row.Type+"</td>";
	    result += "<td><button type='button' ID='"+row.ID+"' class='btn btn-primary btn-sm edit'>Edit</button> ";
	    result += "<button type='button' ID='"+row.ID+"' Index='"+i+"' class='btn btn-primary btn-sm delete'>Delete</button></td></tr>";
	    i++;
	})
	result += "</table>";

	return result;
    }
}
// Called when the user clicks on the Edit button on the results list from a search
// This clears the search  results and shows the edit form, filling it in with the data from the associated record.
// We get the "row" node for $(this) so we have the tight record to edit
// Since this is a result of a button click, we look up the 'ID' of '$(this)' to get the ID of the record to edit
// The record ID is then saved in selectID so we know which record to update with the save button is pushed
// We fill in the edit form with the data from the record from this row.
function processEdit(){
    $('#searchresults').empty();
    $('.editdata').show();
    $("#edit-btn").click(updateEntry);
    console.log("Edit Record: " + $(this).attr('ID'));
    var row=$(this).parents("tr");
    //console.log("First name of record: "+ $(row).find('.first').text());
    selectid=$(this).attr('ID');

    $('#editfirst').val( $(row).find('.first').text());
    $('#editlast').val( $(row).find('.last').text());
    $('#editphone').val( $(row).find('.phone').text());
    $('#edittype').val( $(row).find('.type').text());
}
// This is called when the "Save" button in the edit form is pressed.
// It takes the updated data, and the saves "selectid", and sends the record to the server
// ot update the database.
function updateEntry(){
    //console.log("Edit: Firstname:" + $('#editfirst').val() + "ID:" + selectid);
    $('#searchresults').empty();
    recAdded = $('#editfirst').val()+' '+$('#editlast').val()+', '+$('#editphone').val()+', '+$('#edittype').val();
    $.ajax({
        url: Url+'/update?ID='+selectid+'&First='+$('#editfirst').val()+'&Last='+$('#editlast').val()+'&Phone='+$('#editphone').val()+'&Type='+ $('#edittype').val(),
        type:"GET",
        success: processUpdate,
        error: displayError
    })
}

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
    console.log("Add:"+$('#addlast').val());
    saveRecord=$('#addfirst').val()+' '+$('#addlast').val()+','+$('#addphone').val()+', '+ $('#\
addtype').val()
    $.ajax({
        url: Url+'/addrec?First='+$('#addfirst').val()+'&Last='+$('#addlast').val()+'&Phone='+$('#addphone').val()+'&Type='+ $('#addtype').val(),
        type:"GET",
        success: processAdd,
        error: displayError
    })
}

// This is called when the user clicks on a "Delete" button on a row matches from a search.
// It puts up a modal asking the user to confirm if they really want to delete this record.  If they
// hit "Delete record", the processDelete function is called to do the delete.
function DeleteConfirm() {
    selectid=$(this).attr('ID');
    recIndex=$(this).attr('index');
    saveRecord=rows[recIndex].First+" "+rows[recIndex].Last;
    clearResults();
    $('#deleteMessage').text("Delete: "+rows[recIndex].First+" "+rows[recIndex].Last+"?");
    $('#deleteconfirm').modal('show');

}
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

// Sample Art social media app using Nodejs, mySql, and REST
// Takashi, Lucas, Ken, Joshua, Kenyon, Summer 2020
var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

// set to your port
var port = 9018
app.use(express.static(path.join(__dirname+'/public')));
//Serve up web page as the default
app.get('/', function (req, res) {
    res.sendFile( __dirname + "/public/" + "login.html" );
})

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


function openSQL() {
    // Login to MySQL
    var con = mysql.createConnection({
    	host: "localhost",
    	user: "kanazawa1",
    	password: "S218044",
    	database: "TeamA"
        });
        con.connect(function(err) {
            if (err) throw err;
        });
        return con;
}
//connects ti the sql allowing res.redirect
var con = openSQL();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
//setting username, password, and bio variables
function missingField(p) {
    return (p.Username === undefined || p.Password === undefined || p.Bio === undefined );
}
//adding account records to the server
app.get('/addrec', function (req, res) {
    // update a record by id
    if (missingField(req.query)) {
        console.log("Bad add request:"+JSON.stringify(req.query));
        res.end("['fail']");
    } else {
	query = "Insert INTO UserInformation(Username, Password, Bio)  VALUES('"+req.query.Username+"','"+req.query.Password+"','"+req.query.Bio+"')";
 	console.log(query);
	con.query(query, function(err,result,fields) {
	    if (err) throw err;
	    console.log(result)
	    res.end( JSON.stringify(result));
	})
    }
})


//this function finds the art pieces based on the art id where the data is passed from the search function from artApp.js
app.get('/find', function (req, res) {
    // find record(s) by name last
    console.log("Query:"+JSON.stringify(req.query));
    if (req.query.field === undefined || req.query.search === undefined) {
    	console.log("Missing query value!");
    	res.end('[]');
    } else if (req.query.field === "Author" || req.query.field === "Date"){
    	field=req.query.field;
    	search=req.query.search;
    	console.log(field+":"+search);
      query = "SELECT * FROM art WHERE "+field+" like '%"+req.query.search+"%' limit 50";
	    console.log(query);
	    con.query(query, function(err,result,fields) {
	    if (err) throw err;
	    console.log(result)
	    res.end( JSON.stringify(result));
	    })
    }
    else {
      field=req.query.field;
    	search=req.query.search;
    	console.log(field+":"+search);
      query = "SELECT Username, Bio FROM UserInformation WHERE "+field+" like '%"+req.query.search+"%' limit 50";
	    console.log(query);
	    con.query(query, function(err,result,fields) {
	    if (err) throw err;
	    console.log(result);
	    res.end( JSON.stringify(result));
    })
  }
})

//Section for Comments and Ratings taking in all the comments givern by the user
app.get('/listComments', function (req, res) {
    // Get a list of all records
    recid=req.query.ID;
    query = "SELECT Username, Comment FROM CommentTable, UserInformation where CommentTable.UserID = UserInformation.ID and CommentTable.ArtID = "+recid;
    con.query(query, function(err,result,fields) {
	     if (err) throw err;
       if (result == null){
         console.log("No Comment")
         res.end(JSON.stringify(result));
     }else{

       console.log(result);
       res.end(JSON.stringify(result));
   }
    })

})
//adds comment that is taken from the input into the sql server
app.get('/addComment', function (req, res) {
	query = "Insert INTO CommentTable(UserID, Comment, ArtID)  VALUES('"+req.query.UserID+"','"+req.query.Comment+"','"+req.query.ArtID+"')";
 	console.log(query);
	con.query(query, function(err,result,fields) {
	    if (err) throw err;
	    console.log(result)
	    res.end(JSON.stringify(result));
	})
})
//takes the number of likes from the sql server to display on the webpage
app.get('/getLike', function (req, res) {
    // Get a list of all records
    query = "SELECT count(RatingLike) as NumLike FROM RatingTable where RatingLike = 'T' and RatingArtID = " + req.query.ID;
    con.query(query, function(err,result,fields) {
	     if (err) throw err;
       if (result == 0){
         console.log("No Like")
         res.end(JSON.stringify(result));
     }else{
       console.log(result);
       res.end(JSON.stringify(result));
   }
    })

})
//adds the number of likes everytime someone likes the webpage
app.get('/addLike', function (req, res) {
	query = "Insert INTO RatingTable(RatingUserID,RatingArtID,RatingLike)  VALUES('"+req.query.RatingUserID+"','"+req.query.RatingArtID+"','T') ON DUPLICATE KEY UPDATE RatingLike = 'F'";
 	console.log(query);
	con.query(query, function(err,result,fields) {
	    if (err) throw err;
	    console.log(result);
	    res.end(JSON.stringify(result));
	})
})
//takes in the picture id of the art and displays it.
app.get('/picture',function(req, res) {
  var picYear = new Date().getFullYear();
  var picMonth = new Date().getMonth() + 1;
  var picDay = new Date().getDate();
  var picNum = 49567;
  var picRan = picMonth*1000000 + picDay*10000 + picYear;
  var picIndex = ((1+picRan)%picNum)+1;
  //((picNum*picRan)%picConst)*picNum/picConst

  query = "SELECT IMGURL,ID FROM art where ID = "+ picIndex;
  con.query(query, function(err,result,fields) {
     if (err) throw err;
     console.log(result);
     res.end( JSON.stringify(result));
  })

} )
//authentication and login function allowing users to log in with password and bio
app.post('/auth', function(req, res) {
	var username = req.body.username;
	var password = req.body.password;
	if (username && password) {
		con.query('SELECT * FROM UserInformation WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
        var id = results[0].ID;
        console.log("This is the id"+id);
			  res.redirect("/artApp.html?UID="+id);
//        res.send('{"status":"success","ID","'+id+'"}');

			} else {
				res.send('Incorrect Username and/or Password!');
			}
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});



var server = app.listen(port, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})

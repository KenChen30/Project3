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
app.use(express.static('/public'));
//Serve up web page as the default
app.get('/', function (req, res) {
    res.sendFile( __dirname + "/public/" + "artApp.html" );
})

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

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

var con = openSQL();

app.get('/list', function (req, res) {
    // Get a list of all records
    query = "SELECT * FROM UserInformation";
    con.query(query, function(err,result,fields) {
	     if (err) throw err;
	     console.log(result)
	     res.end( JSON.stringify(result));
    })
})

app.get('/find', function (req, res) {
    // find record(s) by name last
    console.log("Query:"+JSON.stringify(req.query));
    if (req.query.field === undefined || req.query.search === undefined) {
    	console.log("Missing query value!");
    	res.end('[]');
    } else {
    	field=req.query.field;
    	search=req.query.search;
    	console.log(field+":"+search);

	query = "SELECT * FROM UserInformation WHERE "+field + "  like '%"+req.query.search+"%'";
	console.log(query);
	con.query(query, function(err,result,fields) {
	    if (err) throw err;
	    console.log(result)
	    res.end( JSON.stringify(result));
	})
    }
})

function missingField(p) {
    return (p.Username === undefined || p.Password === undefined || p.Bio === undefined );
}

app.get('/update', function (req, res) {
    // update a record by id
    if (missingField(req.query) || req.query.ID === undefined) {
        console.log("Bad update request:"+JSON.stringify(req.query));
        res.end("['fail']");
    } else {
	query = "UPDATE UserInformation SET Username='"+req.query.Username+"', Password='"+req.query.Password+"', Bio='"+req.query.Bio+"' WHERE ID='"+req.query.ID+"'";
 	console.log(query);
	con.query(query, function(err,result,fields) {
	    if (err) throw err;
	    console.log(result)
	    res.end( JSON.stringify(result));
	})
    }
})

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

app.delete('/delete', function (req, res) {
    console.log("Delete!");
    console.log("Params:"+JSON.stringify(req.query));
    recid=req.query.ID;
    if (recid === undefined || isNaN(recid)) {
    	console.log("Not a value record id to delete!");
    	res.end("['failure']");
    } else {
	query = "DELETE FROM UserInformation WHERE ID='"+recid+"'";
        console.log(query);
        con.query(query, function(err,result,fields) {
            if (err) throw err;
            console.log(result)
            res.end( JSON.stringify(result));
        })

    }
})

app.get('/:id', function (req, res) {
    // Get a record by id
    if (isNaN(req.params.id)) {
    	console.log("Bad id lookup: "+req.params.id);
    	res.end('[]');
    } else {
    	query = "SELECT * FROM UserInformation WHERE ID = "+ req.params.id;
    	console.log(query);
    	con.query(query, function(err,result,fields) {
    	    if (err) throw err;
    	    console.log(result)
    	    res.end( JSON.stringify(result));
	})
    }
})




app.post('/auth', function (req, res) {
    // Log in function
    recusername=req.query.Username;
    recpassword=req.query.Password;
    console.log(recusername)
    console.log(recpassword)
    if (recusername && recpassword) {
      query="SELECT * FROM UserInformation WHERE Username = '"+recusername+"' AND Password = '"+recpassword+"'";
      console.log(query)
      con.query(query, function(err,result,fields) {

        if (results.length > 0) {
  				req.session.loggedIn = true;
  				req.session.Username = recusername;
  				res.redirect('/home');
  			} else {
  				res.send('Incorrect Username and/or Password!');
  			}
  			res.end();
  		});

  	} else {
  		res.send('Please enter Username and Password!');
  		res.end();
  	}

})


app.get('/home', function(req, res) {
	if (req.session.loggedIn === true) {
		res.send('Welcome back, ' + req.session.Username + '!');
	} else {
		res.send('Please login to view this page!');
	}
	res.end();
});

app.listen(3000);
var server = app.listen(port, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})

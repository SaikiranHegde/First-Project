var express     = require('express');
var app         = express();
var port        = 8080;
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var bodyParser  = require('body-parser');
var router      = express.Router();
var appRoutes   = require('./app/routes/api')(router);
var path        = require('path');


app.use(morgan('dev'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static(__dirname + '/public')); //for accessing static contents directly from Frontend(URl)
app.use('/api', appRoutes);

//Mongoose configuration
mongoose.connect('mongodb://localhost:test', function(error){
    if(error){
        console.log("Not Connected " + error);
    } else{
        console.log("Connected to Database");
    }
});

//Set application static layout
app.get('/*', function(req, res){
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

//Start server
app.listen(port, function(){
     console.log("Running on port "+ port);
});
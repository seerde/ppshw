
/**
 * Module dependencies.
 */

require('autoloader').autoload(__dirname + '/src');

var express = require('express')
  , http = require('http')
  , path = require('path')
  , config = ppshw.system.Config
  , fs = require('fs')
;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
mongoose.connect(config.get('ppshw:db'));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('Db connection established.');
});

var model_path = __dirname + '/model/'
  , model_files = fs.readdirSync(model_path);
model_files.forEach(function (myfile) {
  require(model_path+'/'+myfile);
});

var app = express();

app.configure(function(){
  app.set('port', config.get('http:port'));
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var routes = require('./routes')
  , user = require('./routes/user')
  , upload = require('./routes/upload')
  , file = require('./routes/file')
;

app.get('/', routes.index);
app.get('/users', user.list);
app.post('/file/upload', upload.upload);
app.get('/file/get/:type/:digest',file.get);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


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
  , file = require('./routes/file')
  , index = require('./routes/index')
;

app.get('/', routes.index);
app.get('/users', user.list);
app.post('/file/upload', file.put);
app.get('/file/get/:type/:digest',file.get);
app.get('/file/remove/:digest',file.remove);
app.get('/filetree', index.filetree);

app.post('/file/addtags', file.addTags);
app.post('/file/removetags', file.removeTags);
app.post('/file/settags/:digest/:tags',file.setTags);
app.post('/file/gettags',file.getTags);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

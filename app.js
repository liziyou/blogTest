var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var flash   = require('connect-flash');
var bodyParser = require('body-parser');
var routes = require('./routes/index');


var mongoose = require('mongoose');
var dbName = 'simpleBlog';
var url = 'mongodb://localhost/'+dbName;
var mongoOptions = {
    server: {
        socketOptions: {
            keepAlive: 1
        }
    }
};
mongoose.connect(url, mongoOptions);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', function (err) {
    console.log('Mongo Error:' + err);
}).on('open', function () {
    console.log('Connection opened');
});

var app = express();
var session = require('express-session');
//创建mongo和session回话机制
var MongoStore = require('connect-mongo')(session);

// session 中间件
app.use(session({
    name: "userName",// 设置 cookie 中保存 session id 的字段名称
    secret: "userName",// 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
    cookie: {maxAge: 6000000},// 过期时间，过期后 cookie 中的 session id 自动删除
    store:new MongoStore({url:'mongodb://localhost/simpleBlog'}),//将session储存到mongodb中
    resave: false,
    saveUninitialized: true
}));

// 设置模板目录
app.set('views', path.join(__dirname, 'views'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());
// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 设置路由
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('post'),function(){
    console.log("Express server listening on port: " + 3000);
});

module.exports = app;
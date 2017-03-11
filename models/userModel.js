/**
 * Created by Administrator on 2017/3/8.
 */
//var mongoose = require('mongoose');
//var config = require('../cofig/config');//引用同级目录下的文件
//mongoose.connect(config.mongodb);
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    username:String,
    password:String,
    email:String
});
//这里会数据库会创建一个users集合
module.exports = mongoose.model('User', UserSchema);

/**
 * Created by Administrator on 2017/3/8.
 */
//var mongoose = require('mongoose');
//var config = require('../cofig/config');//����ͬ��Ŀ¼�µ��ļ�
//mongoose.connect(config.mongodb);
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = new Schema({
    username:String,
    password:String,
    email:String
});
//��������ݿ�ᴴ��һ��users����
module.exports = mongoose.model('User', UserSchema);

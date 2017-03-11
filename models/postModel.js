/**
 * Created by Administrator on 2017/3/8.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var PostSchema = new Schema({
    title:String,//����
    author:String,//����
    article:String,//��������
    publishTime:String,//����ʱ��
    postImg:String,//����
    comments:[{
        name:String,
        time:String,
        content:String
    }],//����
    pv:Number//���ʴ���
});

//��������ݿ�ᴴ��һ��users����
var Post = mongoose.model('Post', PostSchema);
module.exports = Post;
var mongoose = require('mongoose');
var moment = require('moment');//时间控件
var flash = require('connect-flash');
var formidable = require('formidable');//表单控件
var path = require("path");
var Post = require('./../models/postModel');
var User = require('./../models/userModel');
module.exports = function(app){
  //首页
  app.get('/',function(req,res,next){
    console.log('获得搜索字段：');
    console.log(req.query);
    var keyword = req.query.keyword ||'';
    var condition = {};
    if(keyword){
      condition.article = {$regex: keyword}
    };
    Post.find(condition).sort({"publishTime":-1}).exec(function(err,data){
      if(err){
        req.flash('err','查找错误');
        return res.redirect('/');
      }else{
        console.log("data");
        console.log(data);
        res.render('index',{
          title:'首页',
          user:req.session.user,
          success:req.flash('success').toString(),
          error:req.flash('error').toString(),
          posts:data,
          time : moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        });
      }
    });
  });

 //注册页面
  app.get('/reg',function(req,res,next){
    res.render('reg',{
      title:'注册'
    });
  });
  app.post('/reg', function (req, res) {
    var user = new User({
      username:req.body.username,
      password:req.body.password,
      email:req.body.email
    });
    if(req.body.password != req.body.passwordRepeat){

      //req.flash("error",'两次输入的密码不一致');
      res.json({flag:0,msg:'两次输入的密码不一样！'});
      console.log('两次输入的密码不一致');
      return res.redirect('/reg');//返回注册页
    }
    User.findOne({'username':user.username},function(err,data){
      if(err){
        req.flash("err",err);
        return res.redirect('/');
      }
      if(data != null){
        // req.flash('error','该用户已存在');
        console.log('该用户已存在');
        return res.redirect('/reg');//返回注册页
      }else{
        //保存新的用户
        user.save(function(err){
          if(err){
            //req.flash('err',err);
            console.log(err);
            return res.redirect('/');
          }
          //req.flash('success', '注册成功!');
          console.log('注册用户成功');
          res.redirect('/');//注册成功后返回主页
        })
      }
    })
  });
  app.get('/login',checkNoLogin,function (req, res) {
    res.render('login', {
      title: '登录'
    });
  });
  app.post('/login',checkNoLogin,function (req, res) {
    var password = req.body.password;
    console.log("得到的用户名：");
    console.log(req.body.username);
    console.log("得到的密码：");
    console.log(password);
    //检查用户是否存在
    User.findOne({'username':req.body.username},function(err,user){
      if(err){
        console.log('error','登录出错');
        req.flash('error','登录出错');
        return res.redirect('/');
      }
      console.log('得到数据：');
      console.log(user);
      //用户不存在
      if(!user){
        console.log('error','用户不存在');
        req.flash('error','用户不存在');
        return res.redirect('/login');
      }
      //判断密码是否一致
      if(user.username != password){
        console.log('error','密码错误');
        req.flash('error','密码错误');
        return res.redirect('/');
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      console.log(user.username);
      req.flash('success','登录成功');
      res.redirect('/');
    });
  });
  //文章发表
  app.get('/post',checkLogin,function (req, res) {
    res.render('post',{
      title:'发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  });
  app.post('/post',checkLogin,function(req,res,next){
    console.log('进来发表');
    var imgPath = path.dirname(__dirname) + '/public/images/';

    console.log(imgPath);
    var form = new formidable.IncomingForm(); //创建上传表单
    form.encoding = 'utf-8'; //设置编辑
    form.uploadDir = imgPath; //设置上传目录
    form.keepExtensions = true; //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024; //文件大小
    form.type = true;
    form.parse(req, function(err, fields, files) {
      if (err) {
        console.log(err);
        req.flash('error','图片上传失败');
        return;
      }
      var file = files.postImg;//获取上传文件信息

      if(file.type != 'image/png' && file.type != 'image/jpeg' && file.type != 'image/gif' && file.type != 'image/jpg'){
        console.log('上传文件格式错误，只支持png,jpeg,gif');
        req.flash('error','上传文件格式错误，只支持png,jpeg,gif');
        return res.redirect('/upload');
      }
      var title = fields.title;
      var author = req.session.user.username;
      var article = fields.article;
      var postImg = file.path.split(path.sep).pop();
      var pv = fields.pv;
      // 校验参数
      try {
        if (!title.length) {
          throw new Error('请填写标题');
        }
        if (!article.length) {
          throw new Error('请填写内容');
        }
      } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
      }
      var post = new Post({
        title:title,
        author:author,
        article:article,
        postImg:postImg,
        publishTime:moment(new Date()).format('YYYY-MM-DD HH:mm:ss').toString(),
        pv:pv
      });
      post.save(function(err){
        if(err){
          console.log('文章发表出现错误');
          req.flash('err','文章发表出现错误');
          return res.redirect('/post');
        }
        console.log('文章录入成功');
        req.flash('success','文章录入成功');
        res.redirect('/');
      });
    });
  });

  //展示文章
  app.get('/detail',function(req,res,next){
    var id = req.query.id;
    if(id && id!=''){
      Post.update({"_id":id},{$inc:{"pv":1}},function(err){
        if(err){
          console.log(err);
          return res.redirect("back");
        };
        console.log("浏览数量+1");
      });

      Post.findById(id,function(err,data){
        if(err){
          console.log(err);
          req.flash('error','查看文章详细信息出错');
          return res.redirect('/');
        }
        res.render('detail',{
          title:'文章展示',
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString(),
          post:data,
          img:path.dirname(__dirname) + '/public/images/'+data.postImg
        })
      });
    }
  });

  //编辑文件
  app.get('/edit/:author/:title',checkLogin, function (req, res) {
    var id = req.query.id;
    Post.findById(id, function (err, data) {
      //console.log(data);
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      res.render('edit', {
        title: '编辑',
        post: data,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });
  app.post("/edit/:author/:title",checkLogin,function(req,res,next){
    var post = {
      id:req.body.id,
      author:req.session.user,
      title:req.body.title,
      article:req.body.article
    };

    console.log(post);

    ////markdow转格式文章
    //post.article = markdown.toHTML(post.article);


    Post.update({"_id":post.id},{$set:{title:post.title,article:post.article}},function(err){
      if(err){
        console.log(err);
        return;
      }
      console.log("更新成功");
      res.redirect("/");
    });
  });

  //删除文件
  app.get('/delete',checkLogin,function(req,res){
    var id = req.query.id;
    console.log(id);
    if(id && id!=''){
      Post.findByIdAndRemove(id,function(err){
        if(err){
          console.log(err);
          req.flash("success","删除文章失败");
          return req.redirect('/')
        }
        req.flash("success","删除文章成功");
        res.redirect('/');
      })
    }
  });

  //退出登录
  app.get('/logout',checkLogin,function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');//登出成功后跳转到主页
  });
};
//检测是否登录
function checkLogin(req,res,next){
  console.log('进来检查是否user')
  if(!req.session.user){
    req.flash('error','未登录，请您先登录');
    return res.redirect('/login');
  }
  next();
}
function checkNoLogin(req,res,next){
  if(req.session.user){
    req.flash('error','已登录，无需再登录');
    return res.redirect('back');
  }
  next();
}


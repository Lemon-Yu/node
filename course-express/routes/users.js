var express = require('express');
var router = express.Router();
const mongodb = require('mongodb');

// 创建一个mongodb的客户端
var MongoClient = mongodb.MongoClient;
// 创建连接数据库地址, user库
var DB_CONN_STR = 'mongodb://localhost:27017/user';

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// router.get('/login', function(req, res) {
//   // console.log(req.param('username'));
//   console.log(req.query['pwd']);
//   res.send('login success');
// });

// 注册
router.all('/registor', function(req, res) {
  var username = req.body['username'];
  var pwd = req.body['pwd'];

  var data = [{username: username, password: pwd}];

  // 操作数据库
  function insertData(db) {
    // 在admin集合上进行数据插入
    var conn = db.collection('admin');

    conn.insert(data, function(err, results) {
      if(err) {
        console.log(err);
        return;
      } else {
        req.session.username = username;
        res.redirect('/');
        //关闭数据库
        db.close();
      }
    })
  }

  // 通过mongoClinet连接数据库
  MongoClient.connect(DB_CONN_STR, function(err, db) {
    if(err) {
      console.log(err);
      return;
    } else {
      console.log('数据库连接成功');
      insertData(db);
    }
  })
})

// 登录
router.all('/login', function(req, res) {
  var username = req.body['username'];
  var pwd = req.body['pwd'];

  var data = {username: username, password: pwd}

  function findData(db) {
    var conn = db.collection('admin');
    //同时验证用户名和密码
    conn.find(data,{username:0,password:0}).toArray(function(err, results) {
      if(results.length>0) {
        req.session.username = username;
        res.redirect('/')
      } else {
        res.redirect('/login')
      }
    })
  }

  if(username&&pwd) {
    MongoClient.connect(DB_CONN_STR, function(err, db) {
      if(err) {
        console.log(err);
        return;
      } else {

        findData(db)
      }
    })
  } else {
    res.redirect('/login');
  }

});

router.all('/ajax', function(req, res) {
  console.log(req.query['a']);
  var obj = {
    test: 'message',
    admin: '12222'
  }
  res.send(obj)
})

module.exports = router;

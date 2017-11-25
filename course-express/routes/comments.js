const express = require('express');
var router = express.Router();
const mongodb = require('mongodb');
const async = require('async');

var MongoClient = mongodb.MongoClient;
var CONN_DB_STR = 'mongodb://localhost:27017/user';

// 评论
router.all('/talk', function(req, res) {
  var title = req.body['title'];
  var val = req.body['val'];
  var username = req.session.username;


  function insertData(db) {
    var conn = db.collection('comment');
    var ids = db.collection('ids');

    async.waterfall([
      function(callback) {
        // 查询并更新数据
        ids.findAndModify(
          {name: 'comment'}, //查询条件
          [['_id', 'desc']], //排序
          {$inc: {cid:1}},    //自增 cid = cid +1
          function(err, results) {
            // console.log(results.cid);
            callback(null, results.value.cid);
          }
        )
      },
      function(cid, callback) {
        var data = [{cid: cid, username: username, title: title, val: val }];
        conn.insert(data, function(err, results) {
          if(err) {
            console.log(err);
            return;
          } else {
            callback(null,'');
          }
          db.close();
        })

      }
    ], function(err, results) {
      res.redirect('/list')

    })

  }
  // 验证是否登录
  if(!username) {
    res.send('<script>alert("登录超时，请重新登录"); location.href="/login"</script>')
  } else {
    MongoClient.connect(CONN_DB_STR, function(err, db) {
      if(err) {
        console.log(err);
        return;
      } else {
        console.log('connect Success~');
        insertData(db);
      }
    })

  }

})

module.exports = router;

var express = require('express');
var router = express.Router();
const mongodb = require('mongodb');
const async = require('async');

var MongoClient = mongodb.MongoClient;
var CONN_DB_STR = 'mongodb://localhost:27017/user';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'hello world', username: req.session.username });
});

router.get('/login', function(req, res, next) {
  res.render('login', {});
});

router.get('/registor', function(req, res, next) {
  res.render('registor', {});
});

router.get('/logout', function(req, res, next) {
  req.session.username = undefined;
  res.redirect('/');
});

router.get('/comment' ,function(req, res) {
  res.render('comment', {});
});

// 列表
router.get('/list', function(req, res) {
  var pageNo = req.query['pageNo'] || 1; //当前第x页
  var pageSize = 5; //每页显示5条
  var totalPage = 0; //共x页
  var count = 0; //共x条
  //(pageNo-1)*5+1


  function findData(db) {
    var conn = db.collection('comment');
    // async.parallel([
    async.series([
      function(callback) {
        conn.find().toArray(function(err, results) {
          count = results.length;
          totalPage = Math.ceil(count/5);

          pageNo = pageNo>=totalPage ? totalPage : pageNo;
          pageNo = pageNo<1 ? 1 : pageNo;
          callback(null,'');
        })
      },
      function(callback) {
        //skip:从第几条开始显示数据, limit:显示多少条数据
        conn.find({}).sort({_id:-1}).skip((pageNo-1)*5).limit(pageSize).toArray(function(err, results) {
          // console.log(results);

          callback(null, results)
        })
      }
    ], function(err, results) {
      res.render('list',
   {
        resData: results[1],
        count: count,
        totalPage: totalPage,
        pageNo: pageNo
      })
    })




  }

  MongoClient.connect(CONN_DB_STR, function(err, db) {
    findData(db)
  })


})

// 详情
router.get('/detail', function(req, res) {
  //int从个体请求发送的时候会类型转换
  var cid = parseInt(req.query['cid']);
  console.log(cid);

  MongoClient.connect(CONN_DB_STR,function(err, db) {
    if(err) {
      console.log(err);
      return;
    } else {
      db.collection('comment').findOne({cid: cid}, function(err, item) {
        if(err) {
          console.log(err);
          return;
        } else {
          console.log(item);

          res.render('detail', {item: item});

        }
      })
    }

  })

})

module.exports = router;

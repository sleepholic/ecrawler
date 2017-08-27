var https = require("https");
var http = require("http");

var fs = require("fs");
var cheerio = require('cheerio');


var server = http.createServer(function(req, res){}).listen(50082);
var server2 = https.createServer(function(req, res){}).listen(50083);
console.log("http start");



var url = "https://e-hentai.org/s/35f1a50832/1065680-";
var pageLength = 2;
var dlUrl = '';

for (var i = 1; i <= pageLength; i++) {
    dlUrl = url + i;

    console.log(dlUrl);

    https.get(dlUrl, function(res){
        var html = '';
        // 获取页面数据
        res.on('data', function(data) {
            html += data;
        });

        // 数据获取结束
        res.on('end', function() {
            (function(i){getImg(html, i);})(i);
        });
    }).on('error', function() {
        console.log('获取数据出错！');
    });
}

function getImg(html, i) {
    if (html) {
        // 沿用JQuery风格，定义$
        var $ = cheerio.load(html);
        // 图片容器id固定
        var imgContainer = $('#i3');
        // 获取图片url
        var imgUrl = imgContainer.find('img').attr('src');
        // 获取标题
        var title = $('#i1 h1').text();

        console.log(imgUrl);

        http.get(imgUrl, function(res){
            var imgData = "";

            res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开


            res.on("data", function(chunk){
                imgData+=chunk;
            });

            res.on("end", function(){
                // fs.writeFile(__dirname + "/downImg/" + title + "/" + i + ".png", imgData, "binary", function(err){
                //     if(err){
                //         console.log("down fail");
                //     } else {
                //         console.log("down success");

                //     }
                // });
                var imgPath="/"+i+"."+imgUrl.split(".").pop();
                fs.writeFile(__dirname + "/imgs"+imgPath,imgData,"binary",function(err){
                    console.log(err);
                })
            });
        }).on('error', function() {
            console.log('下载图片出错');
        });

    } else {
        console.log('无数据传入！');
    }
}


const https = require("https");
const http = require("http");
const fs = require("fs");
const cheerio = require('cheerio');
const readline = require('readline');
// const mkdirp = require('mkdirp');
const path = require('path');  

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


//使用时第二个参数可以忽略  
function mkdir(dirpath,dirname){  
        //判断是否是第一次调用  
        if(typeof dirname === "undefined"){   
            if(fs.existsSync(dirpath)){  
                return;  
            }else{  
                mkdir(dirpath,path.dirname(dirpath));  
            }  
        }else{  
            //判断第二个参数是否正常，避免调用时传入错误参数  
            if(dirname !== path.dirname(dirpath)){   
                mkdir(dirpath);  
                return;  
            }  
            if(fs.existsSync(dirname)){  
                fs.mkdirSync(dirpath)  
            }else{  
                mkdir(dirname,path.dirname(dirname));  
                fs.mkdirSync(dirpath);  
            }  
        }  
}  


rl.question('输入页面url: ', (answer) => {
  
var server = http.createServer(function(req, res){}).listen(50082);
var server2 = https.createServer(function(req, res){}).listen(50083);
console.log("http start");



var url = answer;
var dir = '';

var getPage = function (dlUrl) {
    https.get(dlUrl, function(res){
        var html = '';
        // 获取页面数据
        res.on('data', function(data) {
            html += data;
        });

        // 数据获取结束
        res.on('end', function() {
                getImg(html);
        });
    }).on('error', function() {
        console.log('获取数据出错！');
    });
}

function getImg(html) {
    if (html) {
        // 开始获取页面元素
        var $ = cheerio.load(html);
        // 图片容器id固定
        var imgContainer = $('#i3');
        // 获取图片url
        var imgUrl = imgContainer.find('img').attr('src');
        // 下一张图的链接
        var nextUrl = imgContainer.find('a').attr('href');
        // 获取页码
        var currIndex = $('#i2 .sn div span').eq(0).text();
        var totalIndex = $('#i2 .sn div span').eq(1).text();
        

        console.log(imgUrl);

         
        //创建目录
        if (currIndex == 1) {
            // 获取标题
            var title = $('#i1 h1').text().replace('/',' ');
            dir = '../' + title;
            mkdir(dir, function(err) {
                if(err){
                    console.log(err);
                }
            });

        }
        
        // 获取此页面的图片下载存储
        http.get(imgUrl, function(res){
            var imgData = "";

            res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开


            res.on("data", function(chunk){
                imgData+=chunk;
            });

            res.on("end", function(){
                var imgPath = "/" + currIndex + "." + imgUrl.split(".").pop();
                fs.writeFile( dir + "/"+imgPath,imgData,"binary",function(err){
                    console.log(err);
                })
            });
        }).on('error', function() {
            console.log('下载图片出错');
        });

        // 获取下个页面
        if (currIndex !== totalIndex) {
            getPage(nextUrl);
        } else {
            // process.exit();
        }
    } else {
        console.log('无数据传入！');
    }
}

getPage(url);

});



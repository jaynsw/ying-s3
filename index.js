
'use strict';

//var awsconfig = require('./awsconfig');
var AWS = require('aws-sdk');
var debug = require('debug')('s3');
var fs = require('fs');
var mime = require('mime');

module.exports = function(awsconfig) {
  AWS.config.update(awsconfig);
  AWS.config.s3 = awsconfig.s3;

  let exp = {};

  exp.uploads3 = function(key, localFile) {
  	debug('uploads3:key:%s,localFile:%s', key, localFile);
  	return new Promise((resolve, reject) => {
  		var flag = false;
      var body = fs.createReadStream(localFile);
      var s3Params = {Bucket: awsconfig.s3.params.Bucket, Key: key};
      if (s3Params.ContentType === undefined) {
        var defaultContentType = 'application/octet-stream';
        s3Params.ContentType = mime.lookup(localFile, defaultContentType);
      }
      var s3obj = new AWS.S3({params: s3Params});
      s3obj.upload({Body: body}).send(function(err, data) {
        if (err) {
  				debug('uploads3:upload->error:%o', err);
          if (!flag) {
            flag = true;
            reject(err);
          }
          return;
        }
        if (!flag) {
  				debug('uploads3->SUCCESS:%s', localFile);
          flag = true;
          resolve({localFile, key});
        }
      });
  		setTimeout(() => {
  			if (!flag) {
  				debug('uploads3->timeout');
  				flag = true;
  				reject('s3 timeout:' + awsconfig.region);
  			}
  		}, awsconfig.s3.app.uploadTimeout);
  	});
  };

  exp.downloads3 = function(key, localFile) {
  	debug('downloads3->key:%s,localFile:%s', key, localFile);
  	return new Promise((resolve, reject) => {
  		var flag = false;
      var tmpFile = localFile + '.tmp';
      var file = fs.createWriteStream(tmpFile);
      var s3obj = new AWS.S3();
      s3obj.getObject({Bucket: awsconfig.s3.params.Bucket, Key: key}).
      on('httpData', function(chunk) { file.write(chunk); }).
      on('httpDone', function() {
        file.end();
      }).
      send(function(err, data) {
        if (err) {
  				debug('downloads3->error');
          fs.unlink(tmpFile, errr => {
            if (!errr && !flag) {
              flag = true;
              reject(err);
            }
          });

          return;
        }
  			debug('downloads3->SUCCESS');
        fs.rename(tmpFile, localFile, errr => {
          if (!errr && !flag) {
  					debug('rename->SUCCESS:%s', localFile);
            flag = true;
            resolve({localFile, key});
          }
        });
      });
  		setTimeout(() => {
  			if (!flag) {
  				flag = true;
  				reject('s3 timeout:' + awsconfig.region);
  			}
  		}, awsconfig.s3.app.downloadTimeout);
  	});

  };

  return exp;
};

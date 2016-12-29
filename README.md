# Node JS Amazon S3 Client

## Features

 * Uploading file
 * Downloading file


## Synopsis

### S3 awsConfig.json

```js
{
  "accessKeyId":"AKIAIK5LJ4J3WCS2Q",
  "secretAccessKey": "nkuZX389mIXCgN0hl4JKX8gJRzEYxH",
  "region":"ap-southeast-1",
  "maxRetries": 3,
  "s3" : {
		"params": {
      "Bucket": "ying-photos"
    },
    "app" : {
      "uploadTimeout":3000000,
      "downloadTimeout": 3000000
    }
	}
}
```

### Uploading from local file system to s3

```js
var awsConfig = require('./awsconfig');

var s3 = require('ying-s3')(awsConfig);
...
s3.uploads3(id, localPath).then(saveData => {
```

### Downloading from s3 to local file system

```js
var awsConfig = require('./awsconfig');
var s3 = require('ying-s3')(awsConfig);
...
s3.downloads3(id, path).then(saveData => {
```

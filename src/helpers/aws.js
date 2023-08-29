const AWS = require('aws-sdk');
const fs = require('fs');
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

exports.s3_upload = function(filepath, filename, next){
    var uploadParams = {Bucket: process.env.aws_bucket, Key: filename, Body: ''};
    var fileStream = fs.readFileSync(filepath);
    uploadParams.Body = fileStream;

    s3.upload (uploadParams, function (err, data) {
    if (err) {
        return next(err, null);
    } 
    if (data) {
        console.log("S3 Upload Success");
        return next(false, data.Location);
    }
    });
}

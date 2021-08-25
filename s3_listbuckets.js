const AWS = require('aws-sdk');

let myConfig = new AWS.Config();
myConfig.update({region: 'us-west-1'});

// Create AWS.S3 service object
s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Call the listBucket method of S3 to retrieve a list of my buckets
s3.listBuckets(function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.Buckets);
  }
});
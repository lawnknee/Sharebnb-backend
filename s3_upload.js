"use strict";

const fs = require('fs');

const { S3_BUCKET } = require("./config");

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

// Set the region 
AWS.config.update({region: 'us-west-1'});

// Create S3 service object
var s3 = new AWS.S3({apiVersion: '2006-03-01'});

/** Takes in a photo file and reads the file.
 * 
 * Builds the parameter object according to AWS docs.
 * Calls upload function on S3 client with params and callback func.
 * 
 * Returns 
 */
async function S3upload(file) {
  // const photo = fs.readFileSync(file);

  const params = {
    Bucket: S3_BUCKET,
    Key: file.originalname,
    Body: file.buffer,
    ContentDisposition: "inline",
    ContentType: file.mimetype
  };

  let response = await s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully at: ${data.Location}`)
  });

  return `https://${S3_BUCKET}.s3.us-west-1.amazonaws.com${response.singlePart.httpRequest.path}`;
}

module.exports = S3upload;
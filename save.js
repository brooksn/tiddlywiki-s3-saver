/*\
title: $:/plugins/brooksn/s3-saver/save.js
type: application/javascript
module-type: saver

TiddlyWiki5 plugin to save the document to S3. 

\*/

(function() {

  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  /*
  Select the appropriate saver module and set it up
  */

  require("$:/plugins/brooksn/s3-saver/s3-min.js");

  function awsConfigFromString(str) {
    var result = {}
    var keyIdMatch = str.match(/accessKeyId:\s?(.+)/)
    var secretKeyMatch = str.match(/secretAccessKey:\s?(.+)/)
    var bucketMatch = str.match(/bucket:\s?(.+)/)
    var fileNameMatch = str.match(/fileName:\s?(.+)/)
    if (Array.isArray(keyIdMatch) && keyIdMatch[1].length > 1) {
      result.accessKeyId = keyIdMatch[1]
    } else {
      return null;
    }
    if (Array.isArray(secretKeyMatch) && secretKeyMatch[1].length > 1) {
      result.secretAccessKey = secretKeyMatch[1]
    } else {
      return null
    }
    if (Array.isArray(bucketMatch) && bucketMatch[1].length > 1) {
      result.bucket = bucketMatch[1]
    } else {
      return null;
    }
    if (Array.isArray(fileNameMatch) && fileNameMatch[1].length > 1) {
      result.fileName = fileNameMatch[1]
    } else {
      result.fileName = 'atw.html'
    }

    return result
  }

  var s3Up = function(wiki) {
    var s3SettingsTiddler = "$:/plugins/brooksn/s3-saver/settings";
    var settingsString = $tw.wiki.getTiddlerText(s3SettingsTiddler) || '';
    this.awsSettings = awsConfigFromString(settingsString);
    this.wiki = wiki;
    this.awsConfig = new AWS.Config({
      credentials: {
        accessKeyId: this.awsSettings.accessKeyId,
        secretAccessKey: this.awsSettings.secretAccessKey
      }
    })
    this.bucketName = this.awsSettings.bucket
    this.s3 = new AWS.S3(this.awsConfig)
  };



  s3Up.prototype.save = function(text, method, callback) {
    if (method !== "save") {
      return callback({err: 'Only the "save" method is accepted by s3Up.save '});
    }
    var params = {
      Key: this.awsSettings.fileName,
      Body: text,
      Bucket: this.awsSettings.bucket,
      ContentType: 'text/html; charset=UTF-8',
      Metadata: {
        'Content-Type': 'text/html'
      }
    }
    return this.s3.putObject(params, callback)
  };

  /*
  Information about this saver
  */
  s3Up.prototype.info = {
    name: "s3saver",
    priority: 10,
    capabilities: ['save']
  };

  /*
  Static method that returns true if this saver is capable of working
  */
  exports.canSave = function(wiki) {
    return true
  };

  /*
  Create an instance of this saver
  */
  exports.create = function(wiki) {
    return new s3Up(wiki);
  };

})();
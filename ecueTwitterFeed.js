var Twitter = require('twitter');
var _ = require('underscore');
var replaceall = require('replaceall');
var filewatcher = require('filewatcher');
var fs = require('fs');
var dgram = require('dgram');

var settings;
var client;
var tweetStream;


var configFilePath = './config.json';
var udp = dgram.createSocket('udp4');

start();

/**
 * Reload the config file and restart the stream if  the config file changes
 */
var configFileWatcher = filewatcher();
configFileWatcher.add(configFilePath);
configFileWatcher.on('change', function(file, stat){
  tweetStream.destroy();
  start();
});


/**
 * Gets the user ID numbers from the list of screen names if any are provided
 * then starts the twitter feed.
 */
function start(){

  var params = {};

  console.log('Restarting feed');

  loadConfig(configFilePath)
  .then(
      function(config){
        settings = config;
        console.log("\tUsers: " + settings.twitter.userNames);
        console.log("\tKeywords/Hashtags: " + settings.twitter.keywords);
        sendInfoToProgrammer("Restarting stream");
      })
  .then(function(){initTwitter();})
  .then(
      function() {
        return getUserIds(settings.twitter.userNames)
      })
  .then(
      // Add the user ID numbers to the params
      function (userIds){
        params = addParam(params, {follow: userIds});
      },
      // Log any errors with adding screen names
      function rejected(err){
        console.log(err)
      })
  .then(
      // Start listening to twitter
      function(){

        params = addParam(params, {track: settings.twitter.keywords});
        registerTwitterStream(params);
      }
    )
    .catch(function(e){
      sendErrorToProgrammer(e);
    });
}


/**
 * Initialize twitter with the application & user security keys from the
 * config file
 */
function initTwitter(){
  return new Promise(function(resolve, reject){
    client = new Twitter({
      consumer_key: settings.twitter.consumerKey,
      consumer_secret: settings.twitter.consumerSecret,
      access_token_key: settings.twitter.accessTokenKey,
      access_token_secret: settings.twitter.accessTokenSecret
    });
    resolve();
  })
}


/**
 * Open the connection to twitter and process the stream
 */
function registerTwitterStream(params){


  if(_.isEmpty(params)){

    sendInfoToProgrammer('No valid filters specified, waiting for config changes');
  }
  else{


    client.stream('statuses/filter', params, function(stream) {
      tweetStream = stream;
      stream.on('data', function(tweet) {
        try {
          //console.log(tweet.user.name);
          //console.log('\t' + tweet.text);
          sendTweetToProgrammer(tweet);
        } catch(e){}
      });

      stream.on('error', function(error) {
        //throw error;
      });
    });

  }

}

/**
 * Add a parameter to the params list if the parameter's value is defined
 */
function addParam(params, param){

  if(!_.isEmpty(param)){
    params = _.extend(params, param);
  }
  return params;
}

/**
 * Take a comma-delimted list of screen names, query twitter for their corresponding IDs
 * Returns a comma-delimited list of user IDs for the 'follow' parameter of the twitter
 * status feed.
 *
 * Screen names must be requested from twitter without the leading '@'. This function
 * removes any '@' symbols in the input file before querying twitter
 */
function getUserIds(screenNames){

  return new Promise(function(resolve, reject){

    if(_.isEmpty(screenNames)){
      reject(new Error("No screen names specified"));
    }

    var normalizedScreenNames = replaceall('@', '', screenNames);

    client.get('users/lookup', {screen_name: normalizedScreenNames}, function(err,userInfo){

      if(err){
        reject(err);
      }
      else{
        var userIds = _.map(userInfo, function(user){return user.id});
          resolve(userIds.toString());
      }

    })
  })

}

/**
 * Load the config file from disk & parse it as json and pass the
 * parsed data to the calling function
 */
function loadConfig(filepath){
  return new Promise(function(resolve, reject){
    try {
      var configText =  fs.readFileSync(filepath, 'utf8');
      var config = JSON.parse(configText);
      resolve(config);
    }
    catch(e){
      reject(e);
    }
  })
}


/**
 * Send a tweet to programmer
 */
function sendTweetToProgrammer(tweet){
  if(!_.isEmpty(tweet.user.name)){
    var buf = new Buffer(158);
    buf.fill(0);
    buf.write("TWT", 0, 3);
    buf.write(tweet.user.screen_name, 3,15);
    //console.log(tweet.user);
    buf.write(tweet.text,18,140);
    console.log(buf.toString());
    udp.send(buf, 0, buf.length, settings.ecue.port, settings.ecue.ipAddress);
  }

}

/**
 * Send errors or other info to programmer for display
 */
function sendInfoToProgrammer(message){
  var buf = new Buffer(message.length + 3);
  buf.write("INF", 0, 3);
  buf.write(message, 3, message.length+1);
  udp.send(buf, 0, buf.length, settings.ecue.port, settings.ecue.ipAddress);

}


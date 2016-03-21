# ecue Twitter Feed
This small [node.js](http://nodejs.org) app allows for the [e:cue Programmer lighting software](http://www.ecue.com/products/software/lighting-application-suite-70.html)e:cue Programmer lighting software easily respond to tweets. It is configured with a simple JSON file to listen for tweets with either a specific set of keywords or any tweets from a list of users. Any tweet that meets the criteria will be sent to Programmer via UDP. 

Using the installation method described below, the script will be installed by a windows service, which will ensure that it runs at all times and will auto-restart should a crash occur.

This project include the node script, a sample e:cue show file, and a separate copy of the same script used within the sample show file for easy importning into existing show files.

## Installing the node script
If you are not familiar with [node.js](http://nodejs.org), it is a sever-side implementation of Javascript based on the V8 Javascript engine originally created for Google's Chrome web browser. In recent years it has become a widely used server-side technology amongst web developers and excels and handling back-end networking situations, making it an ideal solution for integrating Programmer with other systems. 

There is a little bit of command-line configuration that needs to take place, but it it is pretty easy to do. The only major requirement is that you'll need to have the server that you're installing on to be connected to the internet during installation.

1. Install node.js. It can be downloaded [here](http://nodejs.org).

2. [Download and unzip this project](https://github.com/RubyRubenstahl/ecue-twitter-feed/archive/master.zip) into the desired folder (I reccommend *c:\ecue\ecue-twitter-feed* on e:cue servers).

3. Navigate to the folder in explorer.

4. Open a *PowerShell* window in **Administrator mode** by clicking *File > Open Windows PowerShell > Open Windows Powershell as Administrator*. (If you're not in Administrator mode, installing the service will not work).

5. In powershell enter the following commands:
`C:\ecue\ecue-twitter-feed>npm install winser -g`
`C:\ecue\ecue-twitter-feed>npm install`

6. After you type in these two lines you should see a bunch of information spit out by NPM, and the script should be installed and ready to go. If you see a bunch of lines starting with `npm ERR!` then your computer probably isn't connected to the internet of you've opened PowerShell without Admin privileges. 

## Configuring the application
Twitter requires that you register the application in order to gain access to their API. Once you've done this you'll need to provide some information in order to identify the application in the configuration file. 

In addition, the configuration file is also used to set the keywords and screen names that are listened for. 

1. Go to [apps.twitter.com](http://apps.twitter.com) and click on the *Create New App* button to register the app. Follow all of the prompts 
	*  You can enter your company website in the website box
	*  Don't enter anything for the *Callback URL*, we won't be using it. 

2. Once you've successfully registered the app, should get a page with details about the application settings.

3. Click on the *Keys and Access Tokens* tab.

4. At the bottom of the page, click the *Create my access token* button. 

5. Open the *config.json* file in any text editor. 

6. Copy and paste the Consumer Key, Consumer Secret, Access Token, and Access Token Secret, into the corresponding fields in the JSON file (make sure they are within the quote marks, with no space between the keys and the quote marks). 

7. Change the *usernames* and/or *keywords* fields to determine what the app will listen for. 
	* Both keywords and user names are read as a comma-delmited list
	* The tweet will be sent to programmer if it comes from a listed username **or** it contains a listed keyword. 
	* Keywords can include hashtags
	* Usernames can be specified with or without the @ at the beginning of the name. 

8. When the config file is saved with a change, the application should reload automatically, taking the new settings into account.

>**Note:** after configuring the app & programmer, if you're not seeing any tweets coming in, ensure that your Keys & Access tokens are entered properly. Unfortunately Twitter fails silently with no errors given if they are not entered correctly.

## Setting up Programmer
The programmer portion of the project uses e:script, which means that the software must be running in Enterprise mode (with the license dongle) in order to work. If you're using the provided show file, you should be able to work without any configuration. If you're adding the script to an existing file, you'll need to do the following:

1. Open the device manager and add a new udp driver by clicking that *Add Device* button and then choosing *Protocols > UDP Client*.

2. Set the *Bind IP Address* option to 127.0.0.1

3. Import *twitterFeedReader.cpp* from the *ecue files* directory by opoening the *e:script Macros window* in Programmer and and clicking the *Import Macro* (yellow folder) button and selecting the file.

4. Run the script manually by selecting it and then pressing the *test macro* button (blue play button) at the top of the window.

5. Set the script to run automatically by adding an *Initialize* trigger rule in the triggering window with an Action of *Call Macro*, selecting the name of the macro from the dropdown list.

## Customizing the response to tweets
By default, the included script prints out the tweet information to the logbook and advances *cuelist 1* every time it receives a tweet.

To customize the action performed when a tweet is received, you'll need to edit the contents of the *onTweetReceived* function in the *twitterFeedReader* script.

The script includes a few different possible actions which have been commented out.

In addition to the *onTweetReceived* function there is also a variable defined at the top of the file called *logTweet*, which can be set to 0 to disable the printing of the tweet to the logbook.

>**Note:** The script runs as a background process. After the script is edited you'll need to run it again to start listening from incoming tweets. Select it and click the blue play button (*Test Macro*) to start it again.
>
>Also, if you need to stop the script from running in the background for some reason, select it in the right pane of the *Macro Manager* window and thne click the *stop* button at the top of the window. 




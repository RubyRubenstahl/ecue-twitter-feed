// Respond to incoming tweets

// Set this to 0 to stop tweets from being printed to the logbook
int logTweet = 1;

// Modify this function to perform the desired action
// when a tweet is received.
// 'screenName' variable will hold the screen name of the
// 'tweet' variable will hold the text of the tweet
function onTweetReceived(){
		
		
		if(logTweet == 1){
			// Print out the tweet info
			printf("Tweet:");
			printf("	User: %s\n", screenName);
			printf("	Tweet: %s\n", tweet);
		}
		
			// Goto cuelist 1, cue 1
		CuelistStart(QL(1));
		
		// Go to QL1, Q5 with a normal fade (setting the 0 to 1 would
		// make the jump to the cue a 0 second fade)
		// CuelistGotoCue(QL(1), Q(5), 0);
		
		// Run another script
		// Call("MyOtherScript", 0, 0, 0);
}




// ---------- Do not edit below this line --------------------
int inBob = BobAllocate(1000);
string screenName;
string tweet;
RegisterEvent(UdpReceive, OnUdpReceive);
Suspend();

function OnUdpReceive(int  nDriverHandle) // UDP frame received.
{
	string ipAddress;
	int port;
	
	ReceiveFrom(nDriverHandle, inBob, ipAddress, port);
	
	string messageType = BobGetString(inBob, 0, 4);
	
	// Prints out any error/info messages that were passed to us
	if(strcmp(messageType, "INF")==0){
		string message = BobGetString(inBob, 3, 255);
		printf("Twitter Message: \n	%s\n", message);
	}
	
	// Runt the "onTweetReceived" function when a tweet is received
	if(strcmp(messageType, "TWT")==0){
		screenName = BobGetString(inBob, 3, 16);
		tweet = BobGetString(inBob, 18, 141);		
		onTweetReceived();
	}
	

}
 
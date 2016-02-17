/**
arn:aws:lambda:us-east-1:362928794742:function:myDadJoke
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * - Session State: Handles a multi-turn dialog model.
 * - Custom slot type: demonstrates using custom slot types to handle a finite set of known values
 * - SSML: Using SSML tags to control how Alexa renders the text-to-speech.
 *
 * Examples:
 * Dialog model:
 *  User: "Alexa, ask dad to tell me a joke."
    * https://www.reddit.com/r/dadjokes/new.json?sort=new
 *  Alexa: "why..."
 *  Alexa: "would you like to hear another?"
 *  User: "yes"
 *  Alexa: "why..."
 *  Alexa: "would you like to hear another?"
 *  User: "no"
 *  Alexa: "bye"
 *  
 *  No response from User
 *  Alexa: "bye"
 */

/**
 * App ID for the skill
 */
var APP_ID = undefined;//replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

/**
 * Array containing knock knock jokes.
 */
//<break time=\"0.5s\" />

// var DAD_JOKE_LIST = [
//     { joke: "joke1" },
//     { joke: "joke2" },
//     { joke: "joke3" },
//     { joke: "joke4" },
//     { joke: "joke5" }
// ];

var DAD_JOKE_LIST = [
    { joke: "Why can't you have a nose that is twelve inches long? Because then it would be a foot."},
    { joke: "Did you hear that the Pope has the avian bird flu? He got it from the cardinal."},
    { joke: "Im not feeling to good. I bought some shoes from a drug dealer. I don't know what he laced them with but I can't stop tripping."},
    { joke: "Why did a woman marry a ladle? <break time=\"0.5s\" /> It was good at spooning.  "},
    { joke: "I had to get glasses for my calendar. <break time=\"0.5s\" /> There were too many blind dates."},
    { joke: "How do you clean up water spilled after a baptism? <break time=\"0.5s\" /> With papal towels."},
    { joke: "What did the arsonist do on Valentine's Day? <break time=\"0.5s\" /> He met his match. "},
    { joke: "I got a job as a baker. <break time=\"0.5s\" /> I really knead the dough. "},
    { joke: "My music teacher wants me to sing tenor <break time=\"0.5s\" /> twelve miles away. "},
    { joke: "A photon checks into a hotel. <break time=\"0.5s\" /> the bagman asks, any bags? <break time=\"0.5s\" /> No, I'm traveling light. "}
];

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * RedditSkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var RedditSkill = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
RedditSkill.prototype = Object.create(AlexaSkill.prototype);
RedditSkill.prototype.constructor = RedditSkill;

/**
 * Overriden to show that a subclass can override this function to initialize session state.
 */
// RedditSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
//     console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
//         + ", sessionId: " + session.sessionId);

    // Any session init logic would go here.
//};

/**
 * If the user launches without specifying an intent, route to the correct function.
 */
RedditSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    handleTellMeADadJokeIntent(session, response);
};

/**
 * Overriden to show that a subclass can override this function to teardown session state.
 */
// RedditSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
//     console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
//         + ", sessionId: " + session.sessionId);

    //Any session cleanup logic would go here.
//};

RedditSkill.prototype.intentHandlers = {
    "TellMeADadJokeIntent": function (intent, session, response) {
        session.attributes.stage = 0;
        handleTellMeADadJokeIntent(session, response);
    },
    "TellMeWhoCreatedThisIntent": function (intent, session, response) {
        session.attributes.stage = 1;
        handleTellMeWhoCreatedThisIntent(session, response)
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "Dad jokes are for those with low self esteem and would feel they need to suffer through the type of joke only a dad could tell. " +
                    "To start the dad joke, just ask by saying tell me a joke, or you can say exit.";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        // For the repromptText, play the speechOutput again
        response.ask(speechOutput, repromptOutput);
    },
    "YesIntent": function (intent, session, response) {
console.log('******* YES', session.attributes.stage);
        switch (session.attributes.stage) {
            case 0:
                handleTellMeADadJokeIntent(session, response);
                break;
            case 1:
                handleTellMeWhoCreatedThisIntent(session, response);
                break;
            default:
                speechText = "okey dokey smokey";
        }
    },    
    "AMAZON.NoIntent": function (intent, session, response) {
console.log('******* NO ', session.attributes.stage);
        var speechText = "";
        switch (session.attributes.stage) {
            case 0:
                speechText = "no pain no gain, but all right.";
                break;
            case 1:
                speechText = "He's super duper! oh wait, sorry.";
                break;
            default:
                speechText = "okey dokey smokey";
        }
        response.tell(speechText);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Later gator.";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "After a while crocodile.";
        response.tell(speechOutput);
    }
};

/**
 * Selects a joke randomly.
 */
function handleTellMeADadJokeIntent(session, response) {
    var speechText = "";
    var repromptText = "would you like another?";
    //Select a random joke and store it in the session variables.
    var jokeID = Math.floor(Math.random() * DAD_JOKE_LIST.length);

    session.attributes.joke = DAD_JOKE_LIST[jokeID].joke;

    speechText = session.attributes.joke;

    var speechOutput = {
        speech: '<speak>' + speechText + '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, "Dad Joke", speechText);
}


function handleTellMeWhoCreatedThisIntent(session, response) {
    var speechText = "";
    var repromptText = "would you like to hear again how cool your dad is?";

    speechText = "Cody, your dad wrote this. <break time=\"0.2s\" /> He's the BOMB!";

    var speechOutput = {
        speech: '<speak>' + speechText + '</speak>',
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptOutput = {
        speech: repromptText,
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.askWithCard(speechOutput, repromptOutput, "Dad Joke", speechText);
}


// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the WiseGuy Skill.
    var skill = new RedditSkill();
    skill.execute(event, context);
};

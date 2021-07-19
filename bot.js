// Defines required stuff
require("dotenv").config();
const cld = require('cld');
const Discord = require("discord.js");
const fs = require("fs");

// Discord stuff
const client = new Discord.Client();
client.login(process.env.BOTTOKEN);

// Variables
const LiofaMessages = require("./Server Data/Responses");
const RawWatch = fs.readFileSync("./Server Data/WatchList.json");
const LiofaWatch = JSON.parse(RawWatch);
let LiofaState = true;

//Defines callbacks
client.on("message", messageRec);

// Start-up confirmation
client.once('ready', () => {
	console.log('Líofa is Talking!');
});



// Run on every message
async function messageRec(msg) {

  // Checks if Liofa should run on this message
  if (runLiofa(msg) === false) {
    return;
  }

  // Runs Liofa
  try {
    // Asks what the language is
    const result = await liofaCheck(msg.content);


    // Gives output if it's not English
    if (result.code != "en") {

      //Warnings Check
      let warnCount = liofaMod(msg.guild.id, msg.author.id);
      if (warnCount < 3) {

        // Checks if output for given language is available
        if (typeof LiofaMessages[result.code] === 'string') {
          msg.reply(LiofaMessages[result.code]);
        } else {
          msg.reply("Please Speak English");
          msg.channel.send(result.name + " must be added to Languages");
        }
      } else if (warnCount == 3) {
        msg.reply("All further messages will be deleted unless you talk English");
      } else if (warnCount > 3) {
        msg.delete();
      }
    }
  }


  // Returns error for when language cannot be detected 
  catch (err){
    console.log(err);
    return;
  }
}

// Checks if Liofa should run
function runLiofa(msg2) {
  // Checks if it's a Bot
  if (msg2.author.bot === true) {
    return false;
  
  // Checks if Liofa is turned on  
  } else if (msg2.content.includes("**")) {
    if (msg2.content === "**enable") {
      LiofaState = true;
      msg2.reply("Liofa is enabled")
    }else if(msg2.content === "**disable") {
      LiofaState = false;
      msg2.reply("Liofa is disabled")
    }
  }
  return LiofaState;
  // TODO Add excluded roles in here
}


// Check for Language
async function liofaCheck(LiofaMsg) {
  const LiofaResult = await cld.detect(LiofaMsg);
  return LiofaResult.languages[0];
}

// Check Warning Status
function liofaMod(ServerID, UserID) {
  if (typeof LiofaWatch[ServerID] === "undefined") {
    LiofaWatch[ServerID] = {};
  }
  if (typeof LiofaWatch[ServerID][UserID] === "undefined") {
    LiofaWatch[ServerID][UserID] = {};
  }
  if (typeof LiofaWatch[ServerID][UserID].warnings === 'undefined') { 
    LiofaWatch[ServerID][UserID] = {warnings : 1, time : Date.now()};

  } else if ((Date.now() - LiofaWatch[ServerID][UserID].time) < 1800000) { // 1800000 = 30 mins in milliseconds
    LiofaWatch[ServerID][UserID].warnings++;
    LiofaWatch[ServerID][UserID].time = Date.now();    

  } else {
    LiofaWatch[ServerID][UserID] = {warnings : 1, time : Date.now()};

  }
  let LiofaUpdate = JSON.stringify(LiofaWatch, null, 2);
  fs.writeFileSync("./Server Data/WatchList.json", LiofaUpdate);
  console.log("JSON updated")
  return LiofaWatch[ServerID][UserID].warnings;
}

//TODO
// Add in configurable settings
// Add commands
// Add roles that are excluded
// Learn how to use databases
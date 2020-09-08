const Discord = require('discord.js');
const Youtube = require('simple-youtube-api');
const youtube = new Youtube("");
const client = new Discord.Client();
const ytdl = require("ytdl-core");
const fsLibrary  = require('fs');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
//const { search } = require('yt-search');
const prefix = '-';
var servers = {};
var songs = new Array(20);
var titles = new Array(20);
var size = 0;
var playing = 0; 
var currurl = "";
var currtitle = "";



client.on('ready',async() => {
    console.log('Ai.bert is online.');
    //var videolog = await youtube.searchVideos('searchterm',10);
})
client.on('message', async message => {
    // message.channel.send("", {files: ["Capture1.png"]})
    // return;
    if(!message.content.startsWith(prefix)|| message.author.bot) return;
    let args = message.content.substring(prefix.length).split(" ");
    switch(args[0]){
        case 'play':
            // message.channel.send("", {files: ["Capture.png"]})
            // break;
            if(!args[1]){
                message.channel.send("What am I posed to play");
                return;
            }
            if(!message.member.voice.channel){
                message.channel.send("Not in a voice channel");
                return;
            }
            if(!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }
            // if(!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection){
            //     play(connection, message);
            // })
            var url = "";
            var searchterm = ""
            for(var i = 1; i < arguments.length-1;++i){
                searchterm += args[i];
                searchterm += " ";
                
                //console.log("i = " + i)
            }
            console.log("Attempting to play: " + searchterm);
            try{
                //console.log("try1");
                var video = await youtube.getVideo(args[1]);
                //console.log("50");
                //console.log("51" + video.title);
                titles[size] = video.title;
                url = args[1];
                songs[size] = url;
                size = size+1;
                message.member.voice.channel.join().then(function(connection){
                    play(connection, message);
                })
            }catch{
                try{
                    //console.log("64");
                    var videos = await youtube.searchVideos(searchterm,10);
                    //console.log("66");
                    console.log(videos[0].url + "57");
                    var list = "\n";
                    for(var i = 0; i < 10; ++i){
                        list += "["+(i+1)+"]" + " " + videos[i].title + "\n";
                    }
                    message.channel.send("*Search Results for* " +": " + searchterm + "...\n" + list + "\n" + "*select which one to play*");
                    const collector = new Discord.MessageCollector(message.channel, m=>m.author.id===message.author.id,{ time:15000});
                    collector.on('collect', msg => {
                        if(args[0] === "play" && parseInt(msg.content, 10) < 10 && parseInt(msg.content, 10) > 0 ){
                        //message.channel.send("Selected: " + msg.content);
                            var n = parseInt(msg.content,10) - 1;
                            //message.channel.send("n-1 = " + n);
                            n = parseInt(n, 10);
                            console.log("url = " + videos[n].url + "\ntitle = " + videos[n].title + "\nn-1 = " + n);
                             url = videos[n].url;
                            title = videos[n].title;
                            // play(connection, message);
                            titles[size] = title;
                            songs[size] = url;
                            size = size+1;
                            
                            message.member.voice.channel.join().then(function(connection){
                                play(connection, message);
                            })
                        }
                        //message.channel.send("Selected: " + msg.content);
                    })

                    // var url = videos[0].url;
                    // title = videos[0].title;
                }catch{
                    return message.channel.send("Error: LINK ONLY RN");
                }
            }
            function play(connection, message){
                if(songs[0] === "undefined" || songs[0] === "" || songs[0] === " "){
                    console.log("UNDEFINED OR EMPTY");
                    songs[0] = "";
                    for(var i = 1; i < size; i++){
                        songs[i-1] = songs[i];
                    }
                    size = size - 1;
                    return;
                    
                }
                var server = servers[message.guild.id];
                if(playing === 1){
                    message.channel.send("*Queueing*: " + title);
                    return;
                }
                //{filter: "audioonly"}
                //message.channel.send("123")
                console.log("url = " + songs[0]);
                server.dispatcher = connection.play(ytdl(songs[0]));
                message.channel.send("*Playing*: " + songs[0]);
                //currurl = songs[0];
                //currtitle = titles[0];
                playing = 1;
                songs[0] = "";
                titles[0] = "";
                url = "";
                for(var i = 1; i < size; i++){
                    songs[i-1] = songs[i];
                    titles[i-1] = titles[i];
                }
                size = size - 1;
                var ti = setTimeout(timeout,250000);
                server.dispatcher.on("finish", function(){
                    playing = 0;
                    clearTimeout(ti);
                    if(songs[0] != ""){
                        play(connection, message);
                    }else {                    
                        message.guild.me.voice.channel.leave();
                        return;
                    }
                })
                //return;
            }
            function timeout(){
                message.channel.send("Timed out skipping... ");
                var server = servers[message.guild.id];
                if(server.dispatcher) server.dispatcher.end();
            }
            //console.log("B4 push " + songs[0]);

        break;
        case 'skip':
            try{
                var skipnum = 1;
                if(args[1]){
                    skipnum = args[1];
                }
                message.channel.send("Skipping " + skipnum + " tracks...");
                for(var j = 0; j < args[1]-1; j++){
                    songs[0] = "";
                    titles[i-1] = "";                          
                    for(var i = 1; i < size; i++){
                        songs[i-1] = songs[i];
                        titles[i-1] = titles[i];
                    }
                    size = size - 1;
                }
                var server = servers[message.guild.id];
                if(server.dispatcher) server.dispatcher.end();
            }catch{
                message.channel.send("Error skipping");
            }
        break;
        case 'stop':
            message.channel.send("Stopped.")
            var server = servers[message.guild.id];
            for(var i = 0; i < size; ++i){
                songs[i] = "";
            }
            playing = 0;
            if(message.member.voice.channel){
                message.guild.me.voice.channel.leave();
            }

        break; 
        case 'queue':
            if(!args[1]){
                message.channel.send("Usage: -queue [number to display]");
                return;
            }
            var queue = "";
            for(var i = 0; i < (args[1]); i++){
                queue += "{" + (i+1) + "}" + titles[i] + "\n";
            }
            message.channel.send("Current queue (" + size + " songs)" +  ":\n" + queue + "...");
        break;
        case 'help':
            var cmd = "-play [search term or url] \n-skip [number of skips] \n-stop \n-queue [number to display] \n-plplay [playlist name] \n-shuffle \n-pllist"
            message.channel.send('MUSIC BOT COMMANDS:\n' + cmd)
        break;
        case 'plplay':
            if(!args[1]){
                message.channel.send("Usage: -plplay [playlistname]");
                return;
            }
            var found = 0;
            var temp = fsLibrary.readFileSync("playlists.txt","utf8");
            var lplaylist = temp.split("\n");
            for(var i = 0; i < lplaylist.length; ++i){
                if(lplaylist[i] == args[1]){
                    //message.channel.send("Playlist already added!")
                    //return;
                    found = 1;
                }
            }
            if(found != 1){
                message.channel.send("Playlist not found!");
                return;
            }
            found = 0;
            var pl = String(args[1]);
            
            if(!message.member.voice.channel){
                message.channel.send("Not in a voice channel");
                return;
            }
            if(!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }
            // fsLibrary.writeFile('newfile.txt', data, (error) => { 
      
            //     // In case of a error throw err exception. 
            //     if (error) throw err; 
            // }) 
            var playlisttext = fsLibrary.readFileSync(pl.toString()+".txt","utf8");
            //console.log(playlisttext);
            var playlist220 = playlisttext.split("\n");
            var u = 1
            for(var i=0; i < playlist220.length-1; i=i+2){
                //message.channel.send("<" + u + ">" + playlist[i+1]);
                u++;
                songs[size] = playlist220[i];
                titles[size] = playlist220[i+1];
                size++;  
                //message.channel.send("Queued " + playlist[i+1]);
            }
            var temp = new Array(size);
            var tempt = new Array(size);
            for(var i = 0; i < size; ++i){
                var rand = Math.floor(Math.random() * size);
                while(true){
                    if(temp[rand] == 'undefined' || temp[rand] == "" || temp[rand] == " " || !temp[rand]){
                        temp[rand] = songs[i];
                        tempt[rand] = titles[i];
                        break;
                    }
                    var rand = Math.floor(Math.random() * size); 
                }
            }
            songs = temp;
            titles = tempt;
            message.channel.send("Playlist: " + args[1] + " (" + (playlist220.length/2) + " songs)\n" );
            if(playing == 0){
                message.member.voice.channel.join().then(function(connection){
                    play(connection, message);
                })
            }
        break
        case 'shuffle':
            if(songs[0] == ""){
                message.channel.send("Queue is empty!");
                return;
            }
            message.channel.send("Shuffling queue");
            var temp = new Array(size);
            var tempt = new Array(size);
            for(var i = 0; i < size; ++i){
                var rand = Math.floor(Math.random() * size);
                while(true){
                    if(temp[rand] == 'undefined' || temp[rand] == "" || temp[rand] == " " || !temp[rand]){
                        temp[rand] = songs[i];
                        tempt[rand] = titles[i];
                        break;
                    }
                    var rand = Math.floor(Math.random() * size); 
                }
            }
            songs = temp;
            titles = tempt;
        break;
        case 'pllist':
            var tempp = fsLibrary.readFileSync("playlists.txt","utf8");
            var lplaylist = tempp.split("\n");
            message.channel.send("Playlists: \n");
            for(var i = 0; i < lplaylist.length; ++i){
                var temp = fsLibrary.readFileSync(lplaylist[i] + ".txt","utf8");
                var plsongs = temp.split("\n");
                message.channel.send((i+1) + ". " + lplaylist[i] + "(" + plsongs.length/2 + ")\n");

            }
        break;
        case 'pushfront':
            try{
                if(!args[1]){
                    message.channel.send("Usage: -pushfront [number of song in queue]");
                    return;
                } else if(args[1] > size || args[1] < 1){
                    message.channel.send("Usage: -pushfront [number of song in queue]");
                    return;
                }
                for(var i = args[1]; i > 1; --i){
                    var tempo = songs[i-2];
                    var tempot = titles[i-2];
                    songs[i-2] = songs[i-1];
                    titles[i-2] = titles[i-1];
                    songs[i-1] = tempo;
                    titles[i-1] = tempot;
                }
            }catch{
                message.channel.send("Error pushing to front!");
            }

        break;
    }
});

client.login('');

var request = require('request');

/*
Example message format:
{
sender: 0, // Id of sender
value: 2,
round: 3 // Round of message.
}
 */

var queue = [];
var round = 1;

// Need a way of initializing ids and stuff
var id = null;
var value = null;


function enqueue(message) {
    queue.push(message);
}

function message(neighborId, callback) {
    var m = {
        "sender": id,
        "value": value,
        "round": round
    };
    request.post('http://localhost:' + neighborId + '/', {
        form: {
            "sender": id,
            "value": value,
            "round": round    
        }, function(error, response, body) {
                if (error) {
                    return callback(error);
                }
                callback();
        }
    );

}



function send(callback) {
    if (isOdd(round) && isOdd(id) ||
        isEven(round) && isEven(id)) {
        if (getRightNeighbor()) {
            message(getRightNeighbor(), callback);
        }
    } else if (isOdd(round) && isEven(id) ||
               isEven(round) && isOdd(id)) {
        if (getLeftNeighbor()) {
            message(getLeftNeighbor(), callback);
        }
    }
}

function processMessage(message) {
    if (message.round != round) {
        console.log("Inappropriate Round! Got %d, expecting %d\n", message.round, round);
        throw new Error("Inappropriate Round");
    }
    if (isOdd(message.round)) {
        if (isOdd(id)) {
            value = Math.max(value, message.value);
        } else { // I am even
            value = Math.min(value, message.value);
        }
    } else { // Even Round of Processing
        if (isOdd(id)) {
            value = Math.min(value, message.value);
        } else {
            value = Math.max(value, message.value);
        }
    }
    round += 1;
    send();
}

function processQueue() {
    var message = queue.shift();

    if (!message) {
        return;
    }
    processMessage(message);
    if (queue.length) {
        setTimeout(processQueue, 0);
    }
}

function handler(message) {
    enqueue(message);
    if (queue.length == 1) { // First message in queue
        setTimeout(processQueue(), 0);
    } else {
        // Do nothing, queue already processing
    }
}
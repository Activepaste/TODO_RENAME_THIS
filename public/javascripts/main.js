
window.onload = function(){

    var xhr = new XMLHttpRequest();
    
    var longPollingRequest = function(){
        xhr.timeout = 3600000;
        xhr.open('GET', "/buses/update", true);
        xhr.send();
        xhr.onreadystatechange = function () {
            var DONE = 4; // readyState 4 means the request is done.
            var OK = 200; // status 200 is a successful return.
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    console.log(JSON.stringify(xhr.response)); // 'This is the returned text.'
                } else {
                    console.log('Error: ' + xhr.status); // An error occurred during the request.
                }
                // longPollingRequest();
            }
        };
        xhr.ontimeout.longPollingRequest();
    };
    
    var updateAllBuses = function() {
        xhr.open('GET', "/buses/refreshAll", true);
        xhr.send();
        xhr.onreadystatechange = function() {
            var DONE = 4; // readyState 4 means the request is done.
            var OK = 200; // status 200 is a successful return.
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    console.log(JSON.stringify(xhr.response)); // 'This is the returned text.'
                } else {
                    console.log('Error: ' + xhr.status); // An error occurred during the request.
                }
            }
        };
    };
    
    updateAllBuses();
    
    longPollingRequest();

};

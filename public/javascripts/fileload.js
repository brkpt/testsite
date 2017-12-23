goog.provide('FileLoader');

function FileLoader(instance) {
    this.instance=instance;
}

FileLoader.prototype.load = function(url, callback) {
    this.url = url;
    this.callback = callback;

    var loadPromise = $.ajax({
        url: url
    });
    
    loadPromise.then(function(result) {
        callback(this.url, result).bind(this.instance);
    }.bind(this),function(reason) {
        console.log(url + 'rejected: ' + reason)
    });

    return loadPromise;
}

export {FileLoader};

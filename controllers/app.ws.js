// {{{ app.ws


var wsRedis = redis.createClient();
var onMessage = NX.emptyFn;

module.exports = NX.extend(NX.WebSocketController, {

    // {{{ use

    use: ['user', 'timeline'],

    // }}}
    // {{{ connect

    connect : function(client) {


        var me = this;

        var sid = client.sessionId;

        onMessage[sid] = function(channel, postdata) {
            console.log("on message:", channel, postdata);

            var s = postdata.split('|');
            var user = s.shift(), time = s.shift(), post = s.join('|');
            var result = {
                name : user,
                post : post,
                time : time
            };
            client.broadcast(result);

        };

        wsRedis.on('message', onMessage[sid]);

        wsRedis.subscribe("channel");

    },

    // {{{ disconnect

    disconnect : function(client) {

        var me = this;
        var sid = client.sessionId;
        wsRedis.removeListener('message', onMessage[sid]);

        wsRedis.unsubscribe("channel");

    }

    // }}}

});

// }}}


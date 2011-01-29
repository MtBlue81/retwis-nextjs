
// {{{ requires

require('../../lib/NX');
redis  = require('redis'),//.createClient(),
util   = require('util'),
crypto = require('crypto');

// }}}
// {{{ create server

NX.createServer({
    websocket: 'app.ws.js',
    listeners : {

        beforeListen : function() {
            console.log('Server running at http://127.0.0.1:3000/');
        },

        afterListen : function() {
        }
    }
}).listen(3000);


function auth(user,  callback){

    var me = this;

    var err = "session error";

    var auth = user.auth;

    if (auth) {

        redis.get("auth:" + auth,  function(err1,  userid){

            if (userid) {

                redis.get("uid:" + userid + ":auth",  function(err2,  authsecret){

                    if( authsecret == auth ){

                        callback(null);

                    } else {

                        callback(err);

                    }
                });

            } else {

                callback(err);

            }
        });

    } else {

        callback("no session data");

    }

}

// }}}


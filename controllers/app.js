// {{{ app

var redisClient = redis.createClient();
module.exports = NX.extend(NX.WebController, {

    // {{{ use

    use : [
        'user',
        'timeline',
        'follower'

    ],
    remotingapi : new NX.DirectAction({
        use: ['user', 'timeline',  'follower']
    }),


    // }}}
    // {{{ index

    index : function(req, res) {

        var me = this;
        console.log("Index in");

        me.end();

    },

    // }}}

    _auth: function(user,  callback){

        var me = this;

        var err = "session error";

        var auth = user.auth;

        if (auth) {

            redisClient.get("auth:" + auth,  function(err1,  userid){

                if (userid) {

                    redisClient.get("uid:" + userid + ":auth",  function(err2,  authsecret){

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


});

// }}}


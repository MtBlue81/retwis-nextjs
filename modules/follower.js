var redisClient = redis.createClient();
module.exports = NX.extend(NX.Module, {

    doFollow  : function(user, followee, callback) {
        var me = this;

        me._exec("sadd", arguments);
    },

    doRemove : function(user, followee, callback) {

        var me = this;

        me._exec("srem", arguments);
    },

    _exec : function(cmd, user,  followee,  callback) {

        console.log(cmd , user.name,  followee);

        var me = this;

        if (user.name == followee.name) {

            callback({
                err: "あなたですw"
            });

        }

        me.controller._auth(user,  function(err) {
            if (err) {
                console.log(err);
                callback({
                    err :  "セッションエラー"
                });
                return;
            }

            redisClient[cmd]("uid:" + followee.id + ":followers",  user.id,  function(err) {
                    if (err) {
                        console.log(err);
                    }
                redisClient[cmd]("uid:" + user.id + ":following",  followee.id,  function(err) {
                    if (err) {
                        console.log(err);
                        callback({
                            err :  "フォロー済みです"
                        });
                    } else {
                        callback({
                            result : "フォローしました"
                        });
                    }
                });
            });
        });

    }


});

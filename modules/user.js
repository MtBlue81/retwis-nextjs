var redisClient = redis.createClient();
module.exports = NX.extend(NX.Module, {

    isLogin : function(user,  callback) {
        var me = this;
        console.log("is Login :",  util.inspect(user));

        me.controller._auth(user,  function(err) {

            callback(err)

        });

    },

    // {{{ login
    login : function(username,  password,  callback) {

        console.log("Login start:", username);

        var me = this;
        console.log(util.inspect(me));

        if (!username || !password) {

            callback({
                err: "ユーザ名、パスワードを入力してください"
            });

        }

        redisClient.get("username:" + username + ":id",  function(err,  userid) {

            if (!userid) {

                console.log("NO USER:",  username);
                callback({
                    err: "ユーザ名かパスワードが正しくありません"
                });

            } else {

                redisClient.get("uid:" + userid + ":password",  function(err, realpassword) {

                    if (realpassword != password) {

                        console.log("Invalid pass:",  username);
                        callback({
                            err: "ユーザ名かパスワードが正しくありません"
                        });

                    } else {

                        redisClient.get("uid:" + userid + ":auth",  function(err,  authsecret) {

//                            res.cookie("auth",  authsecret,  {expires: new Date(Date.now() + 31536000000)});

                            if (!err){
                                console.log("log in:",  username,  authsecret);

                                callback({
                                    result :"ようこそ！"+ username + "さん",
                                    user   : {
                                        name : username,
                                        id   : userid,
                                        auth : authsecret
                                    }
                                });
                            } else {
                                console.log("Invalid Auth:",  username);
                                callback({
                                    err: "ユーザ名かパスワードが正しくありません"
                                });

                            }

                        });


                    }

                });

            }

        });



    },
    // }}}

    // {{{ logout
    logout : function(user,  callback) {

        console.log("Logout:");

        var me = this;

        me.controller._auth(user,  function(err) {

            var newauthsecret = me.getrand();

            redisClient.get("uid:" + user.id + ":auth",  function(err,  oldauthsecret){

                if (err) {
                    console.log("Error:", util.inspect(err));
                    callback({
                        err : "ログアウトに失敗しました"
                    });
                }

                redisClient.set("uid:" + user.id + ":auth",  newauthsecret);
                redisClient.set("auth:" + newauthsecret,  user.id);
                redisClient.del("auth:" + oldauthsecret);

                callback({
                    result :"ログアウトしました"
                });

            });
        });

    },
    // }}}

    signup : function(username,  password,  callback) {

        console.log("Signup:", username);

        var me = this;

        if (!username || !password) {

            console.log("No User/Password:",  username);
            callback({
                err: "ユーザ名とパスワードを入力してください"
            });

            return;

        }

        redisClient.get("username:" + username + ":id",  function(err,  userid) {
            console.log(userid);

            if (userid) {

                console.log("Exist user:",  username);
                callback({
                    err: "ユーザ名 " + username + " はすでに利用されています"
                });

            } else {
                console.log("incr");

                redisClient.incr("global:nextuserId",  function(err,  userid) {
                    console.log("after incr",  userid);

                    redisClient.set("username:" + username + ":id",  userid);
                    redisClient.set("uid:" + userid + ":username",  username);
                    redisClient.set("uid:" + userid + ":password",  password);

                    var authsecret = me.getrand();
                    redisClient.set("uid:" + userid + ":auth",  authsecret);
                    redisClient.set("auth:" + authsecret,  userid);
                    redisClient.sadd("global:users",  userid);

                    console.log("regist:",  username);
                    callback({
                        result :"登録しました"
                    });

                    //res.cookie("auth",  authsecret,  {expires: new Date(Date.now() + 31536000000)});

                });

            }

        });

    },

    getrand : function() {

        var bitstr = "";

        for(var i=0; i<16; i++){

            bitstr += String.fromCharCode(Math.random() * 256);

        }

        return crypto.createHash('md5').update(bitstr).digest('hex');
    },

    getUserByName : function(username, callback) {

        redisClient.get("username:" + username + ":id", function(err, userid){
            console.log("get userid:",  userid);
            callback({
                name : username,
                id   : userid
            });
        });

    },

    getUserById : function(userid, callback) {

        redisClient.get("uid:" + userid + ":username", function(err, username){
            console.log("get username:",  username);
            callback({
                name : username,
                id   : userid
            });
        });

    }



});

var redisClient = redis.createClient();
module.exports = NX.extend(NX.Module, {

    // {{{ post
    postData : function(user,  post,  callback) {

        console.log("post:", user.name, post);

        var me = this;

        me.controller._auth(user,  function(err) {

            if (err) {

                callback({
                    err : "データが不正です"
                });

            } else {

                var time = new Date();
                var postdata = [user.id, time, post].join("|")

                redisClient.incr("global:nextPostId", function(err, postid) {

                    redisClient.set("post:" + postid, postdata);
                    redisClient.smembers("uid:" + user.id + ":followers", function(err, followers){

                        if ( !followers ) {
                            followers = [];
                        }
                        followers.push(user.id);
                        followers.forEach(function(fid) {
                           redisClient.lpush("uid:" + fid + ":posts", postid);
                        });
                        redisClient.lpush("global:timeline", postid);
                        redisClient.ltrim("global:timeline", 0, 1000);

                        console.log("Posted:",  postdata);

                        redisClient.publish("channel", [user.name,  time,  post].join("|"));

                        callback({
                            name : user.name,
                            post : post,
                            time : time
                        });
                    });

                });

            }
        });

    },
    // }}}

    // {{{ getUserPost
    getUserPost : function(user,  callback) {

        console.log("getPost:");

        var me = this;


        me.controller._auth(user,  function(err) {
            var key = (!err) ? "uid:" + user.id + ":posts": "global:timeline";
            console.log("getUserPost:", user.name,  key);

            redisClient.lrange(key, 0, -1, function(err, posts){

                var len = (posts == null) ? 0 : posts.length;
                me._result = [];
                function showPost(i){
                    if( i == len ){
                        //console.log("callback:", util.inspect(me._result));
                        callback({
                            result: me._result
                        }); // finally call the callback
                    }else{
                        var post = posts[i];
                        me.getPostData(post,   function(){
                            showPost(i+1);
                        });
                    }
                }
                showPost(0);

            });
        });

    },
    // }}}
    // {{{ getPostDat
    getPostData : function(id, callback) {

        var me = this;
        //console.log("loop : ",id);
        redisClient.get("post:" + id, function(err, postdata) {

        //    console.log("get postdata :",postdata);
            if (postdata) {
                postdata = postdata.toString();
                var s = postdata.split('|');
                var userid = s.shift(), time = s.shift(), post = s.join('|');

                me._getUserName(userid,  function(err,  username) {
                    me._result.push({
                        name: username,
                        message : post,
                        time : time
                    });

                    callback(null, userid, time, post);
                });
            } else {
                callback(null, null, null, null);
            }


        });

    },
    // }}}

    _getUserName : function(userid, callback) {

        redisClient.get("uid:" + userid + ":username", function(err, username){
 //           console.log("get username:",  username);
            callback(null,  username);
        });

    }


});

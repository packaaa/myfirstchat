//服务器及页面部分
var  express=require('express'),
      app=express(),
      server=require('http').createServer(app),
     io=require('socket.io').listen(server);
     if (!user){
      var users=[]
    }
     app.use('/',express.static(__dirname+'/www'));
     server.listen(8080,()=>{console.log('running....')});
     //socket部分
     //登录
     io.on('connection',(socket)=>{
      //昵称设置
      socket.on('login',(nickname)=>{
        if (users.indexOf(nickname)>-1) {
        socket.emit('nickExisted');
        }else{
          // console.log(nickname)
          socket.userIndex=users.length;
          socket.nickname = nickname;
          users.push(nickname);
          socket.emit('loginSuccess');
          io.sockets.emit('system', nickname, users.length, 'login'); //向所有连接到服务器的客户端发送当前登陆用户的昵称 
        }


      })
      //断开连接的事件
socket.on('disconnect', function() {
    //将断开连接的用户从users中删除
    users.splice(socket.userIndex, 1)
    
    //通知除自己以外的所有人
    socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
});
//接收新消息
    socket.on('postMsg', function(msg,color) {
      // console.log(msg,color)
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, msg,color);
    });
    //接收用户发来的图片
 socket.on('img', function(imgData) {
    //通过一个newImg事件分发到除自己外的每个用户
     socket.broadcast.emit('newImg', socket.nickname, imgData);
 });

     })
     
  
 

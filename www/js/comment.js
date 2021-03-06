window.onload=function(){
  //实例并初始化chat
  var chat =new Chat();
  chat.init();
}
//定义chat
var Chat=function(){
  this.socket=null;
}
//向原型添加业务方法
Chat.prototype={
  //初始化方法
  init:function(){
var that =this;
//建立连接服务器的socket
this.socket=io.connect();
//监听socket的connect事件
this.socket.on('connect',function(){
   //连接到服务器后，显示昵称输入框
            document.getElementById('info').textContent = '请输入用户名:)';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
})

document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
      if (e.keyCode == 13) {
          var nickName = document.getElementById('nicknameInput').value;
          if (nickName.trim().length != 0) {
              that.socket.emit('login', nickName);
          };
      };
  }, false);
  document.getElementById('messageInput').addEventListener('keyup', function(e) {
      var messageInput = document.getElementById('messageInput'),
          msg = messageInput.value,
          color = document.getElementById('colorStyle').value;
      if (e.keyCode == 13 && msg.trim().length != 0) {
          messageInput.value = '';
          that.socket.emit('postMsg', msg, color);
          that._displayNewMsg('me', msg, color);
      };
  }, false);
  //昵称设置的确定按钮
document.getElementById('loginBtn').addEventListener('click', function() {
    var nickName = document.getElementById('nicknameInput').value;
    //检查昵称输入框是否为空
    if (nickName.trim().length != 0) {
        //不为空，则发起一个login事件并将输入的昵称发送到服务器
        that.socket.emit('login', nickName);
    } else {
        //否则输入框获得焦点
        document.getElementById('nicknameInput').focus();
    };
}, false);

//登录失败
this.socket.on('nickExisted', function() {
     document.getElementById('info').textContent = '!昵称已占用'; //显示昵称被占用的提示
     return false;
 });
//登录成功
this.socket.on('loginSuccess', function() {
     document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
     document.getElementById('loginWrapper').style.display = 'none';//隐藏遮罩层显聊天界面
     document.getElementById('messageInput').focus();//让消息输入框获得焦点
 });
this.socket.on('system', function(nickName, userCount, type) {
    if (!nickName) {
        return false;
    };
     //判断用户是连接还是离开以显示不同的信息
     var msg = nickName + (type == 'login' ? '加入聊天' : '掉线了');
     var p = document.createElement('p');
     p.textContent = msg;
     that._displayNewMsg('system ', msg, 'red');
     document.getElementById('historyMsg').appendChild(p);
     //将在线人数显示到页面顶部
     document.getElementById('status').textContent = userCount +' 人在线';
 });
//发送消息
document.getElementById('sendBtn').addEventListener('click', function() {
    var messageInput = document.getElementById('messageInput'),
        msg = messageInput.value,
         //获取颜色值
        color = document.getElementById('colorStyle').value;
    messageInput.value = '';
    messageInput.focus();
    if (msg.trim().length != 0) {
        // alert(color)
        that.socket.emit('postMsg', msg,color); //把消息发送到服务器
        that._displayNewMsg('me', msg,color); //把自己的消息显示到自己的窗口中
    };
}, false);
//显示到聊天界面中
this.socket.on('newMsg', function(user, msg,color) {
    // alert(color)
    that._displayNewMsg(user, msg,color);
});
//发送图片
document.getElementById('sendImage').addEventListener('change', function() {
    //检查是否有文件被选中
     if (this.files.length != 0) {
        //获取文件并用FileReader进行读取
         var file = this.files[0],
             reader = new FileReader();
         if (!reader) {
             that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
             this.value = '';
             return;
         };
         reader.onload = function(e) {
            //读取成功，显示到页面并发送到服务器
             this.value = '';
             that.socket.emit('img', e.target.result);
             that._displayImage('me', e.target.result);
         };
         reader.readAsDataURL(file);
     };
 }, false);
//接受图片
 this.socket.on('newImg', function(user, img) {
     that._displayImage(user, img);
 });
 //接受表情
 this._initialEmoji();
 document.getElementById('emoji').addEventListener('click', function(e) {
     var emojiwrapper = document.getElementById('emojiWrapper');
     emojiwrapper.style.display = 'block';
     e.stopPropagation();
 }, false);
 document.body.addEventListener('click', function(e) {
     var emojiwrapper = document.getElementById('emojiWrapper');
     if (e.target != emojiwrapper) {
         emojiwrapper.style.display = 'none';
     };
 });
 document.getElementById('emojiWrapper').addEventListener('click', function(e) {
    //获取被点击的表情
    var target = e.target;
    if (target.nodeName.toLowerCase() == 'img') {
        var messageInput = document.getElementById('messageInput');
        messageInput.focus();
        messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
    };
}, false);
 document.querySelector("#clearBtn").addEventListener('click', function(){
    document.querySelector("#messageInput").value="";
 }, false)
},
_displayNewMsg: function(user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
            //将消息中的表情转换为图片
            // alert(color)
         msg = this._showEmoji(msg);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;

    },
    _displayImage: function(user, imgData, color) {//把图片添加到聊天中
    var container = document.getElementById('historyMsg'),
        msgToDisplay = document.createElement('p'),
        date = new Date().toTimeString().substr(0, 8);
    msgToDisplay.style.color = color || '#000';
    msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
    container.appendChild(msgToDisplay);
    container.scrollTop = container.scrollHeight;
},
_initialEmoji: function() {//发送表情
    var emojiContainer = document.getElementById('emojiWrapper'),
        docFragment = document.createDocumentFragment();
    for (var i = 69; i > 0; i--) {
        var emojiItem = document.createElement('img');
        emojiItem.src = '../content/emoji/' + i + '.gif';
        emojiItem.title = i;
        docFragment.appendChild(emojiItem);
    };
    emojiContainer.appendChild(docFragment);
},
_showEmoji: function(msg) {//
    var match, result = msg,
        reg = /\[emoji:\d+\]/g,
        emojiIndex,
        totalEmojiNum = document.getElementById('emojiWrapper').children.length;
    while (match = reg.exec(msg)) {
        emojiIndex = match[0].slice(7, -1);
        if (emojiIndex > totalEmojiNum) {
            result = result.replace(match[0], '[X]');
        } else {
            result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');
        };
    };
    return result;
}
  };

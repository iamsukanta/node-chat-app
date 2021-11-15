const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

var http = require('http').Server(app);
var io = require('socket.io')(http);

const dbUrl =  `mongodb+srv://public:public_user_2021@cluster0-fellx.mongodb.net/chat-app?retryWrites=true&w=majority`


let Message = mongoose.model("Message",{ name : String, message : String});

app.get('/messages', (req, res) => {
    Message.find({},(err, messages)=> {
      res.send(messages);
    })
});

app.post('/messages', async (req, res) => {
    try{
      var message = new Message(req.body);
  
      var savedMessage = await message.save()
        console.log('saved');
  
      var censored = await Message.findOne({message:'badword'});
        if(censored)
          await Message.remove({_id: censored.id})
        else
          io.emit('message', req.body);
        res.sendStatus(200);
    }
    catch (error){
      res.sendStatus(500);
      return console.log('error',error);
    }
    finally{
      console.log('Message Posted')
    }
  
})

io.on('connection', () =>{
    console.log('a user is connected')
})

mongoose.connect(dbUrl , () => { 
    console.log("mongodb connected");
});

const server = app.listen(3000, () => {
    console.log('Server listening at port: ', server.address().port);
})
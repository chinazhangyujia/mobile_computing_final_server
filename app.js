var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false});
var path = require('path');
var mqtt = require('mqtt');
var mongoose = require('mongoose');
mongoose.connect('localhost:27017/Gainesville');
var socket = require('socket.io');
var client = mqtt.connect('mqtt://test.mosca.io');
var router = require('./router/index');
var PORT = 8000;
var Schema = mongoose.Schema;

var children_schema = new Schema({
  user_id: String,
  missing_people_id: String
});

var patient_schema = new Schema({
  user_id: String,
  missing_people_id: String
});

exports.ChildrenData = ChildrenData = mongoose.model('ChildrenData', children_schema);
exports.PatientData = PatientData = mongoose.model('PatientData', patient_schema);

var server = app.listen(PORT, function(){
  console.log('listening ' + PORT);
});


app.use(urlencodedParser);
app.use('/', router);
app.use('/static', express.static('./static'));

var io = socket(server);

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, './view', 'user.html'));
});

client.on('connect', function(){
  client.subscribe('Gainesville');
  console.log('subscribe to Gainesville');
});


client.on('message', function(topic, message){
  if (topic === 'Gainesville'){
      //var message_string = message.toString();
      console.log(message.toString());
      var temp = message.toString().split(",");
      var user_id = temp[0];
      var missing_people_id = temp[1];
      var status = temp[2];
      var missing_people_category = temp[3];
      var UserData;
      console.log(status);

      switch (missing_people_category){
        case "children":
          UserData = ChildrenData;
          break;
        case "patient":
          UserData = PatientData;
          break;
        default:
          return;
      }
      
      if (status === 'create'){
        var newUser = {user_id: user_id, missing_people_id: missing_people_id};
        var newUserData = new UserData(newUser);
        newUserData.save();
        console.log(newUserData + ' is in missing list');
      }
      else if (status === 'delete'){
        UserData.findOneAndRemove({missing_people_id: missing_people_id}, function(err){
          if (err)
            return console.log(err);
          else {
            console.log(missing_people_id + ' is deleted');
          }
        });
      }
      else{
        console.log('this person does not exist');
      }
  }
});

io.on('connection', function(socket){
  socket.on('update_location', function(data){
    io.emit(data.id, data.location);
  });
});

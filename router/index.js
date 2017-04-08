var express = require('express');
var router = express.Router();
var model = require('../app');

router.post('/synchronise', function(req, res){
  var missing_people_category = req.body.missing_people_category;
  var UserData;
  switch (missing_people_category){
    case "children":
      UserData = model.ChildrenData;
      break;
    case "patient":
      UserData = model.PatientData;
      break;
    default:
      return;
  }

  UserData.find().then(function(doc){
    console.log(doc);
    res.send(doc);
  });
});

module.exports = router;

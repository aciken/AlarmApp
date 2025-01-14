const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());
const cors = require('cors');
app.use(cors());

const Signup = require('./Auth/Signup');
const Signin = require('./Auth/Signin');
const GetUser = require('./User/getUser');
const CreateAlarm = require('./Alarms/CreateAlarm');
const DeleteAlarm = require('./Alarms/DeleteAlarm');

app.get('/', (req, res) => {
    res.send('Hello World!');
  });

app.put('/signup', Signup);
app.put('/signin', Signin);
app.post('/getUser', GetUser);
app.put('/createAlarm', CreateAlarm);
app.put('/deleteAlarm', DeleteAlarm);




  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
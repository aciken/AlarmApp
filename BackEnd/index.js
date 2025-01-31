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
const ToggleAlarm = require('./Alarms/ToggleAlarm');
const EditAlarm = require('./Alarms/EditAlarm');
const StartSleep = require('./Sleep/StartSleep');
const EndSleep = require('./Sleep/EndSleep');
const SaveWakeup = require('./Wakeup/SaveWakeup');
const NextChallenge = require('./Challenge/NextChallenge');

app.get('/', (req, res) => {
    res.send('Hello World!');
  });

app.put('/signup', Signup);
app.put('/signin', Signin);
app.post('/getUser', GetUser);
app.put('/createAlarm', CreateAlarm);
app.put('/deleteAlarm', DeleteAlarm);
app.put('/toggleAlarm', ToggleAlarm);
app.put('/editAlarm', EditAlarm);
app.put('/startSleep', StartSleep);
app.put('/endSleep', EndSleep);
app.put('/savewakeup', SaveWakeup);
app.put('/nextChallenge', NextChallenge);

  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
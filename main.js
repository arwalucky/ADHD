/*
Developed by Arwa Lucky 2 days before 25th birthday,, 14 July 2022

*/


const express = require('express')
const path = require('path');
const app = express()
const port = 3000


//Toggl integration
var TogglClient = require('toggl-api');
var toggl = new TogglClient({ apiToken: 'SECRET TOKEN GOES HEREEE' });
const bodyParser = require('body-parser');




// Require google from googleapis package.
const { google } = require('googleapis')
// Require oAuth2 from our google instance.
const { OAuth2 } = google.auth
// Create a new instance of oAuth and set our Client ID & Client Secret.
const oAuth2Client = new OAuth2(
 //OAUTH GOES HERE '
)
// Call the setCredentials method on our oAuth2Client instance and set our refresh token.
oAuth2Client.setCredentials({
  refresh_token: '1//046o-Hz0he8vfCgYIARAAGAQSNwF-L9Irk4HDaZEpzrq_EWf-pzjSMInESH0zirrAOhQeSdNJts4BmVz-jXEWEjzvYUC1Wz2zE_4',
})
// Create a new calender instance.
const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })




//Notion Integration
const { Client } = require('@notionhq/client') 
const notion = new Client({ auth: 'secret_CBBUqsFrlk12YahiwM2wlr1Zb0lcATqftWaHu5QhM7Q' })
const databaseId = '19d92fb257954adaa56a60722f2290aa'


const dbQuerySimple = require('@eliwimmer/notion-api-tools')



//parses form data from HTML side
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));

//Render the main page
app.get('/', (req, res) => {
    var data;


(async () => {
    
    data = await notion.databases.query({ database_id: databaseId });  


    res.render('index.ejs', {data : data})
  })();
  
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})



//Google Calendar: Adds event to the calendar
app.post('/addEvent', function (request, respond) {
    //gets data from the input fields for the calendar and parse dates
    var name = request.body.eventName
    var eventStartTime =  new Date(request.body.eventTime);
    var eventEndTime = new Date(eventStartTime);
    eventEndTime.setMinutes(eventEndTime.getMinutes() + 60)

    console.log('Event: ', name, eventStartTime, eventEndTime)

    var event = {
        summary: name,
        start: {
          dateTime: eventStartTime,
          timeZone: 'Europe/Zurich',
        },
        end: {
          dateTime: eventEndTime,
          timeZone: 'Europe/Zurich',
        },
      }

      calendar.freebusy.query(
        {
          resource: {
            timeMin: eventStartTime,
            timeMax: eventEndTime,
            timeZone: 'Europe/Zurich',
            items: [{ id: 'primary' }],
          },
        },
        (err, res) => {
          // Check for errors in our query and log them if they exist.
          if (err) return console.error('Free Busy Query Error: ', err)
      
          // Create an array of all events on our calendar during that time.
          const eventArr = res.data.calendars.primary.busy
      
          // Check if event array is empty which means we are not busy
          if (eventArr.length === 0)
            // If we are not busy create a new calendar event.
            return calendar.events.insert(
              { calendarId: 'primary', resource: event },
              err => {
                // Check for errors and log them if they exist.
                if (err) return console.error('Error Creating Calender Event:', err)
                // Else log that the event was created.
                return console.log('Calendar event successfully created.')
              }
            )
      
          // If event array is not empty log that we are busy.
          return console.log(`Sorry I'm busy...`)
        }
      )
    respond.status(204).send();


});




app.post('/start', function (request, respond) {


    console.log(request.body)
    let name = request.body.foo

    if(name=== "bitch"){
        toggl.startTimeEntry({
            description: 'Bitch fit',
            billable:    true
          }, function(err, timeEntry) {
            // handle error
          
            // working now exactly 1hr
            setTimeout(function() {
              toggl.stopTimeEntry(timeEntry.id, function(err) {
                // handle error
          
                toggl.updateTimeEntry(timeEntry.id, {tags: ['bitchfit']}, function(err) {
                  toggl.destroy()
                })
              })
            }, 5000)
          })
    }
    else {
        toggl.startTimeEntry({
            description: name,
            billable: false
        }, function (err, timeEntry) {
            // handle error
            console.log(timeEntry)
            // working 10 seconds
    
        });
    }


    respond.status(204).send('success');


});


app.get('/stop', function (request, respond) {
    toggl.getCurrentTimeEntry(function(err,timeEntry){
        console.log (timeEntry)
        //if running timer then stop else move on with your life
        if (timeEntry){
            toggl.stopTimeEntry(timeEntry.id, function(err) {
                // handle error
          
                toggl.updateTimeEntry(timeEntry.id, {tags: ['finished']}, function(err) {
                  toggl.destroy()
                })
              })
        }
       
    }) 
    respond.status(204).send();
});




async function addItem(text) {
    try {
      const response = await notion.pages.create({
        parent: { database_id: databaseId },
        properties: {
          title: { 
            title:[
              {
                "text": {
                  "content": text
                }
              }
            ]
          }
        },
      })
      console.log(response)
      console.log("Success! Entry added.")
    } catch (error) {
      console.error(error.body)
    }
  }


app.post('/notion', function (req, res){

    var task = req.body.task;
    addItem(task)
    res.status(204).send()


})


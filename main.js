const express = require('express')
const path = require('path');

const app = express()
const port = 3000
var TogglClient = require('toggl-api');
var toggl = new TogglClient({ apiToken: '172bb1241ee257cb8b8e92f6ca303f87' });
const bodyParser = require('body-parser');


//parses form data from HTML side
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'views')));


app.post('/start', function (request, respond) {


    console.log(request.body)
    let name = request.body.foo

    toggl.startTimeEntry({
        description: name,
        billable: false
    }, function (err, timeEntry) {
        // handle error
        console.log(timeEntry)
        // working 10 seconds

    });
    respond.send('ok')

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
    respond.send('ok')
    



});




app.get('/', (req, res) => {
    res.render('index.ejs')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

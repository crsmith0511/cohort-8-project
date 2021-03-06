const express = require('express')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const faker = require('faker')
const cookieSession = require('cookie-session')
const cors = require("cors");
const User = require('./models/user')
const Comment = require('./models/comment')
const Task = require('./models/task')
const Group = require('./models/group')
const Todo = require('./models/todo')
const bodyParser = require('body-parser')
const ObjectId = require('mongoose').Types.ObjectId
const querySring = require('querystring')

const app = express()

mongoose.connect('mongodb://localhost/homebase')


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

if (process.env.NODE_ENV === 'production') {
  // Express will serve up production assets
  // like our main.js file, or main.css file!
  app.use(express.static('client/build'));

  // Express will serve up the index.html file
  // if it doesn't recognize the route
  const path = require('path');
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.use(
    cookieSession({
      maxAge: 30 * 24 * 60 * 60 * 1000,
      keys: ['helloworld']
    })
)


// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
//   res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

// set up cors to allow us to accept requests from our client
app.use(
  cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true // allow session cookie from browser to pass through
  })
);


app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser((id, done) => {
    done(null, id)
})

passport.use(
  new GoogleStrategy(
    {
      clientID: '678475023348-tlm6ikrgeublvh5o3gbihpf1o7ddoqsd.apps.googleusercontent.com',
      clientSecret: 'jsyrZ37mfbOFn--PkSDJHlDo',
      callbackURL: '/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
        // console.log(profile)
        User.findOne({ google_id: profile.id }).then(existingUser => {
          console.log("access token: ", accessToken);
          console.log("refresh token: ", refreshToken);
          if (existingUser) {
            // we already have a record with the given profile ID
            done(null, existingUser)
          } else {
            // we don't have a user record with this ID, make a new record!
            new User({
              google_id: profile.id,
              profile_name: profile.displayName,
              email: profile.emails[0].value,
              profile_pic_url: profile.photos[0].value,
              date_created: new Date()
            })
            .save((err, user) => {
              Group.find({}).exec((err,groups) => {
                groups.forEach(group => {
                  group.people.push(user)
                  group.save()
                })
              })

              return done(null, user)
            })
          }
        })
    }
  )
)

const ensureAuthenticated = (req, res, next) => {
    if (!req.user) {
      res.redirect('/')
    } else {
      next();
    }
  };

const googleAuth = passport.authenticate('google',
  { scope: ['profile', 'email']
})

groups = [
  {
    groupName: "Leyland Melvin Day",
    groupType: "project",
    groupDescription: " Lynchburg, VA chose to honor its highest reaching citizen, astronaut Leyland Melvin, by honoring his birthday April 7th. We’re here to explore the relationship between a space traveller and his hometown. ",
    todos: [
      {
        todoName: "Trip to Lynchburg, VA",
        todoDescription: "Coordinate research and recording trip to Lynchburg, VA.",
        tasks: [
          {
            title: "Contact Lynchburg mayor’s office",
            completed: true
          },
          {
            title: "Meet with reporters to discuss story outline",
            completed: false
          },
          {
            title: "Finalize trip equipment",
            completed: false
          }
        ]
      },
      {
        todoName: "Leyland Melvin interview",
        todoDescription: "Conducting audio interview with Mr. Melvin",
        tasks: [
          {
            title: "Settle location and interview method",
            completed: true
          },
          {
            title: "Sent Mr. Melvin’s office a preparation packet",
            completed: false
          }
        ]
      },
      {
        todoName: "Leyland Melvin bio",
        todoDescription: "Write and record a short biography for beginning of episode",
        tasks: [
          {
            title: "Check-in with research team",
            completed: false
          },
          {
            title: "Assign a writer for completing the bio",
            completed: true
          },
          {
            title: "Set final due date",
            completed: false
          }
        ]
      }
    ]
  },
  {
    groupName: "The Helsinki Issue",
    groupType: "project",
    groupDescription: "Helenski has developed an innovative and effective solution to homeless. We’ll explore how the program works and what makes it effective.",
    todos: [
      {
        todoName: "Research",
        todoDescription: "Basic research covering the creation of the program, how the program works and the results of the program",
        tasks: [
          {
            title: "Assign writing lead",
            completed: false
          },
          {
            title: "Discuss research goals and objectives",
            completed: true
          }
        ]
      },
      {
        todoName: "Outlining",
        todoDescription: "Draft a basic outline including defining the piece's main point.",
        tasks: [
          {
            title: "Review initial pitch",
            completed: true
          },
          {
            title: "Meeting with writing team to pitch and outline",
            completed: true
          },          {
            title: "Discuss publication timelines",
            completed: false
          }
        ]
      }
    ]
  },
  {
    groupName: "Management",
    groupType: "team",
    groupDescription: "We're the ones in charge here - or that's what they let us think.",
    todos: [
      {
        todoName: "Ongoing",
        todoDescription: "Rotating list of ongoing tasks",
        tasks: [
          {
            title: "Check-in Leyland Melvin team for budget estimate",
            completed: false
          },
          {
            title: " Check-in with podcast team to review equipment rental policy",
            completed: false
          },
          {
            title: " Meeting to discuss last minute changes to Sunday edition",
            completed: true
          }
        ]
      },
      {
        todoName: "Weeklies",
        todoDescription: "Tasks to be review and completed weekly",
        tasks: [
          {
            title: "Budget overview",
            completed: true
          },
          {
            title: "Overview of the next six weeks publishing schedule",
            completed: true
          },
          {
            title: "Equipment check-in",
            completed: true
          }
        ]
      }
    ]
  },
  {
    groupName: "Research",
    groupType: "team",
    groupDescription: "Team responsible for organizing and completing all research tasks",
    todos: [
      {
        todoName: "Ongoing",
        todoDescription: "A rotating list of misc. tasks",
        tasks: [
          {
            title: "Contact Alexandria public library re: print sources",
            completed: true
          },
          {
            title: " Research outline for Arizona MLB  affair exposé",
            completed: false
          },
          {
            title: "Research summary for Kenny Rogers piece",
            completed: true
          }
        ]
      },
      {
        todoName: "Weeklies",
        todoDescription: "Tasks to be review and completed weekly",
        tasks: [
          {
            title: "Check-in with research team leads",
            completed: true
          },
          {
            title: "Define and outline research priorities",
            completed: true
          },
          {
            title: "Brainstorm new research ideas",
            completed: true
          }
        ]
      }
    ]
  },
  {
    groupName: "Writing",
    groupType: "team",
    groupDescription: "We're the ones who do all of the work",
    todos: [
      {
        todoName: "Reorganizing the archive",
        todoDescription: "Trying to streamline everything for easier backwards compatability",
        tasks: [
          {
            title: " Meet with writing to discuss future story formatting and guidlines",
            completed: false
          },
          {
            title: " Individual meetings with writers to discuss individual portfolios",
            completed: false
          }
        ]
      },
      {
        todoName: "Weeklies",
        todoDescription: "Tasks to be review and completed weekly",
        tasks: [
          {
            title: "Story progress check-in",
            completed: false
          },
          {
            title: "New story pitch meeting",
            completed: true
          },
          {
            title: "Areas awaiting editor approval/assistance",
            completed: false
          }
        ]
      },
      {
        todoName: "Ongoing",
        todoDescription: "Every changing list of new things to do",
        tasks: [
          {
            title: " Discuss progress on Jomboy media think piece",
            completed: true
          },
          {
            title: " Meet to adjust publication time-schedule for upcoming up-eds",
            completed: false
          },
          {
            title: " Pitches for summer historic get away pieces",
            completed: false
          }
        ]
      }
    ]
  }
]

app.get("/generate-real-fake-tasks", async (req,res) => {
  groups.forEach(g => {
    g.todos.forEach(async (td) => {
      let newTasks = await td.tasks.map(async (tsk) => {
        let task = new Task()
        task.title = tsk.title
        task.date_created = new Date()
        task.due_date = faker.date.future()
        task.completed = tsk.completed

        let assignedTo = await User.aggregate(
          [ { $sample: { size: 1 } } ]
        )

        task.assigned_to = assignedTo[0]

        let newTask = await task.save()

        return newTask
      })
    })
  }) 
  
  res.send()
})

app.get("/generate-real-fake-todos", async (req,res) => {
  groups.forEach(g => {
    g.todos.forEach(async (td) => {
      let todo = new Todo()

      todo.name = td.todoName
      todo.description = td.todoDescription
      todo.date_created = new Date()

      const num_tasks = Math.round((Math.random() * 10)/3) + 1

      Task.aggregate(
        [ { $sample: { size: num_tasks } } ]
      ).exec((error, tasks) => {
        let num_completed = 0
        for (var j = 0; j < num_tasks; j++) {
          todo.tasks.push(tasks[j])
          if (tasks[j].completed == true) {
            num_completed += 1
          } 
        }

        todo.num_tasks = num_tasks
        todo.num_completed = num_completed

        todo.save()
      })
    })
  })
  res.send()
})

app.get("/generate-real-fake-groups", async (req,res) => {
  groups.forEach(g => {
    let group = new Group()

    group.group_name = g.groupName
    group.group_type = g.groupType
    group.group_description = g.groupDescription

    const num_people = Math.round((Math.random() * 10)/5) + 1

    User.aggregate(
      [ { $sample: { size: num_people } } ]
    ).exec((error, people) => {
      for (var j = 0; j < num_people; j++) {
        group.people.push(people[j])
      }

      const num_todos = Math.round((Math.random() * 10)/3) + 1

      Todo.aggregate(
        [ { $sample: { size: num_todos } } ]
      ).exec((error, todos) => {
        for (var j = 0; j < num_todos; j++) {
          group.todos.push(todos[j])
        }
        group.save()
      })
    })
  })

  res.send()
})

app.get('/generate-fake-users', (req, res) => {
    //Generate fake users
    for (let i = 0; i < 90; i++) {
        let user = new User()

        user.google_id = faker.random.alphaNumeric()
        user.email = faker.internet.email()
        user.profile_name = faker.internet.userName()
        user.date_created = faker.date.past()
        user.profile_pic_url = faker.internet.avatar()

        user.save((err) => {
            if (err) throw err
          })

    }

    res.end()
})

app.get('/generate-fake-comments', (req, res) => {
    //Generate fake comments
    for (let i = 0; i < 1000; i++) {
        let comment = new Comment()

        comment.title = faker.lorem.words()
        comment.description = faker.lorem.sentences()
        comment.date_created = faker.date.past()

        const tags = []

        for (var j = 0; j < 3; j++) {
            const tag = faker.lorem.word()
            tags.push(tag)
        }

        comment.tags = tags

        const num_comments = Math.round((Math.random() * 10)/3)
        const comment_comments = []

        for (var k = 0; k < num_comments; k ++) {
            const comment_comment = faker.lorem.sentence()
            comment_comments.push(comment_comment)
        }

        comment.comments = comment_comments

        User.aggregate(
            [ { $sample: { size: 1 } } ]
          ).exec((error, user) => {
            comment.author = user[0]
            comment.save((err) => {
                if (err) throw err
            })
        })

    }

    res.end()
})

app.get('/generate-fake-tasks', (req, res) => {
    //Generate fake tasks
    for (let i = 0; i < 100; i++) {
        let task = new Task()

        task.title = faker.lorem.words()
        task.date_created = faker.date.past()
        task.due_date = faker.date.future()

        if (i < 50) {
            task.completed = true
        } else {
            task.completed = false
        }

        User.aggregate(
            [ { $sample: { size: 1 } } ]
          ).exec((error, user) => {
            task.assigned_to = user[0]
            task.save((err) => {
                if (err) throw err
            })
        })
    }

    res.end()
})

app.get('/generate-fake-todos', (req, res) => {
    //Generate fake todos
    for (let i = 0; i < 20; i++) {
        let todo = new Todo()

        todo.name = faker.lorem.words()
        todo.date_created = faker.date.past()
        todo.description = faker.lorem.sentence()

        const num_task = Math.round((Math.random() * 10))
        todo.num_task = num_task
        let num_completed = 0

        const num_comments = Math.round((Math.random() * 10))

        Task.aggregate(
            [ { $sample: { size: num_task } } ]
          ).exec((error, tasks) => {
              for (var j = 0; j < num_task; j++) {
                todo.tasks.push(tasks[j])
              }
              for (var k = 0; k < num_task; k++) {
                  if (tasks[k].completed == true) {
                      num_completed ++
                  }
              }
              todo.num_completed = num_completed
              Comment.aggregate(
                [ { $sample: { size: num_comments } } ]
              ).exec((error, comments) => {
                  for (var l = 0; l < num_comments; l++) {
                    todo.comments.push(comments[l])
                  }
                  todo.save((err) => {
                    if (err) throw err
                })
            })
        })
    }

    res.end()
})

app.get('/generate-fake-groups', (req, res) => {
    //Generate fake groups
    for (let i = 0; i < 10; i++) {
        let group = new Group()

        group.group_name = faker.company.companyName()

        if (i < 5) {
            group.group_type = "project"
        } else {
            group.group_type = "team"
        }

        group.group_description = faker.lorem.sentences()

        const num_people = Math.round(Math.random() * 10)
        const num_comments = Math.round(Math.random() * 15)
        const num_todos = Math.round(Math.random() * 10/3)

        User.aggregate(
            [ { $sample: { size: num_people } } ]
          ).exec((error, people) => {
              for (var j = 0; j < num_people; j++) {
                group.people.push(people[j])
              }
              Comment.aggregate(
                [ { $sample: { size: num_comments } } ]
              ).exec((error, comments) => {
                  for (var l = 0; l < num_comments; l++) {
                    group.comments.push(comments[l])
                  }
                  Todo.aggregate(
                    [ { $sample: { size: num_todos } } ]
                  ).exec((error, todos) => {
                    for (var m = 0; m < num_todos; m++) {
                        group.todos.push(todos[m])
                      }
                    group.save((err) => {
                        if (err) throw err
                    })  
                  }) 
            })
        })

    }

    res.end()
})

app.get('/auth/google', googleAuth)


app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('http://localhost:3000/home');
     res.end()
});




app.get('/logout', (req, res) => {
  req.logout();
  req.session = null;
  res.redirect('http://localhost:3000');
  res.end()
});

//get current user's full profile
app.get('/current_user', ensureAuthenticated, (req, res) => {
    const id = req.user
    User
    .findById(id).exec((error, user) => {
      if (error){
        res.writeHead(404);	
        return response.end("No user is signed in.");
      } else{
        return res.send(user)
      }
    })
});


//GET route for /groups/groupId
app.get('/groups/:groupId', ensureAuthenticated, (req, res, next) => {
  Group.findOne({ _id: req.params.groupId})
      .populate(
          {path:'people'})
      .populate({path: 'comments', populate: {path: 'author'}})
      .populate({path: 'todos', populate: {path:'comments'}, populate: {path:'tasks', 
      populate: {path:'assigned_to'}}})
      .exec((err, group) => {
        if (err) {
            return next(err)
        } if(group) {
            res.send(group)
        } else {
          res.status(404);
          return res.end(`group with id ${req.params.groupId} not found`);
      }
      });
    })

  

app.put ('/groups/:groupId', ensureAuthenticated, (req, res, next) => {
    Group.findByIdAndUpdate(req.params.groupId, {group_name: req.body.groupName, group_type: req.body.groupType, group_description: req.body.groupDescription }, function(err, group){
        if (err) {
            return next(err)
        }if(group) {
            group.save()
            res.end()
    } else {
        res.status(404);
        return res.end(`group with id ${req.params.groupId} not found`);
    }
    });
})


//POST route for /groups
app.post('/groups', ensureAuthenticated, (req, res, next) => {
    id = req.user

    let newGroup = new Group()


    newGroup.group_name = req.body.group_name
    newGroup.group_type = req.body.group_type
    newGroup.group_description = ''
    newGroup.date_created = new Date ()
    newGroup.todos = []
    newGroup.comments = []
    newGroup.people = [ObjectId(id)]
    

    newGroup.save(function (err) {
        if (err) {
            return next(err);
        }
        res.send('Group Created successfully')
    })
})


//route for getting a single todo list page 
app.get('/groups/:groupId/todos/:todo', ensureAuthenticated, (req, res, next) =>{
    
    Todo.findOne({ _id: req.params.todo})
    .populate(
        {path:'tasks', 
        populate:{path:'assigned_to'}})
    .populate({path: 'comments', populate: {path: 'author'}})
      .exec((err, todo) => {
          if (err) {
              return next(err)
          } if(todo) {
              res.send(todo)
          } else {
            res.status(404);
            return res.end(`todo with id ${req.params.todo} not found`);
        }
        });
      })
  


//route to update the single todo by name and description 
app.put('/groups/:groupId/todos/:todo', ensureAuthenticated, (req, res, next) => {
    
    Todo.findByIdAndUpdate(req.params.todo, {name: req.body.name, description: req.body.description }, function(err, todo){
            if (err) {
                return next(err)
            }if(todo) {
                todo.save()
                res.end()
        } else {
            res.status(404);
            return res.end(`todo with id ${req.params.todo} not found`);
        }
        });
    })


//route creates a new todo in the database

app.post('/groups/:groupId/todos', ensureAuthenticated, (req, res, next) => {

    
    let newTodo = new Todo()


    newTodo.name = req.body.name
    newTodo.description = req.body.description
    newTodo.num_tasks= 0
    newTodo.num_completed = 0
    newTodo.date_created = new Date ()
    newTodo.tasks = []
    newTodo.comments = []
    

    newTodo.save(function (err, todo) {
        if (err) {
            return next(err);
        }
        Group
        .findById(req.params.groupId)
        .populate(
          {path:'people'})
        .populate({path: 'comments', populate: {path: 'author'}})
        .populate({path: 'todos', populate: {path:'comments'}, populate: {path:'tasks', 
         populate: {path:'assigned_to'}}})
        .exec((err, group) => {
          if(err) {
            res.writeHead(400)
            res.send(err)
          }
          group.todos.push(todo)
          group.save((err, group) => {
            if (err) {
              res.writeHead(400)
              res.send(err)
            }
            res.send(group)
          })
        }
      )
    })
})

//returns the comments from each to do 
app.get('/groups/:groupId/todos/:todo/comments', ensureAuthenticated, (req, res, next) => {
    
    Todo
    .findById(req.params.todo)
    .populate({path: 'comments', populate: {path: 'author'}})
    .exec((err, todo) => {
        if (err) return next(err)
        if (todo) {
            res.send(todo.comments) 
         } else{
                res.status(404);
                return res.end(`todo with id ${req.params.todo} not found`);
            } 
        })
    })

//route creates a new comment for the todo
app.post('/groups/:groupId/todos/:todo/comments', ensureAuthenticated,  (req, res, next) => {
    
    Todo
    .findById(req.params.todo)
    .populate({path: 'comments', populate: {path: 'author'}})
    .exec((err, todo) => {
        if (err) return next(err)
        if (todo) {
            let comment = new Comment()
            comment.title = req.body.title
            comment.description = req.body.description
            comment.date_created = new Date ()
            comment.author = req.user.profile_name
            comment.save()
            todo.comments.push(comment)
            todo.save()
            res.end()
        } else {
            res.status(404);
            return res.end(`todo with id ${req.params.todo} not found`);
        }
    })

})


//returns a single task  
app.get('/groups/:groupId/todos/:todo/tasks/:task',   (req, res, next) => {
    
    Task
    .findById(req.params.task)
    .populate({path: 'assigned_to'})
    .exec((err, task) => {
        if (err) return next(err)
        if (task) {
            res.send(task) 
         } else{
                res.status(404);
                return res.end(`task with id ${req.params.task} not found`);
            } 
        })
    })

//route to update the single todo by name and description 
app.put('/groups/:groupId/todos/:todo/tasks/:task', ensureAuthenticated, (req, res, next) => {
    
  Todo.findByIdAndUpdate(req.params.task, {title: req.body.title, due_date: req.body.due_date,  assigned_to: req.body.assigned_to}, function(err, todo){
          if (err) {
              return next(err)
          }if(todo) {
              todo.save()
              res.end()
      } else {
          res.status(404);
          return res.end(`todo with id ${req.params.todo} not found`);
      }
      });
  })



//create a new task 
app.post('/groups/:groupId/todos/:todo', ensureAuthenticated, (req, res, next) => {
    Todo
    .findById(req.params.todo)
    .populate({path: 'tasks', populate: {path: 'assigned_to'}})
    .exec((err, todo) => {
        if (err) return next(err)
        if (todo) {
            let task = new Task()
            task.title = req.body.title
            task.date_created = new Date ()
            task.assigned_to = //TO DO HELPER FUNCTION User.find({})
            req.user.profile_name
            task.save()
            todo.tasks.push(task)
            todo.save()
            res.end()
        } else {
            res.status(404);
            return res.end(`task with id ${req.params.task} not found`);
        }
    })

})

// This returns all the Todos in the DB
app.get('/groups/:groupId/todos', ensureAuthenticated, (req, res, next) => {

  Group
    .findById(req.params.groupId)
    .populate({path: 'todos', populate: {path: 'tasks', populate: {path: 'assigned_to'}}})
    .exec((err, Group) => {
      if (err) return next(err)
        if (Group) {
          res.send({Group})
        } else {
          res.status(404);
          return res.end(`group with id ${req.params.groupId} not found`);
        }    
  })
})


app.get('/home', ensureAuthenticated, (req, res, next) => {
  const id = req.user

  Group.find({people: {$all: [ObjectId(id)]}})
  .populate('people')
  .exec((err, groups) => {
  if (err) return next(err)
  if (err){
     
      res.writeHead(404);	
      return response.end("No user is signed in.");
    } else {
      res.send(groups)
    }  
  });
})
  
//route for getting a groups tasks for one month
app.get('/groups/:groupId/schedule', ensureAuthenticated, (req, res) => {
  const currentMonth = parseInt(req.body.currentMonth)
  const currentYear = parseInt(req.body.currentYear)
  const nextMonth = currentMonth + 1

  Group
    .findById(req.params.groupId)
  //  .populate({path: 'todos', populate: {path: 'tasks'}})
    .populate({path: 'todos', populate: {path: 'tasks', populate: {path:'assigned_to'}}})
    .exec((err, groups) => {
      if (err) {
        res.send(err)
      } else {
        tasks = []
        groups.todos.forEach((todo) => {
          todo.tasks.forEach((task) => {
              tasks.push(task)
          })
        })
        res.send({tasks, currentMonth, currentYear, nextMonth})
      }
    })
})

//Search Group Route
app.get('/search/groups', ensureAuthenticated, (req, res, next) => {
  //spliting the url to grab the keyword we need to compare in our data
  const parsedURL = req.url.split("?");
  // Setting a variable equal to the keyword that is in the 1st index so we can compare
  const queryParams = querySring.parse(parsedURL[1]);

  const query = queryParams.query
  const regExQuery = new RegExp(query, "i")

  Group
    .find({group_name: regExQuery})
    .populate(
      {path:'people'})
    .populate({path: 'comments', populate: {path: 'author'}})
    .populate({path: 'todos', populate: {path:'comments'}, populate: {path:'tasks', 
    populate: {path:'assigned_to'}}})
    .exec((err, groups) => {
      if (err) {
        res.send(err)
      } else {
        res.status(200);
        res.send({groups})
      }
    })
})

//Search Users Route
app.get('/search/users', ensureAuthenticated, (req, res, next) => {
  //spliting the url to grab the keyword we need to compare in our data
  const parsedURL = req.url.split("?");
  // Setting a variable equal to the keyword that is in the 1st index so we can compare
  const queryParams = querySring.parse(parsedURL[1]);

  const query = queryParams.query
  const regExQuery = new RegExp(query, "i")

  User
    .find({profile_name: regExQuery})
    .exec((err, users) => {
      if (err) {
        res.send(err)
      } else {
        res.status(200);
        res.send({users})
      }
    })
})

//add a new task
app.post('/groups/:groupId/todos/:todo/tasks/', (req, res) => {
  let newTask = new Task()

  newTask.title = req.body.title
  newTask.date_created = new Date()
  newTask.due_date = req.body.dueDate || ""
  newTask.completed = false

  User
  .find({profile_name: req.body.profileName})
  .exec((err, user) => {
    if (err) {
      res.send(err)
    } else {
      newTask.assigned_to = user[0]
      newTask.save((err, task) => {
        if (err) {
          res.send(err)
        } else {
          Todo
          .findById(req.params.todo)
          .exec((err, todo) => {
            if (err) {
              res.send(err)
            } else {
              todo.tasks.push(task)
              todo.save((err, todo) => {
                if (err) {
                  res.send(err)
                } else {
                  Group.findOne({ _id: req.params.groupId})
                  .populate({path:'people'})
                  .populate({path: 'comments', populate: {path: 'author'}})
                  .populate({path: 'todos', populate: {path:'comments'}, populate: {path:'tasks', 
                  populate: {path:'assigned_to'}}})
                  .exec((err, group) => {
                    if (err) {
                        return next(err)
                    } if(group) {
                        res.send(group)
                    } else {
                      res.status(404);
                      return res.end(`group with id ${req.params.groupId} not found`);
                    }
                  });
                }
              })
            }
          })
        }
      })
    }
  })
})

//toggle a task as completed or uncompleted
app.put('/groups/:groupId/todos/:todo/tasks/:task/togglecompleted', ensureAuthenticated, (req, res) => {

  Task
  .findById(req.params.task)
  .exec((err, task) => {
    if (err) {
      res.send(err)
    } else {
      if (req.body.completed) {
        task.completed = true
      } else {
        task.completed = false
        }
      }
      task.save((err, response) => {
        if (err) {
          res.send(err)
        } else {
          Todo
          .findById(req.params.todo)
          .populate({path: "tasks"})
          .exec((err, todo) => {
            if (err) {
              res.send(err)
            } else {
              let num_completed = 0
              todo.tasks.forEach(task => {
                if (task.completed == true) {
                  num_completed += 1
                }
              })
              todo.num_completed = num_completed
              todo.save((err, todo) => {
                if (err) {
                  res.send(err)
                } else {
                  Group.findOne({ _id: req.params.groupId})
                  .populate(
                      {path:'people'})
                  .populate({path: 'comments', populate: {path: 'author'}})
                  .populate({path: 'todos', populate: {path:'comments'}, populate: {path:'tasks', 
                  populate: {path:'assigned_to'}}})
                  .exec((err, group) => {
                    if (err) {
                        return next(err)
                    } if(group) {
                        res.send(group)
                    } else {
                      res.status(404);
                      return res.end(`group with id ${req.params.groupId} not found`);
                    }
                  });
                }
              }
              )
            }
          })
        }
      })
    })
})


app.listen(5000, () => {
  console.log("Server listening on port 5000")
})
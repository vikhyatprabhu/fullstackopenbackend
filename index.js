const express = require("express");
const app = express();
var morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.static('build'))
morgan.token('content', function (req, res) {  
  
  if (req.method=="POST") 
     return JSON.stringify(req.body)
  else 
    return ""

})
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.content(req,res)
  ].join(' ')
}))

const bodyParser = require("body-parser");

app.use(bodyParser.json());



let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Ada Lovelace",
    "number": "39-44-5323523",
    "id": 2
  },
  {
    "name": "Dan Abramov",
    "number": "12-43-234345",
    "id": 3
  },
  {
    "name": "Mary Poppendieck",
    "number": "39-23-6423122",
    "id": 4
  },
  {
    "name": "Vikhyat",
    "number": "123124",
    "id": 5
  }
];

app.get("/api/persons", (req, res) => {
  res.json(persons);
});


app.get("/info",(req,res)=>{
  let output="Phonebook has "+persons.length+" entries ";
   output=output.concat("\n\n"+new Date().toUTCString());
   res.write(output);
   res.end();
})

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);

  response.status(204).end();
});


const generateId = () => {
  return Math.floor(Math.random()*Math.floor(100000))
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }
  const person = {
    name:body.name,
    number:body.number,
    id: generateId()
  }
  if(persons.map(p=>p.name).includes(body.name)){
    return response.status(400).json({ 
      error: 'name must be unique' 
    })
  }
  persons = persons.concat(person);
  response.json(person)
})


const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
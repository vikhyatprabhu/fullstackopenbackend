require('dotenv').config()
const express = require('express')
const Person = require('./models/person')
const app = express()
var morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(express.static('build'))

morgan.token('content', function (req, res) {
  if (req.method === 'POST') return JSON.stringify(req.body)
  else return ''
})
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens.content(req, res)
    ].join(' ')
  })
)

const bodyParser = require('body-parser')

app.use(bodyParser.json())

app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(persons => res.json(persons.map(p => p.toJSON())))
    .catch(error => next(error))
})

app.get('/info', (req, res) => {
  Person.find({}).then(persons => {
    let output = 'Phonebook has ' + persons.length + ' entries '
    output = output.concat('\n\n' + new Date().toUTCString())
    res.write(output)
    res.end()
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const updatedPerson = {
    name: body.name,
    number: body.number
  }

  Person
    .findByIdAndUpdate(request.params.id, updatedPerson, { new: true })
    .then(updatedNote => {
      response.json(updatedNote.toJSON())
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(responsePerson => {
      if (responsePerson) {
        response.json(responsePerson.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }
  const tempPerson = new Person({
    name: body.name,
    number: body.number
  })
  console.log('POSTING')
  tempPerson.save()
    .then(newPerson => response.json(newPerson.toJSON()))
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)

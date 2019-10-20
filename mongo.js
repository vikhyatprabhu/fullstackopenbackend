const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
  console.log('give password as argument')
  process.exit(1)
}

const password = encodeURI(process.argv[2])
const url =
  `mongodb+srv://fullstack:${password}@cluster0-05d5i.mongodb.net/phonebook?retryWrites=true&w=majority`
mongoose.connect(url, { useNewUrlParser: true ,useUnifiedTopology: true})

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if(process.argv.length==5){
  let person= new Person ({
    name : process.argv[3],
    number:process.argv[4]
  })
  person.save().then( res=>{
    console.log(`added ${person.name} number ${person.number} to phonebook` );
    mongoose.connection.close()
  }
  )
} else  if (process.argv.length==3){
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(person.name +' '+person.number)
    })
    mongoose.connection.close()
  })
}



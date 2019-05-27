import { hashSync, compare } from 'bcryptjs'
import { gql } from 'apollo-server-express'
export function export_model(ottoman, getFunctions){
  const _throw = m => {throw m}
  const Registry = getFunctions.call(ottoman.model('REGISTRY', {
    username: {type: 'string', readonly: true},
    password: 'string',
    surname: 'string', //Se sesso=M,F
    name: 'string', //Se sesso=M,F;PG
    gender: 'string',//enum M=Maschio, F=Femmina, PG=Persona giuridica
    birth_day: 'string',
    birth_city: 'integer',//Restituito da getComuni
    cf: 'string',//Se sesso=M,F
    vat: 'string',//Se sesso=PG
    nationality: 'string',//Restituito da File excel Tabelle (Cittadinanza)
    address: 'string',
    address_number: 'string',
    state: 'string',//Restituito da File excel Tabelle (Comuni)
    city: 'string',//Restituito da File excel Tabelle (Comuni)
    zip: 'string',
    phone: 'string',
    cellular: 'string',
    email: 'string',
    pec: 'string',//Se sesso=PG obbligatorio o PEC o codice_destinatario (per fattura elettronica AE)
    sdi: 'string',
    createdAt: {type: 'Date', default: Date.now},
    updatedAt: 'Date'
  }, {
    id: 'username'
  }))

  Registry.pre('save', function (user, next) {
    //fixme capire come non ricriptare la password
    if (this.password && this.password.length !== 60) {
      this.password = hashSync(this.password, 10)
    }
    this.updatedAt = new Date()
    next()
  })

  Registry.check_username = async username => await Registry.how_many({username}) && _throw(`Duplicated: ${username}`, 'DUPUSERNAME')
  Registry.check_email = async email => await Registry.how_many({email}) && _throw('Duplicated: ' + email) //non ritorno niente ma serve l'await per testare il throw

  Registry.prototype.matchesPassword = function (password) {
    return compare(password, this.password)
  }
  return Registry
}

export function export_typeDef(){
  return gql`
    extend type Query {
      registry(id: ID!): Registry @guest
      registries(limit: Int, skip: Int): [Registry!]! @guest
    }

    extend type Mutation {
      addRegistry(input: AddRegistryInput): Registry @guest
      editRegistry(input: EditRegistryInput!): Registry @guest
      delRegistry(id: ID!): Registry @guest
      newPassRegistry(id: ID!, password: String!): Registry @guest
      signUpRegistry(email: String!, username: String!, name: String, password: String!): Registry @guest
      signInRegistry(username: String!, password: String!): Registry @guest
      signOutRegistry: Boolean @auth
    }

    input AddRegistryInput {
      username: String!
      password: String!
      surname: String
      name: String
      gender: String
      birth_day: String,
      birth_city: Int
      cf: String
      vat: String
      nationality: String
      address: String
      address_number: String
      state: String
      city: String
      zip: String
      phone: String
      cellular: String
      email: String!
      pec: String
      sdi: String
    }

    input EditRegistryInput {
      username: String!
      password: String!
      surname: String
      name: String
      gender: String
      birth_day: String,
      birth_city: Int
      cf: String
      vat: String
      nationality: String
      address: String
      address_number: String
      state: String
      city: String
      zip: String
      phone: String
      cellular: String
      email: String!
      pec: String
      sdi: String
    }

    type Registry{
      id: ID!
      username: String!
      password: String!
      surname: String
      name: String
      gender: String
      birth_day: String,
      birth_city: Int
      cf: String
      vat: String
      nationality: String
      address: String
      arress_number: String
      state: String
      city: String
      zip: String
      phone: String
      cellular: String
      email: String!
      pec: String
      sdi: String
      createdAt: String!
      updatedAt: String!
    }
  `
}
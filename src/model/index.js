import { hashSync, compare } from 'bcryptjs'
import Joi from 'joi'
import { changeUser, clearUser, notNull, updateFields } from './helpers'

export function export_model (ottoman, getFunctions) {
  const _throw = m => {throw m}
  const Registry = getFunctions.call(ottoman.model('REGISTRY', {
    code: {type: 'string', readonly: true},
    username: 'string',
    cynation: {
      orgId: 'string',
      orgName: 'string',
      orgEmail: 'string'
    },
    password: 'string',
    surname: 'string', //Se sesso=M,F
    name: 'string', //Se sesso=M,F;PG
    gender: 'string',//enum M=Maschio, F=Femmina, PG=Persona giuridica
    birth_day: 'string',
    birth_city: 'string',//Restituito da getComuni, per ora string
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
    area: 'string',
    num_employes: 'integer',
    year_revenue: 'integer',
    createdAt: {type: 'Date', default: Date.now},
    updatedAt: 'Date'
  }, {
    id: 'code'
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

export function export_resolver (registry) {
  return {
    Query: {
      registries: async (root, args, {req}, info) => {
        const filter = args.filter ? JSON.parse(args.filter) : {}
        return registry.search(filter, {sort: ['updatedAt desc']})
      },
      registry: (root, {id}, {req}, info) => {
        return registry.byId(id)
      }
    },
    Mutation: {
      delRegistry: async (root, args, {req}, info) => {
        const reg = await registry.byId(args.id)
        await reg.del()
        return reg
      },
      delFieldRegistry: async (root, args, {req}, info) => {
        console.log(args)
        const reg = await registry.byId(args.id)
        delete reg[args.field]
        await reg.commit()
        return reg
      },
      editRegistry: async (root, {input}, {req}, info) => {
        const reg = await registry.byId(input.id)
        if (reg.email !== input.email) {
          await reg.check_email(input.email)
        }
        updateFields(input, reg, ['id'])
        await reg.commit()
        return reg
      },
      addRegistry: async (root, {input}, {req}, info) => {
        const {email, username, password} = input
        await Joi.validate({email, username, password}, changeUser, {abortEarly: false})
        await registry.check_email(email)
        await registry.check_username(username)
        input.code = input.cf || input.vat || values.username
        return registry.createAndSave(clearUser(input))
      },
      newPass: async (root, args, {req}, info) => {
        const user = await registry.byId(args.id)
        updateFields(args, user, ['id'])
        await user.commit()
        return user
      },
    }
  }
}

export function export_typeDef (gql) {

  const common = `
          username: String!
          surname: String
          name: String
          gender: String
          birth_day: String
          birth_city: String
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
          area: String
          num_employes: Int
          year_revenue: Int
  `

  return gql(String.raw`
      extend type Query {
          registry(id: ID!): Registry @auth
          registry_guest(id: ID!): Registry @guest
          registries(filter: String, limit: Int, skip: Int): [Registry!]! @auth
          registries_guest(limit: Int, skip: Int): [Registry!]! @guest
      }

      extend type Mutation {
          addRegistry(input: AddRegistryInput): Registry @auth
          editRegistry(input: EditRegistryInput): Registry @auth
          delRegistry(id: ID!): Registry @auth
          delFieldRegistry(id: ID!, field: String!): Registry @auth
          newPassRegistry(id: ID!, password: String!): Registry @auth
          signUpRegistry(email: String!, username: String!, name: String, password: String!): Registry @auth
          signInRegistry(username: String!, password: String!): Registry @auth
          signOutRegistry: Boolean @auth
      }


      input CynationInput {
          orgId: String
          orgName: String
          orgEmail: String
      }

      input AddRegistryInput {
          password: String!
          cynation: CynationInput
          #COMMON PART
          ${common}
       }

      input EditRegistryInput {
          id: ID!
          cynation: CynationInput
          #COMMON PART
          ${common}
      }

      type Cynation {
          orgId: String
          orgName: String
          orgEmail: String
      }

      type Registry{
          id: ID!
          password: String!
          createdAt: String!
          updatedAt: String!
          cynation: Cynation
          #COMMON PART
         ${common}
      }
  `)
}
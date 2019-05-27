import { hashSync, compare } from 'bcryptjs'
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
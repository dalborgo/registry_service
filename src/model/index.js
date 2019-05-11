import util from "util"

export function export_model(ottoman, getFunctions){
  const _throw = m => {throw m}
  const User = ottoman.model('User', {
    username: {type: 'string', readonly: true},
    email: 'string',
    name: 'string',
    role: 'string',
    password: 'string',
    createdAt: {type: 'Date', default: Date.now},
    updateAt: 'Date'
  }, {
    id: 'username'
  })
  getFunctions.call(User)

  User.pre('save', function (user, next) {
    //fixme capire come non ricriptare la password
    if (this.password && this.password.length !== 60) {
      this.password = hashSync(this.password, 10)
    }
    this.updateAt = new Date()
    next()
  })

  User.check_email = async email => await User.how_many({email}) && _throw('Duplicated: ' + email) //non ritorno niente ma serve l'await per testare il throw

  User.prototype.matchesPassword = function (password) {
    return compare(password, this.password)
  }

  User.prototype.commit = async function () {
    const save = util.promisify(this.save.bind(this))
    await save()
  }

  User.prototype.expand = async function (path) {
    const load = util.promisify(this.load.bind(this))
    await load(path)
  }
  return User
}
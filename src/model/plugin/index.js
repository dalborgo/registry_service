import util from 'util'
import ottoman from 'ottoman'

export function getPlugin () {
  const findByOrgId = util.promisify(this.findByOrgId.bind(this))
  this._findByOrgId = async id => await findByOrgId(id, {consistency: ottoman.Consistency.LOCAL})
  const findByEmail = util.promisify(this.findByEmail.bind(this))
  this._findByEmail = async id => await findByEmail(id, {consistency: ottoman.Consistency.LOCAL})
  return this
}
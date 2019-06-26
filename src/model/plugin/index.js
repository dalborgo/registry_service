import util from 'util'
import ottoman from 'ottoman'

export function getPlugin () {
  const findByOrgId = util.promisify(this.findByOrgId.bind(this))
  this._findByOrgId = async id => await findByOrgId(id, {consistency: ottoman.Consistency.LOCAL})
  return this
}
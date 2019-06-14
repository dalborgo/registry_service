import Joi from 'joi'
import pickBy from 'lodash/pickBy'
import isNil from 'lodash/isNil'
export function updateFields (input, obj, skipObj) {
  for (let o in input) {
    if (skipObj.indexOf(o) === -1) {
      obj[o] = input[o]
    }
  }
}

export function notNull (args, def) {
  const newObj = {...def, ...args}
  return pickBy(newObj, v => !isNil(v))
}

export const clearUser = input => {
  return input
}

const password = Joi.string().min(8).max(50).regex(/^(?=\S*[a-z])(?=\S*[A-Z]).*$/).required().label('Password').options({
  language: {
    string: {
      regex: {
        base: 'must have at least one lowercase letter, one uppercase letter.'
      }
    }
  }
})
const email = Joi.string().email({ minDomainAtoms: 2 }).required().label('Email')
const username = Joi.string().regex(/[a-zA-Z0-9._]/).min(4).max(30).required().label('Username')
export const changeUser = Joi.object().keys({
  email, username, password
})

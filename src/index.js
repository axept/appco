import fs from 'fs'
import path from 'path'

export const types = {
  string: '@appco/string',
  number: '@appco/number',
  boolean: '@appco/boolean',
  array: '@appco/array',
  object: '@appco/object',
}

/**
 * @param {Object} config Configuration object.
 * @param {Object|String} [profile] Profile data or content from profile file, if this param is
 *                                  not specified - PROFILE env parameter is using
 *                                  by default. You can set it to false to avoid any profile data.
 * @returns {Object} config
 */
export function applyProfileToConfig(config, profile) {
  let profileData
  if (typeof profile === 'object') {
    profileData = profile
  } else if (typeof profile === 'string') {
    const profileInJS = path.join(process.cwd(), `${profile}.js`)
    if (fs.existsSync(profileInJS)) {
      profileData = require(profileInJS)
    } else {
      const profileInJSON = path.join(process.cwd(), `${profile}.json`)
      const profileContent = fs.readFileSync(profileInJSON)
      profileData = JSON.parse(profileContent)
    }
  }

  Object.keys(config).forEach((key) => {
    const value = profileData[key]
    if (value) {
      config[key]['value'] = value
    }
  })

  return config
}

export function applyEnvToConfig(config) {
  Object.keys(config).forEach((key) => {
    const { env, type } = config[key]
    let envKey
    if (typeof env === 'string') {
      envKey = env
    } else if (env === true) {
      envKey = key
    }
    const value = env && process.env && process.env[envKey]
    if (env && value) {
      switch (type) {
        case types.string:
          config[key]['value'] = value
          break
        case types.number:
          config[key]['value'] = parseInt(value, 10)
          break
        case types.boolean:
          config[key]['value'] = value === 'true'
          break
        case types.array:
          config[key]['value'] = value.split(',')
          break
        case types.object:
          try {
            config[key]['value'] = JSON.parse(value)
          } catch (error) {
            console.error(`Wrong env value ${value} defined for key ${key}`)
          }
          break
        default:
          console.error(`Wrong type ${type} defined for key ${key}`)
      }
    }
  })

  return config
}

export function applyNamespaceToConfig(config, namespaces) {
  const filter = Object.keys(namespaces).some(name => namespaces[name] === true)
  Object.keys(config).forEach((key) => {
    const { namespace } = config[key]
    if (!namespace) {
      console.error(`Namespace for key ${key} not defined`)
      delete config[key]
    } else if (filter) {
      const matched = namespace.some(name => namespaces[name])
      if (!matched) {
        delete config[key]
      }
    }
  })
  return config
}

export function validateConfigValues(config) {
  Object.keys(config).forEach((key) => {
    const {
      value, type, required, validate = true,
    } = config[key]
    if (required && typeof value === 'undefined') {
      console.error(`Value for key ${key} must be defined`)
    } else if (typeof value !== 'undefined' && validate) {
      switch (type) {
        case types.string:
          if (typeof value !== 'string') {
            console.error(`Value for key ${key} must be string`)
          }
          break
        case types.number:
          if (Number.isNaN(value) || typeof value !== 'number') {
            console.error(`Value for key ${key} must be number`)
          }
          break
        case types.boolean:
          if (typeof value !== 'boolean') {
            console.error(`Value for key ${key} must be boolean`)
          }
          break
        case types.array:
          if (Object.prototype.toString.call(value) !== '[object Array]') {
            console.error(`Value for key ${key} must be array`)
          }
          break
        case types.object:
          if (Object.prototype.toString.call(value) !== '[object Object]') {
            console.error(`Value for key ${key} must be plain object`)
          }
          break
        default:
          console.error(`Wrong type ${type} defined for key ${key}`)
      }
    }
  })

  return config
}

export function transformConfigToValues(config) {
  Object.keys(config).forEach((key) => {
    const { value } = config[key]
    config[key] = value
  })

  return config
}

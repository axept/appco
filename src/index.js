import fs from 'fs'

/** eslint-disable no-param-reassign */

/**
 * @param {Object} config
 * @param {Object|String} [profile] Profile data or content from profile file, if this param is
 *                                  not specified - PROFILE env parameter is using
 *                                  by default. You can set it to false to avoid any profile data.
 */
export function applyProfileToConfig(config, profile) {
  let profileData;
  if (typeof profile === 'object') {
    profileData = profile;
  } else if (typeof profile === 'string') {
    const finalProfile = profile || process.env['PROFILE'];
    const profileInJS = path.join(process.cwd(), profile + '.js');
    if (fs.existsSync(profileInJS)) {
      profileData = require(profileInJS);
    } else {
      const profileInJSON = path.join(process.cwd(), profile + '.json');
      const profileContent = fs.readFileSync(profileInJSON);
      profileData = JSON.parse(profileContent);
    }
  }

  Object.keys(config).map(key => {
    const value = profileData[key];
  if (value) {
    config[key]['value'] = value;
  }
});

  return config;
}

export function applyEnvToConfig(config) {
  Object.keys(config).map(key => {
    const { env, type } = config[key];
  let envKey;
  if (typeof env === 'string') {
    envKey = env;
  } else if (env === true) {
    envKey = key;
  }
  const value = env && process.env && process.env[envKey];
  if (env && value) {
    switch (type) {
      case 'string':
        config[key]['value'] = value;
        break;
      case 'number':
        config[key]['value'] = parseInt(value, 10);
        break;
      case 'boolean':
        config[key]['value'] = value === 'true';
        break;
      case 'array':
        config[key]['value'] = value.split(',');
        break;
      default:
        console.error(`Wrong type ${type} defined for key ${key}`);
    }
  }
});

  return config;
}

export function applyNamespaceToConfig(config, namespaces) {
  const filter = Object.keys(namespaces).some(name => namespaces[name] === true);
  Object.keys(config).map(key => {
    const { namespace } = config[key];
  if (!namespace) {
    console.error(`Namespace for key ${key} not defined`);
    delete config[key];
  } else if (filter) {
    const matched = namespace.some(name => namespaces[name]);
    if (!matched) {
      delete config[key];
    }
  }
});
  return config;
}

export function validateConfigValues(config) {
  Object.keys(config).map(key => {
    const { value, type, required } = config[key];
  if (required && typeof value === 'undefined') {
    console.error(`Value for key ${key} must be defined`);
  } else if (typeof value !== 'undefined') {
    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          console.error(`Value for key ${key} must be string`);
        }
        break;
      case 'number':
        if (isNaN(value) || typeof value !== 'number') {
          console.error(`Value for key ${key} must be number`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          console.error(`Value for key ${key} must be boolean`);
        }
        break;
      case 'array':
        if (Object.prototype.toString.call(value) !== '[object Array]') {
          console.error(`Value for key ${key} must be array`);
        }
        break;
      default:
        console.error(`Wrong type ${type} defined for key ${key}`);
    }
  }
});

  return config;
}

export function transformConfigToValues(config) {
  Object.keys(config).map(key => {
    const { value } = config[key];
  config[key] = value;
});

  return config;
}

/** eslint-enable no-param-reassign */

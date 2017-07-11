'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.applyProfileToConfig = applyProfileToConfig;
exports.applyEnvToConfig = applyEnvToConfig;
exports.applyNamespaceToConfig = applyNamespaceToConfig;
exports.validateConfigValues = validateConfigValues;
exports.transformConfigToValues = transformConfigToValues;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** eslint-disable no-param-reassign */

/**
 * @param {Object} config
 * @param {Object|String} [profile] Profile data or content from profile file, if this param is
 *                                  not specified - PROFILE env parameter is using
 *                                  by default. You can set it to false to avoid any profile data.
 */
function applyProfileToConfig(config, profile) {
  var profileData = void 0;
  if ((typeof profile === 'undefined' ? 'undefined' : _typeof(profile)) === 'object') {
    profileData = profile;
  } else if (typeof profile === 'string') {
    var finalProfile = profile || process.env['PROFILE'];
    var profileInJS = path.join(process.cwd(), profile + '.js');
    if (_fs2.default.existsSync(profileInJS)) {
      profileData = require(profileInJS);
    } else {
      var profileInJSON = path.join(process.cwd(), profile + '.json');
      var profileContent = _fs2.default.readFileSync(profileInJSON);
      profileData = JSON.parse(profileContent);
    }
  }

  Object.keys(config).map(function (key) {
    var value = profileData[key];
    if (value) {
      config[key]['value'] = value;
    }
  });

  return config;
}

function applyEnvToConfig(config) {
  Object.keys(config).map(function (key) {
    var _config$key = config[key],
        env = _config$key.env,
        type = _config$key.type;

    var envKey = void 0;
    if (typeof env === 'string') {
      envKey = env;
    } else if (env === true) {
      envKey = key;
    }
    var value = env && process.env && process.env[envKey];
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
          console.error('Wrong type ' + type + ' defined for key ' + key);
      }
    }
  });

  return config;
}

function applyNamespaceToConfig(config, namespaces) {
  var filter = Object.keys(namespaces).some(function (name) {
    return namespaces[name] === true;
  });
  Object.keys(config).map(function (key) {
    var namespace = config[key].namespace;

    if (!namespace) {
      console.error('Namespace for key ' + key + ' not defined');
      delete config[key];
    } else if (filter) {
      var matched = namespace.some(function (name) {
        return namespaces[name];
      });
      if (!matched) {
        delete config[key];
      }
    }
  });
  return config;
}

function validateConfigValues(config) {
  Object.keys(config).map(function (key) {
    var _config$key2 = config[key],
        value = _config$key2.value,
        type = _config$key2.type,
        required = _config$key2.required;

    if (required && typeof value === 'undefined') {
      console.error('Value for key ' + key + ' must be defined');
    } else if (typeof value !== 'undefined') {
      switch (type) {
        case 'string':
          if (typeof value !== 'string') {
            console.error('Value for key ' + key + ' must be string');
          }
          break;
        case 'number':
          if (isNaN(value) || typeof value !== 'number') {
            console.error('Value for key ' + key + ' must be number');
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            console.error('Value for key ' + key + ' must be boolean');
          }
          break;
        case 'array':
          if (Object.prototype.toString.call(value) !== '[object Array]') {
            console.error('Value for key ' + key + ' must be array');
          }
          break;
        default:
          console.error('Wrong type ' + type + ' defined for key ' + key);
      }
    }
  });

  return config;
}

function transformConfigToValues(config) {
  Object.keys(config).map(function (key) {
    var value = config[key].value;

    config[key] = value;
  });

  return config;
}

/** eslint-enable no-param-reassign */
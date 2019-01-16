import transform from 'lodash/transform'
import isObject from 'lodash/isObject'

module.exports = {
    replaceKeysDeep: (obj) => {
        return transform(obj, function (result, value, key) { // transform to a new object
            var currentKey = key.replace(/__/gi, ":"); // if the key is in keysMap use the replacement, if not use the original key
            currentKey = currentKey.replace(/^_/, '@');
            result[currentKey] = isObject(value) ? module.exports.replaceKeysDeep(value) : value; // if the key is an object run it through the inner function - replaceKeys
        });
    }
}
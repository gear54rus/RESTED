import crypto from 'crypto';

export const signatureMethods = {}; // eslint-disable-line import/prefer-default-export

['sha1', 'sha256'].forEach(hashName => {
  const id = `hmac-${hashName}`;

  signatureMethods[`hmac-${hashName}`] = {
    caption: id.toUpperCase(),
    hashFunction(baseString, key) {
      return crypto.createHmac(hashName, key).update(baseString).digest('base64');
    },
  };
});

signatureMethods.plaintext = {
  caption: 'PLAINTEXT',
  hashFunction(baseString, key) {
    return key;
  },
};

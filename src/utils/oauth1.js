import crypto from 'crypto';

export const signatureMethods = {};

signatureMethods['hmac-sha1'] = {
  caption: 'HMAC-SHA1',
  hashFunction(baseString, key) {
    return crypto.createHmac('sha1', key).update(baseString).digest('base64');
  },
};

signatureMethods['plaintext'] = {
  caption: 'PLAINTEXT',
  hashFunction(baseString, key) {
    return key;
  },
};

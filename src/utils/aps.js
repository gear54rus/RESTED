/**
 * Given a URL, computes the XMLRPC API
 * for OA on the same host
 */

export function oaAPIURL(url) {
  return `http://${(new URL(url)).hostname}:8440/`;
}

export function isValidToken(string) {
  return Boolean(string);
}

export const tokenTypes = {};

tokenTypes.account = {
  caption: 'Account[, Subscription]',
  placeholders: ['Account ID', 'Subscription ID'],
  generator(accountID, subscriptionID) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
  <methodName>pem.APS.getAccountToken</methodName>
  <params>
    <param>
      <value>
        <struct>
          <member>
            <name>account_id</name>
            <value>
              <i4>${accountID}</i4>
            </value>
          </member>${subscriptionID ? `
          <member>
            <name>subscription_id</name>
            <value>
              <i4>${subscriptionID}</i4>
            </value>
          </member>` : ''}
        </struct>
      </value>
    </param>
  </params>
</methodCall>`;
  },
};

tokenTypes.applicationInstance = {
  caption: 'Application instance',
  placeholders: ['Instance ID'],
  generator(applicationInstanceID) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
  <methodName>pem.APS.getApplicationInstanceToken</methodName>
  <params>
    <param>
      <value>
        <struct>
          <member>
            <name>application_instance_id</name>
            <value>
              <i4>${applicationInstanceID}</i4>
            </value>
          </member>
        </struct>
      </value>
    </param>
  </params>
</methodCall>`;
  },
};

tokenTypes.public = {
  caption: 'Public',
  placeholders: ['Vendor ID'],
  generator(vendorID) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
  <methodName>pem.APS.getPublicToken</methodName>
  <params>
    <param>
      <value>
        <struct>
          <member>
            <name>vendor_id</name>
            <value>
              <i4>${vendorID}</i4>
            </value>
          </member>
        </struct>
      </value>
    </param>
  </params>
</methodCall>`;
  },
};

tokenTypes.serviceTemplate = {
  caption: 'Service template',
  placeholders: ['Service Template ID'],
  generator(serviceTemplateID) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
  <methodName>pem.APS.getServiceTemplateToken</methodName>
  <params>
    <param>
      <value>
        <struct>
          <member>
            <name>service_template_id</name>
            <value>
              <i4>${serviceTemplateID}</i4>
            </value>
          </member>
        </struct>
      </value>
    </param>
  </params>
</methodCall>`;
  },
};

tokenTypes.subscription = {
  caption: 'Subscription',
  placeholders: ['Subscription ID'],
  generator(subscriptionID) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
  <methodName>pem.APS.getSubscriptionToken</methodName>
  <params>
    <param>
      <value>
        <struct>
          <member>
            <name>subscription_id</name>
            <value>
              <i4>${subscriptionID}</i4>
            </value>
          </member>
        </struct>
      </value>
    </param>
  </params>
</methodCall>`;
  },
};

tokenTypes.user = {
  caption: 'User[, Subscription]',
  placeholders: ['User ID', 'Subscription ID'],
  generator(userID, subscriptionID) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
  <methodName>pem.APS.getUserToken</methodName>
  <params>
    <param>
      <value>
        <struct>
          <member>
            <name>subscription_id</name>
            <value>
              <i4>${userID}</i4>
            </value>
          </member>${subscriptionID ? `
          <member>
            <name>user_id</name>
            <value>
              <i4>${subscriptionID}</i4>
            </value>
          </member>` : ''}
        </struct>
      </value>
    </param>
  </params>
</methodCall>`;
  },
};

/*

User token type also has 3rd field
It is not mentioned in OA docs and makes UI ugly so it is not included for now.

tokenTypes.user = {
  caption: 'User[, Subscription][, Original user]',
  placeholders: ['User ID', 'Subscription ID', 'Original user ID'],
  generator(userID, subscriptionID, originalUserID) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
  <methodName>pem.APS.getUserToken</methodName>
  <params>
    <param>
      <value>
        <struct>
          <member>
            <name>subscription_id</name>
            <value>
              <i4>${userID}</i4>
            </value>
          </member>${subscriptionID ? `
          <member>
            <name>user_id</name>
            <value>
              <i4>${subscriptionID}</i4>
            </value>
          </member>` : ''}${originalUserID ? `
          <member>
            <name>original_user_id</name>
            <value>
              <i4>${originalUserID}</i4>
            </value>
          </member>
          ` : ''}
        </struct>
      </value>
    </param>
  </params>
</methodCall>`;
  },
};
 */

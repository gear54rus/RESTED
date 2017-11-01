const payloads = {};

payloads.account = {
  placeholders: ['Account ID', 'Subscription ID'],
  generator: function accountToken(accountID, subscriptionID) {
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

payloads.applicationInstance = {
  placeholders: ['Instance ID'],
  generator: function applicationInstanceToken(applicationInstanceID) {
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

payloads.public = {
  placeholders: ['Vendor ID'],
  generator: function publicToken(vendorID) {
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

payloads.serviceTemplate = {
  placeholders: ['Service Template ID'],
  generator: function serviceTemplateToken(serviceTemplateID) {
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

payloads.subscription = {
  placeholders: ['Subscription ID'],
  generator: function subscriptionToken(subscriptionID) {
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

payloads.user = {
  placeholders: ['User ID', 'Subscription ID'],
  generator: function userToken(userID, subscriptionID) {
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

export default payloads;

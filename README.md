Introduction
------------
CDIF's OAuth implementation

### Notes to OAuth support in CDIF
This module provides OAuth authentication flow and API support to web services which can be modelled by CDIF. Because CDIF provided a common API abstraction for physical hardware or abstract service API, and also [JSON schema based data integrity](https://github.com/out4b/cdif#data-types-and-validation). We hope by introducing this module, CDIF can both flexibly and more securely model any OAuth based web services which are providing their services through web APIs for third party access.

Clients which are trying to access the API of virtual devices managed by CDIF, such as a twitter device, must first complete the OAuth authentication flow starting from CDIF's ```connect``` framework API interface. During the connecting process, CDIF would redirect client to OAuth provider's authentication page and prompt user for acess granting. Successful completion of OAuth flow through CDIF's ```connect``` interface means user granted access to CDIF and its authenticated clients to access contents in its user account.

For now only OAuth 1.0 and [basic Twitter APIs](https://github.com/out4b/cdif-twitter) are included in this implementation. Support to OAuth 2.0 and other web services shall be added soon.

See following links for more details:

[Common device interconnect framework](https://github.com/out4b/cdif)

[OAuth Node.js library](https://github.com/ciaranj/node-oauth)
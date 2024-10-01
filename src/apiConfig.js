//THIS IS A USELESS CHANGE #2

/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LogLevel } from '@azure/msal-browser';

/**
 * Enter here the user flows and custom policies for your B2C application
 * To learn more about user flows, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview
 * To learn more about custom policies, visit: https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview
 */
export const b2cPolicies = {
  names: {
    signUpSignIn: 'b2c_1a_demo_signup_signin_forcepasswordreset',
    // signUpSignIn: 'B2C_1_regular_signup',

    // forgotPassword: 'B2C_1_regular_forget_password',
    forgotPassword: 'b2c_1a_passwordreset',

    // editProfile: 'B2C_1_regular_edit_profile',
    editProfile: 'B2C_1A_PROFILEEDIT',
    signUp: 'B2C_1A_SIGNUP_ONLY',
  },
  authorities: {
    signUpSignIn: {
      authority:
        'https://sinaai.b2clogin.com/sinaai.onmicrosoft.com/B2C_1A_DEMO_SIGNUP_SIGNIN_FORCEPASSWORDRESET',
      // 'https://sinaai.b2clogin.com/sinaai.onmicrosoft.com/b2c_1_regular_signup',
    },
    signUp: {
      authority:
        'https://sinaai.b2clogin.com/sinaai.onmicrosoft.com/B2C_1A_SIGNUP_ONLY',
    },
    forgotPassword: {
      authority:
        'https://sinaai.b2clogin.com/sinaai.onmicrosoft.com/B2C_1A_PASSWORDRESET',
      // 'https://sinaai.b2clogin.com/sinaai.onmicrosoft.com/B2C_1_regular_forget_password',
    },
    editProfile: {
      authority:
        // 'https://sinaai.b2clogin.com/sinaai.onmicrosoft.com/B2C_1A_PROFILEEDIT',
        'https://sinaai.b2clogin.com/sinaai.onmicrosoft.com/B2C_1_regular_edit_profile',
    },
  },
  authorityDomain: 'sinaai.B2Clogin.com',
};

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID, // This is the ONLY mandatory field that you need to supply.
    authority: b2cPolicies.authorities.signUpSignIn.authority, // Choose SUSI as your default authority.
    knownAuthorities: [b2cPolicies.authorityDomain], // Mark your B2C tenant's domain as trusted.
    redirectUri: '', // You must register this URI on Azure Portal/App Registration. Defaults to window.location.origin
    postLogoutRedirectUri: '/', // Indicates the page to navigate after logout.
    navigateToLoginRequestUrl: false, // If "true", will navigate back to the original request location before processing the auth code response.
  },
  cache: {
    cacheLocation: 'sessionStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

/**
 * Add here the endpoints and scopes when obtaining an access token for protected web APIs. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
export const scope = import.meta.env.VITE_SCOPE;
export const url_base = import.meta.env.VITE_URL_BASE;
export const protectedResources = {
  apiTodoList: {
    endpoint: url_base + '/http_transcribe',

    scopes: {
      read: [scope],
      write: [scope],
    },
  },

  apiFeedBack: {
    endpoint: url_base + '/submit_feedback',
    scopes: {
      read: [scope],
      write: [scope],
    },
  },

  apiUpdateNotes: {
    endpoint: url_base + '/update_n_shot',
    scopes: {
      read: [scope],
      write: [scope],
    },
  },

  apiUpdateNote: {
    endpoint: url_base + '/update_note',
    scopes: {
      read: [scope],
      write: [scope],
    },
  },

  apiGetUser: {
    endpoint: url_base + '/get_user?user_id=',
    scopes: {
      read: [scope],
      write: [scope],
    },
  },

  apiGetLastEncounter: {
    endpoint: url_base + '/pull_notes?user_id=',
    scopes: {
      read: [scope],
      write: [scope],
    },
  },
};

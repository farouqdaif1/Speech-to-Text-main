import NextAuth from 'next-auth';
import AzureADB2CProvider from 'next-auth/providers/azure-ad-b2c';
import { cookies } from 'next/headers';

// Function to preprocess requests and modify parameters
async function preprocessRequest(req) {
  const cookieStore = cookies();
  const userFlow = cookieStore.get('userFlow');

  const customUserFlow =
    userFlow?.value || process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW;

  // Return modified auth options based on the request
  return {
    tenantId: process.env.AZURE_AD_B2C_TENANT_NAME,
    clientId: process.env.AZURE_AD_B2C_CLIENT_ID,
    clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET,
    primaryUserFlow: customUserFlow,
  };
}

// Function to create authOptions with dynamic parameters
async function getAuthOptions(req) {
  const { tenantId, clientId, clientSecret, primaryUserFlow } =
    await preprocessRequest(req);

  return {
    providers: [
      AzureADB2CProvider({
        tenantId,
        clientId,
        clientSecret,
        primaryUserFlow,
        authorization: {
          params: {
            scope: 'profile offline_access openid',
          },
        },
        profile: (profile, account) => {
          return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            given_name: profile.given_name,
            family_name: profile.family_name,
          };
        },
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async jwt({ token, account, user }) {
        // Store the id_token and refresh_token when the user signs in
        if (account) {
          token.accessToken = account.id_token;
          token.refreshToken = account.refresh_token; // Store refresh token
        }

        return token;
      },
      async session({ session, token }) {
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken; // Pass refresh token to the session
        session.user.id = token.id;
        return session;
      },
    },
    events: {
      async error(message) {
        console.error('Error in next-auth:', message);
      },
    },
  };
}

// Function to handle access token refresh logic

// Named exports for HTTP methods with preprocessing
export async function GET(req, res) {
  const authOptions = await getAuthOptions(req);
  return NextAuth(req, res, authOptions);
}

export async function POST(req, res) {
  const authOptions = await getAuthOptions(req);
  return NextAuth(req, res, authOptions);
}

///another impl
// import NextAuth from 'next-auth';

// import AzureADB2C from 'next-auth/providers/azure-ad-b2c';

// import type { NextAuthConfig } from 'next-auth';

// const BUFFER_TIME = 5 * 60;

// const azureAdB2cTokentUrl = `https://${process.env.AZURE_AD_B2C_TENANT_ID}.b2clogin.com/${process.env.AZURE_AD_B2C_TENANT_ID}.onmicrosoft.com/${process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW}/oauth2/v2.0/token`;

// async function refreshAccessToken(token: any) {
//   try {
//     const response = await fetch(azureAdB2cTokentUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: new URLSearchParams({
//         grant_type: 'refresh_token',
//         client_id: process.env.AZURE_AD_B2C_CLIENT_ID as string,
//         refresh_token: token.refreshToken as string,
//       }),
//     });

//     const data = await response.json();

//     if (data.access_token) {
//       token.accessToken = data.access_token;
//       token.refreshToken = data.refresh_token;
//       token.tokenExpiresAt = Math.floor(data.expires_in + Date.now() / 1000);
//     }
//   } catch (error) {
//     console.error('Failed to refresh access token', error);
//     token.error = 'RefreshAccessTokenError';
//   }

//   return token;
// }

// export const config = {
//   theme: {
//     logo: 'https://next-auth.js.org/img/logo/logo-sm.png',
//   },
//   providers: [
//     // Apple,
//     // Atlassian,
//     // Auth0,
//     // Authentik,
//     // AzureAD,
//     AzureADB2C({
//       id: 'azure-ad-b2c',
//       name: 'Azure AD B2C',
//       tenantId: process.env.AZURE_AD_B2C_TENANT_ID as string,
//       clientId: process.env.AZURE_AD_B2C_CLIENT_ID as string,
//       // clientSecret: process.env.AZURE_AD_B2C_CLIENT_SECRET as string,
//       primaryUserFlow: process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW,
//       issuer: `https://${process.env.AZURE_AD_B2C_TENANT_ID}.b2clogin.com/${process.env.AZURE_AD_B2C_TENANT_GUID}/v2.0/`,
//       wellKnown: `https://${process.env.AZURE_AD_B2C_TENANT_ID}.b2clogin.com/${process.env.AZURE_AD_B2C_TENANT_ID}.onmicrosoft.com/${process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW}/v2.0/.well-known/openid-configuration`,
//       authorization: {
//         url: `https://${process.env.AZURE_AD_B2C_TENANT_ID}.b2clogin.com/${process.env.AZURE_AD_B2C_TENANT_ID}.onmicrosoft.com/${process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW}/oauth2/v2.0/authorize`,
//         params: {
//           scope: `offline_access openid ${process.env.AZURE_AD_B2C_CLIENT_ID}`,
//         },
//       },
//       token: `https://${process.env.AZURE_AD_B2C_TENANT_ID}.b2clogin.com/${process.env.AZURE_AD_B2C_TENANT_ID}.onmicrosoft.com/${process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW}/oauth2/v2.0/token`,
//       checks: ['pkce'],
//       client: {
//         token_endpoint_auth_method: 'none',
//       },
//     }),

//   ],
//   basePath: '/auth',
//   callbacks: {
//     async authorized({ request, auth }) {
//       const { pathname } = request.nextUrl;
//       if (pathname === '/middleware-example') return !!auth;
//       return true;
//     },
//     async jwt({ token, trigger, session, account }) {
//       if (trigger === 'update') token.name = session.user.name;

//       if (account?.access_token) {
//         token.accessToken = account.access_token;
//         token.refreshToken = account.refresh_token;
//         token.tokenExpiresAt = account.expires_at;
//       }

//       if (Date.now() / 1000 < (token.tokenExpiresAt as number) - BUFFER_TIME) {
//         return token;
//       }

//       return refreshAccessToken(token);
//     },
//     async session({ session, token }) {
//       return {
//         ...session,
//         accessToken: token.accessToken,
//       };
//     },
//   },
// } satisfies NextAuthConfig;

// export const { handlers, auth, signIn, signOut } = NextAuth(config);

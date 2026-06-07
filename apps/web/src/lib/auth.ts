import { type NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "zitadel",
      name: "Zitadel",
      type: "oauth",
      issuer: process.env.ZITADEL_ISSUER,
      clientId: process.env.ZITADEL_CLIENT_ID!,
      clientSecret: process.env.ZITADEL_CLIENT_SECRET!,
      wellKnown: `${process.env.ZITADEL_ISSUER}/.well-known/openid-configuration`,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
      idToken: true,
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.zitadelId = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.zitadelId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

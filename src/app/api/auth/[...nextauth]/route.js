import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID || process.env.CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      issuer: 'https://discord.com',
      authorization: {
        url: 'https://discord.com/api/oauth2/authorize',
        params: {
          scope: 'identify email guilds'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.id = profile.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.id || token.sub;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'revera_super_secret_session_key'
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };


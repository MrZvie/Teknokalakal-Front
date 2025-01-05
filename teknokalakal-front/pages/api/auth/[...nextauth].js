import { MongoDBAdapter } from '@auth/mongodb-adapter';
import client from '@/lib/mongodb';
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { User } from '@/models/User';
import { mongooseConnect } from '@/lib/mongoose';

async function findUserByEmail(email) {
  await mongooseConnect();
  try {
    return await User.findOne({ email });
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

export const authOptions = {
  adapter: MongoDBAdapter(client),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        username: { label: "Username", type: "text" },
        name: { label: "Name", type: "text" },
      },
      authorize: async (credentials) => {
        const user = await findUserByEmail(credentials.email);
        console.log("Login attempt for email:", credentials.email);

        if (user && user.password) {
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          console.log("Password valid:", isPasswordValid);

          if (isPasswordValid) {
            return {
              id: user._id,
              email: user.email,
              name: user.name,
              username: user.username,
              role: user.role,
              provider: user.provider,
              image: user.image,
            };
          } else {
            throw new Error("Invalid password");
          }
        } else {
          console.log("User not found");
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.client-token", // Unique cookie name for client
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user info to the token only on initial login
      if (user) {
        token.id = user.id.toString();
        token.email = user.email;
        token.name = user.name;
        token.username = user.username;
        token.role = user.role;
        token.image = user.image;
        token.address = user.address || {};
      } else if (token.id) {
        // Fetch updated user data if no `user` is present but token exists
        const dbUser = await findUserByEmail(token.email);
        if (dbUser) {
          token.name = dbUser.name;
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.image = dbUser.image;
          token.address = dbUser.address || {};
        }
      }
      return token;
    },
    async session({ session, token }) {
      // console.log("Session callback", { session, token });
      // Populate session.user with JWT token data
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          username: token.username,
          role: token.role,
          image: token.image,
          address: token.address || {},
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.SECRET,
  debug: true,
};

export default NextAuth(authOptions);

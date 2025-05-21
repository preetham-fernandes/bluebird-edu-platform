// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import prisma from "@/lib/db/prisma";
import type { NextAuthOptions } from "next-auth";

// Create a custom adapter by extending the PrismaAdapter
const customAdapter = {
  ...PrismaAdapter(prisma),
  createUser: async (data: any) => {
    // Map 'image' field to 'profileImg' in your schema
    const { image, ...userData } = data;
    
    return prisma.user.create({
      data: {
        ...userData,
        profileImg: image, // Store the image URL in profileImg field
      },
    });
  },
  getUser: async (id: string) => {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    
    if (!user) return null;
    
    // Map profileImg to image for NextAuth
    return {
      ...user,
      image: user.profileImg,
    };
  },
  getUserByEmail: async (email: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) return null;
    
    // Map profileImg to image for NextAuth
    return {
      ...user,
      image: user.profileImg,
    };
  },
  // You might need other methods based on what NextAuth uses
};

const authOptions: NextAuthOptions = {
  debug: true, // Set to false in production
  adapter: customAdapter as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          // Using profileImg instead of image to match your schema
          profileImg: profile.picture,
          emailVerified: new Date(),
          profileCompleted: false,
          role: "user"
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Email does not exist");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: user.profileImg || undefined,
          profileCompleted: user.profileCompleted,
          role: user.role || "user"
        };
      },
    }),
    EmailProvider({
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM,
      }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/error",
    // newUser: "/auth/register", // Commented out as it might cause issues
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
        // Log information to help debug
        console.log("Sign in callback:", { user, account, profile });
        return true;
    },
    async session({ session, token }) {
      // Assign the sub value from token to session.user.id
      if (token) {
        session.user.id = token.sub ?? token.id ?? ''; // Fallback to empty string if both are undefined
        session.user.role = token.role as string;
        session.user.profileCompleted = token.profileCompleted as boolean;
        
        // Ensure image field is properly populated
        if (!session.user.image && token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
        console.log("JWT callback:", { token, user });

      // Initial sign in
      if (user) {
        token.id = user.id.toString();
        token.role = user.role || "user";
        token.profileCompleted = user.profileCompleted || false;
        // Store the profile image URL in the token
        if (user.image) {
          token.picture = user.image;
        }
      }
      
      // Update token when session is updated
      if (trigger === "update" && session) {
        // Make sure the session includes the role
        console.log("Session update:", session);
        if (session.user?.role) {
          token.role = session.user.role;
        }
        if (session.user?.profileCompleted !== undefined) {
          token.profileCompleted = session.user.profileCompleted;
        }
        if (session.user?.image) {
          token.picture = session.user.image;
        }
      }
      
      return token;
    },
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
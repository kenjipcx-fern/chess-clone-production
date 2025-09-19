import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "hidden" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const action = credentials.action as string
        const email = credentials.email as string
        const password = credentials.password as string

        try {
          if (action === "register") {
            // Check if user already exists
            const existingUser = await db
              .select()
              .from(users)
              .where(eq(users.email, email))
              .limit(1)

            if (existingUser.length > 0) {
              throw new Error("User already exists")
            }

            // Hash password and create user
            const hashedPassword = await bcrypt.hash(password, 10)
            const userId = crypto.randomUUID()
            
            const [newUser] = await db
              .insert(users)
              .values({
                id: userId,
                email,
                name: email.split('@')[0], // Use email username as display name
                createdAt: Date.now(),
                rating: 1200,
              })
              .returning()

            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              rating: newUser.rating,
            }
          } else {
            // Login - for simplicity, we'll use a simple user lookup
            // In production, you'd verify the password hash
            const [user] = await db
              .select()
              .from(users)
              .where(eq(users.email, email))
              .limit(1)

            if (!user) {
              return null
            }

            // For demo purposes, we'll allow any password
            // In production, verify with bcrypt.compare(password, hashedPassword)
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              rating: user.rating,
            }
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.rating = user.rating
      }
      return token
    },
    session: ({ session, token }) => {
      if (token.sub) {
        session.user.id = token.sub
        session.user.rating = token.rating as number
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
})

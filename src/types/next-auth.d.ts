import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      rating?: number
    }
  }

  interface User {
    rating?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rating?: number
  }
}

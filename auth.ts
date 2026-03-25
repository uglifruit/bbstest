import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '@/lib/supabase'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        handle: {},
        password: {},
      },
      async authorize(credentials) {
        const handle = (credentials?.handle as string | undefined)?.toLowerCase().trim()
        const password = credentials?.password as string | undefined
        if (!handle || !password) return null

        const supabase = getSupabaseAdmin()
        if (!supabase) return null

        const { data: user } = await supabase
          .from('users')
          .select('id, handle, password_hash')
          .eq('handle', handle)
          .single()

        if (!user) return null

        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return null

        return { id: String(user.id), name: user.handle }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/' },
})

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

const looksLikeExample = (value) =>
  typeof value === 'string' && value.toLowerCase().includes('your_supabase_')

export const supabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !looksLikeExample(supabaseUrl) && !looksLikeExample(supabaseAnonKey),
)

const createNullSupabase = () => {
  return {
    auth: {
      async getSession() {
        return { data: { session: null }, error: null }
      },
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe() {} } } }
      },
      async signInWithPassword() {
        return {
          data: null,
          error: { message: 'Supabase non configuré (ajoute VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY)' },
        }
      },
      async signOut() {
        return { error: null }
      },
    },
    from() {
      return {
        select() {
          return {
            async single() {
              return { data: null, error: { code: 'PGRST116', message: 'no rows found' } }
            },
          }
        },
        async upsert() {
          return {
            error: { message: 'Supabase non configuré (écriture cloud désactivée)' },
          }
        },
      }
    },
  }
}

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createNullSupabase()

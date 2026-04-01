import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xzraoielewguwfrufeqk.supabase.co'
const supabaseAnonKey = 'sb_publishable_EH_2k5AWtipYgBPLnKilaQ_7J0Xs8n_'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

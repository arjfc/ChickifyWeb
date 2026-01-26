// import { createClient } from "@supabase/supabase-js";

// const url = import.meta.env.VITE_SUPABASE_URL;
// // accept either naming style
// const anon =
//   import.meta.env.VITE_SUPABASE_ANON_KEY ??
//   import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// let supabase = null;

// if (!url || !anon) {
//   console.error(
//     "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY/PUBLISHABLE_KEY. " +
//     "Add them to client/.env.local and restart `npm run dev`."
//   );
// } else {
//   supabase = createClient(url, anon);
// }

// export { supabase };

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY; 
  // ?? import.meta.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseKey) {
  console.error(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY/PUBLISHABLE_KEY. " +
      "Add them to client/.env.local and restart the dev server."
  );
}

// guard for SSR/build tools (Vite dev is in browser, but just in case)
const storage = typeof window !== "undefined" ? window.localStorage : undefined;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage, // will be localStorage in browser
  },
});

import Link from 'next/link';
import { useState, useEffect } from "react";
import { supabase } from '../lib/supabaseClient';
import { Session } from "@supabase/supabase-js";

const Nav = () => {
  const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })
      
      return () => subscription.unsubscribe()
    }, [])

    async function signInWithDiscord() {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
      })
    }
  
    async function signout() {
      const { error } = await supabase.auth.signOut()
    }
   console.log(session)
   const [userRoles, setUserRoles] = useState(null);

   useEffect(() => {
    // Guard clause: return if session is null
    if (!session) return;

    const discordUserId = session.user.id;
    const guildId = '919622034546372679';

    fetch(`/api/userRoles?userId=${discordUserId}&guildId=${guildId}`)
      .then(response => {
        console.log("userRoles response", response)
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setUserRoles(data))
      .catch(error => console.error('Error:', error));

  }, [session]); // Add session as a dependency

  return (
    <nav className="routes">
          <Link href="/" className="navitems">
            Home
          </Link>
          <Link href='/about' className="navitems">
            About
          </Link>
          <Link href='/contact' className="navitems">
            Contact
          </Link>
          {!session && (<button onClick={signInWithDiscord} className="navitems">
          Sign In with Discord
        </button>)}
          {session && (
          <button onClick={signout} className="navitems">
          Sign Out
          </button>)}
    </nav>
  );
};

export default Nav;
import Link from 'next/link';
import axios from 'axios';
import { useState, useEffect } from "react";
import { supabase } from '../lib/supabaseClient';
import { Session } from "@supabase/supabase-js";
import { useMyVariable } from '../context/MyVariableContext';

type RoleData = {
  roles: {
    [key: string]: string;
  };
  userRoles: string[];
  isAdmin: boolean;  
};


const Nav = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [roleData, setRoleData] = useState<RoleData | null>(null);
  const { myVariable, setMyVariable } = useMyVariable();

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
        options: {
          redirectTo: 'https://genuine-custard-2ef739.netlify.app/meeting-summaries',
        },
      })
    }
  
    async function signout() {
      const { error } = await supabase.auth.signOut()
    }
   //console.log(session)

   useEffect(() => {
    // Guard clause: return if session is null
    if (!session) return;
  
    const discordUserId = session.user.user_metadata.sub;
    const guildId = '919622034546372679';
  
    axios.get(`/api/userRoles?userId=${discordUserId}&guildId=${guildId}`)
    .then(response => {
      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }
      setMyVariable(prevState => ({
        ...prevState,
        isAdmin: response.data.isAdmin
      }));
      setRoleData(prevState => {
        if (prevState) {
          return {
            roles: prevState.roles,
            userRoles: prevState.userRoles,
            isAdmin: response.data.isAdmin
          };
        } else {
          // Assuming default values for roles and userRoles
          return {
            roles: {},
            userRoles: [],
            isAdmin: response.data.isAdmin
          };
        }
      });
      console.log("user is admin:", response.data.isAdmin); 
    })
    .catch(error => console.error('Error:', error));
  
  }, [session]);  

  return (
    <nav className="routes">
      <div className="navLeft">
        <Link href="/" className="navitems">
          Home
        </Link>
        <Link href='/meeting-summaries' className="navitems">
          Upload Meeting Summaries
        </Link>
        {roleData?.isAdmin && (
          <Link href='/admin-panel' className="navitems">
            Admin Panel
          </Link>
        )}
        <Link href='/contact' className="navitems">
          Contact
        </Link>
      </div>
      <div>
        {!session && (
          <button onClick={signInWithDiscord} className="navitems">
            Sign In with Discord
          </button>)}
        {session && (
          <button onClick={signout} className="navitems">
            Sign Out
          </button>)}
      </div>
    </nav>
  );
};

export default Nav;
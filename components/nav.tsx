import Link from 'next/link';
import axios from 'axios';
import { useState, useEffect } from "react";
import { supabase } from '../lib/supabaseClient';
import { Session } from "@supabase/supabase-js";
import { useMyVariable } from '../context/MyVariableContext';
import { saveUser } from '../utils/saveUser'

type RoleData = {
  roles: {
    [key: string]: string;
  };
  userRoles: string[];
  isAdmin: boolean;  
  discordRoles: string[];
  appRole: string;
};


const Nav = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [roleData, setRoleData] = useState<RoleData | null>(null);
  const { myVariable, setMyVariable } = useMyVariable();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setMyVariable(prevState => ({
        ...prevState,
        isLoggedIn: !!session 
      }));
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setMyVariable(prevState => ({
        ...prevState,
        isLoggedIn: !!session 
      }));
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

   useEffect(() => {
    // Guard clause: return if session is null
    if (!session) return;
  
    /*const discordUserId = session.user.user_metadata.sub;
    const guildId = '919622034546372679';
  
    axios.get(`/api/userRoles?userId=${discordUserId}&guildId=${guildId}`)
    .then(response => {
      if (response.status !== 200) {
        throw new Error('Network response was not ok');
      }*/
      saveUsername();
      const userId = session.user.id;
      axios.get(`/api/userRoles?userId=${userId}`)
      .then(response => {
        if (response.status !== 200) {
          throw new Error('Network response was not ok');
        }
      setMyVariable(prevState => ({
        ...prevState,
        roles: response.data
      }));
      setRoleData(prevState => {
        if (prevState) {
          return {
            roles: prevState.roles,
            userRoles: prevState.userRoles,
            isAdmin: response.data.isAdmin,
            discordRoles: response.data.discordRoles,
            appRole: response.data.appRole
          };
        } else {
          // Assuming default values for roles and userRoles
          return {
            roles: {},
            userRoles: [],
            isAdmin: response.data.isAdmin,
            discordRoles: response.data.discordRoles,
            appRole: response.data.appRole
          };
        }
      });
    })
    .catch(error => console.error('Error:', error));
  
  }, [session]);  

  async function saveUsername() {
    const data = await saveUser(session?.user.user_metadata);
  }

  return (
    <nav className="routes">
      <div className="navLeft">
        <Link href="/" className="navitems">
          Home
        </Link>
        <Link href='/submit-meeting-summary' className="navitems">
          Submit Meeting Summary
        </Link>
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
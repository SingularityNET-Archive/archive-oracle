import Link from 'next/link';
import { useState, useEffect } from "react";

const Nav = () => {

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
    </nav>
  );
};

export default Nav;
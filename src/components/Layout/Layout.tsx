import React from 'react'
import Navbar from '../Navbar/Navbar'

interface MyLayoutProps {
  children?: React.ReactNode
}

const Layout: React.FC<MyLayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}
export default Layout

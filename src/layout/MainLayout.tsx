import Header from 'components/Header'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const [hideHeader, setHideHeader] = useState(false)

  useEffect(() => {
    setHideHeader(router.asPath.startsWith('/music/'))
  }, [])

  return (
    <div className="container mx-auto">
      {!hideHeader && <Header />}
      {children}
    </div>
  )
}

export default MainLayout

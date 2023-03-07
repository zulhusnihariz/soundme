import { create, IPFSHTTPClient } from 'ipfs-http-client'
import { createContext, useContext, useEffect, useState } from 'react'

interface IpfsContextInterface {
  ipfs: any
}

export const IpfsContext = createContext<IpfsContextInterface | undefined>(undefined)

export const useIpfs = () => {
  const context = useContext(IpfsContext)
  if (!context) {
    throw new Error('useIpfs must be used within a IpfsProvider')
  }
  return context.ipfs
}

interface IpfsProviderProps {
  children: React.ReactNode
}

export const IpfsProvider: React.FC<IpfsProviderProps> = ({ children }) => {
  const [isIPFSConnected, setIsIPFSConnected] = useState(false)
  const [ipfs, setIpfs] = useState(null)

  useEffect(() => {
    async function startIpfs() {
      if (!isIPFSConnected) {
        try {
          const projectId = '2HDrQBzBA6e4Elmdwhpa6Mjg1Qs'
          const projectSecret = 'a8a2d7f469b2e8dbfc4dece05bdde035'

          const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
          const client = await create({
            host: 'ipfs.infura.io',
            port: 5001,
            protocol: 'https',
            headers: {
              authorization: auth,
            },
          })

          setIpfs(client)
          setIsIPFSConnected(Boolean(client))
        } catch (error) {
          console.error('IPFS init error:', error)
        }
      }
    }

    startIpfs()
  }, [isIPFSConnected])

  if (!isIPFSConnected) {
    return <div>Connecting to Ipfs...</div>
  }

  return (
    <IpfsContext.Provider value={{ ipfs }}>
      <div>{children}</div>
    </IpfsContext.Provider>
  )
}

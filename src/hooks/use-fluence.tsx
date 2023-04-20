import React, { createContext, useContext, useEffect, useState } from 'react'
import { Fluence } from '@fluencelabs/fluence'

interface FluenceContextInterface {
  fluence: typeof Fluence
}

export const FluenceContext = createContext<FluenceContextInterface | undefined>(undefined)

export const useFluence = () => {
  const context = useContext(FluenceContext)
  if (!context) {
    throw new Error('useFluence must be used within a FluenceProvider')
  }
  return context.fluence
}

interface FluenceProviderProps {
  children: React.ReactNode
}

export const FluenceProvider: React.FC<FluenceProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    async function connectToFluence() {
      if (!Fluence.getStatus().isConnected) {
        try {
          await Fluence.start({
            connectTo: {
              multiaddr:
                '/dns4/dev.fluence.0x3zero.com/tcp/19991/wss/p2p/12D3KooWHBG9oaVx4i3vi6c1rSBUm7MLBmyGmmbHoZ23pmjDCnvK',
              peerId: '12D3KooWHBG9oaVx4i3vi6c1rSBUm7MLBmyGmmbHoZ23pmjDCnvK',
            },
          })
          setIsConnected(true)
        } catch (e) {
          console.log(e)
        }
      }
    }
    connectToFluence()
  }, [])

  if (!isConnected) {
    return <div>Connecting to Fluence...</div>
  }

  return (
    <FluenceContext.Provider value={{ fluence: Fluence }}>
      <div>{children}</div>
    </FluenceContext.Provider>
  )
}

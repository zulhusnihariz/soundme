import { ErrorMessage } from 'components/Icons/icons'
import React, { createContext, useState, ReactNode, useEffect } from 'react'

interface ErrorMessageContextInterface {
  errorMessage: string | null
  showError: (message: string) => void
  hideError: () => void
}

export const ErrorMessageContext = createContext<ErrorMessageContextInterface>({
  errorMessage: null,
  showError: () => {},
  hideError: () => {},
})

interface ErrorMessageProviderProps {
  children: ReactNode
}

export const ErrorMessageProvider = ({ children }: ErrorMessageProviderProps) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const showError = (message: string) => {
    setErrorMessage(message)
  }

  const hideError = () => {
    setErrorMessage(null)
  }

  useEffect(() => {
    let timeout = null

    if (errorMessage) {
      timeout = setTimeout(() => {
        setErrorMessage(null)
      }, 1500)
    }

    return () => {
      clearTimeout(timeout)
    }
  }, [errorMessage])

  return (
    <ErrorMessageContext.Provider value={{ errorMessage, showError, hideError }}>
      <div className="absolute inset-x-0 z-50 flex justify-center">
        {errorMessage && <ErrorMessage message={errorMessage} />}
      </div>
      {children}
    </ErrorMessageContext.Provider>
  )
}

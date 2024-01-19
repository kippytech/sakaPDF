import { ReactNode, createContext, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";

type ChatContextType = {
    addMessage: () => void,
    message: string,
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
    isLoading: boolean
}

export const ChatContext = createContext<ChatContextType>({
    addMessage: () => {},
    message: '',
    handleInputChange: () => {},
    isLoading: false
})

interface Props {
    fileId: string
    children: ReactNode
}

export  const ChatContextProvider = ({ fileId, children}: Props) => {
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const {toast} = useToast()

    const {mutate: sendMessage} = useMutation({
        mutationFn: async ({ message }: { message: string }) => {
            const res = await fetch('/api/message', {
                method: 'POST',
                body: JSON.stringify({fileId, message})
            })

            if (!res.ok) {
                throw new Error('Failed to send message')
            }

            return res.body
        }
    })

    const addMessage = () => sendMessage({ message })

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    return (
        <ChatContext.Provider value={{addMessage, handleInputChange, isLoading, message}}>
            { children }
        </ChatContext.Provider>
    )
}
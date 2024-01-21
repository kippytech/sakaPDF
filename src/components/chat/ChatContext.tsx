import { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infiniteQuery";

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

    const utils = trpc.useContext()

    const backupMessage = useRef('')

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
        },
        onMutate: async({ message}) => {
            backupMessage.current = message
            setMessage('')

            //optimistic updates
            //1. cancel any outgoing calls
            await utils.getFileMessages.cancel()

            //2. snapshot previous value
            const previousMessages = utils.getFileMessages.getInfiniteData()

            //3. optimistically insert new message right away after sending
            utils.getFileMessages.setInfiniteData(
                { fileId, limit: INFINITE_QUERY_LIMIT },
                (old) => {
                    if (!old) {
                        return {
                            pages: [],
                            pageParams: []
                        }
                    }

                    //clone the old pages
                    let newPages = [...old.pages]

                    let latestPage = newPages[0]

                    latestPage.messages = [
                        {
                            id: crypto.randomUUID(),
                            createdAt: new Date().toISOString(),
                            text: message,
                            isUserMessage: true
                        },
                        ...latestPage.messages
                    ]

                    newPages[0] = latestPage

                    return {
                        ...old,
                        pages: newPages
                    }
                }
            )

            setIsLoading(true)

            return {
                previousMessages: previousMessages?.pages.flatMap((page) => page.messages ?? [])
            }
        },
        onSuccess: async (stream) => {
            setIsLoading(false)

            if (!stream) {
                return toast({
                    title: 'There was an error sending this message',
                    description: 'Please refresh this page and try again',
                    variant: 'destructive'
                })
            }

            const reader = stream.getReader()
            const decoder = new TextDecoder()
            
            let done = false

            //accumulated response
            let accResponse = ''

            while (!done) {
                const {value, done: doneReading} = await reader.read()
                done = doneReading

                const chunkValue = decoder.decode(value)

                accResponse += chunkValue

                //append chunk to the actual message
                utils.getFileMessages.setInfiniteData(
                    {fileId, limit: INFINITE_QUERY_LIMIT},
                    (old) => {
                        if (!old) return { pages: [], pageParams: []}

                        let isAIResponseCreated = old.pages.some((page) => page.messages.some((message) => message.id === 'ai-response'))

                        let updatedPages = old.pages.map((page) => {
                            if (page === old.pages[0]) {
                                let updatedMessages

                                if (!isAIResponseCreated) {
                                    updatedMessages = [
                                        {
                                            id: 'ai-response',
                                            createdAt: new Date().toISOString(),
                                            text: accResponse,
                                            isUserMessage: false
                                        },
                                        ...page.messages
                                    ]
                                } else {
                                    updatedMessages = page.messages.map((message) => {
                                        if (message.id === 'ai-response') {
                                            return {
                                                ...message,
                                                text: accResponse
                                            }
                                        }
                                        return message
                                    })
                                }

                                return {
                                    ...page,
                                    messages:updatedMessages
                                }
                            }

                            return page
                        })

                        return { ...old, pages: updatedPages}
                    }
                )
            }
        },
        onError: (_, __, context) => {
            //set the text back to textarea
            setMessage(backupMessage.current)
            utils.getFileMessages.setData(
                {fileId},
                {messages: context?.previousMessages ?? []}
            )
        },
        onSettled: async () => {
            setIsLoading(false)

            await utils.getFileMessages.invalidate({ fileId })
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
import { useState } from 'react'
import { Box, Container, VStack, Input, Button, Text, useColorMode, HStack, Image, Switch, UnorderedList, OrderedList, ListItem, Flex, Heading } from '@chakra-ui/react'
import laymanProfile from './assets/layman_profile.png'
import corporateProfile from './assets/corporate_profile.png'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { colorMode, toggleColorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  
  // Get API key from environment variable
  const apiKey = import.meta.env.VITE_CHATGPT_KEY

  // Function to format message content with proper list rendering
  const formatMessageContent = (content: string) => {
    // Check if the content contains a list
    if (content.includes('- ') || content.includes('* ') || content.includes('1. ') || content.includes('2. ')) {
      // Split the content into paragraphs
      const paragraphs = content.split('\n\n');
      
      return paragraphs.map((paragraph, index) => {
        // Check if this paragraph is a list
        if (paragraph.includes('- ') || paragraph.includes('* ')) {
          // It's an unordered list
          const listItems = paragraph.split('\n').filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));
          
          if (listItems.length > 0) {
            return (
              <UnorderedList key={index} spacing={1} pl={4}>
                {listItems.map((item, i) => (
                  <ListItem key={i}>{item.replace(/^[-*]\s+/, '')}</ListItem>
                ))}
              </UnorderedList>
            );
          }
        } else if (paragraph.includes('1. ') || paragraph.includes('2. ')) {
          // It's an ordered list
          const listItems = paragraph.split('\n').filter(line => /^\d+\.\s+/.test(line.trim()));
          
          if (listItems.length > 0) {
            return (
              <OrderedList key={index} spacing={1} pl={4}>
                {listItems.map((item, i) => (
                  <ListItem key={i}>{item.replace(/^\d+\.\s+/, '')}</ListItem>
                ))}
              </OrderedList>
            );
          }
        }
        
        return <Text key={index} mb={2}>{paragraph}</Text>;
      });
    }
    
    // No lists found, return regular text
    return <Text>{content}</Text>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const newMessage: Message = {
      role: 'user',
      content: input
    }
    setMessages(prev => [...prev, newMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Call ChatGPT API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that translates layman speak into how a corporate person would say it.' },
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: input }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error calling ChatGPT API:', error)
      // Fallback to simulated response if API call fails
      const aiResponse: Message = {
        role: 'assistant',
        content: 'This is a simulated response. There was an error connecting to the AI API.'
      }
      setMessages(prev => [...prev, aiResponse])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      minH="100%"
      bg={isDark ? 'gray.900' : 'gray.50'}
      color={isDark ? 'white' : 'gray.800'}
    >
      
    </Box>
  )
}

export default App

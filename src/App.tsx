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
        
        // Regular paragraph
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
      {/* Header */}
      <Box 
        as="header" 
        py={4} 
        px={6} 
        height="73px"
        bg={isDark ? 'gray.800' : 'white'} 
        borderBottom="1px" 
        borderColor={isDark ? 'gray.700' : 'gray.200'}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Flex justify="space-between" align="center" position="relative" h="full">
          {/* Empty box to balance the layout */}
          <Box w="100px" />
          
          {/* Centered heading */}
          <Heading size="md" position="absolute" left="50%" transform="translateX(-50%)" my="auto">
            Layman to corporate speak
          </Heading>
          
          {/* Theme toggle */}
          <HStack spacing={2} minW="100px" justify="flex-end" align="center">
            <Text fontSize="sm">🌞</Text>
            <Switch 
              isChecked={isDark} 
              onChange={toggleColorMode}
              colorScheme="blue"
            />
            <Text fontSize="sm">🌙</Text>
          </HStack>
        </Flex>
      </Box>

      <HStack spacing={0} align="stretch" justifyContent="center" h="calc(100vh - 73px)">
        {/* Left Profile Image - Now Corporate */}
        <Box 
          w="250px" 
          display={{ base: "none", md: "block" }}
          p={4}
          borderRight="1px"
          borderColor={isDark ? 'gray.700' : 'gray.200'}
        >
          <VStack spacing={4} align="center" justify="center" h="full">
            <Image 
              src={corporateProfile} 
              alt="Corporate Profile" 
              borderRadius="full" 
              boxSize="200px"
              objectFit="cover"
              transform="scaleX(-1)"
            />
            <Text fontWeight="bold" textAlign="center">Corporate</Text>
          </VStack>
        </Box>

        {/* Main Chat Container */}
        <Container
          p={0} 
          flex={1} 
          position="relative"
          margin={0}
        >
          <VStack h="full" spacing={0}>
            {/* Messages Area */}
            <Box
              flex={1}
              w="full"
              overflowY="auto"
              p={4}
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: isDark ? 'gray.600' : 'gray.300',
                  borderRadius: '24px',
                },
              }}
            >
              <VStack spacing={4} align="stretch">
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    p={4}
                    bg={message.role === 'user' 
                      ? (isDark ? 'blue.900' : 'blue.50')
                      : (isDark ? 'gray.800' : 'white')
                    }
                    borderRadius="lg"
                    maxW="80%"
                    alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
                    position="relative"
                  >
                    {message.role === 'user' ? (
                      <Text>{message.content}</Text>
                    ) : (
                      <Box position="relative">
                        {formatMessageContent(message.content)}
                      </Box>
                    )}
                  </Box>
                ))}
              </VStack>
            </Box>

            {/* Input Area */}
            <Box
              w="full"
              p={4}
              borderTop="1px"
              borderColor={isDark ? 'gray.700' : 'gray.200'}
              bg={isDark ? 'gray.900' : 'white'}
            >
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    size="lg"
                    bg={isDark ? 'gray.800' : 'white'}
                    borderColor={isDark ? 'gray.600' : 'gray.200'}
                    _hover={{
                      borderColor: isDark ? 'gray.500' : 'gray.300',
                    }}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: 'none',
                    }}
                  />
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                  >
                    Send Message
                  </Button>
                </VStack>
              </form>
            </Box>
          </VStack>
        </Container>

        {/* Right Profile Image - Now Layman */}
        <Box 
          w="250px" 
          display={{ base: "none", md: "block" }}
          p={4}
          borderLeft="1px"
          borderColor={isDark ? 'gray.700' : 'gray.200'}
        >
          <VStack spacing={4} align="center" justify="center" h="full">
            <Image 
              src={laymanProfile} 
              alt="Layman Profile" 
              borderRadius="full" 
              boxSize="200px"
              objectFit="cover"
              transform="scaleX(-1)"
            />
            <Text fontWeight="bold" textAlign="center">Layman</Text>
          </VStack>
        </Box>
      </HStack>
    </Box>
  )
}

export default App

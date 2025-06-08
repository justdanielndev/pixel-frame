"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AssistantResponse {
  response: string;
  timestamp: string;
  error?: string;
}

interface AssistantPage {
  text: string;
  icon?: string;
}

export default function AssistantPage() {
  const router = useRouter();
  const [conversation, setConversation] = useState<Array<{role: 'user' | 'assistant', content: string | AssistantPage[], timestamp: string}>>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        router.push('/dashboard');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentMessage = conversation[currentMessageIndex];
        if (currentMessage && Array.isArray(currentMessage.content) && currentPageIndex > 0) {
          setCurrentPageIndex(prev => prev - 1);
        } else if (currentMessageIndex > 0) {
          setCurrentMessageIndex(prev => prev - 1);
          const prevMessage = conversation[currentMessageIndex - 1];
          setCurrentPageIndex(Array.isArray(prevMessage.content) ? prevMessage.content.length - 1 : 0);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const currentMessage = conversation[currentMessageIndex];
        if (currentMessage && Array.isArray(currentMessage.content) && currentPageIndex < currentMessage.content.length - 1) {
          setCurrentPageIndex(prev => prev + 1);
        } else if (currentMessageIndex < conversation.length - 1) {
          setCurrentMessageIndex(prev => prev + 1);
          setCurrentPageIndex(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [conversation, currentMessageIndex, currentPageIndex, router]);

  useEffect(() => {
    const voiceTranscript = localStorage.getItem('voice_transcript')
    if (voiceTranscript) {
      localStorage.removeItem('voice_transcript')
      
      setTimeout(() => {
        if (voiceTranscript.trim()) {
          const userMessage = voiceTranscript.trim()
          
          const newUserMessage = {
            role: 'user' as const,
            content: userMessage,
            timestamp: new Date().toISOString()
          }
          setConversation([newUserMessage])
          setCurrentMessageIndex(0)
          setCurrentPageIndex(0)
          setLoading(true)

          fetch('/api/ai/assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
          })
          .then(response => response.json())
          .then((data: AssistantResponse) => {
            let content: string | AssistantPage[];
            
            if (data.error) {
              content = `Error: ${data.error}`;
            } else {
              try {
                const responseText = data.response;
                const jsonMatch = responseText.match(/\{[^}]*text[^}]*\}/g);
                
                if (jsonMatch && jsonMatch.length > 0) {
                  const pages: AssistantPage[] = [];
                  jsonMatch.forEach(match => {
                    try {
                      const cleanMatch = match.replace(/,\s*$/, '');
                      const page = eval(`(${cleanMatch})`);
                      if (page.text) {
                        pages.push({
                          text: page.text,
                          icon: page.icon || null
                        });
                      }
                    } catch (e) {
                      console.warn('Failed to parse page:', match);
                    }
                  });
                  
                  if (pages.length > 0) {
                    content = pages;
                  } else {
                    content = responseText;
                  }
                } else {
                  content = responseText;
                }
              } catch (e) {
                console.error('Error parsing response:', e);
                content = data.response;
              }
            }
            
            const assistantMessage = {
              role: 'assistant' as const,
              content,
              timestamp: data.timestamp
            }
            setConversation(prev => [...prev, assistantMessage])
            setCurrentMessageIndex(1)
            setCurrentPageIndex(0)
          })
          .catch(error => {
            console.error('Error sending message:', error)
            const errorMessage = {
              role: 'assistant' as const,
              content: "I'm having trouble connecting right now. Please try again in a moment.",
              timestamp: new Date().toISOString()
            }
            setConversation(prev => [...prev, errorMessage])
            setCurrentMessageIndex(1)
            setCurrentPageIndex(0)
          })
          .finally(() => {
            setLoading(false)
          })
        }
      }, 100)
    } else {
      if (conversation.length === 0) {
        setConversation([{
          role: 'assistant',
          content: "Hi Dan! I'm your AI companion. I'm here to help with studying, projects, or just chat about whatever's on your mind. How are you doing today?",
          timestamp: new Date().toISOString()
        }])
        setCurrentMessageIndex(0)
        setCurrentPageIndex(0)
      }
    }
  }, []);

  const currentMessage = conversation[currentMessageIndex];
  const currentContent = currentMessage ? (
    Array.isArray(currentMessage.content) 
      ? currentMessage.content[currentPageIndex] 
      : currentMessage.content
  ) : null;

  if (!currentMessage) {
    return (
      <div className="w-screen h-screen bg-white text-black font-mono flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">No messages yet</p>
          <p className="text-sm text-gray-600">Press SPACE to go back to dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-white text-black font-mono flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {currentMessage.role === 'user' ? (
            <div className="border-2 border-gray-300 p-8 bg-gray-50">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-4 font-medium">YOU</div>
                <p className="text-2xl leading-relaxed whitespace-pre-wrap">{currentMessage.content}</p>
              </div>
            </div>
          ) : loading ? (
            <div className="border-2 border-gray-300 p-8 bg-white">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-4 font-medium">PIXEL</div>
                <div className="flex items-center justify-center gap-3">
                  <span className="animate-pulse text-2xl">●</span>
                  <span className="text-2xl">Processing...</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-gray-300 p-8 bg-white">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-4 font-medium">PIXEL</div>
                {typeof currentContent === 'string' ? (
                  <p className="text-2xl leading-relaxed whitespace-pre-wrap">{currentContent}</p>
                ) : currentContent ? (
                  <div className="space-y-4">
                    {currentContent.icon && (
                      <div className="text-4xl mb-4">{currentContent.icon}</div>
                    )}
                    <p className="text-2xl leading-relaxed whitespace-pre-wrap">{currentContent.text}</p>
                  </div>
                ) : (
                  <p className="text-2xl leading-relaxed whitespace-pre-wrap">{Array.isArray(currentMessage.content) ? currentMessage.content[0]?.text || '' : currentMessage.content}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t-2 border-gray-300 p-6 bg-gray-50">
        <div className="flex items-center justify-center max-w-4xl mx-auto">
          <div className="text-sm text-gray-600">
            {Array.isArray(currentMessage.content) 
              ? `Page ${currentPageIndex + 1}/${currentMessage.content.length} • Message ${currentMessageIndex + 1}/${conversation.length}`
              : `${currentMessageIndex + 1} / ${conversation.length}`
            }
          </div>
        </div>
      </div>
    </div>
  );
}
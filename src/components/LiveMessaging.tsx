import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { useLiveMessaging } from '../hooks/useRealTime';
import { LiveMessage } from '../services/realTimeService';
import {
  Send,
  MessageSquare,
  Users,
  Clock,
  AlertTriangle,
  Camera,
  Mic,
  Paperclip,
  Phone,
  Video,
  Settings,
  Hash
} from 'lucide-react';

interface LiveMessagingProps {
  channelId?: string;
  className?: string;
}

export function LiveMessaging({ channelId = 'general', className }: LiveMessagingProps) {
  const { messages, unreadCount, sendMessage, markAsRead, markAllAsRead } = useLiveMessaging(channelId);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when component is visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        markAllAsRead();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [markAllAsRead]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    sendMessage(newMessage, 'text');
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    
    return date.toLocaleDateString();
  };

  const getMessageTypeIcon = (type: LiveMessage['type']) => {
    switch (type) {
      case 'image': return <Camera className="h-3 w-3" />;
      case 'voice': return <Mic className="h-3 w-3" />;
      case 'alert': return <AlertTriangle className="h-3 w-3" />;
      case 'system': return <Settings className="h-3 w-3" />;
      default: return null;
    }
  };

  const getChannelName = (channelId: string) => {
    switch (channelId) {
      case 'general': return 'General';
      case 'inspections': return 'Inspections';
      case 'maintenance': return 'Maintenance';
      case 'alerts': return 'Alerts';
      default: return channelId;
    }
  };

  const mockUsers = [
    { id: 'user-1', name: 'You', status: 'online' },
    { id: 'user-2', name: 'Sarah Johnson', status: 'online' },
    { id: 'user-3', name: 'Mike Chen', status: 'busy' },
    { id: 'user-4', name: 'Amanda Rodriguez', status: 'away' },
    { id: 'user-5', name: 'Property Manager', status: 'online' }
  ];

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">{getChannelName(channelId)}</CardTitle>
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {mockUsers.filter(u => u.status === 'online').length} members online
        </CardDescription>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0">
        <div className="flex h-full">
          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex gap-3 ${message.senderId === 'user-1' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.senderId !== 'user-1' && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback style={{ backgroundColor: '#4698cb', color: 'white' }}>
                            {message.senderName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[70%] ${message.senderId === 'user-1' ? 'order-first' : ''}`}>
                        <div className={`p-3 rounded-lg ${
                          message.senderId === 'user-1' 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : message.type === 'system'
                            ? 'bg-muted text-muted-foreground'
                            : message.urgent
                            ? 'bg-red-50 border border-red-200 text-red-800'
                            : 'bg-muted'
                        }`}>
                          {message.senderId !== 'user-1' && message.type !== 'system' && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">{message.senderName}</span>
                              {getMessageTypeIcon(message.type)}
                            </div>
                          )}
                          
                          <p className="text-sm">{message.message}</p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              {message.urgent && (
                                <Badge variant="destructive" className="text-xs">
                                  Urgent
                                </Badge>
                              )}
                              {message.type !== 'text' && (
                                <Badge variant="secondary" className="text-xs">
                                  {message.type}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs opacity-70 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatMessageTime(message.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        {!message.read && message.senderId !== 'user-1' && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-auto" />
                        )}
                      </div>
                      
                      {message.senderId === 'user-1' && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback style={{ backgroundColor: '#1b365d', color: 'white' }}>
                            You
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Paperclip className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Camera className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Mic className="h-3 w-3" />
                    </Button>
                  </div>
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="resize-none"
                  />
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  style={{ backgroundColor: '#1b365d' }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {isTyping && (
                <p className="text-xs text-muted-foreground mt-2">
                  Someone is typing...
                </p>
              )}
            </div>
          </div>

          {/* Online Users Sidebar */}
          <div className="w-64 border-l bg-muted/30">
            <div className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Online ({mockUsers.filter(u => u.status === 'online').length})
              </h4>
              <div className="space-y-2">
                {mockUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback style={{ 
                          backgroundColor: user.id === 'user-1' ? '#1b365d' : '#4698cb', 
                          color: 'white' 
                        }}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        user.status === 'online' ? 'bg-green-500' :
                        user.status === 'busy' ? 'bg-red-500' :
                        user.status === 'away' ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
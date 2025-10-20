import { useState, useEffect, useRef } from 'react';
import { useClientPortal } from '../../contexts/ClientPortalContext';
import { useContacts } from '../../contexts/ContactsContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Send,
  Paperclip,
  MessageSquare,
  User,
  Calendar,
  FileText,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CommunicationHubProps {
  projectId: string;
}

export function CommunicationHub({ projectId }: CommunicationHubProps) {
  const { messages, fetchMessagesByProject, sendMessage, markMessageAsRead } = useClientPortal();
  const { contacts } = useContacts();

  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'Message' | 'System Update' | 'Milestone' | 'Approval Request'>('Message');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessagesByProject(projectId);
  }, [projectId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const projectMessages = messages.filter((m) => m.project_id === projectId);
  const teamMembers = contacts.filter((c) => c.role !== 'Client');

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = await sendMessage({
      project_id: projectId,
      sender_id: undefined,
      recipient_id: selectedRecipient || undefined,
      message_text: newMessage,
      attachments: [],
      is_read: false,
      message_type: messageType,
    });

    if (message) {
      setNewMessage('');
      toast.success('Message sent successfully');
    } else {
      toast.error('Failed to send message');
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    await markMessageAsRead(messageId);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'System Update':
        return <FileText className="h-4 w-4" />;
      case 'Milestone':
        return <Calendar className="h-4 w-4" />;
      case 'Approval Request':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const unreadCount = projectMessages.filter((m) => !m.is_read && m.recipient_id).length;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Messages</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px] px-6" ref={scrollRef}>
            <div className="space-y-4 py-4">
              {projectMessages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start a conversation with your team</p>
                </div>
              ) : (
                projectMessages.map((message) => {
                  const sender = message.sender_id ? contacts.find((c) => c.id === message.sender_id) : null;
                  const isFromClient = !message.sender_id || sender?.role === 'Client';

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isFromClient ? 'flex-row-reverse' : 'flex-row'}`}
                      onClick={() => !message.is_read && handleMarkAsRead(message.id)}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFromClient ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <User className={`h-5 w-5 ${isFromClient ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                      </div>
                      <div className={`flex-1 ${isFromClient ? 'items-end' : 'items-start'} flex flex-col max-w-[70%]`}>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {sender?.name || 'You'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(message.created_at), 'MMM d, h:mm a')}
                          </p>
                          {!message.is_read && message.recipient_id && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <div
                          className={`rounded-lg p-3 ${
                            isFromClient
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.message_type !== 'Message' && (
                            <div className="flex items-center gap-2 mb-2 opacity-80">
                              {getMessageIcon(message.message_type)}
                              <span className="text-xs font-medium">{message.message_type}</span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, idx) => (
                                <a
                                  key={idx}
                                  href={attachment.url}
                                  download={attachment.name}
                                  className={`flex items-center gap-2 text-xs ${isFromClient ? 'text-blue-100 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                  <Paperclip className="h-3 w-3" />
                                  <span>{attachment.name}</span>
                                  <Download className="h-3 w-3" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <Separator />

          <div className="p-6 space-y-3">
            <div className="flex gap-2">
              <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Message">Message</SelectItem>
                  <SelectItem value="System Update">Update</SelectItem>
                  <SelectItem value="Milestone">Milestone</SelectItem>
                  <SelectItem value="Approval Request">Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Attach File
              </Button>
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.slice(0, 5).map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedRecipient(contact.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.role}</p>
                  </div>
                  {selectedRecipient === contact.id && (
                    <Badge variant="secondary">Selected</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Request Update
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All Files
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-gray-600">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Use message types to organize conversations</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Press Shift+Enter for new line</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Attach files to share documents</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Messages are saved automatically</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

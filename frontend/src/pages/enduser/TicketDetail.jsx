import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeft, 
  Paperclip, 
  Send, 
  ThumbsUp, 
  ThumbsDown,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import api from '../../services/api';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tickets/${id}`);
      if (response.data.success) {
        setTicket(response.data.ticket);
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      toast.error('Failed to load ticket');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmittingComment(true);
      const response = await api.post(`/tickets/${id}/comments`, {
        text: comment.trim()
      });

      if (response.data.success) {
        setComment('');
        fetchTicket(); // Refresh ticket to show new comment
        toast.success('Comment added successfully');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleVote = async (type) => {
    try {
      const response = await api.post(`/tickets/${id}/vote`, { type });
      if (response.data.success) {
        fetchTicket(); // Refresh to show updated votes
        toast.success('Vote recorded');
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      toast.error('Failed to record vote');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Ticket not found</h3>
        <p className="mt-2 text-gray-600">The ticket you're looking for doesn't exist.</p>
      </div>
    );
  }

  const userHasUpvoted = ticket.votes?.upvotes?.some(vote => vote._id === user._id);
  const userHasDownvoted = ticket.votes?.downvotes?.some(vote => vote._id === user._id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Ticket #{ticket._id.slice(-6)}
          </h1>
          <p className="text-sm text-gray-600">
            Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Ticket Details */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="p-6">
          {/* Status and Meta Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <StatusBadge status={ticket.status} />
              {ticket.category && (
                <span 
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: `${ticket.category.color}20`,
                    color: ticket.category.color 
                  }}
                >
                                    <Tag className="h-3 w-3 mr-1" />
                  {ticket.category.name}
                </span>
              )}
              <span className="text-sm text-gray-500">
                Priority: <span className="font-medium">{ticket.priority}</span>
              </span>
            </div>

            {/* Voting */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote('up')}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
                  userHasUpvoted 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{ticket.votes?.upvotes?.length || 0}</span>
              </button>
              
              <button
                onClick={() => handleVote('down')}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
                  userHasDownvoted 
                    ? 'bg-red-100 text-red-700' 
                    : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>{ticket.votes?.downvotes?.length || 0}</span>
              </button>
            </div>
          </div>

          {/* Subject */}
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            {ticket.subject}
          </h2>

          {/* Description */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Attachments */}
          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Attachments</h3>
              <div className="space-y-2">
                {ticket.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${attachment.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{attachment.originalName}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Ticket Meta */}
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <div>
                <span className="font-medium">Created by:</span>
                <div className="text-gray-900">{ticket.createdBy.name}</div>
              </div>
            </div>

            {ticket.assignedTo && (
              <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <div>
                  <span className="font-medium">Assigned to:</span>
                  <div className="text-gray-900">{ticket.assignedTo.name}</div>
                </div>
              </div>
            )}

            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <div>
                <span className="font-medium">Last updated:</span>
                <div className="text-gray-900">
                  {format(new Date(ticket.lastActivityAt), 'MMM d, yyyy h:mm a')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Comments ({ticket.comments.length})
          </h3>

          {/* Comments List */}
          <div className="space-y-6 mb-6">
            {ticket.comments.map((comment, index) => (
              <div key={index} className="flex space-x-3">
                <img
                  className="h-8 w-8 rounded-full"
                  src={comment.author.photoURL || `https://ui-avatars.com/api/?name=${comment.author.name}&background=3b82f6&color=fff`}
                  alt={comment.author.name}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {comment.author.name}
                    </h4>
                    {comment.isInternal && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Internal
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.text}
                  </div>
                </div>
              </div>
            ))}

            {ticket.comments.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No comments yet. Be the first to add a comment!
              </p>
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="border-t pt-6">
            <div className="flex space-x-3">
              <img
                className="h-8 w-8 rounded-full"
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
                alt={user?.name}
              />
              <div className="flex-1">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingComment || !comment.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submittingComment ? 'Adding...' : 'Add Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

const CommentForm = ({ onSubmit, loading = false, allowInternal = false }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    onSubmit({
      text: comment.trim(),
      isInternal: allowInternal ? isInternal : false
    });

    setComment('');
    setIsInternal(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={loading}
          />
          
          {allowInternal && (
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id="internal-comment"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="internal-comment" className="ml-2 text-sm text-gray-600">
                Internal comment (only visible to agents and admins)
              </label>
            </div>
          )}
          
          <div className="mt-2 flex justify-end">
            <Button
              type="submit"
              loading={loading}
              disabled={!comment.trim()}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Adding...' : 'Add Comment'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
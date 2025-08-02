import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Paperclip, X, Upload } from 'lucide-react';
import Button from '../ui/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TicketForm = ({ onSubmit, initialData = null, loading = false }) => {
  const [categories, setCategories] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      subject: initialData?.subject || '',
      description: initialData?.description || '',
      category: initialData?.category?._id || '',
      priority: initialData?.priority || 'Medium'
    }
  });

  useEffect(() => {
    fetchCategories();
    if (initialData) {
      reset({
        subject: initialData.subject,
        description: initialData.description,
        category: initialData.category?._id,
        priority: initialData.priority
      });
    }
  }, [initialData, reset]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip'
      ];

      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type.`);
        return false;
      }

      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    formData.append('subject', data.subject);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('priority', data.priority);

    attachments.forEach(file => {
      formData.append('attachments', file);
    });

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('subject', {
            required: 'Subject is required',
            minLength: { value: 5, message: 'Subject must be at least 5 characters' },
            maxLength: { value: 200, message: 'Subject must be less than 200 characters' }
          })}
          className="mt-1 input-field"
          placeholder="Brief description of your issue"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          {...register('category', { required: 'Category is required' })}
          className="mt-1 input-field"
          disabled={categoriesLoading}
        >
          <option value="">
            {categoriesLoading ? 'Loading categories...' : 'Select a category'}
          </option>
          {categories.map(category => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          {...register('priority')}
          className="mt-1 input-field"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('description', {
            required: 'Description is required',
            minLength: { value: 10, message: 'Description must be at least 10 characters' }
          })}
          rows={6}
          className="mt-1 input-field"
          placeholder="Please provide detailed information about your issue..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* File Attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Attachments
        </label>
        <div className="mt-1">
          <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                  <span>Upload files</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="sr-only"
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.xlsx,.zip"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF, DOC up to 10MB each
              </p>
            </div>
          </div>
        </div>

        {/* Attachment List */}
        {attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center">
                  <Paperclip className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
          className="w-full sm:w-auto"
        >
          {initialData ? 'Update Ticket' : 'Create Ticket'}
        </Button>
      </div>
    </form>
  );
};

export default TicketForm;
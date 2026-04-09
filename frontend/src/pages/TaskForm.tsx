import React, { useState } from 'react';
import { apiService } from '@services/api.service';
import { API } from '@config/api';
import { ToastService } from '@services/toast.service';
import { Card } from '@common/Card';
import { Input } from '@common/Input';
import { Textarea } from '@common/Textarea';
import { Select } from '@common/Select';
import { Button } from '@common/Button';

interface User {
  id: string;
  name: string;
  email: string;
}

interface TaskFormProps {
  users: User[];
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: {
    id: string;
    title: string;
    description: string;
    assignedTo?: string;
  };
}

interface FormErrors {
  title?: string;
  description?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ 
  users, 
  onSuccess, 
  onCancel, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    assignedTo: initialData?.assignedTo || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSubmitting(true);
    
    const request = initialData
      ? apiService.put(API.tasks.update(initialData.id), formData)
      : apiService.post(API.tasks.create, formData);

    request
      .then(() => {
        ToastService.success(initialData ? 'Task updated successfully' : 'Task created successfully');
        onSuccess();
      })
      .catch(() => {
        ToastService.error(initialData ? 'Failed to update task' : 'Failed to create task');
        setSubmitting(false);
      });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

const userOptions = [
  { value: '', label: 'Unassigned' },
  ...(Array.isArray(users) ? users.map(user => ({
    value: user.id,
    label: `${user.name} (${user.email})`,
  })) : []),
];

  return (
    <Card padding="lg" className="shadow-xl">
      <div className="mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900">
          {initialData ? 'Edit Task' : 'Create New Task'}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {initialData ? 'Update the task details below' : 'Fill in the details to create a new task'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Task Title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter task title"
          error={errors.title|| ''}
          
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter task description"
          error={errors.description|| ''}
          rows={4}
        />

        <Select
          label="Assign To"
          value={formData.assignedTo}
          onChange={(e) => handleChange('assignedTo', e.target.value)}
          options={userOptions}
        />

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            fullWidth={true}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={submitting}
            fullWidth
          >
            {initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
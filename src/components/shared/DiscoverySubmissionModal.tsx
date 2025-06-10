'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, Calendar, FileText, User, Mail, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Question {
  id: string;
  name: string;
  type: string;
  value: any;
}

interface Calculation {
  id: string;
  name: string;
  type: string;
  value: string;
}

interface UrlParameter {
  id: string;
  name: string;
  value: string;
}

interface SchedulingEvent {
  id: string;
  name: string;
  value: {
    fullName: string;
    email: string;
    phone: string;
    timezone: string;
    eventStartTime: string;
    eventEndTime: string;
    eventId: string;
    eventUrl: string;
    rescheduleOrCancelUrl: string;
    scheduledUserEmail: string;
    scheduledUserName: string;
  };
}

interface FilloutSubmission {
  submissionId: string;
  submissionTime: string;
  lastUpdatedAt: string;
  startedAt: string;
  questions: Question[];
  calculations: Calculation[];
  urlParameters: UrlParameter[];
  quiz: any;
  documents: any[];
  scheduling: SchedulingEvent[];
  payments: any[];
  editLink: string;
}

interface DiscoverySubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: FilloutSubmission | null;
  memberNumber?: number;
  loading?: boolean;
  error?: string;
}

export default function DiscoverySubmissionModal({ 
  isOpen, 
  onClose, 
  submission, 
  memberNumber,
  loading = false,
  error 
}: DiscoverySubmissionModalProps) {
  if (!isOpen) return null;

  // Use a portal to render the modal at the document root level
  if (typeof document === 'undefined') return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatValue = (question: Question) => {
    if (question.value === null || question.value === undefined || question.value === '') {
      return <span className="text-gray-400 italic">No response</span>;
    }

    switch (question.type) {
      case 'FileUpload':
        if (Array.isArray(question.value)) {
          return (
            <div className="space-y-2">
              {question.value.map((file: any, index: number) => (
                <a
                  key={index}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {file.filename}
                </a>
              ))}
            </div>
          );
        }
        break;
      
      case 'URLInput':
        if (question.value) {
          return (
            <a
              href={question.value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {question.value}
            </a>
          );
        }
        break;
      
      case 'EmailInput':
        return (
          <a
            href={`mailto:${question.value}`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {question.value}
          </a>
        );
      
      case 'PhoneNumber':
        return (
          <a
            href={`tel:${question.value}`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {question.value}
          </a>
        );
      
      case 'Checkboxes':
      case 'MultiSelect':
        if (Array.isArray(question.value)) {
          return (
            <ul className="list-disc list-inside space-y-1">
              {question.value.map((item: string, index: number) => (
                <li key={index} className="text-gray-900">{item}</li>
              ))}
            </ul>
          );
        }
        break;
      
      case 'RecordPicker':
        if (Array.isArray(question.value)) {
          return (
            <div className="space-y-2">
              {question.value.map((record: any, index: number) => (
                <div key={index} className="bg-gray-50 p-2 rounded border">
                  <div className="font-medium">{record.Bible || 'Unknown'}</div>
                  {record.Abbreviation && (
                    <div className="text-sm text-gray-600">({record.Abbreviation})</div>
                  )}
                </div>
              ))}
            </div>
          );
        }
        break;
      
      case 'OpinionScale':
        return (
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              {question.value}
            </div>
            <span className="text-gray-600 text-sm">/ 5</span>
          </div>
        );
      
      case 'LongAnswer':
        return (
          <div className="bg-gray-50 p-3 rounded border whitespace-pre-wrap">
            {question.value}
          </div>
        );
      
      case 'Table':
        if (Array.isArray(question.value) && question.value.length === 0) {
          return <span className="text-gray-400 italic">No entries</span>;
        }
        break;
      
      default:
        return <span className="text-gray-900">{String(question.value)}</span>;
    }

    return <span className="text-gray-900">{String(question.value)}</span>;
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Discovery Questionnaire Submission
              </h2>
              {submission?.questions?.find(q => q.name === "Church Name")?.value && (
                <p className="text-sm text-gray-600">{submission.questions.find(q => q.name === "Church Name")?.value}</p>
              )}
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading submission...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-800">
                <X className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {submission && !loading && (
            <div className="space-y-6">
              {/* Submission Metadata */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Submission Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Submitted:</span>
                    <div className="text-blue-900">{formatDate(submission.submissionTime)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Started:</span>
                    <div className="text-blue-900">{formatDate(submission.startedAt)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Last Updated:</span>
                    <div className="text-blue-900">{formatDate(submission.lastUpdatedAt)}</div>
                  </div>
                </div>
              </div>

              {/* Scheduling Information */}
              {submission.scheduling && submission.scheduling.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 relative">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-green-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Discovery Call
                    </h3>
                    {submission.scheduling[0]?.value.eventUrl && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <a
                          href={submission.scheduling[0].value.eventUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Event
                        </a>
                      </Button>
                    )}
                  </div>
                  {submission.scheduling.map((event, index) => (
                    <div key={index} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-green-800">Attendee:</span>
                          <div className="text-green-900">{event.value.fullName}</div>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Email:</span>
                          <div className="text-green-900">{event.value.email}</div>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Event Time:</span>
                          <div className="text-green-900">
                            {formatDate(event.value.eventStartTime)} - {formatDate(event.value.eventEndTime)}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Timezone:</span>
                          <div className="text-green-900">{event.value.timezone}</div>
                        </div>
                        <div>
                          <span className="font-medium text-green-800">Scheduled with:</span>
                          <div className="text-green-900">{event.value.scheduledUserName}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Questions and Answers */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Questionnaire Responses
                </h3>
                {submission.questions
                  .filter(question => {
                    // Hide questions that meet the criteria
                    if (question.value === null || question.value === undefined) return false;
                    if (Array.isArray(question.value) && question.value.length === 0) return false;
                    if (question.type === "Table") return false;
                    if (question.name === "Church Name") return false; // Hide since it's now in header
                    return true;
                  })
                  .map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900">
                        {question.name}
                      </h4>
                    </div>
                    <div className="text-gray-800">
                      {formatValue(question)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
          {submission?.editLink && (
            <Button asChild>
              <a
                href={submission.editLink + '&editing=true'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Edit Submission
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // Render the modal using a portal to escape stacking context issues
  return createPortal(modalContent, document.body);
} 
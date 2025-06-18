import React from 'react';
import './Faq.scss';

const faqs = [
  {
    question: 'How do I submit a leave request?',
    answer: 'Go to the My Leaves page, find the apply for leave button, fill in the required details, and click Submit. You will receive a confirmation once your request is sent.'
  },
  {
    question: 'How can I track the status of my leave application?',
    answer: 'Navigate to the My Leaves section to view the status and history of your leave requests, or you may also find it in the dashboard page'
  },
  {
    question: 'Who approves my leave requests?',
    answer: 'Your manager will review and approve your leave requests based on company policy.'
  },
  {
    question: 'Can I upload documents with my leave request?',
    answer: 'Yes, you can attach supporting documents such as medical certificates or travel tickets when submitting your leave request.'
  },
  {
    question: 'What types of leave are available?',
    answer: 'The system supports various leave types such as Annual Leave, Sick Leave, Emergency Leave, Marriage Leave, and Others, but it all depends on the company policy.'
  },
  {
    question: 'How do I reset my password?',
    answer: 'Click on Forgot Password on the login page and follow the instructions to reset your password.'
  },
  {
    question: 'Can I cancel or edit a submitted leave request?',
    answer: 'You can edit or cancel a leave request before it is approved by visiting the My Leaves section.'
  },
  {
    question: 'How do I view company holidays?',
    answer: 'Check the Calendar section in the dashboard page to see all upcoming company holidays and events.'
  },
  {
    question: 'What should I do if my leave request is rejected?',
    answer: 'If your request is rejected, you will receive a notification with the reason. You may contact your manager for further clarification.'
  },
];

const Faq = () => {
  return (
    <div className="faq-page">
      <h1>Frequently Asked Questions</h1>
      <div className="faq-list">
        {faqs.map((faq, idx) => (
          <div className="faq-box" key={idx}>
            <div className="faq-question">{faq.question}</div>
            <div className="faq-answer">{faq.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;

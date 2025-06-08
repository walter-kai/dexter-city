import React, { useState } from 'react';
import { FaEnvelope, FaRobot, FaUser, FaBriefcase, FaComment } from 'react-icons/fa';
import LoadingScreenDots from '../components/LoadingScreenDots';
import StatusFooter from '../components/StatusFooter';

interface FormData {
  name: string;
  email: string;
  business: string;
  message: string;
}

const ContactUs: React.FC = () => {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStatusFooter, setShowStatusFooter] = useState(false);
  const [statusType, setStatusType] = useState<'loading' | 'success' | 'error'>('loading');
  const [statusMessage, setStatusMessage] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    business: '',
    message: ''
  });

  // Simple math captcha
  const [num1] = useState(Math.floor(Math.random() * 10) + 1);
  const [num2] = useState(Math.floor(Math.random() * 10) + 1);
  const correctAnswer = num1 + num2;

  const handleContactClick = () => {
    setShowCaptcha(true);
  };

  const handleCaptchaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (parseInt(captchaAnswer) === correctAnswer) {
        setCaptchaVerified(true);
      } else {
        alert('Incorrect answer. Please try again.');
        setCaptchaAnswer('');
      }
      setLoading(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show loading status
    setStatusType('loading');
    setStatusMessage('Sending your message...');
    setShowStatusFooter(true);

    try {
      const response = await fetch('/api/telegram/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          business: formData.business,
          message: formData.message
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatusType('success');
        setStatusMessage('Message sent successfully! We\'ll get back to you soon.');
        // Reset form
        setFormData({ name: '', email: '', business: '', message: '' });
      } else {
        setStatusType('error');
        setStatusMessage('Failed to send message. Please try again.');
      }
    } catch (error) {
      setStatusType('error');
      setStatusMessage('Network error. Please check your connection and try again.');
    }

    // Auto-hide status after 5 seconds
    setTimeout(() => {
      setShowStatusFooter(false);
    }, 5000);
  };

  if (captchaVerified) {
    return (
      <div className="min-h-screen py-10 text-neon-light">
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="bg-[#23263a] border border-[#00ffe7]/30 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-[#00ffe7] mb-6 text-center">
              <FaEnvelope className="inline mr-2" />
              Contact Us
            </h1>
            
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#e0e7ef] mb-2 font-semibold">
                    <FaUser className="inline mr-2" />
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#181a23] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7]"
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[#e0e7ef] mb-2 font-semibold">
                    <FaEnvelope className="inline mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#181a23] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7]"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#e0e7ef] mb-2 font-semibold">
                  <FaBriefcase className="inline mr-2" />
                  Business/Organization
                </label>
                <input
                  type="text"
                  name="business"
                  value={formData.business}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#181a23] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7]"
                  placeholder="Your company or organization (optional)"
                />
              </div>

              <div>
                <label className="block text-[#e0e7ef] mb-2 font-semibold">
                  <FaComment className="inline mr-2" />
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-[#181a23] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7] resize-vertical"
                  placeholder="Tell us about your project, questions, or how we can help you..."
                  required
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className="btn-green px-8 py-4 text-lg font-semibold flex items-center justify-center gap-2 mx-auto"
                >
                  <FaEnvelope />
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {showStatusFooter && (
          <StatusFooter
            type={statusType}
            message={statusMessage}
            onClose={() => setShowStatusFooter(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-neon-light">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="bg-[#23263a] border border-[#00ffe7]/30 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-[#00ffe7] mb-8 text-center">
            <FaEnvelope className="inline mr-2" />
            Contact Us
          </h1>
          
          {!showCaptcha ? (
            <div className="text-center">
              <p className="text-[#e0e7ef] mb-6 text-lg">
                We'd love to hear from you! Click the button below to get in touch with our team.
              </p>
              
              <button
                onClick={handleContactClick}
                className="btn-green flex items-center justify-center gap-2 mx-auto px-8 py-4 text-lg font-semibold"
              >
                <FaEnvelope />
                Contact Us
              </button>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="bg-[#181a23] border border-[#00ffe7]/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-[#00ffe7] mb-4 text-center">
                  <FaRobot className="inline mr-2" />
                  Security Verification
                </h3>
                
                <p className="text-[#e0e7ef] mb-4 text-center">
                  Please solve this simple math problem to continue:
                </p>
                
                <form onSubmit={handleCaptchaSubmit} className="space-y-4">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-[#00ffe7]">
                      {num1} + {num2} = ?
                    </span>
                  </div>
                  
                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="Enter your answer"
                    className="w-full px-4 py-2 bg-[#23263a] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] text-center"
                    required
                  />
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-green w-full flex items-center justify-center gap-2"
                  >
                    {loading ? <LoadingScreenDots /> : 'Verify'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

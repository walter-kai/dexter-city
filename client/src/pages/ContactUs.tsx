import React, { useState } from 'react';
import { FaEnvelope, FaRobot, FaUser, FaBriefcase, FaComment, FaCheckCircle } from 'react-icons/fa';
import LoadingScreenDots from '../components/LoadingScreenDots';
import StatusFooter from '../components/StatusFooter';
import SliderCaptcha from '../components/SliderCaptcha';

interface FormData {
  name: string;
  email: string;
  business: string;
  message: string;
}

const ContactUs: React.FC = () => {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showStatusFooter, setShowStatusFooter] = useState(false);
  const [statusType, setStatusType] = useState<'loading' | 'success' | 'error'>('loading');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    business: '',
    message: ''
  });

  const handleContactClick = () => {
    setShowCaptcha(true);
  };

  const handleCaptchaSuccess = () => {
    setCaptchaVerified(true);
    setShowSuccess(true);
    
    // Start loading the form 1.5 seconds into the success display
    // This ensures the form is ready before success disappears
    setTimeout(() => {
      setShowForm(true);
    }, 1500);
    
    // Hide success message after 2 seconds (500ms after form appears)
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleCaptchaFail = () => {
    console.log('Captcha failed');
  };

  const handleCaptchaRefresh = () => {
    console.log('Captcha refreshed');
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
    
    // Immediately disable form
    setIsSubmitting(true);
    
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
        
        // After 3 seconds, reset everything back to initial state
        setTimeout(() => {
          setShowStatusFooter(false);
          // Reset all states to initial
          setTimeout(() => {
            setShowForm(false);
            setShowSuccess(false);
            setCaptchaVerified(false);
            setShowCaptcha(false);
            setIsSubmitting(false);
          }, 500);
        }, 3000);
      } else {
        setStatusType('error');
        setStatusMessage('Failed to send message. Please try again.');
        setIsSubmitting(false);
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
          setShowStatusFooter(false);
        }, 5000);
      }
    } catch (error) {
      setStatusType('error');
      setStatusMessage('Network error. Please check your connection and try again.');
      setIsSubmitting(false);
      
      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setShowStatusFooter(false);
      }, 5000);
    }
  };

  // Render the form when everything is complete
  if (showForm) {
    return (
      <div className="min-h-screen py-10 text-neon-light">
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div 
            className="bg-[#23263a] border border-[#00ffe7]/30 rounded-lg p-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
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
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 bg-[#181a23] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7] ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
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
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 bg-[#181a23] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7] ${
                      isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
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
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3 bg-[#181a23] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7] ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
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
                  disabled={isSubmitting}
                  rows={6}
                  className={`w-full px-4 py-3 bg-[#181a23] border border-[#00ffe7]/30 rounded-lg text-[#e0e7ef] focus:outline-none focus:border-[#00ffe7] focus:ring-1 focus:ring-[#00ffe7] resize-vertical ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Tell us about your project, questions, or how we can help you..."
                  required
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn-green px-8 py-4 text-lg font-semibold flex items-center justify-center gap-2 mx-auto ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FaEnvelope />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
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
        <div 
          className={`bg-[#23263a] border border-[#00ffe7]/30 rounded-lg p-8 transition-all duration-700 ease-in-out ${
            showCaptcha ? 'max-w-2xl mx-auto' : 'max-w-4xl mx-auto'
          }`}
        >
          <h1 className="text-2xl font-bold text-[#00ffe7] mb-8 text-center">
            <FaEnvelope className="inline mr-2" />
            Contact Us
          </h1>
          
          {!showCaptcha ? (
            <div 
              className={`text-center transition-all duration-500 ${
                showCaptcha ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              <p className="text-[#e0e7ef] mb-6 text-lg">
                We'd love to hear from you! Click the button below to get in touch with our team.
              </p>
              
              <button
                onClick={handleContactClick}
                className="btn-green flex items-center justify-center gap-2 mx-auto px-8 py-4 text-lg font-semibold transform transition-all duration-300 hover:scale-105"
              >
                <FaEnvelope />
                Contact Us
              </button>
            </div>
          ) : showSuccess ? (
            // Success indicator
            <div 
              className={`text-center transition-all duration-500 ${
                showSuccess ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <div className="bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/50 rounded-lg p-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                    <FaCheckCircle className="text-white text-2xl" />
                  </div>
                  <h3 className="text-green-400 font-bold text-xl">Verification Complete!</h3>
                  <p className="text-[#e0e7ef]">Loading contact form...</p>
                </div>
              </div>
            </div>
          ) : (
            // Captcha container
            <div 
              className={`transition-all duration-700 ease-in-out ${
                showCaptcha && !captchaVerified ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <div className="bg-[#181a23] border border-[#00ffe7]/20 rounded-lg p-6">
                <h3 className="text-lg font-bold text-[#00ffe7] mb-4 text-center">
                  <FaRobot className="inline mr-2" />
                  Security Verification
                </h3>
                
                <p className="text-[#e0e7ef] mb-4 text-center">
                  Complete the puzzle below to continue:
                </p>
                
                <div 
                  className={`transition-all duration-500 ${
                    showCaptcha ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ 
                    transitionDelay: showCaptcha ? '0.3s' : '0s',
                  }}
                >
                  <SliderCaptcha
                    width={320}
                    height={180}
                    loadingText="Loading puzzle..."
                    failedText="Try again"
                    barText="Slide to complete puzzle"
                    onSuccess={handleCaptchaSuccess}
                    onFail={handleCaptchaFail}
                    onRefresh={handleCaptchaRefresh}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

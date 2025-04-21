import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactInfo = ({ icon: Icon, title, content }) => (
  <div className="flex items-start space-x-4">
    <div className="bg-red-500 p-3 rounded-lg">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-gray-400">{content}</p>
    </div>
  </div>
);

const Contact = () => {
  return (
    <div className="min-h-screen bg-[#111827] py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-4xl font-bold text-white mb-4">Get in touch</h2>
            <p className="text-gray-400 text-lg mb-8">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
            <div className="space-y-8">
              <ContactInfo 
                icon={Mail} 
                title="Email" 
                content="support@secureflow.com" 
              />
              <ContactInfo 
                icon={Phone} 
                title="Phone" 
                content="+1 (555) 123-4567" 
              />
              <ContactInfo 
                icon={MapPin} 
                title="Office" 
                content="123 Blockchain Street, Crypto Valley, CV 94103" 
              />
            </div>
          </div>
          <div className="bg-[#1a2332] p-8 rounded-2xl">
            <form className="space-y-6">
              <div>
                <label className="block text-white mb-2">Name</label>
                <input 
                  type="text"
                  className="w-full bg-[#2a3444] text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Email</label>
                <input 
                  type="email"
                  className="w-full bg-[#2a3444] text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Message</label>
                <textarea 
                  className="w-full bg-[#2a3444] text-white rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 h-32"
                  placeholder="Your message..."
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-red-500 text-white py-3 rounded-md font-semibold hover:bg-red-600 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
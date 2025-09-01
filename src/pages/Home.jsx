import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Upload, Brain, MessageSquare, Play, Download, Volume2, Sparkles, CheckCircle, Star } from 'lucide-react'
import { motion } from 'framer-motion'

const Home = () => {
  const features = [
    {
      icon: Upload,
      title: 'Smart Image Analysis',
      description: 'Upload handwritten notes, textbook pages, or diagrams for AI-powered content extraction'
    },
    {
      icon: Brain,
      title: 'Intelligent Summaries',
      description: 'Get concise summaries and detailed explanations of your study materials'
    },
    {
      icon: MessageSquare,
      title: 'Interactive Chat',
      description: 'Ask questions and get instant answers about your uploaded content'
    },
    {
      icon: Play,
      title: 'Educational Videos',
      description: 'Discover relevant YouTube videos based on your study topics'
    },
    {
      icon: Download,
      title: 'PDF Export',
      description: 'Export summaries, quiz questions, and flashcards as PDF files'
    },
    {
      icon: Volume2,
      title: 'Audio Accessibility',
      description: 'Text-to-speech functionality for visually impaired learners'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Upload Your Material',
      description: 'Take a photo or upload an image of your handwritten notes, textbook pages, or diagrams'
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'Our AI extracts text, analyzes content, and generates summaries, explanations, and study materials'
    },
    {
      number: '03',
      title: 'Interactive Learning',
      description: 'Chat with AI, watch related videos, take quizzes, and review flashcards to master the content'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Medical Student',
      content: 'This tool transformed how I study. Converting my handwritten notes into interactive flashcards saves me hours!',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Engineering Student',
      content: 'The AI explanations help me understand complex diagrams and formulas. The voice feature is perfect for reviewing while commuting.',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'High School Student',
      content: 'I love how it suggests YouTube videos related to my study topics. Makes learning so much more engaging!',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-lg">Study Helper</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn btn-primary"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Study Assistant</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
              Transform Your Study Materials with AI
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Upload photos of your notes, textbooks, or diagrams and let AI create summaries,
              explanations, quiz questions, and interactive study tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="btn btn-primary btn-lg flex items-center gap-2"
              >
                Start Learning for Free
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/login"
                className="btn btn-secondary btn-lg"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
              No credit card required • Free to get started • Powered by Google AI
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Study Smarter</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From handwritten notes to complex diagrams, our AI understands your study materials
              and creates personalized learning experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6 hover-lift"
              >
                <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white dark:text-black" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Three simple steps to transform your study experience
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-white dark:text-black">
                      {step.number}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-300 dark:bg-gray-700 transform -translate-y-1/2" />
                  )}
                </div>

                <h3 className="font-semibold text-xl mb-3">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What Students Say</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Join thousands of students who are already studying smarter with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                  "{testimonial.content}"
                </p>

                <div>
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black dark:bg-white text-white dark:text-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Study Smarter?</h2>
            <p className="text-xl text-gray-300 dark:text-gray-700 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already using AI to enhance their learning experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn bg-white text-black hover:bg-gray-100 dark:bg-black dark:text-white dark:hover:bg-gray-900 btn-lg flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/login"
                className="btn border-white text-white hover:bg-white hover:text-black dark:border-black dark:text-black dark:hover:bg-black dark:hover:text-white btn-lg"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400 dark:text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Free to start
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Privacy focused
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-950 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                  <span className="text-white dark:text-black font-bold text-sm">AI</span>
                </div>
                <span className="font-bold text-lg">Study Helper</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Empowering students with AI-driven study tools for better learning outcomes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <Link to="/register" className="block text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  Get Started
                </Link>
                <a href="#features" className="block text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  Features
                </a>
                <a href="#pricing" className="block text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  Pricing
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="#help" className="block text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  Help Center
                </a>
                <a href="#contact" className="block text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  Contact Us
                </a>
                <a href="#privacy" className="block text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="space-y-2 text-sm">
                <a href="#twitter" className="block text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="#discord" className="block text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  Discord
                </a>
                <a href="#github" className="block text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  GitHub
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; 2025 AI Study Helper. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
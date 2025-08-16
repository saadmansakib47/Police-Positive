"use client"

import SEO from "@/components/SEO"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const Contact = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const contactInfo = [
    {
      title: "General Inquiries",
      details: "info@policepositive.com",
      description: "Questions about our platform and services",
      icon: "✉",
    },
    // {
    //   title: "Technical Support",
    //   details: "support@policepositive.com",
    //   description: "Help with implementation and troubleshooting",
    //   icon: "🛠️",
    // },
    {
      title: "Partnership Opportunities",
      details: "partnerships@policepositive.com",
      description: "Collaboration and integration inquiries",
      icon: "🤝",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-slate-50/50">
      <SEO title="Contact — Police Positive" description="Get in touch with Police Positive." canonical="/contact" />

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <motion.h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-900 via-red-700 to-indigo-800 bg-clip-text text-transparent leading-tight">
              Get in Touch
            </motion.h1>
            <motion.p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ready to transform your department's communication? We're here to help you build stronger community
              connections through innovative technology.
            </motion.p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                24/7 Support
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                Quick Response
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                Expert Guidance
              </Badge>
            </div>
          </motion.div>

          {/* Contact Form and Info Grid */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl font-semibold text-slate-800">Send us a Message</h2>
                      <p className="text-muted-foreground">
                        Fill out the form below and we'll get back to you within 24 hours.
                      </p>
                    </div>

                    <form className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">First Name</label>
                          <Input
                            placeholder="John"
                            className="bg-white/70 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Last Name</label>
                          <Input
                            placeholder="Doe"
                            className="bg-white/70 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                        <Input
                          placeholder="john.doe@department.gov"
                          type="email"
                          className="bg-white/70 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                        />
                      </div>

                      {/* <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Subject</label>
                        <Input
                          placeholder="Subject"
                          className="bg-white/70 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                        />
                      </div> */}

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Message</label>
                        <Textarea
                          placeholder="Tell us about your department's communication needs and how we can help..."
                          rows={5}
                          className="bg-white/70 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 resize-none"
                        />
                      </div>

                      <Button
                        type="button"
                        className="w-full bg-gradient-to-r from-red-500 via-red-700 to-red-500 hover:from-blue-700 hover:to-slate-800 text-white font-medium py-3 transition-all duration-300 shadow-md hover:shadow-lg"
                      >
                        Send Message
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-800">Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Choose the best way to reach us based on your specific needs. Our team is dedicated to providing
                  prompt, professional support.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={info.title}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    className="group"
                  >
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                            {info.icon}
                          </div>
                          <div className="flex-1 space-y-1">
                            <h3 className="font-semibold text-slate-800">{info.title}</h3>
                            <p className="text-blue-600 font-medium">{info.details}</p>
                            <p className="text-sm text-muted-foreground">{info.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Response Time Card */}
              <motion.div variants={itemVariants}>
                <Card className="border-0 shadow-lg bg-gradient-to-r from-red-500 via-red-700 to-red-500 text-white">
                  <CardContent className="p-6">
                    <div className="text-center space-y-3">
                      <div className="text-3xl"></div>
                      <h3 className="text-lg font-semibold">Quick Response Guarantee</h3>
                      <p className="text-sm opacity-90">
                        We understand the urgency of law enforcement communication needs. Expect a response within 24
                        hours, with priority support for active deployments.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Contact

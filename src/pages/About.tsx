import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Shield, Users, Eye, Heart } from "lucide-react";

const About = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "Secure, encrypted communication channels ensuring data privacy and protection."
    },
    {
      icon: Users,
      title: "Community Connection",
      description: "Bridging the gap between civilians and law enforcement for better collaboration."
    },
    {
      icon: Eye,
      title: "Full Transparency",
      description: "Real-time tracking and updates keeping everyone informed throughout the process."
    },
    {
      icon: Heart,
      title: "Building Trust",
      description: "Fostering positive relationships and accountability in law enforcement."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <SEO 
        title="About — Police Positive" 
        description="Learn about the mission of Police Positive." 
        canonical="/about" 
      />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-indigo-600/10" />
        <div className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-6"
            >
              <Shield className="w-4 h-4 mr-2" />
              Bridging Communities & Law Enforcement
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-900 via-red-700 to-indigo-800 bg-clip-text text-transparent leading-tight mb-6"
            >
              About Police Positive
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto"
            >
              Police Positive enhances responsiveness, transparency, and public trust by streamlining communication between
              civilians, on-duty police operators, and supervisors through innovative technology solutions.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Mission Statement */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="container mx-auto px-6 py-16"
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-white/50">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              To create a digital ecosystem that transforms how communities interact with law enforcement, 
              fostering transparency, accountability, and mutual trust through cutting-edge technology 
              and user-centered design.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-red-500 rounded-full mx-auto" />
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        variants={staggerChildren}
        initial="initial"
        animate="animate"
        className="container mx-auto px-6 py-16"
      >
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            What We Stand For
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our platform is built on four core principles that guide every feature and interaction.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group"
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 h-full">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-800 to-red-500 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="container mx-auto px-6 py-16"
      >
        <div className="bg-gradient-to-r from-red-400 via-red-600 to-red-400 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join Us in Building Safer Communities
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Together, we can create a more transparent, responsive, and trustworthy law enforcement system.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-red-800 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Today
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;